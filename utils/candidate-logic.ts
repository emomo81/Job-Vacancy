import { Candidate, CandidateFilters, CandidateSort } from './candidate-types';

/**
 * Filter candidates based on various criteria
 */
export function filterCandidates(candidates: Candidate[], filters: CandidateFilters): Candidate[] {
  return candidates.filter(candidate => {
    // Search filter (name, role, summary)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchLower) ||
        candidate.role.toLowerCase().includes(searchLower) ||
        candidate.summary.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Score range
    if (filters.minScore !== undefined && candidate.score < filters.minScore) return false;
    if (filters.maxScore !== undefined && candidate.score > filters.maxScore) return false;

    // Recommendation
    if (filters.recommendation && filters.recommendation.length > 0) {
      if (!filters.recommendation.includes(candidate.recommendation)) return false;
    }

    // Source
    if (filters.source && filters.source.length > 0) {
      if (!filters.source.includes(candidate.source)) return false;
    }

    // Skills (candidate must have ALL requested skills)
    if (filters.skills && filters.skills.length > 0) {
      const hasAllSkills = filters.skills.every(skill => 
        candidate.skills.some(candidateSkill => 
          candidateSkill.toLowerCase() === skill.toLowerCase()
        )
      );
      if (!hasAllSkills) return false;
    }

    // Location
    if (filters.location && filters.location.length > 0) {
      if (!filters.location.includes(candidate.location)) return false;
    }

    return true;
  });
}

/**
 * Sort candidates by a specific field
 */
export function sortCandidates(candidates: Candidate[], sort: CandidateSort): Candidate[] {
  return [...candidates].sort((a, b) => {
    const valA = a[sort.field];
    const valB = b[sort.field];

    if (valA === undefined || valB === undefined) return 0;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sort.order === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sort.order === 'asc' 
        ? valA - valB 
        : valB - valA;
    }

    return 0;
  });
}
