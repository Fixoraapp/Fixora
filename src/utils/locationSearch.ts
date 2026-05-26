import { countries } from '../data/locations';
import { City, Country, Region } from '../types/location';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matches(query: string, values: Array<string | undefined>) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => normalize(value ?? '').includes(normalizedQuery));
}

export function searchCountries(query: string): Country[] {
  return countries.filter((country) =>
    matches(query, [
      country.name_ru,
      country.name_en,
      country.name_hy,
      country.iso2,
      country.iso3,
      country.currency,
      country.language,
      country.capital_ru,
      country.capital_en,
    ]),
  );
}

export function getCountryByIso2(countryIso2: string): Country | undefined {
  return countries.find((country) => country.iso2 === countryIso2);
}

export function getRegionById(regionId: string): Region | undefined {
  return countries.flatMap((country) => country.regions).find((region) => region.id === regionId);
}

export function getTopLevelRegions(countryIso2: string): Region[] {
  return getCountryByIso2(countryIso2)?.regions.filter((region) => !region.parent_region_id) ?? [];
}

export function getChildRegions(parentRegionId: string): Region[] {
  const parent = getRegionById(parentRegionId);

  if (!parent) {
    return [];
  }

  return getCountryByIso2(parent.country_iso2)?.regions.filter((region) => region.parent_region_id === parentRegionId) ?? [];
}

export function getSelectableRegions(countryIso2: string, parentRegionId?: string): Region[] {
  return parentRegionId ? getChildRegions(parentRegionId) : getTopLevelRegions(countryIso2);
}

export function searchRegions(countryIso2: string, query: string, parentRegionId?: string): Region[] {
  return getSelectableRegions(countryIso2, parentRegionId).filter((region) =>
    matches(query, [
      region.name_ru,
      region.name_en,
      region.name_hy,
      region.type_ru,
      region.type_en,
      region.capital_ru,
      region.capital_en,
    ]),
  );
}

export function getCitiesForRegion(region: Region): City[] {
  if (region.cities.length > 0) {
    return region.cities;
  }

  return [
    {
      id: `${region.id}-capital`,
      region_id: region.id,
      name_ru: region.capital_ru,
      name_en: region.capital_en,
    },
  ];
}

export function searchCities(regionId: string, query: string): City[] {
  const region = getRegionById(regionId);

  if (!region) {
    return [];
  }

  return getCitiesForRegion(region).filter((city) => matches(query, [city.name_ru, city.name_en, city.name_hy]));
}
