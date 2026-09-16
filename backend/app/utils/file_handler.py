import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.handlers.exceptions import ValidationException

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "resumes"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

MAX_SIZE = 5 * 1024 * 1024


async def save_resume(file: UploadFile):
    if not file or not file.filename:
        raise ValidationException("Please provide a valid resume file.")

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValidationException("Only PDF and DOCX files are allowed.")

    content = await file.read()

    if not content or len(content) == 0:
        raise ValidationException("Uploaded file is empty. Please choose a valid resume file.")

    if len(content) > MAX_SIZE:
        raise ValidationException("Maximum file size is 5 MB.")

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