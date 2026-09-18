from typing import Any

from .base import BaseTool, ToolResult


class CalendarTool(BaseTool):
    name = "calendar"
    description = "Create events and reminders"
    input_schema = {}
    output_schema = {}
    
    async def execute(self, action: str, inputs: dict[str, Any]) -> ToolResult:
        if action == "schedule_event":
            return ToolResult(success=True, data={"event_id": "evt_123", "status": "scheduled"})
        return ToolResult(success=True, data={"status": f"Executed {action} successfully", "details": "demo mode"})
