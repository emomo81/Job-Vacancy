/**
 * Core types for the Rankr Candidate Data System
 */

export type Recommendation = 'hire' | 'consider' | 'pass';
export type Source = 'rankr' | 'external';

export interface Candidate {
  id: string;
  name: string;
  role: string;
  score: number;
  recommendation: Recommendation;
  source: Source;
  skills: string[];
  location: string;
  appliedDate: string; // ISO format: YYYY-MM-DD
  experienceYears: number;
  education: string;
  summary: string;
  avatarUrl?: string;
  // Screening details
  reasoning?: string;
  strengths?: string[];
  gaps?: string[];
  matched?: string[];
}

export interface CandidateFilters {
  search?: string;
  minScore?: number;
  maxScore?: number;
  recommendation?: Recommendation[];
  source?: Source[];
  skills?: string[];
  location?: string[];
}

export interface CandidateSort {
  field: keyof Candidate;
  order: 'asc' | 'desc';
}
