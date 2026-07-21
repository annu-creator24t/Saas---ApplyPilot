from bson import ObjectId

from app.db.base import get_collection


class UserRepository:

    @property
    def collection(self):
        return get_collection("users")

    async def create_user(self, user: dict):
        result = await self.collection.insert_one(user)
        return str(result.inserted_id)

    async def get_user_by_email(self, email: str):
        return await self.collection.find_one({"email": email})

    async def get_user_by_id(self, user_id: str):
        return await self.collection.find_one(
            {"_id": ObjectId(user_id)}
        )

    async def update_user(self, user_id: str, data: dict):
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": data},
        )

    async def delete_user(self, user_id: str):
        await self.collection.delete_one(
            {"_id": ObjectId(user_id)}
        )