export interface ExtractedJobData {
  job_title: string;
  company_name: string;
  location?: string;
  job_url: string;
  job_description: string;
  source_site: string;
  detected: boolean;
}

/**
 * Universal job extractor for ANY career/job webpage
 */
export function extractJobFromDOM(): ExtractedJobData {
  const url = window.location.href;
  const hostname = window.location.hostname.toLowerCase();

  let job_title = "";
  let company_name = "";
  let location = "";
  let job_description = "";
  let source_site = getSiteNameFromHostname(hostname);

  // 1. TRY SCHEMA.ORG JSON-LD MICRODATA EXTRACTION (Universal standard)
  const jsonLdData = extractFromJsonLd();
  if (jsonLdData) {
    if (jsonLdData.title) job_title = jsonLdData.title;
    if (jsonLdData.company) company_name = jsonLdData.company;
    if (jsonLdData.location) location = jsonLdData.location;
    if (jsonLdData.description) job_description = jsonLdData.description;
  }

  // 2. DOMAIN-SPECIFIC ADAPTERS
  if (hostname.includes("linkedin.com")) {
    source_site = "LinkedIn";
    if (!job_title) {
      job_title = getText([
        ".job-details-jobs-unified-top-card__job-title",
        ".jobs-unified-top-card__job-title",
        ".top-card-layout__title",
        "h1.t-24",
        "h1",
      ]);
    }
    if (!company_name) {
      company_name = getText([
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name",
        ".topcard__org-name-link",
        ".job-details-jobs-unified-top-card__primary-description span",
      ]);
    }
    if (!location) {
      location = getText([
        ".job-details-jobs-unified-top-card__bullet",
        ".jobs-unified-top-card__bullet",
        ".topcard__flavor--bullet",
      ]);
    }
    if (!job_description) {
      job_description = getText([
        "#job-details",
        ".jobs-description__content",
        ".description__text",
        ".jobs-box__html-content",
      ]);
    }
  } else if (hostname.includes("indeed.com")) {
    source_site = "Indeed";
    if (!job_title) {
      job_title = getText([
        ".jobsearch-JobInfoHeader-title",
        "h1.jobsearch-JobInfoHeader-title",
        "h1",
      ]);
    }
    if (!company_name) {
      company_name = getText([
        '[data-testid="inlineHeader-companyName"]',
        ".jobsearch-InlineCompanyHeader-companyHeader",
        ".jobsearch-CompanyReview--dataHeader",
      ]);
    }
    if (!location) {
      location = getText([
        '[data-testid="inlineHeader-companyLocation"]',
        ".jobsearch-JobInfoHeader-subtitle",
      ]);
    }
    if (!job_description) {
      job_description = getText(["#jobDescriptionText", ".jobsearch-jobDescriptionText"]);
    }
  } else if (hostname.includes("naukri.com")) {
    source_site = "Naukri";
    if (!job_title) {
      job_title = getText([
        "h1.styles_jd-header-title__r2Aud",
        "[class*='jd-header-title']",
        "h1.title",
        "h1",
      ]);
    }
    if (!company_name) {
      company_name = getText([
        ".styles_jd-header-comp-name__a21Yh",
        "a.comp-name",
        "[class*='comp-name']",
        ".company-name",
      ]);
    }
    if (!location) {
      location = getText([
        "[class*='location']",
        ".loc",
        "[class*='loc']",
      ]);
    }
    if (!job_description) {
      job_description = getText([
        "[class*='job-desc']",
        ".styles_Jd-left-wrapper__...",
        ".danger-markup",
        "section.job-desc",
      ]);
    }
  } else if (hostname.includes("careers.google.com") || hostname.includes("google.com")) {
    source_site = "Google Careers";
    if (!job_title) {
      job_title = getText(["h1", ".gc-card__title", "[data-reflection-id] h1"]);
    }
    if (!company_name) company_name = "Google";
    if (!location) {
      location = getText(["[data-reflection-id] [class*='location']", ".gc-job-detail__location", "[class*='location']"]);
    }
    if (!job_description) {
      job_description = getText([
        "[data-reflection-id]",
        ".gc-job-detail__content",
        "[class*='description']",
        "[class*='detail-content']",
      ]);
    }
  } else if (hostname.includes("amazon.jobs") || hostname.includes("amazon.com")) {
    source_site = "Amazon Jobs";
    if (!job_title) {
      job_title = getText(["h1.title", ".job-title", "h1"]);
    }
    if (!company_name) company_name = "Amazon";
    if (!location) {
      location = getText([".location-text", "[class*='location']"]);
    }
    if (!job_description) {
      job_description = getText(["#job-description", ".section-content", "[class*='description']"]);
    }
  } else if (hostname.includes("microsoft.com") || hostname.includes("careers.microsoft.com")) {
    source_site = "Microsoft Careers";
    if (!job_title) {
      job_title = getText(["[data-automation-id='jobTitle']", "h1"]);
    }
    if (!company_name) company_name = "Microsoft";
    if (!location) {
      location = getText(["[data-automation-id='jobLocation']", "[class*='location']"]);
    }
    if (!job_description) {
      job_description = getText(["[data-automation-id='jobDetails']", "[class*='description']"]);
    }
  } else if (hostname.includes("glassdoor.com")) {
    source_site = "Glassdoor";
    if (!job_title) job_title = getText(['[data-test="job-title"]', "h1"]);
    if (!company_name) company_name = getText(['[data-test="employer-name"]', ".EmployerProfile_employerName__3wu0i"]);
    if (!location) location = getText(['[data-test="location"]']);
    if (!job_description) job_description = getText(['.jobDescriptionContent', '[class*="JobDetails_jobDescription"]']);
  } else if (hostname.includes("greenhouse.io")) {
    source_site = "Greenhouse";
    if (!job_title) job_title = getText([".app-title", "h1.heading", "h1"]);
    if (!company_name) company_name = getText([".company-name"]);
    if (!location) location = getText([".location"]);
    if (!job_description) job_description = getText(["#content", "#main"]);
  } else if (hostname.includes("lever.co")) {
    source_site = "Lever";
    if (!job_title) job_title = getText([".posting-header h2", "h2"]);
    if (!company_name) company_name = getText([".main-header p", ".posting-header"]);
    if (!location) location = getText([".location"]);
    if (!job_description) job_description = getText([".section-page", ".content"]);
  } else if (hostname.includes("internshala.com")) {
    source_site = "Internshala";
    if (!job_title) job_title = getText([".heading_4_5", "h1", ".profile"]);
    if (!company_name) company_name = getText([".company_name", ".heading_6"]);
    if (!location) location = getText(["#location_names", ".location_link"]);
    if (!job_description) job_description = getText([".text-container", "#website_job_description", ".internship_details"]);
  }

  // 3. GENERIC HEURISTIC EXTRACTION (For any company website: TCS, Infosys, Tech Mahindra, etc.)
  if (!job_title) {
    const h1 = document.querySelector("h1");
    if (h1 && h1.innerText.trim()) {
      job_title = h1.innerText.trim();
    } else {
      // Use meta title or document.title
      const titleMeta = document.querySelector('meta[property="og:title"]');
      const metaTitleText = titleMeta ? titleMeta.getAttribute("content") : "";
      const rawTitle = metaTitleText || document.title || "";
      job_title = cleanJobTitle(rawTitle);
    }
  }

  if (!company_name) {
    // Try meta tags or site name or hostname
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute("content");
    const authorMeta = document.querySelector('meta[name="author"]')?.getAttribute("content");
    const metaCompany = document.querySelector('meta[name="company"]')?.getAttribute("content");
    const domCompany = getText([
      "[class*='company']",
      "[class*='employer']",
      "[class*='organization']",
      "[id*='company']",
      "[id*='employer']",
    ]);

    company_name = ogSiteName || metaCompany || authorMeta || domCompany || formatDomainName(hostname);
  }

  if (!location) {
    location = getText([
      "[class*='location']",
      "[class*='address']",
      "[class*='city']",
      "[id*='location']",
      "[data-testid*='location']",
    ]);
  }

  if (!job_description) {
    // Try generic description selectors
    job_description = getText([
      "#job-description",
      "#description",
      "[class*='job-description']",
      "[class*='jobDescription']",
      "[class*='description']",
      "[class*='details']",
      "[class*='responsibilities']",
      "[class*='requirements']",
      "article",
      "main",
    ]);
  }

  // Final fallback for description: extract main page content text cleanly
  if (!job_description || job_description.length < 30) {
    job_description = extractVisibleBodyText();
  }

  const cleanedTitle = cleanText(job_title);
  const cleanedCompany = cleanText(company_name);
  const cleanedLocation = cleanText(location);
  const cleanedDescription = cleanText(job_description);

  // Filter out common non-job titles (e.g. LinkedIn Feed, Home, Inbox)
  const isNonJobPageTitle = /^\(\d+\)\s*(Feed|Inbox|Home|Notifications)|^(Feed|Home|Dashboard|Messaging|Notifications|Inbox|LinkedIn|Login|Sign In)$/i.test(cleanedTitle.trim());

  let finalTitle = cleanedTitle;
  let finalDescription = cleanedDescription;
  if (isNonJobPageTitle) {
    finalTitle = "";
    finalDescription = "";
  }

  const detected = Boolean(
    !isNonJobPageTitle && finalTitle.length > 0 && finalDescription.length >= 30
  );

  return {
    job_title: finalTitle,
    company_name: cleanedCompany,
    location: cleanedLocation,
    job_url: url,
    job_description: finalDescription,
    source_site,
    detected,
  };
}

/**
 * Extract clean visible text from page body/main element as fallback
 */
export function extractVisibleBodyText(): string {
  const clone = (document.querySelector("main") || document.querySelector("article") || document.body).cloneNode(true) as HTMLElement;
  if (!clone) return "";

  // Strip scripts, styles, inputs, headers, footers, navs
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

/**
 * Parse Schema.org JSON-LD microdata
 */
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
            if (loc.address) {
              const addr = loc.address;
              locationStr = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
                .filter(Boolean)
                .join(", ");
            } else if (loc.name) {
              locationStr = loc.name;
            }
          }

          let desc = item.description || "";
          // Strip HTML tags from JSON-LD description if needed
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = desc;
          desc = tempDiv.textContent || tempDiv.innerText || desc;

          return {
            title: item.title || item.name || "",
            company,
            location: locationStr,
            description: desc,
          };
        }
      }
    }
  } catch (e) {
    // Ignore JSON-LD parse errors
  }
  return null;
}

function getText(selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el && (el.textContent || (el as HTMLElement).innerText)) {
        const text = (el as HTMLElement).innerText || el.textContent || "";
        if (text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (e) {
      // Ignore selector errors
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

function cleanJobTitle(title: string): string {
  return title
    .split(/[-|–•]/)[0]
    .replace(/(Careers|Jobs|Hiring|Apply|at|in|Official).*$/i, "")
    .trim();
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
  if (hostname.includes("meta.com") || hostname.includes("facebook.com")) return "Meta Careers";
  if (hostname.includes("tcs.com")) return "TCS";
  if (hostname.includes("infosys.com")) return "Infosys";
  if (hostname.includes("techmahindra.com")) return "Tech Mahindra";
  if (hostname.includes("internshala.com")) return "Internshala";
  if (hostname.includes("glassdoor.com")) return "Glassdoor";
  if (hostname.includes("greenhouse.io")) return "Greenhouse";
  if (hostname.includes("lever.co")) return "Lever";
  return formatDomainName(hostname) + " Careers";
}
