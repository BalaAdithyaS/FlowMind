from typing import Any

from .base import BaseTool, ToolResult


class TasksTool(BaseTool):
    name = "tasks"
    description = "Create and manage tasks"
    input_schema = {}
    output_schema = {}
    
    async def execute(self, action: str, inputs: dict[str, Any]) -> ToolResult:
        if action == "create_task":
            return ToolResult(success=True, data={"task_id": "task_123", "status": "created"})
        # Accept any hallucinated action for demo purposes
        return ToolResult(success=True, data={"status": f"Executed {action} successfully", "task_id": "demo_task_999"})
