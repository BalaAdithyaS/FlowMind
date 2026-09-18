import joblib
import os
import json
from typing import Any, Dict, Optional
from datetime import datetime, timezone

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "intent_model.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")

class ModelStore:
    @staticmethod
    def save_model(model: Any, metrics: Dict[str, Any], dataset_size: int):
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(model, MODEL_PATH)
        
        metadata = {
            "model_version": "1.0",
            "training_timestamp": datetime.now(timezone.utc).isoformat(),
            "dataset_size": dataset_size,
            "metrics": metrics
        }
        with open(METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
            
    @staticmethod
    def load_model() -> Optional[Any]:
        if os.path.exists(MODEL_PATH):
            return joblib.load(MODEL_PATH)
        return None
        
    @staticmethod
    def load_metadata() -> Dict[str, Any]:
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}
