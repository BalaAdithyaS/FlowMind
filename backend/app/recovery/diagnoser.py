from typing import Any


class FailureDiagnoser:
    def diagnose(self, result: dict[str, Any]) -> str:
        error_msg = result.get("error", "").lower()
        if "directory does not exist" in error_msg:
            return "FILE_NOT_FOUND"
        elif "timeout" in error_msg:
            return "TIMEOUT"
        elif "manual approval" in error_msg:
            return "REQUIRES_APPROVAL"
        elif "permission" in error_msg:
            return "PERMISSION_ERROR"
        return "UNKNOWN_ERROR"
