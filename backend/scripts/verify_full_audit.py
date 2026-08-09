import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
from app.main import app
from app.db.connection import connect_to_mongodb, close_mongodb_connection, get_database


async def run_full_audit():
    print("=" * 80)
    print("APPLYPILOT FULL WORKFLOW & SECURITY AUDIT SUITE")
    print("=" * 80)

    await connect_to_mongodb()
    db = get_database()

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        resp = await client.get("/health")
        print(f"[STEP 1] GET /health -> Status: {resp.status_code}")
        assert resp.status_code == 200

        # 2. Signup User A & User B
        email_a = f"audit_user_a_{os.urandom(4).hex()}@example.com"
        email_b = f"audit_user_b_{os.urandom(4).hex()}@example.com"
        password = "SecurePassword123!"

        reg_a = await client.post("/auth/register", json={"full_name": "Audit User A", "email": email_a, "password": password})
        reg_b = await client.post("/auth/register", json={"full_name": "Audit User B", "email": email_b, "password": password})
        print(f"[STEP 2] Signup User A ({email_a}) & User B ({email_b}) -> Status: {reg_a.status_code}, {reg_b.status_code}")
        assert reg_a.status_code in (200, 201) and reg_b.status_code in (200, 201)

        # 3. Login User A & User B
        login_a = await client.post("/auth/login", json={"email": email_a, "password": password})
        token_a = login_a.json()["data"]["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        login_b = await client.post("/auth/login", json={"email": email_b, "password": password})
        token_b = login_b.json()["data"]["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}
        print(f"[STEP 3] Login User A & User B -> Tokens obtained successfully.")

        # 4. Resume Upload
        pdf_content = (
            b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
            b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n"
            b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
        )
        files = {"file": ("master_resume.pdf", pdf_content, "application/pdf")}
        up_resp = await client.post("/resume/upload", headers=headers_a, files=files)
        print(f"[STEP 4] Upload Resume for User A -> Status: {up_resp.status_code}")
        assert up_resp.status_code in (200, 201)
        resume_id = up_resp.json()["data"]["resume_id"]

        # 5. Resume Download Ownership Security Check
        dl_owner = await client.get(f"/resume/{resume_id}/download", headers=headers_a)
        print(f"[STEP 5] Download Resume as Owner -> Status: {dl_owner.status_code}")
        assert dl_owner.status_code == 200

        dl_unauth = await client.get(f"/resume/{resume_id}/download", headers=headers_b)
        print(f"[STEP 5b] Download Resume as Unauthorized User B -> Status: {dl_unauth.status_code}")
        assert dl_unauth.status_code in (401, 403, 404), "Security Failure: Unauthorized user downloaded file!"

        # 6. Resume Selection
        list_resumes = await client.get("/resume", headers=headers_a)
        print(f"[STEP 6] List Resumes for User A -> Count: {len(list_resumes.json()['data'])}")
        assert len(list_resumes.json()["data"]) >= 1

        # 7. Initial Free Quota Check (0/3 used)
        sub_init = await client.get("/subscription/status", headers=headers_a)
        print(f"[STEP 7] Initial Quota Check -> Usage Count: {sub_init.json()['data']['free_usage_count']}, Remaining: {sub_init.json()['data']['free_credits_remaining']}")
        assert sub_init.json()["data"]["free_usage_count"] == 0
        assert sub_init.json()["data"]["free_credits_remaining"] == 3

        # 8. AI Generation 1: ATS Analysis
        ats_resp = await client.post(f"/analysis/resume/{resume_id}", headers=headers_a)
        print(f"[STEP 8] AI Feature 1 (ATS Analysis) -> Status: {ats_resp.status_code}")
        assert ats_resp.status_code == 200

        sub_1 = await client.get("/subscription/status", headers=headers_a)
        print(f"         Quota after Use 1 -> Usage: {sub_1.json()['data']['free_usage_count']}, Remaining: {sub_1.json()['data']['free_credits_remaining']}")
        assert sub_1.json()["data"]["free_usage_count"] == 1

        # 9. AI Generation 2: Resume Optimizer
        opt_resp = await client.post("/resume-improvement/generate", headers=headers_a, json={
            "resume_id": resume_id,
            "job_description": "Senior Software Engineer with Python and FastAPI expertise."
        })
        print(f"[STEP 9] AI Feature 2 (Resume Optimizer) -> Status: {opt_resp.status_code}")
        assert opt_resp.status_code == 200

        sub_2 = await client.get("/subscription/status", headers=headers_a)
        print(f"         Quota after Use 2 -> Usage: {sub_2.json()['data']['free_usage_count']}, Remaining: {sub_2.json()['data']['free_credits_remaining']}")
        assert sub_2.json()["data"]["free_usage_count"] == 2

        # 10. AI Generation 3: Cover Letter Generator
        cl_resp = await client.post("/cover-letter/generate", headers=headers_a, json={
            "resume_id": resume_id,
            "job_description": "Senior Software Engineer with Python and FastAPI expertise."
        })
        print(f"[STEP 10] AI Feature 3 (Cover Letter Generator) -> Status: {cl_resp.status_code}")
        assert cl_resp.status_code == 200

        sub_3 = await client.get("/subscription/status", headers=headers_a)
        print(f"          Quota after Use 3 -> Usage: {sub_3.json()['data']['free_usage_count']}, Remaining: {sub_3.json()['data']['free_credits_remaining']}")
        assert sub_3.json()["data"]["free_usage_count"] == 3
        assert sub_3.json()["data"]["free_credits_remaining"] == 0

        # 11. AI Generation 4: Blocked Quota Check (Attempting 4th use on Free Plan)
        iq_resp = await client.post("/interview/questions/generate", headers=headers_a, json={
            "resume_id": resume_id,
            "job_description": "Senior Software Engineer with Python and FastAPI expertise."
        })
        err_dict = iq_resp.json().get("error", {})
        msg_text = err_dict.get("message") if isinstance(err_dict, dict) else (iq_resp.json().get("detail") or iq_resp.json().get("message") or "")
        print(f"          Response Message: {msg_text}")
        assert iq_resp.status_code == 403, f"Quota breach! Request 4 should be 403 Forbidden. Got {iq_resp.status_code}"
        assert "used all 3 free AI uses" in msg_text

        # Verify failed/blocked request did NOT increment quota
        sub_blocked = await client.get("/subscription/status", headers=headers_a)
        assert sub_blocked.json()["data"]["free_usage_count"] == 3, "Failed/blocked request incorrectly incremented quota!"

        # 12. Upgrade User A to Premium Pro
        pay_resp = await client.post("/subscription/submit-payment", headers=headers_a, json={"upi_reference": "UPI99AUDITTEST"})
        print(f"[STEP 12] Upgrade User A to Pro -> Status: {pay_resp.status_code}")
        assert pay_resp.status_code == 200

        sub_pro = await client.get("/subscription/status", headers=headers_a)
        print(f"          Pro Quota Status -> is_pro: {sub_pro.json()['data']['is_pro']}, Plan: {sub_pro.json()['data']['subscription_plan']}, Remaining: {sub_pro.json()['data']['free_credits_remaining']}")
        assert sub_pro.json()["data"]["is_pro"] == True
        assert sub_pro.json()["data"]["free_credits_remaining"] == "Unlimited"

        # 13. AI Generation 5: Premium Unlimited Feature Execution
        iq_pro_resp = await client.post("/interview/questions/generate", headers=headers_a, json={
            "resume_id": resume_id,
            "job_description": "Senior Software Engineer with Python and FastAPI expertise."
        })
        print(f"[STEP 13] Pro User AI Feature (Interview Questions) -> Status: {iq_pro_resp.status_code}")
        assert iq_pro_resp.status_code == 200

        # 14. Admin Statistics Security Check
        # Regular User B attempts Admin stats -> 403 Forbidden
        admin_unauth = await client.get("/admin/stats", headers=headers_b)
        print(f"[STEP 14a] Admin Stats Check as Normal User B -> Status: {admin_unauth.status_code}")
        assert admin_unauth.status_code == 403

        # Promote User A to Admin
        user_a_doc = await db["users"].find_one({"email": email_a})
        await db["users"].update_one({"_id": user_a_doc["_id"]}, {"$set": {"is_admin": True, "role": "admin"}})

        admin_stats = await client.get("/admin/stats", headers=headers_a)
        print(f"[STEP 14b] Admin Stats Check as Authorized Admin User A -> Status: {admin_stats.status_code}")
        assert admin_stats.status_code == 200
        stats_data = admin_stats.json()["data"]
        print(f"           Registered Users: {stats_data['total_registered_users']}")
        print(f"           Active AI Users: {stats_data['total_active_ai_users']}")
        print(f"           AI Generations: {stats_data['total_ai_generations']}")
        print(f"           Free Users: {stats_data['free_users']}")
        print(f"           Premium Users: {stats_data['premium_users']}")
        assert stats_data["total_registered_users"] >= 2
        assert stats_data["premium_users"] >= 1

        # 15. Cleanup Audit Test Users
        await db["users"].delete_many({"email": {"$in": [email_a, email_b]}})
        await db["resumes"].delete_many({"_id": user_a_doc["_id"]})
        await db["payments"].delete_many({"user_id": str(user_a_doc["_id"])})

    await close_mongodb_connection()
    print("=" * 80)
    print("FULL WORKFLOW, QUOTA, AND SECURITY AUDIT COMPLETED 100% SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_full_audit())
