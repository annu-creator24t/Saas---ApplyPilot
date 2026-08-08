from datetime import datetime
from typing import Any, List, Optional
from bson import ObjectId
from app.db.base import get_collection


class ApplicationRepository:

    @property
    def collection(self):
        return get_collection("applications")

    @staticmethod
    def _serialize_application(doc: Optional[dict]) -> Optional[dict]:
        if not doc:
            return None
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    async def create_application(self, data: dict[str, Any]) -> str:
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_application(self, application_id: str) -> Optional[dict]:
        try:
            doc = await self.collection.find_one({"_id": ObjectId(application_id)})
            return self._serialize_application(doc)
        except Exception:
            return None

    async def get_user_applications(
        self,
        user_id: str,
        status: Optional[str] = None,
        limit: int = 100,
    ) -> List[dict]:
        query: dict[str, Any] = {"user_id": user_id}
        if status:
            query["status"] = status

        cursor = self.collection.find(query).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize_application(doc) for doc in docs if doc]

    async def update_application(self, application_id: str, updates: dict[str, Any]) -> bool:
        try:
            updates["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"_id": ObjectId(application_id)},
                {"$set": updates},
            )
            return result.modified_count > 0
        except Exception:
            return False

    async def delete_application(self, application_id: str, user_id: str) -> bool:
        try:
            result = await self.collection.delete_one(
                {"_id": ObjectId(application_id), "user_id": user_id}
            )
            return result.deleted_count > 0
        except Exception:
            return False

    async def get_stats(self, user_id: str) -> dict[str, Any]:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
        results = await self.collection.aggregate(pipeline).to_list(length=20)
        stats = {
            "TOTAL": 0,
            "BOOKMARKED": 0,
            "APPLIED": 0,
            "INTERVIEWING": 0,
            "OFFER": 0,
            "REJECTED": 0,
        }
        for item in results:
            status_name = item["_id"]
            count = item["count"]
            if status_name in stats:
                stats[status_name] = count
            stats["TOTAL"] += count
        return stats
