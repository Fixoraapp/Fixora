import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { SectionHeader } from '../components/SectionHeader';
import { colors, typography } from '../constants/theme';
import { locationTree } from '../data/locations';
import { getCities, getMockLocation, getRegions } from '../utils/location';
import { LocationSelection } from '../types/navigation';

type LocationSelectionScreenProps = {
  onComplete: (location: LocationSelection) => void;
};

export default function LocationSelectionScreen({ onComplete }: LocationSelectionScreenProps) {
  const detected = getMockLocation();
  const [country, setCountry] = useState(detected.country);
  const [region, setRegion] = useState(detected.region);
  const [city, setCity] = useState(detected.city);
  const regions = useMemo(() => getRegions(country), [country]);
  const cities = useMemo(() => getCities(country, region), [country, region]);

  function selectCountry(nextCountry: string) {
    const firstRegion = getRegions(nextCountry)[0];
    setCountry(nextCountry);
    setRegion(firstRegion?.name ?? '');
    setCity(firstRegion?.cities[0] ?? '');
  }

  function selectRegion(nextRegion: string) {
    const firstCity = getCities(country, nextRegion)[0];
    setRegion(nextRegion);
    setCity(firstCity ?? '');
  }

  return (
    <AppShell>
      <Text style={styles.kicker}>Location intelligence</Text>
      <Text style={styles.title}>Choose your local marketplace</Text>
      <Text style={styles.body}>
        Mock geo selected {detected.city}. You can override it before Fixora opens the marketplace.
      </Text>

      <SectionHeader title="Country" />
      <View style={styles.grid}>
        {locationTree.map((item) => (
          <GlassCard
            key={item.country}
            selected={country === item.country}
            onPress={() => selectCountry(item.country)}
          >
            <Text style={styles.optionTitle}>{item.country}</Text>
          </GlassCard>
        ))}
      </View>

      <SectionHeader title="Region" />
      <View style={styles.grid}>
        {regions.map((item) => (
          <GlassCard
            key={item.name}
            selected={region === item.name}
            onPress={() => selectRegion(item.name)}
          >
            <Text style={styles.optionTitle}>{item.name}</Text>
          </GlassCard>
        ))}
      </View>

      <SectionHeader title="City" />
      <View style={styles.grid}>
        {cities.map((item) => (
          <GlassCard key={item} selected={city === item} onPress={() => setCity(item)}>
            <Text style={styles.optionTitle}>{item}</Text>
          </GlassCard>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>{country} / {region} / {city}</Text>
      </View>
      <PremiumButton title="Show Local Marketplace" onPress={() => onComplete({ country, region, city })} />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.blue,
    fontSize: typography.small,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 10,
    color: colors.white,
    fontSize: typography.title,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: 0,
  },
  body: {
    marginTop: 10,
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    letterSpacing: 0,
  },
  grid: {
    gap: 10,
  },
  optionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  summary: {
    marginTop: 24,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(8,168,255,0.12)',
    borderWidth: 1,
    borderColor: colors.strokeStrong,
  },
  summaryText: {
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
