import pytest
import os
import json
from app.ml.dataset import get_dataset
from app.ml.features import get_vectorizer
from app.ml.trainer import train_intent_classifier
from app.ml.model_store import ModelStore
from app.ml.classifier import IntentClassifier

def test_dataset_generation():
    X, y = get_dataset()
    assert len(X) > 0
    assert len(y) > 0
    assert len(X) == len(y)
    
def test_vectorizer():
    vec = get_vectorizer()
    X, _ = get_dataset()
    transformed = vec.fit_transform(X)
    assert transformed.shape[0] == len(X)

def test_training_and_persistence():
    # Train the model
    metrics = train_intent_classifier()
    
    assert "accuracy" in metrics
    assert "precision" in metrics
    
    # Verify artifacts exist
    model = ModelStore.load_model()
    metadata = ModelStore.load_metadata()
    
    assert model is not None
    assert metadata.get("dataset_size") > 0

def test_prediction():
    classifier = IntentClassifier()
    
    # Ensure it predicts something reasonably
    result = classifier.classify("Schedule a meeting")
    
    assert "intent" in result
    assert "confidence" in result
    assert result["intent"] in ["CALENDAR_AUTOMATION", "EMAIL_AUTOMATION", "MULTI_TOOL_AUTOMATION", "GITHUB_AUTOMATION", "TASK_AUTOMATION", "FILE_AUTOMATION"]
    assert 0 <= result["confidence"] <= 1.0

def test_invalid_input():
    classifier = IntentClassifier()
    result = classifier.classify("")
    # Even on empty input, the model will output a class with some probability
    assert "intent" in result
