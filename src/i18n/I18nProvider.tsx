import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { storage } from '../utils/storage';
import { AppLanguage } from './defaultTranslations';

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

const LANGUAGE_KEY = 'fixora.selectedLanguage.v1';
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const adminConfig = useAdminConfig();
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    let mounted = true;
    storage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (mounted && (stored === 'ru' || stored === 'hy' || stored === 'en')) {
          setLanguageState(stored);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await storage.setItem(LANGUAGE_KEY, nextLanguage);
  }, []);

  const t = useCallback((key: string, fallback?: string) => {
    const row = adminConfig.state.translations.find((item) => item.key === key);
    const value = row?.[language] || row?.en || row?.ru || fallback || key;
    return value || key;
  }, [adminConfig.state.translations, language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useTranslation must be used inside I18nProvider');
  }
  return value;
}
