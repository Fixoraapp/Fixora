import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';
import { GlavBlogWebsite } from '../components/web/GlavBlogWebsite';
import { GlavBlogPage, useAdminConfig } from '../context/AdminConfigContext';
import { useTranslation } from '../i18n/I18nProvider';
import { activeGlavBlogPages } from '../utils/glavBlog';

type WelcomeScreenProps = {
  onLogin: () => void;
  onRegister: () => void;
  onOpenAdmin: () => void;
};

export default function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  const { t, language } = useTranslation();
  const { state } = useAdminConfig();
  const pages = activeGlavBlogPages(state.glavBlog);
  const [activePageId, setActivePageId] = useState<GlavBlogPage['id']>(pages[0]?.id ?? 'home');

  if (Platform.OS === 'web') {
    return (
      <GlavBlogWebsite
        pages={state.glavBlog}
        activePageId={activePageId}
        language={language}
        onSelectPage={setActivePageId}
        onLogin={onLogin}
        onRegister={onRegister}
      />
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 26, paddingTop: 70, paddingBottom: 34 },
  top: { alignItems: 'center' },
  slogan: { marginTop: 8, color: '#506079', fontSize: 14, fontWeight: '700' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#09183F', fontSize: 40, lineHeight: 50, fontWeight: '900', textAlign: 'center' },
  subtitle: { marginTop: 16, maxWidth: 520, color: '#64748B', fontSize: 16, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 14, justifyContent: 'center' },
  primaryButton: { flex: 1, maxWidth: 240, minHeight: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5B6CFF', shadowColor: '#5B6CFF', shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondaryButton: { flex: 1, maxWidth: 240, minHeight: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DFE6F5' },
  secondaryText: { color: '#09183F', fontSize: 16, fontWeight: '900' },
});
