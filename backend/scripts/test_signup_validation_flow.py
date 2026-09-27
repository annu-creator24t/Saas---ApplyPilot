import asyncio
import sys
import os
import uuid
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.connection import connect_to_mongodb, get_database, close_mongodb_connection
from app.main import app

async def test_complete_signup_verification():
    print("=" * 60)
    print("Testing ApplyPilot Signup / Registration & Login Verification Flow")
    print("=" * 60)

    await connect_to_mongodb()
    db = get_database()

    test_email = f"signup_test_{uuid.uuid4().hex[:6]}@example.com"
    test_password = "SecurePassword123!"

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", timeout=10.0) as client:
        # 1. Valid Registration
        print(f"\n[1] Testing valid user registration: {test_email}")
        reg_res = await client.post(
            "/auth/register",
            json={
                "full_name": "New Signup User",
                "email": test_email,
                "password": test_password,
            },
        )
        assert reg_res.status_code == 201, f"Expected 201, got {reg_res.status_code}: {reg_res.text}"
        user_id = reg_res.json()["data"]["user_id"]
        assert user_id, "Missing user_id in registration response"
        print(f"  [OK] Successfully registered user with ID: {user_id}")

        # 2. Duplicate Email Registration
        print("\n[2] Testing duplicate email registration (should fail)...")
        dup_res = await client.post(
            "/auth/register",
            json={
                "full_name": "Duplicate User",
                "email": test_email,
                "password": test_password,
            },
        )
        assert dup_res.status_code == 422, f"Expected 422, got {dup_res.status_code}: {dup_res.text}"
        print(f"  [OK] Duplicate email properly rejected with 422: {dup_res.json()}")

        # 3. Short Password (<8 chars)
        print("\n[3] Testing short password (<8 chars, should fail)...")
        short_pass_res = await client.post(
            "/auth/register",
            json={
                "full_name": "Short Pass User",
                "email": f"short_{uuid.uuid4().hex[:4]}@example.com",
                "password": "123",
            },
        )
        assert short_pass_res.status_code == 422, f"Expected 422, got {short_pass_res.status_code}: {short_pass_res.text}"
        print("  [OK] Short password properly rejected with 422")

        # 4. Invalid Email Format
        print("\n[4] Testing invalid email format (should fail)...")
        bad_email_res = await client.post(
            "/auth/register",
            json={
                "full_name": "Bad Email User",
                "email": "not-an-email",
                "password": test_password,
            },
        )
        assert bad_email_res.status_code == 422, f"Expected 422, got {bad_email_res.status_code}: {bad_email_res.text}"
        print("  [OK] Invalid email format properly rejected with 422")

        # 5. Login with newly registered user
        print("\n[5] Testing login with newly created account...")
        login_res = await client.post(
            "/auth/login",
            json={
                "email": test_email,
                "password": test_password,
            },
        )
        assert login_res.status_code == 200, f"Expected 200, got {login_res.status_code}: {login_res.text}"
        token = login_res.json()["data"]["access_token"]
        assert token, "Missing access_token"
        print("  [OK] Login successful, access token generated")

        # 6. Fetch /users/me Profile with Token
        print("\n[6] Testing profile retrieval (/users/me) for newly registered user...")
        profile_res = await client.get(
            "/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert profile_res.status_code == 200, f"Expected 200, got {profile_res.status_code}: {profile_res.text}"
        profile_data = profile_res.json()["data"]
        assert profile_data["email"] == test_email.lower()
        assert profile_data["full_name"] == "New Signup User"
        assert profile_data["trial_active"] == True
        print(f"  [OK] Profile retrieved successfully. Trial Active: {profile_data['trial_active']}")

        # Cleanup
        print("\n[7] Cleaning up test user...")
        from bson import ObjectId
        await db["users"].delete_one({"_id": ObjectId(user_id)})
        print("  [OK] Test user cleaned up.")

    await close_mongodb_connection()
    print("\n" + "=" * 60)
    print("ALL SIGNUP & VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_complete_signup_verification())
