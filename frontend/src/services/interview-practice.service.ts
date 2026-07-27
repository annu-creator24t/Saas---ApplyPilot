import api from "@/lib/axios";

import {
  EvaluateAnswerRequest,
  InterviewPracticeRequest,
  InterviewPracticeResponse,
} from "@/types/interview-practice";

interface APIResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export async function startInterviewPractice(
  data: InterviewPracticeRequest
) {
  const response =
    await api.post<
      APIResponse<InterviewPracticeResponse>
    >(
      "/interview/practice/start",
      data
    );

  return response.data;
}

export async function evaluateAnswer(
  data: EvaluateAnswerRequest
) {
  const response =
    await api.post(
      "/interview/practice/evaluate",
      data
    );

  return response.data;
}