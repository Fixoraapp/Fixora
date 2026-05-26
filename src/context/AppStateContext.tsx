import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultLocation } from './LocationContext';
import { LocationSelection, UserRole } from '../types/navigation';
import { storage } from '../utils/storage';

type PersistedAppState = {
  hasSeenOnboarding: boolean;
  hasCompletedLocationSetup: boolean;
  selectedLocation: LocationSelection;
  selectedRole: UserRole | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
};

type AppStateContextValue = PersistedAppState & {
  loading: boolean;
  completeOnboarding: () => Promise<void>;
  completeLocationSetup: (location: LocationSelection) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  authenticate: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetAppState: () => Promise<void>;
};

const STORAGE_KEY = 'fixora.appState.v1';

const initialState: PersistedAppState = {
  hasSeenOnboarding: false,
  hasCompletedLocationSetup: false,
  selectedLocation: defaultLocation,
  selectedRole: null,
  isAuthenticated: false,
  userRole: null,
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function normalizePersistedState(state: PersistedAppState): PersistedAppState {
  const location = state.selectedLocation;
  const hasLegacyAutoLocationBug =
    location.countryCode === 'AM' &&
    location.city !== 'Yerevan' &&
    location.address?.toLowerCase().includes('yerevan');

  if (!hasLegacyAutoLocationBug) {
    return state;
  }

  return {
    ...state,
    selectedLocation: {
      country: 'Armenia',
      region: 'Yerevan',
      city: 'Yerevan',
      address: 'Kievyan St, 24, Yerevan',
      countryCode: 'AM',
      currency: 'AMD',
      language: 'hy',
    },
  };
}

async function persist(nextState: PersistedAppState) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedAppState>(initialState);
  const stateRef = useRef<PersistedAppState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    storage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted || !stored) {
          return;
        }

        const parsed = JSON.parse(stored) as Partial<PersistedAppState>;
        const nextState = normalizePersistedState({
          ...initialState,
          ...parsed,
          selectedLocation: parsed.selectedLocation ?? initialState.selectedLocation,
        });
        stateRef.current = nextState;
        setState(nextState);
        if (nextState !== parsed) {
          persist(nextState).catch(() => undefined);
        }
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

  const update = useCallback(async (patch: Partial<PersistedAppState>) => {
    const nextState = { ...stateRef.current, ...patch };
    stateRef.current = nextState;
    setState(nextState);
    await persist(nextState);
  }, []);

  const resetAppState = useCallback(async () => {
    stateRef.current = initialState;
    setState(initialState);
    await storage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      loading,
      completeOnboarding: () => update({ hasSeenOnboarding: true }),
      completeLocationSetup: (location) => update({ hasCompletedLocationSetup: true, selectedLocation: location }),
      setRole: (role) => update({ selectedRole: role, userRole: role }),
      authenticate: (role) => update({ isAuthenticated: true, userRole: role, selectedRole: role }),
      signOut: () => update({ isAuthenticated: false }),
      resetAppState,
    }),
    [loading, resetAppState, state, update],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppStateContext() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppStateContext must be used inside AppStateProvider');
  }

  return context;
}
