import os
import shutil
from pathlib import Path
from typing import Any, Dict
from .base import BaseTool, ToolResult

class FilesystemTool(BaseTool):
    name = "filesystem"
    description = "Interact with the local filesystem sandbox. Actions: list_files, read_file, write_file."
    input_schema = {
        "path": "string (relative to workspace)",
        "content": "string (for write_file)"
    }
    output_schema = {}
    
    def _get_workspace_dir(self) -> Path:
        workspace_path = os.getenv("FLOWMIND_WORKSPACE", "./workspace")
        workspace = Path(workspace_path).resolve()
        workspace.mkdir(parents=True, exist_ok=True)
        return workspace

    def _resolve_safe_path(self, target_path: str) -> Path:
        workspace = self._get_workspace_dir()
        
        # Resolve target path relative to workspace
        # If target_path is absolute, Path strips the workspace if it's not careful, 
        # so we strip leading slashes.
        clean_path = target_path.lstrip("/").lstrip("\\")
        target = (workspace / clean_path).resolve()
        
        # Verify that the target is still inside the workspace
        if workspace not in target.parents and target != workspace:
            raise ValueError(f"Security Error: Path traversal attempt blocked for {target_path}")
            
        return target
        
    async def execute(self, action: str, inputs: Dict[str, Any]) -> ToolResult:
        try:
            target_path = inputs.get("path", ".")
            safe_path = self._resolve_safe_path(target_path)
            
            if action == "list_files":
                if not safe_path.exists():
                    return ToolResult(success=False, error=f"Path not found: {target_path}", recoverable=True)
                if not safe_path.is_dir():
                    return ToolResult(success=False, error=f"Not a directory: {target_path}", recoverable=False)
                    
                files = [f.name for f in safe_path.iterdir()]
                return ToolResult(success=True, data={"files": files, "path": str(target_path)})
                
            elif action == "read_file":
                if not safe_path.exists() or not safe_path.is_file():
                    return ToolResult(success=False, error=f"File not found: {target_path}", recoverable=True)
                
                content = safe_path.read_text(encoding="utf-8")
                return ToolResult(success=True, data={"content": content, "path": str(target_path)})
                
            elif action == "write_file":
                if "content" not in inputs:
                    return ToolResult(success=False, error="Missing required input: content", recoverable=False)
                    
                safe_path.parent.mkdir(parents=True, exist_ok=True)
                safe_path.write_text(inputs["content"], encoding="utf-8")
                return ToolResult(success=True, data={"status": "written", "path": str(target_path)})
                
            else:
                return ToolResult(success=False, error=f"Unsupported action: {action}", recoverable=False)
                
        except ValueError as e:
            # Traversal attempts
            return ToolResult(success=False, error=str(e), recoverable=False)
        except Exception as e:
            return ToolResult(success=False, error=str(e), recoverable=True)
