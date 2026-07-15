from app.database.collections import cover_letter_collection
from app.models.cover_letter import CoverLetter


async def save_cover_letter(data: CoverLetter):

    result = await cover_letter_collection.insert_one(
        data.model_dump()
    )

    return str(result.inserted_id)


async def get_cover_letter_history(user_id: str):

    cursor = cover_letter_collection.find(
        {
            "user_id": user_id
        }
    ).sort("created_at", -1)

    history = []

    async for item in cursor:

        history.append(
            {
                "id": str(item["_id"]),
                "job_description": item["job_description"],
                "cover_letter": item["cover_letter"],
                "created_at": item["created_at"],
            }
        )

    return history

from bson import ObjectId


async def get_cover_letter_by_id(cover_letter_id: str):

    cover_letter = await cover_letter_collection.find_one(
        {
            "_id": ObjectId(cover_letter_id)
        }
    )

    if not cover_letter:
        return None

    cover_letter["id"] = str(cover_letter["_id"])
    del cover_letter["_id"]

    return cover_letter


async def delete_cover_letter(cover_letter_id: str):

    result = await cover_letter_collection.delete_one(
        {
            "_id": ObjectId(cover_letter_id)
        }
    )

    return result.deleted_count > 0