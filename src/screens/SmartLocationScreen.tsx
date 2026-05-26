import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import FixoraMap from '@/components/FixoraMap';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { ScreenBackground } from '../components/ScreenBackground';
import { locationService } from '../services/locationService';
import { LocationSelection } from '../types/navigation';
import { getMockLocation } from '../utils/location';

type SmartLocationScreenProps = {
  onContinue: (location: LocationSelection) => void;
  onManual: () => void;
};

type DetectionStatus = 'idle' | 'detecting' | 'detected' | 'denied' | 'failed';

const stars = Array.from({ length: 54 }, (_, index) => ({
  left: `${(index * 37) % 100}%` as `${number}%`,
  top: `${(index * 19) % 88}%` as `${number}%`,
  size: 1 + (index % 3),
  opacity: 0.24 + (index % 5) * 0.12,
}));

export default function SmartLocationScreen({ onContinue, onManual }: SmartLocationScreenProps) {
  const { height, width } = useWindowDimensions();
  const compact = height < 740;
  const [location, setLocation] = useState<LocationSelection | null>(null);
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [errorText, setErrorText] = useState('');
  const mapRef = useRef<any>(null);
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1450, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.timing(scan, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ).start();
  }, [pulse, rotate, scan]);

  useEffect(() => {
    if (!location?.latitude || !location.longitude || !mapRef.current?.animateCamera) {
      return;
    }

    mapRef.current.animateCamera(
      {
        center: { latitude: location.latitude, longitude: location.longitude },
        zoom: 16,
        pitch: 45,
        heading: 0,
      },
      { duration: 900 },
    );
  }, [location]);

  const detectLocation = async () => {
    setStatus('detecting');
    setErrorText('');

    try {
      const currentLocation = await locationService.requestCurrentLocation();
      setLocation(currentLocation);
      setStatus('detected');
    } catch (error) {
      if (error instanceof Error && error.message === 'LOCATION_PERMISSION_DENIED') {
        setStatus('denied');
        setErrorText('Location permission was denied. You can choose your city manually.');
        return;
      }

      setStatus('failed');
      setErrorText(error instanceof Error ? error.message : 'Unable to detect current location.');
    }
  };

  const fallbackLocation = useMemo(() => getMockLocation(), []);
  const displayLocation = location ?? fallbackLocation;
  const hasCoordinates = typeof displayLocation.latitude === 'number' && typeof displayLocation.longitude === 'number';
  const detected = status === 'detected';
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.74, 1.5] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 0] });
  const scanRotate = scan.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const globeSize = Math.min(width - 54, compact ? 250 : 310);

  return (
    <ScreenBackground>
      <View style={styles.starLayer} pointerEvents="none">
        {stars.map((star, index) => <View key={index} style={[styles.star, star]} />)}
      </View>
      <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact]} showsVerticalScrollIndicator={false}>
        {detected && hasCoordinates ? (
          <FixoraMap ref={mapRef} location={displayLocation} pulseOpacity={pulseOpacity} pulseScale={pulseScale} />
        ) : (
          <View style={[styles.globeWrap, { height: globeSize + 36 }]}>
            <Animated.View style={[styles.scanRing, { width: globeSize + 36, height: globeSize + 36, borderRadius: (globeSize + 36) / 2, transform: [{ rotate: scanRotate }] }]} />
            <LinearGradient
              colors={['rgba(21,123,255,0.96)', 'rgba(18,52,120,0.98)', 'rgba(5,10,32,0.98)']}
              start={{ x: 0.12, y: 0.08 }}
              end={{ x: 0.9, y: 0.95 }}
              style={[styles.globe, { width: globeSize, height: globeSize, borderRadius: globeSize / 2 }]}
            >
              <Animated.View style={[styles.globeMap, { transform: [{ rotate: spin }] }]}>
                <View style={[styles.landMass, styles.landOne]} />
                <View style={[styles.landMass, styles.landTwo]} />
                <View style={[styles.landMass, styles.landThree]} />
                <View style={[styles.landMass, styles.landFour]} />
              </Animated.View>
              <View style={styles.globeHighlight} />
              <View style={styles.pinShadow} />
              <Animated.View style={[styles.locationPulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
              <Pin />
            </LinearGradient>
          </View>
        )}

        <View style={styles.statusPill}>
          <View style={[styles.statusDot, detected && styles.statusDotDone, status === 'failed' && styles.statusDotError]} />
          <Text style={styles.statusText}>{statusLabel(status)}</Text>
        </View>

        <Text style={styles.title}>{detected ? 'Your location detected' : 'Real GPS location'}</Text>
        <Text style={styles.subtitle}>
          {detected
            ? 'Fixora matched your local marketplace, language, currency, and exact coordinates.'
            : 'Use GPS to set your local marketplace with real address details.'}
        </Text>

        {hasCoordinates ? (
          <View style={styles.coordinatesPill}>
            <Text style={styles.coordinatesText}>
              {displayLocation.latitude?.toFixed(5)}, {displayLocation.longitude?.toFixed(5)}
            </Text>
          </View>
        ) : null}

        {detected ? (
          <GlassCard style={styles.detectedCard}>
            <Text style={styles.cardTitle}>Your location detected</Text>
            <LocationRow label="Country" value={displayLocation.country} />
            <LocationRow label="Region" value={displayLocation.region} />
            <LocationRow label="City" value={displayLocation.city} />
            <LocationRow label="District" value={displayLocation.district || 'Not available'} />
            <LocationRow label="Street" value={displayLocation.street || displayLocation.address || 'Not available'} />
            <LocationRow label="Postal Code" value={displayLocation.postalCode || 'Not available'} />
            <LocationRow label="Coordinates" value={hasCoordinates ? `${displayLocation.latitude?.toFixed(6)}, ${displayLocation.longitude?.toFixed(6)}` : 'Not available'} />
            <LocationRow label="Timezone" value={displayLocation.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone} />
            <LocationRow label="Currency" value={displayLocation.currency} />
            <LocationRow label="Language" value={displayLocation.language} />
          </GlassCard>
        ) : (
          <GlassCard style={styles.detectedCard}>
            <Text style={styles.cardTitle}>GPS setup</Text>
            <Text style={styles.infoText}>Fixora will ask for foreground location permission and reverse geocode your coordinates into an address.</Text>
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
          </GlassCard>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {detected ? (
          <>
            <GradientButton title="Continue" onPress={() => onContinue(displayLocation)} />
            <View style={styles.footerRow}>
              <Pressable accessibilityRole="button" onPress={detectLocation} style={styles.secondaryButton}>
                <Text style={styles.manualText}>Refresh location</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onManual} style={styles.secondaryButton}>
                <Text style={styles.manualText}>Change manually</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <GradientButton title={status === 'detecting' ? 'Detecting...' : 'Use My Current Location'} onPress={detectLocation} />
            <Pressable accessibilityRole="button" onPress={status === 'denied' ? onManual : status === 'failed' ? detectLocation : onManual} style={styles.manualButton}>
              <Text style={styles.manualText}>{status === 'failed' ? 'Retry location' : 'Change location manually'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScreenBackground>
  );
}

function statusLabel(status: DetectionStatus) {
  if (status === 'detecting') return 'Detecting GPS location...';
  if (status === 'detected') return 'Location found';
  if (status === 'denied') return 'Permission denied';
  if (status === 'failed') return 'GPS failed';
  return 'GPS ready';
}

function Pin() {
  return (
    <View style={styles.pin}>
      <LinearGradient colors={['#2B66FF', '#B931FF']} style={styles.pinHead}>
        <View style={styles.pinCore} />
      </LinearGradient>
      <View style={styles.pinTail} />
    </View>
  );
}

function LocationRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.locationRow}>
      <View style={styles.rowIcon}><Text style={styles.rowIconText}>{label.slice(0, 1)}</Text></View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  starLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#8EA7FF',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 230,
    alignItems: 'center',
  },
  contentCompact: {
    paddingTop: 8,
  },
  globeWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanRing: {
    position: 'absolute',
    borderWidth: 1,
    borderLeftColor: 'rgba(168,85,247,0.08)',
    borderTopColor: 'rgba(21,123,255,0.88)',
    borderRightColor: 'rgba(255,255,255,0.08)',
    borderBottomColor: 'rgba(168,85,247,0.62)',
  },
  globe: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.58)',
    shadowColor: '#157BFF',
    shadowOpacity: 0.7,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 18 },
  },
  globeMap: {
    ...StyleSheet.absoluteFillObject,
  },
  landMass: {
    position: 'absolute',
    backgroundColor: 'rgba(249,215,126,0.58)',
    borderColor: 'rgba(65,230,164,0.5)',
    borderWidth: 1,
  },
  landOne: {
    left: '12%',
    top: '25%',
    width: '38%',
    height: '20%',
    borderRadius: 40,
    transform: [{ rotate: '-18deg' }],
  },
  landTwo: {
    left: '48%',
    top: '34%',
    width: '34%',
    height: '18%',
    borderRadius: 36,
    transform: [{ rotate: '22deg' }],
  },
  landThree: {
    left: '35%',
    top: '55%',
    width: '20%',
    height: '28%',
    borderRadius: 36,
    transform: [{ rotate: '9deg' }],
  },
  landFour: {
    right: '8%',
    top: '62%',
    width: '22%',
    height: '12%',
    borderRadius: 28,
  },
  globeHighlight: {
    position: 'absolute',
    top: '10%',
    left: '18%',
    width: '28%',
    height: '20%',
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  pinShadow: {
    position: 'absolute',
    bottom: '32%',
    width: 98,
    height: 34,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(168,85,247,0.78)',
    backgroundColor: 'rgba(21,123,255,0.18)',
  },
  locationPulse: {
    position: 'absolute',
    bottom: '28%',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: '#A855F7',
  },
  pin: {
    alignItems: 'center',
    transform: [{ translateY: -10 }],
  },
  pinHead: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  pinCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  pinTail: {
    width: 22,
    height: 22,
    marginTop: -9,
    backgroundColor: '#713CFF',
    transform: [{ rotate: '45deg' }],
  },
  statusPill: {
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.28)',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8EA7FF',
  },
  statusDotDone: {
    backgroundColor: '#41E6A4',
  },
  statusDotError: {
    backgroundColor: '#FF5D7A',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 420,
    color: '#D7DDF0',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
    textAlign: 'center',
  },
  coordinatesPill: {
    marginTop: 12,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.28)',
  },
  coordinatesText: {
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  detectedCard: {
    width: '100%',
    maxWidth: 460,
    marginTop: 20,
    borderRadius: 24,
  },
  cardTitle: {
    marginBottom: 10,
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },
  infoText: {
    color: '#AAB0C0',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 12,
    color: '#FF8AA0',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '900',
  },
  locationRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.24)',
  },
  rowIconText: {
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '800',
  },
  rowValue: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 20,
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  manualText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
});
