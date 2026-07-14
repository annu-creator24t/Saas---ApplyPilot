import os

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

print("=" * 60)
print("MONGODB_URL =", MONGODB_URL)
print("DATABASE_NAME =", DATABASE_NAME)
print("=" * 60)

client = AsyncIOMotorClient(MONGODB_URL)

database = client[DATABASE_NAME]