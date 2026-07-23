from bson import ObjectId

from app.db.base import get_collection


class ResumeRepository:

    @property
    def collection(self):
        return get_collection("resumes")

    async def create_resume(self, data: dict):

        result = await self.collection.insert_one(data)

        return str(result.inserted_id)

    async def get_resume(self, resume_id: str):

        resume = await self.collection.find_one(
            {"_id": ObjectId(resume_id)}
        )

        return resume

    async def update_analysis(
        self,
        resume_id: str,
        analysis: dict,
    ):

        await self.collection.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "analysis": analysis,
                    "ats_score": analysis["ats_score"]
                }
            }
        )