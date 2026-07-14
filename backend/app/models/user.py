from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class User(BaseModel):
    id: Optional[str] = None

    name: str

    email: EmailStr

    password: str

    created_at: datetime = datetime.utcnow()