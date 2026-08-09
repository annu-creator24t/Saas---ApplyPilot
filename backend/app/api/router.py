from fastapi import APIRouter

from app.api import auth, resume, users
from app.api.admin import router as admin_router
from app.api.analysis import router as analysis_router
from app.api.analysis_history import router as analysis_history_router
from app.api.applications import router as applications_router
from app.api.cover_letter import router as cover_letter_router
from app.api.dashboard import router as dashboard_router
from app.api.export import router as export_router
from app.api.health import router as health_router
from app.api.interview_practice import router as interview_practice_router
from app.api.interview_questions import router as interview_questions_router
from app.api.job import router as job_router
from app.api.resume_improvement import router as resume_improvement_router
from app.api.subscription import router as subscription_router

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router)
api_router.include_router(users.router)

# Subscription & Billing
api_router.include_router(subscription_router)
api_router.include_router(admin_router)

# Resume
api_router.include_router(resume.router)

# Job & Application Tracking
api_router.include_router(job_router)
api_router.include_router(applications_router)

# AI Features
api_router.include_router(analysis_router)
api_router.include_router(cover_letter_router)
api_router.include_router(interview_questions_router)
api_router.include_router(interview_practice_router)
api_router.include_router(resume_improvement_router)

# Dashboard & History
api_router.include_router(dashboard_router)
api_router.include_router(analysis_history_router)

# System
api_router.include_router(health_router)

# Export
api_router.include_router(export_router)