import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { colors, typography } from '../constants/theme';
import { UserRole } from '../types/navigation';

const roles: Array<{ title: UserRole; body: string }> = [
  { title: 'Client', body: 'Book trusted services, compare experts, and manage requests.' },
  { title: 'Master', body: 'Receive jobs, build ratings, and grow your service business.' },
  { title: 'Premium Master', body: 'Offer elite services with higher trust and visibility.' },
  { title: 'Company', body: 'Manage teams, multiple categories, and enterprise requests.' },
];

type RoleSelectionScreenProps = {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
};

export default function RoleSelectionScreen({
  selectedRole,
  onSelectRole,
  onContinue,
}: RoleSelectionScreenProps) {
  return (
    <AppShell>
      <Text style={styles.kicker}>Account type</Text>
      <Text style={styles.title}>How will you use Fixora?</Text>
      <Text style={styles.body}>
        The foundation keeps every role ready for future marketplace permissions and pricing.
      </Text>
      <View style={styles.list}>
        {roles.map((role) => (
          <GlassCard
            key={role.title}
            selected={selectedRole === role.title}
            onPress={() => onSelectRole(role.title)}
          >
            <Text style={styles.role}>{role.title}</Text>
            <Text style={styles.roleBody}>{role.body}</Text>
          </GlassCard>
        ))}
      </View>
      <PremiumButton title="Continue to Login" onPress={onContinue} />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.purple,
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
  list: {
    marginTop: 24,
    marginBottom: 22,
    gap: 12,
  },
  role: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  roleBody: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
});
