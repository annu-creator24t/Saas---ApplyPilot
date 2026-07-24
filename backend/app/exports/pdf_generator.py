from io import BytesIO

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


def generate_ats_pdf(analysis: dict) -> BytesIO:
    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph("<b>ApplyPilot ATS Report</b>", styles["Title"])
    )

    story.append(Spacer(1, 12))

    story.append(
        Paragraph(
            f"<b>ATS Score:</b> {analysis.get('ats_score')}",
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 12))

    story.append(
        Paragraph("<b>Strengths</b>", styles["Heading2"])
    )

    for item in analysis.get("strengths", []):
        story.append(
            Paragraph(f"• {item}", styles["BodyText"])
        )

    story.append(Spacer(1, 12))

    story.append(
        Paragraph("<b>Weaknesses</b>", styles["Heading2"])
    )

    for item in analysis.get("weaknesses", []):
        story.append(
            Paragraph(f"• {item}", styles["BodyText"])
        )

    story.append(Spacer(1, 12))

    story.append(
        Paragraph("<b>Recommendations</b>", styles["Heading2"])
    )

    for item in analysis.get("recommendations", []):
        story.append(
            Paragraph(f"• {item}", styles["BodyText"])
        )

    doc.build(story)

    buffer.seek(0)

    return buffer


def generate_cover_letter_pdf(
    cover_letter: str,
) -> BytesIO:

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>ApplyPilot Cover Letter</b>",
            styles["Title"],
        )
    )

    story.append(Spacer(1, 20))

    for paragraph in cover_letter.split("\n"):

        if paragraph.strip():

            story.append(
                Paragraph(
                    paragraph.strip(),
                    styles["BodyText"],
                )
            )

            story.append(Spacer(1, 10))

    doc.build(story)

    buffer.seek(0)

    return buffer


def generate_interview_pdf(
    interview: dict,
) -> BytesIO:

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>ApplyPilot Interview Questions</b>",
            styles["Title"],
        )
    )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "<b>Technical Questions</b>",
            styles["Heading2"],
        )
    )

    for i, question in enumerate(
        interview.get("technical", []),
        start=1,
    ):
        story.append(
            Paragraph(
                f"{i}. {question}",
                styles["BodyText"],
            )
        )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Behavioral Questions</b>",
            styles["Heading2"],
        )
    )

    for i, question in enumerate(
        interview.get("behavioral", []),
        start=1,
    ):
        story.append(
            Paragraph(
                f"{i}. {question}",
                styles["BodyText"],
            )
        )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>HR Questions</b>",
            styles["Heading2"],
        )
    )

    for i, question in enumerate(
        interview.get("hr", []),
        start=1,
    ):
        story.append(
            Paragraph(
                f"{i}. {question}",
                styles["BodyText"],
            )
        )

    doc.build(story)

    buffer.seek(0)

    return buffer


def generate_resume_improvement_pdf(
    improvement: dict,
) -> BytesIO:

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>ApplyPilot Resume Improvement</b>",
            styles["Title"],
        )
    )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "<b>Professional Summary</b>",
            styles["Heading2"],
        )
    )

    story.append(
        Paragraph(
            improvement.get(
                "professional_summary",
                "",
            ),
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Skills</b>",
            styles["Heading2"],
        )
    )

    for skill in improvement.get("skills", []):

        story.append(
            Paragraph(
                f"• {skill}",
                styles["BodyText"],
            )
        )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Experience</b>",
            styles["Heading2"],
        )
    )

    story.append(
        Paragraph(
            improvement.get("experience", ""),
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Projects</b>",
            styles["Heading2"],
        )
    )

    story.append(
        Paragraph(
            improvement.get("projects", ""),
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Recommendations</b>",
            styles["Heading2"],
        )
    )

    for recommendation in improvement.get(
        "recommendations",
        [],
    ):

        story.append(
            Paragraph(
                f"• {recommendation}",
                styles["BodyText"],
            )
        )

    doc.build(story)

    buffer.seek(0)

    return buffer