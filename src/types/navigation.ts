export type AppRoute =
  | 'splash'
  | 'onboarding'
  | 'location'
  | 'role'
  | 'auth'
  | 'home'
  | 'categories';

export type UserRole = 'client' | 'master';

export type LocationSelection = {
  country: string;
  region: string;
  city: string;
  countryCode: string;
  currency: string;
  language: string;
};
