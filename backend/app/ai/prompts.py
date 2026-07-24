def build_cover_letter_prompt(resume_text: str, job_description: str) -> str:
    return f"""
You are an expert career coach and professional resume writer.

Your task is to write a personalized, ATS-friendly cover letter based ONLY on the resume and job description provided.

========================
RESUME
========================
{resume_text}

========================
JOB DESCRIPTION
========================
{job_description}

Instructions:

1. Use only the information present in the resume.
2. Do NOT invent projects, skills, certifications, education, or work experience.
3. Match the candidate's existing skills with the job requirements.
4. Keep a professional and confident tone.
5. Keep the length between 300 and 450 words.
6. Use proper paragraph formatting.
7. Start with "Dear Hiring Manager,".
8. End with a professional closing such as:
   "Sincerely,"
9. Avoid generic filler sentences.
10. Make the letter sound personalized for this specific role.

Return ONLY the cover letter.

Do not include:
- Markdown
- Code blocks
- Explanations
- Notes
- Bullet points
"""
def build_interview_prompt(
    resume_text: str,
    job_description: str,
) -> str:

    return f"""
You are an experienced Technical Interviewer.

Generate interview questions based ONLY on the resume and job description.

=====================
RESUME
=====================

{resume_text}

=====================
JOB DESCRIPTION
=====================

{job_description}

Rules:

1. Do NOT invent technologies.
2. Ask questions only from the candidate's experience.
3. Tailor questions according to the job description.
4. Return valid JSON only.
5. No markdown.
6. No explanation.

Return exactly this JSON:

{{
    "technical":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ],
    "behavioral":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ],
    "hr":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ]
}}
"""
def build_resume_improvement_prompt(resume_text: str, job_description: str) -> str:
    return f"""
You are an expert ATS Resume Writer.

Improve the resume according to the job description.

Resume:
{resume_text}

Job Description:
{job_description}

Instructions:
- Improve the professional summary.
- Improve the skills section.
- Improve the experience section using strong action verbs.
- Improve the projects section.
- Keep everything ATS-friendly.
- Do not invent fake experience.
- Use only information present in the resume.
- Return ONLY valid JSON.

Return exactly in this format:

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