export interface Evaluation {
  score: number;

  strengths: string[];

  improvements: string[];

  ideal_answer: string;
}

export interface PracticeQuestion {
  question: string;

  category: string;

  difficulty: string;

  user_answer?: string;

  evaluation?: Evaluation;
}

export interface InterviewPracticeRequest {
  resume_id: string;

  job_description: string;
}

export interface InterviewPracticeResponse {
  session_id: string;

  questions: PracticeQuestion[];
}

export interface EvaluateAnswerRequest {
  question: string;
  answer: string;
  session_id?: string;
  question_index?: number;
}