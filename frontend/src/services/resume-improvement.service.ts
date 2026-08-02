import api from "@/lib/axios";
import { ResumeImprovement } from "@/types/resume-improvement";

interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ResumeImprovementRequest {
  resume_id: string;
  job_description: string;
}

export async function generateResumeImprovement(
  data: ResumeImprovementRequest
) {
  const response =
    await api.post<
      APIResponse<ResumeImprovement>
    >(
      "/resume-improvement/generate",
      data
    );

  return response.data;
}