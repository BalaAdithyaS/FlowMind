from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import os

from .dataset import get_dataset
from .features import get_vectorizer
from .evaluation import evaluate_model
from .model_store import ModelStore

def train_intent_classifier():
    """Trains the intent classification pipeline, evaluates it, and saves the artifacts."""
    dataset_path = os.path.join(os.path.dirname(__file__), "datasets", "synthetic_workflow_requests.csv")
    X, y = get_dataset(save_path=dataset_path)
    
    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Define Pipeline
    pipeline = Pipeline([
        ('tfidf', get_vectorizer()),
        ('clf', LogisticRegression(random_state=42))
    ])
    
    # Train
    pipeline.fit(X_train, y_train)
    
    # Predict & Evaluate
    y_pred = pipeline.predict(X_test)
    labels = sorted(y.unique())
    metrics = evaluate_model(y_test, y_pred, labels)
    
    # Save Model & Metrics
    ModelStore.save_model(pipeline, metrics, dataset_size=len(X))
    
    return metrics
