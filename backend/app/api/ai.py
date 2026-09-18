from typing import Any

from fastapi import APIRouter, HTTPException

from ..ai import get_ai_provider
from ..schemas.workflow import WorkflowSchema
from ..tools.registry import registry

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/plan", response_model=WorkflowSchema)
async def generate_workflow_plan(request: dict[str, Any]):
    prompt = request.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
        
    ai_provider = get_ai_provider()
    tools = registry.list_tools()
    
    try:
        workflow_json = await ai_provider.generate_workflow(prompt, tools)
        workflow = WorkflowSchema(**workflow_json)
        return workflow
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_ai_status():
    ai_provider = get_ai_provider()
    return await ai_provider.get_status()
