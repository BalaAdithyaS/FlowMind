from fastapi import APIRouter
from pydantic import BaseModel
from app.ml.classifier import IntentClassifier
from app.ml.predictor import WorkflowSuccessPredictor

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

# Initialize models (loads/trains on startup)
intent_classifier = IntentClassifier()
success_predictor = WorkflowSuccessPredictor()

class PromptRequest(BaseModel):
    prompt: str

class WorkflowFeatures(BaseModel):
    num_steps: int
    num_tools: int
    external_service_count: int
    historical_failure_rate: float

from app.ml.model_store import ModelStore

@router.post("/classify-intent")
async def classify_intent(request: PromptRequest):
    return intent_classifier.classify(request.prompt)

@router.post("/retrain")
async def retrain_intent_model():
    metrics = intent_classifier.retrain()
    return {"message": "Model retrained successfully", "metrics": metrics}

@router.post("/predict-success")
async def predict_success(features: WorkflowFeatures):
    return success_predictor.predict_success(features.model_dump())

@router.get("/metrics")
async def get_ml_metrics():
    intent_metadata = ModelStore.load_metadata()
    # Merge intent metrics with the existing success_predictor mock metrics for now,
    # or just return intent metrics if preferred. The prompt requested showing accuracy, precision etc.
    # We will prioritize the real Intent Classifier metrics.
    
    # If no intent metadata exists, fall back to success_predictor
    if not intent_metadata:
        return success_predictor.get_metrics()
        
    metrics = intent_metadata.get("metrics", {})
    return {
        "accuracy": metrics.get("accuracy", 0.0),
        "precision": metrics.get("precision", 0.0),
        "recall": metrics.get("recall", 0.0),
        "f1_score": metrics.get("f1_score", 0.0),
        "dataset_size": intent_metadata.get("dataset_size", 0),
        "last_trained": intent_metadata.get("training_timestamp", ""),
        "feature_importances": success_predictor.get_metrics().get("feature_importances", {}) # keep radar chart working
    }
