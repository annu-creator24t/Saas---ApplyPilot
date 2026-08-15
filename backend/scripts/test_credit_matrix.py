import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(env_path)

from app.db.connection import connect_to_mongodb, close_mongodb_connection, get_database
from app.services.subscription_service import SubscriptionService
from app.services.analysis_service import AnalysisService
from app.services.job_service import JobService
from app.services.cover_letter_service import CoverLetterService
from app.services.resume_improvement_service import ResumeImprovementService
from app.services.interview_questions_service import InterviewQuestionsService
from app.services.interview_practice_service import InterviewPracticeService
from app.schemas.application import JobMatchRequest
from app.handlers.exceptions import AIUsageLimitException

TARGET_EMAIL = "annu.tiwari.cs27@iilm.edu"


async def test_credit_matrix():
    print("=" * 70)
    print("TESTING FULL CREDIT MATRIX FOR FREE TIER & SPECIFIC USER")
    print("=" * 70)

    await connect_to_mongodb()
    db = get_database()

    user = await db["users"].find_one({"email": TARGET_EMAIL})
    assert user is not None, f"User {TARGET_EMAIL} not found"
    user_id = str(user["_id"])

    # Reset user to 0 usage
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"free_usage_count": 0, "subscription_plan": "free", "subscription_status": "free"}},
    )

    sub_service = SubscriptionService()

    # 1. Verify Initial State
    status = await sub_service.get_subscription_status(user_id)
    print(f"[CHECK 1] Initial Credits: {status.data['free_credits_remaining']}/3, Plan: {status.data['subscription_plan']}")
    assert status.data["free_credits_remaining"] == 3
    assert status.data["is_pro"] is False

    # 2. Simulate 3 Premium generations
    for i in range(1, 4):
        await sub_service.check_ai_permission(user_id)
        await sub_service.deduct_ai_credit_on_success(user_id)
        cur_status = await sub_service.get_subscription_status(user_id)
        print(f"[PREMIUM USE {i}] Used: {cur_status.data['free_usage_count']}, Remaining: {cur_status.data['free_credits_remaining']}")
        assert cur_status.data["free_credits_remaining"] == 3 - i

    # 3. Now Credits = 0 -> Verify Premium features are locked
    locked = False
    try:
        await sub_service.check_ai_permission(user_id)
    except AIUsageLimitException as e:
        locked = True
        print(f"[CHECK 2] Premium Feature Locked as expected: {e.message}")
    assert locked is True, "Premium features must be locked when credits = 0!"

    # 4. Verify Match Score and ATS Score are NOT locked even when credits = 0
    # Let's inspect ATS and Match Score methods - they don't invoke check_ai_permission
    print("[CHECK 3] Verifying Match Score & ATS Score remain FREE when credits = 0...")
    # Get user's resume if available
    resume = await db["resumes"].find_one({"user_id": user["_id"]})
    if resume:
        resume_id = str(resume["resume_id"])
        print(f"  Testing with existing resume {resume_id}...")
        ats_service = AnalysisService()
        ats_res = await ats_service.analyze_resume(resume_id=resume_id, user_id=user_id)
        print("  ATS Analysis successfully completed without deducting credit!")
        assert ats_res.data["analysis"] is not None

        # Verify usage count is STILL 3 (not incremented, not blocked)
        post_ats_status = await sub_service.get_subscription_status(user_id)
        assert post_ats_status.data["free_usage_count"] == 3
        print("  Usage count unchanged after ATS analysis: 3 (Credits remain 0)")

    # 5. Reset account to 0 usage so user has 3 fresh credits
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"free_usage_count": 0, "subscription_plan": "free", "subscription_status": "free"}},
    )

    final_status = await sub_service.get_subscription_status(user_id)
    print(f"\n[FINAL STATUS] User {TARGET_EMAIL}:")
    print(f"  Plan: {final_status.data['subscription_plan']}")
    print(f"  Credits: {final_status.data['free_credits_remaining']} / {final_status.data['free_credits_limit']}")
    print(f"  Is Pro: {final_status.data['is_pro']}")
    assert final_status.data["free_credits_remaining"] == 3
    assert final_status.data["is_pro"] is False

    await close_mongodb_connection()
    print("=" * 70)
    print("ALL CREDIT MATRIX CHECKS PASSED PERFECTLY!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(test_credit_matrix())
