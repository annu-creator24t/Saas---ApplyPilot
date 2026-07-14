from fastapi import APIRouter, UploadFile, File, Form, Depends
import os

from app.middleware.auth import get_current_user
from app.models.resume_analysis import ResumeAnalysis
from app.prompts.resume_prompt import build_resume_prompt
from app.services.pdf_service import extract_text_from_pdf
from app.services.gemini_service import analyze_resume
from app.services.resume_service import save_resume_analysis

router = APIRouter()

UPLOAD_FOLDER = "uploads"


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user=Depends(get_current_user),
):

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename,
    )

    with open(file_path, "wb") as f:
        f.write(await file.read())

    resume_text = extract_text_from_pdf(file_path)

    prompt = build_resume_prompt(
        resume_text,
        job_description,
    )

    analysis = analyze_resume(prompt)

    resume = ResumeAnalysis(
        user_id=current_user["sub"],
        resume_text=resume_text,
        job_description=job_description,
        analysis=str(analysis),
    )

    document_id = await save_resume_analysis(resume)

    return {
        "success": True,
        "resume_id": document_id,
        "analysis": analysis,
    }