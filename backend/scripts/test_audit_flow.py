import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(env_path)

import httpx
from app.main import app
from app.db.connection import connect_to_mongodb, close_mongodb_connection, get_database


async def run_tests():
    print("=" * 70)
    print("APPLYPILOT BACKEND END-TO-END AUDIT & VERIFICATION SUITE")
    print("=" * 70)

    await connect_to_mongodb()
    db = get_database()

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        resp = await client.get("/health")
        print(f"[TEST 1] GET /health -> Status: {resp.status_code}")
        assert resp.status_code == 200, "Health check failed!"

        # Create test user 1
        email_user1 = f"test_user1_{os.urandom(4).hex()}@example.com"
        password = "Password123!"

        reg_resp1 = await client.post("/auth/register", json={
            "full_name": "Audit User 1",
            "email": email_user1,
            "password": password
        })
        print(f"[TEST 2] Register User 1 ({email_user1}) -> Status: {reg_resp1.status_code}")
        assert reg_resp1.status_code in (200, 201), "Register failed!"

        login_resp1 = await client.post("/auth/login", json={"email": email_user1, "password": password})
        token1 = login_resp1.json()["data"]["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}

        # Create test user 2 (for unauthorized access check)
        email_user2 = f"test_user2_{os.urandom(4).hex()}@example.com"
        reg_resp2 = await client.post("/auth/register", json={
            "full_name": "Audit User 2",
            "email": email_user2,
            "password": password
        })
        login_resp2 = await client.post("/auth/login", json={"email": email_user2, "password": password})
        token2 = login_resp2.json()["data"]["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # 2. Upload Resume for User 1
        valid_pdf_content = (
            b"%PDF-1.4\n"
            b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
            b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n"
            b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
        )
        files = {"file": ("test_resume.pdf", valid_pdf_content, "application/pdf")}

        upload_resp = await client.post("/resume/upload", headers=headers1, files=files)
        print(f"[TEST 3] Upload Resume for User 1 -> Status: {upload_resp.status_code}")
        assert upload_resp.status_code in (200, 201), f"Upload failed: {upload_resp.text}"

        resume_data = upload_resp.json()["data"]
        resume_id = resume_data["resume_id"]
        print(f"         Resume ID created: {resume_id}")

        # 3. Test Download Endpoint for User 1 (Authorized owner)
        dl_resp = await client.get(f"/resume/{resume_id}/download", headers=headers1)
        print(f"[TEST 4] Download Resume as Owner -> Status: {dl_resp.status_code}")
        print(f"         Content-Disposition: {dl_resp.headers.get('content-disposition')}")
        assert dl_resp.status_code == 200, "Download as owner failed!"
        assert "attachment" in dl_resp.headers.get("content-disposition", ""), "Missing Content-Disposition header!"

        # 4. Test Download Endpoint for User 2 (Unauthorized user)
        dl_resp_unauth = await client.get(f"/resume/{resume_id}/download", headers=headers2)
        print(f"[TEST 5] Download Resume as User 2 (Unauthorized) -> Status: {dl_resp_unauth.status_code}")
        assert dl_resp_unauth.status_code in (403, 401, 404), f"Security flaw! Unauthorized user could download! Status: {dl_resp_unauth.status_code}"
        print("         SECURITY PASSED: Unauthorized user cannot download another user's resume.")

        # 5. Test Subscription Status
        sub_resp = await client.get("/subscription/status", headers=headers1)
        print(f"[TEST 6] Subscription Status -> Data: {sub_resp.json()['data']}")
        assert sub_resp.json()["data"]["free_credits_remaining"] == 3, "Initial free credits should be 3"

        # Clean up test database users
        await db["users"].delete_many({"email": {"$in": [email_user1, email_user2]}})
        await db["resumes"].delete_many({"resume_id": resume_id})

    await close_mongodb_connection()
    print("=" * 70)
    print("ALL BACKEND AUDIT TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_tests())
