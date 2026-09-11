def build_job_match_prompt(
    resume_text: str,
    job_description: str,
    job_title: str = "",
    company_name: str = "",
) -> str:
    return f"""
You are an expert ATS (Applicant Tracking System) & Senior Technical Recruiter.
Analyze the candidate's resume strictly against the target job description requirements.

Job Title: {job_title or 'Not specified'}
Company: {company_name or 'Not specified'}

Target Job Description:
{job_description}

Candidate Resume Text:
\"\"\"
{resume_text}
\"\"\"

MATCH SCORING RUBRIC (Calculate the final match_score from 0 to 100 based on these 4 components):
1. Core Required Skills Match (0-35 pts): Proportion of essential technical tools, frameworks, and programming languages explicitly required by the job that are demonstrated in the candidate's resume.
2. Experience Level & Scope Alignment (0-25 pts): Years of experience, seniority level, scale of systems/projects, and leadership expectations matching the role requirements.
3. Industry Keywords & Domain Expertise (0-25 pts): Relevant methodologies (e.g. CI/CD, Agile, Microservices, Cloud, Distributed Systems) and domain-specific terminology present in both the JD and resume.
4. Education, Certifications & Role Prerequisites (0-15 pts): Degrees, certifications, licensing, or specialized credentials requested in the job description.

SCORING RULES:
- Calculate the exact sum of the rubric dimensions (0 to 100).
- Do NOT guess or use arbitrary/generic default scores.
- Return a score genuinely reflecting the candidate's fit for THIS specific job.

Return a STRICT, VALID JSON object with the following keys:
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
"""

