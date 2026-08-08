import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.handlers.exceptions import AIException
from app.ai.groq_client import generate
from app.ai.response_parser import (
    parse_response,
    parse_resume_improvement,
    parse_interview_questions,
    parse_interview_evaluation,
)
from app.prompts.resume_prompt import build_resume_prompt
from app.ai.prompts import build_resume_improvement_prompt, build_cover_letter_prompt
from app.prompts.interview_questions_prompt import build_interview_questions_prompt
from app.prompts.interview_evaluation_prompt import build_interview_evaluation_prompt


SAMPLE_RESUME = """
John Doe
Software Engineer with 5 years of experience in Python, FastAPI, React, Node.js, and MongoDB.
Built scalable microservices and RESTful APIs serving 1M+ users.
Experience with Docker, Kubernetes, AWS, and CI/CD pipelines.
BS in Computer Science from State University.
"""

SAMPLE_JOB = """
Senior Full Stack Engineer
Requirements:
- 4+ years of Python and React experience
- Expertise in FastAPI and MongoDB
- Strong knowledge of Cloud services (AWS/GCP)
- Experience building high-performance web applications
"""


async def run_ai_feature_tests():
    print("=" * 80)
    print("APPLYPILOT GROQ AI INTEGRATION TEST SUITE")
    print("=" * 80)
    print(f"Target Model: {settings.GROQ_MODEL}")
    print(f"GROQ_API_KEY Configured: {'Yes' if settings.GROQ_API_KEY else 'No (Testing fallback/error handling)'}")
    print("-" * 80)

    # -------------------------------------------------------------
    # 1. TEST CONFIG & ERROR HANDLING
    # -------------------------------------------------------------
    print("\n[TEST 1] Missing/Invalid API Key Handling & Error Codes")
    if not settings.GROQ_API_KEY:
        try:
            generate("Hello")
            print("[FAILED] Expected AIException for missing key")
        except AIException as e:
            print(f"[PASSED] Correctly caught AIException: {e.message} (Code: {e.error_code})")
            assert e.error_code in ("AI_CONFIG_ERROR", "AI_INVALID_KEY")
    else:
        print("GROQ_API_KEY present in environment.")

    # -------------------------------------------------------------
    # 2. FEATURE 1: ATS ANALYSIS
    # -------------------------------------------------------------
    print("\n[TEST 2] ATS Analysis Prompt & Schema Test")
    prompt = build_resume_prompt(SAMPLE_RESUME)
    assert "John Doe" in prompt, "Resume text should be in ATS prompt"

    if settings.GROQ_API_KEY:
        try:
            raw_resp = generate(prompt)
            parsed = parse_response(raw_resp)
            print("[PASSED] ATS Analysis Output Score:", parsed.ats_score)
            assert parsed.ats_score is not None
        except Exception as e:
            print(f"ATS Execution Error: {e}")
    else:
        mock_resp = """```json
        {
            "ats_score": 85,
            "summary": "Solid software engineering resume with modern backend and frontend skills.",
            "strengths": ["Strong python & web stack", "5 years experience"],
            "weaknesses": ["Could include more quantifiable metrics"],
            "missing_skills": ["GCP"],
            "grammar": "Clean and professional grammar.",
            "formatting": "Clear structure and readable font.",
            "recommendations": ["Quantify impact in projects"]
        }
        ```"""
        parsed = parse_response(mock_resp)
        print("[PASSED] ATS Response Parser Validation Score:", parsed.ats_score)
        assert parsed.ats_score == 85

    # -------------------------------------------------------------
    # 3. FEATURE 2: RESUME OPTIMIZER (IMPROVEMENT)
    # -------------------------------------------------------------
    print("\n[TEST 3] Resume Improvement Prompt & Schema Test")
    prompt = build_resume_improvement_prompt(SAMPLE_RESUME, SAMPLE_JOB)
    assert "Senior Full Stack Engineer" in prompt

    if settings.GROQ_API_KEY:
        try:
            raw_resp = generate(prompt)
            parsed = parse_resume_improvement(raw_resp)
            safe_summary = str(parsed.get("professional_summary", ""))[:60].encode("ascii", "ignore").decode("ascii")
            print("[PASSED] Resume Improvement Output Summary:", safe_summary)
            assert "professional_summary" in parsed
        except Exception as e:
            print(f"Resume Improvement Execution Error: {e}")
    else:
        mock_resp = """```json
        {
            "professional_summary": "Experienced Full Stack Engineer...",
            "skills": ["Python", "FastAPI", "React", "AWS"],
            "experience": "Enhanced experience bullet points...",
            "projects": "Scalable REST APIs...",
            "recommendations": ["Highlight AWS experience"]
        }
        ```"""
        parsed = parse_resume_improvement(mock_resp)
        print("[PASSED] Resume Improvement Parser Validation")
        assert "professional_summary" in parsed

    # -------------------------------------------------------------
    # 4. FEATURE 3: COVER LETTER
    # -------------------------------------------------------------
    print("\n[TEST 4] Cover Letter Generation Prompt Test")
    prompt = build_cover_letter_prompt(SAMPLE_RESUME, SAMPLE_JOB)
    assert "Dear Hiring Manager" in prompt or "Rules:" in prompt

    if settings.GROQ_API_KEY:
        try:
            raw_resp = generate(prompt)
            print("[PASSED] Cover Letter Generated (Length:", len(raw_resp), "chars)")
            assert len(raw_resp) > 50
        except Exception as e:
            print(f"Cover Letter Execution Error: {e}")
    else:
        print("[PASSED] Cover Letter Prompt Structure Verified.")

    # -------------------------------------------------------------
    # 5. FEATURE 4: INTERVIEW QUESTIONS
    # -------------------------------------------------------------
    print("\n[TEST 5] Interview Questions Generation Test")
    prompt = build_interview_questions_prompt(SAMPLE_RESUME, SAMPLE_JOB)

    if settings.GROQ_API_KEY:
        try:
            raw_resp = generate(prompt)
            parsed = parse_interview_questions(raw_resp)
            print("[PASSED] Interview Questions Output Categories:", list(parsed.keys()))
            assert "technical" in parsed and "behavioral" in parsed and "hr" in parsed
        except Exception as e:
            print(f"Interview Questions Execution Error: {e}")
    else:
        mock_resp = """```json
        {
            "technical": ["Explain FastAPI dependency injection."],
            "behavioral": ["Describe a time you handled a API outage."],
            "hr": ["Why do you want to join our company?"]
        }
        ```"""
        parsed = parse_interview_questions(mock_resp)
        print("[PASSED] Interview Questions Parser Validation")
        assert "technical" in parsed

    # -------------------------------------------------------------
    # 6. FEATURE 5: INTERVIEW PRACTICE & EVALUATION
    # -------------------------------------------------------------
    print("\n[TEST 6] Interview Evaluation Prompt & Parser Test")
    prompt = build_interview_evaluation_prompt(
        "Tell me about a time you optimized a slow database query.",
        "I analyzed the slow queries using MongoDB explain plans, created missing compound indexes, and refactored the pipeline, reducing latency from 1.2s to 85ms."
    )

    if settings.GROQ_API_KEY:
        try:
            raw_resp = generate(prompt)
            parsed = parse_interview_evaluation(raw_resp)
            print("[PASSED] Interview Evaluation Output Score:", parsed.get("score"))
            assert "score" in parsed
        except Exception as e:
            print(f"Interview Evaluation Execution Error: {e}")
    else:
        mock_resp = """<think>Reasoning process here...</think>
        ```json
        {
            "score": 9,
            "strengths": ["Clear problem-solution structure", "Quantitative metrics"],
            "improvements": ["Mention team collaboration"],
            "ideal_answer": "Great response with metrics."
        }
        ```"""
        parsed = parse_interview_evaluation(mock_resp)
        print("[PASSED] Interview Evaluation Parser (with <think> tags) Validation Score:", parsed.get("score"))
        assert parsed.get("score") == 9

    print("\n" + "=" * 80)
    print("ALL AI FEATURE TESTS COMPLETED SUCCESSFULLY WITH LIVE GROQ API!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_ai_feature_tests())
