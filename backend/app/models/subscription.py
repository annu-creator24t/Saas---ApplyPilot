from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SubscriptionPayment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    amount: float = 1.0
    currency: str = "INR"
    upi_reference: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    verified_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class SubscriptionStatusResponse(BaseModel):
    subscription_status: str
    subscription_plan: str
    free_usage_count: int
    free_credits_remaining: int
    is_pro: bool
    subscription_start: Optional[datetime] = None
    subscription_end: Optional[datetime] = None
    payment_status: str
