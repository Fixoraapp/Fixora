import { StatusBar } from 'expo-status-bar';
import * as NativeSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import CategoriesScreen from './src/screens/CategoriesScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminScreen from './src/screens/AdminScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import StartAnimationScreen from './src/screens/StartAnimationScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { AdminConfigProvider } from './src/context/AdminConfigContext';
import { AppStateProvider, useAppStateContext } from './src/context/AppStateContext';
import { LocationProvider, defaultLocation, useLocationContext } from './src/context/LocationContext';
import { MarketplaceProvider } from './src/context/MarketplaceContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { I18nProvider } from './src/i18n/I18nProvider';
import { AppRoute, LocationSelection, UserRole } from './src/types/navigation';
import { authStorage, RegisteredUser } from './src/services/authStorage';

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
                  <AppContent />
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
  const [route, setRoute] = useState<AppRoute>('start');
  const [location, setLocation] = useState<LocationSelection>(appState.selectedLocation);
  const [role, setRoleState] = useState<UserRole>(appState.selectedRole ?? appState.userRole ?? 'client');
  const [user, setUser] = useState<RegisteredUser | null>(null);
  const [startTarget, setStartTarget] = useState<'welcome' | 'login'>('welcome');

  useEffect(() => {
    NativeSplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    setLocation(appState.selectedLocation);
    setSelectedLocation(appState.selectedLocation);
    setRoleState(appState.selectedRole ?? appState.userRole ?? 'client');
  }, [appState.selectedLocation, appState.selectedRole, appState.userRole, setSelectedLocation]);

  const finishStartAnimation = async () => {
    const session = await authStorage.session();
    const currentUser = await authStorage.currentUser();
    if (session?.rememberMe && currentUser) {
      setUser(currentUser);
      setRoleState(currentUser.role);
      await appState.setRole(currentUser.role);
      setRoute('home');
      return;
    }
    setRoute(startTarget);
  };

  const completeAuth = async (nextUser: RegisteredUser) => {
    setUser(nextUser);
    setRoleState(nextUser.role);
    await appState.setRole(nextUser.role);
    setRoute('home');
  };

  const logout = async () => {
    await authStorage.logout();
    setUser(null);
    setStartTarget('login');
    setRoute('start');
  };

  const resetAppForDev = async () => {
    await authStorage.logout();
    await appState.resetAppState();
    setLocation(defaultLocation);
    setSelectedLocation(defaultLocation);
    setRoleState('client');
    setUser(null);
    setStartTarget('welcome');
    setRoute('start');
  };

  return (
    <>
      <StatusBar style="dark" translucent />
      {route === 'start' ? (
        <StartAnimationScreen onFinish={finishStartAnimation} />
      ) : null}
      {route === 'welcome' ? (
        <WelcomeScreen onLogin={() => setRoute('login')} onRegister={() => setRoute('register')} onOpenAdmin={() => setRoute('admin')} />
      ) : null}
      {route === 'login' ? (
        <LoginScreen onLoggedIn={completeAuth} onRegister={() => setRoute('register')} />
      ) : null}
      {route === 'register' ? (
        <RegisterScreen onRegistered={completeAuth} onLogin={() => setRoute('login')} />
      ) : null}
      {route === 'home' ? (
        <HomeScreen
          location={location}
          role={role}
          currentUser={user}
          onOpenCategories={() => setRoute('categories')}
          onOpenAdmin={() => setRoute('admin')}
          onLogout={logout}
        />
      ) : null}
      {route === 'admin' ? <AdminScreen onExit={() => setRoute(user ? 'home' : 'welcome')} /> : null}
      {route === 'categories' ? <CategoriesScreen onBack={() => setRoute('home')} /> : null}
      {__DEV__ && route !== 'start' ? (
        <Pressable accessibilityRole="button" onPress={resetAppForDev} style={styles.devResetButton}>
          <Text style={styles.devResetText}>RESET</Text>
        </Pressable>
      ) : null}
    </>
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
});
