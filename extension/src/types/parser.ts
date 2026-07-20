import type { JobDetails } from "./jobDetails";

export interface JobParser {
  canParse(url: string): boolean;

  parse(): JobDetails | null;
}