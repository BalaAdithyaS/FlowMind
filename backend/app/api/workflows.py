from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..schemas.workflow import WorkflowSchema
from ..workflow.engine import WorkflowEngine
from ..core.database import get_db
from ..models.workflow import Workflow, WorkflowExecution, ExecutionEvent
import uuid

router = APIRouter(prefix="/workflows", tags=["Workflows"])
engine = WorkflowEngine()

@router.post("/", response_model=Dict[str, str])
async def create_workflow(workflow: WorkflowSchema, db: Session = Depends(get_db)):
    workflow_id = str(uuid.uuid4())
    db_workflow = Workflow(
        id=workflow_id,
        name=workflow.name,
        description=workflow.description,
        definition=workflow.model_dump()
    )
    db.add(db_workflow)
    db.commit()
    return {"id": workflow_id, "message": "Workflow created successfully"}

@router.post("/{workflow_id}/run")
async def run_workflow(workflow_id: str, db: Session = Depends(get_db)):
    workflow_record = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow_record:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    workflow_schema = WorkflowSchema(**workflow_record.definition)
    execution_id = await engine.execute(workflow_schema, db_session=db)
    return {"message": "Workflow execution started", "execution_id": execution_id}

@router.post("/{workflow_id}/webhook")
async def trigger_webhook(workflow_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    workflow_record = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow_record:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    workflow_schema = WorkflowSchema(**workflow_record.definition)
    execution_id = await engine.execute(workflow_schema, trigger_data=payload, db_session=db)
    return {"message": "Webhook received and execution started", "execution_id": execution_id}

@router.get("/")
async def list_workflows(db: Session = Depends(get_db)):
    workflows = db.query(Workflow).all()
    return [{"id": w.id, "name": w.name, "description": w.description} for w in workflows]

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    active_workflows = db.query(Workflow).count()
    
    total_executions = db.query(WorkflowExecution).count()
    completed_executions = db.query(WorkflowExecution).filter(WorkflowExecution.status == "COMPLETED").count()
    
    success_rate = (completed_executions / total_executions * 100) if total_executions > 0 else 0.0
    
    recovery_events = db.query(ExecutionEvent).filter(ExecutionEvent.event_type == "RECOVERY_STARTED").count()
    recovery_rate = (recovery_events / total_executions * 100) if total_executions > 0 else 0.0
    
    # Calculate intent distribution
    tool_counts = {}
    workflows = db.query(Workflow).all()
    for w in workflows:
        if "steps" in w.definition:
            for step in w.definition["steps"]:
                tool = step.get("tool")
                if tool:
                    tool_counts[tool] = tool_counts.get(tool, 0) + 1
            
    intent_distribution = [{"name": tool, "count": count} for tool, count in tool_counts.items()]
    
    return {
        "active_workflows": active_workflows,
        "success_rate": round(success_rate, 1),
        "recovery_rate": round(recovery_rate, 1),
        "intent_distribution": intent_distribution
    }
