import { COLORS } from './colors';
import { Recommendation, Source } from './candidate-types';

/**
 * Get the color palette for a recommendation status
 */
export function getRecommendationColors(type: Recommendation) {
  return COLORS.recommendation[type] || COLORS.recommendation.pass;
}

/**
 * Get the color palette for a candidate source
 */
export function getSourceColors(type: Source) {
  return COLORS.source[type] || COLORS.source.external;
}

/**
 * Get the appropriate color palette for a score
 */
export function getScoreColors(score: number) {
  if (score >= 90) return COLORS.score.exceptional;
  if (score >= 80) return COLORS.score.strong;
  if (score >= 70) return COLORS.score.good;
  if (score >= 60) return COLORS.score.average;
  return COLORS.score.weak;
}

/**
 * Determine text contrast based on background (basic implementation)
 */
export function getContrastColor(hex: string) {
  // If we need more complex logic for contrast, it can go here.
  // Currently we use predefined accessible palettes.
  return '#ffffff';
}
