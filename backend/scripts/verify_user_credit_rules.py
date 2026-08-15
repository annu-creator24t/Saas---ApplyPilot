import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(env_path)

from motor.motor_asyncio import AsyncIOMotorClient
from app.db.connection import connect_to_mongodb, close_mongodb_connection, get_database
from app.services.subscription_service import SubscriptionService, FREE_CREDITS_LIMIT

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("DATABASE_NAME")

TARGET_EMAIL = "annu.tiwari.cs27@iilm.edu"


async def verify_and_apply():
    print("=" * 70)
    print(f"VERIFYING & APPLYING CREDIT RULES FOR: {TARGET_EMAIL}")
    print("=" * 70)

    await connect_to_mongodb()
    db = get_database()

    user = await db["users"].find_one({"email": TARGET_EMAIL})
    if not user:
        print(f"Error: User {TARGET_EMAIL} not found in database!")
        return

    print("Existing user record:")
    print(f"  ID: {user['_id']}")
    print(f"  Email: {user.get('email')}")
    print(f"  Plan: {user.get('subscription_plan')}")
    print(f"  Status: {user.get('subscription_status')}")
    print(f"  Usage count: {user.get('free_usage_count')}")

    # Set user account to strict free tier with 3 free credits
    await db["users"].update_one(
        {"email": TARGET_EMAIL},
        {
            "$set": {
                "subscription_plan": "free",
                "subscription_status": "free",
                "free_usage_count": 0,
                "payment_status": "none",
            },
            "$unset": {
                "subscription_start": "",
                "subscription_end": "",
            },
        },
    )

    user = await db["users"].find_one({"email": TARGET_EMAIL})
    user_id = str(user["_id"])

    sub_service = SubscriptionService()
    status_resp = await sub_service.get_subscription_status(user_id)
    print("\nSubscription status via SubscriptionService:")
    print(status_resp.data)

    assert status_resp.data["subscription_plan"] == "free"
    assert status_resp.data["is_pro"] is False
    assert status_resp.data["free_credits_limit"] == 3
    assert status_resp.data["free_usage_count"] == 0
    assert status_resp.data["free_credits_remaining"] == 3

    print("\nSimulating credit lifecycle...")
    # Permission check for 1st use
    can_use = await sub_service.check_ai_permission(user_id)
    assert can_use is True
    await sub_service.deduct_ai_credit_on_success(user_id)
    status_resp = await sub_service.get_subscription_status(user_id)
    print(f"  After use 1: Remaining credits = {status_resp.data['free_credits_remaining']}")
    assert status_resp.data["free_credits_remaining"] == 2

    # 2nd use
    await sub_service.check_ai_permission(user_id)
    await sub_service.deduct_ai_credit_on_success(user_id)
    status_resp = await sub_service.get_subscription_status(user_id)
    print(f"  After use 2: Remaining credits = {status_resp.data['free_credits_remaining']}")
    assert status_resp.data["free_credits_remaining"] == 1

    # 3rd use
    await sub_service.check_ai_permission(user_id)
    await sub_service.deduct_ai_credit_on_success(user_id)
    status_resp = await sub_service.get_subscription_status(user_id)
    print(f"  After use 3: Remaining credits = {status_resp.data['free_credits_remaining']}")
    assert status_resp.data["free_credits_remaining"] == 0

    # 4th use -> MUST RAISE AIUsageLimitException
    from app.handlers.exceptions import AIUsageLimitException

    blocked = False
    try:
        await sub_service.check_ai_permission(user_id)
    except AIUsageLimitException as e:
        blocked = True
        print(f"  4th use properly blocked with AIUsageLimitException: {e.message}")

    assert blocked is True, "4th AI generation was NOT blocked!"

    # Reset account back to 0 usage so the user has all 3 free credits available
    await db["users"].update_one(
        {"email": TARGET_EMAIL},
        {"$set": {"free_usage_count": 0}},
    )

    final_status = await sub_service.get_subscription_status(user_id)
    print("\nFinal verified status for user:")
    print(f"  Email: {TARGET_EMAIL}")
    print(f"  Plan: {final_status.data['subscription_plan']}")
    print(f"  Is Pro: {final_status.data['is_pro']}")
    print(f"  Credits Remaining: {final_status.data['free_credits_remaining']} / {final_status.data['free_credits_limit']}")
    print("=" * 70)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 70)

    await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(verify_and_apply())
