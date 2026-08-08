from groq import (
    Groq,
    GroqError,
    APIError,
    RateLimitError,
    AuthenticationError,
)

from app.core.config import settings
from app.core.logger import logger
from app.handlers.exceptions import AIException


def get_groq_client() -> Groq:
    """
    Instantiate and return the Groq client using settings.GROQ_API_KEY.
    """
    if not settings.GROQ_API_KEY:
        raise AIException(
            message="GROQ_API_KEY is not configured.",
            error_code="AI_CONFIG_ERROR",
        )
    return Groq(api_key=settings.GROQ_API_KEY)


def generate(prompt: str) -> str:
    """
    Generate content using the Groq API model.
    """
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=settings.GROQ_MODEL,
        )

        text = None
        if response.choices and len(response.choices) > 0:
            text = response.choices[0].message.content

        if not text:
            raise AIException(
                "Groq returned an empty response.",
                error_code="AI_EMPTY_RESPONSE",
            )

        return text

    except RateLimitError:
        logger.exception("Groq rate limit error.")
        raise AIException(
            message="Groq API quota exceeded.",
            error_code="AI_QUOTA_EXCEEDED",
        )

    except AuthenticationError:
        logger.exception("Groq authentication error.")
        raise AIException(
            message="Invalid Groq API key.",
            error_code="AI_INVALID_KEY",
        )

    except APIError as exc:
        logger.exception("Groq API error.")

        status_code = getattr(exc, "status_code", None)

        error_map = {
            401: (
                "Invalid Groq API key.",
                "AI_INVALID_KEY",
            ),
            403: (
                "Access denied by Groq API.",
                "AI_ACCESS_DENIED",
            ),
            404: (
                "Groq model not found.",
                "AI_MODEL_NOT_FOUND",
            ),
            429: (
                "Groq API quota exceeded.",
                "AI_QUOTA_EXCEEDED",
            ),
            500: (
                "Groq internal server error.",
                "AI_INTERNAL_ERROR",
            ),
            503: (
                "Groq service is temporarily unavailable.",
                "AI_SERVICE_BUSY",
            ),
        }

        message, error_code = error_map.get(
            status_code,
            (
                "Groq service unavailable.",
                "AI_SERVICE_ERROR",
            ),
        )

        raise AIException(
            message=message,
            error_code=error_code,
        )

    except AIException:
        raise

    except Exception as exc:
        logger.exception("Unexpected Groq error.")

        raise AIException(
            message=f"Unexpected AI service error: {str(exc)}",
            error_code="AI_UNKNOWN_ERROR",
        )
