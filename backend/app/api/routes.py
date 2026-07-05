from fastapi import APIRouter, UploadFile, File, Form
import os

from app.services.pdf_service import extract_text_from_pdf
from app.services.gemini_service import analyze_resume
from app.prompts.resume_prompt import build_resume_prompt

router = APIRouter()

UPLOAD_FOLDER = "uploads"


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Save uploaded resume
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract text from PDF
    resume = extract_text_from_pdf(file_path)

    # Build Gemini prompt
    prompt = build_resume_prompt(
        resume,
        job_description
    )

    # Analyze using Gemini
    analysis = analyze_resume(prompt)

    # Return complete response
    return {
        "resume_text": resume,
        "job_description": job_description,
        "analysis": analysis
    }