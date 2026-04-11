/**
 * Rankr Core Color System Constants
 * All values selected for WCAG AA compliance against #f0f5fa and #ffffff backgrounds.
 */

export const COLORS = {
  // --- PRIMARY BRAND ---
  brand: {
    blue: '#2a85ff',
    light: '#6eb3ff',
    background: '#f0f5fa',
    dark: '#070707',
    white: '#ffffff',
  },

  // --- RECOMMENDATION BADGES ---
  recommendation: {
    hire: {
      bg: '#e6f9f0',
      text: '#16a34a',
      border: 'rgba(22, 163, 74, 0.2)',
      dot: '#16a34a',
    },
    consider: {
      bg: '#fff9e6',
      text: '#ca8a04',
      border: 'rgba(202, 138, 4, 0.2)',
      dot: '#ca8a04',
    },
    pass: {
      bg: '#fef2f2',
      text: '#dc2626',
      border: 'rgba(220, 38, 38, 0.2)',
      dot: '#dc2626',
    },
  },

  // --- SOURCE BADGES ---
  source: {
    rankr: {
      bg: '#e8f1ff',
      text: '#2a85ff',
      border: 'rgba(42, 133, 255, 0.2)',
    },
    external: {
      bg: '#fff3e8',
      text: '#f07830',
      border: 'rgba(240, 120, 48, 0.2)',
    },
  },

  // --- SCORE PALETTES ---
  score: {
    exceptional: {
      from: '#059669', // Emerald 600
      to: '#10b981',   // Emerald 500
      track: '#ecfdf5',
    },
    strong: {
      from: '#2a85ff', // Brand Blue
      to: '#6eb3ff',   // Brand Light
      track: '#f0f7ff',
    },
    good: {
      from: '#3b82f6', // Blue 500
      to: '#93c5fd',   // Blue 300
      track: '#eff6ff',
    },
    average: {
      from: '#d97706', // Amber 600
      to: '#f59e0b',   // Amber 500
      track: '#fffbeb',
    },
    weak: {
      from: '#dc2626', // Red 600
      to: '#ef4444',   // Red 500
      track: '#fef2f2',
    },
  },
};
