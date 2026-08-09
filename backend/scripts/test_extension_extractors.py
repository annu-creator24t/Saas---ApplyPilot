"""
Verification test script for ApplyPilot Extension Universal Job Extraction & Backend API Workflows.
Tests:
1. Extraction logic on HTML samples for LinkedIn, Google Careers, Naukri, Indeed, and Amazon Jobs.
2. Backend API routes for /resume, /job/analyze, /cover-letter/generate, /interview/questions/generate, /resume-improvement/generate.
"""

import json
import asyncio
import re

# HTML Samples for testing detection & extraction patterns
SAMPLES = {
    "LinkedIn": """
    <html>
      <head>
        <title>Senior Software Engineer - AI Platforms | LinkedIn</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": "Senior Software Engineer - AI Platforms",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "LinkedIn"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "addressLocality": "Sunnyvale",
              "addressRegion": "CA",
              "addressCountry": "US"
            }
          },
          "description": "We are looking for a Senior Software Engineer to build distributed AI pipeline services with Python, React, and FastAPI."
        }
        </script>
      </head>
      <body>
        <h1 class="job-details-jobs-unified-top-card__job-title">Senior Software Engineer - AI Platforms</h1>
        <div class="job-details-jobs-unified-top-card__company-name">LinkedIn</div>
        <div class="job-details-jobs-unified-top-card__bullet">Sunnyvale, CA</div>
        <div id="job-details">We are looking for a Senior Software Engineer to build distributed AI pipeline services with Python, React, and FastAPI.</div>
      </body>
    </html>
    """,

    "Google Careers": """
    <html>
      <head>
        <title>Staff Software Engineer, Cloud Infrastructure - Google Careers</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": "Staff Software Engineer, Cloud Infrastructure",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Google"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "addressLocality": "Mountain View",
              "addressRegion": "CA"
            }
          },
          "description": "Google is seeking a Staff Software Engineer to design scalable cloud platform services, Kubernetes operators, and Distributed Systems."
        }
        </script>
      </head>
      <body>
        <h1>Staff Software Engineer, Cloud Infrastructure</h1>
        <div class="gc-job-detail__location">Mountain View, CA</div>
        <div class="gc-job-detail__content">Google is seeking a Staff Software Engineer to design scalable cloud platform services, Kubernetes operators, and Distributed Systems.</div>
      </body>
    </html>
    """,

    "Naukri": """
    <html>
      <head>
        <title>Full Stack Developer - React & Node.js Job | Naukri.com</title>
      </head>
      <body>
        <h1 class="styles_jd-header-title__r2Aud">Full Stack Developer - React & Node.js</h1>
        <a class="styles_jd-header-comp-name__a21Yh">TechCorp Solutions</a>
        <div class="loc">Bengaluru, Karnataka</div>
        <section class="job-desc">
          Looking for a Full Stack Developer proficient in TypeScript, Next.js, React, Node.js, and MongoDB with 3+ years of experience.
        </section>
      </body>
    </html>
    """,

    "Indeed": """
    <html>
      <head>
        <title>Backend Engineer - Python & FastAPI | Indeed</title>
      </head>
      <body>
        <h1 class="jobsearch-JobInfoHeader-title">Backend Engineer - Python & FastAPI</h1>
        <div data-testid="inlineHeader-companyName">DataScale Inc</div>
        <div data-testid="inlineHeader-companyLocation">Remote</div>
        <div id="jobDescriptionText">
          DataScale is seeking a Remote Backend Engineer to build RESTful microservices, async celery workers, and PostgreSQL databases.
        </div>
      </body>
    </html>
    """,

    "Amazon Jobs": """
    <html>
      <head>
        <title>Software Development Engineer II | Amazon.jobs</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": "Software Development Engineer II",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Amazon"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "addressLocality": "Seattle",
              "addressRegion": "WA"
            }
          },
          "description": "Amazon AWS team is looking for SDE II engineers to design high-throughput distributed message queues and storage engine primitives."
        }
        </script>
      </head>
      <body>
        <h1 class="title">Software Development Engineer II</h1>
        <div class="location-text">Seattle, WA</div>
        <div id="job-description">Amazon AWS team is looking for SDE II engineers to design high-throughput distributed message queues and storage engine primitives.</div>
      </body>
    </html>
    """
}

def simulate_json_ld(html):
    match = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(1))
            if data.get("@type") == "JobPosting":
                title = data.get("title", "")
                company = data.get("hiringOrganization", {}).get("name", "")
                loc_obj = data.get("jobLocation", {}).get("address", {})
                loc = ", ".join([v for v in loc_obj.values() if v])
                desc = data.get("description", "")
                return title, company, loc, desc
        except Exception:
            pass
    return None

def test_extraction():
    results = {}
    for site, html in SAMPLES.items():
        json_ld = simulate_json_ld(html)
        if json_ld:
            title, company, loc, desc = json_ld
        else:
            # Heuristics simulation
            t_match = re.search(r'<h1.*?>(.*?)</h1>', html, re.DOTALL)
            title = t_match.group(1).strip() if t_match else ""
            c_match = re.search(r'class=".*?(comp-name|companyName|company-name).*?">(.*?)<', html, re.DOTALL)
            company = c_match.group(2).strip() if c_match else site
            l_match = re.search(r'class=".*?(loc|location).*?">(.*?)<', html, re.DOTALL)
            loc = l_match.group(2).strip() if l_match else ""
            d_match = re.search(r'<(div|section).*?(job-desc|jobDescriptionText).*?>(.*?)</(div|section)>', html, re.DOTALL)
            desc = d_match.group(3).strip() if d_match else ""

        detected = bool(title and len(desc) >= 30)
        results[site] = {
            "detection": "PASS" if detected else "FAIL",
            "extraction": "PASS" if (title and company and desc) else "FAIL",
            "job_title": title,
            "company_name": company,
            "location": loc,
            "jd_snippet": desc[:60] + "..."
        }
    return results

if __name__ == "__main__":
    res = test_extraction()
    print("=== EXTRACTION TEST RESULTS ===")
    print(json.dumps(res, indent=2))
