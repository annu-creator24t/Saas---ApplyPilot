from bson import ObjectId

from app.db.base import get_collection


class CoverLetterRepository:

    @property
    def collection(self):
        return get_collection("cover_letters")

    async def create_cover_letter(self, data: dict) -> str:
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_cover_letter(self, cover_letter_id: str):
        return await self.collection.find_one(
            {"_id": ObjectId(cover_letter_id)}
        )

    async def get_user_cover_letters(self, user_id: str):
        cursor = (
            self.collection.find({"user_id": user_id})
            .sort("created_at", -1)
        )

        return await cursor.to_list(length=None)

    async def delete_cover_letter(self, cover_letter_id: str):
        result = await self.collection.delete_one(
            {"_id": ObjectId(cover_letter_id)}
        )

        return result.deleted_count > 0