import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CoverLetterRequest {
  resume_id: string;
  job_description: string;
}

export interface CoverLetterResponse {
  cover_letter: string;
}

export async function generateCoverLetter(
  data: CoverLetterRequest
) {
  const response =
    await api.post<ApiResponse<CoverLetterResponse>>(
      "/cover-letter/generate",
      data
    );

  return response.data;
}