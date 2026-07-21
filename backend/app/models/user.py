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

    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True