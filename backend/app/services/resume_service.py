from datetime import datetime

from fastapi import UploadFile

from app.integrations.cloudinary import upload_resume
from app.parsers.parser import extract_resume_text
from app.repositories.resume_repository import ResumeRepository
from app.utils.file_handler import delete_file, save_resume


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