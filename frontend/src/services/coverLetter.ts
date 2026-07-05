import api from "./api";

export async function generateCoverLetter(
  resume: string,
  jobDescription: string
) {
  const response = await api.post("/generate-cover-letter", {
    resume,
    job_description: jobDescription,
  });

  return response.data;
}