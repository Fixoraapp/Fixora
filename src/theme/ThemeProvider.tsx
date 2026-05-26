import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AccentColor } from './colors';
import { AnimationSpeed, createTheme, defaultThemePreferences, FixoraTheme, ThemeMode, ThemePreferences } from './themes';

type ThemeContextValue = {
  theme: FixoraTheme;
  preferences: ThemePreferences;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setAccentColor: (accent: AccentColor) => Promise<void>;
  setFontScale: (scale: number) => Promise<void>;
  setAnimationSpeed: (speed: AnimationSpeed) => Promise<void>;
  setReduceMotion: (value: boolean) => Promise<void>;
};

const STORAGE_KEY = 'fixora.theme.v1';
const ThemeContext = createContext<ThemeContextValue | null>(null);

async function persist(preferences: ThemePreferences) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultThemePreferences);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        setPreferences({ ...defaultThemePreferences, ...(JSON.parse(stored) as Partial<ThemePreferences>) });
      })
      .catch(() => undefined);
  }, []);

  const update = async (patch: Partial<ThemePreferences>) => {
    const nextPreferences = { ...preferences, ...patch };
    setPreferences(nextPreferences);
    await persist(nextPreferences);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: createTheme(preferences, systemScheme),
      preferences,
      setThemeMode: (mode) => update({ selectedTheme: mode }),
      setAccentColor: (accent) => update({ accentColor: accent }),
      setFontScale: (scale) => update({ fontScale: Math.min(1.2, Math.max(0.9, scale)) }),
      setAnimationSpeed: (speed) => update({ animationSpeed: speed }),
      setReduceMotion: (reduceMotion) => update({ reduceMotion }),
    }),
    [preferences, systemScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used inside ThemeProvider');
  }
  return context;
}
