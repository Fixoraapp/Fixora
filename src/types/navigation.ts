export type AppRoute =
  | 'splash'
  | 'onboarding'
  | 'location'
  | 'role'
  | 'auth'
  | 'home'
  | 'categories';

export type UserRole = 'Client' | 'Master' | 'Premium Master' | 'Company';

export type LocationSelection = {
  country: string;
  region: string;
  city: string;
};
