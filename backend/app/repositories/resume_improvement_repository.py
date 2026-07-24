from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class ResumeImprovementRepository:

    @property
    def collection(self):
        return get_collection("resume_improvements")

    async def create_improvement(
        self,
        data: dict[str, Any],
    ) -> str:
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_improvement(
        self,
        improvement_id: str,
    ) -> Optional[dict]:
        return await self.collection.find_one(
            {"_id": ObjectId(improvement_id)}
        )

    async def get_user_improvements(
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

    async def delete_improvement(
        self,
        improvement_id: str,
    ) -> bool:
        result = await self.collection.delete_one(
            {"_id": ObjectId(improvement_id)}
        )

        return result.deleted_count > 0