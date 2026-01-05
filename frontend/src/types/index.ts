// Type definitions for ENTBridge platform

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  isMandatory: boolean;
  category?: 'natural-sciences' | 'social-sciences' | 'creative' | null;
  maxScore: number;
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface TestResult {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  score: number;
  maxScore: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  answers?: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  assignedBy: string;
  submissions: Submission[];
  attachments: Attachment[];
}

export interface Submission {
  id: string;
  homeworkId: string;
  userId: string;
  userName: string;
  content: string | null;
  submittedAt: string;
  status?: 'SUBMITTED' | 'NEEDS_REVISION' | 'APPROVED';
  grade?: number;
  feedback?: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  contentType?: string;
  size?: number;
  downloadUrl: string;
  uploadedAt?: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  subjectId: string;
  youtubeUrl: string;
  thumbnail: string;
  duration: string;
  description: string;
}
