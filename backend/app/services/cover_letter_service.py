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