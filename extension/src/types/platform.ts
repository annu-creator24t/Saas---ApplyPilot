export const Platform = {
  LINKEDIN: "linkedin",
  INDEED: "indeed",
  NAUKRI: "naukri",
  INTERNSHALA: "internshala",
  GREENHOUSE: "greenhouse",
  LEVER: "lever",
  GENERIC: "generic",
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];