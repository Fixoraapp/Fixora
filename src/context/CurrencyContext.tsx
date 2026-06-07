import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../utils/storage';

export type AppCurrency = 'AMD' | 'USD' | 'RUB';

type CurrencyContextValue = {
  currentCurrency: AppCurrency;
  currencies: AppCurrency[];
  setCurrency: (currency: AppCurrency) => Promise<void>;
  formatMoney: (amount: number, fromCurrency?: AppCurrency) => string;
  convertMoney: (amount: number, fromCurrency: AppCurrency, toCurrency: AppCurrency) => number;
};

const CURRENCY_KEY = 'fixora.selectedCurrency.v1';
const currencies: AppCurrency[] = ['USD', 'AMD', 'RUB'];
const amdRates: Record<AppCurrency, number> = {
  AMD: 1,
  USD: 390,
  RUB: 4.3,
};

const symbols: Record<AppCurrency, string> = {
  AMD: 'AMD',
  USD: '$',
  RUB: 'RUB',
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function isCurrency(value: string | null): value is AppCurrency {
  return value === 'AMD' || value === 'USD' || value === 'RUB';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<AppCurrency>('USD');

  useEffect(() => {
    let mounted = true;
    storage.getItem(CURRENCY_KEY)
      .then((stored) => {
        if (mounted && isCurrency(stored)) {
          setCurrentCurrency(stored);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const setCurrency = useCallback(async (currency: AppCurrency) => {
    setCurrentCurrency(currency);
    await storage.setItem(CURRENCY_KEY, currency);
  }, []);

  const convertMoney = useCallback((amount: number, fromCurrency: AppCurrency, toCurrency: AppCurrency) => {
    const amountInAmd = amount * amdRates[fromCurrency];
    return amountInAmd / amdRates[toCurrency];
  }, []);

  const formatMoney = useCallback((amount: number, fromCurrency: AppCurrency = 'AMD') => {
    const converted = convertMoney(amount, fromCurrency, currentCurrency);
    const rounded = currentCurrency === 'AMD' || currentCurrency === 'RUB' ? Math.round(converted) : Math.round(converted * 100) / 100;
    const formatted = rounded.toLocaleString(undefined, {
      minimumFractionDigits: currentCurrency === 'USD' ? 2 : 0,
      maximumFractionDigits: currentCurrency === 'USD' ? 2 : 0,
    });

    return currentCurrency === 'USD' ? `${symbols[currentCurrency]}${formatted}` : `${formatted} ${symbols[currentCurrency]}`;
  }, [convertMoney, currentCurrency]);

  const value = useMemo<CurrencyContextValue>(() => ({
    currentCurrency,
    currencies,
    setCurrency,
    formatMoney,
    convertMoney,
  }), [convertMoney, currentCurrency, formatMoney, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) {
    throw new Error('useCurrency must be used inside CurrencyProvider');
  }
  return value;
}
