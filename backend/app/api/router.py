from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.resume import router as resume_router
from app.api.cover_letter import router as cover_letter_router
from app.api.interview import router as interview_router
from app.api.evaluate_answer import router as evaluate_answer_router
from app.api.profile import router as profile_router

from app.api.history.resume_history import router as resume_history_router
from app.api.history.cover_letter_history import router as cover_letter_history_router
from app.api.history.interview_history import router as interview_history_router
from app.api.dashboard import router as dashboard_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(resume_router)
router.include_router(cover_letter_router)
router.include_router(interview_router)
router.include_router(evaluate_answer_router)
router.include_router(profile_router)

router.include_router(resume_history_router)
router.include_router(cover_letter_history_router)
router.include_router(interview_history_router)
router.include_router(dashboard_router)