import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "resumes"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

MAX_SIZE = 5 * 1024 * 1024


async def save_resume(file: UploadFile):

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed.",
        )

    content = await file.read()

    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 5 MB.",
        )

    filename = f"{uuid.uuid4()}{extension}"

    path = UPLOAD_DIR / filename

    with open(path, "wb") as f:
        f.write(content)

    return {
        "filename": filename,
        "path": str(path),
        "size": len(content),
    }


def delete_file(path: str):

    if os.path.exists(path):
        os.remove(path)