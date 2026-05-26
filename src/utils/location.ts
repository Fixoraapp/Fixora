import { countries } from '../data/locations';
import { LocationSelection } from '../types/navigation';

export function getMockLocation(): LocationSelection {
  const country = countries.find((item) => item.iso2 === 'AM') ?? countries[0];
  const region =
    country.regions.find((item) => item.name_en === 'Yerevan' || item.capital_en === country.capital_en) ??
    country.regions[0];
  const selectedCity = region.cities[0];

  return {
    country: country.name_en,
    region: region.name_en,
    city: selectedCity?.name_en ?? region.capital_en,
    address: 'Kievyan St, 24, Yerevan',
    district: 'Arabkir',
    street: 'Kievyan St',
    postalCode: '0033',
    latitude: 40.1792,
    longitude: 44.4991,
    timezone: 'Asia/Yerevan',
    countryCode: country.iso2,
    currency: country.currency,
    language: country.language,
  };
}

export function getRegions(country: string) {
  return countries.find((item) => item.name_en === country || item.name_ru === country)?.regions ?? [];
}

export function getCities(country: string, region: string) {
  const selectedRegion = getRegions(country).find((item) => item.name_en === region || item.name_ru === region);

  if (!selectedRegion) {
    return [];
  }

  return selectedRegion.cities.length > 0
    ? selectedRegion.cities.map((item) => item.name_en)
    : [selectedRegion.capital_en];
}
