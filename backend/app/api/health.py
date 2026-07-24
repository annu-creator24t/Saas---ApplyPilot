from datetime import datetime

from fastapi import APIRouter, status

from app.core.config import settings
from app.db.base import get_database
from app.schemas.common import APIResponse

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get(
    "/",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check the health status of the application and its dependencies.",
)
async def health_check():

    health = {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "mongodb": "connected",
            "gemini": (
                "configured"
                if settings.GEMINI_API_KEY
                else "missing"
            ),
            "cloudinary": (
                "configured"
                if settings.CLOUDINARY_CLOUD_NAME
                else "missing"
            ),
        },
    }

    try:
        await get_database().command("ping")
    except Exception:
        health["status"] = "unhealthy"
        health["services"]["mongodb"] = "disconnected"

    return APIResponse(
        message="Health check completed successfully.",
        data=health,
    )