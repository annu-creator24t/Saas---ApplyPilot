import { ATSAnalysis } from "./analysis";

export interface Resume {
  resume_id: string;
  title: string;
  original_filename: string;
  stored_filename: string;
  file_url: string;
  file_size: number;
  content_type: string;
  ats_score: number | null;
  analysis?: ATSAnalysis;
  created_at: string;
}

export interface ResumeUploadResponse extends Resume {}

export interface RenameResumeRequest {
  title: string;
}