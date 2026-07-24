from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class InterviewRepository:

    @property
    def collection(self):
        return get_collection("interviews")

    async def create_interview(
        self,
        data: dict[str, Any],
    ) -> str:
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_interview(
        self,
        interview_id: str,
    ) -> Optional[dict]:
        return await self.collection.find_one(
            {"_id": ObjectId(interview_id)}
        )

    async def get_user_interviews(
        self,
        user_id: str,
    ) -> list[dict]:
        cursor = (
            self.collection.find(
                {"user_id": user_id}
            )
            .sort("created_at", -1)
        )

        return await cursor.to_list(length=None)

    async def delete_interview(
        self,
        interview_id: str,
    ) -> bool:
        result = await self.collection.delete_one(
            {"_id": ObjectId(interview_id)}
        )

        return result.deleted_count > 0