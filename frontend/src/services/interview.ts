import api from "./api";

export async function generateInterview(
  resume: string,
  jobDescription: string
) {
  const response = await api.post("/generate-interview", {
    resume,
    job_description: jobDescription,
  });

  return response.data;
}