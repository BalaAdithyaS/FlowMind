from typing import Any

from ..tools.registry import registry


class RecoveryExecutor:
    async def execute_recovery(self, strategy: dict[str, Any], context: dict[str, Any]) -> bool:
        if strategy["strategy"] == "CREATE_DEPENDENCY":
            tool = registry.get_tool(strategy["tool"])
            result = await tool.execute(strategy["action"], context)
            return result.success
        elif strategy["strategy"] == "RETRY_WITH_BACKOFF":
            import asyncio
            await asyncio.sleep(2)
            return True
        return False
