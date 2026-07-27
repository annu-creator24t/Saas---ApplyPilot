def build_interview_questions_prompt(
    resume: str,
    job_description: str,
):
    return f"""
You are an experienced technical interviewer.

Using the candidate's resume and the job description, generate interview questions with ideal answers.

Rules:

1. Use ONLY the resume and job description.
2. Do not invent technologies.
3. Questions should be realistic.
4. Keep ideal answers concise but complete.
5. Return ONLY valid JSON.
6. Do not use markdown.

Return exactly this format:

{{
    "technical":[
        {{
            "question":"",
            "category":"Technical",
            "difficulty":"Easy",
            "ideal_answer":""
        }}
    ],

    "behavioral":[
        {{
            "question":"",
            "category":"Behavioral",
            "difficulty":"Medium",
            "ideal_answer":""
        }}
    ],

    "hr":[
        {{
            "question":"",
            "category":"HR",
            "difficulty":"Easy",
            "ideal_answer":""
        }}
    ]
}}

Resume:

{resume}

Job Description:

{job_description}
"""