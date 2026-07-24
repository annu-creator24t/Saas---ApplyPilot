from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class ResumeRepository:

    @property
    def collection(self):
        return get_collection("resumes")

    async def create_resume(
        self,
        data: dict[str, Any],
    ) -> str:
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_resume(
        self,
        resume_id: str,
    ) -> Optional[dict]:
        return await self.collection.find_one(
            {"_id": ObjectId(resume_id)}
        )

    async def get_user_resumes(
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

    async def rename_resume(
        self,
        resume_id: str,
        title: str,
    ) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "title": title,
                }
            },
        )

        return result.modified_count > 0

    async def update_analysis(
        self,
        resume_id: str,
        analysis: dict[str, Any],
    ) -> None:
        await self.collection.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "analysis": analysis,
                    "ats_score": analysis.get("ats_score"),
                }
            },
        )

    async def update_extracted_text(
        self,
        resume_id: str,
        extracted_text: str,
    ) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "extracted_text": extracted_text,
                }
            },
        )

        return result.modified_count > 0

    async def delete_resume(
        self,
        resume_id: str,
    ) -> bool:
        result = await self.collection.delete_one(
            {"_id": ObjectId(resume_id)}
        )

        return result.deleted_count > 0