from app.db.base import get_collection


class ResumeRepository:

    @property
    def collection(self):
        return get_collection("resumes")

    async def create_resume(self, data: dict):

        result = await self.collection.insert_one(data)

        return str(result.inserted_id)