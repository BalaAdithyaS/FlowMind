import numpy as np
import json
from ..core.database import SessionLocal
from ..models.workflow import MLPrediction
from .model_store import ModelStore
from .trainer import train_intent_classifier

class IntentClassifier:
    def __init__(self):
        # In production, this loads a pre-trained serialized model.
        self.model = ModelStore.load_model()
        if not self.model:
            # Fallback for first run
            print("No intent model found. Initiating initial training...")
            self.retrain()
        
    def retrain(self) -> dict:
        metrics = train_intent_classifier()
        self.model = ModelStore.load_model()
        return metrics

    def classify(self, prompt: str) -> dict:
        if not self.model:
            return {"intent": "UNKNOWN", "confidence": 0.0}
            
        prediction = self.model.predict([prompt])[0]
        probabilities = self.model.predict_proba([prompt])[0]
        confidence = float(np.max(probabilities))
        
        # Persist prediction
        db = SessionLocal()
        try:
            pred_record = MLPrediction(
                target="intent",
                input_features=json.dumps({"prompt": prompt}),
                prediction=prediction,
                confidence=confidence
            )
            db.add(pred_record)
            db.commit()
        finally:
            db.close()
            
        return {
            "intent": prediction,
            "confidence": confidence
        }
