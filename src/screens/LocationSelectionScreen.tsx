import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LocationFlowV2 } from '../components/LocationFlowV2';
import { LocationSelector, LocationSelectorItem } from '../components/LocationSelector';
import { useAdminConfig } from '../context/AdminConfigContext';
import { useLocationContext } from '../context/LocationContext';
import { useTranslation } from '../i18n/I18nProvider';
import { countries } from '../data/locations';
import { useTheme } from '../theme/useTheme';
import { City, Country, Region } from '../types/location';
import { LocationSelection } from '../types/navigation';
import {
  getChildRegions,
  getCitiesForRegion,
  getTopLevelRegions,
  searchCities,
  searchCountries,
  searchRegions,
} from '../utils/locationSearch';

type LocationLevel = 'country' | 'region' | 'city';

type LocationSelectionScreenProps = {
  onComplete: (location: LocationSelection) => void;
};

function getPrimaryRegion(country: Country) {
  return (
    country.regions.find((item) => item.name_en === country.capital_en || item.capital_en === country.capital_en) ??
    getTopLevelRegions(country.iso2)[0] ??
    country.regions[0]
  );
}

function getPrimaryCity(region: Region) {
  return getCitiesForRegion(region).find((item) => item.name_en === region.capital_en) ?? getCitiesForRegion(region)[0];
}

export default function LocationSelectionScreen({ onComplete }: LocationSelectionScreenProps) {
  const adminConfig = useAdminConfig();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { selectedLocation, setSelectedLocation } = useLocationContext();
  const activeCountryCodes = adminConfig.state.countries.filter((item) => item.isActive && item.marketplaceEnabled).map((item) => item.iso2);
  const visibleCountries = activeCountryCodes.length > 0 ? countries.filter((item) => activeCountryCodes.includes(item.iso2)) : countries;
  const initialCountry = visibleCountries.find((item) => item.iso2 === selectedLocation.countryCode) ?? visibleCountries[0] ?? countries[0];
  const initialRegion =
    initialCountry.regions.find(
      (item) => item.name_en === selectedLocation.region || item.name_ru === selectedLocation.region,
    ) ?? getPrimaryRegion(initialCountry);
  const initialCity = getPrimaryCity(initialRegion);

  const [level, setLevel] = useState<LocationLevel>('country');
  const [country, setCountry] = useState<Country>(initialCountry);
  const [parentRegion, setParentRegion] = useState<Region | undefined>(
    initialRegion.parent_region_id ? initialCountry.regions.find((item) => item.id === initialRegion.parent_region_id) : undefined,
  );
  const [region, setRegion] = useState<Region>(initialRegion);
  const [city, setCity] = useState<City>(initialCity);
  const [query, setQuery] = useState('');

  const regionParentId = parentRegion?.id;
  const regionOptions = useMemo(
    () => searchRegions(country.iso2, query, regionParentId),
    [country.iso2, query, regionParentId],
  );

  const title =
    level === 'country'
      ? t('location.manual.title', 'Where are you located?')
      : level === 'region'
        ? parentRegion
          ? 'Select Subject'
          : country.iso2 === 'RU'
            ? 'Select Federal District'
            : 'Select Region'
        : 'Select City';
  const subtitle =
    level === 'country'
      ? t('location.manual.country', 'Select your country to get started')
      : level === 'region'
        ? parentRegion
          ? `${parentRegion.name_en}`
          : `${country.name_en} · ${country.iso2} · ${country.currency}`
        : `${region.name_en}, ${country.name_en}`;

  const items = useMemo<LocationSelectorItem[]>(() => {
    if (level === 'country') {
      const available = activeCountryCodes.length > 0 ? searchCountries(query).filter((item) => activeCountryCodes.includes(item.iso2)) : searchCountries(query);
      return available.map((item) => ({
        id: item.iso2,
        title: item.name_en,
        subtitle: `${item.name_ru} · ${item.iso2}/${item.iso3} · ${item.currency} · ${item.language.toUpperCase()}`,
        meta: item.capital_en,
      }));
    }

    if (level === 'region') {
      return regionOptions.map((item) => {
        const children = getChildRegions(item.id);
        const itemCities = getCitiesForRegion(item);

        return {
          id: item.id,
          title: item.name_en,
          subtitle: `${item.name_ru} · ${item.type_en}`,
          meta: children.length > 0 ? `${children.length} subjects` : itemCities[0]?.name_en ?? item.capital_en,
        };
      });
    }

    return searchCities(region.id, query).map((item) => ({
      id: item.id,
      title: item.name_en,
      subtitle: item.name_ru,
      meta: country.currency,
    }));
  }, [activeCountryCodes, country.currency, level, query, region.id, regionOptions]);

  const selectedId = level === 'country' ? country.iso2 : level === 'region' ? region.id : city.id;

  const selectCountry = (countryIso2: string) => {
    const nextCountry = visibleCountries.find((candidate) => candidate.iso2 === countryIso2) ?? visibleCountries[0] ?? countries[0];
    const nextRegion = getPrimaryRegion(nextCountry);
    const nextChildren = getChildRegions(nextRegion.id);
    const nextFinalRegion = nextChildren[0] ?? nextRegion;
    const nextCity = getPrimaryCity(nextFinalRegion);

    setCountry(nextCountry);
    setParentRegion(nextChildren.length > 0 ? nextRegion : undefined);
    setRegion(nextFinalRegion);
    setCity(nextCity);
    setQuery('');
    setLevel('region');
  };

  const selectRegion = (regionId: string) => {
    const selectedRegion = country.regions.find((candidate) => candidate.id === regionId) ?? region;
    const children = getChildRegions(selectedRegion.id);

    if (children.length > 0) {
      const firstSubject = children[0];
      setParentRegion(selectedRegion);
      setRegion(firstSubject);
      setCity(getPrimaryCity(firstSubject));
      setQuery('');
      return;
    }

    setRegion(selectedRegion);
    setCity(getPrimaryCity(selectedRegion));
    setQuery('');
    setLevel('city');
  };

  const selectItem = (item: LocationSelectorItem) => {
    if (level === 'country') {
      selectCountry(item.id);
      return;
    }

    if (level === 'region') {
      selectRegion(item.id);
      return;
    }

    const nextCity = getCitiesForRegion(region).find((candidate) => candidate.id === item.id) ?? city;
    setCity(nextCity);
  };

  const continueFlow = () => {
    if (level === 'country') {
      setLevel('region');
      setQuery('');
      return;
    }

    if (level === 'region') {
      if (getChildRegions(region.id).length > 0) {
        const firstChild = getChildRegions(region.id)[0];
        setParentRegion(region);
        setRegion(firstChild);
        setCity(getPrimaryCity(firstChild));
        setQuery('');
        return;
      }

      setLevel('city');
      setQuery('');
      return;
    }

    const nextLocation: LocationSelection = {
      country: country.name_en,
      region: region.name_en,
      city: city.name_en,
      address: `${city.name_en} center, mock address`,
      district: region.name_en,
      street: `${city.name_en} center`,
      postalCode: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      countryCode: country.iso2,
      currency: country.currency,
      language: country.language,
    };

    setSelectedLocation(nextLocation);
    onComplete(nextLocation);
  };

  const goBack = () => {
    if (level === 'city') {
      setLevel('region');
      setQuery('');
      return;
    }

    if (level === 'region' && parentRegion) {
      setRegion(parentRegion);
      setParentRegion(undefined);
      setQuery('');
      return;
    }

    if (level === 'region') {
      setLevel('country');
      setQuery('');
    }
  };

  return (
    <LocationFlowV2
      title="LocationFlowV2"
      status={`${title} · ${subtitle}`}
      primaryAction={{ title: level === 'city' ? 'Continue' : 'Next', onPress: continueFlow }}
      secondaryAction={level === 'country' ? undefined : { title: 'Back', onPress: goBack }}
    >
      <View style={styles.controls}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={level === 'country' ? 'Search country, ISO, currency' : level === 'region' ? 'Search region, subject, capital' : 'Search city'}
          placeholderTextColor={theme.colors.dim}
          style={[styles.search, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.stroke }]}
          autoCapitalize="none"
        />
        <Text style={[styles.sectionLabel, { color: theme.colors.muted }]}>{level}</Text>
        <LocationSelector items={items} selectedId={selectedId} onSelect={selectItem} />
      </View>
    </LocationFlowV2>
  );
}

const styles = StyleSheet.create({
  controls: {
    marginTop: 18,
    gap: 12,
  },
  search: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
