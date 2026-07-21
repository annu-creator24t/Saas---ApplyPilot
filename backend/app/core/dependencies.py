from app.db.connection import get_database


async def get_db():
    return get_database()