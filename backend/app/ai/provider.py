from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):
    """Abstract base class for AI providers (e.g., Ollama, Mock)."""
    
    @abstractmethod
    async def generate_workflow(self, prompt: str, tools: list[dict[str, Any]]) -> dict[str, Any]:
        """Generate a structured workflow JSON from a natural language prompt."""
    
    @abstractmethod
    async def get_status(self) -> dict[str, Any]:
        """Get the status of the AI provider."""
