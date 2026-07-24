from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logger import logger

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongodb() -> None:
    global client, database

    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        maxPoolSize=20,
        minPoolSize=5,
    )

    database = client[settings.DATABASE_NAME]

    await client.admin.command("ping")

    logger.info("MongoDB connected successfully.")


async def close_mongodb_connection() -> None:
    global client, database

    if client is not None:
        client.close()
        client = None
        database = None

        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database is not initialized.")

    return database