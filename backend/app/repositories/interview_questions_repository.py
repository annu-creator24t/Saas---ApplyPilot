from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class InterviewQuestionsRepository:

    @property
    def collection(self):
        return get_collection(
            "interview_questions"
        )

    async def create_questions(
        self,
        data: dict[str, Any],
    ) -> str:

        result = await self.collection.insert_one(
            data
        )

        return str(result.inserted_id)

    async def get_questions(
        self,
        interview_id: str,
    ) -> Optional[dict]:
        try:
            return await self.collection.find_one(
                {
                    "_id": ObjectId(interview_id)
                }
            )
        except Exception:
            return None

    async def get_user_questions(
        self,
        user_id: str,
    ) -> list[dict]:

        cursor = (
            self.collection.find(
                {
                    "user_id": user_id
                }
            )
            .sort(
                "created_at",
                -1,
            )
        )

        return await cursor.to_list(
            length=None
        )

    async def delete_questions(
        self,
        interview_id: str,
    ) -> bool:
        try:
            result = await self.collection.delete_one(
                {
                    "_id": ObjectId(interview_id)
                }
            )
            return result.deleted_count > 0
        except Exception:
            return False