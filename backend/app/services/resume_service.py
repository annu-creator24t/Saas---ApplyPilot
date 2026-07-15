from app.database.collections import resume_collection
from app.models.resume_analysis import ResumeAnalysis


async def save_resume_analysis(data: ResumeAnalysis):

    result = await resume_collection.insert_one(
        data.model_dump()
    )

    return str(result.inserted_id)

async def get_resume_history(user_id: str):

    cursor = resume_collection.find(
        {
            "user_id": user_id
        }
    ).sort("created_at", -1)

    history = []

    async for resume in cursor:

        history.append(
            {
                "id": str(resume["_id"]),
                "job_description": resume["job_description"],
                "analysis": resume["analysis"],
                "created_at": resume["created_at"],
            }
        )

    return history

from bson import ObjectId


async def get_resume_by_id(resume_id: str):

    resume = await resume_collection.find_one(
        {
            "_id": ObjectId(resume_id)
        }
    )

    if not resume:
        return None

    resume["id"] = str(resume["_id"])
    del resume["_id"]

    return resume


async def delete_resume(resume_id: str):

    result = await resume_collection.delete_one(
        {
            "_id": ObjectId(resume_id)
        }
    )

    return result.deleted_count > 0