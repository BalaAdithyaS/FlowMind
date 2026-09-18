from typing import Dict, Any

class FailureDiagnoser:
    def diagnose(self, result: Dict[str, Any]) -> str:
        error = result.get("error", "").lower()
        
        # Determine failure category based on error message signatures
        if "timeout" in error or "timed out" in error:
            return "TIMEOUT"
        elif "rate limit" in error or "429" in error or "too many requests" in error:
            return "RATE_LIMIT"
        elif "unauthorized" in error or "401" in error or "forbidden" in error or "403" in error:
            return "AUTH_ERROR"
        elif "not found" in error or "404" in error:
            return "NOT_FOUND"
        elif "permission" in error or "security error" in error or "blocked" in error:
            return "PERMISSION_ERROR"
        elif "json" in error or "parse" in error or "schema" in error:
            return "PARSING_ERROR"
        elif "network" in error or "connection" in error or "socket" in error:
            return "NETWORK_ERROR"
        elif "manual approval" in error or "requires approval" in error:
            return "APPROVAL_REQUIRED"
            
        return "UNKNOWN_ERROR"
