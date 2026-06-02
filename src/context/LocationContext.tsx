import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { countries } from '../data/locations';
import { LocationSelection } from '../types/navigation';

const defaultCountry = countries[0];
const defaultRegion =
  defaultCountry.regions.find((region) => region.name_en === defaultCountry.capital_en || region.capital_en === defaultCountry.capital_en) ??
  defaultCountry.regions[0];
const defaultCity = defaultRegion.cities[0];

export const defaultLocation: LocationSelection = {
  country: defaultCountry.name_en,
  region: defaultRegion.name_en,
  city: defaultCity?.name_en ?? defaultRegion.capital_en,
  address: 'Kievyan St, 24, Yerevan',
  district: 'Arabkir',
  street: 'Kievyan St',
  postalCode: '0033',
  latitude: 40.1792,
  longitude: 44.4991,
  timezone: 'Asia/Yerevan',
  countryCode: defaultCountry.iso2,
  currency: defaultCountry.currency,
  language: defaultCountry.language,
};

type LocationContextValue = {
  selectedLocation: LocationSelection;
  setSelectedLocation: (location: LocationSelection) => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

type LocationProviderProps = {
  children: ReactNode;
};

export function LocationProvider({ children }: LocationProviderProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>(defaultLocation);

  // TODO: Persist selectedLocation with AsyncStorage when @react-native-async-storage/async-storage is added.
  const value = useMemo(
    () => ({
      selectedLocation,
      setSelectedLocation,
    }),
    [selectedLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useLocationContext must be used inside LocationProvider');
  }

  return context;
}
