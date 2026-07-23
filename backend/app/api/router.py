from fastapi import APIRouter

from app.api import auth
from app.api import users
from app.api import resumes

from app.api.analysis import router as analysis_router
from app.api.dashboard import router as dashboard_router
from app.api.analysis_history import router as analysis_history_router
from app.api.health import router as health_router


api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(resumes.router)
api_router.include_router(analysis_router)
api_router.include_router(dashboard_router)
api_router.include_router(analysis_history_router)
api_router.include_router(health_router)