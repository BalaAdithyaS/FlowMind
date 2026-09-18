import asyncio
from typing import Any

from .provider import AIProvider


class MockProvider(AIProvider):
    async def generate_workflow(self, prompt: str, tools: list[dict[str, Any]]) -> dict[str, Any]:
        """Simulate generating a workflow for demo purposes."""
        await asyncio.sleep(1.5)  # Simulate latency
        
        # We simulate the exact response for the "Project Deadline Automation" demo.
        if "deadline" in prompt.lower():
            return {
                "name": "Project Deadline Automation",
                "description": "Process project deadline emails",
                "trigger": {
                    "type": "email_received"
                },
                "steps": [
                    {
                        "id": "step_1",
                        "name": "Classify Email",
                        "action": "classify_email",
                        "tool": "email",
                        "depends_on": []
                    },
                    {
                        "id": "step_2",
                        "name": "Extract Deadline",
                        "action": "extract_deadline",
                        "tool": "llm",
                        "depends_on": ["step_1"]
                    },
                    {
                        "id": "step_3",
                        "name": "Extract Attachment",
                        "action": "read_file",  # Simulating reading attachment as a file
                        "tool": "filesystem",
                        "depends_on": ["step_2"]
                    },
                    {
                        "id": "step_4",
                        "name": "Move File",
                        "action": "move_file",
                        "tool": "filesystem",
                        "depends_on": ["step_3"]
                    },
                    {
                        "id": "step_5",
                        "name": "Create Task",
                        "action": "create_task",
                        "tool": "tasks",
                        "depends_on": ["step_4"]
                    },
                    {
                        "id": "step_6",
                        "name": "Create Reminder",
                        "action": "create_reminder",
                        "tool": "calendar",
                        "depends_on": ["step_5"]
                    }
                ]
            }
            
        # Default mock response
        return {
            "name": "Generic Workflow",
            "trigger": {"type": "manual"},
            "steps": []
        }

    async def get_status(self) -> dict[str, Any]:
        return {"status": "connected", "provider": "mock"}
