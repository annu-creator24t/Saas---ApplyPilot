def build_answer_prompt(
    question: str,
    answer: str,
):
    return f"""
You are a Senior Technical Interviewer.

Evaluate the candidate's interview answer.

Return ONLY valid JSON.

Format:

{{
    "score": 0,
    "strengths": [],
    "improvements": [],
    "ideal_answer": ""
}}

Rules:

- Score should be between 0 and 10.
- Mention 2-4 strengths.
- Mention 2-4 improvements.
- Write a professional ideal answer.
- Be objective and constructive.

Interview Question:

{question}

Candidate Answer:

{answer}
"""