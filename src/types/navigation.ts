export type AppRoute =
  | 'start'
  | 'welcome'
  | 'onboarding'
  | 'location'
  | 'manualLocation'
  | 'login'
  | 'register'
  | 'home'
  | 'categories'
  | 'admin';

export type UserRole = 'client' | 'master' | 'company';

export type AuthMethod = 'phone' | 'email' | 'google' | 'apple' | 'guest';

export type LocationSelection = {
  country: string;
  region: string;
  city: string;
  address?: string;
  district?: string;
  street?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  countryCode: string;
  currency: string;
  language: string;
};
