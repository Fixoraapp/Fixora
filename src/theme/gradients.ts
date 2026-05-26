import { AccentColor, accentPalette } from './colors';

export type GradientColors = readonly [string, string, ...string[]];

export function makeGradients(accentName: AccentColor, scheme: 'light' | 'dark' | 'amoled') {
  const accent = accentPalette[accentName];
  const dark = scheme !== 'light';
  const appBackground: GradientColors = dark
    ? scheme === 'amoled'
      ? ['#000000', '#02030A', '#050013', '#000000']
      : ['#050816', '#07111F', '#09071D', '#050816']
    : ['#F8FBFF', '#EEF4FF', '#F7F3FF', '#FFFFFF'];
  const primaryButton: GradientColors = [accent, '#6945FF', '#A855F7'];
  const card: GradientColors = dark
    ? ['rgba(255,255,255,0.1)', 'rgba(124,58,237,0.08)']
    : ['rgba(255,255,255,0.92)', 'rgba(238,244,255,0.82)'];
  const hero: GradientColors = dark ? [accent, '#426BFF', '#7C3AED'] : [accent, '#7AA5FF', '#D9C2FF'];

  return {
    appBackground,
    primaryButton,
    card,
    hero,
  } as const;
}
