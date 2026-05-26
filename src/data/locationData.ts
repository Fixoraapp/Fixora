import { countries as structuredCountries } from './locations';

export type LocationRegion = {
  name: string;
  cities: string[];
};

export type LocationCountry = {
  name: string;
  code: string;
  currency: string;
  language: string;
  flag: string;
  regions: LocationRegion[];
};

export const countries: LocationCountry[] = structuredCountries.map((country) => ({
  name: country.name_en,
  code: country.iso2,
  currency: country.currency,
  language: country.language,
  flag: country.emoji,
  regions: country.regions
    .filter((region) => !region.parent_region_id)
    .map((region) => ({
      name: region.name_en,
      cities: region.cities.map((item) => item.name_en),
    })),
}));
