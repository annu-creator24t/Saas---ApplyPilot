from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt

from app.core.config import settings


def _create_token(
    data: dict[str, Any],
    expires_delta: timedelta,
    secret_key: str,
    token_type: str,
) -> str:
    """
    Create and sign a JWT.
    """
    now = datetime.now(timezone.utc)

    payload = data.copy()
    payload.update(
        {
            "iat": now,
            "exp": now + expires_delta,
            "type": token_type,
        }
    )

    return jwt.encode(
        payload,
        secret_key,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_access_token(
    data: dict[str, Any],
) -> str:
    """
    Create an access token.
    """
    return _create_token(
        data=data,
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        ),
        secret_key=settings.JWT_SECRET_KEY,
        token_type="access",
    )


def create_refresh_token(
    data: dict[str, Any],
) -> str:
    """
    Create a refresh token.
    """
    return _create_token(
        data=data,
        expires_delta=timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS,
        ),
        secret_key=settings.JWT_REFRESH_SECRET_KEY,
        token_type="refresh",
    )


def verify_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Verify and decode an access token.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


def verify_refresh_token(
    token: str,
) -> dict[str, Any]:
    """
    Verify and decode a refresh token.
    """
    return jwt.decode(
        token,
        settings.JWT_REFRESH_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )