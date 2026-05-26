import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
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
import { GradientButton } from '../components/GradientButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { UserRole } from '../types/navigation';

type RoleConfig = {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  colors: [string, string, string];
  glow: string;
  features: string[];
};

const roles: RoleConfig[] = [
  {
    id: 'client',
    title: 'Client',
    subtitle: 'Book trusted professionals instantly.',
    description: 'Find verified experts, compare prices, chat, book services, and pay securely.',
    icon: 'USER',
    colors: ['#157BFF', '#426BFF', '#7C3AED'],
    glow: '#157BFF',
    features: ['Verified Professionals', 'Real-time Chat', 'Secure Payments', 'Local Marketplace'],
  },
  {
    id: 'master',
    title: 'Master',
    subtitle: 'Offer services and receive local orders.',
    description: 'Create your profile, receive nearby orders, chat with clients, manage your work, and grow your income.',
    icon: 'TOOLS',
    colors: ['#7C3AED', '#A855F7', '#5A31FF'],
    glow: '#A855F7',
    features: ['Local Orders', 'Client Chat', 'Ratings & Reviews', 'Earnings Dashboard'],
  },
];

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 23) % 100}%` as `${number}%`,
  top: `${(index * 37) % 82}%` as `${number}%`,
  size: 2 + (index % 3),
  delay: index * 80,
}));

type RoleSelectionScreenProps = {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
};

export default function RoleSelectionScreen({
  selectedRole,
  onSelectRole,
  onContinue,
}: RoleSelectionScreenProps) {
  const { height } = useWindowDimensions();
  const compact = height < 720;
  const buttonPulse = useRef(new Animated.Value(0)).current;
  const particles = useMemo(() => PARTICLES.map(() => new Animated.Value(0)), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    particles.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[index].delay),
          Animated.timing(particle, {
            toValue: 1,
            duration: 2600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 2600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [buttonPulse, particles]);

  const buttonScale = buttonPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] });

  return (
    <ScreenBackground>
      <View style={styles.particleLayer} pointerEvents="none">
        {PARTICLES.map((particle, index) => {
          const opacity = particles[index].interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.72] });
          const translateY = particles[index].interpolate({ inputRange: [0, 1], outputRange: [0, -14] });

          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: particle.size,
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            />
          );
        })}
      </View>

      <ScrollView contentContainerStyle={[styles.content, compact && styles.compactContent]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Fixora premium access</Text>
          <Text style={styles.title}>Choose your role</Text>
          <Text style={styles.subtitle}>Select how you want to use Fixora</Text>
        </View>

        <View style={styles.cards}>
          {roles.map((role) => (
            <PremiumRoleCard
              key={role.id}
              role={role}
              selected={selectedRole === role.id}
              onPress={() => onSelectRole(role.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Animated.View style={[styles.footer, { transform: [{ scale: buttonScale }] }]}>
        <GradientButton title="Continue" onPress={onContinue}>
          <Text style={styles.buttonArrow}>{'->'}</Text>
        </GradientButton>
      </Animated.View>
    </ScreenBackground>
  );
}

function PremiumRoleCard({
  role,
  selected,
  onPress,
}: {
  role: RoleConfig;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: selected ? 1 : 0,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [glow, selected]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: role.id === 'master' ? 1900 : 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: role.id === 'master' ? 1900 : 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float, role.id]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, role.id === 'master' ? -7 : -4] });
  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.16)', role.glow],
  });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.62] });

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 24, bounciness: 5 }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 6 }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardShadow,
        {
          borderColor,
          shadowColor: role.glow,
          shadowOpacity,
        },
      ]}
    >
      <Animated.View style={[styles.cardMotion, { transform: [{ translateY }, { scale }] }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Select ${role.title}`}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={styles.cardPressable}
        >
          <LinearGradient
            colors={selected ? ['rgba(21,123,255,0.18)', 'rgba(124,58,237,0.2)'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.045)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardInner}
          >
            <View style={styles.cardTop}>
              <LinearGradient colors={role.colors} style={styles.roleIcon}>
                <Text style={styles.roleIconText}>{role.icon}</Text>
              </LinearGradient>
              <View style={[styles.selectedBadge, selected && styles.selectedBadgeActive]}>
                <Text style={styles.selectedBadgeText}>{selected ? 'OK' : ''}</Text>
              </View>
            </View>

            <Text style={styles.roleTitle}>{role.title}</Text>
            <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>

            <View style={styles.featureGrid}>
              {role.features.map((feature) => (
                <View key={feature} style={styles.featurePill}>
                  <View style={[styles.featureDot, { backgroundColor: role.glow }]} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particleLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: '#8EA7FF',
    shadowColor: '#A855F7',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 118,
  },
  compactContent: {
    paddingTop: 10,
  },
  hero: {
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: '#8EA7FF',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 8,
    color: '#AAB0C0',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  cards: {
    gap: 14,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  cardShadow: {
    borderRadius: 24,
    borderWidth: 1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  cardMotion: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardPressable: {
    minHeight: 248,
  },
  cardInner: {
    flex: 1,
    padding: 18,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleIcon: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#157BFF',
    shadowOpacity: 0.5,
    shadowRadius: 18,
  },
  roleIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  selectedBadge: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  selectedBadgeActive: {
    backgroundColor: '#6945FF',
    borderColor: '#AFC2FF',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  roleTitle: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  roleSubtitle: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
  roleDescription: {
    marginTop: 10,
    color: '#AAB0C0',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  featureGrid: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    minHeight: 34,
    maxWidth: '48%',
    flexGrow: 1,
    flexBasis: '46%',
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },
  featureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  featureText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  footer: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 20,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
