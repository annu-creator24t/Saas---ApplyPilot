from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
)

from app.core.dependencies import get_current_user
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

@router.post("/upload")
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

@router.get("")
async def get_user_resumes(
    current_user: dict = Depends(get_current_user),
):
    return await service.get_user_resumes(
        str(current_user["_id"])
    )


# =====================================================
# Get Resume Details
# =====================================================

@router.get("/{resume_id}")
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

@router.patch("/{resume_id}")
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

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await service.delete_resume(
        resume_id,
        str(current_user["_id"]),
    )