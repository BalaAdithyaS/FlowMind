from ..core.config import settings
from .mock_provider import MockProvider
from .ollama_provider import OllamaProvider
from .provider import AIProvider


def get_ai_provider() -> AIProvider:
    if settings.AI_PROVIDER == "ollama":
        return OllamaProvider()
    return MockProvider()
