import asyncio
import uuid
from typing import Any

from ..recovery.diagnoser import FailureDiagnoser
from ..recovery.failure_detector import FailureDetector
from ..recovery.recovery_executor import RecoveryExecutor
from ..recovery.strategy_selector import StrategySelector
from ..schemas.workflow import WorkflowExecutionState, WorkflowSchema
from ..tools.registry import registry
from .graph import WorkflowGraph


class WorkflowEngine:
    def __init__(self):
        self.active_executions = {}
        self.detector = FailureDetector()
        self.diagnoser = FailureDiagnoser()
        self.selector = StrategySelector()
        self.recovery_executor = RecoveryExecutor()

    async def execute(self, workflow: WorkflowSchema, trigger_data: dict[str, Any] = None) -> str:
        execution_id = str(uuid.uuid4())
        self.active_executions[execution_id] = {
            "status": WorkflowExecutionState.RUNNING,
            "completed_steps": set(),
            "results": {},
            "workflow": workflow,
            "graph": WorkflowGraph(workflow),
            "trigger_data": trigger_data or {}
        }
        
        asyncio.create_task(self._run_loop(execution_id))
        return execution_id

    async def _run_loop(self, execution_id: str):
        state = self.active_executions[execution_id]
        workflow = state["workflow"]
        graph = state["graph"]

        while True:
            if state["status"] != WorkflowExecutionState.RUNNING:
                break
                
            executable_steps = graph.get_executable_steps(state["completed_steps"])
            
            if not executable_steps:
                if len(state["completed_steps"]) == len(workflow.steps):
                    state["status"] = WorkflowExecutionState.COMPLETED
                else:
                    state["status"] = WorkflowExecutionState.FAILED
                break
                
            for step in executable_steps:
                tool = registry.get_tool(step.tool)
                try:
                    await asyncio.sleep(1) # simulate tool work
                    
                    inputs = step.inputs or {}
                    result = await tool.execute(step.action, inputs)
                    
                    if self.detector.detect(result.model_dump()):
                        if result.recoverable:
                            print(f"Step {step.name} failed. Initiating recovery...")
                            state["status"] = WorkflowExecutionState.RECOVERING
                            
                            failure_type = self.diagnoser.diagnose(result.model_dump())
                            strategy = self.selector.select_strategy(failure_type)
                            
                            if strategy.get("strategy") == "MANUAL_APPROVAL":
                                state["status"] = WorkflowExecutionState.WAITING_APPROVAL
                                state["error"] = result.error or "Action requires manual approval."
                                state["pending_step"] = step
                                return # Pause loop completely
                            
                            recovered = await self.recovery_executor.execute_recovery(strategy, inputs)
                            
                            if recovered:
                                result = await tool.execute(step.action, {})
                                if result.success:
                                    state["status"] = WorkflowExecutionState.RUNNING
                                    state["completed_steps"].add(step.id)
                                    state["results"][step.id] = result.data
                                else:
                                    state["status"] = WorkflowExecutionState.FAILED
                                    state["error"] = f"Recovery failed for {step.name}"
                                    break
                            else:
                                state["status"] = WorkflowExecutionState.FAILED
                                state["error"] = f"Recovery failed for {step.name}"
                                break
                        else:
                            state["status"] = WorkflowExecutionState.FAILED
                            state["error"] = result.error or f"{step.name} failed and is unrecoverable"
                            break
                    else:
                        state["completed_steps"].add(step.id)
                        state["results"][step.id] = result.data
                        
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    state["status"] = WorkflowExecutionState.FAILED
                    state["error"] = str(e)
                    break

    async def resume_execution(self, execution_id: str, approved: bool):
        if execution_id not in self.active_executions:
            return
            
        state = self.active_executions[execution_id]
        if state["status"] != WorkflowExecutionState.WAITING_APPROVAL:
            return
            
        step = state.pop("pending_step", None)
        
        if not approved:
            state["status"] = WorkflowExecutionState.FAILED
            state["error"] = "Action was explicitly rejected by user."
            return
            
        # If approved, assume the human authorized the step to succeed
        if step:
            state["completed_steps"].add(step.id)
            state["results"][step.id] = {"status": "manually approved"}
            state["error"] = None
            
        state["status"] = WorkflowExecutionState.RUNNING
        asyncio.create_task(self._run_loop(execution_id))
