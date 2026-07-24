from app.core.config import settings
from app.core.logger import logger


def validate_startup() -> None:
    """
    Validate required environment variables before starting the application.
    """
    logger.info("Validating application configuration...")

    required = {
        "MONGODB_URI": settings.MONGODB_URI,
        "DATABASE_NAME": settings.DATABASE_NAME,
        "JWT_SECRET_KEY": settings.JWT_SECRET_KEY,
        "JWT_REFRESH_SECRET_KEY": settings.JWT_REFRESH_SECRET_KEY,
        "GEMINI_API_KEY": settings.GEMINI_API_KEY,
    }

    missing = [
        key
        for key, value in required.items()
        if not value
    ]

    if missing:
        message = (
            f"Missing environment variables: {', '.join(missing)}"
        )
        logger.error(message)
        raise RuntimeError(message)

    logger.info("Environment validation completed successfully.")