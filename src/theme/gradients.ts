import { AccentColor, accentPalette } from './colors';

export type GradientColors = readonly [string, string, ...string[]];

export function makeGradients(accentName: AccentColor, scheme: 'light' | 'dark' | 'amoled') {
  const accent = accentPalette[accentName];
  const dark = scheme !== 'light';
  const appBackground: GradientColors = dark
    ? scheme === 'amoled'
      ? ['#000000', '#030611', '#080318', '#000000']
      : ['#030611', '#071325', '#0D0821', '#030611']
    : ['#F7FAFF', '#EEF5FF', '#F5F0FF', '#FFFFFF'];
  const primaryButton: GradientColors = [accent, '#5F67FF', '#B658FF'];
  const card: GradientColors = dark
    ? ['rgba(255,255,255,0.13)', 'rgba(93,103,255,0.1)', 'rgba(182,88,255,0.08)']
    : ['rgba(255,255,255,0.96)', 'rgba(239,246,255,0.9)', 'rgba(246,240,255,0.86)'];
  const hero: GradientColors = dark ? [accent, '#5167FF', '#B658FF'] : [accent, '#7AA5FF', '#D9C2FF'];

  return {
    appBackground,
    primaryButton,
    card,
    hero,
    aurora: dark
      ? (['rgba(35,184,255,0.9)', 'rgba(53,230,166,0.45)', 'rgba(182,88,255,0.82)'] as GradientColors)
      : (['rgba(35,184,255,0.7)', 'rgba(53,230,166,0.28)', 'rgba(182,88,255,0.46)'] as GradientColors),
    adminPanel: dark
      ? (['rgba(15,23,42,0.94)', 'rgba(10,17,32,0.92)', 'rgba(20,12,45,0.88)'] as GradientColors)
      : (['rgba(255,255,255,0.98)', 'rgba(247,250,255,0.94)', 'rgba(244,240,255,0.9)'] as GradientColors),
  } as const;
}
