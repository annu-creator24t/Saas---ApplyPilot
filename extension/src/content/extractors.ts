export interface ExtractedJobData {
  job_title: string;
  company_name: string;
  location?: string;
  job_url: string;
  job_description: string;
  source_site: string;
}

export function extractJobFromDOM(): ExtractedJobData {
  const url = window.location.href;
  const hostname = window.location.hostname.toLowerCase();

  let job_title = "";
  let company_name = "";
  let location = "";
  let job_description = "";
  let source_site = "General";

  if (hostname.includes("linkedin.com")) {
    source_site = "LinkedIn";
    job_title =
      getText([
        ".job-details-jobs-unified-top-card__job-title",
        ".jobs-unified-top-card__job-title",
        ".top-card-layout__title",
        "h1.t-24",
      ]) || document.title.split("|")[0].trim();

    company_name =
      getText([
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name",
        ".topcard__org-name-link",
        ".job-details-jobs-unified-top-card__primary-description span",
      ]) || "";

    location =
      getText([
        ".job-details-jobs-unified-top-card__bullet",
        ".jobs-unified-top-card__bullet",
        ".topcard__flavor--bullet",
      ]) || "";

    job_description =
      getText([
        "#job-details",
        ".jobs-description__content",
        ".description__text",
        ".jobs-box__html-content",
      ]) || "";
  } else if (hostname.includes("indeed.com")) {
    source_site = "Indeed";
    job_title =
      getText([
        ".jobsearch-JobInfoHeader-title",
        "h1.jobsearch-JobInfoHeader-title",
        "h1",
      ]) || "";

    company_name =
      getText([
        '[data-testid="inlineHeader-companyName"]',
        ".jobsearch-InlineCompanyHeader-companyHeader",
        ".jobsearch-CompanyReview--dataHeader",
      ]) || "";

    location =
      getText([
        '[data-testid="inlineHeader-companyLocation"]',
        ".jobsearch-JobInfoHeader-subtitle",
      ]) || "";

    job_description =
      getText(["#jobDescriptionText", ".jobsearch-jobDescriptionText"]) || "";
  } else if (hostname.includes("glassdoor.com")) {
    source_site = "Glassdoor";
    job_title = getText(['[data-test="job-title"]', "h1"]) || "";
    company_name = getText(['[data-test="employer-name"]', ".EmployerProfile_employerName__3wu0i"]) || "";
    location = getText(['[data-test="location"]']) || "";
    job_description = getText(['.jobDescriptionContent', '[class*="JobDetails_jobDescription"]']) || "";
  } else if (hostname.includes("greenhouse.io")) {
    source_site = "Greenhouse";
    job_title = getText([".app-title", "h1.heading", "h1"]) || "";
    company_name = getText([".company-name"]) || "";
    location = getText([".location"]) || "";
    job_description = getText(["#content", "#main"]) || "";
  } else if (hostname.includes("lever.co")) {
    source_site = "Lever";
    job_title = getText([".posting-header h2", "h2"]) || "";
    company_name = getText([".main-header p", ".posting-header"]) || "";
    location = getText([".location"]) || "";
    job_description = getText([".section-page", ".content"]) || "";
  }

  // Generic Fallback if title or description missing
  if (!job_title) {
    const h1 = document.querySelector("h1");
    job_title = h1 ? h1.innerText.trim() : document.title;
  }

  if (!job_description) {
    const mainEl = document.querySelector("main") || document.querySelector("article") || document.body;
    job_description = mainEl ? mainEl.innerText.slice(0, 4000).trim() : "";
  }

  return {
    job_title: cleanText(job_title),
    company_name: cleanText(company_name),
    location: cleanText(location),
    job_url: url,
    job_description: cleanText(job_description),
    source_site,
  };
}

function getText(selectors: string[]): string {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      return el.textContent.trim();
    }
  }
  return "";
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
