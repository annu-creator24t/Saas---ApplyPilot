from datetime import datetime
from pathlib import Path

import httpx
from fastapi import Response, UploadFile

from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
)
from app.integrations.cloudinary import (
    delete_resume,
    upload_resume,
)
from app.parsers.parser import extract_resume_text
from app.repositories.resume_repository import ResumeRepository
from app.schemas.common import APIResponse
from app.utils.file_handler import (
    delete_file,
    save_resume,
)


class ResumeService:

    def __init__(self):
        self.repository = ResumeRepository()

    # =====================================================
    # Upload Resume
    # =====================================================

    async def upload_resume(
        self,
        user_id: str,
        file: UploadFile,
    ):
        # Save uploaded file locally
        saved_file = await save_resume(file)

        # Extract resume text
        extracted_text = extract_resume_text(
            saved_file["path"]
        )

        # Upload to Cloudinary if configured, fallback to local URL
        file_url = f"/uploads/resumes/{saved_file['filename']}"
        public_id = ""
        try:
            cloudinary = await upload_resume(saved_file["path"])
            if cloudinary and cloudinary.get("url"):
                file_url = cloudinary["url"]
                public_id = cloudinary.get("public_id", "")
        except Exception:
            pass

        payload = {
            "user_id": user_id,
            "title": file.filename,
            "original_filename": file.filename,
            "stored_filename": saved_file["filename"],
            "file_url": file_url,
            "public_id": public_id,
            "file_size": saved_file["size"],
            "content_type": file.content_type,
            "extracted_text": extracted_text,
            "ats_score": None,
            "analysis": {},
            "created_at": datetime.utcnow(),
        }

        resume_id = await self.repository.create_resume(
            payload
        )

        # Fetch complete resume document
        resume = await self.repository.get_resume(
            resume_id
        )

        return APIResponse(
            message="Resume uploaded successfully.",
            data=resume,
        )

    # =====================================================
    # Get All User Resumes
    # =====================================================

    async def get_user_resumes(
        self,
        user_id: str,
    ):
        resumes = await self.repository.get_user_resumes(
            user_id
        )

        return APIResponse(
            message="Resumes fetched successfully.",
            data=resumes,
        )

    # =====================================================
    # Get Resume Details
    # =====================================================

    async def get_resume_details(
        self,
        resume_id: str,
        user_id: str,
    ):
        resume = await self.repository.get_resume(
            resume_id
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(resume["user_id"]) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        return APIResponse(
            message="Resume fetched successfully.",
            data=resume,
        )

    # =====================================================
    # Download Resume
    # =====================================================

    async def download_resume(
        self,
        resume_id: str,
        user_id: str,
    ):
        resume = await self.repository.get_resume(resume_id)

        if not resume:
            raise NotFoundException("Resume not found.")

        if str(resume["user_id"]) != str(user_id):
            raise AuthorizationException("Unauthorized to download this resume.")

        file_url = resume.get("file_url")
        stored_filename = resume.get("stored_filename")
        original_filename = resume.get("original_filename", "resume.pdf")
        content_type = resume.get("content_type", "application/pdf")

        # 1. Check local upload directory first
        local_path = Path("uploads/resumes") / stored_filename if stored_filename else None
        if local_path and local_path.exists():
            with open(local_path, "rb") as f:
                content = f.read()
            return Response(
                content=content,
                media_type=content_type,
                headers={
                    "Content-Disposition": f'attachment; filename="{original_filename}"'
                },
            )

        # 2. Fetch from Cloudinary or remote file URL
        if file_url and (file_url.startswith("http://") or file_url.startswith("https://")):
            try:
                async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                    resp = await client.get(file_url)
                    if resp.status_code == 200:
                        return Response(
                            content=resp.content,
                            media_type=content_type or resp.headers.get("content-type", "application/octet-stream"),
                            headers={
                                "Content-Disposition": f'attachment; filename="{original_filename}"'
                            },
                        )
            except Exception:
                pass

        raise NotFoundException("Resume file unavailable for download.")

    # =====================================================
    # Rename Resume
    # =====================================================

    async def rename_resume(
        self,
        resume_id: str,
        title: str,
        user_id: str,
    ):
        resume = await self.repository.get_resume(
            resume_id
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(resume["user_id"]) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        await self.repository.rename_resume(
            resume_id,
            title,
        )

        updated_resume = await self.repository.get_resume(
            resume_id
        )

        return APIResponse(
            message="Resume renamed successfully.",
            data=updated_resume,
        )

    # =====================================================
    # Delete Resume
    # =====================================================

    async def delete_resume(
        self,
        resume_id: str,
        user_id: str,
    ):
        resume = await self.repository.get_resume(
            resume_id
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(resume["user_id"]) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        public_id = resume.get("public_id")
        if public_id:
            try:
                await delete_resume(public_id)
            except Exception:
                pass

        stored_filename = resume.get("stored_filename")
        if stored_filename:
            local_path = Path("uploads/resumes") / stored_filename
            delete_file(str(local_path))

        await self.repository.delete_resume(
            resume_id
        )

        return APIResponse(
            message="Resume deleted successfully.",
        )