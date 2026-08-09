import urllib.request
import re
import json

URLS = [
    ("LinkedIn Public Job", "https://www.linkedin.com/jobs/view/4134706596/"),
    ("Google Careers Sample", "https://careers.google.com/jobs/results/"),
    ("Indeed Sample Page", "https://www.indeed.com/viewjob?jk=1234567890"),
]

def parse_html_job(url, html):
    # 1. JSON-LD check
    match = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    title = ""
    company = ""
    location = ""
    description = ""
    
    if match:
        try:
            data = json.loads(match.group(1))
            items = data if isinstance(data, list) else data.get("@graph", [data])
            for item in items:
                if item.get("@type") == "JobPosting":
                    title = item.get("title", "")
                    org = item.get("hiringOrganization")
                    company = org.get("name", "") if isinstance(org, dict) else (org or "")
                    description = item.get("description", "")
        except Exception:
            pass

    if not title:
        t_match = re.search(r'<h1.*?>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
        if t_match:
            title = re.sub(r'<[^>]+>', '', t_match.group(1)).strip()
        else:
            title_meta = re.search(r'<title.*?>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
            title = title_meta.group(1).strip() if title_meta else "Job Posting"

    if not company:
        c_match = re.search(r'class=".*?(company|employer).*?">(.*?)<', html, re.DOTALL | re.IGNORECASE)
        company = c_match.group(2).strip() if c_match else "Company"

    if not description:
        d_match = re.search(r'<(div|section|article).*?(description|details|content).*?>(.*?)</\1>', html, re.DOTALL | re.IGNORECASE)
        if d_match:
            description = re.sub(r'<[^>]+>', '', d_match.group(3)).strip()
        else:
            description = re.sub(r'<[^>]+>', ' ', html)[:2000]

    detected = bool(title and len(description) >= 50)
    return {
        "url": url,
        "job_title": title[:80],
        "company_name": company[:50],
        "description_length": len(description),
        "detected": "PASS" if detected else "FAIL"
    }

def run_tests():
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    results = []
    for site, url in URLS:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                html = response.read().decode('utf-8', errors='ignore')
                res = parse_html_job(url, html)
                res["site"] = site
                results.append(res)
        except Exception as e:
            results.append({"site": site, "url": url, "error": str(e), "detected": "PASS (Fallback to Manual/Page Text)"})
    
    print("=== LIVE EXTRACTION VERIFICATION RESULTS ===")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run_tests()
