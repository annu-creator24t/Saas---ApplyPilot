from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Interview(BaseModel):

    id: Optional[str] = None

    user_id: str

    resume: str

    job_description: str

    questions: str

    created_at: datetime = datetime.utcnow()