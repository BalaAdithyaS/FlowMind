from typing import Any, Dict
from .base import BaseTool, ToolResult
from ..core.database import SessionLocal
from ..models.workflow import Task

class TasksTool(BaseTool):
    name = "tasks"
    description = "Create and manage persistent tasks. Actions: create_task, list_tasks, complete_task."
    input_schema = {
        "title": "string",
        "description": "string",
        "task_id": "string (for complete_task)"
    }
    output_schema = {}
    
    async def execute(self, action: str, inputs: Dict[str, Any]) -> ToolResult:
        db = SessionLocal()
        try:
            if action == "create_task":
                if "title" not in inputs:
                    return ToolResult(success=False, error="Missing title for task", recoverable=True)
                task = Task(title=inputs["title"], description=inputs.get("description", ""))
                db.add(task)
                db.commit()
                return ToolResult(success=True, data={"task_id": task.id, "title": task.title})
                
            elif action == "list_tasks":
                tasks = db.query(Task).filter(Task.status == "Open").all()
                data = [{"id": t.id, "title": t.title} for t in tasks]
                return ToolResult(success=True, data={"tasks": data})
                
            elif action == "complete_task":
                if "task_id" not in inputs:
                    return ToolResult(success=False, error="Missing task_id", recoverable=True)
                task = db.query(Task).filter(Task.id == inputs["task_id"]).first()
                if not task:
                    return ToolResult(success=False, error="Task not found", recoverable=True)
                task.status = "Completed"
                db.commit()
                return ToolResult(success=True, data={"status": "completed"})
                
            else:
                return ToolResult(success=False, error=f"Unsupported action: {action}", recoverable=False)
        except Exception as e:
            return ToolResult(success=False, error=str(e), recoverable=True)
        finally:
            db.close()
