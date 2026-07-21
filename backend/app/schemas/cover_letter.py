from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CoverLetter(BaseModel):

    id: Optional[str] = None

    user_id: str

    resume: str

    job_description: str

    cover_letter: str

    created_at: datetime = datetime.utcnow()