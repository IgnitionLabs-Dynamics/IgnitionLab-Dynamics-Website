from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

class Vehicle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    make: str
    model: str
    variant: str
    engine_code: str
    ecu_type: str
    vin: str
    registration_number: str
    year: int
    fuel_type: str
    gearbox: str
    odometer_at_last_visit: Optional[int] = None
    notes: Optional[str] = None
    qr_code: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VehicleCreate(BaseModel):
    customer_id: str
    make: str
    model: str
    variant: str
    engine_code: str
    ecu_type: str
    vin: str
    registration_number: str
    year: int
    fuel_type: str
    gearbox: str
    odometer_at_last_visit: Optional[int] = None
    notes: Optional[str] = None
