import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const COLORS = {
  navy: '#050815',
  navy2: '#080D20',
  surface: '#101423',
  blue: '#08A8FF',
  blueDeep: '#0A39FF',
  purple: '#8B35FF',
  purpleDeep: '#4011A8',
  white: '#F8FBFF',
  muted: '#AEB8D0',
};

const PARTICLES = [
  { x: -118, y: -16, size: 6, delay: 0, color: COLORS.blue },
  { x: -88, y: 20, size: 4, delay: 24, color: COLORS.purple },
  { x: -54, y: -34, size: 5, delay: 48, color: COLORS.blue },
  { x: -24, y: 28, size: 4, delay: 72, color: '#737B94' },
  { x: 24, y: -38, size: 5, delay: 96, color: COLORS.purple },
  { x: 58, y: 18, size: 4, delay: 120, color: COLORS.blue },
  { x: 90, y: -18, size: 6, delay: 144, color: '#6F7890' },
  { x: 120, y: 22, size: 4, delay: 168, color: COLORS.purple },
];

const CRACKS = [
  { width: 92, left: '50%', bottom: 82, rotate: '-18deg', tx: -6 },
  { width: 74, left: '50%', bottom: 82, rotate: '24deg', tx: -62 },
  { width: 58, left: '50%', bottom: 76, rotate: '62deg', tx: 28 },
  { width: 46, left: '50%', bottom: 76, rotate: '-52deg', tx: -36 },
  { width: 36, left: '50%', bottom: 72, rotate: '8deg', tx: -112 },
  { width: 34, left: '50%', bottom: 72, rotate: '-7deg', tx: 78 },
] as const;

type SplashScreenProps = {
  onGetStarted: () => void;
};

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const compact = height < 720 || width < 380;
  const logoSize = Math.min(width * 0.54, compact ? 184 : 226);

  const fall = useRef(new Animated.Value(-height * 0.56)).current;
  const logoScale = useRef(new Animated.Value(1.05)).current;
  const logoTopShift = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-5)).current;
  const impact = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;
  const button = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const surfacePulse = useRef(new Animated.Value(0)).current;
  const particles = useMemo(() => PARTICLES.map(() => new Animated.Value(0)), []);

  useEffect(() => {
    fall.setValue(-height * 0.56);

    Animated.sequence([
      Animated.delay(220),
      Animated.parallel([
        Animated.timing(fall, {
          toValue: 0,
          duration: 820,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 760,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(shake, {
            toValue: 1,
            duration: 70,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(impact, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(impact, {
            toValue: 0.78,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.36,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(surfacePulse, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(surfacePulse, {
            toValue: 0,
            duration: 560,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        ...particles.map((particle, index) =>
          Animated.sequence([
            Animated.delay(PARTICLES[index].delay),
            Animated.timing(particle, {
              toValue: 1,
              duration: 620,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]),
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: compact ? 0.43 : 0.48,
          duration: 720,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoTopShift, {
          toValue: compact ? -height * 0.22 : -height * 0.25,
          duration: 720,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(content, {
          toValue: 1,
          duration: 760,
          delay: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(button, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    button,
    compact,
    content,
    fall,
    glow,
    height,
    impact,
    logoRotate,
    logoScale,
    logoTopShift,
    particles,
    shake,
    surfacePulse,
  ]);

  const stageShake = shake.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [0, -8, 7, -5, 3, 0],
  });

  const rotate = logoRotate.interpolate({
    inputRange: [-5, 0],
    outputRange: ['-5deg', '0deg'],
  });

  const contentTranslate = content.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });

  const buttonTranslate = button.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const impactScale = impact.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1.18],
  });

  const surfaceScaleX = surfacePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1.08],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent />
      <Animated.View style={[styles.stage, { transform: [{ translateX: stageShake }] }]}>
        <View style={styles.backgroundHalo} />
        <View style={styles.topAura} />

        <Animated.View
          style={[
            styles.logoWrap,
            {
              width: logoSize,
              height: logoSize,
              transform: [
                { translateY: fall },
                { translateY: logoTopShift },
                { scale: logoScale },
                { rotate },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity: glow,
                transform: [{ scale: impactScale }],
              },
            ]}
          />
          <FixoraMark size={logoSize} />
        </Animated.View>

        <View style={[styles.surface, { bottom: compact ? 126 : 150 }]}>
          <Animated.View
            style={[
              styles.surfaceGlow,
              {
                opacity: surfacePulse,
                transform: [{ scaleX: surfaceScaleX }],
              },
            ]}
          />
          <View style={styles.asphaltLine} />
          {CRACKS.map((crack, index) => (
            <Animated.View
              key={`crack-${index}`}
              style={[
                styles.crack,
                {
                  width: crack.width,
                  left: crack.left,
                  bottom: crack.bottom,
                  opacity: impact,
                  transform: [{ translateX: crack.tx }, { rotate: crack.rotate }],
                },
              ]}
            />
          ))}
          {PARTICLES.map((particle, index) => {
            const progress = particles[index];
            const translateX = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, particle.x],
            });
            const translateY = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, particle.y],
            });
            const opacity = progress.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0, 1, 0],
            });
            const scale = progress.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0.4, 1, 0.2],
            });

            return (
              <Animated.View
                key={`particle-${index}`}
                style={[
                  styles.particle,
                  {
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    backgroundColor: particle.color,
                    opacity,
                    transform: [{ translateX }, { translateY }, { scale }],
                  },
                ]}
              />
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.wordmark,
            {
              opacity: content,
              transform: [{ translateY: contentTranslate }],
              top: compact ? height * 0.43 : height * 0.45,
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: compact ? 58 : 72 }]}>Fixora</Text>
          <Text style={[styles.tagline, { fontSize: compact ? 18 : 21 }]}>
            Find trusted professionals instantly.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonWrap,
            {
              opacity: button,
              transform: [{ translateY: buttonTranslate }],
              bottom: Platform.select({ ios: compact ? 46 : 58, android: 42, default: 46 }),
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            onPress={onGetStarted}
            android_ripple={{ color: 'rgba(255,255,255,0.16)', borderless: false }}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function FixoraMark({ size }: { size: number }) {
  const stemWidth = size * 0.32;
  const barHeight = size * 0.25;

  return (
    <View style={[styles.mark, { width: size, height: size }]}>
      <View
        style={[
          styles.markStem,
          {
            width: stemWidth,
            height: size * 0.78,
            left: size * 0.08,
            top: size * 0.12,
          },
        ]}
      />
      <View
        style={[
          styles.markTopBlade,
          {
            width: size * 0.84,
            height: barHeight,
            left: size * 0.08,
            top: size * 0.08,
            borderTopRightRadius: size * 0.21,
            borderBottomRightRadius: size * 0.21,
            borderTopLeftRadius: size * 0.08,
            borderBottomLeftRadius: size * 0.3,
          },
        ]}
      />
      <View
        style={[
          styles.markMidBlade,
          {
            width: size * 0.7,
            height: barHeight * 0.82,
            left: size * 0.14,
            top: size * 0.4,
            borderTopRightRadius: size * 0.16,
            borderBottomRightRadius: size * 0.16,
            borderTopLeftRadius: size * 0.28,
            borderBottomLeftRadius: size * 0.08,
          },
        ]}
      />
      <View
        style={[
          styles.markLowerBlade,
          {
            width: size * 0.34,
            height: size * 0.46,
            left: size * 0.12,
            top: size * 0.48,
            borderTopRightRadius: size * 0.18,
            borderBottomLeftRadius: size * 0.2,
            borderBottomRightRadius: size * 0.3,
          },
        ]}
      />
      <Text style={[styles.markLetter, { fontSize: size * 0.78, lineHeight: size * 0.82 }]}>F</Text>
      <View style={styles.markShine} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  stage: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
  },
  backgroundHalo: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: COLORS.blueDeep,
    opacity: 0.14,
    transform: [{ translateY: -96 }, { scaleX: 0.72 }],
  },
  topAura: {
    position: 'absolute',
    top: -180,
    width: 460,
    height: 360,
    borderRadius: 230,
    backgroundColor: COLORS.purpleDeep,
    opacity: 0.18,
  },
  logoWrap: {
    position: 'absolute',
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: '86%',
    height: '86%',
    borderRadius: 999,
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.92,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
    elevation: 22,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markStem: {
    position: 'absolute',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 58,
    backgroundColor: COLORS.purpleDeep,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.56,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  markTopBlade: {
    position: 'absolute',
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.72,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  markMidBlade: {
    position: 'absolute',
    backgroundColor: COLORS.purple,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.68,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 11,
  },
  markLowerBlade: {
    position: 'absolute',
    backgroundColor: COLORS.purpleDeep,
    transform: [{ rotate: '-15deg' }],
  },
  markLetter: {
    color: 'rgba(255,255,255,0.09)',
    fontWeight: '900',
    letterSpacing: 0,
  },
  markShine: {
    position: 'absolute',
    top: '12%',
    left: '18%',
    width: '66%',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  surface: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 180,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  surfaceGlow: {
    width: 290,
    height: 46,
    borderRadius: 145,
    backgroundColor: COLORS.blue,
    opacity: 0.28,
    transform: [{ scaleX: 1 }],
  },
  asphaltLine: {
    width: '82%',
    height: 1,
    backgroundColor: COLORS.surface,
    opacity: 0.96,
  },
  crack: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(208,224,255,0.72)',
  },
  particle: {
    position: 'absolute',
    top: 40,
    left: '50%',
  },
  wordmark: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 3,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
    textShadowColor: 'rgba(8,168,255,0.38)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    marginTop: 8,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
    textShadowColor: 'rgba(139,53,255,0.72)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  buttonWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 5,
    alignItems: 'center',
  },
  button: {
    minWidth: 212,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: COLORS.blue,
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  buttonText: {
    color: COLORS.navy2,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
