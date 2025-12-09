from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    customer_id: str
    date: str
    technician_name: str
    work_performed: Optional[str] = None
    tune_stage: Optional[str] = None
    mods_installed: Optional[str] = None
    dyno_results: Optional[str] = None
    before_ecu_map_version: Optional[str] = None
    after_ecu_map_version: Optional[str] = None
    files_uploaded: Optional[List[str]] = None
    afr_graph_screenshots: Optional[List[str]] = None
    calibration_notes: Optional[str] = None
    road_test_notes: Optional[str] = None
    next_recommendations: Optional[str] = None
    warranty_or_retune_status: Optional[str] = None
    odometer_at_visit: Optional[int] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class JobCreate(BaseModel):
    vehicle_id: str
    customer_id: str
    date: str
    technician_name: str
    work_performed: Optional[str] = None
    tune_stage: Optional[str] = None
    mods_installed: Optional[str] = None
    dyno_results: Optional[str] = None
    before_ecu_map_version: Optional[str] = None
    after_ecu_map_version: Optional[str] = None
    calibration_notes: Optional[str] = None
    road_test_notes: Optional[str] = None
    next_recommendations: Optional[str] = None
    warranty_or_retune_status: Optional[str] = None
    odometer_at_visit: Optional[int] = None
