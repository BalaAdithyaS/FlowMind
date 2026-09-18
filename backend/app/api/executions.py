
from fastapi import APIRouter, HTTPException

from .workflows import engine, executions_store

router = APIRouter(prefix="/executions", tags=["Executions"])

@router.get("/{execution_id}")
async def get_execution_status(execution_id: str):
    if execution_id not in executions_store:
        raise HTTPException(status_code=404, detail="Execution not found")
        
    return executions_store[execution_id]

@router.get("/")
async def list_executions():
    # Return basic stats of all executions
    return [{"id": k, "status": v["status"]} for k, v in executions_store.items()]

@router.post("/{execution_id}/approve")
async def approve_execution(execution_id: str):
    await engine.resume_execution(execution_id, approved=True)
    return {"status": "resumed"}

@router.post("/{execution_id}/reject")
async def reject_execution(execution_id: str):
    await engine.resume_execution(execution_id, approved=False)
    return {"status": "rejected"}
