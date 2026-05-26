import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { FixoraLogo } from '../components/FixoraLogo';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { TextField } from '../components/TextField';
import { colors, typography } from '../constants/theme';
import { UserRole } from '../types/navigation';

type AuthMode = 'login' | 'register';
type LoginMethod = 'phone' | 'email';

type AuthScreenProps = {
  role: UserRole;
  onAuthenticated: () => void;
};

export default function AuthScreen({ role, onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<LoginMethod>('phone');

  return (
    <AppShell>
      <View style={styles.brand}>
        <FixoraLogo wordmark />
      </View>
      <Text style={styles.kicker}>{role}</Text>
      <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create your Fixora account'}</Text>
      <Text style={styles.body}>Use phone, email, or social sign in. Auth is UI-ready and backend-ready.</Text>

      <View style={styles.segment}>
        <PremiumButton title="Login" variant={mode === 'login' ? 'primary' : 'secondary'} onPress={() => setMode('login')} style={styles.segmentButton} />
        <PremiumButton title="Register" variant={mode === 'register' ? 'primary' : 'secondary'} onPress={() => setMode('register')} style={styles.segmentButton} />
      </View>

      <GlassCard>
        <View style={styles.methodRow}>
          <PremiumButton title="Phone" variant={method === 'phone' ? 'primary' : 'ghost'} onPress={() => setMethod('phone')} style={styles.methodButton} />
          <PremiumButton title="Email" variant={method === 'email' ? 'primary' : 'ghost'} onPress={() => setMethod('email')} style={styles.methodButton} />
        </View>
        {method === 'phone' ? (
          <TextField keyboardType="phone-pad" placeholder="+1 555 000 0000" />
        ) : (
          <TextField keyboardType="email-address" autoCapitalize="none" placeholder="you@fixora.com" />
        )}
        {mode === 'register' ? <TextField placeholder="Full name" style={styles.inputGap} /> : null}
        <TextField secureTextEntry placeholder="Password" style={styles.inputGap} />
        <PremiumButton title={mode === 'login' ? 'Login' : 'Create Account'} onPress={onAuthenticated} style={styles.submit} />
      </GlassCard>

      <Text style={styles.divider}>or continue with</Text>
      <View style={styles.socialRow}>
        <PremiumButton title="Apple" variant="secondary" onPress={onAuthenticated} style={styles.socialButton} />
        <PremiumButton title="Google" variant="secondary" onPress={onAuthenticated} style={styles.socialButton} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  brand: {
    marginBottom: 28,
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
  segment: {
    marginVertical: 22,
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  methodButton: {
    flex: 1,
    minHeight: 48,
  },
  inputGap: {
    marginTop: 12,
  },
  submit: {
    marginTop: 16,
  },
  divider: {
    marginVertical: 18,
    textAlign: 'center',
    color: colors.dim,
    fontWeight: '700',
    letterSpacing: 0,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
  },
});
