from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongodb():
    global client, database

    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        maxPoolSize=20,
        minPoolSize=5,
    )

    database = client[settings.DATABASE_NAME]

    await client.admin.command("ping")

    print("✅ MongoDB Connected")


async def close_mongodb_connection():
    global client

    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database is not initialized.")

    return database