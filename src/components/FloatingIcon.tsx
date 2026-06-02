import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

type FloatingIconProps = {
  label: string;
  icon?: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function FloatingIcon({ label, icon, delay = 0, style }: FloatingIconProps) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(float, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay, float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <Animated.View style={[styles.shell, style, { transform: [{ translateY }] }]}>
      <BlurView intensity={Platform.OS === 'android' ? 28 : 62} tint="dark" style={styles.blur}>
        <LinearGradient colors={['rgba(21,123,255,0.82)', 'rgba(168,85,247,0.82)']} style={styles.gradient}>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 74,
    height: 74,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.17)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  blur: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
