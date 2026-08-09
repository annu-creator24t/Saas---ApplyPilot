from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class ResumeRepository:

    @property
    def collection(self):
        return get_collection("resumes")

    # =====================================================
    # Helpers
    # =====================================================

    @staticmethod
    def _serialize_resume(
        resume: Optional[dict],
    ) -> Optional[dict]:
        if not resume:
            return None

        resume["resume_id"] = str(resume["_id"])
        del resume["_id"]

        return resume

    # =====================================================
    # Create Resume
    # =====================================================

    async def create_resume(
        self,
        data: dict[str, Any],
    ) -> str:
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    # =====================================================
    # Get Single Resume
    # =====================================================

    async def get_resume(
        self,
        resume_id: str,
    ) -> Optional[dict]:
        resume = await self.collection.find_one(
            {"_id": ObjectId(resume_id)}
        )

        return self._serialize_resume(resume)

    # =====================================================
    # Get User Resumes
    # =====================================================

    async def get_user_resumes(
        self,
        user_id: str,
    ) -> list[dict]:

        str_id = str(user_id)
        query: dict[str, Any] = {"user_id": str_id}
        if ObjectId.is_valid(str_id):
            query = {"$or": [{"user_id": str_id}, {"user_id": ObjectId(str_id)}]}

        cursor = (
            self.collection.find(query)
            .sort("created_at", -1)
        )

        resumes = await cursor.to_list(length=None)

        return [
            self._serialize_resume(resume)
            for resume in resumes
        ]

    # =====================================================
    # Rename Resume
    # =====================================================

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

    # =====================================================
    # Update ATS Analysis
    # =====================================================

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

    # =====================================================
    # Update Extracted Text
    # =====================================================

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

    # =====================================================
    # Delete Resume
    # =====================================================

    async def delete_resume(
        self,
        resume_id: str,
    ) -> bool:

        result = await self.collection.delete_one(
            {"_id": ObjectId(resume_id)}
        )

        return result.deleted_count > 0