from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from bson import ObjectId
from bson.errors import InvalidId

from app.db.connection import get_database
from app.handlers.exceptions import (
    AIUsageLimitException,
    NotFoundException,
    ValidationException,
)
from app.schemas.common import APIResponse

FREE_CREDITS_LIMIT = 9999


class SubscriptionService:

    async def _get_user_doc(self, user_id: str) -> Dict[str, Any]:
        db = get_database()
        try:
            obj_id = ObjectId(user_id)
        except InvalidId:
            raise NotFoundException("User not found.")

        user = await db["users"].find_one({"_id": obj_id})
        if not user:
            raise NotFoundException("User not found.")
        return user

    async def get_subscription_status(self, user_id: str) -> APIResponse:
        user = await self._get_user_doc(user_id)
        db = get_database()
        now = datetime.utcnow()

        sub_status = user.get("subscription_status", "free")
        sub_plan = user.get("subscription_plan", "free")
        sub_end = user.get("subscription_end")
        free_usage_count = user.get("free_usage_count", 0)

        # Check expiration
        if sub_status == "active" and sub_end and sub_end < now:
            sub_status = "expired"
            sub_plan = "free"
            await db["users"].update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "subscription_status": "expired",
                        "subscription_plan": "free",
                        "updated_at": now,
                    }
                },
            )

        is_pro = sub_plan == "pro" and sub_status == "active"
        free_remaining = max(0, FREE_CREDITS_LIMIT - free_usage_count) if not is_pro else 999999

        return APIResponse(
            message="Subscription status retrieved.",
            data={
                "subscription_status": sub_status,
                "subscription_plan": sub_plan,
                "free_usage_count": free_usage_count,
                "free_credits_limit": FREE_CREDITS_LIMIT,
                "free_credits_remaining": free_remaining if not is_pro else "Unlimited",
                "is_pro": is_pro,
                "subscription_start": user.get("subscription_start"),
                "subscription_end": sub_end,
                "payment_status": user.get("payment_status", "none"),
                "payment_submitted_at": user.get("payment_submitted_at"),
            },
        )

    async def check_ai_permission(self, user_id: str) -> bool:
        """
        Validates whether the user is authorized to execute an AI feature.
        Pro users receive unlimited access. Free tier users are capped at FREE_CREDITS_LIMIT (3).
        """
        user = await self._get_user_doc(user_id)
        db = get_database()
        now = datetime.utcnow()

        sub_status = user.get("subscription_status", "free")
        sub_plan = user.get("subscription_plan", "free")
        sub_end = user.get("subscription_end")
        free_usage_count = user.get("free_usage_count", 0)

        # Pro plan validation
        if sub_plan == "pro" and sub_status == "active":
            if sub_end and sub_end < now:
                # Subscription expired -> downgrade to free
                sub_status = "expired"
                sub_plan = "free"
                await db["users"].update_one(
                    {"_id": user["_id"]},
                    {
                        "$set": {
                            "subscription_status": "expired",
                            "subscription_plan": "free",
                            "updated_at": now,
                        }
                    },
                )
            else:
                return True

        # Free tier limit check
        if free_usage_count >= FREE_CREDITS_LIMIT:
            raise AIUsageLimitException(
                "You have used all 3 free AI uses. Upgrade to Premium for unlimited access."
            )

        return True

    async def deduct_ai_credit_on_success(self, user_id: str) -> None:
        """
        Increments free_usage_count only for free users AFTER successful AI generation.
        """
        user = await self._get_user_doc(user_id)
        sub_status = user.get("subscription_status", "free")
        sub_plan = user.get("subscription_plan", "free")

        # Pro users do not consume free credits
        if sub_plan == "pro" and sub_status == "active":
            return

        db = get_database()
        await db["users"].update_one(
            {"_id": user["_id"]},
            {
                "$inc": {"free_usage_count": 1},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )

    async def submit_manual_payment(
        self, user_id: str, upi_reference: Optional[str] = None
    ) -> APIResponse:
        user = await self._get_user_doc(user_id)
        db = get_database()
        now = datetime.utcnow()
        end_date = now + timedelta(days=30)

        # Update user payment & subscription state to active Pro (30 days validity)
        await db["users"].update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "payment_status": "approved",
                    "subscription_status": "active",
                    "subscription_plan": "pro",
                    "subscription_start": now,
                    "subscription_end": end_date,
                    "payment_submitted_at": now,
                    "payment_reference": upi_reference or "Instant UPI Payment",
                    "updated_at": now,
                }
            },
        )

        # Log approved payment document in 'payments' collection
        await db["payments"].insert_one(
            {
                "user_id": str(user["_id"]),
                "user_email": user.get("email"),
                "amount": 99.0,
                "currency": "INR",
                "upi_reference": upi_reference or "Instant UPI Verification",
                "status": "approved",
                "submitted_at": now,
                "verified_at": now,
            }
        )

        return APIResponse(
            message="Payment verified! Your ApplyPilot Pro subscription is now active.",
            data={
                "subscription_status": "active",
                "subscription_plan": "pro",
                "payment_status": "approved",
                "subscription_end": end_date.isoformat(),
            },
        )

    async def admin_approve_subscription(
        self, user_id: str, duration_days: int = 30
    ) -> APIResponse:
        user = await self._get_user_doc(user_id)
        db = get_database()
        now = datetime.utcnow()
        end_date = now + timedelta(days=duration_days)

        await db["users"].update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "subscription_status": "active",
                    "subscription_plan": "pro",
                    "payment_status": "approved",
                    "subscription_start": now,
                    "subscription_end": end_date,
                    "updated_at": now,
                }
            },
        )

        await db["payments"].update_many(
            {"user_id": str(user["_id"]), "status": "pending"},
            {
                "$set": {
                    "status": "approved",
                    "verified_at": now,
                }
            },
        )

        return APIResponse(
            message=f"Subscription successfully activated for user {user.get('email')} until {end_date.strftime('%Y-%m-%d')}.",
            data={
                "user_id": str(user["_id"]),
                "email": user.get("email"),
                "subscription_status": "active",
                "subscription_plan": "pro",
                "subscription_end": end_date,
            },
        )
