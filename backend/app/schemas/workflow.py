from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class TriggerType(str, Enum):
    MANUAL = "manual"
    EMAIL_RECEIVED = "email_received"
    SCHEDULED = "scheduled"
    WEBHOOK = "webhook"

class Trigger(BaseModel):
    type: TriggerType
    config: dict[str, Any] | None = Field(default_factory=dict)

class RetryPolicy(BaseModel):
    max_retries: int = 3
    delay_seconds: int = 5
    backoff_multiplier: float = 2.0

class StepCondition(BaseModel):
    variable: str
    operator: str  # e.g., "==", "!=", ">", "<", "contains"
    value: Any

class WorkflowStep(BaseModel):
    id: str
    name: str
    action: str
    tool: str
    depends_on: list[str] = Field(default_factory=list)
    condition: StepCondition | None = None
    retry_policy: RetryPolicy | None = None
    requires_approval: bool = False
    inputs: dict[str, Any] | None = Field(default_factory=dict)

class WorkflowSchema(BaseModel):
    name: str
    description: str | None = None
    trigger: Trigger
    steps: list[WorkflowStep]

class WorkflowExecutionState(str, Enum):
    DRAFT = "DRAFT"
    VALIDATING = "VALIDATING"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    FAILED = "FAILED"
    RECOVERING = "RECOVERING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class StepExecutionState(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    RETRYING = "RETRYING"
    RECOVERING = "RECOVERING"
    SKIPPED = "SKIPPED"
    WAITING_APPROVAL = "WAITING_APPROVAL"
