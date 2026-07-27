import api from "@/lib/axios";
import {
  Resume,
  ResumeUploadResponse,
  RenameResumeRequest,
} from "@/types/resume";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ======================================================
// Upload Resume
// ======================================================

export async function uploadResume(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post<ApiResponse<ResumeUploadResponse>>(
      "/resume/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

  return response.data;
}

// ======================================================
// Get All Resumes
// ======================================================

export async function getUserResumes() {
  const response =
    await api.get<ApiResponse<Resume[]>>("/resume");

  return response.data;
}

// ======================================================
// Get Resume Details
// ======================================================

export async function getResume(
  resumeId: string
) {
  const response =
    await api.get<ApiResponse<Resume>>(
      `/resume/${resumeId}`
    );

  return response.data;
}

// ======================================================
// Rename Resume
// ======================================================

export async function renameResume(
  resumeId: string,
  data: RenameResumeRequest
) {
  const response =
    await api.patch<ApiResponse<Resume>>(
      `/resume/${resumeId}`,
      data
    );

  return response.data;
}

// ======================================================
// Delete Resume
// ======================================================

export async function deleteResume(
  resumeId: string
) {
  const response =
    await api.delete<ApiResponse<null>>(
      `/resume/${resumeId}`
    );

  return response.data;
}