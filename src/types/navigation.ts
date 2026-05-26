export type AppRoute =
  | 'splash'
  | 'onboarding'
  | 'location'
  | 'manualLocation'
  | 'role'
  | 'auth'
  | 'home'
  | 'categories'
  | 'admin';

export type UserRole = 'client' | 'master';

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
