from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import numpy as np
import json
from ..core.database import SessionLocal
from ..models.workflow import MLPrediction

class IntentClassifier:
    def __init__(self):
        # We train an on-the-fly model using a synthetic dataset for demonstration.
        # In production, this would load a pre-trained serialized model (e.g., joblib.load).
        self.model = self._train_model()
        
    def _train_model(self) -> Pipeline:
        # Synthetic development dataset
        X_train = [
            "Send an email to user", "Send welcome email", "Email the report",
            "Create a GitHub issue", "Update issue on github", "Comment on the PR",
            "Read file from workspace", "Create a folder", "Move document",
            "Schedule a meeting", "Add to calendar", "Create an event",
            "Create a task", "Add to my todo list", "Complete task 123"
        ]
        y_train = [
            "EMAIL_AUTOMATION", "EMAIL_AUTOMATION", "EMAIL_AUTOMATION",
            "GITHUB_AUTOMATION", "GITHUB_AUTOMATION", "GITHUB_AUTOMATION",
            "FILE_AUTOMATION", "FILE_AUTOMATION", "FILE_AUTOMATION",
            "CALENDAR_AUTOMATION", "CALENDAR_AUTOMATION", "CALENDAR_AUTOMATION",
            "TASK_AUTOMATION", "TASK_AUTOMATION", "TASK_AUTOMATION"
        ]
        
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('clf', LogisticRegression())
        ])
        
        pipeline.fit(X_train, y_train)
        return pipeline

    def classify(self, prompt: str) -> dict:
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
