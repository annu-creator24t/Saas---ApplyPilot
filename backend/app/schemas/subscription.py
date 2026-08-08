from datetime import datetime
from typing import Optional
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
    free_credits_remaining: int
    is_pro: bool
    subscription_start: Optional[datetime] = None
    subscription_end: Optional[datetime] = None
    payment_status: str
