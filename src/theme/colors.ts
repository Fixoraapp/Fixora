export const accentPalette = {
  blue: '#23B8FF',
  purple: '#9B5CFF',
  cyan: '#2EE7F0',
  green: '#35E6A6',
  red: '#FF5D7A',
  orange: '#FF9D43',
  pink: '#FF66C8',
  gold: '#F7D47A',
} as const;

export type AccentColor = keyof typeof accentPalette;
