import io
import os
from datetime import datetime
from pathlib import Path
import zipfile

import cloudinary
import cloudinary.utils
import httpx
from fastapi import Response, UploadFile

from app.core.config import settings
from app.core.logger import logger
from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
    ValidationException,
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
        # =================================================
        # 1. Save uploaded file locally
        # =================================================

        saved_file = await save_resume(
            file
        )

        # =================================================
        # 2. Extract resume text safely
        # =================================================

        try:
            extracted_text = extract_resume_text(
                saved_file["path"]
            )
        except Exception as exc:
            # Clean up saved file if extraction fails
            try:
                delete_file(saved_file["path"])
            except Exception:
                pass

            if isinstance(exc, ValidationException):
                raise exc

            raise ValidationException(
                "Unable to extract text from the resume. Please ensure the file is not corrupted or password-protected, and contains readable text."
            )

        if not extracted_text or not extracted_text.strip():
            try:
                delete_file(saved_file["path"])
            except Exception:
                pass

            raise ValidationException(
                "No readable text could be found in the uploaded resume. Please upload a PDF or DOCX file with selectable text."
            )

        # =================================================
        # 3. Upload to Cloudinary if configured
        #    Fallback to local URL
        # =================================================

        file_url = (
            f"/uploads/resumes/"
            f"{saved_file['filename']}"
        )

        public_id = ""

        try:
            cloudinary_res = await upload_resume(
                saved_file["path"]
            )

            if (
                cloudinary_res
                and cloudinary_res.get("url")
            ):
                file_url = cloudinary_res["url"]

                public_id = (
                    cloudinary_res.get(
                        "public_id",
                        "",
                    )
                )

        except Exception:
            pass

        # =================================================
        # 4. Determine whether this is the user's
        #    first resume
        #
        #    First resume automatically becomes default.
        # =================================================

        existing_resumes = (
            await self.repository.get_user_resumes(
                user_id
            )
        )

        is_first_resume = (
            len(existing_resumes) == 0
        )

        # =================================================
        # 5. Create resume payload
        # =================================================

        payload = {
            "user_id": user_id,
            "title": file.filename,
            "original_filename": file.filename,
            "stored_filename": saved_file[
                "filename"
            ],
            "file_url": file_url,
            "public_id": public_id,
            "file_size": saved_file[
                "size"
            ],
            "content_type": file.content_type,
            "extracted_text": extracted_text,
            "ats_score": None,
            "analysis": {},
            "is_default": is_first_resume,
            "created_at": datetime.utcnow(),
        }

        # =================================================
        # 6. Save resume
        # =================================================

        resume_id = (
            await self.repository.create_resume(
                payload
            )
        )

        # =================================================
        # 7. Explicitly set first resume as default
        #
        #    This also guarantees that any older default
        #    state is cleared correctly.
        # =================================================

        if is_first_resume:
            await self.repository.set_default_resume(
                user_id=user_id,
                resume_id=resume_id,
            )

        # =================================================
        # 8. Fetch complete resume document
        # =================================================

        resume = (
            await self.repository.get_resume(
                resume_id
            )
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
        resumes = (
            await self.repository.get_user_resumes(
                user_id
            )
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
        resume = (
            await self.repository.get_resume(
                resume_id
            )
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(
            resume["user_id"]
        ) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        return APIResponse(
            message="Resume fetched successfully.",
            data=resume,
        )

    # =====================================================
    # Set Default Resume
    # =====================================================

    async def set_default_resume(
        self,
        resume_id: str,
        user_id: str,
    ):
        # =================================================
        # 1. Fetch selected resume
        # =================================================

        resume = (
            await self.repository.get_resume(
                resume_id
            )
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        # =================================================
        # 2. Verify ownership
        # =================================================

        if str(
            resume["user_id"]
        ) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        # =================================================
        # 3. Set selected resume as default
        # =================================================

        updated = (
            await self.repository.set_default_resume(
                user_id=user_id,
                resume_id=resume_id,
            )
        )

        if not updated:
            raise NotFoundException(
                "Unable to set this resume as default."
            )

        # =================================================
        # 4. Return updated resume
        # =================================================

        updated_resume = (
            await self.repository.get_resume(
                resume_id
            )
        )

        return APIResponse(
            message="Default resume updated successfully.",
            data=updated_resume,
        )

    # =====================================================
    # Download Resume
    # =====================================================

    async def download_resume(
        self,
        resume_id: str,
        user_id: str,
    ):
        resume = (
            await self.repository.get_resume(
                resume_id
            )
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(
            resume["user_id"]
        ) != str(user_id):
            raise AuthorizationException(
                "Unauthorized to download this resume."
            )

        file_url = resume.get(
            "file_url"
        )

        stored_filename = resume.get(
            "stored_filename"
        )

        original_filename = resume.get(
            "original_filename",
            "resume.pdf",
        )

        content_type = resume.get(
            "content_type",
            "application/pdf",
        )

        public_id = resume.get(
            "public_id"
        )

        # =================================================
        # 1. Multi-path search for local file
        # =================================================

        candidate_filenames = []

        if stored_filename:
            candidate_filenames.append(
                stored_filename
            )

        if (
            file_url
            and not file_url.startswith(
                "http"
            )
        ):
            candidate_filenames.append(
                file_url.split("/")[-1]
            )

        base_backend_dir = (
            Path(__file__)
            .resolve()
            .parent.parent.parent
        )

        base_workspace_dir = (
            base_backend_dir.parent
        )

        candidate_paths = []

        for fname in candidate_filenames:
            candidate_paths.extend(
                [
                    (
                        base_backend_dir
                        / "uploads"
                        / "resumes"
                        / fname
                    ),
                    (
                        base_backend_dir
                        / "uploads"
                        / fname
                    ),
                    (
                        base_workspace_dir
                        / "uploads"
                        / "resumes"
                        / fname
                    ),
                    (
                        base_workspace_dir
                        / "backend"
                        / "uploads"
                        / "resumes"
                        / fname
                    ),
                    (
                        Path(
                            "uploads/resumes"
                        )
                        / fname
                    ),
                    (
                        Path("uploads")
                        / fname
                    ),
                ]
            )

        found_path = None

        for path in candidate_paths:
            if (
                path
                and path.exists()
                and path.is_file()
            ):
                found_path = path
                break

        if found_path:
            with open(
                found_path,
                "rb",
            ) as f:
                content = f.read()

            safe_filename = (
                original_filename.replace(
                    '"',
                    '\\"',
                )
            )

            return Response(
                content=content,
                media_type=(
                    content_type
                    or "application/pdf"
                ),
                headers={
                    "Content-Disposition": (
                        f'attachment; '
                        f'filename="{safe_filename}"'
                    ),
                    "Access-Control-Expose-Headers": (
                        "Content-Disposition"
                    ),
                },
            )

        # =================================================
        # 2. Fetch from Cloudinary or remote file URL
        # =================================================

        if (
            file_url
            and (
                file_url.startswith(
                    "http://"
                )
                or file_url.startswith(
                    "https://"
                )
            )
        ):
            try:
                async with httpx.AsyncClient(
                    follow_redirects=True,
                    timeout=30.0,
                ) as client:

                    resp = await client.get(
                        file_url
                    )

                    if (
                        resp.status_code == 200
                        and len(resp.content) > 0
                    ):
                        safe_filename = (
                            original_filename.replace(
                                '"',
                                '\\"',
                            )
                        )

                        return Response(
                            content=resp.content,
                            media_type=(
                                content_type
                                or resp.headers.get(
                                    "content-type",
                                    "application/pdf",
                                )
                            ),
                            headers={
                                "Content-Disposition": (
                                    f'attachment; '
                                    f'filename="{safe_filename}"'
                                ),
                                "Access-Control-Expose-Headers": (
                                    "Content-Disposition"
                                ),
                            },
                        )

            except Exception:
                pass

            # =================================================
            # Cloudinary signed archive fallback
            # =================================================

            try:
                c_public_id = public_id

                if (
                    not c_public_id
                    and "res.cloudinary.com"
                    in file_url
                ):
                    parts = file_url.split(
                        "/upload/"
                    )

                    if len(parts) > 1:
                        sub = parts[1]

                        if "/" in sub:
                            sub_parts = (
                                sub.split(
                                    "/",
                                    1,
                                )
                            )

                            if (
                                sub_parts[0]
                                .startswith("v")
                                and sub_parts[0][
                                    1:
                                ].isdigit()
                            ):
                                c_public_id = (
                                    sub_parts[1]
                                )
                            else:
                                c_public_id = (
                                    sub
                                )

                if c_public_id:
                    cloudinary.config(
                        cloud_name=(
                            settings.CLOUDINARY_CLOUD_NAME
                        ),
                        api_key=(
                            settings.CLOUDINARY_API_KEY
                        ),
                        api_secret=(
                            settings.CLOUDINARY_API_SECRET
                        ),
                        secure=True,
                    )

                    archive_url = (
                        cloudinary.utils.download_archive_url(
                            public_ids=[
                                c_public_id
                            ],
                            resource_type="raw",
                            mode="download",
                        )
                    )

                    async with httpx.AsyncClient(
                        follow_redirects=True,
                        timeout=30.0,
                    ) as client:

                        c_resp = (
                            await client.get(
                                archive_url
                            )
                        )

                        if (
                            c_resp.status_code
                            == 200
                            and len(
                                c_resp.content
                            )
                            > 0
                        ):
                            z = zipfile.ZipFile(
                                io.BytesIO(
                                    c_resp.content
                                )
                            )

                            zip_files = (
                                z.namelist()
                            )

                            if zip_files:
                                extracted_content = (
                                    z.read(
                                        zip_files[0]
                                    )
                                )

                                safe_filename = (
                                    original_filename.replace(
                                        '"',
                                        '\\"',
                                    )
                                )

                                return Response(
                                    content=(
                                        extracted_content
                                    ),
                                    media_type=(
                                        content_type
                                        or "application/pdf"
                                    ),
                                    headers={
                                        "Content-Disposition": (
                                            f'attachment; '
                                            f'filename="{safe_filename}"'
                                        ),
                                        "Access-Control-Expose-Headers": (
                                            "Content-Disposition"
                                        ),
                                    },
                                )

            except Exception as c_err:
                logger.warning(
                    "Cloudinary signed archive "
                    f"download failed: {c_err}"
                )

        # =================================================
        # 3. Fallback for legacy uploads
        # =================================================

        extracted_text = resume.get(
            "extracted_text"
        )

        if (
            extracted_text
            and str(
                extracted_text
            ).strip()
        ):
            safe_base = (
                os.path.splitext(
                    original_filename
                )[0]
                or "resume"
            )

            fallback_filename = (
                f"{safe_base}_extracted.txt"
            )

            return Response(
                content=str(
                    extracted_text
                ).encode("utf-8"),
                media_type=(
                    "text/plain;charset=utf-8"
                ),
                headers={
                    "Content-Disposition": (
                        f'attachment; '
                        f'filename="{fallback_filename}"'
                    ),
                    "Access-Control-Expose-Headers": (
                        "Content-Disposition"
                    ),
                },
            )

        raise NotFoundException(
            "Resume file unavailable for download."
        )

    # =====================================================
    # Rename Resume
    # =====================================================

    async def rename_resume(
        self,
        resume_id: str,
        title: str,
        user_id: str,
    ):
        resume = (
            await self.repository.get_resume(
                resume_id
            )
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(
            resume["user_id"]
        ) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        await self.repository.rename_resume(
            resume_id,
            title,
        )

        updated_resume = (
            await self.repository.get_resume(
                resume_id
            )
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
        resume = (
            await self.repository.get_resume(
                resume_id
            )
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(
            resume["user_id"]
        ) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        public_id = resume.get(
            "public_id"
        )

        if public_id:
            try:
                await delete_resume(
                    public_id
                )
            except Exception:
                pass

        stored_filename = resume.get(
            "stored_filename"
        )

        if stored_filename:
            local_path = (
                Path("uploads/resumes")
                / stored_filename
            )

            delete_file(
                str(local_path)
            )

        await self.repository.delete_resume(
            resume_id
        )

        return APIResponse(
            message="Resume deleted successfully.",
        )