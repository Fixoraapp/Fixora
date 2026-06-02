import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { GradientButton } from '../components/GradientButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { RoleCardSettings, useRoleCardSettings } from '../context/RoleCardSettingsContext';
import { useTranslation } from '../i18n/I18nProvider';
import { UserRole } from '../types/navigation';

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
  onOpenAdmin: () => void;
  onResetAppState?: () => void;
};

export default function RoleSelectionScreen({
  selectedRole,
  onSelectRole,
  onContinue,
  onOpenAdmin,
  onResetAppState,
}: RoleSelectionScreenProps) {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const { settings } = useRoleCardSettings();
  const compact = height < 720;
  const buttonPulse = useRef(new Animated.Value(0)).current;
  const particles = useMemo(() => PARTICLES.map(() => new Animated.Value(0)), []);
  const roleCards = useMemo(
    () => Object.values(settings).filter((role) => role.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    [settings],
  );
  const selectedCard = settings[selectedRole];

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
          <Text style={styles.kicker}>{t('roleSelection.kicker', 'Fixora premium access')}</Text>
          <Text style={styles.title}>{t('roleSelection.title', 'Choose your path')}</Text>
          <Text style={styles.subtitle}>{t('roleSelection.subtitle', 'Select how you want to enter the marketplace')}</Text>
        </View>

        <View style={styles.cards}>
          {roleCards.map((role) => (
            <PremiumRoleCard
              key={role.role}
              role={role}
              selected={selectedRole === role.role}
              onPress={() => onSelectRole(role.role)}
            />
          ))}
        </View>
      </ScrollView>

      <Animated.View style={[styles.footer, { transform: [{ scale: buttonScale }] }]}>
        <GradientButton title={selectedCard?.buttonText || t('buttons.continue', 'Continue')} onPress={onContinue} disabled={roleCards.length === 0}>
          <Text style={styles.buttonArrow}>{'->'}</Text>
        </GradientButton>
        <Pressable accessibilityRole="button" onPress={onOpenAdmin} style={styles.adminLink}>
          <Text style={styles.adminLinkText}>{t('roleSelection.openAdmin', 'Open Pro Admin Panel')}</Text>
        </Pressable>
        {__DEV__ && onResetAppState ? (
          <Pressable accessibilityRole="button" onPress={onResetAppState} style={styles.resetLink}>
            <Text style={styles.resetLinkText}>{t('roleSelection.resetDev', 'Reset onboarding and location')}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </ScreenBackground>
  );
}

function PremiumRoleCard({
  role,
  selected,
  onPress,
}: {
  role: RoleCardSettings;
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
          duration: role.role === 'master' ? 1900 : 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: role.role === 'master' ? 1900 : 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float, role.role]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, role.animation === 'float' ? (role.role === 'master' ? -7 : -4) : 0] });
  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [role.design.borderColor, role.design.selectedBorder],
  });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.16, Math.min(role.design.shadowIntensity / 100, 0.86)] });

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
          shadowColor: role.design.glowColor,
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
            colors={selected ? [role.design.background, `${role.design.selectedGlow}3D`] : [role.design.background, '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cardInner, { borderColor: selected ? role.design.selectedBorder : role.design.borderColor }]}
          >
            <View style={styles.cardVisual}>
              <RoleIllustration role={role} />
              <View style={[styles.selectedBadge, selected && styles.selectedBadgeActive]}>
                <Text style={styles.selectedBadgeText}>{selected ? 'OK' : ''}</Text>
              </View>
            </View>

            <Text style={[styles.roleLabel, {
              color: role.typography.textColor,
              fontSize: role.typography.titleSize,
              lineHeight: Math.round(role.typography.titleSize * role.typography.lineHeight),
              fontWeight: role.typography.fontWeight,
              letterSpacing: role.typography.letterSpacing,
            }]}>{role.title}</Text>
            <Text style={[styles.roleSubtitle, {
              color: role.typography.textColor,
              fontSize: role.typography.subtitleSize,
              lineHeight: Math.round(role.typography.subtitleSize * role.typography.lineHeight),
              fontWeight: role.typography.fontWeight,
            }]}>{role.subtitle}</Text>
            <Text style={[styles.roleDescription, {
              color: role.typography.mutedColor,
              fontSize: role.typography.descriptionSize,
              lineHeight: Math.round(role.typography.descriptionSize * role.typography.lineHeight),
              letterSpacing: role.typography.letterSpacing,
            }]}>{role.description}</Text>
            {role.showFeatures ? (
              <View style={styles.featureList}>
                {role.features.map((feature) => (
                  <View key={feature} style={[styles.featurePill, { borderColor: `${role.visual.iconColor}44` }]}>
                    <Text style={[styles.featureText, { color: role.visual.iconColor }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function RoleIllustration({ role }: { role: RoleCardSettings }) {
  const isMaster = role.role === 'master';

  return (
    <LinearGradient colors={role.design.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.illustrationStage}>
      <View style={styles.illustrationGrid} />
      {role.visual.image ? (
        <>
          <Image
            source={{ uri: role.visual.image }}
            resizeMode={role.visual.imagePosition === 'cover' ? 'cover' : 'contain'}
            blurRadius={role.visual.imageBlur}
            style={[
              styles.roleImage,
              {
                opacity: Math.max(0.2, Math.min(role.visual.imageBrightness / 100, 1.4)),
                transform: [{ scale: Math.max(0.45, role.visual.imageSize / 100) }],
              },
            ]}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: role.visual.imageOverlay }]} />
        </>
      ) : null}
      <View style={[styles.illustrationGlow, { backgroundColor: role.design.glowColor }]} />
      <View style={styles.personShadow} />
      <View style={[styles.personBody, isMaster ? styles.masterBody : styles.clientBody]}>
        <View style={[styles.torsoStripe, { backgroundColor: role.visual.iconColor }]} />
      </View>
      <View style={[styles.personNeck, { backgroundColor: isMaster ? '#CFA978' : '#D7B18B' }]} />
      <View style={[styles.personHead, { backgroundColor: isMaster ? '#DDBB86' : '#E8C39E' }]}>
        <View style={styles.faceLine} />
        {!isMaster ? <View style={styles.clientSmile} /> : null}
      </View>
      {isMaster ? (
        <>
          <View style={styles.helmet}>
            <View style={styles.helmetRidge} />
          </View>
          <View style={styles.toolHandle} />
          <View style={styles.toolHead} />
          <View style={styles.wrenchCircle} />
        </>
      ) : (
        <>
          <View style={styles.clientHair} />
          <View style={styles.clientLaptop}>
            <View style={styles.laptopGlow} />
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>OK</Text>
          </View>
        </>
      )}
      <View style={[styles.roleIcon, { width: role.visual.iconSize, height: role.visual.iconSize, borderRadius: role.visual.iconSize / 2, backgroundColor: `${role.visual.iconColor}22`, borderColor: role.visual.iconColor }]}>
        <Text style={[styles.roleIconText, { color: role.visual.iconColor, fontSize: Math.max(12, role.visual.iconSize * 0.36) }]}>{role.visual.icon}</Text>
      </View>
      <View style={[styles.orbitOne, { borderColor: `${role.visual.iconColor}88` }]} />
      <View style={[styles.orbitTwo, { borderColor: `${role.design.glowColor}88` }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  particleLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: '#6D5DFB',
    shadowColor: '#B75CFF',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 140,
  },
  compactContent: {
    paddingTop: 10,
  },
  hero: {
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: '#6D5DFB',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 8,
    color: '#111827',
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  cards: {
    gap: 16,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  cardShadow: {
    borderRadius: 26,
    borderWidth: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
  },
  cardMotion: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  cardPressable: {
    minHeight: 310,
  },
  cardInner: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
  },
  cardVisual: {
    minHeight: 178,
    borderRadius: 22,
    overflow: 'hidden',
  },
  illustrationStage: {
    flex: 1,
    minHeight: 178,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#F9FAFB',
    backgroundColor: 'rgba(5,8,22,0.22)',
  },
  roleImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  illustrationGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.24,
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  personShadow: {
    position: 'absolute',
    bottom: 18,
    width: 150,
    height: 26,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  personBody: {
    position: 'absolute',
    bottom: 28,
    width: 118,
    height: 82,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  masterBody: {
    backgroundColor: '#17243E',
    borderWidth: 1,
    borderColor: 'rgba(249,215,126,0.3)',
  },
  clientBody: {
    backgroundColor: '#122D4B',
    borderWidth: 1,
    borderColor: 'rgba(65,230,164,0.28)',
  },
  torsoStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 28,
    height: 8,
    opacity: 0.85,
  },
  personNeck: {
    position: 'absolute',
    top: 74,
    width: 28,
    height: 24,
    borderRadius: 10,
  },
  personHead: {
    position: 'absolute',
    top: 38,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  faceLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(5,8,22,0.36)',
  },
  clientSmile: {
    marginTop: 6,
    width: 24,
    height: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(5,8,22,0.42)',
    borderRadius: 20,
  },
  helmet: {
    position: 'absolute',
    top: 28,
    width: 76,
    height: 34,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  helmetRidge: {
    alignSelf: 'center',
    width: 10,
    height: 28,
    borderRadius: 5,
    backgroundColor: 'rgba(5,8,22,0.18)',
  },
  toolHandle: {
    position: 'absolute',
    right: 80,
    bottom: 44,
    width: 10,
    height: 88,
    borderRadius: 6,
    backgroundColor: '#6B7280',
    transform: [{ rotate: '-28deg' }],
  },
  toolHead: {
    position: 'absolute',
    right: 61,
    top: 45,
    width: 46,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E6ECFF',
    transform: [{ rotate: '-28deg' }],
  },
  wrenchCircle: {
    position: 'absolute',
    left: 74,
    bottom: 48,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.56)',
  },
  clientHair: {
    position: 'absolute',
    top: 30,
    width: 64,
    height: 28,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#201A2F',
  },
  clientLaptop: {
    position: 'absolute',
    right: 70,
    bottom: 34,
    width: 82,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#DDE7FF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  laptopGlow: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D7CFF',
  },
  trustBadge: {
    position: 'absolute',
    left: 78,
    top: 42,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.76)',
  },
  trustBadgeText: {
    color: '#05101A',
    fontSize: 11,
    fontWeight: '900',
  },
  roleIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  roleIconText: {
    fontWeight: '900',
  },
  orbitOne: {
    position: 'absolute',
    width: 170,
    height: 54,
    borderRadius: 90,
    borderWidth: 1,
    transform: [{ rotate: '-10deg' }],
  },
  orbitTwo: {
    position: 'absolute',
    width: 210,
    height: 74,
    borderRadius: 120,
    borderWidth: 1,
    transform: [{ rotate: '18deg' }],
  },
  selectedBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
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
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
  },
  roleLabel: {
    marginTop: 16,
    color: '#111827',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  roleSubtitle: {
    marginTop: 7,
    color: '#111827',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  roleDescription: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  featureList: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  featurePill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 20,
  },
  buttonArrow: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  adminLink: {
    marginTop: 10,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminLinkText: {
    color: '#6D5DFB',
    fontSize: 12,
    fontWeight: '900',
  },
  resetLink: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetLinkText: {
    color: '#FF8AA0',
    fontSize: 11,
    fontWeight: '900',
  },
});

