import sys
import asyncio
import hashlib

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from app.db.connection import connect_to_mongodb, get_database, close_mongodb_connection
from app.services.ats_service import ATSService
from app.services.analysis_service import AnalysisService
from app.services.job_service import JobService
from app.schemas.application import JobMatchRequest

# 4 DIVERSE RESUMES
RESUME_A_STAFF_ENG = """
John Doe | Mountain View, CA | +1-650-555-0199 | john.doe@email.com | linkedin.com/in/johndoe | github.com/johndoe
SUMMARY
Senior Staff Distributed Systems Engineer with 12+ years experience architecting high-throughput distributed databases and cloud infrastructure handling 10M+ QPS.
EXPERIENCE
Google - Staff Software Engineer (2018 - Present)
- Architected and led development of distributed cache tier in C++ and Go, reducing P99 query latency by 42% across 500+ microservices.
- Scaled Kafka event streaming pipeline to process 15B messages daily with 99.999% availability.
- Mentored team of 14 engineers and established automated CI/CD testing pipelines in Kubernetes and Bazel.
Meta - Senior Software Engineer (2014 - 2018)
- Designed real-time distributed key-value storage engine in C++ and Rust, saving $4.2M in annual server hardware costs.
- Reduced database failover recovery time from 45 seconds to 350ms using Raft consensus protocol.
EDUCATION
Stanford University - M.S. in Computer Science (Distributed Systems)
UC Berkeley - B.S. in Electrical Engineering & Computer Science
SKILLS
Languages: C++, Go, Rust, Python, Java
Distributed Systems: Raft, Paxos, Kafka, gRPC, Redis, Cassandra, RocksDB
Infrastructure: Kubernetes, Docker, AWS, GCP, Terraform, Linux Internals
"""

RESUME_B_FRESHER_ARTS = """
Alex Smith
Email: alex.smith@email.com
OBJECTIVE
Looking for an entry level position where I can utilize my customer service and typing skills.
EDUCATION
State College - Bachelor of Arts in History (2024)
EXPERIENCE
Campus Bookstore - Clerk (2023 - 2024)
- Assisted customers at checkout.
- Stocked shelves with books and supplies.
- Answered phone calls.
SKILLS
Microsoft Word, Typing (60 WPM), Customer Service, Time Management
"""

RESUME_C_FULLSTACK_DEV = """
Emily Chen | Seattle, WA | +1-206-555-0144 | emily.chen@email.com | linkedin.com/in/emilychen
PROFESSIONAL SUMMARY
Full Stack Developer with 3 years of experience building modern web applications using React, Next.js, Node.js, and PostgreSQL.
EXPERIENCE
TechCorp - Full Stack Developer (2022 - Present)
- Developed responsive dashboard features using Next.js and TypeScript, increasing user session duration by 18%.
- Built RESTful APIs and PostgreSQL database schemas using Node.js and Prisma ORM.
- Integrated Stripe payment gateway and automated email notifications using SendGrid.
StartUp Studio - Junior Web Developer (2021 - 2022)
- Built 10+ landing pages using React, Tailwind CSS, and HTML5.
- Collaborated with UX team to improve website accessibility score from 65 to 94.
EDUCATION
University of Washington - B.S. in Informatics (2021)
SKILLS
Frontend: React, Next.js, TypeScript, Tailwind CSS, HTML/CSS
Backend: Node.js, Express, Python, FastAPI, PostgreSQL, MongoDB, Prisma
Tools: Git, Docker, Jest, AWS (S3, EC2)
"""

RESUME_D_SURGEON = """
Dr. Marcus Vance, MD | Boston, MA | +1-617-555-0182 | mvance@hospital.org
SUMMARY
Board-Certified General Surgeon with 9 years of operative experience specializing in minimally invasive laparoscopic and robotic-assisted abdominal surgeries.
CLINICAL EXPERIENCE
Massachusetts General Hospital - Attending General Surgeon (2018 - Present)
- Performed over 1,200 successful surgical procedures with a 98.4% favorable outcome rate.
- Reduced post-operative infection rates by 22% through implementation of sterile surgical checklist protocols.
- Supervised and trained 16 surgical residents per academic year.
Boston Medical Center - Surgical Resident (2013 - 2018)
- Completed 5-year ACGME-accredited general surgery residency with commendation.
EDUCATION & CREDENTIALS
Harvard Medical School - Doctor of Medicine (MD)
Dartmouth College - B.A. in Biochemistry
Certifications: American Board of Surgery (ABS), ATLS, ACLS
SKILLS
Laparoscopic Surgery, Robotic Surgery (da Vinci), Trauma Care, Patient Triage, Electronic Health Records (Epic)
"""

JD_1_FULLSTACK = """
Full Stack Web Engineer
We are seeking a Full Stack Web Engineer with experience building responsive web apps with React, Next.js, TypeScript, Node.js, and PostgreSQL.
Requirements:
- Strong proficiency in React, TypeScript, Next.js, and Node.js
- Experience with PostgreSQL, Prisma, REST APIs
- Familiarity with Tailwind CSS and Docker
"""

JD_2_DATA_INFRA = """
Principal Distributed Systems / Storage Architect
Seeking a Principal Infrastructure Engineer with 10+ years experience in distributed storage engines, Raft/Paxos consensus, C++, Go, and Kafka handling massive scale.
Requirements:
- Expert in C++, Go, Rust, Raft, Distributed consensus, Kafka, low-latency DB engines
- Track record scaling distributed systems to millions of QPS
"""

async def run_regression():
    ats_service = ATSService()
    
    print("=" * 70)
    print("STEP 1: STANDALONE ATS SCORING (NO JD) FOR 4 DIFFERENT RESUMES")
    print("=" * 70)
    
    resumes = [
        ("Resume A (Senior Staff Distributed Systems)", RESUME_A_STAFF_ENG),
        ("Resume B (Entry-Level Arts Fresher)", RESUME_B_FRESHER_ARTS),
        ("Resume C (Mid-Level Full Stack Dev)", RESUME_C_FULLSTACK_DEV),
        ("Resume D (Medical Surgeon)", RESUME_D_SURGEON),
    ]
    
    standalone_scores = {}
    for label, text in resumes:
        h = hashlib.sha256(text.encode()).hexdigest()[:12]
        analysis = ats_service.analyze(text, job_description=None)
        standalone_scores[label] = analysis.ats_score
        print(f"[{label}] (hash: {h})\n  -> ATS Score: {analysis.ats_score}/100\n  -> Summary: {analysis.summary[:80]}...\n")
        assert 0 <= analysis.ats_score <= 100
        assert len(analysis.strengths) > 0
        assert len(analysis.weaknesses) > 0

    # Ensure scores are genuinely differentiated
    unique_scores = set(standalone_scores.values())
    print(f"Standalone Unique Scores Count: {len(unique_scores)}/4: {standalone_scores}")
    assert len(unique_scores) >= 3, f"Expected varied scores, got: {standalone_scores}"
    
    print("=" * 70)
    print("STEP 2: ATS SCORING AGAINST SAME FULL STACK JD FOR 4 RESUMES")
    print("=" * 70)
    
    jd1_scores = {}
    for label, text in resumes:
        analysis = ats_service.analyze(text, job_description=JD_1_FULLSTACK)
        jd1_scores[label] = analysis.ats_score
        print(f"[{label}] against Full Stack JD:\n  -> Score: {analysis.ats_score}/100\n  -> Missing Skills: {analysis.missing_skills[:3]}\n")

    print(f"JD-Matched Scores: {jd1_scores}")
    assert jd1_scores["Resume C (Mid-Level Full Stack Dev)"] > jd1_scores["Resume B (Entry-Level Arts Fresher)"]
    assert jd1_scores["Resume C (Mid-Level Full Stack Dev)"] > jd1_scores["Resume D (Medical Surgeon)"]
    
    print("=" * 70)
    print("STEP 3: SAME RESUME + SAME JD DETERMINISM CHECK")
    print("=" * 70)
    run1 = ats_service.analyze(RESUME_C_FULLSTACK_DEV, job_description=JD_1_FULLSTACK)
    run2 = ats_service.analyze(RESUME_C_FULLSTACK_DEV, job_description=JD_1_FULLSTACK)
    print(f"Resume C Run 1: {run1.ats_score} | Run 2: {run2.ats_score}")
    assert abs(run1.ats_score - run2.ats_score) <= 5, "Scores should be stable and consistent"

    print("=" * 70)
    print("STEP 4: SAME RESUME + DIFFERENT JD SENSITIVITY CHECK")
    print("=" * 70)
    analysis_fs = ats_service.analyze(RESUME_A_STAFF_ENG, job_description=JD_1_FULLSTACK)
    analysis_infra = ats_service.analyze(RESUME_A_STAFF_ENG, job_description=JD_2_DATA_INFRA)
    print(f"Resume A (Staff Infra) vs FullStack JD -> Score: {analysis_fs.ats_score}/100")
    print(f"Resume A (Staff Infra) vs Infra Architect JD -> Score: {analysis_infra.ats_score}/100")
    print(f"Missing in FullStack: {analysis_fs.missing_skills[:3]}")
    print(f"Missing in Infra: {analysis_infra.missing_skills[:3]}")
    assert analysis_infra.ats_score > analysis_fs.ats_score, "Infra resume should score much higher for Infra JD than FullStack JD"

    print("\n" + "=" * 70)
    print("ALL ATS REGRESSION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_regression())
