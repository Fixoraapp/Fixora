import { StyleSheet, Text, View } from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { colors, typography } from '../constants/theme';
import { UserRole } from '../types/navigation';

type AuthScreenProps = {
  role: UserRole;
  onAuthenticated: () => void;
};

export default function AuthScreen({ role, onAuthenticated }: AuthScreenProps) {
  const roleLabel = role === 'client' ? 'Client' : 'Master';

  return (
    <ScreenBackground>
      <View style={styles.root}>
      <View style={styles.brand}>
        <FixoraLogo wordmark />
      </View>
      <Text style={styles.kicker}>{roleLabel}</Text>
      <Text style={styles.title}>Welcome to Fixora</Text>
      <Text style={styles.body}>Sign in or create your account</Text>

      <GlassCard style={styles.card}>
        <GradientButton title="Continue with Phone" onPress={onAuthenticated} />
        <PremiumButton title="Continue with Email" variant="secondary" onPress={onAuthenticated} style={styles.buttonGap} />
        <PremiumButton title="Continue as Guest" variant="ghost" onPress={onAuthenticated} style={styles.buttonGap} />
      </GlassCard>
      <Text style={styles.legal}>Final authentication will connect to phone, email, and secure identity providers.</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  brand: {
    marginBottom: 28,
    alignSelf: 'center',
  },
  kicker: {
    color: colors.blue,
    fontSize: typography.small,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 8,
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
  card: {
    marginTop: 28,
    gap: 0,
  },
  buttonGap: {
    marginTop: 12,
  },
  legal: {
    marginTop: 20,
    color: colors.dim,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '700',
  },
});
