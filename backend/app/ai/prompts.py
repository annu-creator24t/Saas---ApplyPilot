def build_cover_letter_prompt(
    resume_text: str,
    job_description: str,
) -> str:
    """
    Build the prompt for cover letter generation.
    """
    return f"""
You are an expert career coach and professional cover letter writer.

Write a personalized, ATS-friendly cover letter using ONLY the information provided.

RESUME
-------
{resume_text}

JOB DESCRIPTION
---------------
{job_description}

Rules:
1. Use only information from the resume.
2. Do not invent skills, projects, education, certifications, or experience.
3. Align the candidate's existing experience with the job description.
4. Maintain a professional, confident, and natural tone.
5. Keep the length between 300 and 450 words.
6. Start with "Dear Hiring Manager,".
7. End with a professional closing such as "Sincerely,".
8. Do not use bullet points.
9. Do not use markdown.
10. Do not include explanations or notes.

Return ONLY the cover letter.
"""


def build_interview_prompt(
    resume_text: str,
    job_description: str,
) -> str:
    """
    Build the prompt for interview question generation.
    """
    return f"""
You are an experienced technical interviewer.

Generate interview questions using ONLY the resume and job description.

RESUME
-------
{resume_text}

JOB DESCRIPTION
---------------
{job_description}

Rules:
1. Do not invent technologies or experience.
2. Ask questions only about the candidate's actual skills and projects.
3. Tailor questions to the job description.
4. Return valid JSON only.
5. Do not use markdown.
6. Do not include explanations.
7. Each question must be unique.

Return exactly this JSON structure:

{{
    "technical": [
        "...",
        "...",
        "...",
        "...",
        "..."
    ],
    "behavioral": [
        "...",
        "...",
        "...",
        "...",
        "..."
    ],
    "hr": [
        "...",
        "...",
        "...",
        "...",
        "..."
    ]
}}
"""


def build_resume_improvement_prompt(
    resume_text: str,
    job_description: str,
) -> str:
    """
    Build the prompt for resume improvement.
    """
    return f"""
You are an expert ATS resume writer.

Improve the resume according to the job description while preserving factual accuracy.

RESUME
-------
{resume_text}

JOB DESCRIPTION
---------------
{job_description}

Rules:
1. Do not invent experience, skills, education, certifications, or projects.
2. Use only information present in the resume.
3. Improve the professional summary.
4. Improve wording in the experience section using strong action verbs.
5. Improve project descriptions.
6. Reorganize skills to better match the job description.
7. Keep the resume ATS-friendly.
8. Return valid JSON only.
9. Do not use markdown.
10. Do not include explanations.

Return exactly this JSON structure:

{{
    "professional_summary": "...",
    "skills": [
        "...",
        "..."
    ],
    "experience": "...",
    "projects": "...",
    "recommendations": [
        "...",
        "...",
        "..."
    ]
}}
"""