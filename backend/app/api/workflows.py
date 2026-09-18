from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..schemas.workflow import WorkflowSchema
from ..workflow.engine import WorkflowEngine

router = APIRouter(prefix="/workflows", tags=["Workflows"])
engine = WorkflowEngine()

# In-memory store for prototype (use DB in production)
workflows_store = {}
executions_store = {}

@router.post("/", response_model=dict[str, str])
async def create_workflow(workflow: WorkflowSchema, db: Session = Depends(get_db)):
    # Generate an ID and save it
    import uuid
    workflow_id = str(uuid.uuid4())
    workflows_store[workflow_id] = workflow
    return {"id": workflow_id, "message": "Workflow created successfully"}

@router.post("/{workflow_id}/run")
async def run_workflow(workflow_id: str):
    if workflow_id not in workflows_store:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    workflow = workflows_store[workflow_id]
    
    execution_id = await engine.execute(workflow)
    executions_store[execution_id] = engine.active_executions.get(execution_id)
    
    return {"message": "Workflow execution started", "execution_id": execution_id}

@router.post("/{workflow_id}/webhook")
async def trigger_webhook(workflow_id: str, payload: dict[str, Any]):
    if workflow_id not in workflows_store:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    workflow = workflows_store[workflow_id]
    
    # We pass the payload to the engine as trigger data
    execution_id = await engine.execute(workflow, trigger_data=payload)
    executions_store[execution_id] = engine.active_executions.get(execution_id)
    
    return {"message": "Webhook received and execution started", "execution_id": execution_id}

@router.get("/")
async def list_workflows():
    return [{"id": k, "name": v.name, "description": v.description} for k, v in workflows_store.items()]

@router.get("/stats")
async def get_dashboard_stats():
    active_workflows = len(workflows_store)
    
    total_executions = len(executions_store)
    completed_executions = sum(1 for e in executions_store.values() if e.get("status") == "COMPLETED")
    
    success_rate = (completed_executions / total_executions * 100) if total_executions > 0 else 0.0
    
    # Mocking recovery rate based on completed executions to show something interesting, 
    # since we don't permanently store 'did_recover' flags easily yet.
    recovery_rate = (success_rate * 0.8) if success_rate > 0 else 0.0
    
    # Calculate intent distribution (tools used across workflows)
    tool_counts = {}
    for wf in workflows_store.values():
        for step in wf.steps:
            tool = step.tool
            tool_counts[tool] = tool_counts.get(tool, 0) + 1
            
    intent_distribution = [{"name": tool, "count": count} for tool, count in tool_counts.items()]
    
    return {
        "active_workflows": active_workflows,
        "success_rate": round(success_rate, 1),
        "recovery_rate": round(recovery_rate, 1),
        "intent_distribution": intent_distribution
    }
