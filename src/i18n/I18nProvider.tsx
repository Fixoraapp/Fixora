import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LanguageRecord, TranslationRecord, useAdminConfig } from '../context/AdminConfigContext';
import { storage } from '../utils/storage';

export type TranslationLanguage = string;

type I18nContextValue = {
  language: TranslationLanguage;
  languages: LanguageRecord[];
  setLanguage: (language: TranslationLanguage) => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

const LANGUAGE_KEY = 'fixora.selectedLanguage.v1';
const I18nContext = createContext<I18nContextValue | null>(null);

function translationValue(row: TranslationRecord | undefined, language: string, fallback?: string) {
  if (!row) {
    return fallback;
  }

  return row.values?.[language] || row[language as 'ru' | 'en' | 'hy'] || row.values?.en || row.en || row.values?.ru || row.ru || fallback;
}

function createMissingTranslation(key: string, fallback?: string): TranslationRecord {
  const now = new Date().toISOString();
  const module = key.includes('.') ? key.split('.')[0] : 'missing';
  const value = fallback || key;

  return {
    id: `tr-missing-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    key,
    module,
    screen: module,
    description: 'Auto-created by TranslationProvider missing-key tracking.',
    ru: value,
    en: value,
    hy: value,
    values: { ru: value, en: value, hy: value },
    status: 'missing',
    updatedAt: now,
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const adminConfig = useAdminConfig();
  const activeLanguages = useMemo(
    () => adminConfig.state.languages.filter((item) => item.isActive),
    [adminConfig.state.languages],
  );
  const defaultLanguage = activeLanguages.find((item) => item.isDefault)?.code ?? activeLanguages[0]?.code ?? 'en';
  const [language, setLanguageState] = useState<TranslationLanguage>(defaultLanguage);
  const missingKeysRef = useRef<Set<string>>(new Set());
  const scheduledMissingRef = useRef<Set<string>>(new Set());
  const translationsRef = useRef(adminConfig.state.translations);

  useEffect(() => {
    translationsRef.current = adminConfig.state.translations;
  }, [adminConfig.state.translations]);

  useEffect(() => {
    let mounted = true;
    storage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (!mounted) {
          return;
        }

        const storedIsActive = !!stored && activeLanguages.some((item) => item.code === stored);
        setLanguageState(storedIsActive ? stored : defaultLanguage);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [activeLanguages, defaultLanguage]);

  const setLanguage = useCallback(async (nextLanguage: TranslationLanguage) => {
    const available = adminConfig.state.languages.some((item) => item.code === nextLanguage && item.isActive);
    const resolvedLanguage = available ? nextLanguage : defaultLanguage;
    setLanguageState(resolvedLanguage);
    await storage.setItem(LANGUAGE_KEY, resolvedLanguage);
  }, [adminConfig.state.languages, defaultLanguage]);

  const trackMissing = useCallback((key: string, fallback?: string) => {
    if (missingKeysRef.current.has(key) || adminConfig.state.translations.some((item) => item.key === key)) {
      return;
    }

    missingKeysRef.current.add(key);
    scheduledMissingRef.current.add(key);
    setTimeout(() => {
      if (!scheduledMissingRef.current.has(key)) {
        return;
      }
      scheduledMissingRef.current.delete(key);
      const currentRows = translationsRef.current;
      if (currentRows.some((item) => item.key === key)) {
        return;
      }
      const next = [createMissingTranslation(key, fallback), ...currentRows];
      translationsRef.current = next;
      adminConfig.updateSection('translations', next);
      adminConfig.addLog('missing translation created', 'Translations', `Auto-created missing key ${key}`, undefined, { key, fallback }).catch(() => undefined);
    }, 0);
  }, [adminConfig]);

  const t = useCallback((key: string, fallback?: string) => {
    const row = adminConfig.state.translations.find((item) => item.key === key);
    const value = translationValue(row, language, fallback);

    if (!row || !translationValue(row, language)) {
      trackMissing(key, fallback);
    }

    return value || key;
  }, [adminConfig.state.translations, language, trackMissing]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    languages: activeLanguages,
    setLanguage,
    t,
  }), [activeLanguages, language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useTranslation must be used inside I18nProvider');
  }
  return value;
}
