from app.db.connection import get_database


def get_collection(name: str):
    db = get_database()
    return db[name]