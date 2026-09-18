from typing import Any

from .base import BaseTool, ToolResult


class EmailTool(BaseTool):
    name = "email"
    description = "Send and receive emails"
    input_schema = {}
    output_schema = {}
    
    async def execute(self, action: str, inputs: dict[str, Any]) -> ToolResult:
        # Require manual approval for any email action in the demo
        if inputs.get("approved") != True:
            return ToolResult(success=False, error="Action requires manual approval before sending email.", recoverable=True)
            
        if action == "send_email":
            return ToolResult(success=True, data={"message_id": "msg_123", "status": "sent"})
        elif action == "read_email":
            return ToolResult(success=True, data={"emails": []})
            
        return ToolResult(success=True, data={"status": f"Executed {action} successfully", "details": "demo mode"})
