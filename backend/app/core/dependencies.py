from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.auth.jwt import verify_access_token
from app.db.base import get_collection
from app.db.connection import get_database
from app.handlers.exceptions import AuthenticationException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_db() -> Any:
    """
    Return the MongoDB database instance.
    """
    return get_database()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> dict[str, Any]:
    """
    Validate the access token and return the authenticated user.
    """
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

    user = await get_collection("users").find_one(
        {
            "_id": object_id,
        }
    )

    if not user:
        raise AuthenticationException(
            "User not found."
        )

    return user