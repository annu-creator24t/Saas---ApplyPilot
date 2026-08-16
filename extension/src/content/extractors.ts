export interface ExtractedJobData {
  job_title: string;
  company_name: string;
  location?: string;
  job_url: string;
  job_description: string;
  source_site: string;
  detected: boolean;
  confidence?: "high" | "medium" | "low" | "none";
  source?:
    | "jsonld"
    | "linkedin"
    | "indeed"
    | "naukri"
    | "google"
    | "amazon"
    | "microsoft"
    | "glassdoor"
    | "greenhouse"
    | "lever"
    | "internshala"
    | "generic"
    | "none";
  status_message?: string;
}

/**
 * Universal job extractor with priority hierarchy, viewport-awareness,
 * and strict validation to prevent incorrect job detection.
 */
export function extractJobFromDOM(): ExtractedJobData {
  const url = window.location.href;
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  // -------------------------------------------------------------
  // 1. DOMAIN-SPECIFIC EXTRACTION (Highest precision)
  // -------------------------------------------------------------

  if (hostname.includes("linkedin.com")) {
    return extractLinkedInJob(url, pathname);
  }

  if (hostname.includes("indeed.com")) {
    return extractIndeedJob(url);
  }

  if (hostname.includes("naukri.com")) {
    return extractNaukriJob(url);
  }

  if (hostname.includes("greenhouse.io")) {
    return extractGreenhouseJob(url);
  }

  if (hostname.includes("lever.co")) {
    return extractLeverJob(url);
  }

  if (hostname.includes("careers.google.com") || (hostname.includes("google.com") && pathname.includes("/about/careers"))) {
    return extractGoogleCareersJob(url);
  }

  if (hostname.includes("amazon.jobs")) {
    return extractAmazonJobsJob(url);
  }

  if (hostname.includes("careers.microsoft.com") || (hostname.includes("microsoft.com") && pathname.includes("/careers"))) {
    return extractMicrosoftCareersJob(url);
  }

  if (hostname.includes("glassdoor.com")) {
    return extractGlassdoorJob(url);
  }

  if (hostname.includes("internshala.com")) {
    return extractInternshalaJob(url);
  }

  // -------------------------------------------------------------
  // 2. SCHEMA.ORG JSON-LD JOBPOSTING (Universal standard on job pages)
  // -------------------------------------------------------------
  const jsonLd = extractFromJsonLd();
  if (jsonLd && jsonLd.title && jsonLd.description && jsonLd.description.length >= 40) {
    const validated = validateCandidate({
      job_title: jsonLd.title,
      company_name: jsonLd.company || formatDomainName(hostname),
      location: jsonLd.location || "",
      job_url: url,
      job_description: jsonLd.description,
      source_site: getSiteNameFromHostname(hostname),
      detected: true,
      confidence: "high",
      source: "jsonld",
    });

    if (validated.detected) {
      return validated;
    }
  }

  // -------------------------------------------------------------
  // 3. GENERIC CORPORATE CAREER PAGE HEURISTIC
  // -------------------------------------------------------------
  return extractGenericCareerJob(url, hostname);
}

// =================================================================
// LINKEDIN EXTRACTION STRATEGY
// =================================================================

function extractLinkedInJob(url: string, pathname: string): ExtractedJobData {
  const isJobDetailsPage =
    pathname.includes("/jobs/view") ||
    pathname.includes("/jobs/search") ||
    pathname.includes("/jobs/collections") ||
    url.includes("currentJobId=");

  // CASE A: Dedicated LinkedIn Job Posting / Details Page
  if (isJobDetailsPage) {
    const jobDetailsResult = extractLinkedInJobDetailsPage(url);
    if (jobDetailsResult.detected) {
      return jobDetailsResult;
    }
  }

  // CASE B: Direct LinkedIn Post / Update Page (e.g. /feed/update/urn:li:activity:...)
  const isDirectPostPage = pathname.includes("/feed/update/") || pathname.includes("/posts/");
  if (isDirectPostPage) {
    const mainPost = document.querySelector<HTMLElement>(
      ".feed-shared-update-v2, div[data-urn*='activity'], div[data-activity-urn], article"
    );
    if (mainPost) {
      const parsed = extractJobFromSingleLinkedInPost(mainPost, url);
      if (parsed.detected) return parsed;
    }
  }

  // CASE C: LinkedIn Feed Stream (https://www.linkedin.com/feed/)
  return extractLinkedInFeedJob(url);
}

/**
 * Dedicated LinkedIn Job Page extractor (/jobs/view/...)
 */
function extractLinkedInJobDetailsPage(url: string): ExtractedJobData {
  const job_title = getText([
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title",
    ".jobs-search__job-details--container h2",
    ".jobs-details__main-content h1",
    ".jobs-details__main-content h2",
    ".top-card-layout__title",
    ".topcard__title",
    "h1.t-24",
    "h1.job-title",
    ".job-details-jobs-unified-top-card__container h1",
  ]);

  const company_name = getText([
    ".job-details-jobs-unified-top-card__company-name a",
    ".jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name",
    ".topcard__org-name-link",
    ".job-details-jobs-unified-top-card__primary-description a",
    ".jobs-details__main-content [class*='company']",
  ]);

  const location = getText([
    ".job-details-jobs-unified-top-card__bullet",
    ".jobs-unified-top-card__bullet",
    ".topcard__flavor--bullet",
    ".job-details-jobs-unified-top-card__primary-description span:nth-child(2)",
    ".jobs-unified-top-card__workplace-type",
    "span.jobs-unified-top-card__bullet",
  ]);

  const job_description = getText([
    "#job-details",
    ".jobs-description__content",
    ".jobs-description-content__text",
    ".jobs-description__container",
    "article.jobs-description__container",
    ".jobs-description",
    ".description__text",
    ".jobs-box__html-content",
  ]);

  return validateCandidate({
    job_title,
    company_name,
    location,
    job_url: url,
    job_description,
    source_site: "LinkedIn",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "linkedin",
  });
}

/**
 * Robust Viewport-Aware LinkedIn Feed Extractor
 * Identifies the exact post currently in user's viewport or interaction focus.
 */
function extractLinkedInFeedJob(url: string): ExtractedJobData {
  // 1. Check for open post modal / dialog first
  const openModal = document.querySelector<HTMLElement>(
    ".artdeco-modal[role='dialog'], [data-artdeco-is-modal='true'], div.feed-shared-update-v2__modal"
  );
  if (openModal) {
    const modalJob = extractJobFromSingleLinkedInPost(openModal, url);
    if (modalJob.detected) return modalJob;
  }

  // 2. Check for user-interacted post (focused element or expanded "see more")
  const activeEl = document.activeElement;
  if (activeEl && activeEl !== document.body) {
    const postContainer = activeEl.closest<HTMLElement>(
      ".feed-shared-update-v2, div[data-urn*='activity'], div[data-activity-urn]"
    );
    if (postContainer) {
      const interactedJob = extractJobFromSingleLinkedInPost(postContainer, url);
      if (interactedJob.detected) return interactedJob;
    }
  }

  const expandedBtn = document.querySelector<HTMLElement>(
    "button.feed-shared-inline-show-more-text__see-more-less-toggle[aria-expanded='true'], button[aria-expanded='true']"
  );
  if (expandedBtn) {
    const postContainer = expandedBtn.closest<HTMLElement>(
      ".feed-shared-update-v2, div[data-urn*='activity'], div[data-activity-urn]"
    );
    if (postContainer) {
      const expandedJob = extractJobFromSingleLinkedInPost(postContainer, url);
      if (expandedJob.detected) return expandedJob;
    }
  }

  // 3. Viewport geometry: find post most prominently visible on screen
  const postElements = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".feed-shared-update-v2, div[data-urn*='activity'], div[data-activity-urn], article.feed-shared-update-v2"
    )
  );

  if (postElements.length === 0) {
    return {
      job_title: "",
      company_name: "",
      location: "",
      job_url: url,
      job_description: "",
      source_site: "LinkedIn",
      detected: false,
      confidence: "none",
      source: "linkedin",
      status_message: "Please open the job post or job details page to analyze this job.",
    };
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
  const screenCenterY = viewportHeight / 2;

  interface CandidatePost {
    element: HTMLElement;
    visibleHeight: number;
    distFromCenter: number;
  }

  const candidatePosts: CandidatePost[] = [];

  for (const postEl of postElements) {
    const rect = postEl.getBoundingClientRect();
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    // Only consider posts with substantial visible height on screen
    if (visibleHeight >= 100) {
      const postCenterY = (rect.top + rect.bottom) / 2;
      const distFromCenter = Math.abs(postCenterY - screenCenterY);
      candidatePosts.push({ element: postEl, visibleHeight, distFromCenter });
    }
  }

  // Sort candidates: closest to viewport center first
  candidatePosts.sort((a, b) => a.distFromCenter - b.distFromCenter);

  // Evaluate candidate posts in order of visual prominence
  for (const candidate of candidatePosts) {
    const result = extractJobFromSingleLinkedInPost(candidate.element, url);
    if (result.detected && result.confidence !== "none") {
      return result;
    }
  }

  // If no visible post contains a valid job opportunity, return controlled result
  return {
    job_title: "",
    company_name: "",
    location: "",
    job_url: url,
    job_description: "",
    source_site: "LinkedIn",
    detected: false,
    confidence: "none",
    source: "linkedin",
    status_message: "Please open the job post or job details page to analyze this job.",
  };
}

/**
 * Extracts structured job data from a SINGLE LinkedIn feed post element
 */
function extractJobFromSingleLinkedInPost(container: HTMLElement, pageUrl: string): ExtractedJobData {
  // Extract post commentary / description
  const commentaryEl = container.querySelector<HTMLElement>(
    ".feed-shared-update-v2__description, .feed-shared-text, .update-components-text, .feed-shared-inline-show-more-text, .update-components-update-v2__commentary, .feed-shared-text-view"
  );
  const postText = commentaryEl ? cleanText(commentaryEl.innerText || commentaryEl.textContent || "") : cleanText(container.innerText || "");

  // Extract author / actor information
  const actorTitleEl = container.querySelector<HTMLElement>(
    ".update-components-actor__title, .feed-shared-actor__title, .update-components-actor__name, .feed-shared-actor__name"
  );
  const actorSubtitleEl = container.querySelector<HTMLElement>(
    ".update-components-actor__description, .feed-shared-actor__description, .update-components-actor__sub-description"
  );

  const actorTitle = actorTitleEl ? cleanText(actorTitleEl.innerText.split("\n")[0]) : "";
  const actorSubtitle = actorSubtitleEl ? cleanText(actorSubtitleEl.innerText) : "";

  // Check for shared job card attachment (e.g. LinkedIn job attachment)
  const sharedJobCard = container.querySelector<HTMLElement>(
    ".feed-shared-mini-update-v2, .feed-shared-entity, .feed-shared-article, .update-components-article"
  );
  let cardTitle = "";
  let cardSubtitle = "";
  if (sharedJobCard) {
    const cTitleEl = sharedJobCard.querySelector<HTMLElement>(
      ".feed-shared-article__title, .feed-shared-mini-update-v2__title, .update-components-article__title, .feed-shared-entity__title, a[href*='/jobs/view/']"
    );
    const cSubEl = sharedJobCard.querySelector<HTMLElement>(
      ".feed-shared-article__subtitle, .feed-shared-mini-update-v2__subtitle, .update-components-article__subtitle, .feed-shared-entity__description"
    );
    if (cTitleEl) cardTitle = cleanText(cTitleEl.innerText || "");
    if (cSubEl) cardSubtitle = cleanText(cSubEl.innerText || "");
  }

  // 1. Check if the post text is actually about a job opening
  const jobKeywords = /(?:hiring|role\s*:|position\s*:|job\s*title|job\s*opportunity|opening\s+for|we\s*are\s*hiring|is\s*hiring|open\s*positions?|job\s*id|qualifications|responsibilities|experience\s*:|ctc\s*:|salary\s*:|apply\s*(?:link|here|at)|sde\s*[-–—1-3]|software\s+(?:engineer|developer)|full\s*stack|frontend\s*developer|backend\s*developer|data\s*scientist)/i;

  const hasJobContext = jobKeywords.test(postText) || Boolean(cardTitle && cardTitle.length > 5);
  if (!hasJobContext || postText.length < 30) {
    return {
      job_title: "",
      company_name: "",
      location: "",
      job_url: pageUrl,
      job_description: "",
      source_site: "LinkedIn",
      detected: false,
      confidence: "none",
      source: "linkedin",
    };
  }

  let job_title = "";
  let company_name = "";
  let location = "";

  // 2. Explicit key-value labels in post text
  const roleExplicit = postText.match(/(?:Role|Position|Job Title|Profile|Designation|Opportunity)\s*[:\-–—]\s*([^\n\r,•!|–—]{3,60})/i);
  const companyExplicit = postText.match(/(?:Company|Organization|Employer)\s*[:\-–—]\s*([^\n\r,•!|–—]{2,50})/i);
  const locExplicit = postText.match(/(?:Location|Loc|Workplace|Work Location|Based in|City)\s*[:\-–—]\s*([^\n\r•!|–—]{2,60})/i);

  if (roleExplicit && roleExplicit[1]) job_title = roleExplicit[1].trim();
  if (companyExplicit && companyExplicit[1]) company_name = companyExplicit[1].trim();
  if (locExplicit && locExplicit[1]) location = locExplicit[1].trim();

  // 3. Shared job card override if explicit
  if (!job_title && cardTitle) job_title = cardTitle;
  if (!company_name && cardSubtitle) company_name = cardSubtitle;

  // 4. Role + Company contextual phrases
  // e.g. "We are hiring for Software Development Engineer I at Amazon"
  const hiringRoleAtCompany = postText.match(
    /(?:hiring|looking)\s+(?:for\s+an?|for)?\s*[:\-–—]?\s*([A-Za-z0-9\s/\-+&]{3,45}?)\s+(?:at|with)\s+([A-Za-z0-9\s&,.]{2,35})/i
  );
  if (hiringRoleAtCompany) {
    if (!job_title && hiringRoleAtCompany[1] && !/^(someone|candidates|freshers)$/i.test(hiringRoleAtCompany[1].trim())) {
      job_title = hiringRoleAtCompany[1].trim();
    }
    if (!company_name && hiringRoleAtCompany[2] && !/^(our\s+team|our\s+company|the\s+moment)$/i.test(hiringRoleAtCompany[2].trim())) {
      company_name = hiringRoleAtCompany[2].trim();
    }
  }

  // e.g. "Amazon is hiring for Software Development Engineer I"
  const companyHiringRole = postText.match(
    /([A-Z][A-Za-z0-9\s&,.]{1,30})\s+(?:is|are)\s+hiring\s+(?:for\s+an?|for)?\s*[:\-–—]?\s*([A-Za-z0-9\s/\-+&]{3,45})/i
  );
  if (companyHiringRole) {
    if (!company_name && companyHiringRole[1] && !/^(we|they|team|everyone|someone|i)$/i.test(companyHiringRole[1].trim())) {
      company_name = companyHiringRole[1].trim();
    }
    if (!job_title && companyHiringRole[2] && !/^(someone|candidates|freshers|multiple|talented)$/i.test(companyHiringRole[2].trim())) {
      job_title = companyHiringRole[2].trim();
    }
  }

  // 5. Company fallback heuristics
  if (!company_name) {
    const isHiringMatch = postText.match(/([A-Z][A-Za-z0-9\s&]{1,30})\s+(?:is|are)\s+hiring/i);
    const hiringAtMatch = postText.match(/(?:hiring|openings?|opportunities?)\s+(?:at|with)\s+([A-Z][A-Za-z0-9\s&]{1,30})/i);

    if (isHiringMatch && isHiringMatch[1] && !/^(we|they|team|everyone|someone|i)$/i.test(isHiringMatch[1].trim())) {
      company_name = isHiringMatch[1].trim();
    } else if (hiringAtMatch && hiringAtMatch[1]) {
      company_name = hiringAtMatch[1].trim();
    } else if (actorTitle && !/(recruiter|talent|hr|hiring|manager|sourcer|founder|engineer)/i.test(actorTitle)) {
      company_name = actorTitle.split("\n")[0].trim();
    } else if (actorSubtitle) {
      const subMatch = actorSubtitle.match(/(?:at|@|with)\s+([A-Z][A-Za-z0-9\s&]{1,30})/i);
      if (subMatch && subMatch[1]) {
        company_name = subMatch[1].trim();
      }
    }
  }

  // 6. Role fallback heuristics
  if (!job_title) {
    const commonRoles = [
      /(Software Development Engineer\s*(?:I{1,3}|[1-3]|Senior|Lead)?)/i,
      /(Software Engineer\s*(?:I{1,3}|[1-3]|Senior|Lead|Intern)?)/i,
      /(Frontend\s*(?:Engineer|Developer|Lead))/i,
      /(Backend\s*(?:Engineer|Developer|Lead))/i,
      /(Full\s*Stack\s*(?:Engineer|Developer|Lead))/i,
      /(Data\s*(?:Scientist|Engineer|Analyst))/i,
      /(DevOps\s*(?:Engineer|Lead))/i,
      /(Cloud\s*(?:Engineer|Architect))/i,
      /(Machine Learning\s*(?:Engineer|Scientist))/i,
      /(AI\s*(?:Engineer|Researcher))/i,
      /(Product\s*Manager)/i,
      /(QA\s*(?:Engineer|Automation Engineer))/i,
      /(Systems?\s*Engineer)/i,
      /(Mobile\s*(?:Developer|Engineer|iOS|Android))/i,
      /(UI\/UX\s*Designer)/i,
    ];

    for (const pattern of commonRoles) {
      const match = postText.match(pattern);
      if (match && match[1]) {
        job_title = match[1].trim();
        break;
      }
    }
  }

  // 7. Location fallback heuristics
  if (!location) {
    const popularCities = /(Hyderabad|Bangalore|Bengaluru|Pune|Mumbai|Delhi|Noida|Gurgaon|Gurugram|Chennai|Kolkata|San Francisco|Seattle|New York|Austin|Boston|London|Singapore|Dublin|Toronto|Remote)(?:,\s*[A-Za-z\s]+)?/i;
    const mCity = postText.match(popularCities);
    if (mCity && mCity[0]) {
      location = mCity[0].trim();
    }
  }

  // Sanitize strings
  job_title = sanitizeJobTitle(job_title);
  company_name = sanitizeCompanyName(company_name);
  location = sanitizeLocation(location);

  const isValid = Boolean(job_title && (company_name || location) && postText.length >= 40);
  const confidence = (job_title && company_name && location) ? "high" : (job_title && company_name) ? "medium" : "low";

  return validateCandidate({
    job_title,
    company_name,
    location,
    job_url: pageUrl,
    job_description: postText,
    source_site: "LinkedIn",
    detected: isValid,
    confidence: isValid ? confidence : "none",
    source: "linkedin",
  });
}

// =================================================================
// PLATFORM-SPECIFIC EXTRACTORS
// =================================================================

function extractIndeedJob(url: string): ExtractedJobData {
  const job_title = getText([
    ".jobsearch-JobInfoHeader-title",
    "h1.jobsearch-JobInfoHeader-title",
    "h1.jobTitle",
    "h1",
  ]);

  const company_name = getText([
    '[data-testid="inlineHeader-companyName"] a',
    '[data-testid="inlineHeader-companyName"]',
    ".jobsearch-InlineCompanyHeader-companyHeader a",
    ".jobsearch-InlineCompanyHeader-companyHeader",
    ".jobsearch-CompanyReview--dataHeader",
  ]);

  const location = getText([
    '[data-testid="inlineHeader-companyLocation"]',
    ".jobsearch-JobInfoHeader-subtitle",
    "[data-testid='jobsearch-JobInfoHeader-companyLocation']",
  ]);

  const job_description = getText([
    "#jobDescriptionText",
    ".jobsearch-jobDescriptionText",
    "#jobDetailsSection",
  ]);

  return validateCandidate({
    job_title,
    company_name,
    location,
    job_url: url,
    job_description,
    source_site: "Indeed",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "indeed",
  });
}

function extractNaukriJob(url: string): ExtractedJobData {
  const job_title = getText([
    "h1.styles_jd-header-title__r2Aud",
    "h1[class*='jd-header-title']",
    "[class*='jd-header-title']",
    "h1.styles_header-title",
    "h1[title]",
    "h1.title",
    "h1",
  ]);

  const company_name = getText([
    ".styles_jd-header-comp-name__a21Yh a",
    ".styles_jd-header-comp-name__a21Yh",
    "[class*='comp-name'] a",
    "a.comp-name",
    "[class*='comp-name']",
    ".styles_jhc__comp-name a",
    ".styles_jhc__comp-name",
    "a[href*='naukri.com/companies/']",
    ".company-name",
  ]);

  const location = getText([
    "[class*='styles_jhc__location']",
    "[class*='styles_loc']",
    "[class*='location']",
    ".loc",
    "[class*='loc']",
  ]);

  const job_description = getText([
    ".styles_Jd-left-wrapper",
    "[class*='job-desc']",
    "[class*='jobDescription']",
    "[class*='styles_job-desc-container']",
    ".danger-markup",
    "section.job-desc",
    "section.styles_job-desc-container",
  ]);

  return validateCandidate({
    job_title,
    company_name,
    location,
    job_url: url,
    job_description,
    source_site: "Naukri",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "naukri",
  });
}

function extractGreenhouseJob(url: string): ExtractedJobData {
  const job_title = getText([".app-title", "h1.heading", "h1"]);
  const company_name = getText([".company-name", ".logo a", "title"]);
  const location = getText([".location", "[class*='location']"]);
  const job_description = getText(["#content", "#main", "#app-body"]);

  return validateCandidate({
    job_title,
    company_name: company_name.replace(/(Careers|Jobs|at)\s*$/i, "").trim(),
    location,
    job_url: url,
    job_description,
    source_site: "Greenhouse",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "greenhouse",
  });
}

function extractLeverJob(url: string): ExtractedJobData {
  const job_title = getText([".posting-header h2", "h2", "h1"]);
  const company_name = getText([".main-header p", ".posting-header .main-header", ".company-name"]);
  const location = getText([".location", ".workplaceTypes", "[class*='location']"]);
  const job_description = getText([".section-page", ".content", ".section-wrapper"]);

  return validateCandidate({
    job_title,
    company_name: company_name.replace(/(Careers|Jobs|at)\s*$/i, "").trim(),
    location,
    job_url: url,
    job_description,
    source_site: "Lever",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "lever",
  });
}

function extractGoogleCareersJob(url: string): ExtractedJobData {
  const job_title = getText(["h1", ".gc-card__title", "[data-reflection-id] h1"]);
  const location = getText(["[data-reflection-id] [class*='location']", ".gc-job-detail__location", "[class*='location']"]);
  const job_description = getText([
    "[data-reflection-id]",
    ".gc-job-detail__content",
    "[class*='description']",
    "[class*='detail-content']",
  ]);

  return validateCandidate({
    job_title,
    company_name: "Google",
    location,
    job_url: url,
    job_description,
    source_site: "Google Careers",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "google",
  });
}

function extractAmazonJobsJob(url: string): ExtractedJobData {
  const job_title = getText(["h1.title", ".job-title", "h1"]);
  const location = getText([".location-text", "[class*='location']"]);
  const job_description = getText(["#job-description", ".section-content", "[class*='description']"]);

  return validateCandidate({
    job_title,
    company_name: "Amazon",
    location,
    job_url: url,
    job_description,
    source_site: "Amazon Jobs",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "amazon",
  });
}

function extractMicrosoftCareersJob(url: string): ExtractedJobData {
  const job_title = getText(["[data-automation-id='jobTitle']", "h1"]);
  const location = getText(["[data-automation-id='jobLocation']", "[class*='location']"]);
  const job_description = getText(["[data-automation-id='jobDetails']", "[class*='description']"]);

  return validateCandidate({
    job_title,
    company_name: "Microsoft",
    location,
    job_url: url,
    job_description,
    source_site: "Microsoft Careers",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "microsoft",
  });
}

function extractGlassdoorJob(url: string): ExtractedJobData {
  const job_title = getText(['[data-test="job-title"]', "h1"]);
  const company_name = getText(['[data-test="employer-name"]', ".EmployerProfile_employerName__3wu0i"]);
  const location = getText(['[data-test="location"]']);
  const job_description = getText(['.jobDescriptionContent', '[class*="JobDetails_jobDescription"]']);

  return validateCandidate({
    job_title,
    company_name,
    location,
    job_url: url,
    job_description,
    source_site: "Glassdoor",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "glassdoor",
  });
}

function extractInternshalaJob(url: string): ExtractedJobData {
  const job_title = getText([".heading_4_5", "h1", ".profile"]);
  const company_name = getText([".company_name", ".heading_6"]);
  const location = getText(["#location_names", ".location_link"]);
  const job_description = getText([".text-container", "#website_job_description", ".internship_details"]);

  return validateCandidate({
    job_title,
    company_name,
    location,
    job_url: url,
    job_description,
    source_site: "Internshala",
    detected: Boolean(job_title && job_description && job_description.length >= 30),
    confidence: "high",
    source: "internshala",
  });
}

// =================================================================
// GENERIC CAREER PAGE EXTRACTOR
// =================================================================

function extractGenericCareerJob(url: string, hostname: string): ExtractedJobData {
  // Search for dedicated job containers
  const jobContainer = document.querySelector<HTMLElement>(
    "main, article, [itemtype*='JobPosting'], [data-job-id], [class*='job-detail'], [class*='jobDescription'], [id*='job-description']"
  );

  let rawTitle = "";
  const h1 = (jobContainer || document).querySelector("h1");
  if (h1 && h1.innerText.trim()) {
    rawTitle = h1.innerText.trim();
  } else {
    const titleMeta = document.querySelector('meta[property="og:title"]');
    rawTitle = titleMeta?.getAttribute("content") || document.title || "";
  }

  const job_title = cleanJobTitle(rawTitle);

  // Extract company
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute("content");
  const authorMeta = document.querySelector('meta[name="author"]')?.getAttribute("content");
  const company_name = ogSiteName || authorMeta || formatDomainName(hostname);

  // Extract location
  const location = getText([
    "[class*='location']",
    "[class*='address']",
    "[class*='city']",
    "[id*='location']",
  ]);

  // Extract description
  let job_description = getText([
    "#job-description",
    "#description",
    "[class*='job-description']",
    "[class*='jobDescription']",
    "[class*='description']",
    "[class*='responsibilities']",
    "[class*='requirements']",
  ]);

  if (!job_description || job_description.length < 50) {
    job_description = extractVisibleBodyText();
  }

  const hasRequirements = /(?:requirements|qualifications|responsibilities|experience|skills|duties|job\s*description)/i.test(job_description);
  const isValid = Boolean(job_title && job_description && job_description.length >= 80 && hasRequirements);

  return validateCandidate({
    job_title,
    company_name,
    location,
    job_url: url,
    job_description,
    source_site: getSiteNameFromHostname(hostname),
    detected: isValid,
    confidence: isValid ? "medium" : "none",
    source: "generic",
  });
}

// =================================================================
// VALIDATION & SANITIZATION RULES
// =================================================================

function validateCandidate(candidate: ExtractedJobData): ExtractedJobData {
  const title = sanitizeJobTitle(candidate.job_title);
  const company = sanitizeCompanyName(candidate.company_name);
  const location = sanitizeLocation(candidate.location || "");
  const description = cleanText(candidate.job_description);

  // Non-job page titles
  const invalidTitles = /^(Feed|Home|LinkedIn|Notifications|Post|Update|Careers|Jobs|Hiring|Opportunity|Details|Job|Dashboard|Messaging|Inbox|Sign In|Login|ApplyPilot)$/i;

  if (!title || invalidTitles.test(title) || description.length < 30) {
    return {
      job_title: "",
      company_name: "",
      location: "",
      job_url: candidate.job_url,
      job_description: "",
      source_site: candidate.source_site,
      detected: false,
      confidence: "none",
      source: "none",
      status_message: "Job could not be reliably detected on this page.",
    };
  }

  return {
    ...candidate,
    job_title: title,
    company_name: company || formatDomainName(new URL(candidate.job_url).hostname),
    location,
    job_description: description,
    detected: candidate.detected !== false,
  };
}

export function extractVisibleBodyText(): string {
  const clone = (document.querySelector("main") || document.querySelector("article") || document.body)?.cloneNode(true) as HTMLElement;
  if (!clone) return "";

  const removeSelectors = [
    "script",
    "style",
    "noscript",
    "iframe",
    "header",
    "footer",
    "nav",
    "button",
    "form",
    "svg",
    "[aria-hidden='true']",
  ];
  removeSelectors.forEach((sel) => {
    clone.querySelectorAll(sel).forEach((el) => el.remove());
  });

  return cleanText(clone.innerText || clone.textContent || "").slice(0, 8000);
}

function extractFromJsonLd(): { title?: string; company?: string; location?: string; description?: string } | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
      if (!script.textContent) continue;
      const json = JSON.parse(script.textContent);

      const items = Array.isArray(json) ? json : json["@graph"] ? json["@graph"] : [json];
      for (const item of items) {
        const type = item["@type"];
        const isJob = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
        if (isJob) {
          let company = "";
          if (typeof item.hiringOrganization === "object") {
            company = item.hiringOrganization.name || "";
          } else if (typeof item.hiringOrganization === "string") {
            company = item.hiringOrganization;
          }

          let locationStr = "";
          if (item.jobLocation) {
            const loc = Array.isArray(item.jobLocation) ? item.jobLocation[0] : item.jobLocation;
            if (loc?.address) {
              const addr = loc.address;
              locationStr = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
                .filter(Boolean)
                .join(", ");
            } else if (loc?.name) {
              locationStr = loc.name;
            }
          }

          let desc = item.description || "";
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = desc;
          desc = tempDiv.textContent || tempDiv.innerText || desc;

          return {
            title: item.title || item.name || "",
            company,
            location: locationStr,
            description: cleanText(desc),
          };
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function getText(selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el) {
        const text = (el as HTMLElement).innerText || el.textContent || "";
        if (text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch {
      // Ignore
    }
  }
  return "";
}

function cleanText(text: string): string {
  return text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeJobTitle(title: string): string {
  return cleanText(title)
    .split(/[-|–•]/)[0]
    .replace(/^(🚀|📌|📍|⏰|💰|🔗|\*|\-|\#)+/, "")
    .replace(/[.,;:|–—\-]+$/, "")
    .trim();
}

function sanitizeCompanyName(company: string): string {
  return cleanText(company)
    .replace(/\s+(?:Location|Loc|Apply|Workplace|City|Role|Experience).*$/i, "")
    .replace(/[.,;:|–—\-]+$/, "")
    .trim();
}

function sanitizeLocation(location: string): string {
  return cleanText(location)
    .replace(/[.,;:|–—\-]+$/, "")
    .trim();
}

function cleanJobTitle(title: string): string {
  return sanitizeJobTitle(
    title
      .replace(/(Careers|Jobs|Hiring|Apply|at|in|Official).*$/i, "")
      .trim()
  );
}

function formatDomainName(hostname: string): string {
  const parts = hostname.replace(/^www\./, "").split(".");
  if (parts.length >= 2) {
    const mainPart = parts[0] === "careers" || parts[0] === "jobs" ? parts[1] : parts[0];
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  }
  return hostname;
}

function getSiteNameFromHostname(hostname: string): string {
  if (hostname.includes("linkedin.com")) return "LinkedIn";
  if (hostname.includes("indeed.com")) return "Indeed";
  if (hostname.includes("naukri.com")) return "Naukri";
  if (hostname.includes("google.com")) return "Google Careers";
  if (hostname.includes("microsoft.com")) return "Microsoft Careers";
  if (hostname.includes("amazon.jobs") || hostname.includes("amazon.com")) return "Amazon Jobs";
  if (hostname.includes("glassdoor.com")) return "Glassdoor";
  if (hostname.includes("greenhouse.io")) return "Greenhouse";
  if (hostname.includes("lever.co")) return "Lever";
  if (hostname.includes("internshala.com")) return "Internshala";
  if (hostname.includes("tcs.com")) return "TCS";
  if (hostname.includes("infosys.com")) return "Infosys";
  if (hostname.includes("techmahindra.com")) return "Tech Mahindra";
  return formatDomainName(hostname) + " Careers";
}
