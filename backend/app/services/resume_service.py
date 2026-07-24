from datetime import datetime

from fastapi import HTTPException, UploadFile

from app.integrations.cloudinary import (
    delete_resume,
    upload_resume,
)
from app.parsers.parser import extract_resume_text
from app.repositories.resume_repository import ResumeRepository
from app.utils.file_handler import (
    delete_file,
    save_resume,
)


class ResumeService:

    def __init__(self):
        self.repository = ResumeRepository()

    async def upload_resume(
        self,
        user_id: str,
        file: UploadFile,
    ):

        saved = await save_resume(file)

        text = extract_resume_text(saved["path"])

        cloudinary = await upload_resume(saved["path"])

        delete_file(saved["path"])

        payload = {
            "user_id": user_id,
            "title": file.filename,
            "original_filename": file.filename,
            "stored_filename": saved["filename"],
            "file_url": cloudinary["url"],
            "public_id": cloudinary["public_id"],
            "file_size": saved["size"],
            "content_type": file.content_type,
            "extracted_text": text,
            "ats_score": None,
            "analysis": {},
            "created_at": datetime.utcnow(),
        }

        resume_id = await self.repository.create_resume(payload)

        return {
            "resume_id": resume_id,
            "filename": file.filename,
            "resume_url": cloudinary["url"],
            "text_length": len(text),
            "status": "uploaded",
        }

    async def get_user_resumes(
        self,
        user_id: str,
    ):
        return await self.repository.get_user_resumes(user_id)

    async def get_resume_details(
        self,
        resume_id: str,
        user_id: str,
    ):
        resume = await self.repository.get_resume(resume_id)

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        if str(resume["user_id"]) != str(user_id):
            raise HTTPException(
                status_code=403,
                detail="Unauthorized",
            )

        return resume

    async def rename_resume(
        self,
        resume_id: str,
        title: str,
        user_id: str,
    ):
        resume = await self.repository.get_resume(resume_id)

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        if str(resume["user_id"]) != str(user_id):
            raise HTTPException(
                status_code=403,
                detail="Unauthorized",
            )

        await self.repository.rename_resume(
            resume_id,
            title,
        )

        return {
            "message": "Resume renamed successfully."
        }

    async def delete_resume(
        self,
        resume_id: str,
        user_id: str,
    ):
        resume = await self.repository.get_resume(resume_id)

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        if str(resume["user_id"]) != str(user_id):
            raise HTTPException(
                status_code=403,
                detail="Unauthorized",
            )

        public_id = resume.get("public_id")

        if public_id:
            await delete_resume(public_id)

        await self.repository.delete_resume(resume_id)

        return {
            "message": "Resume deleted successfully."
        }