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
  selectedTheme: 'light',
  accentColor: 'purple',
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
        background: scheme === 'amoled' ? '#000000' : '#030611',
        backgroundElevated: scheme === 'amoled' ? '#050505' : '#09111F',
        surface: 'rgba(255,255,255,0.082)',
        surfaceStrong: 'rgba(255,255,255,0.135)',
        card: 'rgba(255,255,255,0.086)',
        cardStrong: 'rgba(255,255,255,0.15)',
        text: '#F4F8FF',
        textInverse: '#030611',
        muted: '#B4C0D7',
        dim: '#75839D',
        stroke: 'rgba(220,232,255,0.15)',
        strokeStrong: 'rgba(220,232,255,0.3)',
        accent,
        accentSecondary: '#B658FF',
        success: '#35E6A6',
        danger: '#FF5D7A',
        warning: '#F7D47A',
        input: 'rgba(255,255,255,0.092)',
        overlay: 'rgba(2,6,17,0.72)',
        glow: accent,
      }
    : {
        background: '#F7F8FC',
        backgroundElevated: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceStrong: '#FFFFFF',
        card: '#FFFFFF',
        cardStrong: '#FFFFFF',
        text: '#111827',
        textInverse: '#FFFFFF',
        muted: '#6B7280',
        dim: '#9CA3AF',
        stroke: '#E5E7EB',
        strokeStrong: 'rgba(109,93,251,0.26)',
        accent,
        accentSecondary: '#B75CFF',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        input: '#FFFFFF',
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
