from datetime import datetime
from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class ApplicationStatus(str, Enum):
    BOOKMARKED = "BOOKMARKED"
    APPLIED = "APPLIED"
    INTERVIEWING = "INTERVIEWING"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class JobMatchRequest(BaseModel):
    job_title: Optional[str] = Field(None, description="Job title")
    company_name: Optional[str] = Field(None, description="Company name")
    job_description: str = Field(..., min_length=10, description="Full text of the job description")
    job_url: Optional[str] = Field(None, description="URL of the job posting")
    location: Optional[str] = Field(None, description="Job location")
    resume_id: Optional[str] = Field(None, description="Optional resume ID to analyze against")


class JobMatchResponse(BaseModel):
    match_score: int = Field(..., ge=0, le=100)
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    key_keywords: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[str] = []
    summary: str = ""
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None


class JobApplicationCreate(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=200)
    company_name: str = Field(..., min_length=1, max_length=200)
    job_description: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    salary_range: Optional[str] = None
    notes: Optional[str] = None
    ats_score: Optional[int] = None
    matched_skills: List[str] = []
    missing_skills: List[str] = []


class JobApplicationUpdate(BaseModel):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    job_description: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    salary_range: Optional[str] = None
    notes: Optional[str] = None
    ats_score: Optional[int] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
