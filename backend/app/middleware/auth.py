from fastapi import Depends
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from app.auth.jwt import verify_access_token
from app.handlers.exceptions import AuthenticationException

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validate the access token and return the decoded JWT payload.
    """
    token = credentials.credentials

    try:
        return verify_access_token(token)

    except Exception:
        raise AuthenticationException(
            "Invalid or expired authentication token."
        )