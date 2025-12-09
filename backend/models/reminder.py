from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

class Reminder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    customer_id: str
    job_id: Optional[str] = None
    reminder_type: str  # follow_up, service, retune
    reminder_date: str
    message: str
    status: str = "pending"  # pending, completed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReminderCreate(BaseModel):
    vehicle_id: str
    customer_id: str
    job_id: Optional[str] = None
    reminder_type: str
    reminder_date: str
    message: str
