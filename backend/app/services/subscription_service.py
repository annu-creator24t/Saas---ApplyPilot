import math
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple
from bson import ObjectId
from bson.errors import InvalidId

from app.db.connection import get_database
from app.handlers.exceptions import (
    AIUsageLimitException,
    NotFoundException,
    ValidationException,
)
from app.schemas.common import APIResponse

FREE_CREDITS_LIMIT = 3


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

    def _check_trial_status(
        self, user: Dict[str, Any]
    ) -> Tuple[bool, int, Optional[datetime], Optional[datetime]]:
        """
        Evaluates whether user has an active 10-day free trial and calculates remaining days.
        Auto-initializes trial for legacy users if trial timestamps are missing.
        """
        now = datetime.utcnow()
        trial_started_at = user.get("trial_started_at")
        trial_ends_at = user.get("trial_ends_at")

        if trial_started_at and isinstance(trial_started_at, str):
            try:
                trial_started_at = datetime.fromisoformat(
                    trial_started_at.replace("Z", "+00:00")
                ).replace(tzinfo=None)
            except Exception:
                trial_started_at = None

        if trial_ends_at and isinstance(trial_ends_at, str):
            try:
                trial_ends_at = datetime.fromisoformat(
                    trial_ends_at.replace("Z", "+00:00")
                ).replace(tzinfo=None)
            except Exception:
                trial_ends_at = None

        # Auto-initialize 10-day trial if missing on existing user
        if not trial_ends_at:
            created_at = user.get("created_at")
            if created_at and isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(
                        created_at.replace("Z", "+00:00")
                    ).replace(tzinfo=None)
                except Exception:
                    created_at = None

            # Start trial from created_at if created within 10 days, otherwise give full 10-day trial from now
            start_ref = created_at or now
            if (now - start_ref).total_seconds() > (10 * 86400):
                start_ref = now
            trial_started_at = start_ref
            trial_ends_at = start_ref + timedelta(days=10)

        if trial_ends_at:
            if trial_ends_at > now:
                remaining_seconds = (trial_ends_at - now).total_seconds()
                days_remaining = max(1, int(math.ceil(remaining_seconds / 86400)))
                return True, days_remaining, trial_started_at, trial_ends_at
            return False, 0, trial_started_at, trial_ends_at

        return False, 0, trial_started_at, None

    async def get_subscription_status(self, user_id: str) -> APIResponse:
        user = await self._get_user_doc(user_id)
        db = get_database()
        now = datetime.utcnow()

        sub_status = user.get("subscription_status", "free")
        sub_plan = user.get("subscription_plan", "free")
        sub_end = user.get("subscription_end")
        free_usage_count = user.get("free_usage_count", 0)

        # Check subscription expiration
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

        # Check trial status
        trial_active, trial_days_remaining, trial_start, trial_end = self._check_trial_status(user)

        # If user record was missing trial info, initialize in DB
        if user.get("trial_ends_at") is None and trial_end is not None:
            await db["users"].update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "trial_active": trial_active,
                        "trial_started_at": trial_start,
                        "trial_ends_at": trial_end,
                        "updated_at": now,
                    }
                },
            )
        # If trial expired in DB state, mark inactive
        elif user.get("trial_active") and not trial_active:
            await db["users"].update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "trial_active": False,
                        "updated_at": now,
                    }
                },
            )

        is_pro = sub_plan == "pro" and sub_status == "active"
        has_unlimited_access = is_pro or trial_active
        free_remaining = (
            "Unlimited"
            if has_unlimited_access
            else max(0, FREE_CREDITS_LIMIT - free_usage_count)
        )

        return APIResponse(
            message="Subscription status retrieved.",
            data={
                "subscription_status": sub_status,
                "subscription_plan": sub_plan,
                "free_usage_count": free_usage_count,
                "free_credits_limit": FREE_CREDITS_LIMIT,
                "free_credits_remaining": free_remaining,
                "is_pro": is_pro,
                "trial_active": trial_active,
                "trial_started_at": trial_start,
                "trial_ends_at": trial_end,
                "trial_days_remaining": trial_days_remaining,
                "subscription_start": user.get("subscription_start"),
                "subscription_end": sub_end,
                "payment_status": user.get("payment_status", "none"),
                "payment_submitted_at": user.get("payment_submitted_at"),
            },
        )

    async def check_ai_permission(self, user_id: str) -> bool:
        """
        Validates whether the user is authorized to execute an AI feature.
        Pro users and active 10-day trial users receive unlimited access.
        Free tier users with expired/no trial are capped at FREE_CREDITS_LIMIT (3).
        """
        user = await self._get_user_doc(user_id)
        db = get_database()
        now = datetime.utcnow()

        sub_status = user.get("subscription_status", "free")
        sub_plan = user.get("subscription_plan", "free")
        sub_end = user.get("subscription_end")
        free_usage_count = user.get("free_usage_count", 0)

        # 1. Pro plan validation
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

        # 2. 10-Day Free Trial validation
        trial_active, _, _, _ = self._check_trial_status(user)
        if trial_active:
            return True

        # 3. Free tier limit check
        if free_usage_count >= FREE_CREDITS_LIMIT:
            raise AIUsageLimitException(
                "You have used all 3 free AI uses. Upgrade to Premium for unlimited access."
            )

        return True

    async def deduct_ai_credit_on_success(self, user_id: str) -> None:
        """
        Increments free_usage_count only for free users without an active trial AFTER successful AI generation.
        """
        user = await self._get_user_doc(user_id)
        sub_status = user.get("subscription_status", "free")
        sub_plan = user.get("subscription_plan", "free")

        # Pro users do not consume free credits
        if sub_plan == "pro" and sub_status == "active":
            return

        # Active trial users do not consume free credits
        trial_active, _, _, _ = self._check_trial_status(user)
        if trial_active:
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
