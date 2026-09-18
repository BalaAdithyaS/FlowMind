from typing import Any

from .base import BaseTool


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool):
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> BaseTool:
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' not found in registry.")
        return self._tools[name]

    def list_tools(self) -> list[dict[str, Any]]:
        return [tool.get_metadata() for tool in self._tools.values()]

registry = ToolRegistry()

# Function to initialize all built-in tools
def init_registry():
    from .ai import AITool
    from .calendar import CalendarTool
    from .email import EmailTool
    from .filesystem import FilesystemTool
    from .github import GithubTool
    from .tasks import TasksTool
    
    registry.register(EmailTool())
    registry.register(FilesystemTool())
    registry.register(TasksTool())
    registry.register(CalendarTool())
    registry.register(GithubTool())
    registry.register(AITool())
