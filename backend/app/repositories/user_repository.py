from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class UserRepository:

    @property
    def collection(self):
        return get_collection("users")

    async def create_user(
        self,
        user: dict[str, Any],
    ) -> str:
        result = await self.collection.insert_one(user)
        return str(result.inserted_id)

    async def get_user_by_email(
        self,
        email: str,
    ) -> Optional[dict]:
        return await self.collection.find_one(
            {"email": email}
        )

    async def get_user_by_id(
        self,
        user_id: str,
    ) -> Optional[dict]:
        return await self.collection.find_one(
            {"_id": ObjectId(user_id)}
        )

    async def update_user(
        self,
        user_id: str,
        data: dict[str, Any],
    ) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": data,
            },
        )

        return result.modified_count > 0

    async def update_password(
        self,
        user_id: str,
        password: str,
    ) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "password": password,
                }
            },
        )

        return result.modified_count > 0

    async def delete_user(
        self,
        user_id: str,
    ) -> bool:
        result = await self.collection.delete_one(
            {"_id": ObjectId(user_id)}
        )

        return result.deleted_count > 0