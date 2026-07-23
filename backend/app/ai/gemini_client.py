from google import genai
from google.genai.errors import ClientError

from app.core.config import settings
from app.core.logger import logger
from app.handlers.exceptions import AIException

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def generate(prompt: str):
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )

        if not response.text:
            raise AIException(
                "Gemini returned an empty response.",
                error_code="AI_EMPTY_RESPONSE",
            )

        return response.text

    except ClientError as e:
        logger.exception("Gemini Client Error")

        status = e.status_code

        if status == 401:
            raise AIException(
                "Invalid Gemini API key.",
                error_code="AI_INVALID_KEY",
            )

        elif status == 404:
            raise AIException(
                "Gemini model not found.",
                error_code="AI_MODEL_NOT_FOUND",
            )

        elif status == 429:
            raise AIException(
                "Gemini API quota exceeded.",
                error_code="AI_QUOTA_EXCEEDED",
            )

        elif status == 503:
            raise AIException(
                "Gemini service is temporarily busy. Please try again in a few minutes.",
                error_code="AI_SERVICE_BUSY",
            )

        raise AIException(
            "Gemini service unavailable.",
            error_code="AI_SERVICE_ERROR",
        )

    except Exception:
        logger.exception("Unexpected Gemini Error")

        raise AIException(
            "Unexpected AI service error.",
            error_code="AI_UNKNOWN_ERROR",
        )