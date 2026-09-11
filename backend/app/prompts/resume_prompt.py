from typing import Optional


def build_resume_prompt(
    resume: str,
    job_description: Optional[str] = None,
) -> str:
    jd_section = ""
    if job_description and job_description.strip():
        jd_section = f"""
Target Job Description:
{job_description.strip()}
"""

    return f"""
You are an expert, strict Applicant Tracking System (ATS) Parser and Senior Technical Recruiter.
Evaluate the candidate's resume based on rigorous, industry-standard ATS scoring rubrics.

{jd_section}

Candidate Resume:
\"\"\"
{resume}
\"\"\"

EVALUATION RUBRIC (Calculate the final ats_score from 0 to 100 based on these 5 dimensions):
1. Contact & Header Completeness (0-15 pts): Full name, professional email, phone number, location, clean LinkedIn/GitHub/Portfolio URLs. Deduct heavily if contact info or links are missing or malformed.
2. Structure & Standard Sections (0-20 pts): Standard ATS-parseable section headings (Summary, Experience, Education, Skills, Projects). Deduct if key sections are missing or unconventional.
3. Quantified Impact & Metrics (0-25 pts): Experience bullet points with strong action verbs (Built, Led, Optimized, Reduced) and measurable impact metrics (%, $, scale, latency, users). Deduct heavily if bullets are passive task descriptions without measurable results.
4. Technical & Domain Keyword Depth (0-25 pts): Breadth, relevance, and density of domain-specific technical skills, tools, frameworks, and industry terminology{" matching the Target Job Description" if job_description else ""}. Deduct if skills are sparse, generic, or mismatched.
5. Formatting & Parsing Hygiene (0-15 pts): Clean, standardized dates, absence of stray markup/ligatures/special characters that break ATS parsers, clear readable bullet points.

CRITICAL SCORING RULES:
- Calculate the EXACT sum of the 5 rubric dimensions (0 to 100) based strictly on the actual resume text.
- Do NOT output generic, clustered, or default scores (e.g. do not just guess 75 or 78).
- High score (85-100): Exceptional resume with clear metrics, complete sections, rich relevant keywords, flawless formatting.
- Moderate score (60-84): Good resume with relevant experience, but missing metrics, some keywords, or minor formatting/section flaws.
- Low score (0-59): Poorly structured resume, missing crucial sections/contact info, sparse keywords, or no measurable achievements.

Return ONLY a valid JSON object matching this schema:
{{
    "ats_score": <integer between 0 and 100>,
    "summary": "<2-3 sentence objective overview of the resume's ATS compatibility and readiness>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "missing_skills": ["<critical skill or keyword 1>", "<critical skill or keyword 2>"],
    "grammar": "<concise evaluation of grammar, action verbs, and tone>",
    "formatting": "<concise evaluation of ATS parseability, section headings, and layout>",
    "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"]
}}
"""