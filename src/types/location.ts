export type City = {
  id: string;
  region_id: string;
  name_ru: string;
  name_en: string;
  name_hy?: string;
};

export type Region = {
  id: string;
  country_iso2: string;
  parent_region_id?: string;
  name_ru: string;
  name_en: string;
  name_hy?: string;
  type_ru: string;
  type_en: string;
  capital_ru: string;
  capital_en: string;
  cities: City[];
};

export type Country = {
  id: string;
  name_ru: string;
  name_en: string;
  name_hy: string;
  iso2: string;
  iso3: string;
  emoji: string;
  currency: string;
  language: string;
  capital_ru: string;
  capital_en: string;
  regions: Region[];
};
