from bson import ObjectId

from app.database.collections import users_collection


async def get_user_by_id(user_id: str):

    user = await users_collection.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }