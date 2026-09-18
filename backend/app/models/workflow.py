from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Boolean, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from ..core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    definition = Column(JSON)  # WorkflowSchema definition
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
    
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete")

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    id = Column(String, primary_key=True, default=generate_uuid)
    workflow_id = Column(String, ForeignKey("workflows.id"))
    status = Column(String)  # PENDING, RUNNING, COMPLETED, FAILED, WAITING_APPROVAL
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    trigger_data = Column(JSON, nullable=True)
    
    workflow = relationship("Workflow", back_populates="executions")
    steps = relationship("StepExecution", back_populates="execution", cascade="all, delete")

class StepExecution(Base):
    __tablename__ = "step_executions"
    id = Column(String, primary_key=True, default=generate_uuid)
    execution_id = Column(String, ForeignKey("workflow_executions.id"))
    step_id = Column(String)  # Node ID from the workflow
    tool = Column(String)
    action = Column(String)
    status = Column(String)  # PENDING, RUNNING, SUCCESS, FAILED, RECOVERING, RETRYING, WAITING_APPROVAL
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    inputs = Column(JSON, nullable=True)
    outputs = Column(JSON, nullable=True)
    error = Column(String, nullable=True)
    retry_count = Column(Integer, default=0)
    
    execution = relationship("WorkflowExecution", back_populates="steps")

class ExecutionEvent(Base):
    __tablename__ = "execution_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    execution_id = Column(String, index=True)
    step_id = Column(String, nullable=True)
    event_type = Column(String) # WORKFLOW_STARTED, STEP_FAILED, etc.
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(String, primary_key=True, default=generate_uuid)
    execution_id = Column(String, index=True)
    step_id = Column(String)
    reason = Column(String)
    risk_level = Column(String)
    status = Column(String) # WAITING, APPROVED, REJECTED
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String)
    description = Column(String, nullable=True)
    priority = Column(String, default="Medium")
    status = Column(String, default="Open")
    workflow_id = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MLPrediction(Base):
    __tablename__ = "ml_predictions"
    id = Column(String, primary_key=True, default=generate_uuid)
    target = Column(String) # intent, success, failure
    input_features = Column(JSON)
    prediction = Column(String)
    confidence = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
