from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class InterviewPracticeRequest(BaseModel):
    resume_id: str
    job_description: str


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str


class Evaluation(BaseModel):
    score: int
    strengths: List[str]
    improvements: List[str]
    ideal_answer: str


class PracticeQuestion(BaseModel):
    question: str
    category: str
    difficulty: str
    user_answer: Optional[str] = None
    evaluation: Optional[Evaluation] = None


class InterviewPracticeResponse(BaseModel):
    session_id: str
    questions: List[PracticeQuestion]


class InterviewSession(BaseModel):
    id: Optional[str] = None

    user_id: str
    resume_id: str

    job_description: str

    questions: List[PracticeQuestion]

    average_score: float = 0.0

    status: str = "in_progress"

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )