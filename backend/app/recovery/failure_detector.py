from typing import Any


class FailureDetector:
    def detect(self, result: dict[str, Any]) -> bool:
        return not result.get("success", True)
