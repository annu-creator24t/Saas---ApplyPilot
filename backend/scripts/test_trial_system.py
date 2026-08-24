import asyncio
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(env_path)

from app.db.connection import connect_to_mongodb, close_mongodb_connection, get_database
from app.services.user_service import UserService
from app.services.subscription_service import SubscriptionService
from app.schemas.user import UserCreate
from app.handlers.exceptions import AIUsageLimitException


async def run_trial_system_tests():
    print("=" * 80)
    print("APPLYPILOT 10-DAY FREE TRIAL SYSTEM COMPREHENSIVE TEST SUITE")
    print("=" * 80)

    await connect_to_mongodb()
    db = get_database()

    user_service = UserService()
    sub_service = SubscriptionService()

    # -------------------------------------------------------------
    # TEST 1: New User Registration & 10-Day Trial Initialization
    # -------------------------------------------------------------
    print("\n[TEST 1] Creating a brand new user and verifying 10-day trial initialization...")
    unique_suffix = os.urandom(4).hex()
    test_email = f"trial_user_{unique_suffix}@example.com"
    test_password = "SecurePassword123!"

    new_user_req = UserCreate(
        full_name="Trial Test User",
        email=test_email,
        password=test_password,
    )

    reg_resp = await user_service.register_user(new_user_req)
    user_id = reg_resp.data["user_id"]
    print(f"  User registered successfully with ID: {user_id}")

    # Check MongoDB document directly
    user_doc = await user_service.repository.get_user_by_id(user_id)
    assert user_doc is not None, "User doc not found in DB"
    assert user_doc.get("trial_active") is True, "trial_active should be True on registration"
    assert user_doc.get("trial_started_at") is not None, "trial_started_at must be set"
    assert user_doc.get("trial_ends_at") is not None, "trial_ends_at must be set"
    
    time_diff = (user_doc["trial_ends_at"] - user_doc["trial_started_at"]).total_seconds()
    # 10 days = 864,000 seconds
    assert 863900 <= time_diff <= 864100, f"Trial duration should be exactly 10 days, got {time_diff}s"
    print(f"  DB record confirmed: trial_active=True, duration=10 days from {user_doc['trial_started_at']} to {user_doc['trial_ends_at']}")

    # Check profile API response
    profile_resp = await user_service.get_profile(user_id)
    assert profile_resp.data["trial_active"] is True
    assert profile_resp.data["trial_days_remaining"] == 10
    print(f"  Profile API returned: trial_active={profile_resp.data['trial_active']}, days_remaining={profile_resp.data['trial_days_remaining']}")

    # -------------------------------------------------------------
    # TEST 2: Active Trial Access & Unlimited AI without Credit Deduction
    # -------------------------------------------------------------
    print("\n[TEST 2] Verifying active trial grants Pro-level access without consuming free credits...")
    status_resp = await sub_service.get_subscription_status(user_id)
    print(f"  Status response: trial_active={status_resp.data['trial_active']}, credits_remaining={status_resp.data['free_credits_remaining']}")
    assert status_resp.data["trial_active"] is True
    assert status_resp.data["trial_days_remaining"] == 10
    assert status_resp.data["free_credits_remaining"] == "Unlimited"

    # Simulate 5 AI generations during trial
    print("  Simulating 5 AI generations during active trial period...")
    for i in range(1, 6):
        allowed = await sub_service.check_ai_permission(user_id)
        assert allowed is True, f"AI generation #{i} should be allowed during active trial"
        await sub_service.deduct_ai_credit_on_success(user_id)

    # Re-verify credits were NOT consumed
    status_after = await sub_service.get_subscription_status(user_id)
    assert status_after.data["free_usage_count"] == 0, f"free_usage_count should be 0, got {status_after.data['free_usage_count']}"
    assert status_after.data["free_credits_remaining"] == "Unlimited"
    print("  Verified: 5 AI generations executed successfully with 0 credit deduction! free_usage_count is still 0.")

    # -------------------------------------------------------------
    # TEST 3: Expired Trial Restores Existing Freemium Limits
    # -------------------------------------------------------------
    print("\n[TEST 3] Simulating trial expiration and verifying fallback to 3 free credits...")
    # Set trial_ends_at to 1 hour in the past
    past_time = datetime.utcnow() - timedelta(hours=1)
    await db["users"].update_one(
        {"_id": user_doc["_id"]},
        {"$set": {"trial_ends_at": past_time, "trial_active": False}},
    )

    expired_status = await sub_service.get_subscription_status(user_id)
    print(f"  Expired trial status: trial_active={expired_status.data['trial_active']}, days_remaining={expired_status.data['trial_days_remaining']}, credits_remaining={expired_status.data['free_credits_remaining']}")
    assert expired_status.data["trial_active"] is False
    assert expired_status.data["trial_days_remaining"] == 0
    assert expired_status.data["free_credits_remaining"] == 3

    # Now verify 3 free credits usage and 4th use blocking
    print("  Testing 3 free credits on expired trial...")
    for i in range(1, 4):
        await sub_service.check_ai_permission(user_id)
        await sub_service.deduct_ai_credit_on_success(user_id)
        cur = await sub_service.get_subscription_status(user_id)
        assert cur.data["free_usage_count"] == i
        assert cur.data["free_credits_remaining"] == 3 - i
        print(f"    Use {i}/3 successful. Remaining credits: {cur.data['free_credits_remaining']}")

    # 4th use must raise AIUsageLimitException
    blocked = False
    try:
        await sub_service.check_ai_permission(user_id)
    except AIUsageLimitException as e:
        blocked = True
        print(f"  4th use properly blocked with AIUsageLimitException: '{e.message}'")
    assert blocked is True, "4th AI generation MUST be blocked when trial expired and 3 credits used!"

    # -------------------------------------------------------------
    # TEST 4: Paid Pro Subscription Overrides Expired Trial
    # -------------------------------------------------------------
    print("\n[TEST 4] Upgrading expired user to Pro subscription...")
    pay_resp = await sub_service.submit_manual_payment(user_id, upi_reference="UPI_TRIAL_TEST_99")
    assert pay_resp.data["subscription_plan"] == "pro"
    assert pay_resp.data["subscription_status"] == "active"

    pro_status = await sub_service.get_subscription_status(user_id)
    assert pro_status.data["is_pro"] is True
    assert pro_status.data["free_credits_remaining"] == "Unlimited"
    
    # Pro user should be allowed unlimited AI
    allowed_pro = await sub_service.check_ai_permission(user_id)
    assert allowed_pro is True
    print("  Pro subscription upgrade successful. User has unlimited access restored.")

    # -------------------------------------------------------------
    # Clean up test user
    # -------------------------------------------------------------
    await db["users"].delete_one({"_id": user_doc["_id"]})
    await db["payments"].delete_many({"user_id": user_id})

    await close_mongodb_connection()
    print("\n" + "=" * 80)
    print("ALL 10-DAY FREE TRIAL SYSTEM TESTS PASSED PERFECTLY!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_trial_system_tests())
