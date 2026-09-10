from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class InterviewPracticeRepository:

    @property
    def collection(self):
        return get_collection(
            "interview_sessions"
        )

    async def create_session(
        self,
        data: dict[str, Any],
    ) -> str:

        result = await self.collection.insert_one(
            data
        )

        return str(result.inserted_id)

    async def get_session(
        self,
        session_id: str,
    ) -> Optional[dict]:
        try:
            return await self.collection.find_one(
                {
                    "_id": ObjectId(session_id)
                }
            )
        except Exception:
            return None

    async def update_session(
        self,
        session_id: str,
        data: dict[str, Any],
    ):
        try:
            await self.collection.update_one(
                {
                    "_id": ObjectId(session_id)
                },
                {
                    "$set": data
                },
            )
        except Exception:
            pass

    async def delete_session(
        self,
        session_id: str,
    ) -> bool:
        try:
            result = await self.collection.delete_one(
                {
                    "_id": ObjectId(session_id)
                }
            )
            return result.deleted_count > 0
        except Exception:
            return False

    async def get_user_sessions(
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