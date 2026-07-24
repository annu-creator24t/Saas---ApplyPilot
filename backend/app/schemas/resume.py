from typing import Optional

from pydantic import BaseModel, Field


# =====================================================
# Upload Response
# =====================================================

class ResumeUploadResponse(BaseModel):
    resume_id: str = Field(
        ...,
        description="Unique Resume ID",
    )

    filename: str = Field(
        ...,
        description="Original uploaded filename",
    )

    resume_url: str = Field(
        ...,
        description="Cloudinary URL of the uploaded resume",
    )

    text_length: int = Field(
        ...,
        description="Number of extracted characters",
    )

    status: str = Field(
        ...,
        description="Upload status",
    )


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

    file_url: str = Field(
        ...,
        description="Cloudinary URL",
    )

    ats_score: Optional[int] = Field(
        default=None,
        description="ATS score of the resume",
    )

    class Config:
        from_attributes = True