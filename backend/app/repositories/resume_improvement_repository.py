from bson import ObjectId

from app.db.base import get_collection


class ResumeImprovementRepository:

    @property
    def collection(self):
        return get_collection("resume_improvements")

    async def create_improvement(self, data: dict):
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_improvement(self, improvement_id: str):
        return await self.collection.find_one(
            {"_id": ObjectId(improvement_id)}
        )

    async def get_user_improvements(self, user_id: str):
        cursor = self.collection.find(
            {"user_id": user_id}
        )
        return await cursor.to_list(length=100)

    async def delete_improvement(self, improvement_id: str):
        return await self.collection.delete_one(
            {"_id": ObjectId(improvement_id)}
        )