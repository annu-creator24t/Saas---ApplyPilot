import axios from "axios";

const api = axios.create({
  baseURL:  "http://localhost:8000",
});

export default api;

export async function analyzeResume(
  file: File,
  jobDescription: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const response = await api.post("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}