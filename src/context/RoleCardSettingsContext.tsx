import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserRole } from '../types/navigation';
import { storage } from '../utils/storage';

export type RoleCardLayout = 'visualTop' | 'split' | 'compact';
export type RoleCardAnimation = 'float' | 'pulse' | 'none';
export type RoleCardImagePosition = 'top' | 'center' | 'bottom' | 'cover';
export type RolePreviewMode = 'dark' | 'light' | 'mobile' | 'tablet';

export type RoleCardTypography = {
  fontFamily: string;
  titleSize: number;
  subtitleSize: number;
  descriptionSize: number;
  fontWeight: '600' | '700' | '800' | '900';
  lineHeight: number;
  letterSpacing: number;
  textColor: string;
  mutedColor: string;
};

export type RoleCardVisualSettings = {
  image: string;
  imagePosition: RoleCardImagePosition;
  imageSize: number;
  imageOverlay: string;
  imageBrightness: number;
  imageBlur: number;
  showDecorations: boolean;
  icon: string;
  iconColor: string;
  iconSize: number;
};

export type RoleCardDesignSettings = {
  background: string;
  gradientColors: [string, string, string];
  borderColor: string;
  glowColor: string;
  shadowIntensity: number;
  selectedGlow: string;
  selectedBorder: string;
  checkIconStyle: 'circle' | 'square' | 'minimal';
};

export type RoleCardSettings = {
  role: UserRole;
  enabled: boolean;
  sortOrder: number;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  showFeatures: boolean;
  buttonText: string;
  layout: RoleCardLayout;
  animation: RoleCardAnimation;
  visual: RoleCardVisualSettings;
  design: RoleCardDesignSettings;
  typography: RoleCardTypography;
  updatedAt: string;
};

export type RoleCardSettingsState = Record<UserRole, RoleCardSettings>;

type RoleCardSettingsContextValue = {
  settings: RoleCardSettingsState;
  loading: boolean;
  updateRoleCard: (role: UserRole, patch: Partial<RoleCardSettings>) => Promise<void>;
  replaceRoleCard: (role: UserRole, next: RoleCardSettings) => Promise<void>;
  resetRoleCards: () => Promise<void>;
};

const STORAGE_KEY = 'fixora.roleCardSettings.v1';

export const defaultRoleCardSettings: RoleCardSettingsState = {
  master: {
    role: 'master',
    enabled: true,
    sortOrder: 1,
    title: 'I AM MASTER',
    subtitle: 'Receive orders and grow your income',
    description: 'Build your pro profile, accept nearby jobs, chat with clients, and track earnings.',
    features: ['Verified profile', 'Nearby orders', 'Secure payouts'],
    showFeatures: true,
    buttonText: 'Continue as Master',
    layout: 'visualTop',
    animation: 'float',
    visual: {
      image: '',
      imagePosition: 'cover',
      imageSize: 100,
      imageOverlay: 'rgba(5,8,22,0.22)',
      imageBrightness: 100,
      imageBlur: 0,
      showDecorations: false,
      icon: 'M',
      iconColor: '#F9D77E',
      iconSize: 42,
    },
    design: {
      background: 'rgba(255,255,255,0.08)',
      gradientColors: ['#7C3AED', '#A855F7', '#5A31FF'],
      borderColor: 'rgba(255,255,255,0.16)',
      glowColor: '#A855F7',
      shadowIntensity: 62,
      selectedGlow: '#A855F7',
      selectedBorder: '#F9D77E',
      checkIconStyle: 'circle',
    },
    typography: {
      fontFamily: 'System',
      titleSize: 20,
      subtitleSize: 16,
      descriptionSize: 14,
      fontWeight: '900',
      lineHeight: 1.35,
      letterSpacing: 0,
      textColor: '#FFFFFF',
      mutedColor: '#AAB0C0',
    },
    updatedAt: new Date().toISOString(),
  },
  client: {
    role: 'client',
    enabled: true,
    sortOrder: 2,
    title: 'I AM CLIENT',
    subtitle: 'Book premium local services',
    description: 'Book verified masters, chat, manage orders, and pay securely with Fixora.',
    features: ['Trusted masters', 'Fast booking', 'Secure deal'],
    showFeatures: true,
    buttonText: 'Continue as Client',
    layout: 'visualTop',
    animation: 'float',
    visual: {
      image: '',
      imagePosition: 'cover',
      imageSize: 100,
      imageOverlay: 'rgba(5,8,22,0.2)',
      imageBrightness: 100,
      imageBlur: 0,
      showDecorations: false,
      icon: 'C',
      iconColor: '#41E6A4',
      iconSize: 42,
    },
    design: {
      background: 'rgba(255,255,255,0.08)',
      gradientColors: ['#157BFF', '#426BFF', '#7C3AED'],
      borderColor: 'rgba(255,255,255,0.16)',
      glowColor: '#157BFF',
      shadowIntensity: 58,
      selectedGlow: '#157BFF',
      selectedBorder: '#41E6A4',
      checkIconStyle: 'circle',
    },
    typography: {
      fontFamily: 'System',
      titleSize: 20,
      subtitleSize: 16,
      descriptionSize: 14,
      fontWeight: '900',
      lineHeight: 1.35,
      letterSpacing: 0,
      textColor: '#FFFFFF',
      mutedColor: '#AAB0C0',
    },
    updatedAt: new Date().toISOString(),
  },
};

const RoleCardSettingsContext = createContext<RoleCardSettingsContextValue | null>(null);

function mergeRoleCard(defaults: RoleCardSettings, stored?: Partial<RoleCardSettings>): RoleCardSettings {
  return {
    ...defaults,
    ...stored,
    features: stored?.features ?? defaults.features,
    visual: { ...defaults.visual, ...stored?.visual },
    design: { ...defaults.design, ...stored?.design },
    typography: { ...defaults.typography, ...stored?.typography },
  };
}

function normalizeSettings(stored: Partial<RoleCardSettingsState> | null): RoleCardSettingsState {
  return {
    master: mergeRoleCard(defaultRoleCardSettings.master, stored?.master),
    client: mergeRoleCard(defaultRoleCardSettings.client, stored?.client),
  };
}

export function RoleCardSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RoleCardSettingsState>(defaultRoleCardSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    storage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted || !stored) {
          return;
        }
        setSettings(normalizeSettings(JSON.parse(stored) as Partial<RoleCardSettingsState>));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: RoleCardSettingsState) => {
    setSettings(next);
    await storage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateRoleCard = useCallback(async (role: UserRole, patch: Partial<RoleCardSettings>) => {
    const nextCard = mergeRoleCard(settings[role], { ...patch, updatedAt: new Date().toISOString() });
    await persist({ ...settings, [role]: nextCard });
  }, [persist, settings]);

  const replaceRoleCard = useCallback(async (role: UserRole, next: RoleCardSettings) => {
    await persist({ ...settings, [role]: { ...next, role, updatedAt: new Date().toISOString() } });
  }, [persist, settings]);

  const resetRoleCards = useCallback(async () => {
    await persist(defaultRoleCardSettings);
  }, [persist]);

  const value = useMemo<RoleCardSettingsContextValue>(() => ({
    settings,
    loading,
    updateRoleCard,
    replaceRoleCard,
    resetRoleCards,
  }), [loading, replaceRoleCard, resetRoleCards, settings, updateRoleCard]);

  return <RoleCardSettingsContext.Provider value={value}>{children}</RoleCardSettingsContext.Provider>;
}

export function useRoleCardSettings() {
  const value = useContext(RoleCardSettingsContext);
  if (!value) {
    throw new Error('useRoleCardSettings must be used inside RoleCardSettingsProvider');
  }
  return value;
}
