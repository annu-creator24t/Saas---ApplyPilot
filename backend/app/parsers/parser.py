import os

from app.parsers.pdf_parser import extract_pdf_text
from app.parsers.docx_parser import extract_docx_text


def extract_resume_text(file_path: str) -> str:

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    if extension == ".docx":
        return extract_docx_text(file_path)

    raise Exception("Unsupported resume format.")