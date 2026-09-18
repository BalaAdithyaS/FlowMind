from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.workflow import WorkflowExecution, StepExecution, ExecutionEvent
from .workflows import engine

router = APIRouter(prefix="/executions", tags=["Executions"])

@router.get("/{execution_id}")
async def get_execution_status(execution_id: str, db: Session = Depends(get_db)):
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
        
    steps = db.query(StepExecution).filter(StepExecution.execution_id == execution_id).all()
    events = db.query(ExecutionEvent).filter(ExecutionEvent.execution_id == execution_id).order_by(ExecutionEvent.timestamp).all()
    
    return {
        "id": execution.id,
        "workflow_id": execution.workflow_id,
        "status": execution.status,
        "start_time": execution.start_time,
        "end_time": execution.end_time,
        "steps": [{"id": s.step_id, "status": s.status, "tool": s.tool, "error": s.error} for s in steps],
        "events": [{"type": e.event_type, "timestamp": e.timestamp, "details": e.details} for e in events]
    }

@router.get("/")
async def list_executions(db: Session = Depends(get_db)):
    executions = db.query(WorkflowExecution).order_by(WorkflowExecution.start_time.desc()).limit(50).all()
    return [{"id": e.id, "workflow_id": e.workflow_id, "status": e.status, "start_time": e.start_time} for e in executions]

@router.post("/{execution_id}/approve")
async def approve_execution(execution_id: str, db: Session = Depends(get_db)):
    await engine.resume_execution(execution_id, approved=True, db_session=db)
    return {"status": "resumed"}

@router.post("/{execution_id}/reject")
async def reject_execution(execution_id: str, db: Session = Depends(get_db)):
    await engine.resume_execution(execution_id, approved=False, db_session=db)
    return {"status": "rejected"}
