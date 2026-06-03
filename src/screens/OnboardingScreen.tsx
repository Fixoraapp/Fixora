import { StyleSheet, Text, View } from 'react-native';
import { GradientButton } from '../components/GradientButton';
import { ScreenBackground } from '../components/ScreenBackground';

type OnboardingScreenProps = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  return (
    <ScreenBackground>
      <View style={styles.content}>
        <Text style={styles.title}>Onboarding will be rebuilt</Text>
        <GradientButton title="Continue" onPress={onComplete} style={styles.button} />
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
