def build_job_match_prompt(resume_text: str, job_description: str, job_title: str = "", company_name: str = "") -> str:
    return f"""
You are an expert ATS (Applicant Tracking System) & Senior Technical Recruiter.
Analyze the following candidate resume against the target job description.

Job Title: {job_title or 'Not specified'}
Company: {company_name or 'Not specified'}

Job Description:
{job_description}

Candidate Resume Text:
{resume_text}

Perform a rigorous evaluation and return a STRICT, VALID JSON object with the following keys and exact data types:
{{
  "match_score": <integer from 0 to 100 representing overall ATS job fit percentage>,
  "matched_skills": [<array of skill strings found in both resume and job description>],
  "missing_skills": [<array of key skills/qualifications required by the job description but missing or weak in resume>],
  "key_keywords": [<array of top 8-10 critical keywords/phrases from job description>],
  "strengths": [<array of 3-4 bullet points highlighting why candidate is a good fit>],
  "weaknesses": [<array of 2-3 bullet points highlighting potential red flags or gaps>],
  "recommendations": [<array of 3-4 actionable advice items to tailor resume/cover letter for this specific job>],
  "summary": "<2-3 sentence overview summary of candidate fit for this role>"
}}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON.
- Do NOT wrap in Markdown backticks or include any text outside the JSON object.
- Keep scores accurate and objective.
"""
