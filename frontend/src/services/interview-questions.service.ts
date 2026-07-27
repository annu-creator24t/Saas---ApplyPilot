import api from "@/lib/axios";

import {
  InterviewQuestionsRequest,
  InterviewQuestionsResponse,
} from "@/types/interview-questions";

interface APIResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export async function generateInterviewQuestions(
  data: InterviewQuestionsRequest
) {
  const response =
    await api.post<
      APIResponse<InterviewQuestionsResponse>
    >(
      "/interview/questions/generate",
      data
    );

  return response.data;
}