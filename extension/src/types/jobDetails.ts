export interface JobDetails {
  title: string;
  company: string;
  location: string;
  description: string;

  salary?: string;
  experience?: string;

  skills: string[];

  source: string;
  url: string;
}