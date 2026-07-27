from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class InterviewQuestionsRequest(BaseModel):
    resume_id: str = Field(
        ...,
        description="Resume ID",
    )

    job_description: str = Field(
        ...,
        description="Target job description",
    )


class InterviewQuestion(BaseModel):
    question: str
    category: str
    difficulty: str
    ideal_answer: str


class InterviewQuestionsResponse(BaseModel):
    interview_id: str

    technical: List[InterviewQuestion]

    behavioral: List[InterviewQuestion]

    hr: List[InterviewQuestion]


class InterviewQuestions(BaseModel):
    id: Optional[str] = None

    user_id: str

    resume_id: str

    job_description: str

    technical: List[InterviewQuestion]

    behavioral: List[InterviewQuestion]

    hr: List[InterviewQuestion]

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )