from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.auth.jwt import verify_access_token
from app.db.connection import get_database
from app.handlers.exceptions import AuthenticationException

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)


async def get_db() -> Any:
    """
    Return the MongoDB database instance.
    """
    return get_database()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> dict[str, Any]:
    try:
        payload = verify_access_token(token)
    except JWTError:
        raise AuthenticationException(
            "Invalid or expired authentication token."
        )

    user_id = payload.get("sub")

    if not user_id:
        raise AuthenticationException(
            "Invalid authentication token."
        )

    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise AuthenticationException(
            "Invalid authentication token."
        )

    db = get_database()

    user = await db["users"].find_one(
        {
            "_id": object_id,
        }
    )

    if not user:
        raise AuthenticationException("User not found.")

    return user


async def get_current_admin_user(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Ensures that the authenticated user has Admin permissions.
    Raises 403 Forbidden for non-admin users.
    """
    is_admin = current_user.get("is_admin", False) or current_user.get("role") == "admin"
    
    if not is_admin:
        from app.handlers.exceptions import AuthorizationException
        raise AuthorizationException("Access denied. Admin authorization required.")

    return current_user