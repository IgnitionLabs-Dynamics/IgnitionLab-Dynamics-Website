from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    vehicle_id: str
    appointment_date: str
    appointment_time: str
    service_type: str
    notes: Optional[str] = None
    status: str = "scheduled"  # scheduled, confirmed, completed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AppointmentCreate(BaseModel):
    customer_id: str
    vehicle_id: str
    appointment_date: str
    appointment_time: str
    service_type: str
    notes: Optional[str] = None
    status: str = "scheduled"

class StatusUpdate(BaseModel):
    status: str
