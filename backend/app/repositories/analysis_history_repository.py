from app.db.base import get_collection


class AnalysisHistoryRepository:

    @property
    def collection(self):
        return get_collection("resumes")

    async def get_history(self, user_id: str):

        cursor = self.collection.find(
            {
                "user_id": user_id,
                "analysis": {"$ne": {}}
            }
        ).sort("created_at", -1)

        return await cursor.to_list(length=None)
