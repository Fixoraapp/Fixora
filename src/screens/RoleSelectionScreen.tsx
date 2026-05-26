import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FloatingIcon } from '../components/FloatingIcon';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { ScreenBackground } from '../components/ScreenBackground';
import { UserRole } from '../types/navigation';

const roles: Array<{
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'client',
    title: 'Client',
    subtitle: 'Book trusted professionals.',
    description: 'Find verified experts, compare prices, chat, book, and pay securely.',
    icon: 'USER',
  },
  {
    id: 'master',
    title: 'Master',
    subtitle: 'Offer your services and receive orders.',
    description: 'Create your profile, receive local orders, chat with clients, and grow your income.',
    icon: 'TOOLS',
  },
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
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <FloatingIcon label="BOOK" style={[styles.floating, { left: 4, top: 18 }]} />
          <FloatingIcon label="WORK" delay={180} style={[styles.floating, { right: 8, top: 6 }]} />
          <Text style={styles.title}>Choose your role</Text>
          <Text style={styles.subtitle}>Select how you want to use Fixora</Text>
        </View>

        <View style={styles.cards}>
          {roles.map((role) => {
            const selected = selectedRole === role.id;

            return (
              <GlassCard
                key={role.id}
                selected={selected}
                onPress={() => onSelectRole(role.id)}
                style={[styles.roleCard, selected && styles.selectedRoleCard]}
              >
                <View style={styles.roleTop}>
                  <LinearGradient colors={['#157BFF', '#7C3AED']} style={styles.icon}>
                    <Text style={styles.iconText}>{role.icon}</Text>
                  </LinearGradient>
                  <View style={[styles.radio, selected && styles.radioActive]}>
                    <Text style={styles.radioText}>{selected ? '✓' : ''}</Text>
                  </View>
                </View>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton title="Continue" onPress={onContinue} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 110,
  },
  hero: {
    minHeight: 156,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: {
    position: 'absolute',
    transform: [{ scale: 0.78 }],
  },
  title: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 8,
    color: '#AAB0C0',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  cards: {
    gap: 14,
  },
  roleCard: {
    minHeight: 230,
    borderRadius: 24,
    padding: 20,
  },
  selectedRoleCard: {
    shadowColor: '#157BFF',
    shadowOpacity: 0.58,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
  roleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  radio: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  radioActive: {
    backgroundColor: '#157BFF',
    borderColor: '#94B7FF',
  },
  radioText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  roleTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  roleSubtitle: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  roleDescription: {
    marginTop: 12,
    color: '#AAB0C0',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 20,
  },
});
