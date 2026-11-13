import type { AccountRole } from "@/lib/roles";

export type UserAccount = {
  id: string;
  email: string;
  displayName: string;
  role: AccountRole;
  createdAt: string;
};

export type LearningLevel = {
  id: string;
  label: string;
  countryCode: string;
  curriculumId: string;
};

export type Subject = {
  id: string;
  label: string;
  curriculumId: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  levelId: string;
  language: string;
  published: boolean;
};

export type LearningProgress = {
  learnerId: string;
  courseId: string;
  completionPercent: number;
  updatedAt: string;
};

export type Assessment = {
  id: string;
  title: string;
  subjectId: string;
  levelId: string;
  durationMinutes: number;
  published: boolean;
};