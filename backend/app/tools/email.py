from typing import Any
from typing import Any, Dict

from .base import BaseTool, ToolResult


class EmailTool(BaseTool):
    name = "email"
    description = "Send and receive emails. Actions: send_email (Uses LocalMockEmailProvider, requires approval)"
    input_schema = {
        "to": "string",
        "subject": "string",
        "body": "string"
    }
    output_schema = {}
    
    async def execute(self, action: str, inputs: Dict[str, Any]) -> ToolResult:
        if action == "send_email":
            return ToolResult(
                success=False, 
                error="Action requires manual approval before sending email.", 
                recoverable=True
            )
        return ToolResult(success=True, data={"status": f"Executed {action} successfully", "provider": "LocalMockEmailProvider"})
