from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings
from app.db.base import get_database

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("/")
async def health_check():

    health = {
    "status": "healthy",
    "app": settings.APP_NAME,
    "version": settings.APP_VERSION,
    "timestamp": datetime.utcnow().isoformat(),
    "services": {
        "mongodb": "connected",
        "gemini": "configured" if settings.GEMINI_API_KEY else "missing",
        "cloudinary": (
            "configured"
            if settings.CLOUDINARY_CLOUD_NAME
            else "missing"
        ),
    },
}
        
    try:
        await get_database().command("ping")
        health["services"]["mongodb"] = "connected"
    except Exception:
        health["status"] = "unhealthy"
        health["services"]["mongodb"] = "disconnected"

    return health