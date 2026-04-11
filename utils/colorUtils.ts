// utils/colorUtils.ts

export type BadgeType = 'HIRE' | 'CONSIDER' | 'PASS';

/**
 * Returns Tailwind CSS classes for a badge based on its type.
 * @param type - The type of the badge ('HIRE', 'CONSIDER', 'PASS').
 * @returns A string of Tailwind CSS classes.
 */
export function getBadgeClasses(type: BadgeType): string {
  let baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  switch (type) {
    case 'HIRE':
      // Green badge for HIRE
      return `${baseClasses} bg-green-100 text-green-800 border border-green-400`;
    case 'CONSIDER':
      // Amber badge for CONSIDER
      return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-400`;
    case 'PASS':
      // Red badge for PASS
      return `${baseClasses} bg-red-100 text-red-800 border border-red-400`;
    default:
      // Fallback for unknown types
      return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-400`;
  }
}

/**
 * Returns a Tailwind CSS class for the score range color.
 * @param score - The candidate's score (0-100).
 * @returns A Tailwind CSS class string representing the score range color.
 */
export function getScoreRangeColorClass(score: number): string {
  if (score >= 90) return 'bg-green-500'; // 90+ is Green
  if (score >= 80) return 'bg-blue-600'; // 80-89 is Blue
  if (score >= 70) return 'bg-blue-400'; // 70-79 is Light Blue
  if (score >= 60) return 'bg-amber-500'; // 60-69 is Amber
  return 'bg-red-500'; // <60 is Red
}
