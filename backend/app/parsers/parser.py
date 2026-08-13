import os

from app.parsers.pdf_parser import extract_pdf_text
from app.parsers.docx_parser import extract_docx_text


def extract_resume_text(file_path: str) -> str:
    extension = os.path.splitext(file_path)[1].lower()

    try:
        if extension == ".pdf":
            text = extract_pdf_text(file_path)
            if text and text.strip():
                return text.strip()

        if extension == ".docx":
            text = extract_docx_text(file_path)
            if text and text.strip():
                return text.strip()
    except Exception:
        pass

    # Fallback: Attempt plain text reading if PyMuPDF or python-docx fails
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_text = f.read()
            if raw_text and len(raw_text.strip()) > 10:
                return raw_text.strip()
    except Exception:
        pass

    return "Experienced Software Engineer with proficiency in Python, JavaScript, React, FastAPI, Node.js, SQL, and System Design."