import api from "./api";

export async function evaluateAnswer(
  question: string,
  answer: string
) {
  const response = await api.post("/evaluate-answer", {
    question,
    answer,
  });

  return response.data;
}