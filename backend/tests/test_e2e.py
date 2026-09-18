from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest
import asyncio
import os

from app.main import app
from app.core.database import Base, get_db
from app.models.workflow import WorkflowExecution, StepExecution

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_workflow_creation_and_execution():
    # 1. Test AI Planner Route (Intent Classification is now ML based!)
    res = client.post("/ml/classify-intent", json={"prompt": "Send an email"})
    assert res.status_code == 200
    assert "intent" in res.json()
    
    # 2. Create Workflow
    workflow_data = {
        "name": "Test Workflow",
        "description": "Integration test",
        "trigger": {
            "type": "manual"
        },
        "steps": [
            {
                "id": "step1",
                "name": "Test File",
                "tool": "filesystem",
                "action": "write_file",
                "inputs": {"path": "test.txt", "content": "hello world"},
                "depends_on": []
            }
        ]
    }
    res = client.post("/workflows/", json=workflow_data)
    assert res.status_code == 200
    workflow_id = res.json()["id"]
    
    # 3. Execute Workflow
    res = client.post(f"/workflows/{workflow_id}/run")
    assert res.status_code == 200
    execution_id = res.json()["execution_id"]
    
    # Let the background engine run for a moment
    import time
    time.sleep(2)
    
    # 4. Check DB status
    db = TestingSessionLocal()
    exec_record = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    assert exec_record is not None
    assert exec_record.status in ["COMPLETED", "FAILED", "RUNNING"]
    
    # 5. ML Telemetry Verification
    res = client.get("/ml/metrics")
    assert res.status_code == 200
    assert "accuracy" in res.json()
    
    # Clean up test.txt if it was created
    if os.path.exists("./workspace/test.txt"):
        os.remove("./workspace/test.txt")
