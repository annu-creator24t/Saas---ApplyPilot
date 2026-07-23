from bson import ObjectId

from app.db.base import get_collection


class DashboardRepository:

    @property
    def collection(self):
        return get_collection("resumes")

    async def get_total_resumes(self, user_id: str):
        return await self.collection.count_documents(
            {"user_id": user_id}
        )

    async def get_total_analyses(self, user_id: str):
        return await self.collection.count_documents(
            {
                "user_id": user_id,
                "analysis": {"$ne": {}}
            }
        )

    async def get_latest_resume(self, user_id: str):
        return await self.collection.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )

    async def get_latest_analysis(self, user_id: str):
        return await self.collection.find_one(
            {
                "user_id": user_id,
                "analysis": {"$ne": {}}
            },
            sort=[("created_at", -1)]
        )

    async def get_all_scores(self, user_id: str):
        cursor = self.collection.find(
            {
                "user_id": user_id,
                "ats_score": {"$ne": None}
            },
            {
                "ats_score": 1
            }
        )

        return await cursor.to_list(length=None)