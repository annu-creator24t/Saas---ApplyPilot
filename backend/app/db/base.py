from motor.motor_asyncio import AsyncIOMotorCollection

from app.db.connection import get_database


def get_collection(
    name: str,
) -> AsyncIOMotorCollection:
    """
    Return a MongoDB collection by name.
    """
    db = get_database()
    return db[name]


__all__ = [
    "get_database",
    "get_collection",
]