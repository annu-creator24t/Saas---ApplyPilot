from app.database.collections import users_collection
from app.utils.password import (
    hash_password,
    verify_password,
)
from app.utils.jwt import create_access_token


async def register_user(user):

    existing_user = await users_collection.find_one(
        {
            "email": str(user.email)
        }
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered."
        }

    user.password = hash_password(user.password)

    await users_collection.insert_one(
        user.model_dump()
    )

    return {
        "success": True,
        "message": "Registration successful."
    }


async def login_user(email: str, password: str):

    print("Login Email:", email)

    user = await users_collection.find_one(
        {
            "email": email
        }
    )

    print("Mongo User:", user)

    if not user:
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    print("Received Password:", repr(password))
    print("Stored Hash:", user["password"])

    password_match = verify_password(
        password,
        user["password"]
    )

    print("Password Match:", password_match)

    if not password_match:
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    token = create_access_token(
        {
            "sub": str(user["_id"])
        }
    )

    return {
        "success": True,
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        },
    }