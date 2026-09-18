from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class ToolResult(BaseModel):
    success: bool
    data: dict[str, Any] | None = None
    error: str | None = None
    recoverable: bool = False

class BaseTool(ABC):
    name: str
    description: str
    input_schema: dict[str, Any]
    output_schema: dict[str, Any]
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH
    requires_approval: bool = False

    @abstractmethod
    async def execute(self, action: str, inputs: dict[str, Any]) -> ToolResult:
        """Executes a specific action for this tool."""

    def get_metadata(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema,
            "output_schema": self.output_schema,
            "risk_level": self.risk_level,
            "requires_approval": self.requires_approval
        }
