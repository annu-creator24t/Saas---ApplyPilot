import api from "@/lib/axios";
import { ATSAnalysis } from "@/types/analysis";
import { Resume } from "@/types/resume";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AnalysisResponse {
  analysis: ATSAnalysis;
  resume: Resume;
}

export async function analyzeResume(
  resumeId: string,
  jobDescription?: string
) {
  const payload = jobDescription ? { job_description: jobDescription } : {};
  const response =
    await api.post<ApiResponse<AnalysisResponse>>(
      `/analysis/resume/${resumeId}`,
      payload
    );

  return response.data;
}