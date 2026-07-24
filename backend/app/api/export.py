from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.core.dependencies import get_current_user

from app.exports.pdf_generator import (
    generate_ats_pdf,
    generate_cover_letter_pdf,
    generate_interview_pdf,
    generate_resume_improvement_pdf,
)

from app.repositories.resume_repository import ResumeRepository
from app.repositories.cover_letter_repository import CoverLetterRepository
from app.repositories.interview_repository import InterviewRepository
from app.repositories.resume_improvement_repository import (
    ResumeImprovementRepository,
)

router = APIRouter(
    prefix="/export",
    tags=["Export"],
)

resume_repository = ResumeRepository()
cover_letter_repository = CoverLetterRepository()
interview_repository = InterviewRepository()
improvement_repository = ResumeImprovementRepository()


def pdf_response(pdf, filename: str):
    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        },
    )


# ======================================================
# ATS REPORT
# ======================================================

@router.get("/ats/{resume_id}")
async def export_ats_report(
    resume_id: str,
    current_user=Depends(get_current_user),
):
    resume = await resume_repository.get_resume(resume_id)

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    if str(resume["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized",
        )

    analysis = resume.get("analysis")

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    pdf = generate_ats_pdf(analysis)

    return pdf_response(
        pdf,
        "ATS_Report.pdf",
    )


# ======================================================
# COVER LETTER
# ======================================================

@router.get("/cover-letter/{cover_letter_id}")
async def export_cover_letter(
    cover_letter_id: str,
    current_user=Depends(get_current_user),
):
    cover_letter = await cover_letter_repository.get_cover_letter(
        cover_letter_id
    )

    if not cover_letter:
        raise HTTPException(
            status_code=404,
            detail="Cover Letter not found",
        )

    if str(cover_letter["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized",
        )

    pdf = generate_cover_letter_pdf(
        cover_letter["cover_letter"]
    )

    return pdf_response(
        pdf,
        "Cover_Letter.pdf",
    )


# ======================================================
# INTERVIEW QUESTIONS
# ======================================================

@router.get("/interview/{interview_id}")
async def export_interview(
    interview_id: str,
    current_user=Depends(get_current_user),
):
    interview = await interview_repository.get_interview(
        interview_id
    )

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    if str(interview["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized",
        )

    pdf = generate_interview_pdf(interview)

    return pdf_response(
        pdf,
        "Interview_Questions.pdf",
    )


# ======================================================
# RESUME IMPROVEMENT
# ======================================================

@router.get("/resume-improvement/{improvement_id}")
async def export_resume_improvement(
    improvement_id: str,
    current_user=Depends(get_current_user),
):
    improvement = await improvement_repository.get_improvement(
        improvement_id
    )

    if not improvement:
        raise HTTPException(
            status_code=404,
            detail="Resume Improvement not found",
        )

    if str(improvement["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized",
        )

    pdf = generate_resume_improvement_pdf(
        improvement
    )

    return pdf_response(
        pdf,
        "Resume_Improvement.pdf",
    )