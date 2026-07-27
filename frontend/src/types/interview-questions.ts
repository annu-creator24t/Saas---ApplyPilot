export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  ideal_answer: string;
}

export interface InterviewQuestionsRequest {
  resume_id: string;
  job_description: string;
}

export interface InterviewQuestionsResponse {
  interview_id: string;

  technical: InterviewQuestion[];

  behavioral: InterviewQuestion[];

  hr: InterviewQuestion[];
}