from app.core.config import settings
from app.core.logger import logger


def validate_startup():

    required = {
        "MONGODB_URI": settings.MONGODB_URI,
        "DATABASE_NAME": settings.DATABASE_NAME,
        "JWT_SECRET_KEY": settings.JWT_SECRET_KEY,
        "JWT_REFRESH_SECRET_KEY": settings.JWT_REFRESH_SECRET_KEY,
        "GEMINI_API_KEY": settings.GEMINI_API_KEY,
    }

    missing = []

    for key, value in required.items():
        if not value:
            missing.append(key)

    if missing:
        logger.error("Missing environment variables: %s", ", ".join(missing))
        raise RuntimeError(
            f"Missing environment variables: {', '.join(missing)}"
        )

    logger.info("Environment validation successful.")