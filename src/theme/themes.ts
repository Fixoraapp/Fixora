import { ColorSchemeName } from 'react-native';
import { AccentColor, accentPalette } from './colors';
import { makeGradients } from './gradients';
import { makeShadow } from './shadows';
import { baseTypography } from './typography';

export type ThemeMode = 'system' | 'dark' | 'light' | 'amoled';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export type ThemePreferences = {
  selectedTheme: ThemeMode;
  accentColor: AccentColor;
  fontScale: number;
  animationSpeed: AnimationSpeed;
  reduceMotion: boolean;
};

export type ResolvedScheme = 'light' | 'dark' | 'amoled';

export type FixoraTheme = {
  mode: ThemeMode;
  scheme: ResolvedScheme;
  isDark: boolean;
  accentName: AccentColor;
  colors: {
    background: string;
    backgroundElevated: string;
    surface: string;
    surfaceStrong: string;
    card: string;
    cardStrong: string;
    text: string;
    textInverse: string;
    muted: string;
    dim: string;
    stroke: string;
    strokeStrong: string;
    accent: string;
    accentSecondary: string;
    success: string;
    danger: string;
    warning: string;
    input: string;
    overlay: string;
    glow: string;
  };
  gradients: ReturnType<typeof makeGradients>;
  typography: typeof baseTypography;
  shadow: ReturnType<typeof makeShadow>;
  animationMultiplier: number;
};

export const defaultThemePreferences: ThemePreferences = {
  selectedTheme: 'dark',
  accentColor: 'blue',
  fontScale: 1,
  animationSpeed: 'normal',
  reduceMotion: false,
};

export function resolveScheme(mode: ThemeMode, systemScheme: ColorSchemeName): ResolvedScheme {
  if (mode === 'system') {
    return systemScheme === 'light' ? 'light' : 'dark';
  }
  return mode;
}

export function createTheme(preferences: ThemePreferences, systemScheme: ColorSchemeName): FixoraTheme {
  const scheme = resolveScheme(preferences.selectedTheme, systemScheme);
  const isDark = scheme !== 'light';
  const accent = accentPalette[preferences.accentColor];
  const gradients = makeGradients(preferences.accentColor, scheme);
  const animationMultiplier =
    preferences.reduceMotion ? 0 : preferences.animationSpeed === 'slow' ? 1.35 : preferences.animationSpeed === 'fast' ? 0.72 : 1;

  const colors = isDark
    ? {
        background: scheme === 'amoled' ? '#000000' : '#050815',
        backgroundElevated: scheme === 'amoled' ? '#050505' : '#090E22',
        surface: 'rgba(255,255,255,0.075)',
        surfaceStrong: 'rgba(255,255,255,0.115)',
        card: 'rgba(255,255,255,0.075)',
        cardStrong: 'rgba(255,255,255,0.12)',
        text: '#EEF4FF',
        textInverse: '#050815',
        muted: '#AAB5CC',
        dim: '#69748F',
        stroke: 'rgba(255,255,255,0.13)',
        strokeStrong: 'rgba(255,255,255,0.24)',
        accent,
        accentSecondary: '#A855F7',
        success: '#41E6A4',
        danger: '#FF5D7A',
        warning: '#F9D77E',
        input: 'rgba(255,255,255,0.075)',
        overlay: 'rgba(0,0,0,0.62)',
        glow: accent,
      }
    : {
        background: '#F8FBFF',
        backgroundElevated: '#FFFFFF',
        surface: 'rgba(255,255,255,0.88)',
        surfaceStrong: 'rgba(255,255,255,0.96)',
        card: 'rgba(255,255,255,0.92)',
        cardStrong: '#FFFFFF',
        text: '#101828',
        textInverse: '#FFFFFF',
        muted: '#5F6D83',
        dim: '#8A96AA',
        stroke: 'rgba(16,24,40,0.12)',
        strokeStrong: 'rgba(21,123,255,0.24)',
        accent,
        accentSecondary: '#7C3AED',
        success: '#16885C',
        danger: '#D8325B',
        warning: '#A66B00',
        input: 'rgba(255,255,255,0.94)',
        overlay: 'rgba(16,24,40,0.32)',
        glow: accent,
      };

  return {
    mode: preferences.selectedTheme,
    scheme,
    isDark,
    accentName: preferences.accentColor,
    colors,
    gradients,
    typography: {
      title: Math.round(baseTypography.title * preferences.fontScale),
      heading: Math.round(baseTypography.heading * preferences.fontScale),
      subheading: Math.round(baseTypography.subheading * preferences.fontScale),
      body: Math.round(baseTypography.body * preferences.fontScale),
      small: Math.round(baseTypography.small * preferences.fontScale),
      micro: Math.round(baseTypography.micro * preferences.fontScale),
    },
    shadow: makeShadow(accent, isDark ? 1 : 0.72),
    animationMultiplier,
  };
}
