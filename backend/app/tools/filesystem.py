from typing import Any

from .base import BaseTool, ToolResult


class FilesystemTool(BaseTool):
    name = "filesystem"
    description = "Interact with the local filesystem"
    input_schema = {}
    output_schema = {}
    
    async def execute(self, action: str, inputs: dict[str, Any]) -> ToolResult:
        if action == "move_file":
            if inputs.get("fail_on_purpose") == True:
                return ToolResult(
                    success=False, 
                    error="Destination directory does not exist", 
                    recoverable=True
                )
            return ToolResult(success=True, data={"path": "/new/path/file.pdf", "status": "moved"})
        elif action == "create_folder":
            return ToolResult(success=True, data={"status": "folder_created"})
        
        return ToolResult(success=True, data={"status": f"Executed {action} successfully", "details": "demo mode"})
