from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


# =====================================================
# Resume Response
# =====================================================

class ResumeResponse(BaseModel):
    resume_id: str = Field(
        ...,
        description="Resume ID",
    )

    title: str = Field(
        ...,
        description="Resume title",
    )

    original_filename: str = Field(
        ...,
        description="Original uploaded filename",
    )

    stored_filename: str = Field(
        ...,
        description="Stored filename on server",
    )

    file_url: str = Field(
        ...,
        description="Cloudinary URL",
    )

    file_size: int = Field(
        ...,
        description="Resume file size in bytes",
    )

    content_type: str = Field(
        ...,
        description="File MIME type",
    )

    ats_score: Optional[int] = Field(
        default=None,
        description="ATS score",
    )

    analysis: Dict[str, Any] = Field(
        default_factory=dict,
        description="ATS analysis result",
    )

    created_at: datetime = Field(
        ...,
        description="Upload timestamp",
    )

    class Config:
        from_attributes = True


# =====================================================
# Upload Response
# =====================================================

class ResumeUploadResponse(BaseModel):
    message: str = Field(
        ...,
        description="Upload status message",
    )

    data: ResumeResponse


# =====================================================
# Rename Request
# =====================================================

class RenameResumeRequest(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Resume title",
    )