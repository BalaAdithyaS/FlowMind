import json
from typing import Any

import httpx

from ..core.config import settings
from .provider import AIProvider


class OllamaProvider(AIProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL

    async def generate_workflow(self, prompt: str, tools: list[dict[str, Any]]) -> dict[str, Any]:
        system_prompt = (
            "You are an AI workflow orchestrator. Convert the user's natural language request into a strict JSON workflow DAG (Directed Acyclic Graph).\n"
            "You MUST return ONLY valid JSON inside a ```json ... ``` codeblock. No conversational text.\n\n"
            "The JSON must strictly follow this Pydantic schema structure:\n"
            "{\n"
            '  "name": "string",\n'
            '  "description": "string",\n'
            '  "trigger": { "type": "manual|email_received|scheduled|webhook", "config": {} },\n'
            '  "steps": [\n'
            "    {\n"
            '      "id": "step_1",\n'
            '      "name": "Descriptive Name",\n'
            '      "action": "action_name_from_tools",\n'
            '      "tool": "tool_name_from_tools",\n'
            '      "depends_on": [],\n'
            '      "inputs": {}\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            "CRITICAL RULES:\n"
            "1. ONLY use tools and actions provided in the available tools list.\n"
            "2. Map dependencies correctly using step IDs in the `depends_on` list.\n"
            "3. Output MUST be valid JSON."
        )
        
        user_message = f"Available Tools: {json.dumps(tools, indent=2)}\n\nUser Request: {prompt}"
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "stream": False,
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.base_url}/api/chat", json=payload, timeout=300.0)
                response.raise_for_status()
                data = response.json()
                content = data.get("message", {}).get("content", "{}")
                
                # Robustly extract JSON block
                start_idx = content.find('{')
                end_idx = content.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    content = content[start_idx:end_idx+1]
                else:
                    content = content.strip()
                
                return json.loads(content)
            except json.JSONDecodeError as e:
                raise RuntimeError(f"Ollama returned invalid JSON: {content}\nError: {e!s}")
            except Exception as e:
                raise RuntimeError(f"Failed to communicate with Ollama: {type(e).__name__} - {e!s}")

    async def get_status(self) -> dict[str, Any]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/api/tags", timeout=5.0)
                if response.status_code == 200:
                    return {"status": "connected", "provider": "ollama", "model": self.model}
                return {"status": "error", "provider": "ollama", "details": "Invalid response"}
            except Exception as e:
                return {"status": "offline", "provider": "ollama", "details": str(e)}
