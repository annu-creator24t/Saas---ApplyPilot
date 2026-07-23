from app.db.connection import get_database


def get_collection(name: str):
    db = get_database()
    return db[name]


__all__ = [
    "get_database",
    "get_collection",
]