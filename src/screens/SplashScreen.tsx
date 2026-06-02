import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../i18n/I18nProvider';

const COLORS = {
  ink: '#F7F8FC',
  navy: '#FFFFFF',
  blue: '#2D7CFF',
  blueDeep: '#DCEBFF',
  violet: '#6D5DFB',
  violetDeep: '#F2E8FF',
  white: '#111827',
  mist: '#6B7280',
};

const STAR_FIELD = Array.from({ length: 34 }, (_, index) => ({
  left: `${(index * 29) % 100}%` as `${number}%`,
  top: `${(index * 47) % 72}%` as `${number}%`,
  size: 1 + (index % 3),
  opacity: 0.2 + (index % 5) * 0.1,
}));

const DEBRIS = Array.from({ length: 18 }, (_, index) => ({
  angle: (index / 18) * Math.PI * 2,
  distance: 42 + (index % 6) * 16,
  size: 3 + (index % 4),
  delay: index * 24,
  color: index % 3 === 0 ? COLORS.blue : index % 3 === 1 ? COLORS.violet : '#D8E6FF',
}));

const CRACKS = [
  { width: 122, tx: -8, ty: 0, rotate: '-12deg' },
  { width: 94, tx: -82, ty: 16, rotate: '22deg' },
  { width: 82, tx: 42, ty: 18, rotate: '-30deg' },
  { width: 64, tx: -118, ty: 38, rotate: '-4deg' },
  { width: 58, tx: 96, ty: 38, rotate: '7deg' },
  { width: 54, tx: -34, ty: 44, rotate: '62deg' },
  { width: 50, tx: 18, ty: 48, rotate: '-66deg' },
] as const;

type SplashScreenProps = {
  onGetStarted: () => void;
};

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 720 || width < 380;
  const logoSize = Math.min(width * 0.48, compact ? 168 : 210);

  const fall = useRef(new Animated.Value(-height * 0.58)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoLift = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-8)).current;
  const trail = useRef(new Animated.Value(1)).current;
  const impact = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const stabilize = useRef(new Animated.Value(0)).current;
  const brand = useRef(new Animated.Value(0)).current;
  const cta = useRef(new Animated.Value(0)).current;
  const stars = useRef(new Animated.Value(0)).current;
  const debris = useMemo(() => DEBRIS.map(() => new Animated.Value(0)), []);

  useEffect(() => {
    fall.setValue(-height * 0.58);
    Animated.loop(
      Animated.sequence([
        Animated.timing(stars, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(stars, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.sequence([
      Animated.delay(220),
      Animated.parallel([
        Animated.timing(fall, {
          toValue: 0,
          duration: 860,
          easing: Easing.bezier(0.12, 0.86, 0.24, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1.08,
          duration: 860,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 760,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(trail, {
          toValue: 0,
          duration: 920,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(shake, {
            toValue: 1,
            duration: 90,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 0,
            duration: 330,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(impact, {
            toValue: 1,
            duration: 170,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(impact, {
            toValue: 0.56,
            duration: 680,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        ...debris.map((item, index) =>
          Animated.sequence([
            Animated.delay(DEBRIS[index].delay),
            Animated.timing(item, {
              toValue: 1,
              duration: 760,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]),
      Animated.parallel([
        Animated.timing(stabilize, {
          toValue: 1,
          duration: 740,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.58,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoLift, {
          toValue: compact ? -height * 0.2 : -height * 0.23,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(brand, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cta, {
          toValue: 1,
          delay: 260,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [compact, cta, debris, fall, height, impact, logoLift, logoRotate, logoScale, shake, stabilize, stars, trail]);

  const sceneShake = shake.interpolate({
    inputRange: [0, 0.18, 0.34, 0.5, 0.7, 1],
    outputRange: [0, -10, 8, -6, 4, 0],
  });
  const logoSpin = logoRotate.interpolate({ inputRange: [-8, 0], outputRange: ['-8deg', '0deg'] });
  const shockScale = impact.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.34] });
  const shockOpacity = impact.interpolate({ inputRange: [0, 0.14, 1], outputRange: [0, 1, 0.22] });
  const energyScale = stabilize.interpolate({ inputRange: [0, 1], outputRange: [0.64, 1.04] });
  const brandY = brand.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const ctaY = cta.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const starPulse = stars.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" translucent />
      <LinearGradient
        colors={['#F7F8FC', '#FFFFFF', '#F5F0FF', '#EEF4FF']}
        locations={[0, 0.36, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.scene, { transform: [{ translateX: sceneShake }] }]}>
        <View style={styles.skyGlow} />
        <View style={styles.purpleHaze} />
        {STAR_FIELD.map((star, index) => (
          <Animated.View
            key={`star-${index}`}
            style={[
              styles.star,
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                opacity: starPulse,
              },
            ]}
          />
        ))}

        <Animated.View style={[styles.trail, { opacity: trail, transform: [{ translateY: fall }] }]}>
          <LinearGradient
            colors={['rgba(45,124,255,0)', 'rgba(109,93,251,0.22)', 'rgba(214,91,255,0)']}
            style={styles.trailBeam}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
            style={styles.trailCore}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.logoLayer,
            {
              width: logoSize,
              height: logoSize,
              transform: [
                { translateY: fall },
                { translateY: logoLift },
                { scale: logoScale },
                { rotate: logoSpin },
              ],
            },
          ]}
        >
          <View style={styles.logoAura} />
          <FixoraMark size={logoSize} />
        </Animated.View>

        <View style={[styles.ground, { bottom: compact ? 122 : 150 }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(109,93,251,0.2)', 'rgba(214,91,255,0.12)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.horizon}
          />
          <Animated.View
            style={[
              styles.shockwave,
              {
                opacity: shockOpacity,
                transform: [{ scaleX: shockScale }, { scaleY: impact }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.energyRing,
              {
                opacity: stabilize,
                transform: [{ scale: energyScale }],
              },
            ]}
          />
          {CRACKS.map((crack, index) => (
            <Animated.View
              key={`crack-${index}`}
              style={[
                styles.crack,
                {
                  width: crack.width,
                  opacity: impact,
                  transform: [{ translateX: crack.tx }, { translateY: crack.ty }, { rotate: crack.rotate }],
                },
              ]}
            />
          ))}
          {DEBRIS.map((particle, index) => {
            const progress = debris[index];
            const translateX = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(particle.angle) * particle.distance],
            });
            const translateY = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(particle.angle) * particle.distance - 28],
            });
            const opacity = progress.interpolate({
              inputRange: [0, 0.18, 1],
              outputRange: [0, 1, 0],
            });
            return (
              <Animated.View
                key={`debris-${index}`}
                style={[
                  styles.debris,
                  {
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    opacity,
                    transform: [{ translateX }, { translateY }],
                  },
                ]}
              />
            );
          })}
          <Animated.View style={[styles.smoke, { opacity: impact }]} />
        </View>

        <Animated.View
          style={[
            styles.brand,
            {
              top: compact ? height * 0.43 : height * 0.44,
              opacity: brand,
              transform: [{ translateY: brandY }],
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: compact ? 58 : 72 }]}>Fixora</Text>
          <Text style={[styles.tagline, { fontSize: compact ? 16 : 18 }]}>
            {t('splash.tagline', 'Services at your fingertips.')}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonWrap,
            {
              bottom: Math.max(insets.bottom + 28, compact ? 36 : 52),
              opacity: cta,
              transform: [{ translateY: ctaY }],
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('splash.start', 'Start Fixora')}
            onPress={onGetStarted}
            android_ripple={{ color: 'rgba(255,255,255,0.16)' }}
            style={({ pressed }) => [styles.buttonShell, pressed && styles.buttonPressed]}
          >
            <BlurView intensity={Platform.OS === 'android' ? 34 : 70} tint="light" style={styles.buttonBlur}>
              <LinearGradient
                colors={['#D65BFF', '#6D5DFB', '#2D7CFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t('splash.start', 'Start Fixora')}</Text>
              </LinearGradient>
            </BlurView>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function FixoraMark({ size }: { size: number }) {
  return (
    <View style={[styles.mark, { width: size, height: size }]}>
      <LinearGradient
        colors={['#06C8FF', '#1571FF', '#8E36FF']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={[
          styles.topBlade,
          {
            width: size * 0.72,
            height: size * 0.22,
            left: size * 0.16,
            top: size * 0.14,
            borderTopRightRadius: size * 0.18,
            borderBottomRightRadius: size * 0.18,
            borderTopLeftRadius: size * 0.05,
            borderBottomLeftRadius: size * 0.18,
          },
        ]}
      />
      <LinearGradient
        colors={['#16B8FF', '#6346FF', '#B02BFF']}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          styles.midBlade,
          {
            width: size * 0.58,
            height: size * 0.2,
            left: size * 0.16,
            top: size * 0.39,
            borderTopRightRadius: size * 0.15,
            borderBottomRightRadius: size * 0.15,
            borderTopLeftRadius: size * 0.2,
            borderBottomLeftRadius: size * 0.05,
          },
        ]}
      />
      <LinearGradient
        colors={['#8E36FF', '#B02BFF', '#4C12C8']}
        style={[
          styles.lowerBlade,
          {
            width: size * 0.3,
            height: size * 0.38,
            left: size * 0.17,
            top: size * 0.49,
            borderTopRightRadius: size * 0.13,
            borderBottomRightRadius: size * 0.24,
            borderBottomLeftRadius: size * 0.2,
          },
        ]}
      />
      <View style={[styles.shine, { left: size * 0.22, top: size * 0.19, width: size * 0.48 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.ink,
  },
  scene: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  skyGlow: {
    position: 'absolute',
    top: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: COLORS.blueDeep,
    opacity: 0.72,
  },
  purpleHaze: {
    position: 'absolute',
    bottom: 68,
    width: 520,
    height: 260,
    borderRadius: 260,
    backgroundColor: COLORS.violetDeep,
    opacity: 0.8,
    transform: [{ scaleX: 1.2 }],
  },
  star: {
    position: 'absolute',
    borderRadius: 3,
    backgroundColor: '#6D5DFB',
  },
  trail: {
    position: 'absolute',
    top: 0,
    width: 118,
    height: '62%',
    transform: [{ rotate: '13deg' }],
  },
  trailBeam: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: -34,
    bottom: 0,
    borderRadius: 80,
  },
  trailCore: {
    position: 'absolute',
    left: 52,
    right: 52,
    top: 0,
    bottom: 16,
    borderRadius: 18,
  },
  logoLayer: {
    position: 'absolute',
    top: '30%',
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoAura: {
    position: 'absolute',
    width: '82%',
    height: '82%',
    borderRadius: 999,
    backgroundColor: COLORS.blue,
    opacity: 0.18,
    shadowColor: COLORS.violet,
    shadowOpacity: 1,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 0 },
    elevation: 28,
  },
  mark: {
    shadowColor: COLORS.blue,
    shadowOpacity: 0.68,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  topBlade: {
    position: 'absolute',
  },
  midBlade: {
    position: 'absolute',
  },
  lowerBlade: {
    position: 'absolute',
    transform: [{ rotate: '-14deg' }],
  },
  shine: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.46)',
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 220,
    alignItems: 'center',
  },
  horizon: {
    position: 'absolute',
    top: 36,
    width: '96%',
    height: 2,
  },
  shockwave: {
    position: 'absolute',
    top: 26,
    width: 250,
    height: 58,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: 'rgba(103,163,255,0.86)',
    backgroundColor: 'rgba(8,168,255,0.08)',
  },
  energyRing: {
    position: 'absolute',
    top: 22,
    width: 276,
    height: 72,
    borderRadius: 138,
    borderWidth: 2,
    borderColor: 'rgba(154,50,255,0.72)',
    shadowColor: COLORS.blue,
    shadowOpacity: 0.64,
    shadowRadius: 22,
  },
  crack: {
    position: 'absolute',
    top: 60,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(188,213,255,0.72)',
  },
  debris: {
    position: 'absolute',
    top: 58,
    left: '50%',
    borderRadius: 8,
  },
  smoke: {
    position: 'absolute',
    top: -6,
    width: 330,
    height: 120,
    borderRadius: 165,
    backgroundColor: 'rgba(214,91,255,0.12)',
    transform: [{ scaleX: 1.28 }],
  },
  brand: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 5,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
    textShadowColor: 'rgba(109,93,251,0.16)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  tagline: {
    maxWidth: 280,
    marginTop: 8,
    color: '#374151',
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(154,50,255,0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  buttonWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 8,
    alignItems: 'center',
  },
  buttonShell: {
    width: '100%',
    maxWidth: 332,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(109,93,251,0.22)',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  buttonBlur: {
    flex: 1,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
