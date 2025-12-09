from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

class TuneRevision(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    vehicle_id: str
    revision_label: str
    description: Optional[str] = None
    base_file_reference: Optional[str] = None
    diff_notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TuneRevisionCreate(BaseModel):
    job_id: str
    vehicle_id: str
    revision_label: str
    description: Optional[str] = None
    diff_notes: Optional[str] = None

class TuneRevisionUpdate(BaseModel):
    revision_label: str
    description: Optional[str] = None
    diff_notes: Optional[str] = None
