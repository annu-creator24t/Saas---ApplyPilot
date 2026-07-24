from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse

from app.core.dependencies import get_current_user

from app.exports.pdf_generator import (
    generate_ats_pdf,
    generate_cover_letter_pdf,
    generate_interview_pdf,
    generate_resume_improvement_pdf,
)

from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
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
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


# ======================================================
# ATS REPORT
# ======================================================

@router.get(
    "/ats/{resume_id}",
    status_code=status.HTTP_200_OK,
    summary="Export ATS Report",
    description="Download the ATS analysis report as a PDF.",
)
async def export_ats_report(
    resume_id: str,
    current_user=Depends(get_current_user),
):
    resume = await resume_repository.get_resume(resume_id)

    if not resume:
        raise NotFoundException("Resume not found.")

    if str(resume["user_id"]) != str(current_user["_id"]):
        raise AuthorizationException("You are not authorized to access this resume.")

    analysis = resume.get("analysis")

    if not analysis:
        raise NotFoundException("ATS analysis not found.")

    pdf = generate_ats_pdf(analysis)

    return pdf_response(
        pdf,
        "ATS_Report.pdf",
    )


# ======================================================
# COVER LETTER
# ======================================================

@router.get(
    "/cover-letter/{cover_letter_id}",
    status_code=status.HTTP_200_OK,
    summary="Export Cover Letter",
    description="Download the generated cover letter as a PDF.",
)
async def export_cover_letter(
    cover_letter_id: str,
    current_user=Depends(get_current_user),
):
    cover_letter = await cover_letter_repository.get_cover_letter(
        cover_letter_id
    )

    if not cover_letter:
        raise NotFoundException("Cover letter not found.")

    if str(cover_letter["user_id"]) != str(current_user["_id"]):
        raise AuthorizationException("You are not authorized to access this cover letter.")

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

@router.get(
    "/interview/{interview_id}",
    status_code=status.HTTP_200_OK,
    summary="Export Interview Questions",
    description="Download the generated interview questions as a PDF.",
)
async def export_interview(
    interview_id: str,
    current_user=Depends(get_current_user),
):
    interview = await interview_repository.get_interview(
        interview_id
    )

    if not interview:
        raise NotFoundException("Interview not found.")

    if str(interview["user_id"]) != str(current_user["_id"]):
        raise AuthorizationException("You are not authorized to access this interview.")

    pdf = generate_interview_pdf(interview)

    return pdf_response(
        pdf,
        "Interview_Questions.pdf",
    )


# ======================================================
# RESUME IMPROVEMENT
# ======================================================

@router.get(
    "/resume-improvement/{improvement_id}",
    status_code=status.HTTP_200_OK,
    summary="Export Resume Improvement",
    description="Download the AI-generated resume improvement report as a PDF.",
)
async def export_resume_improvement(
    improvement_id: str,
    current_user=Depends(get_current_user),
):
    improvement = await improvement_repository.get_improvement(
        improvement_id
    )

    if not improvement:
        raise NotFoundException("Resume improvement report not found.")

    if str(improvement["user_id"]) != str(current_user["_id"]):
        raise AuthorizationException("You are not authorized to access this report.")

    pdf = generate_resume_improvement_pdf(
        improvement
    )

    return pdf_response(
        pdf,
        "Resume_Improvement.pdf",
    )