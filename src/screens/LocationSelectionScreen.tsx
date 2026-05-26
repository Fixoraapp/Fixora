import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { LocationSelector, LocationSelectorItem } from '../components/LocationSelector';
import { ScreenBackground } from '../components/ScreenBackground';
import { useLocationContext } from '../context/LocationContext';
import { countries } from '../data/locations';
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
  const { selectedLocation, setSelectedLocation } = useLocationContext();
  const initialCountry = countries.find((item) => item.iso2 === selectedLocation.countryCode) ?? countries[0];
  const initialRegion =
    initialCountry.regions.find(
      (item) => item.name_en === selectedLocation.region || item.name_ru === selectedLocation.region,
    ) ??
    getPrimaryRegion(initialCountry);
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
  const hasChildRegions = level === 'region' ? regionOptions.some((item) => getChildRegions(item.id).length > 0) : false;

  const title =
    level === 'country'
      ? 'Where are you located?'
      : level === 'region'
        ? parentRegion
          ? 'Select Subject'
          : country.iso2 === 'RU'
            ? 'Select Federal District'
            : 'Select Region'
        : 'Select City';
  const subtitle =
    level === 'country'
      ? 'Select your country to get started'
      : level === 'region'
        ? parentRegion
          ? `${country.emoji} ${parentRegion.name_en}`
          : `${country.emoji} ${country.name_en} • ${country.iso2} • ${country.currency}`
        : `${country.emoji} ${region.name_en}, ${country.name_en}`;

  const items = useMemo<LocationSelectorItem[]>(() => {
    if (level === 'country') {
      return searchCountries(query).map((item) => ({
        id: item.iso2,
        title: item.name_en,
        subtitle: `${item.name_ru} • ${item.iso2}/${item.iso3} • ${item.currency} • ${item.language.toUpperCase()}`,
        meta: item.capital_en,
        leading: <Text style={styles.flag}>{item.emoji}</Text>,
      }));
    }

    if (level === 'region') {
      return regionOptions.map((item) => {
        const children = getChildRegions(item.id);
        const itemCities = getCitiesForRegion(item);

        return {
          id: item.id,
          title: item.name_en,
          subtitle: `${item.name_ru} • ${item.type_en}`,
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
  }, [country.currency, level, query, region.id, regionOptions]);

  const selectedId = level === 'country' ? country.iso2 : level === 'region' ? region.id : city.id;

  const selectCountry = (countryIso2: string) => {
    const nextCountry = countries.find((candidate) => candidate.iso2 === countryIso2) ?? countries[0];
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
        setParentRegion(region);
        setRegion(getChildRegions(region.id)[0]);
        setCity(getPrimaryCity(getChildRegions(region.id)[0]));
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
    <ScreenBackground>
      <View style={styles.header}>
        <Text style={styles.back} onPress={goBack}>{level === 'country' ? ' ' : '‹'}</Text>
        <View style={styles.progress}>
          <View style={[styles.step, styles.stepActive]}><Text style={styles.stepText}>1</Text></View>
          <View style={[styles.line, level !== 'country' && styles.lineActive]} />
          <View style={[styles.step, level !== 'country' && styles.stepActive]}><Text style={styles.stepText}>2</Text></View>
          <View style={[styles.line, level === 'city' && styles.lineActive]} />
          <View style={[styles.step, level === 'city' && styles.stepActive]}><Text style={styles.stepText}>3</Text></View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.world}>
          <View style={styles.worldGlow} />
          <Text style={styles.worldText}>{country.iso2}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={level === 'country' ? 'Search country, ISO, currency' : level === 'region' ? 'Search region, subject, capital' : 'Search city'}
          placeholderTextColor="rgba(255,255,255,0.48)"
          style={styles.search}
          autoCapitalize="none"
        />

        <Text style={styles.sectionLabel}>
          {level === 'country'
            ? 'Countries'
            : level === 'region'
              ? parentRegion
                ? 'Subjects of Russia'
                : hasChildRegions
                  ? 'Federal Districts'
                  : 'Regions / States / Provinces'
              : 'Cities / Administrative centers'}
        </Text>
        <LocationSelector items={items} selectedId={selectedId} onSelect={selectItem} />

        <GlassCard style={styles.summary}>
          <Text style={styles.summaryTitle}>Local marketplace routing</Text>
          <Text style={styles.summaryText}>Country: {country.name_en} ({country.iso2})</Text>
          {parentRegion ? <Text style={styles.summaryText}>Federal District: {parentRegion.name_en}</Text> : null}
          <Text style={styles.summaryText}>Region: {region.name_en}</Text>
          <Text style={styles.summaryText}>City: {city.name_en}</Text>
          <Text style={styles.summaryText}>Currency: {country.currency}</Text>
          <Text style={styles.summaryText}>Language: {country.language}</Text>
        </GlassCard>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton title={level === 'city' ? 'Continue' : 'Next'} onPress={continueFlow} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 58,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    color: '#FFFFFF',
    fontSize: 35,
    lineHeight: 38,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  stepActive: {
    backgroundColor: '#6945FF',
    borderColor: '#8EA7FF',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  line: {
    width: 34,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  lineActive: {
    backgroundColor: '#A855F7',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
  world: {
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldGlow: {
    position: 'absolute',
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 1,
    borderColor: 'rgba(21,123,255,0.42)',
    backgroundColor: 'rgba(21,123,255,0.1)',
    shadowColor: '#A855F7',
    shadowOpacity: 0.8,
    shadowRadius: 28,
  },
  worldText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  search: {
    marginTop: 18,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 10,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  flag: {
    fontSize: 24,
  },
  summary: {
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 18,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  summaryText: {
    color: '#AAB0C0',
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 20,
  },
});
