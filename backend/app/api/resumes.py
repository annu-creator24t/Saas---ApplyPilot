from fastapi import APIRouter, File, UploadFile

from app.services.resume_service import ResumeService

router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
):

    service = ResumeService()

    return await service.upload_resume(
        user_id="demo_user",
        file=file,
    )