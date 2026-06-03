import { StyleSheet, Text, View } from 'react-native';
import { GradientButton } from '../components/GradientButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { UserRole } from '../types/navigation';

type RoleSelectionScreenProps = {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
  onOpenAdmin: () => void;
  onResetAppState?: () => void;
};

export default function RoleSelectionScreen({
  selectedRole,
  onSelectRole,
  onContinue,
}: RoleSelectionScreenProps) {
  const continueToHome = () => {
    onSelectRole(selectedRole);
    onContinue();
  };

  return (
    <ScreenBackground>
      <View style={styles.content}>
        <Text style={styles.title}>Role Selection will be rebuilt</Text>
        <GradientButton title="Continue" onPress={continueToHome} style={styles.button} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    width: '100%',
    maxWidth: 320,
  },
});
