import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LocationFlowV2 } from '../components/LocationFlowV2';
import { useTranslation } from '../i18n/I18nProvider';
import { locationService } from '../services/locationService';
import { useTheme } from '../theme/useTheme';
import { LocationSelection } from '../types/navigation';

type SmartLocationScreenProps = {
  onContinue: (location: LocationSelection) => void;
  onManual: () => void;
};

type DetectionStatus = 'idle' | 'detecting' | 'detected' | 'denied' | 'failed';

export default function SmartLocationScreen({ onContinue, onManual }: SmartLocationScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [location, setLocation] = useState<LocationSelection | null>(null);
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [errorText, setErrorText] = useState('');

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

  const detected = status === 'detected' && Boolean(location);
  const primaryTitle = detected
    ? t('buttons.continue', 'Continue')
    : status === 'detecting'
      ? 'Detecting...'
      : 'Detect location';

  return (
    <LocationFlowV2
      title="LocationFlowV2"
      status={statusLabel(status, t)}
      primaryAction={{
        title: primaryTitle,
        disabled: status === 'detecting',
        onPress: detected && location ? () => onContinue(location) : detectLocation,
      }}
      secondaryAction={{
        title: detected ? 'Change manually' : status === 'failed' ? 'Retry location' : 'Choose manually',
        onPress: status === 'failed' ? detectLocation : onManual,
      }}
    >
      <View style={styles.logicState}>
        <Text style={[styles.logicTitle, { color: theme.colors.text }]}>Location logic is active.</Text>
        <Text style={[styles.logicText, { color: theme.colors.muted }]}>
          GPS permission, coordinate retrieval, reverse geocoding, and location save callbacks remain connected.
        </Text>
        {location ? (
          <Text style={[styles.logicText, { color: theme.colors.muted }]}>
            Detected: {location.city}, {location.region}, {location.country}
          </Text>
        ) : null}
        {errorText ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorText}</Text> : null}
      </View>
    </LocationFlowV2>
  );
}

function statusLabel(status: DetectionStatus, t: (key: string, fallback?: string) => string) {
  if (status === 'detecting') return 'Detecting location';
  if (status === 'detected') return 'Location detected';
  if (status === 'denied') return 'Permission denied';
  if (status === 'failed') return 'Location detection failed';
  return t('location.status.ready', 'Ready for location detection');
}

const styles = StyleSheet.create({
  logicState: {
    marginTop: 18,
    gap: 8,
  },
  logicTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  logicText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
});
