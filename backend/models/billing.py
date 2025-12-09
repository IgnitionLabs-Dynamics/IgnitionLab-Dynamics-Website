from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

class Billing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    quoted_amount: float
    final_billed_amount: float
    payment_method: str
    payment_status: str  # paid, pending, partial
    gst_invoice_number: Optional[str] = None
    discounts: Optional[float] = None
    refunds: Optional[float] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BillingCreate(BaseModel):
    job_id: str
    quoted_amount: float
    final_billed_amount: float
    payment_method: str
    payment_status: str
    gst_invoice_number: Optional[str] = None
    discounts: Optional[float] = None
    refunds: Optional[float] = None
    notes: Optional[str] = None
