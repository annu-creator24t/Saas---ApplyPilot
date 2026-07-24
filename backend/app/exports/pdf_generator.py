from io import BytesIO
from typing import Any

from reportlab.lib.styles import StyleSheet1, getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from app.core.logger import logger
from app.handlers.exceptions import AIException


def _create_document() -> tuple[
    BytesIO,
    SimpleDocTemplate,
    StyleSheet1,
    list,
]:
    """
    Create a new PDF document.
    """
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()
    story: list = []

    return buffer, document, styles, story


def _add_title(
    story: list,
    styles: StyleSheet1,
    title: str,
) -> None:
    story.append(
        Paragraph(
            f"<b>{title}</b>",
            styles["Title"],
        )
    )
    story.append(Spacer(1, 20))


def _add_heading(
    story: list,
    styles: StyleSheet1,
    heading: str,
) -> None:
    story.append(
        Paragraph(
            f"<b>{heading}</b>",
            styles["Heading2"],
        )
    )


def _add_paragraph(
    story: list,
    styles: StyleSheet1,
    text: str,
) -> None:
    story.append(
        Paragraph(
            text,
            styles["BodyText"],
        )
    )


def _add_bullet_list(
    story: list,
    styles: StyleSheet1,
    items: list[str],
) -> None:
    for item in items:
        _add_paragraph(
            story,
            styles,
            f"• {item}",
        )


def _add_space(story: list, height: int = 15) -> None:
    story.append(Spacer(1, height))


def _build_pdf(
    buffer: BytesIO,
    document: SimpleDocTemplate,
    story: list,
) -> BytesIO:
    document.build(story)
    buffer.seek(0)
    return buffer


def generate_ats_pdf(
    analysis: dict[str, Any],
) -> BytesIO:
    """
    Generate ATS analysis PDF.
    """
    try:
        buffer, document, styles, story = _create_document()

        _add_title(story, styles, "ApplyPilot ATS Report")

        _add_paragraph(
            story,
            styles,
            f"<b>ATS Score:</b> {analysis.get('ats_score', 'N/A')}",
        )

        _add_space(story)

        for section in (
            "Strengths",
            "Weaknesses",
            "Recommendations",
        ):
            _add_heading(story, styles, section)
            _add_bullet_list(
                story,
                styles,
                analysis.get(section.lower(), []),
            )
            _add_space(story)

        return _build_pdf(buffer, document, story)

    except Exception:
        logger.exception("Failed to generate ATS PDF.")

        raise AIException(
            "Failed to generate ATS PDF.",
            error_code="PDF_GENERATION_ERROR",
        )


def generate_cover_letter_pdf(
    cover_letter: str,
) -> BytesIO:
    """
    Generate cover letter PDF.
    """
    try:
        buffer, document, styles, story = _create_document()

        _add_title(
            story,
            styles,
            "ApplyPilot Cover Letter",
        )

        for paragraph in cover_letter.split("\n"):
            if paragraph.strip():
                _add_paragraph(
                    story,
                    styles,
                    paragraph.strip(),
                )
                _add_space(story, 10)

        return _build_pdf(buffer, document, story)

    except Exception:
        logger.exception(
            "Failed to generate cover letter PDF."
        )

        raise AIException(
            "Failed to generate cover letter PDF.",
            error_code="PDF_GENERATION_ERROR",
        )


def generate_interview_pdf(
    interview: dict[str, Any],
) -> BytesIO:
    """
    Generate interview questions PDF.
    """
    try:
        buffer, document, styles, story = _create_document()

        _add_title(
            story,
            styles,
            "ApplyPilot Interview Questions",
        )

        sections = {
            "Technical Questions": "technical",
            "Behavioral Questions": "behavioral",
            "HR Questions": "hr",
        }

        for title, key in sections.items():
            _add_heading(story, styles, title)

            for index, question in enumerate(
                interview.get(key, []),
                start=1,
            ):
                _add_paragraph(
                    story,
                    styles,
                    f"{index}. {question}",
                )

            _add_space(story)

        return _build_pdf(buffer, document, story)

    except Exception:
        logger.exception(
            "Failed to generate interview PDF."
        )

        raise AIException(
            "Failed to generate interview PDF.",
            error_code="PDF_GENERATION_ERROR",
        )


def generate_resume_improvement_pdf(
    improvement: dict[str, Any],
) -> BytesIO:
    """
    Generate resume improvement PDF.
    """
    try:
        buffer, document, styles, story = _create_document()

        _add_title(
            story,
            styles,
            "ApplyPilot Resume Improvement",
        )

        sections = [
            (
                "Professional Summary",
                improvement.get(
                    "professional_summary",
                    "",
                ),
            ),
            (
                "Experience",
                improvement.get(
                    "experience",
                    "",
                ),
            ),
            (
                "Projects",
                improvement.get(
                    "projects",
                    "",
                ),
            ),
        ]

        for heading, value in sections:
            _add_heading(story, styles, heading)
            _add_paragraph(story, styles, value)
            _add_space(story)

        _add_heading(story, styles, "Skills")
        _add_bullet_list(
            story,
            styles,
            improvement.get("skills", []),
        )

        _add_space(story)

        _add_heading(
            story,
            styles,
            "Recommendations",
        )

        _add_bullet_list(
            story,
            styles,
            improvement.get(
                "recommendations",
                [],
            ),
        )

        return _build_pdf(buffer, document, story)

    except Exception:
        logger.exception(
            "Failed to generate resume improvement PDF."
        )

        raise AIException(
            "Failed to generate resume improvement PDF.",
            error_code="PDF_GENERATION_ERROR",
        )