import * as ExpoLocation from 'expo-location';
import { countries } from '../data/locations';
import { LocationSelection } from '../types/navigation';
import { getMockLocation } from '../utils/location';

type ReverseAddress = ExpoLocation.LocationGeocodedAddress;

const currencyByCountry: Record<string, { currency: string; language: string }> = {
  AM: { currency: 'AMD', language: 'hy' },
  RU: { currency: 'RUB', language: 'ru' },
  GE: { currency: 'GEL', language: 'ka' },
  US: { currency: 'USD', language: 'en' },
  CA: { currency: 'CAD', language: 'en' },
};

function countryMeta(countryCode?: string | null) {
  const normalized = countryCode?.toUpperCase();
  const country = countries.find((item) => item.iso2 === normalized);
  const fallback = normalized ? currencyByCountry[normalized] : undefined;

  return {
    countryName: country?.name_en,
    currency: country?.currency ?? fallback?.currency ?? 'USD',
    language: country?.language ?? fallback?.language ?? 'en',
  };
}

function addressLine(address: ReverseAddress) {
  return [address.streetNumber, address.street, address.name, address.city].filter(Boolean).join(', ');
}

export const locationService = {
  async requestCurrentLocation(): Promise<LocationSelection> {
    const permission = await ExpoLocation.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      throw new Error('LOCATION_PERMISSION_DENIED');
    }

    const current =
      (await ExpoLocation.getLastKnownPositionAsync({ maxAge: 30_000, requiredAccuracy: 200 })) ??
      (await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High }));
    const { latitude, longitude } = current.coords;
    const [reverse] = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
    const meta = countryMeta(reverse?.isoCountryCode);
    const fallback = getMockLocation();

    return {
      country: meta.countryName ?? reverse?.country ?? fallback.country,
      region: reverse?.region ?? reverse?.subregion ?? fallback.region,
      city: reverse?.city ?? reverse?.district ?? reverse?.subregion ?? fallback.city,
      district: reverse?.district ?? reverse?.subregion ?? '',
      street: reverse?.street ?? reverse?.name ?? '',
      postalCode: reverse?.postalCode ?? '',
      address: reverse ? addressLine(reverse) || reverse.formattedAddress || fallback.address : fallback.address,
      latitude,
      longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      countryCode: reverse?.isoCountryCode?.toUpperCase() ?? fallback.countryCode,
      currency: meta.currency,
      language: meta.language,
    };
  },
};
