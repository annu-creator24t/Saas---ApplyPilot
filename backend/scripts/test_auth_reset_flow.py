import asyncio
import sys
import os
import uuid
import httpx

# Add parent dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.connection import connect_to_mongodb, get_database, close_mongodb_connection
from app.main import app

async def test_auth_and_password_reset():
    print("=" * 60)
    print("Testing ApplyPilot Authentication & Password Reset Flow")
    print("=" * 60)

    # 1. Connect to DB for test user cleanup
    await connect_to_mongodb()
    db = get_database()

    test_email = f"test_reset_{uuid.uuid4().hex[:6]}@example.com"
    old_password = "OldPassword123!"
    new_password = "NewPassword123!"

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", timeout=10.0) as client:
        # Step 1: Register Test User
        print(f"\n[1] Registering test user: {test_email}")
        reg_res = await client.post(
            "/auth/register",
            json={
                "full_name": "Reset Test User",
                "email": test_email,
                "password": old_password,
            },
        )
        assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
        print("  [OK] User registered successfully (201 Created)")

        # Step 2: Login with Old Password (Should Succeed)
        print("\n[2] Logging in with initial password...")
        login_res = await client.post(
            "/auth/login",
            json={
                "email": test_email,
                "password": old_password,
            },
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["data"]["access_token"]
        assert token, "Access token missing"
        print("  [OK] Login successful with initial password (200 OK)")

        # Step 3: Request Password Reset - Invalid Email
        print("\n[3] Requesting password reset for non-existent email...")
        invalid_reset_req = await client.post(
            "/auth/forgot-password",
            json={"email": "non_existent_user_99999@example.com"},
        )
        assert invalid_reset_req.status_code == 404, f"Expected 404, got {invalid_reset_req.status_code}: {invalid_reset_req.text}"
        print("  [OK] Non-existent email properly rejected with 404 Not Found")

        # Step 4: Request Password Reset - Valid Email
        print(f"\n[4] Requesting password reset for valid email ({test_email})...")
        forgot_res = await client.post(
            "/auth/forgot-password",
            json={"email": test_email},
        )
        assert forgot_res.status_code == 200, f"Forgot password failed: {forgot_res.text}"
        reset_code = forgot_res.json()["data"]["reset_code"]
        assert reset_code, "Reset code not returned in response"
        print(f"  [OK] Reset code generated successfully: {reset_code} (200 OK)")

        # Step 5: Reset Password - Invalid Code
        print("\n[5] Attempting password reset with invalid code '000000'...")
        bad_reset_res = await client.post(
            "/auth/reset-password",
            json={
                "email": test_email,
                "reset_code": "000000",
                "new_password": new_password,
            },
        )
        assert bad_reset_res.status_code == 422, f"Expected 422, got {bad_reset_res.status_code}: {bad_reset_res.text}"
        print("  [OK] Invalid reset code properly rejected with 422 Validation Error")

        # Step 6: Reset Password - Valid Code
        print(f"\n[6] Resetting password with valid code ({reset_code})...")
        valid_reset_res = await client.post(
            "/auth/reset-password",
            json={
                "email": test_email,
                "reset_code": reset_code,
                "new_password": new_password,
            },
        )
        assert valid_reset_res.status_code == 200, f"Reset password failed: {valid_reset_res.text}"
        print("  [OK] Password reset successfully (200 OK)")

        # Step 7: Attempt Login with Old Password (Should Fail)
        print("\n[7] Attempting login with OLD password...")
        old_login_res = await client.post(
            "/auth/login",
            json={
                "email": test_email,
                "password": old_password,
            },
        )
        assert old_login_res.status_code == 401, f"Expected 401, got {old_login_res.status_code}: {old_login_res.text}"
        print("  [OK] Old password login rejected with 401 Unauthorized")

        # Step 8: Login with NEW Password (Should Succeed)
        print("\n[8] Logging in with NEW password...")
        new_login_res = await client.post(
            "/auth/login",
            json={
                "email": test_email,
                "password": new_password,
            },
        )
        assert new_login_res.status_code == 200, f"New password login failed: {new_login_res.text}"
        new_token = new_login_res.json()["data"]["access_token"]
        assert new_token, "New access token missing"
        print("  [OK] Login with NEW password successful (200 OK)")

        # Step 9: Re-using the same reset code (Should Fail as it was invalidated)
        print("\n[9] Attempting to re-use reset code...")
        reuse_res = await client.post(
            "/auth/reset-password",
            json={
                "email": test_email,
                "reset_code": reset_code,
                "new_password": "AnotherPassword123!",
            },
        )
        assert reuse_res.status_code == 422, f"Expected 422, got {reuse_res.status_code}: {reuse_res.text}"
        print("  [OK] Re-use of consumed reset code properly rejected with 422 Validation Error")

        # Cleanup Test User
        print("\n[10] Cleaning up test user...")
        await db["users"].delete_one({"email": test_email})
        print("  [OK] Test user removed from database")

    await close_mongodb_connection()
    print("\n" + "=" * 60)
    print("ALL AUTHENTICATION & PASSWORD RESET TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_auth_and_password_reset())
