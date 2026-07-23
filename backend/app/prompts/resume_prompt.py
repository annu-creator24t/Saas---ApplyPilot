def build_resume_prompt(resume: str) -> str:
    return f"""
You are an expert ATS Resume Reviewer.

Analyze the following resume.

Return ONLY valid JSON.

Do not include markdown.
Do not include explanations.

Return exactly this JSON:

{{
    "ats_score": 0,
    "summary": "",
    "strengths": [],
    "weaknesses": [],
    "missing_skills": [],
    "grammar": "",
    "formatting": "",
    "recommendations": []
}}

Resume:

{resume}
"""