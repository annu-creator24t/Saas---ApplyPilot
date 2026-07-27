export interface ATSAnalysis {
  ats_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  grammar: string;
  formatting: string;
  recommendations: string[];
}