import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..core.database import Base


def generate_uuid():
    return str(uuid.uuid4())

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    definition = Column(JSON)  # The Pydantic WorkflowSchema dumped to JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    executions = relationship("WorkflowExecution", back_populates="workflow")

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(String, primary_key=True, default=generate_uuid)
    workflow_id = Column(String, ForeignKey("workflows.id"))
    status = Column(String)  # DRAFT, RUNNING, COMPLETED, FAILED, etc.
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    trigger_data = Column(JSON, nullable=True)

    workflow = relationship("Workflow", back_populates="executions")
    steps = relationship("StepExecution", back_populates="execution")

class StepExecution(Base):
    __tablename__ = "step_executions"

    id = Column(String, primary_key=True, default=generate_uuid)
    execution_id = Column(String, ForeignKey("workflow_executions.id"))
    step_id = Column(String)  # The ID from the workflow definition
    status = Column(String)  # PENDING, RUNNING, SUCCESS, FAILED
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    inputs = Column(JSON, nullable=True)
    outputs = Column(JSON, nullable=True)
    error = Column(String, nullable=True)
    retry_count = Column(Integer, default=0)
    
    execution = relationship("WorkflowExecution", back_populates="steps")
