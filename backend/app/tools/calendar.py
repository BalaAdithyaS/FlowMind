from typing import Any, Dict
from .base import BaseTool, ToolResult
from ..core.database import SessionLocal
from ..models.workflow import ExecutionEvent # Using this as a proxy for events/reminders right now

class CalendarTool(BaseTool):
    name = "calendar"
    description = "Create events and reminders. Actions: create_event. (Uses LocalCalendarProvider)"
    input_schema = {
        "title": "string",
        "date": "string (ISO 8601 format)"
    }
    output_schema = {}
    
    async def execute(self, action: str, inputs: Dict[str, Any]) -> ToolResult:
        db = SessionLocal()
        try:
            if action == "create_event":
                if "title" not in inputs:
                    return ToolResult(success=False, error="Missing title", recoverable=True)
                    
                # We simply log it to prove the LocalCalendarProvider abstraction works
                # A full Calendar DB table could be added, but this suffices for the tool abstraction.
                event = ExecutionEvent(
                    execution_id="CALENDAR_SYSTEM", 
                    event_type="CALENDAR_EVENT_CREATED",
                    details={"title": inputs["title"], "date": inputs.get("date", "Unknown")}
                )
                db.add(event)
                db.commit()
                return ToolResult(success=True, data={"status": "Event created locally", "title": inputs["title"]})
            else:
                return ToolResult(success=False, error=f"Unsupported action: {action}", recoverable=False)
        except Exception as e:
            return ToolResult(success=False, error=str(e), recoverable=True)
        finally:
            db.close()
