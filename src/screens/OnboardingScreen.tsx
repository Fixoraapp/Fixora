import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { FloatingIcon } from '../components/FloatingIcon';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { ScreenBackground } from '../components/ScreenBackground';
import { StepDots } from '../components/StepDots';
import { useTranslation } from '../i18n/I18nProvider';

const slides = [
  {
    title: 'Find trusted professionals instantly.',
    subtitle: 'Thousands of verified specialists are ready to help in your city.',
    cta: 'Next',
    kind: 'network',
  },
  {
    title: 'Book services near you.',
    subtitle: 'Choose your city, compare professionals, and book safely.',
    cta: 'Next',
    kind: 'map',
  },
  {
    title: 'Work with verified experts.',
    subtitle: 'Chat, call, pay securely, and track every order in real time.',
    cta: 'Get Started',
    kind: 'verified',
  },
] as const;

type OnboardingScreenProps = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const compact = height < 720 || width < 380;
  const [index, setIndex] = useState(0);
  const page = useRef(new Animated.Value(1)).current;
  const slide = slides[index];
  const translatedSlide = {
    ...slide,
    title: t(`onboarding.slide${index + 1}.title`, slide.title),
    subtitle: t(`onboarding.slide${index + 1}.subtitle`, slide.subtitle),
    cta: index === slides.length - 1 ? t('buttons.getStarted', slide.cta) : t('buttons.next', slide.cta),
  };

  const restartPage = () => {
    page.setValue(0);
    Animated.timing(page, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const goTo = (nextIndex: number) => {
    setIndex(nextIndex);
    restartPage();
  };

  const goNext = () => {
    if (index === slides.length - 1) {
      onComplete();
      return;
    }
    goTo(index + 1);
  };

  const translateY = page.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });
  const opacity = page.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (index > 0 ? goTo(index - 1) : undefined)}
          hitSlop={12}
        >
          <Text style={[styles.headerAction, index === 0 && styles.hidden]}>‹</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={onComplete} hitSlop={12}>
          <Text style={styles.skip}>{t('onboarding.skip', 'Skip')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: compact ? 18 : 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          <Text style={[styles.title, { fontSize: compact ? 30 : 34, lineHeight: compact ? 36 : 40 }]}>
            {translatedSlide.title}
          </Text>
          <Text style={styles.subtitle}>{translatedSlide.subtitle}</Text>
          <View style={[styles.visual, { height: compact ? 318 : 372 }]}>
            {slide.kind === 'network' ? <NetworkVisual /> : null}
            {slide.kind === 'map' ? <MapVisual /> : null}
            {slide.kind === 'verified' ? <VerifiedVisual /> : null}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <StepDots count={3} activeIndex={index} onSelect={goTo} />
        <GradientButton title={translatedSlide.cta} onPress={goNext} />
      </View>
    </ScreenBackground>
  );
}

function NetworkVisual() {
  return (
    <View style={styles.visualFill}>
      <View style={styles.worldDisc} />
      <FloatingIcon label="TOOLS" style={[styles.floating, { left: 22, top: 94 }]} />
      <FloatingIcon label="HOME" delay={120} style={[styles.floating, { right: 34, top: 70 }]} />
      <FloatingIcon label="AUTO" delay={220} style={[styles.floating, { right: 70, bottom: 62 }]} />
      <GlassCard style={styles.proCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>John Smith</Text>
            <Text style={styles.cardMeta}>Plumbing • 4.9 ★</Text>
          </View>
          <Text style={styles.check}>✓</Text>
        </View>
      </GlassCard>
      <GlassCard style={[styles.proCard, styles.proCardSecond]}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, styles.avatarPurple]}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Anna Beauty</Text>
            <Text style={styles.cardMeta}>Makeup artist • 4.8 ★</Text>
          </View>
          <Text style={styles.check}>✓</Text>
        </View>
      </GlassCard>
    </View>
  );
}

function MapVisual() {
  const pins = useMemo(() => [0, 1, 2], []);

  return (
    <View style={styles.visualFill}>
      <View style={styles.mapGrid}>
        {Array.from({ length: 9 }, (_, item) => (
          <View key={item} style={styles.mapLine} />
        ))}
      </View>
      {pins.map((pin) => (
        <View key={pin} style={[styles.pin, pin === 1 && styles.pinTwo, pin === 2 && styles.pinThree]}>
          <View style={styles.pinInner} />
        </View>
      ))}
      <GlassCard style={[styles.proCard, styles.mapCard]}>
        <Text style={styles.cardTitle}>Choose city</Text>
        <Text style={styles.cardMeta}>Local marketplace first</Text>
      </GlassCard>
      <GlassCard style={[styles.proCard, styles.mapCardSecond]}>
        <Text style={styles.cardTitle}>Compare experts</Text>
        <Text style={styles.cardMeta}>Ratings, prices, reviews</Text>
      </GlassCard>
      <View style={styles.featureDock}>
        <Text style={styles.dockItem}>⌖ City</Text>
        <Text style={styles.dockItem}>★ Rating</Text>
        <Text style={styles.dockItem}>◆ Safe</Text>
      </View>
    </View>
  );
}

function VerifiedVisual() {
  return (
    <View style={styles.visualFill}>
      <View style={styles.verifiedShield}>
        <LinearGradient colors={['#157BFF', '#7C3AED']} style={styles.shieldGradient}>
          <Text style={styles.shieldText}>✓</Text>
        </LinearGradient>
      </View>
      <GlassCard style={[styles.chatCard, { top: 44, left: 10 }]}>
        <Text style={styles.cardTitle}>David Master</Text>
        <Text style={styles.cardMeta}>Hello! I am ready to help you.</Text>
      </GlassCard>
      <GlassCard style={[styles.chatCard, { top: 142, right: 4 }]}>
        <Text style={styles.cardTitle}>Secure Payment</Text>
        <Text style={styles.cardMeta}>•••• 4242 • Protected</Text>
      </GlassCard>
      <GlassCard style={[styles.trackingCard]}>
        <Text style={styles.cardTitle}>Order tracking</Text>
        <View style={styles.trackLine}>
          <View style={styles.trackDot} />
          <View style={styles.trackDot} />
          <View style={[styles.trackDot, styles.trackDotActive]} />
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 58,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    color: '#FFFFFF',
    fontSize: 35,
    lineHeight: 38,
    fontWeight: '600',
  },
  hidden: {
    opacity: 0,
  },
  skip: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: '800',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  title: {
    maxWidth: 390,
    marginTop: 8,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0,
    textShadowColor: 'rgba(21,123,255,0.34)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    maxWidth: 340,
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
    letterSpacing: 0,
  },
  visual: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    marginTop: 18,
  },
  visualFill: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 28,
  },
  worldDisc: {
    position: 'absolute',
    alignSelf: 'center',
    top: 20,
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: 'rgba(21,123,255,0.32)',
    backgroundColor: 'rgba(21,123,255,0.08)',
    shadowColor: '#157BFF',
    shadowOpacity: 0.68,
    shadowRadius: 40,
  },
  floating: {
    position: 'absolute',
  },
  proCard: {
    position: 'absolute',
    left: 28,
    right: 52,
    bottom: 118,
    padding: 12,
    borderRadius: 16,
  },
  proCardSecond: {
    left: 56,
    right: 24,
    bottom: 54,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#157BFF',
  },
  avatarPurple: {
    backgroundColor: '#7C3AED',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardMeta: {
    marginTop: 4,
    color: '#AAB0C0',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  mapGrid: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: 52,
    height: 180,
    transform: [{ rotate: '-10deg' }],
    borderWidth: 1,
    borderColor: 'rgba(21,123,255,0.16)',
  },
  mapLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(168,85,247,0.16)',
  },
  pin: {
    position: 'absolute',
    left: '42%',
    top: 76,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(168,85,247,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOpacity: 0.85,
    shadowRadius: 20,
  },
  pinTwo: {
    left: '67%',
    top: 112,
    backgroundColor: 'rgba(21,123,255,0.94)',
  },
  pinThree: {
    left: '22%',
    top: 132,
  },
  pinInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  mapCard: {
    left: 18,
    right: '42%',
    bottom: 82,
  },
  mapCardSecond: {
    left: '36%',
    right: 14,
    bottom: 26,
  },
  featureDock: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dockItem: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  verifiedShield: {
    position: 'absolute',
    right: 34,
    top: 38,
    width: 100,
    height: 122,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#157BFF',
    shadowOpacity: 0.75,
    shadowRadius: 28,
  },
  shieldGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
  },
  chatCard: {
    position: 'absolute',
    width: 205,
    padding: 14,
  },
  trackingCard: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 34,
  },
  trackLine: {
    marginTop: 14,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  trackDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#157BFF',
  },
  trackDotActive: {
    backgroundColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 10,
  },
});
