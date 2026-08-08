from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")

    full_name: str
    email: EmailStr

    password: str

    profile_picture: Optional[str] = None

    is_verified: bool = False

    is_active: bool = True

    subscription_status: str = "free"
    subscription_plan: str = "free"
    subscription_start: Optional[datetime] = None
    subscription_end: Optional[datetime] = None
    free_usage_count: int = 0

    payment_status: str = "none"
    payment_submitted_at: Optional[datetime] = None
    payment_reference: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True