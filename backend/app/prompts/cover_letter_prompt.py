def build_cover_letter_prompt(
    resume: str,
    job_description: str,
):
    return f"""
You are an expert Resume Writer.

You are an expert career coach and professional cover letter writer.

Write a personalized, ATS-friendly cover letter using ONLY the information provided.

Rules:

1. Use only information from the resume.
2. Never invent projects, skills, education or experience.
3. Match the candidate's existing experience with the job description.
4. Maintain a professional and confident tone.
5. Keep the length between 300–450 words.
6. Start with "Dear Hiring Manager,".
7. End with "Sincerely,".
8. No markdown.
9. No bullet points.
10. Return ONLY the cover letter.

Return ONLY the cover letter.

Resume

{resume}

Job Description

{job_description}
"""