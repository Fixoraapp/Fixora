import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';
import { authStorage, RegisteredUser } from '../services/authStorage';

type LoginScreenProps = {
  onLoggedIn: (user: RegisteredUser) => void;
  onRegister: () => void;
};

const navItems = ['Главная', 'О нас', 'О компании', 'Возможности', 'Связаться с нами'];

export default function LoginScreen({ onLoggedIn, onRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    try {
      const user = await authStorage.login(email, password, rememberMe);
      onLoggedIn(user);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    }
  };

  const socialNotice = () => Alert.alert('Social login', 'Social login will be connected later.');

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webScreen}>
        <WebHeader onRegister={onRegister} />
        <ScrollView contentContainerStyle={styles.webContent} showsVerticalScrollIndicator={false}>
          <View style={styles.webMarketing}>
            <View style={styles.webLeft}>
              <Text style={styles.webBadge}>♛ ПРЕМИУМ ДОСТУП FIXORA</Text>
              <Text style={styles.webTitle}>
                Найдите надежных{'\n'}
                <Text style={styles.webAccent}>профессионалов</Text>{'\n'}
                мгновенно
              </Text>
              <Text style={styles.webSubtitle}>
                Fixora соединяет клиентов и профессионалов. Быстрый поиск, проверенные специалисты, надежные услуги.
              </Text>

              <View style={styles.featureList}>
                {[
                  ['⚡', 'Быстрый поиск', 'Находите нужных специалистов за считанные секунды'],
                  ['◆', 'Проверенные профессионалы', 'Все специалисты проходят проверку и верификацию'],
                  ['☏', 'Поддержка 24/7', 'Мы всегда готовы помочь вам в любое время'],
                ].map(([icon, title, text]) => (
                  <View key={title} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureIconText}>{icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.featureTitle}>{title}</Text>
                      <Text style={styles.featureText}>{text}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.storeRow}>
                <StoreButton small="GET IT ON" title="Google Play" />
                <StoreButton small="Download on the" title="App Store" />
              </View>
            </View>

            <View style={styles.webPhoneArea}>
              <PhoneMockup front />
              <PhoneMockup />
            </View>

            <View style={styles.loginCard}>
              <Text style={styles.webCardTitle}>Добро пожаловать обратно!</Text>
              <Text style={styles.webCardSubtitle}>Войдите в свой аккаунт и продолжите работу</Text>

              <Input label="Email" value={email} onChangeText={setEmail} placeholder="Введите ваш email" keyboardType="email-address" web />
              <Input label="Пароль" value={password} onChangeText={setPassword} placeholder="Введите ваш пароль" secureTextEntry web />

              <View style={styles.webOptionsRow}>
                <Pressable accessibilityRole="checkbox" onPress={() => setRememberMe((current) => !current)} style={styles.webRemember}>
                  <View style={[styles.webCheckbox, rememberMe && styles.webCheckboxOn]}>{rememberMe ? <Text style={styles.webCheckboxMark}>✓</Text> : null}</View>
                  <Text style={styles.webRememberText}>Запомнить меня</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => Alert.alert('Forgot password', 'Password recovery will be connected later.')}>
                  <Text style={styles.webForgot}>Забыли пароль?</Text>
                </Pressable>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable accessibilityRole="button" onPress={submit} style={styles.webSignInButton}>
                <Text style={styles.webSignInText}>↳  Войти</Text>
              </Pressable>

              <Divider label="или войдите через" />
              <View style={styles.webSocialRow}>
                {['Google', 'Facebook', 'Яндекс', 'Apple'].map((item) => (
                  <Pressable key={item} accessibilityRole="button" onPress={socialNotice} style={styles.webSocialButton}>
                    <Text style={[styles.webSocialMark, item === 'Яндекс' && styles.yandexMark]}>{item[0]}</Text>
                    <Text style={styles.webSocialText}>{item}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable accessibilityRole="button" onPress={onRegister} style={styles.webSwitchButton}>
                <Text style={styles.webSwitchText}>Нет аккаунта?  <Text style={styles.webSwitchLink}>Зарегистрироваться</Text></Text>
              </Pressable>
            </View>
          </View>

          <LinearGradient colors={['#8B5CF6', '#3D4CF4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.webStatsBar}>
            {[
              ['☻', '5000+', 'Профессионалов'],
              ['☺', '50K+', 'Довольных клиентов'],
              ['▤', '100K+', 'Выполненных заказов'],
              ['✓', '100%', 'Проверенные специалисты'],
            ].map(([icon, value, label]) => (
              <View key={value} style={styles.webStatsItem}>
                <Text style={styles.webStatsIcon}>{icon}</Text>
                <View>
                  <Text style={styles.webStatsValue}>{value}</Text>
                  <Text style={styles.webStatsLabel}>{label}</Text>
                </View>
              </View>
            ))}
          </LinearGradient>
        </ScrollView>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8FBFF', '#F5F1FF']} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <FixoraLogo size={76} wordmark />
          <Text style={styles.slogan}>Find trusted professionals instantly.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Login with the account you registered on this device.</Text>

          <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter Email" keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Enter Password" secureTextEntry />

          <View style={styles.optionsRow}>
            <Pressable accessibilityRole="checkbox" onPress={() => setRememberMe((current) => !current)} style={styles.remember}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>{rememberMe ? <Text style={styles.checkboxMark}>✓</Text> : null}</View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => Alert.alert('Forgot password', 'Password recovery will be connected later.')}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" onPress={submit} style={styles.signInButton}>
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Sign in with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            {['G', 'Y', Platform.OS === 'ios' ? 'A' : null, 'f'].filter(Boolean).map((item) => (
              <Pressable key={String(item)} accessibilityRole="button" onPress={socialNotice} style={styles.socialButton}>
                <Text style={styles.socialText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable accessibilityRole="button" onPress={onRegister} style={styles.switchButton}>
            <Text style={styles.switchText}>Don't have an account? Sign up</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

function WebHeader({ onRegister }: { onRegister: () => void }) {
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
        <View style={styles.webLoginButton}>
          <Text style={styles.webLoginText}>Войти</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onRegister} style={styles.webRegisterButton}>
          <Text style={styles.webRegisterText}>☻  Регистрация</Text>
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
    <View style={[styles.webPhone, front ? styles.webPhoneFront : styles.webPhoneBack]}>
      <View style={styles.phoneNotch} />
      <Text style={styles.phoneLogo}>Fixora</Text>
      <View style={styles.phoneSearch} />
      <LinearGradient colors={['#6F45E8', '#8878FF']} style={styles.phoneBanner}>
        <Text style={styles.phoneBannerText}>Найдите идеальную услугу для себя</Text>
      </LinearGradient>
      <View style={styles.phoneTiles}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.phoneTile} />
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

function Divider({ label }: { label: string }) {
  return (
    <View style={styles.webDividerRow}>
      <View style={styles.webDivider} />
      <Text style={styles.webDividerText}>{label}</Text>
      <View style={styles.webDivider} />
    </View>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  web?: boolean;
}) {
  return (
    <View style={props.web ? styles.webInputWrap : styles.inputWrap}>
      <Text style={props.web ? styles.webLabel : styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#9AA6B8"
        keyboardType={props.keyboardType}
        secureTextEntry={props.secureTextEntry}
        autoCapitalize="none"
        style={props.web ? styles.webInput : styles.input}
      />
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
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF7',
  },
  webNav: { flexDirection: 'row', alignItems: 'center', gap: 34 },
  webNavItem: { minHeight: 44, justifyContent: 'center' },
  webNavText: { color: '#09183F', fontSize: 15, fontWeight: '800' },
  webHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  webLoginButton: { minHeight: 48, paddingHorizontal: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#7857EF' },
  webLoginText: { color: '#09183F', fontSize: 15, fontWeight: '900' },
  webRegisterButton: { minHeight: 48, paddingHorizontal: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6E45E8' },
  webRegisterText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  webContent: { minHeight: '100%', paddingTop: 34 },
  webMarketing: { paddingHorizontal: 78, minHeight: 760, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 44 },
  webLeft: { flex: 1, maxWidth: 520 },
  webBadge: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 11, overflow: 'hidden', color: '#5B46E8', backgroundColor: '#EEE9FF', fontSize: 14, fontWeight: '900' },
  webTitle: { marginTop: 26, color: '#07153C', fontSize: 50, lineHeight: 62, fontWeight: '900' },
  webAccent: { color: '#7454EA' },
  webSubtitle: { marginTop: 20, maxWidth: 470, color: '#5B6680', fontSize: 18, lineHeight: 30, fontWeight: '600' },
  featureList: { marginTop: 30, gap: 22 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  featureIcon: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFEAFF' },
  featureIconText: { color: '#6F45E8', fontSize: 22, fontWeight: '900' },
  featureTitle: { color: '#07153C', fontSize: 17, fontWeight: '900' },
  featureText: { marginTop: 5, maxWidth: 340, color: '#63708A', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  storeRow: { marginTop: 32, flexDirection: 'row', gap: 18 },
  storeButton: { minWidth: 172, minHeight: 54, paddingHorizontal: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#050505' },
  storeIcon: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  storeSmall: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  storeTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  webPhoneArea: { flex: 1, minHeight: 560, alignItems: 'center', justifyContent: 'center' },
  webPhone: { position: 'absolute', width: 220, height: 430, padding: 15, borderRadius: 34, backgroundColor: '#FFFFFF', borderWidth: 7, borderColor: '#111827', shadowColor: '#4C1D95', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 20 } },
  webPhoneFront: { transform: [{ rotate: '-3deg' }], left: 80, top: 56, zIndex: 2 },
  webPhoneBack: { transform: [{ rotate: '8deg' }], right: 62, top: 88 },
  phoneNotch: { alignSelf: 'center', width: 76, height: 16, borderRadius: 10, backgroundColor: '#111827', marginTop: -11 },
  phoneLogo: { marginTop: 16, color: '#07153C', fontSize: 16, fontWeight: '900' },
  phoneSearch: { marginTop: 14, height: 34, borderRadius: 11, backgroundColor: '#F2F5FB' },
  phoneBanner: { marginTop: 12, height: 80, borderRadius: 15, padding: 12 },
  phoneBannerText: { color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '900' },
  phoneTiles: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  phoneTile: { width: 38, height: 44, borderRadius: 13, backgroundColor: '#F0EDFF' },
  phoneCard: { marginTop: 18, padding: 11, borderRadius: 14, flexDirection: 'row', gap: 10, backgroundColor: '#F8FAFF' },
  phoneAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#C7D2FE' },
  phoneLines: { flex: 1, justifyContent: 'center', gap: 7 },
  phoneLineWide: { width: '90%', height: 8, borderRadius: 5, backgroundColor: '#D9E0EF' },
  phoneLineShort: { width: '60%', height: 8, borderRadius: 5, backgroundColor: '#E7ECF6' },
  loginCard: { width: 560, padding: 44, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6ECF6', shadowColor: '#69779E', shadowOpacity: 0.13, shadowRadius: 28, shadowOffset: { width: 0, height: 18 } },
  webCardTitle: { color: '#07153C', fontSize: 30, fontWeight: '900', textAlign: 'center' },
  webCardSubtitle: { marginTop: 14, color: '#68748D', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  webInputWrap: { marginTop: 28 },
  webLabel: { marginBottom: 10, color: '#07153C', fontSize: 15, fontWeight: '900' },
  webInput: { minHeight: 58, paddingHorizontal: 18, borderRadius: 9, borderWidth: 1, borderColor: '#CCD6E8', color: '#07153C', backgroundColor: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  webOptionsRow: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  webRemember: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  webCheckbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: '#AAB6CC', alignItems: 'center', justifyContent: 'center' },
  webCheckboxOn: { backgroundColor: '#6F45E8', borderColor: '#6F45E8' },
  webCheckboxMark: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  webRememberText: { color: '#5E6982', fontSize: 16, fontWeight: '700' },
  webForgot: { color: '#4F35E8', fontSize: 16, fontWeight: '900' },
  webSignInButton: { marginTop: 30, minHeight: 62, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6742E6' },
  webSignInText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  webDividerRow: { marginTop: 36, flexDirection: 'row', alignItems: 'center', gap: 18 },
  webDivider: { flex: 1, height: 1, backgroundColor: '#DDE4EF' },
  webDividerText: { color: '#7B8498', fontSize: 14, fontWeight: '800' },
  webSocialRow: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  webSocialButton: { flex: 1, minWidth: 140, minHeight: 56, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DAE2EF' },
  webSocialMark: { color: '#2563EB', fontSize: 22, fontWeight: '900' },
  yandexMark: { color: '#DC2626' },
  webSocialText: { color: '#07153C', fontSize: 15, fontWeight: '900' },
  webSwitchButton: { marginTop: 76, alignItems: 'center' },
  webSwitchText: { color: '#5B6680', fontSize: 16, fontWeight: '700' },
  webSwitchLink: { color: '#4F35E8', fontWeight: '900' },
  webStatsBar: { minHeight: 144, paddingHorizontal: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  webStatsItem: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  webStatsIcon: { color: '#FFFFFF', fontSize: 40, fontWeight: '900' },
  webStatsValue: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  webStatsLabel: { marginTop: 4, color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  screen: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 34, alignItems: 'center' },
  logo: { alignItems: 'center', marginBottom: 24 },
  slogan: { marginTop: 6, color: '#64748B', fontSize: 12, fontWeight: '700' },
  card: { width: '100%', maxWidth: 520, padding: 20, borderRadius: 26, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5ECF8', shadowColor: '#5B6CFF', shadowOpacity: 0.10, shadowRadius: 24, shadowOffset: { width: 0, height: 16 } },
  title: { color: '#09183F', fontSize: 34, lineHeight: 42, fontWeight: '900', textAlign: 'center' },
  subtitle: { marginTop: 8, color: '#64748B', fontSize: 14, lineHeight: 21, fontWeight: '700', textAlign: 'center' },
  inputWrap: { marginTop: 16 },
  label: { marginBottom: 7, color: '#334155', fontSize: 12, fontWeight: '900' },
  input: { minHeight: 52, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#DDE5F2', color: '#09183F', backgroundColor: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  optionsRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1, borderColor: '#B8C4D6', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#5B6CFF', borderColor: '#5B6CFF' },
  checkboxMark: { color: '#FFFFFF', fontWeight: '900' },
  rememberText: { color: '#64748B', fontSize: 13, fontWeight: '800' },
  forgot: { color: '#5B6CFF', fontSize: 13, fontWeight: '900' },
  error: { marginTop: 12, color: '#EF4444', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  signInButton: { marginTop: 18, minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4867DD' },
  signInText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  dividerRow: { marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: '#DDE5F2' },
  dividerText: { color: '#64748B', fontSize: 13, fontWeight: '800' },
  socialRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  socialButton: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  socialText: { color: '#09183F', fontSize: 20, fontWeight: '900' },
  switchButton: { marginTop: 18, alignItems: 'center' },
  switchText: { color: '#5B6CFF', fontWeight: '900' },
});
