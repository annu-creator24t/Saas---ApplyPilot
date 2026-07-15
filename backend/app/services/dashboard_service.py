from app.database.collections import (
    resume_collection,
    cover_letter_collection,
    interview_collection,
)


async def get_dashboard(user_id: str):

    total_resumes = await resume_collection.count_documents(
        {
            "user_id": user_id
        }
    )

    total_cover_letters = await cover_letter_collection.count_documents(
        {
            "user_id": user_id
        }
    )

    total_interviews = await interview_collection.count_documents(
        {
            "user_id": user_id
        }
    )

    recent_activity = []

    async for item in resume_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(5):

        recent_activity.append(
            {
                "type": "Resume Analysis",
                "created_at": item["created_at"],
            }
        )

    async for item in cover_letter_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(5):

        recent_activity.append(
            {
                "type": "Cover Letter",
                "created_at": item["created_at"],
            }
        )

    async for item in interview_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(5):

        recent_activity.append(
            {
                "type": "Interview",
                "created_at": item["created_at"],
            }
        )

    recent_activity.sort(
        key=lambda x: x["created_at"],
        reverse=True,
    )

    return {
        "stats": {
            "total_resumes": total_resumes,
            "total_cover_letters": total_cover_letters,
            "total_interviews": total_interviews,
        },
        "recent_activity": recent_activity[:10],
    }