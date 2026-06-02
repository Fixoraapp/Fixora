import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

type ScreenBackgroundProps = {
  children: ReactNode;
};

export function ScreenBackground({ children }: ScreenBackgroundProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top', 'right', 'bottom', 'left']}>
      <LinearGradient
        colors={theme.gradients.appBackground}
        locations={[0, 0.42, 0.76, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blueGlow, { backgroundColor: theme.colors.accent, opacity: theme.isDark ? 0.15 : 0.1 }]} />
      <View style={[styles.purpleGlow, { opacity: theme.isDark ? 0.14 : 0.08 }]} />
      <View style={[styles.grid, { borderColor: theme.isDark ? 'rgba(21,123,255,0.16)' : 'rgba(21,123,255,0.1)' }]} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050816',
  },
  blueGlow: {
    position: 'absolute',
    top: -110,
    right: -130,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#157BFF',
    opacity: 0.15,
  },
  purpleGlow: {
    position: 'absolute',
    bottom: 90,
    left: -150,
    width: 390,
    height: 390,
    borderRadius: 195,
    backgroundColor: '#7C3AED',
    opacity: 0.14,
  },
  grid: {
    position: 'absolute',
    left: -60,
    right: -60,
    bottom: 30,
    height: 210,
    borderTopWidth: 1,
    borderColor: 'rgba(21,123,255,0.16)',
    transform: [{ rotate: '-7deg' }, { scaleX: 1.2 }],
  },
});
