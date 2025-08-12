export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
}

export interface ExamSession {
  id: string;
  exam_id: string;
  user_id: string;
  questions: Question[];
  answers: { [questionId: string]: number };
  started_at: string;
  submitted_at?: string;
  score?: number;
  is_completed: boolean;
}

export interface ExamResult {
  id: string;
  exam_session_id: string;
  user_id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_minutes: number;
  passed: boolean;
  created_at: string;
}