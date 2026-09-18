import asyncio
import uuid
import traceback
from typing import Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..schemas.workflow import WorkflowSchema
from .graph import WorkflowGraph
from ..tools.registry import registry
from ..recovery.failure_detector import FailureDetector
from ..recovery.diagnoser import FailureDiagnoser
from ..recovery.strategy_selector import StrategySelector
from ..recovery.recovery_executor import RecoveryExecutor
from ..models.workflow import WorkflowExecution, StepExecution, ExecutionEvent
from ..core.database import SessionLocal
from ..api.ws import manager

class WorkflowEngine:
    def __init__(self):
        self.detector = FailureDetector()
        self.diagnoser = FailureDiagnoser()
        self.selector = StrategySelector()
        self.recovery_executor = RecoveryExecutor()

    def log_event(self, db: Session, execution_id: str, event_type: str, step_id: str = None, details: dict = None):
        event = ExecutionEvent(
            execution_id=execution_id,
            step_id=step_id,
            event_type=event_type,
            details=details
        )
        db.add(event)
        db.commit()
        
        # Broadcast real-time event to WebSocket clients safely via asyncio background task
        ws_message = {
            "event": event_type,
            "execution_id": execution_id,
            "step_id": step_id,
            "timestamp": event.timestamp.isoformat(),
            "data": details or {}
        }
        
        # Fire and forget the broadcast so it doesn't block the sync execution loop
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(manager.broadcast_to_execution(execution_id, ws_message))
        except RuntimeError:
            pass # No running loop (e.g. during some sync test)

    async def execute(self, workflow: WorkflowSchema, db_session: Session = None, trigger_data: Dict[str, Any] = None) -> str:
        db = db_session if db_session else SessionLocal()
        execution_id = str(uuid.uuid4())
        
        exec_record = WorkflowExecution(
            id=execution_id,
            workflow_id=workflow.id if hasattr(workflow, "id") else None,
            status="RUNNING",
            trigger_data=trigger_data or {}
        )
        db.add(exec_record)
        
        # Create all steps
        for step in workflow.steps:
            step_record = StepExecution(
                execution_id=execution_id,
                step_id=step.id,
                tool=step.tool,
                action=step.action,
                status="PENDING"
            )
            db.add(step_record)
            
        db.commit()
        self.log_event(db, execution_id, "WORKFLOW_STARTED", details={"workflow_name": workflow.name})
        
        if not db_session:
            db.close()
            
        asyncio.create_task(self._run_loop(execution_id, workflow))
        return execution_id

    async def _run_loop(self, execution_id: str, workflow: WorkflowSchema):
        db = SessionLocal()
        try:
            exec_record = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
            if not exec_record or exec_record.status != "RUNNING":
                return
                
            graph = WorkflowGraph(workflow)
            
            while True:
                db.refresh(exec_record)
                if exec_record.status != "RUNNING":
                    break
                    
                steps = db.query(StepExecution).filter(StepExecution.execution_id == execution_id).all()
                completed_step_ids = {s.step_id for s in steps if s.status == "SUCCESS"}
                failed_steps = [s for s in steps if s.status == "FAILED"]
                
                if failed_steps:
                    exec_record.status = "FAILED"
                    exec_record.end_time = datetime.now(timezone.utc)
                    db.commit()
                    self.log_event(db, execution_id, "WORKFLOW_FAILED")
                    break
                    
                executable_steps = graph.get_executable_steps(completed_step_ids)
                
                if not executable_steps:
                    if len(completed_step_ids) == len(workflow.steps):
                        exec_record.status = "COMPLETED"
                        exec_record.end_time = datetime.now(timezone.utc)
                        db.commit()
                        self.log_event(db, execution_id, "WORKFLOW_COMPLETED")
                    else:
                        exec_record.status = "FAILED"
                        exec_record.end_time = datetime.now(timezone.utc)
                        db.commit()
                        self.log_event(db, execution_id, "WORKFLOW_FAILED", details={"reason": "Deadlock or missing dependencies"})
                    break
                
                # Execute steps concurrently
                tasks = []
                for step in executable_steps:
                    step_record = next(s for s in steps if s.step_id == step.id)
                    if step_record.status == "PENDING":
                        step_record.status = "RUNNING"
                        step_record.start_time = datetime.now(timezone.utc)
                        db.commit()
                        self.log_event(db, execution_id, "STEP_STARTED", step.id)
                        tasks.append(self._execute_step(db, execution_id, step, step_record))
                
                if tasks:
                    await asyncio.gather(*tasks)
                else:
                    await asyncio.sleep(0.5)
                    
        except Exception as e:
            traceback.print_exc()
            exec_record = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
            if exec_record:
                exec_record.status = "FAILED"
                exec_record.end_time = datetime.now(timezone.utc)
                db.commit()
                self.log_event(db, execution_id, "WORKFLOW_FAILED", details={"error": str(e)})
        finally:
            db.close()

    async def _execute_step(self, db: Session, execution_id: str, step, step_record):
        tool = registry.get_tool(step.tool)
        inputs = step.inputs or {}
        
        try:
            result = await tool.execute(step.action, inputs)
            
            if self.detector.detect(result.model_dump()):
                if result.recoverable:
                    step_record.status = "RECOVERING"
                    db.commit()
                    self.log_event(db, execution_id, "RECOVERY_STARTED", step.id, details={"error": result.error})
                    
                    failure_type = self.diagnoser.diagnose(result.model_dump())
                    strategy = self.selector.select_strategy(failure_type)
                    
                    if strategy.get("strategy") == "MANUAL_APPROVAL":
                        exec_record = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
                        exec_record.status = "WAITING_APPROVAL"
                        step_record.status = "WAITING_APPROVAL"
                        step_record.error = result.error or "Action requires manual approval."
                        db.commit()
                        self.log_event(db, execution_id, "APPROVAL_REQUIRED", step.id, details={"error": step_record.error})
                        return
                    
                    recovered = await self.recovery_executor.execute_recovery(strategy, inputs)
                    if recovered:
                        self.log_event(db, execution_id, "RECOVERY_COMPLETED", step.id, details={"strategy": strategy})
                        result = await tool.execute(step.action, {})
                        if result.success:
                            step_record.status = "SUCCESS"
                            step_record.outputs = result.data
                            step_record.end_time = datetime.now(timezone.utc)
                            db.commit()
                            self.log_event(db, execution_id, "STEP_COMPLETED", step.id)
                        else:
                            step_record.status = "FAILED"
                            step_record.error = f"Recovery failed: {result.error}"
                            step_record.end_time = datetime.now(timezone.utc)
                            db.commit()
                            self.log_event(db, execution_id, "STEP_FAILED", step.id, details={"error": step_record.error})
                    else:
                        step_record.status = "FAILED"
                        step_record.error = f"Recovery failed for {step.name}"
                        step_record.end_time = datetime.now(timezone.utc)
                        db.commit()
                        self.log_event(db, execution_id, "STEP_FAILED", step.id, details={"error": step_record.error})
                else:
                    step_record.status = "FAILED"
                    step_record.error = result.error or f"{step.name} failed unrecoverably"
                    step_record.end_time = datetime.now(timezone.utc)
                    db.commit()
                    self.log_event(db, execution_id, "STEP_FAILED", step.id, details={"error": step_record.error})
            else:
                step_record.status = "SUCCESS"
                step_record.outputs = result.data
                step_record.end_time = datetime.now(timezone.utc)
                db.commit()
                self.log_event(db, execution_id, "STEP_COMPLETED", step.id)
                
        except Exception as e:
            traceback.print_exc()
            step_record.status = "FAILED"
            step_record.error = str(e)
            step_record.end_time = datetime.now(timezone.utc)
            db.commit()
            self.log_event(db, execution_id, "STEP_FAILED", step.id, details={"error": str(e)})

    async def resume_execution(self, execution_id: str, approved: bool, db_session: Session = None):
        db = db_session if db_session else SessionLocal()
        exec_record = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
        if not exec_record or exec_record.status != "WAITING_APPROVAL":
            if not db_session:
                db.close()
            return
            
        pending_step = db.query(StepExecution).filter(
            StepExecution.execution_id == execution_id, 
            StepExecution.status == "WAITING_APPROVAL"
        ).first()
        
        if not approved:
            exec_record.status = "FAILED"
            if pending_step:
                pending_step.status = "FAILED"
                pending_step.error = "Explicitly rejected by user"
                self.log_event(db, execution_id, "APPROVAL_REJECTED", pending_step.step_id)
            db.commit()
        else:
            if pending_step:
                pending_step.status = "SUCCESS"
                pending_step.outputs = {"status": "manually approved"}
                pending_step.error = None
                self.log_event(db, execution_id, "APPROVAL_GRANTED", pending_step.step_id)
            exec_record.status = "RUNNING"
            db.commit()
            
            # Since we resumed the DB state, launch a run loop
            workflow_record = exec_record.workflow
            workflow_schema = WorkflowSchema(**workflow_record.definition)
            asyncio.create_task(self._run_loop(execution_id, workflow_schema))
            
        if not db_session:
            db.close()
