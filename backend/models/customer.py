from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone_number: str
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    instagram_handle: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    id_proof_reference: Optional[str] = None
    consent_docs_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CustomerCreate(BaseModel):
    full_name: str
    phone_number: str
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    instagram_handle: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    notes: Optional[str] = None
