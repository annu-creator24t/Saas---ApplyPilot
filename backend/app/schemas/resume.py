from pydantic import BaseModel


class ResumeUploadResponse(BaseModel):

    resume_id: str

    filename: str

    resume_url: str

    status: str