def build_interview_evaluation_prompt(
    question: str,
    answer: str,
):
    return f"""
You are an experienced senior technical interviewer.

Evaluate the candidate's answer.

Question:

{question}

Candidate Answer:

{answer}

Rules:

1. Score the answer out of 10.
2. Mention strengths.
3. Mention improvements.
4. Provide an ideal answer.
5. Return ONLY valid JSON.
6. Do not use markdown.

Return exactly this format:

{{
    "score": 8,
    "strengths": [
        ""
    ],
    "improvements": [
        ""
    ],
    "ideal_answer": ""
}}
"""