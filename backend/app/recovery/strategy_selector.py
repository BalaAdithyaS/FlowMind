from typing import Dict, Any

class StrategySelector:
    def select_strategy(self, failure_type: str) -> Dict[str, Any]:
        """Maps a categorized failure to a deterministic recovery strategy."""
        
        if failure_type == "NETWORK_ERROR":
            return {"strategy": "RETRY", "delay": 2.0, "max_retries": 3, "description": "Exponential backoff retry"}
            
        elif failure_type == "TIMEOUT":
            return {"strategy": "RETRY", "delay": 5.0, "max_retries": 2, "description": "Retry with increased timeout"}
            
        elif failure_type == "RATE_LIMIT":
            return {"strategy": "RETRY", "delay": 15.0, "max_retries": 3, "description": "Wait out rate limit window"}
            
        elif failure_type == "NOT_FOUND":
            return {"strategy": "CREATE_MISSING_RESOURCE", "description": "Resource not found; attempt to create or fallback"}
            
        elif failure_type in ["AUTH_ERROR", "PERMISSION_ERROR", "APPROVAL_REQUIRED"]:
            # Halt workflow for human intervention
            return {"strategy": "MANUAL_APPROVAL", "description": "Requires human intervention due to security/auth block."}
            
        elif failure_type == "PARSING_ERROR":
            return {"strategy": "FALLBACK_PARSER", "description": "Use alternate parser"}
            
        else:
            return {"strategy": "MANUAL_APPROVAL", "description": "Unknown error requires human intervention."}
