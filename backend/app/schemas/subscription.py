from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel


class SubmitPaymentRequest(BaseModel):
    upi_reference: Optional[str] = None


class AdminApprovePaymentRequest(BaseModel):
    user_id: str
    duration_days: int = 30


class SubscriptionSummary(BaseModel):
    subscription_status: str
    subscription_plan: str
    free_usage_count: int
    free_credits_limit: int = 3
    free_credits_remaining: Union[int, str]
    is_pro: bool
    trial_active: bool = False
    trial_started_at: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    trial_days_remaining: int = 0
    subscription_start: Optional[datetime] = None
    subscription_end: Optional[datetime] = None
    payment_status: str
    payment_submitted_at: Optional[datetime] = None
