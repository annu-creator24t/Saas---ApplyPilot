from datetime import datetime
from typing import Any, Dict, List
from app.db.connection import get_database
from app.schemas.common import APIResponse


class AdminService:

    async def get_system_statistics(self) -> APIResponse:
        """
        Calculates and returns system statistics for owner/admin dashboard.
        """
        db = get_database()

        # 1. Total Registered Users
        total_registered_users = await db["users"].count_documents({})

        # 2. Premium Users (Pro plan & Active status)
        premium_users = await db["users"].count_documents(
            {"subscription_plan": "pro", "subscription_status": "active"}
        )

        # 3. Free Users
        free_users = total_registered_users - premium_users

        # 4. Total Active / AI-using Users
        active_ai_users = await db["users"].count_documents(
            {
                "$or": [
                    {"free_usage_count": {"$gt": 0}},
                    {"subscription_plan": "pro"},
                ]
            }
        )

        # 5. Total AI Generations (Sum of free_usage_count across users + count of generated artifacts)
        pipeline = [
            {"$group": {"_id": None, "total_usage": {"$sum": "$free_usage_count"}}}
        ]
        aggregate_res = await db["users"].aggregate(pipeline).to_list(length=1)
        sum_usage = aggregate_res[0]["total_usage"] if aggregate_res else 0

        total_cover_letters = await db["cover_letters"].count_documents({})
        total_resume_improvements = await db["resume_improvements"].count_documents({})
        total_interview_questions = await db["interview_questions"].count_documents({})
        total_practice_sessions = await db["interview_practice"].count_documents({})

        total_ai_generations = max(
            sum_usage,
            total_cover_letters + total_resume_improvements + total_interview_questions + total_practice_sessions
        )

        # 6. Recent Users List (limit 20)
        users_cursor = db["users"].find(
            {},
            {
                "password": 0,
            }
        ).sort("created_at", -1).limit(20)
        
        now = datetime.utcnow()
        raw_users = await users_cursor.to_list(length=20)
        recent_users = []
        for u in raw_users:
            t_end = u.get("trial_ends_at")
            t_active = bool(t_end and t_end > now)
            recent_users.append(
                {
                    "user_id": str(u.get("_id")),
                    "full_name": u.get("full_name", "Anonymous"),
                    "email": u.get("email", ""),
                    "is_admin": u.get("is_admin", False),
                    "role": u.get("role", "user"),
                    "subscription_plan": u.get("subscription_plan", "free"),
                    "subscription_status": u.get("subscription_status", "free"),
                    "free_usage_count": u.get("free_usage_count", 0),
                    "trial_active": t_active,
                    "trial_ends_at": t_end.isoformat() if t_end else None,
                    "created_at": u.get("created_at").isoformat() if u.get("created_at") else None,
                }
            )

        # 7. Recent Payments List (limit 20)
        payments_cursor = db["payments"].find({}).sort("submitted_at", -1).limit(20)
        raw_payments = await payments_cursor.to_list(length=20)
        recent_payments = []
        for p in raw_payments:
            recent_payments.append(
                {
                    "payment_id": str(p.get("_id")),
                    "user_id": p.get("user_id"),
                    "user_email": p.get("user_email"),
                    "amount": p.get("amount", 99.0),
                    "currency": p.get("currency", "INR"),
                    "upi_reference": p.get("upi_reference", "N/A"),
                    "status": p.get("status", "pending"),
                    "submitted_at": p.get("submitted_at").isoformat() if p.get("submitted_at") else None,
                }
            )

        return APIResponse(
            message="Admin system statistics retrieved successfully.",
            data={
                "total_registered_users": total_registered_users,
                "total_active_ai_users": active_ai_users,
                "total_ai_generations": total_ai_generations,
                "free_users": free_users,
                "premium_users": premium_users,
                "recent_users": recent_users,
                "recent_payments": recent_payments,
            },
        )
