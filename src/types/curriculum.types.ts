/**
 * Curriculum Type Definitions
 * These interfaces define the structure of our curriculum data
 */

export interface Lesson {
  id: string;
  title: string;
  description: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

/**
 * API Response Types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface GenerateCurriculumResponse {
  curriculum: Curriculum;
  aiProvider: string;
}

export interface HealthResponse {
  status: string;
  aiProvider: string;
  timestamp: string;
}
