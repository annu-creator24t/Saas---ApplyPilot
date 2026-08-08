from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    status,
)

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.schemas.resume import RenameResumeRequest
from app.services.resume_service import ResumeService

router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)

service = ResumeService()


# =====================================================
# Upload Resume
# =====================================================

@router.post(
    "/upload",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Resume",
    description="Upload a resume, extract its text, and store it for future analysis.",
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    return await service.upload_resume(
        user_id=str(current_user["_id"]),
        file=file,
    )


# =====================================================
# Get All Resumes
# =====================================================

@router.get(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get All Resumes",
    description="Retrieve all resumes uploaded by the authenticated user.",
)
async def get_user_resumes(
    current_user: dict = Depends(get_current_user),
):
    return await service.get_user_resumes(
        str(current_user["_id"])
    )


# =====================================================
# Download Original Resume
# =====================================================

@router.get(
    "/{resume_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download Original Resume",
    description="Download the original uploaded resume file for the authenticated user.",
)
async def download_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await service.download_resume(
        resume_id=resume_id,
        user_id=str(current_user["_id"]),
    )


# =====================================================
# Get Resume Details
# =====================================================

@router.get(
    "/{resume_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Resume Details",
    description="Retrieve the details of a specific resume.",
)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await service.get_resume_details(
        resume_id,
        str(current_user["_id"]),
    )


# =====================================================
# Rename Resume
# =====================================================

@router.patch(
    "/{resume_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Rename Resume",
    description="Update the title of an uploaded resume.",
)
async def rename_resume(
    resume_id: str,
    data: RenameResumeRequest,
    current_user: dict = Depends(get_current_user),
):
    return await service.rename_resume(
        resume_id=resume_id,
        title=data.title,
        user_id=str(current_user["_id"]),
    )


# =====================================================
# Delete Resume
# =====================================================

@router.delete(
    "/{resume_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Resume",
    description="Delete a resume and its associated file.",
)
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await service.delete_resume(
        resume_id,
        str(current_user["_id"]),
    )