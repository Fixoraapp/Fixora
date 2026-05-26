import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  ink: '#020513',
  navy: '#060918',
  blue: '#0B7CFF',
  cyan: '#12C8FF',
  violet: '#9A32FF',
  violetDeep: '#35108A',
  white: '#F8FBFF',
  muted: '#AEB9D4',
  dim: '#65718D',
};

const slides = [
  {
    title: 'Find trusted professionals instantly',
    body: 'Thousands of verified masters, companies, and premium specialists are ready nearby.',
    accent: 'Verified network',
  },
  {
    title: 'Book the right service with confidence',
    body: 'Compare categories, availability, and local options in a calm premium workflow.',
    accent: 'Smart matching',
  },
  {
    title: 'Your city, your trusted Fixora team',
    body: 'Set location once, choose your role, and continue into the real marketplace.',
    accent: 'Ready to start',
  },
];

const iconRows = [
  { label: 'TOOLS', x: -112, y: 12, scale: 1.07, colors: ['#2A6CFF', '#9A32FF'] },
  { label: 'HOME', x: -48, y: -28, scale: 0.82, colors: ['#183EFF', '#12C8FF'] },
  { label: 'AUTO', x: 88, y: 2, scale: 1.02, colors: ['#9A32FF', '#EA48FF'] },
  { label: 'CLEAN', x: 18, y: 56, scale: 0.9, colors: ['#2C4CFF', '#8E36FF'] },
  { label: 'BUILD', x: 122, y: -48, scale: 0.66, colors: ['#10276D', '#5532FF'] },
  { label: 'CARE', x: -132, y: 72, scale: 0.68, colors: ['#10276D', '#8E36FF'] },
] as const;

type OnboardingScreenProps = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 720 || width < 380;
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;
  const slide = slides[index];

  const float = useRef(new Animated.Value(0)).current;
  const page = useRef(new Animated.Value(1)).current;
  const icons = useMemo(() => iconRows.map(() => new Animated.Value(0)), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.stagger(
      70,
      icons.map((item) =>
        Animated.timing(item, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [float, icons]);

  useEffect(() => {
    page.setValue(0);
    Animated.timing(page, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index, page]);

  const visualLift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const ringScale = float.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] });
  const copyY = page.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const copyOpacity = page.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const continueFlow = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <LinearGradient
        colors={['#020513', '#080A1D', '#09071E', '#020513']}
        locations={[0, 0.42, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.blueGlow} />
      <View style={styles.purpleGlow} />

      <View style={[styles.header, { paddingTop: compact ? 8 : 12 }]}>
        <View style={styles.miniLogo}>
          <FixoraMini />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={onComplete} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.visual,
            {
              height: compact ? 270 : 330,
              transform: [{ translateY: visualLift }],
            },
          ]}
        >
          <Animated.View style={[styles.energyDisc, { transform: [{ scale: ringScale }] }]}>
            <LinearGradient
              colors={['rgba(18,200,255,0.05)', 'rgba(11,124,255,0.2)', 'rgba(154,50,255,0.3)', 'rgba(18,200,255,0.04)']}
              style={styles.discGradient}
            />
          </Animated.View>
          <View style={styles.orbitLine} />
          {iconRows.map((item, iconIndex) => {
            const appear = icons[iconIndex];
            const translateY = Animated.add(
              appear.interpolate({ inputRange: [0, 1], outputRange: [34, 0] }),
              float.interpolate({
                inputRange: [0, 1],
                outputRange: [iconIndex % 2 === 0 ? 0 : -4, iconIndex % 2 === 0 ? -10 : 8],
              }),
            );

            return (
              <Animated.View
                key={item.label}
                style={[
                  styles.serviceIcon,
                  {
                    opacity: appear,
                    transform: [
                      { translateX: item.x * (compact ? 0.82 : 1) },
                      { translateY: item.y + (compact ? 10 : 0) },
                      { translateY },
                      { scale: item.scale },
                    ],
                  },
                ]}
              >
                <BlurView intensity={Platform.OS === 'android' ? 28 : 64} tint="dark" style={styles.iconBlur}>
                  <LinearGradient
                    colors={item.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <Text style={styles.iconText}>{item.label}</Text>
                  </LinearGradient>
                </BlurView>
              </Animated.View>
            );
          })}
          <View style={styles.centerCard}>
            <BlurView intensity={Platform.OS === 'android' ? 30 : 76} tint="dark" style={styles.centerBlur}>
              <FixoraMini large />
            </BlurView>
          </View>
        </Animated.View>

        <Animated.View style={[styles.copy, { opacity: copyOpacity, transform: [{ translateY: copyY }] }]}>
          <Text style={styles.accent}>{slide.accent}</Text>
          <Text style={[styles.title, { fontSize: compact ? 28 : 33, lineHeight: compact ? 34 : 39 }]}>
            {slide.title}
          </Text>
          <Text style={[styles.body, { fontSize: compact ? 14 : 15 }]}>{slide.body}</Text>
        </Animated.View>

        <View style={styles.dots}>
          {slides.map((item, dotIndex) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={`Go to onboarding slide ${dotIndex + 1}`}
              onPress={() => setIndex(dotIndex)}
              style={[styles.dot, dotIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 18) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Choose Location' : 'Continue'}
          onPress={continueFlow}
          android_ripple={{ color: 'rgba(255,255,255,0.16)' }}
          style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
        >
          <LinearGradient
            colors={['#145CFF', '#6840FF', '#B832FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>{isLast ? 'Choose Location' : 'Continue'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function FixoraMini({ large = false }: { large?: boolean }) {
  const size = large ? 74 : 30;

  return (
    <View style={[styles.miniMark, { width: size, height: size }]}>
      <LinearGradient
        colors={['#07C8FF', '#2872FF', '#9A32FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.miniTop,
          {
            width: size * 0.72,
            height: size * 0.22,
            left: size * 0.15,
            top: size * 0.16,
            borderRadius: size * 0.12,
          },
        ]}
      />
      <LinearGradient
        colors={['#11ACFF', '#7A3BFF', '#B832FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.miniMid,
          {
            width: size * 0.56,
            height: size * 0.2,
            left: size * 0.16,
            top: size * 0.42,
            borderRadius: size * 0.11,
          },
        ]}
      />
      <LinearGradient
        colors={['#8D35FF', '#C033FF']}
        style={[
          styles.miniLower,
          {
            width: size * 0.28,
            height: size * 0.34,
            left: size * 0.18,
            top: size * 0.52,
            borderRadius: size * 0.12,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.ink,
  },
  blueGlow: {
    position: 'absolute',
    top: -110,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: COLORS.blue,
    opacity: 0.16,
  },
  purpleGlow: {
    position: 'absolute',
    bottom: 118,
    left: -160,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.violet,
    opacity: 0.13,
  },
  header: {
    height: 66,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  skip: {
    color: 'rgba(248,251,255,0.78)',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visual: {
    width: '100%',
    maxWidth: 430,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyDisc: {
    position: 'absolute',
    width: 300,
    height: 112,
    borderRadius: 150,
    bottom: 54,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(90,130,255,0.34)',
  },
  discGradient: {
    flex: 1,
  },
  orbitLine: {
    position: 'absolute',
    bottom: 88,
    width: 260,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(18,200,255,0.35)',
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.72,
    shadowRadius: 14,
  },
  serviceIcon: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.46,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  iconBlur: {
    flex: 1,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  centerCard: {
    width: 112,
    height: 112,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: COLORS.blue,
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 20,
  },
  centerBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,10,28,0.72)',
  },
  copy: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    marginTop: 4,
  },
  accent: {
    color: COLORS.violet,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(154,50,255,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  title: {
    marginTop: 8,
    color: COLORS.white,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
    textShadowColor: 'rgba(8,168,255,0.28)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  body: {
    marginTop: 14,
    maxWidth: 310,
    color: COLORS.muted,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  dots: {
    height: 34,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.white,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  continueButton: {
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.42,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  continueGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
  },
  miniMark: {
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  miniTop: {
    position: 'absolute',
  },
  miniMid: {
    position: 'absolute',
  },
  miniLower: {
    position: 'absolute',
    transform: [{ rotate: '-14deg' }],
  },
});
