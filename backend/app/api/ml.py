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

@router.post("/classify-intent")
async def classify_intent(request: PromptRequest):
    return intent_classifier.classify(request.prompt)

@router.post("/predict-success")
async def predict_success(features: WorkflowFeatures):
    return success_predictor.predict_success(features.model_dump())

@router.get("/metrics")
async def get_ml_metrics():
    return success_predictor.get_metrics()
