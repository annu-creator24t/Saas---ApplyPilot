def build_cover_letter_prompt(
    resume: str,
    job_description: str,
):
    return f"""
You are an expert Resume Writer.

Write a professional cover letter.

Return ONLY the cover letter.

Resume

{resume}

Job Description

{job_description}
"""