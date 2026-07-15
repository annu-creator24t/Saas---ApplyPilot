from app.database.collections import interview_collection
from app.models.interview import Interview


async def save_interview(data: Interview):

    result = await interview_collection.insert_one(
        data.model_dump()
    )

    return str(result.inserted_id)


async def get_interview_history(user_id: str):

    cursor = interview_collection.find(
        {
            "user_id": user_id
        }
    ).sort("created_at", -1)

    history = []

    async for interview in cursor:

        history.append(
            {
                "id": str(interview["_id"]),
                "job_description": interview["job_description"],
                "questions": interview["questions"],
                "created_at": interview["created_at"],
            }
        )

    return history

from bson import ObjectId


async def get_interview_by_id(interview_id: str):

    interview = await interview_collection.find_one(
        {
            "_id": ObjectId(interview_id)
        }
    )

    if not interview:
        return None

    interview["id"] = str(interview["_id"])
    del interview["_id"]

    return interview


async def delete_interview(interview_id: str):

    result = await interview_collection.delete_one(
        {
            "_id": ObjectId(interview_id)
        }
    )

    return result.deleted_count > 0