from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Resume(BaseModel):

    id: Optional[str] = Field(default=None, alias="_id")

    user_id: str

    original_filename: str

    stored_filename: str

    file_url: str

    public_id: str

    file_size: int

    content_type: str

    extracted_text: str = ""

    ats_score: int | None = None

    analysis: dict = {}

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True