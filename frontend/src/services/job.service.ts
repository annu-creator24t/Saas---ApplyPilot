import api from "@/lib/axios";

export interface JobMatchRequest {
  job_title?: string;
  company_name?: string;
  job_description: string;
  job_url?: string;
  location?: string;
  resume_id?: string;
}

export interface JobMatchResponse {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  key_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
  job_title?: string;
  company_name?: string;
  location?: string;
}

export const analyzeJob = async (data: JobMatchRequest): Promise<JobMatchResponse> => {
  const response = await api.post("/job/analyze", data);
  return response.data.data;
};
