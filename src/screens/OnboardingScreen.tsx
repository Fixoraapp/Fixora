import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { FixoraLogo } from '../components/FixoraLogo';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { colors, typography } from '../constants/theme';

const slides = [
  {
    title: 'Find trusted professionals instantly',
    body: 'Discover verified local experts for urgent tasks, premium services, and long-term projects.',
  },
  {
    title: 'Book services near you',
    body: 'Fixora adapts the marketplace to your country, region, and city with local availability.',
  },
  {
    title: 'Work with verified experts',
    body: 'Choose clients, masters, premium masters, or companies in a trusted professional network.',
  },
];

type OnboardingScreenProps = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <AppShell scroll={false}>
      <View style={styles.root}>
        <FixoraLogo wordmark />
        <View style={styles.visual}>
          <View style={styles.orbitOuter} />
          <View style={styles.orbitInner} />
          <View style={styles.core} />
          <View style={[styles.node, styles.nodeA]} />
          <View style={[styles.node, styles.nodeB]} />
          <View style={[styles.node, styles.nodeC]} />
        </View>
        <GlassCard>
          <Text style={styles.kicker}>Global service platform</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
          <View style={styles.dots}>
            {slides.map((item, dotIndex) => (
              <View
                key={item.title}
                style={[styles.dot, dotIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </GlassCard>
        <View style={styles.actions}>
          <PremiumButton
            title={isLast ? 'Choose Location' : 'Continue'}
            onPress={() => (isLast ? onComplete() : setIndex(index + 1))}
          />
          {!isLast ? <PremiumButton title="Skip" variant="ghost" onPress={onComplete} /> : null}
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
  },
  visual: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitOuter: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(8,168,255,0.24)',
  },
  orbitInner: {
    position: 'absolute',
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 1,
    borderColor: 'rgba(139,53,255,0.34)',
  },
  core: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.panelStrong,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    shadowColor: colors.purple,
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  node: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.blue,
  },
  nodeA: {
    top: 38,
    right: 78,
  },
  nodeB: {
    left: 76,
    bottom: 44,
    backgroundColor: colors.purple,
  },
  nodeC: {
    right: 92,
    bottom: 70,
    backgroundColor: colors.white,
  },
  kicker: {
    color: colors.blue,
    fontSize: typography.small,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 10,
    color: colors.white,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: 0,
  },
  body: {
    marginTop: 12,
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    letterSpacing: 0,
  },
  dots: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.strokeStrong,
  },
  activeDot: {
    width: 26,
    backgroundColor: colors.blue,
  },
  actions: {
    gap: 12,
  },
});
