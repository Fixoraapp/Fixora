import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from '../../i18n/I18nProvider';

type AnimatedPhoneShowcaseProps = {
  compact?: boolean;
  style?: ViewStyle;
};

export function AnimatedPhoneShowcase({ compact = false, style }: AnimatedPhoneShowcaseProps) {
  const { t } = useTranslation();
  const { formatMoney } = useCurrency();
  const { width } = useWindowDimensions();
  const motion = useRef(new Animated.Value(0)).current;
  const isNarrow = width < 760;
  const isTablet = width >= 760 && width < 1180;
  const scale = compact || isTablet ? 0.82 : isNarrow ? 0.74 : 1;
  const showSecondPhone = !isNarrow;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: 2300,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: 2300,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [motion]);

  const clientTranslateY = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const masterTranslateY = motion.interpolate({ inputRange: [0, 1], outputRange: [-14, 12] });
  const clientRotate = motion.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '-2deg'] });
  const masterRotate = motion.interpolate({ inputRange: [0, 1], outputRange: ['8deg', '4deg'] });
  const bubbleScale = motion.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0.88, 1.06, 1.02, 0.9] });
  const bubbleOpacity = motion.interpolate({ inputRange: [0, 0.22, 0.78, 1], outputRange: [0.58, 1, 1, 0.66] });
  const orbDrift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const orbDriftAlt = motion.interpolate({ inputRange: [0, 1], outputRange: [-12, 10] });

  return (
    <View style={[styles.stage, compact && styles.stageCompact, isNarrow && styles.stageNarrow, style]}>
      <View style={styles.blueGlow} />
      <View style={styles.purpleGlow} />
      <Animated.View style={[styles.orb, styles.orbTop, { transform: [{ translateY: orbDrift }] }]} />
      <Animated.View style={[styles.orb, styles.orbBottom, { transform: [{ translateY: orbDriftAlt }] }]} />
      <Animated.View style={[styles.tinyOrb, styles.tinyOrbOne, { opacity: bubbleOpacity }]} />
      <Animated.View style={[styles.tinyOrb, styles.tinyOrbTwo, { transform: [{ translateY: orbDrift }] }]} />

      <Animated.View
        style={[
          styles.phoneWrap,
          styles.clientPhoneWrap,
          isNarrow && styles.singlePhoneWrap,
          {
            transform: [{ scale }, { translateY: clientTranslateY }, { rotate: clientRotate }],
          },
        ]}
      >
        <PhoneShell kind="client" motion={motion} />
      </Animated.View>

      {showSecondPhone ? (
        <Animated.View
          style={[
            styles.phoneWrap,
            styles.masterPhoneWrap,
            {
              transform: [{ scale }, { translateY: masterTranslateY }, { rotate: masterRotate }],
            },
          ]}
        >
          <PhoneShell kind="master" motion={motion} />
        </Animated.View>
      ) : null}

      <Animated.View
        style={[
          styles.orderBubble,
          isNarrow && styles.orderBubbleNarrow,
          {
            opacity: bubbleOpacity,
            transform: [{ scale: bubbleScale }, { translateY: orbDriftAlt }],
          },
        ]}
      >
        <Text style={styles.orderBubbleKicker}>{t('phoneShowcase.order.kicker', 'New order')}</Text>
        <Text style={styles.orderBubbleTitle}>{t('phoneShowcase.order.title', 'Socket repair')}</Text>
        <Text style={styles.orderBubbleMeta}>{t('phoneShowcase.order.meta', 'Yerevan · {{price}}').replace('{{price}}', formatMoney(8000))}</Text>
      </Animated.View>
    </View>
  );
}

function PhoneShell({ kind, motion }: { kind: 'client' | 'master'; motion: Animated.Value }) {
  const { t } = useTranslation();
  const notificationOpacity = motion.interpolate({ inputRange: [0, 0.3, 0.82, 1], outputRange: [0.35, 1, 1, 0.45] });
  const notificationTranslate = motion.interpolate({ inputRange: [0, 1], outputRange: [12, -4] });
  const acceptScale = motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.96, 1.04, 0.96] });

  return (
    <View style={styles.phone}>
      <View style={styles.notch} />
      <View style={styles.phoneHeader}>
        <Text style={styles.brand}>{t('brand.name', 'Fixora')}</Text>
        <View style={styles.headerPill} />
      </View>
      <View style={styles.searchBar} />

      {kind === 'client' ? (
        <>
          <LinearGradient colors={['#6E45E8', '#4F8BFF']} style={styles.banner}>
            <Text style={styles.bannerText}>{t('phoneShowcase.client.banner', 'Create a service request')}</Text>
            <Text style={styles.bannerSub}>{t('phoneShowcase.client.subtitle', 'Trusted pros nearby')}</Text>
          </LinearGradient>
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>{t('labels.category', 'Category')}</Text>
            <Text style={styles.formValue}>{t('phoneShowcase.client.category', 'Electrical repair')}</Text>
            <View style={styles.formDivider} />
            <Text style={styles.formLabel}>{t('labels.address', 'Address')}</Text>
            <Text style={styles.formValue}>{t('phoneShowcase.client.address', 'Kentron, today')}</Text>
          </View>
          <LinearGradient colors={['#7C3AED', '#4169F6']} style={styles.submitPill}>
            <Text style={styles.submitText}>{t('phoneShowcase.client.postOrder', 'Post order')}</Text>
          </LinearGradient>
        </>
      ) : (
        <>
          <Animated.View style={[styles.notification, { opacity: notificationOpacity, transform: [{ translateY: notificationTranslate }] }]}>
            <Text style={styles.notificationTitle}>{t('phoneShowcase.master.pushTitle', 'SMS / Push')}</Text>
            <Text style={styles.notificationText}>{t('phoneShowcase.master.pushBody', 'New nearby order arrived')}</Text>
          </Animated.View>
          <View style={styles.masterCard}>
            <View style={styles.masterAvatar}><Text style={styles.masterAvatarText}>F</Text></View>
            <View style={styles.masterLines}>
              <View style={styles.lineWide} />
              <View style={styles.lineShort} />
            </View>
          </View>
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>{t('phoneShowcase.order.kicker', 'New order')}</Text>
            <Text style={styles.jobText}>{t('phoneShowcase.master.jobMeta', 'Socket repair · 1.3 km')}</Text>
            <Animated.View style={{ transform: [{ scale: acceptScale }] }}>
              <LinearGradient colors={['#7C3AED', '#4169F6']} style={styles.acceptButton}>
                <Text style={styles.acceptText}>{t('buttons.accept', 'Accept')}</Text>
              </LinearGradient>
            </Animated.View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    minHeight: 560,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stageCompact: { minHeight: 390 },
  stageNarrow: { minHeight: 430 },
  blueGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#4F8BFF',
    opacity: 0.13,
    right: 24,
    top: 40,
  },
  purpleGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#7C3AED',
    opacity: 0.15,
    left: 60,
    bottom: 22,
  },
  orb: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#A78BFA',
    opacity: 0.5,
  },
  orbTop: { top: 76, right: 58 },
  orbBottom: { bottom: 94, left: 42 },
  tinyOrb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4169F6',
    opacity: 0.3,
  },
  tinyOrbOne: { top: 154, left: 110 },
  tinyOrbTwo: { right: 118, bottom: 150 },
  phoneWrap: {
    position: 'absolute',
    width: 238,
    height: 462,
    borderRadius: 38,
    shadowColor: '#4C1D95',
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 24 },
  },
  clientPhoneWrap: { left: 86, top: 50, zIndex: 2 },
  masterPhoneWrap: { right: 68, top: 84, zIndex: 1 },
  singlePhoneWrap: { left: undefined, right: undefined, top: 38 },
  phone: {
    flex: 1,
    padding: 17,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 8,
    borderColor: '#111827',
  },
  notch: {
    alignSelf: 'center',
    width: 82,
    height: 17,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginTop: -12,
  },
  phoneHeader: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: '#07153C', fontSize: 17, fontWeight: '900' },
  headerPill: { width: 30, height: 7, borderRadius: 5, backgroundColor: '#DDE5F2' },
  searchBar: { marginTop: 15, height: 36, borderRadius: 12, backgroundColor: '#F2F5FB' },
  banner: { marginTop: 13, minHeight: 86, padding: 13, borderRadius: 17, justifyContent: 'center' },
  bannerText: { color: '#FFFFFF', fontSize: 13, lineHeight: 17, fontWeight: '900' },
  bannerSub: { marginTop: 6, color: 'rgba(255,255,255,0.82)', fontSize: 10, fontWeight: '800' },
  formCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E8EDF7',
  },
  formLabel: { color: '#7B8498', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  formValue: { marginTop: 5, color: '#07153C', fontSize: 12, fontWeight: '900' },
  formDivider: { marginVertical: 10, height: 1, backgroundColor: '#E5EAF4' },
  submitPill: { marginTop: 14, minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  notification: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: '#E4E9F4',
    shadowColor: '#4169F6',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  notificationTitle: { color: '#4169F6', fontSize: 11, fontWeight: '900' },
  notificationText: { marginTop: 4, color: '#07153C', fontSize: 12, fontWeight: '900' },
  masterCard: { marginTop: 14, padding: 12, borderRadius: 16, flexDirection: 'row', gap: 10, backgroundColor: '#F8FAFF' },
  masterAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCE6FF' },
  masterAvatarText: { color: '#4169F6', fontSize: 14, fontWeight: '900' },
  masterLines: { flex: 1, justifyContent: 'center', gap: 7 },
  lineWide: { width: '92%', height: 8, borderRadius: 5, backgroundColor: '#D9E0EF' },
  lineShort: { width: '58%', height: 8, borderRadius: 5, backgroundColor: '#E7ECF6' },
  jobCard: {
    marginTop: 15,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobTitle: { color: '#07153C', fontSize: 15, fontWeight: '900' },
  jobText: { marginTop: 5, color: '#66718A', fontSize: 11, fontWeight: '800' },
  acceptButton: { marginTop: 12, minHeight: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  acceptText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  orderBubble: {
    position: 'absolute',
    right: 148,
    bottom: 42,
    width: 164,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#4169F6',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    zIndex: 4,
  },
  orderBubbleNarrow: { right: 28, bottom: 54 },
  orderBubbleKicker: { color: '#7C3AED', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  orderBubbleTitle: { marginTop: 5, color: '#07153C', fontSize: 15, fontWeight: '900' },
  orderBubbleMeta: { marginTop: 4, color: '#66718A', fontSize: 11, fontWeight: '800' },
});
