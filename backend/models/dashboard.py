from pydantic import BaseModel
from typing import List

class DashboardStats(BaseModel):
    jobs_this_week: int
    pending_payments: int
    upcoming_reminders: int
    total_customers: int
    total_vehicles: int
    weekly_income: float
    monthly_income: float
    all_time_income: float
    recent_jobs: List[dict]
