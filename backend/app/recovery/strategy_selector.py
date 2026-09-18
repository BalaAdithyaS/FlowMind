from typing import Any


class StrategySelector:
    def select_strategy(self, failure_type: str) -> dict[str, Any]:
        if failure_type == "FILE_NOT_FOUND":
            return {
                "strategy": "CREATE_DEPENDENCY",
                "tool": "filesystem",
                "action": "create_folder"
            }
        elif failure_type == "TIMEOUT":
            return {
                "strategy": "RETRY_WITH_BACKOFF",
                "tool": None,
                "action": None
            }
        elif failure_type == "REQUIRES_APPROVAL":
            return {
                "strategy": "MANUAL_APPROVAL",
                "tool": None,
                "action": None
            }
        return {
            "strategy": "ABORT",
            "tool": None,
            "action": None
        }
