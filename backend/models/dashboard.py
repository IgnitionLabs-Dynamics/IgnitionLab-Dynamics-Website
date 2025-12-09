from pydantic import BaseModel
from typing import List

class DashboardStats(BaseModel):
    jobs_this_week: int
    pending_payments: int
    upcoming_reminders: int
    total_customers: int
    total_vehicles: int
    recent_jobs: List[dict]
