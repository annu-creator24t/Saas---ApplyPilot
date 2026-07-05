def build_interview_prompt(
    resume: str,
    job_description: str,
):
    return f"""
You are an expert Technical Interviewer.

Using the candidate's resume and the job description, generate 10 interview questions.

Rules:
- Ask a mix of Technical, Project-based, Behavioral, and Problem-solving questions.
- Tailor the questions to the candidate's experience.
- Focus on the technologies mentioned in the job description.
- Return ONLY valid JSON.

Format:

{{
    "questions": [
        {{
            "question": "",
            "category": "",
            "difficulty": ""
        }}
    ]
}}

Resume:

{resume}

Job Description:

{job_description}
"""