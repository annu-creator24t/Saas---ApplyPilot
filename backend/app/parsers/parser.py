import os

from app.core.logger import logger
from app.handlers.exceptions import ValidationException
from app.parsers.docx_parser import extract_docx_text
from app.parsers.pdf_parser import extract_pdf_text


def extract_resume_text(file_path: str) -> str:
    extension = os.path.splitext(file_path)[1].lower()
    extracted_text = ""

    try:
        if extension == ".pdf":
            extracted_text = extract_pdf_text(file_path) or ""

        elif extension == ".docx":
            extracted_text = extract_docx_text(file_path) or ""
    except Exception as exc:
        logger.warning("Parser error reading %s: %s", file_path, exc)

    if extracted_text and extracted_text.strip():
        return extracted_text.strip()

    # Fallback: Attempt plain text reading if PyMuPDF or python-docx fails
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_text = f.read()
            if raw_text and len(raw_text.strip()) > 10:
                return raw_text.strip()
    except Exception as exc:
        logger.warning("Plain text fallback failed for %s: %s", file_path, exc)

    raise ValidationException(
        "Unable to extract text from the resume. Please ensure the file is not empty, corrupted, or password-protected, and contains readable text."
    )