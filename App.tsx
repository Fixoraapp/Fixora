import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import AuthScreen from './src/screens/AuthScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import HomeScreen from './src/screens/HomeScreen';
import LocationSelectionScreen from './src/screens/LocationSelectionScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import SplashScreen from './src/screens/SplashScreen';
import { getMockLocation } from './src/utils/location';
import { AppRoute, LocationSelection, UserRole } from './src/types/navigation';

export default function App() {
  const [route, setRoute] = useState<AppRoute>('splash');
  const [location, setLocation] = useState<LocationSelection>(getMockLocation());
  const [role, setRole] = useState<UserRole>('Client');

  return (
    <>
      <StatusBar style="light" translucent />
      {route === 'splash' ? (
        <SplashScreen onGetStarted={() => setRoute('onboarding')} />
      ) : null}
      {route === 'onboarding' ? (
        <OnboardingScreen onComplete={() => setRoute('location')} />
      ) : null}
      {route === 'location' ? (
        <LocationSelectionScreen
          onComplete={(selection) => {
            setLocation(selection);
            setRoute('role');
          }}
        />
      ) : null}
      {route === 'role' ? (
        <RoleSelectionScreen
          selectedRole={role}
          onSelectRole={setRole}
          onContinue={() => setRoute('auth')}
        />
      ) : null}
      {route === 'auth' ? (
        <AuthScreen role={role} onAuthenticated={() => setRoute('home')} />
      ) : null}
      {route === 'home' ? (
        <HomeScreen
          location={location}
          role={role}
          onOpenCategories={() => setRoute('categories')}
        />
      ) : null}
      {route === 'categories' ? <CategoriesScreen onBack={() => setRoute('home')} /> : null}
    </>
  );
}
