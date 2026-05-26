export const accentPalette = {
  blue: '#157BFF',
  purple: '#7C3AED',
  cyan: '#06B6D4',
  green: '#22C55E',
  red: '#EF4444',
  orange: '#F97316',
  pink: '#EC4899',
  gold: '#D6A32D',
} as const;

export type AccentColor = keyof typeof accentPalette;
