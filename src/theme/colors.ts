export const accentPalette = {
  blue: '#2D7CFF',
  purple: '#6D5DFB',
  cyan: '#38BDF8',
  green: '#22C55E',
  red: '#EF4444',
  orange: '#F59E0B',
  pink: '#D65BFF',
  gold: '#F59E0B',
} as const;

export type AccentColor = keyof typeof accentPalette;
