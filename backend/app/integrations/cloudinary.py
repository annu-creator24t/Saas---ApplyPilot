from typing import Any

import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.core.logger import logger
from app.handlers.exceptions import AIException


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_resume(
    file_path: str,
) -> dict[str, Any]:
    """
    Upload a resume to Cloudinary.
    """
    try:
        response = cloudinary.uploader.upload(
            file_path,
            resource_type="raw",
            folder="applypilot/resumes",
        )

        return {
            "url": response.get("secure_url"),
            "public_id": response.get("public_id"),
        }

    except Exception:
        logger.exception("Failed to upload resume to Cloudinary.")

        raise AIException(
            message="Failed to upload resume.",
            error_code="CLOUDINARY_UPLOAD_ERROR",
        )


async def delete_resume(
    public_id: str,
) -> bool:
    """
    Delete a resume from Cloudinary.
    """
    try:
        cloudinary.uploader.destroy(
            public_id,
            resource_type="raw",
        )

        return True

    except Exception:
        logger.exception("Failed to delete resume from Cloudinary.")

        raise AIException(
            message="Failed to delete resume.",
            error_code="CLOUDINARY_DELETE_ERROR",
        )