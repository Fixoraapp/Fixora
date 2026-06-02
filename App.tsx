import { StatusBar } from 'expo-status-bar';
import * as NativeSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import AuthScreen from './src/screens/AuthScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminScreen from './src/screens/AdminScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import SplashScreen from './src/screens/SplashScreen';
import { AdminConfigProvider } from './src/context/AdminConfigContext';
import { LanguageSwitcher } from './src/components/LanguageSwitcher';
import { AppStateProvider, useAppStateContext } from './src/context/AppStateContext';
import { LocationProvider, defaultLocation, useLocationContext } from './src/context/LocationContext';
import { MarketplaceProvider } from './src/context/MarketplaceContext';
import { RoleCardSettingsProvider } from './src/context/RoleCardSettingsContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { I18nProvider } from './src/i18n/I18nProvider';
import { AppRoute, LocationSelection, UserRole } from './src/types/navigation';

NativeSplashScreen.preventAutoHideAsync();
NativeSplashScreen.setOptions({
  duration: 450,
  fade: true,
});

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AppStateProvider>
          <LocationProvider>
            <MarketplaceProvider>
              <AdminConfigProvider>
                <I18nProvider>
                  <RoleCardSettingsProvider>
                    <AppContent />
                  </RoleCardSettingsProvider>
                </I18nProvider>
              </AdminConfigProvider>
            </MarketplaceProvider>
          </LocationProvider>
        </AppStateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const appState = useAppStateContext();
  const { setSelectedLocation } = useLocationContext();
  const [route, setRoute] = useState<AppRoute>('splash');
  const [location, setLocation] = useState<LocationSelection>(appState.selectedLocation);
  const [role, setRoleState] = useState<UserRole>(appState.selectedRole ?? appState.userRole ?? 'client');

  useEffect(() => {
    NativeSplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (appState.loading) {
      return;
    }

    setLocation(appState.selectedLocation);
    setSelectedLocation(appState.selectedLocation);
    setRoleState(appState.selectedRole ?? appState.userRole ?? 'client');

    if (appState.isAuthenticated && appState.userRole) {
      setRoute('home');
      return;
    }
    if (appState.selectedRole) {
      setRoute('auth');
      return;
    }

    setRoute('role');
  }, [appState.isAuthenticated, appState.loading, appState.selectedLocation, appState.selectedRole, appState.userRole, setSelectedLocation]);

  const selectRole = (nextRole: UserRole) => {
    setRoleState(nextRole);
    appState.setRole(nextRole);
  };

  const resetAppForDev = async () => {
    await appState.resetAppState();
    setLocation(defaultLocation);
    setSelectedLocation(defaultLocation);
    setRoleState('client');
    setRoute('splash');
  };

  return (
    <>
      <StatusBar style="dark" translucent />
      {appState.loading ? <SplashScreen onGetStarted={() => undefined} /> : null}
      {!appState.loading && route === 'splash' ? (
        <SplashScreen onGetStarted={() => setRoute('role')} />
      ) : null}
      {!appState.loading && route === 'role' ? (
        <RoleSelectionScreen
          selectedRole={role}
          onSelectRole={selectRole}
          onContinue={() => setRoute('auth')}
          onOpenAdmin={() => setRoute('admin')}
          onResetAppState={resetAppForDev}
        />
      ) : null}
      {!appState.loading && route === 'auth' ? (
        <AuthScreen
          role={role}
          onAuthenticated={async () => {
            await appState.authenticate(role);
            setRoute('home');
          }}
        />
      ) : null}
      {!appState.loading && route === 'home' ? (
        <HomeScreen
          location={location}
          role={role}
          onOpenCategories={() => setRoute('categories')}
        />
      ) : null}
      {!appState.loading && route === 'admin' ? <AdminScreen onExit={() => setRoute('role')} /> : null}
      {!appState.loading && route === 'categories' ? <CategoriesScreen onBack={() => setRoute('home')} /> : null}
      {__DEV__ && !appState.loading ? (
        <Pressable accessibilityRole="button" onPress={resetAppForDev} style={styles.devResetButton}>
          <Text style={styles.devResetText}>RESET</Text>
        </Pressable>
      ) : null}
      {!appState.loading && route !== 'admin' ? (
        <SafeLanguageDock />
      ) : null}
    </>
  );
}

function SafeLanguageDock() {
  return (
    <Pressable style={styles.languageDock}>
      <LanguageSwitcher compact />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  devResetButton: {
    position: 'absolute',
    right: 14,
    top: 48,
    zIndex: 9999,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,93,122,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  devResetText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  languageDock: {
    position: 'absolute',
    left: 14,
    top: 48,
    zIndex: 9998,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 14,
    shadowColor: '#6D5DFB',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
});
