import api from "@/lib/axios";

export type ApplicationStatus = "BOOKMARKED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  status: ApplicationStatus;
  applied_date?: string;
  interview_date?: string;
  salary_range?: string;
  notes?: string;
  ats_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationData {
  job_title: string;
  company_name: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  status?: ApplicationStatus;
  applied_date?: string;
  interview_date?: string;
  salary_range?: string;
  notes?: string;
  ats_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
}

export interface UpdateApplicationData {
  job_title?: string;
  company_name?: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  status?: ApplicationStatus;
  applied_date?: string;
  interview_date?: string;
  salary_range?: string;
  notes?: string;
  ats_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
}

export const getApplications = async (status?: string): Promise<JobApplication[]> => {
  const response = await api.get("/applications", {
    params: status ? { status } : {},
  });
  return response.data.data;
};

export const createApplication = async (data: CreateApplicationData): Promise<JobApplication> => {
  const response = await api.post("/applications", data);
  return response.data.data;
};

export const updateApplication = async (id: string, data: UpdateApplicationData): Promise<JobApplication> => {
  const response = await api.patch(`/applications/${id}`, data);
  return response.data.data;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await api.delete(`/applications/${id}`);
};
