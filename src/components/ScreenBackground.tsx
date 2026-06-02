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
      <LinearGradient
        colors={theme.gradients.aurora}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.aurora, { opacity: theme.isDark ? 0.42 : 0.18 }]}
      />
      <View style={[styles.blueGlow, { backgroundColor: theme.colors.accent, opacity: theme.isDark ? 0.18 : 0.1 }]} />
      <View style={[styles.goldGlow, { opacity: theme.isDark ? 0.1 : 0.06 }]} />
      <View style={[styles.purpleGlow, { opacity: theme.isDark ? 0.16 : 0.11 }]} />
      <View style={[styles.grid, { borderColor: theme.isDark ? 'rgba(220,232,255,0.13)' : 'rgba(35,184,255,0.1)' }]} />
      <View style={[styles.vignette, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.22)' }]} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  aurora: {
    position: 'absolute',
    top: -170,
    left: -120,
    right: -130,
    height: 360,
    borderRadius: 220,
    transform: [{ rotate: '-10deg' }],
  },
  blueGlow: {
    position: 'absolute',
    top: -120,
    right: -150,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#2D7CFF',
    opacity: 0.18,
  },
  goldGlow: {
    position: 'absolute',
    top: 140,
    left: -180,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#D65BFF',
    opacity: 0.1,
  },
  purpleGlow: {
    position: 'absolute',
    bottom: 70,
    right: -180,
    width: 430,
    height: 430,
    borderRadius: 215,
    backgroundColor: '#6D5DFB',
    opacity: 0.16,
  },
  grid: {
    position: 'absolute',
    left: -60,
    right: -60,
    bottom: 30,
    height: 210,
    borderTopWidth: 1,
    borderColor: 'rgba(220,232,255,0.13)',
    transform: [{ rotate: '-7deg' }, { scaleX: 1.2 }],
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});
