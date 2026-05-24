export type ClassLevel = "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
export type Difficulty = "Foundation" | "Intermediate" | "Advanced";

export type CBCCompetency = 
  | "Critical thinking and problem-solving" 
  | "Problem solving"
  | "Communication" 
  | "Creativity and innovation" 
  | "Co-operation and Self-Directed Learning"
  | "Mathematical Computation"
  | "Information and Communication Technology (ICT) Proficiency"
  | "Diversity and Multicultural Skills"
  | "Lifelong learning";

export type BloomLevel = 
  | "Knowledge" 
  | "Comprehension" 
  | "Application" 
  | "Analysis" 
  | "Evaluation" 
  | "Creation";

export interface Task {
  task_number: number;
  task_text: string;
  marks: number;
  competency: string;
  bloom_level: string;
  model_answer: string;
  mark_scheme: string;
}

export interface ScenarioItem {
  id: string; // generated client-side uuid or string
  topic: string;
  class_level: ClassLevel;
  difficulty: Difficulty;
  scenario: string;
  tasks: Task[];
  isPreseeded?: boolean;
}

export interface TaskGrade {
  score: number;
  feedback: string;
  model_answer: string;
  evaluated: boolean;
  loading?: boolean;
}

export interface StudentAttempt {
  id: string;
  studentName: string;
  itemId: string;
  itemTitle: string; // topic + class level
  answers: { [taskNumber: number]: string };
  grades: { [taskNumber: number]: TaskGrade };
  totalScore: number;
  totalAvailable: number;
  attemptedAt: string;
}

export interface ClassActivityReport {
  studentName: string;
  topic: string;
  classLevel: ClassLevel;
  scorePercent: number;
  attemptedAt: string;
}
