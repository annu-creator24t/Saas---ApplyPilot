from google import genai
from google.genai.errors import ClientError

from app.core.config import settings
from app.core.logger import logger
from app.handlers.exceptions import AIException

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def generate(prompt: str) -> str:
    """
    Generate content using the Gemini model.
    """
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )

        text = getattr(response, "text", None)

        if not text:
            raise AIException(
                "Gemini returned an empty response.",
                error_code="AI_EMPTY_RESPONSE",
            )

        return text

    except ClientError as exc:
        logger.exception("Gemini client error.")

        status_code = getattr(exc, "status_code", None)

        error_map = {
            401: (
                "Invalid Gemini API key.",
                "AI_INVALID_KEY",
            ),
            403: (
                "Access denied by Gemini API.",
                "AI_ACCESS_DENIED",
            ),
            404: (
                "Gemini model not found.",
                "AI_MODEL_NOT_FOUND",
            ),
            429: (
                "Gemini API quota exceeded.",
                "AI_QUOTA_EXCEEDED",
            ),
            500: (
                "Gemini internal server error.",
                "AI_INTERNAL_ERROR",
            ),
            503: (
                "Gemini service is temporarily unavailable.",
                "AI_SERVICE_BUSY",
            ),
        }

        message, error_code = error_map.get(
            status_code,
            (
                "Gemini service unavailable.",
                "AI_SERVICE_ERROR",
            ),
        )

        raise AIException(
            message=message,
            error_code=error_code,
        )

    except AIException:
        raise

    except Exception:
        logger.exception("Unexpected Gemini error.")

        raise AIException(
            message="Unexpected AI service error.",
            error_code="AI_UNKNOWN_ERROR",
        )