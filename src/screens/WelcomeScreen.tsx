import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';
import { AnimatedPhoneShowcase } from '../components/web/AnimatedPhoneShowcase';
import { useTranslation } from '../i18n/I18nProvider';

type WelcomeScreenProps = {
  onLogin: () => void;
  onRegister: () => void;
  onOpenAdmin: () => void;
};

const navItems = ['Главная', 'О нас', 'О компании', 'Возможности', 'Связаться с нами'];

export default function WelcomeScreen({ onLogin, onRegister, onOpenAdmin }: WelcomeScreenProps) {
  const { t } = useTranslation();
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webScreen}>
        <WebHeader onLogin={onLogin} onRegister={onRegister} />
        <ScrollView contentContainerStyle={styles.webContent} showsVerticalScrollIndicator={false}>
          <View style={styles.webHero}>
            <View style={styles.webHeroCopy}>
              <Text style={styles.webBadge}>{t('welcome.badge', '♛ Premium access Fixora')}</Text>
              <Text style={styles.webTitle}>
                {t('welcome.web.title.line1', 'Find trusted')}{'\n'}
                <Text style={styles.webTitleAccent}>{t('welcome.web.title.accent', 'professionals')}</Text>{'\n'}
                {t('welcome.web.title.line3', 'instantly')}
              </Text>
              <Text style={styles.webSubtitle}>
                {t('welcome.web.subtitle', 'Fixora connects clients and professionals. Fast search, verified specialists, reliable services.')}
              </Text>
              <View style={styles.webHeroActions}>
                <Pressable accessibilityRole="button" onPress={onRegister} style={styles.webPrimaryButton}>
                  <Text style={styles.webPrimaryText}>{t('auth.createAccount.cta', '☻  Create account')}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={onLogin} style={styles.webOutlineButton}>
                  <Text style={styles.webOutlineText}>{t('buttons.learnMoreArrow', 'Learn more  →')}</Text>
                </Pressable>
              </View>
              <View style={styles.storeRow}>
                <StoreButton small="GET IT ON" title="Google Play" />
                <StoreButton small="Download on the" title="App Store" />
              </View>
            </View>

            <AnimatedPhoneShowcase style={styles.phoneStage} />
          </View>

          <View style={styles.statsPanel}>
            {[
              ['☁', '5000+', 'Профессионалов', '#F1EEFF'],
              ['☻', '50K+', 'Довольных клиентов', '#FFF0F7'],
              ['▣', '100K+', 'Выполненных заказов', '#EFF6FF'],
              ['✓', '100%', 'Проверенные специалисты', '#ECFDF3'],
            ].map(([icon, value, label, color]) => (
              <View key={value} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: color }]}>
                  <Text style={styles.statIconText}>{icon}</Text>
                </View>
                <View>
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F7FAFF', '#F4F0FF']} style={styles.screen}>
      <View style={styles.top}>
        <FixoraLogo size={76} wordmark />
        <Text style={styles.slogan}>{t('welcome.slogan', 'Find trusted professionals instantly.')}</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>{t('welcome.mobile.title', 'Discover your perfect service')}</Text>
        <Text style={styles.subtitle}>{t('welcome.mobile.subtitle', 'A premium marketplace for trusted local professionals, companies, and services.')}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onLogin} style={styles.primaryButton}>
          <Text style={styles.primaryText}>{t('auth.login.button', 'Login')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRegister} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>{t('auth.register.button', 'Register')}</Text>
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" onPress={onOpenAdmin} style={styles.adminButton}>
        <Text style={styles.adminText}>{t('admin.panel', 'Admin Panel')}</Text>
      </Pressable>
    </LinearGradient>
  );
}

function WebHeader({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.webHeader}>
      <FixoraLogo size={50} wordmark />
      <View style={styles.webNav}>
        {navItems.map((item) => (
          <Pressable key={item} accessibilityRole="button" style={styles.webNavItem}>
            <Text style={styles.webNavText}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.webHeaderActions}>
        <Pressable accessibilityRole="button" onPress={onLogin} style={styles.webLoginButton}>
          <Text style={styles.webLoginText}>{t('auth.login.button', 'Login')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRegister} style={styles.webRegisterButton}>
          <Text style={styles.webRegisterText}>{t('auth.register.headerButton', '☻  Registration')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StoreButton({ small, title }: { small: string; title: string }) {
  return (
    <Pressable accessibilityRole="button" style={styles.storeButton}>
      <Text style={styles.storeIcon}>{title.includes('Google') ? '▶' : '●'}</Text>
      <View>
        <Text style={styles.storeSmall}>{small}</Text>
        <Text style={styles.storeTitle}>{title}</Text>
      </View>
    </Pressable>
  );
}

function PhoneMockup({ front = false }: { front?: boolean }) {
  return (
    <View style={[styles.phone, front ? styles.phoneFront : styles.phoneBack]}>
      <View style={styles.phoneNotch} />
      <View style={styles.phoneAppTop}>
        <Text style={styles.phoneLogo}>Fixora</Text>
        <View style={styles.phoneDots} />
      </View>
      <View style={styles.phoneSearch} />
      <LinearGradient colors={['#6F4CFF', '#7C8BFF']} style={styles.phoneBanner}>
        <Text style={styles.phoneBannerText}>Найдите идеальную услугу для себя</Text>
      </LinearGradient>
      <View style={styles.phoneCategoryRow}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.phoneCategory} />
        ))}
      </View>
      <View style={styles.phoneCard}>
        <View style={styles.phoneAvatar} />
        <View style={styles.phoneLines}>
          <View style={styles.phoneLineWide} />
          <View style={styles.phoneLineShort} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webScreen: { flex: 1, backgroundColor: '#F8FAFF' },
  webHeader: {
    minHeight: 92,
    paddingHorizontal: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF7',
  },
  webNav: { flexDirection: 'row', alignItems: 'center', gap: 34 },
  webNavItem: { minHeight: 44, justifyContent: 'center' },
  webNavText: { color: '#09183F', fontSize: 15, fontWeight: '800' },
  webHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  webLoginButton: {
    minHeight: 48,
    paddingHorizontal: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D3E6',
  },
  webLoginText: { color: '#09183F', fontSize: 15, fontWeight: '900' },
  webRegisterButton: {
    minHeight: 48,
    paddingHorizontal: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6E45E8',
    shadowColor: '#6E45E8',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  webRegisterText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  webContent: { paddingHorizontal: 74, paddingTop: 50, paddingBottom: 56 },
  webHero: { minHeight: 620, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 48 },
  webHeroCopy: { flex: 1, maxWidth: 650 },
  webBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    color: '#5B46E8',
    backgroundColor: '#EEE9FF',
    fontSize: 14,
    fontWeight: '900',
  },
  webTitle: { marginTop: 28, color: '#07153C', fontSize: 60, lineHeight: 72, fontWeight: '900' },
  webTitleAccent: { color: '#7454EA' },
  webSubtitle: { marginTop: 22, maxWidth: 520, color: '#5B6680', fontSize: 20, lineHeight: 32, fontWeight: '600' },
  webHeroActions: { marginTop: 34, flexDirection: 'row', alignItems: 'center', gap: 20 },
  webPrimaryButton: {
    minHeight: 58,
    paddingHorizontal: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6F45E8',
    shadowColor: '#6F45E8',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  webPrimaryText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  webOutlineButton: {
    minHeight: 58,
    paddingHorizontal: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7857EF',
  },
  webOutlineText: { color: '#6F45E8', fontSize: 18, fontWeight: '900' },
  storeRow: { marginTop: 30, flexDirection: 'row', gap: 26 },
  storeButton: {
    minWidth: 182,
    minHeight: 58,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#050505',
  },
  storeIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  storeSmall: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  storeTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  phoneStage: { flex: 1, minHeight: 600, alignItems: 'center', justifyContent: 'center' },
  phone: {
    position: 'absolute',
    width: 260,
    height: 500,
    padding: 18,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 8,
    borderColor: '#111827',
    shadowColor: '#4C1D95',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 24 },
  },
  phoneFront: { transform: [{ rotate: '-5deg' }], left: 80, top: 54, zIndex: 2 },
  phoneBack: { transform: [{ rotate: '9deg' }], right: 66, top: 88, opacity: 0.94 },
  phoneNotch: { alignSelf: 'center', width: 86, height: 18, borderRadius: 12, backgroundColor: '#111827', marginTop: -13 },
  phoneAppTop: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phoneLogo: { color: '#07153C', fontSize: 18, fontWeight: '900' },
  phoneDots: { width: 28, height: 7, borderRadius: 5, backgroundColor: '#D9E0EF' },
  phoneSearch: { marginTop: 16, height: 38, borderRadius: 12, backgroundColor: '#F2F5FB' },
  phoneBanner: { marginTop: 14, height: 88, borderRadius: 16, padding: 14 },
  phoneBannerText: { color: '#FFFFFF', fontSize: 13, lineHeight: 18, fontWeight: '900' },
  phoneCategoryRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' },
  phoneCategory: { width: 44, height: 48, borderRadius: 14, backgroundColor: '#F0EDFF' },
  phoneCard: { marginTop: 20, padding: 12, borderRadius: 14, flexDirection: 'row', gap: 12, backgroundColor: '#F8FAFF' },
  phoneAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#C7D2FE' },
  phoneLines: { flex: 1, justifyContent: 'center', gap: 8 },
  phoneLineWide: { width: '90%', height: 9, borderRadius: 5, backgroundColor: '#D9E0EF' },
  phoneLineShort: { width: '60%', height: 9, borderRadius: 5, backgroundColor: '#E7ECF6' },
  floatOrb: { position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: '#8B5CF6', opacity: 0.45 },
  floatOrbTop: { top: 92, right: 28 },
  floatOrbBottom: { bottom: 98, left: 40 },
  statsPanel: {
    marginTop: 8,
    paddingVertical: 28,
    paddingHorizontal: 34,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF7',
    shadowColor: '#6D7BA8',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
  },
  statItem: { flex: 1, minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 24, paddingHorizontal: 28, borderRightWidth: 1, borderRightColor: '#E4E9F4' },
  statIcon: { width: 76, height: 76, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statIconText: { color: '#6F45E8', fontSize: 28, fontWeight: '900' },
  statValue: { color: '#07153C', fontSize: 36, fontWeight: '900' },
  statLabel: { marginTop: 4, color: '#62708A', fontSize: 16, fontWeight: '700' },
  screen: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 70,
    paddingBottom: 34,
  },
  top: {
    alignItems: 'center',
  },
  slogan: {
    marginTop: 8,
    color: '#506079',
    fontSize: 14,
    fontWeight: '700',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#09183F',
    fontSize: 40,
    lineHeight: 50,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 16,
    maxWidth: 520,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    maxWidth: 240,
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B6CFF',
    shadowColor: '#5B6CFF',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    maxWidth: 240,
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6F5',
  },
  secondaryText: {
    color: '#09183F',
    fontSize: 16,
    fontWeight: '900',
  },
  adminButton: {
    marginTop: 22,
    alignSelf: 'center',
    paddingHorizontal: 16,
    minHeight: 38,
    justifyContent: 'center',
  },
  adminText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '900',
  },
});
