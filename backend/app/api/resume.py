from fastapi import APIRouter, UploadFile, File, Form, Depends
import os

from app.middleware.auth import get_current_user
from app.models.resume_analysis import ResumeAnalysis
from app.prompts.resume_prompt import build_resume_prompt
from app.services.pdf_service import extract_text_from_pdf
from app.services.gemini_service import analyze_resume
from app.services.resume_service import save_resume_analysis


from fastapi import HTTPException
from app.middleware.auth import get_current_user
from app.services.resume_service import (
    get_resume_by_id,
    delete_resume,
)
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
@router.get("/resume/{resume_id}")
async def get_resume(
    resume_id: str,
    current_user=Depends(get_current_user),
):

    resume = await get_resume_by_id(resume_id)

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found."
        )

    if resume["user_id"] != current_user["sub"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    return {
        "success": True,
        "resume": resume,
    }


@router.delete("/resume/{resume_id}")
async def remove_resume(
    resume_id: str,
    current_user=Depends(get_current_user),
):

    resume = await get_resume_by_id(resume_id)

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found."
        )

    if resume["user_id"] != current_user["sub"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    deleted = await delete_resume(resume_id)

    return {
        "success": deleted
    }