import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(env_path)

import httpx
from app.main import app
from app.db.connection import connect_to_mongodb, close_mongodb_connection, get_database


async def run_interview_qa_tests():
    print("=" * 80)
    print("APPLYPILOT INTERVIEW PRACTICE & QUESTIONS WORKFLOW QA TEST")
    print("=" * 80)

    await connect_to_mongodb()
    db = get_database()

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", timeout=40.0) as client:
        user_a_email = f"interview_qa_a_{uuid.uuid4().hex[:6]}@example.com"
        user_b_email = f"interview_qa_b_{uuid.uuid4().hex[:6]}@example.com"
        password = "SecurePassword123!"

        reg_a = await client.post("/auth/register", json={"full_name": "Interview Candidate A", "email": user_a_email, "password": password})
        assert reg_a.status_code == 201
        reg_b = await client.post("/auth/register", json={"full_name": "Interview Candidate B", "email": user_b_email, "password": password})
        assert reg_b.status_code == 201

        login_a = await client.post("/auth/login", json={"email": user_a_email, "password": password})
        token_a = login_a.json()["data"]["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        login_b = await client.post("/auth/login", json={"email": user_b_email, "password": password})
        token_b = login_b.json()["data"]["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        pdf_content = (
            b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
            b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n"
            b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
        )
        files = {"file": ("software_engineer_resume.pdf", pdf_content, "application/pdf")}
        up_resp = await client.post("/resume/upload", headers=headers_a, files=files)
        assert up_resp.status_code == 201
        resume_id = up_resp.json()["data"]["resume_id"]

        user_a_doc = await db["users"].find_one({"email": user_a_email})
        await db["resumes"].update_one(
            {"user_id": str(user_a_doc["_id"])},
            {"$set": {"extracted_text": "Senior Software Engineer with 6 years experience in Python, FastAPI, React, PostgreSQL, Docker, AWS."}}
        )

        job_desc = "Senior Backend Engineer. Requirements: Python, FastAPI, microservices, REST APIs, system design, scalable databases."

        print("\n[TEST 1] Unauthorized User B attempting to start practice on User A's resume...")
        unauth_start = await client.post("/interview/practice/start", headers=headers_b, json={
            "resume_id": resume_id,
            "job_description": job_desc,
        })
        print(f"  Status: {unauth_start.status_code}")
        assert unauth_start.status_code in (401, 403)

        print("\n[TEST 2] Starting Mock Interview Practice session for User A...")
        start_resp = await client.post("/interview/practice/start", headers=headers_a, json={
            "resume_id": resume_id,
            "job_description": job_desc,
        })
        print(f"  Status: {start_resp.status_code}")
        assert start_resp.status_code == 200
        start_data = start_resp.json()["data"]
        session_id = start_data["session_id"]
        questions = start_data["questions"]

        print(f"  Session ID created: {session_id}")
        print(f"  Total questions generated: {len(questions)}")
        assert len(questions) > 0
        assert "question" in questions[0]

        print("\n[TEST 3] Evaluating Candidate Answer for Question 1...")
        q1_text = questions[0]["question"]
        candidate_ans = "In my previous project, I designed asynchronous FastAPI endpoints with PostgreSQL connection pooling, decreasing latency by 45%."

        eval_resp = await client.post("/interview/practice/evaluate", headers=headers_a, json={
            "question": q1_text,
            "answer": candidate_ans,
            "session_id": session_id,
            "question_index": 0,
        })
        print(f"  Status: {eval_resp.status_code}")
        assert eval_resp.status_code == 200
        eval_data = eval_resp.json()["data"]
        print(f"  Evaluation Score: {eval_data.get('score')}/10")
        print(f"  Strengths: {eval_data.get('strengths')}")
        print(f"  Improvements: {eval_data.get('improvements')}")
        assert eval_data.get("score") is not None
        assert isinstance(eval_data.get("strengths"), list)
        assert isinstance(eval_data.get("improvements"), list)

        print("\n[TEST 4] Verifying MongoDB session document was updated...")
        from bson import ObjectId
        session_doc = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
        assert session_doc is not None
        assert session_doc["questions"][0].get("user_answer") == candidate_ans
        assert session_doc["questions"][0].get("evaluation") is not None
        assert session_doc.get("average_score") > 0
        print(f"  Saved Average Score in DB: {session_doc.get('average_score')}")

        print("\n[TEST 5] Testing cross-user tampering protection...")
        eval_tamper = await client.post("/interview/practice/evaluate", headers=headers_b, json={
            "question": q1_text,
            "answer": "Tampered answer from user B",
            "session_id": session_id,
            "question_index": 0,
        })
        assert eval_tamper.status_code == 200
        recheck_doc = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
        assert recheck_doc["questions"][0].get("user_answer") == candidate_ans
        print("  [PASSED] User A session remained untouched.")

        print("\n[TEST 6] Generating Standalone Interview Questions Set...")
        iq_resp = await client.post("/interview/questions/generate", headers=headers_a, json={
            "resume_id": resume_id,
            "job_description": job_desc,
        })
        print(f"  Status: {iq_resp.status_code}")
        assert iq_resp.status_code == 200
        iq_data = iq_resp.json()["data"]
        assert "interview_id" in iq_data
        assert "technical" in iq_data
        assert "behavioral" in iq_data
        assert "hr" in iq_data
        print(f"  Technical Questions: {len(iq_data['technical'])}")
        print(f"  Behavioral Questions: {len(iq_data['behavioral'])}")
        print(f"  HR Questions: {len(iq_data['hr'])}")

        print("\n[TEST 7] Testing invalid ObjectId handling...")
        exp_invalid = await client.get("/export/interview/invalid-id-12345", headers=headers_a)
        print(f"  Export with invalid ObjectId -> Status: {exp_invalid.status_code}")
        assert exp_invalid.status_code in (404, 400)

        print("\n[CLEANUP] Deleting QA test accounts and sessions...")
        await db["users"].delete_many({"email": {"$in": [user_a_email, user_b_email]}})
        await db["resumes"].delete_many({"user_id": str(user_a_doc["_id"])})
        await db["interview_sessions"].delete_one({"_id": ObjectId(session_id)})
        await db["interview_questions"].delete_one({"_id": ObjectId(iq_data["interview_id"])})

    await close_mongodb_connection()
    print("=" * 80)
    print("INTERVIEW PRACTICE & QUESTIONS WORKFLOW QA TEST PASSED 100%!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_interview_qa_tests())
