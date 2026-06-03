import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';
import { RegistrationFieldConfig, useAdminConfig } from '../context/AdminConfigContext';
import { authStorage, RegisteredUser } from '../services/authStorage';
import { UserRole } from '../types/navigation';

type RegisterScreenProps = {
  onRegistered: (user: RegisteredUser) => void;
  onLogin: () => void;
};

const navItems = ['Главная', 'О нас', 'О компании', 'Возможности', 'Связаться с нами'];

const roleOptions: Array<{ value: UserRole; label: string; note: string; icon: string }> = [
  { value: 'client', label: 'Клиент', note: 'Ищу специалиста для решения задач', icon: '☻' },
  { value: 'master', label: 'Мастер', note: 'Предоставляю профессиональные услуги', icon: '◆' },
  { value: 'company', label: 'Компания', note: 'Представляю компанию и ее услуги', icon: '▣' },
];

const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export default function RegisterScreen({ onRegistered, onLogin }: RegisterScreenProps) {
  const { state } = useAdminConfig();
  const [role, setRole] = useState<UserRole>('client');
  const [form, setForm] = useState<Record<string, string>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
    city: '',
  });
  const [dynamicValues, setDynamicValues] = useState<Record<string, string | boolean>>({});
  const [securityCode, setSecurityCode] = useState(makeCode);
  const [securityInput, setSecurityInput] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  const fields = useMemo(
    () => [...(state.registrationFields?.[role] ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [role, state.registrationFields],
  );

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const validateBase = (keys: string[]) => {
    const missingBase = keys.find((key) => !form[key]?.trim());
    if (missingBase) {
      setError('Please complete all required fields.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const submitWeb = async () => {
    setError('');
    if (!validateBase(['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'country', 'city'])) {
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the terms.');
      return;
    }
    try {
      const user = await authStorage.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
        fields: { country: form.country, city: form.city, acceptedTerms },
      });
      onRegistered(user);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed.');
    }
  };

  const submit = async () => {
    setError('');
    if (!validateBase(['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'])) {
      return;
    }
    const missingDynamic = fields.find((field) => field.required && !String(dynamicValues[field.id] ?? '').trim());
    if (missingDynamic) {
      setError(`Please complete ${missingDynamic.label}.`);
      return;
    }
    if (securityInput.trim().toUpperCase() !== securityCode) {
      setError('Security code is incorrect.');
      return;
    }

    try {
      const user = await authStorage.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
        fields: dynamicValues,
      });
      onRegistered(user);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed.');
    }
  };

  const socialNotice = () => Alert.alert('Social registration', 'Social registration will be connected later.');

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webScreen}>
        <WebHeader onLogin={onLogin} />
        <ScrollView contentContainerStyle={styles.webContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.webLeft}>
            <Text style={styles.webMarketingTitle}>
              Создайте аккаунт{'\n'}
              <Text style={styles.webMarketingAccent}>и получите доступ</Text>{'\n'}
              к лучшим возможностям
            </Text>
            <Text style={styles.webMarketingText}>
              Присоединяйтесь к Fixora и находите лучших профессионалов для любых задач мгновенно и безопасно.
            </Text>
            <View style={styles.webPhoneStage}>
              <PhoneMockup front />
              <PhoneMockup />
            </View>
            <View style={styles.webBenefits}>
              {[
                ['⚡', 'Быстрая регистрация'],
                ['◆', 'Надежная защита'],
                ['⚙', 'Проверенные специалисты'],
              ].map(([icon, label]) => (
                <View key={label} style={styles.webBenefit}>
                  <View style={styles.webBenefitIcon}><Text style={styles.webBenefitIconText}>{icon}</Text></View>
                  <Text style={styles.webBenefitText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.webCard}>
            <Text style={styles.webCardTitle}>Регистрация</Text>
            <Text style={styles.webCardSubtitle}>Выберите тип аккаунта и заполните информацию</Text>

            <Text style={styles.webLabel}>Тип аккаунта</Text>
            <View style={styles.webRoleGrid}>
              {roleOptions.map((item) => (
                <Pressable key={item.value} accessibilityRole="button" onPress={() => setRole(item.value)} style={[styles.webRoleCard, role === item.value && styles.webRoleActive]}>
                  <View style={styles.webRoleIcon}><Text style={styles.webRoleIconText}>{item.icon}</Text></View>
                  <Text style={styles.webRoleTitle}>{item.label}</Text>
                  <Text style={styles.webRoleNote}>{item.note}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.webGrid}>
              <Input label="Имя" value={form.firstName} onChangeText={(value) => update('firstName', value)} placeholder="Введите ваше имя" web />
              <Input label="Фамилия" value={form.lastName} onChangeText={(value) => update('lastName', value)} placeholder="Введите вашу фамилию" web />
              <Input label="Email" value={form.email} onChangeText={(value) => update('email', value)} placeholder="example@mail.com" keyboardType="email-address" web />
              <Input label="Телефон" value={form.phone} onChangeText={(value) => update('phone', value)} placeholder="+7 (___) ___-__-__" keyboardType="phone-pad" web />
              <Input label="Пароль" value={form.password} onChangeText={(value) => update('password', value)} placeholder="Создайте пароль" secureTextEntry web />
              <Input label="Подтвердите пароль" value={form.confirmPassword} onChangeText={(value) => update('confirmPassword', value)} placeholder="Повторите пароль" secureTextEntry web />
              <Input label="Страна" value={form.country} onChangeText={(value) => update('country', value)} placeholder="Выберите страну" web />
              <Input label="Город" value={form.city} onChangeText={(value) => update('city', value)} placeholder="Выберите город" web />
            </View>

            <Pressable accessibilityRole="checkbox" onPress={() => setAcceptedTerms((current) => !current)} style={styles.webTermsRow}>
              <View style={[styles.webCheckbox, acceptedTerms && styles.webCheckboxOn]}>{acceptedTerms ? <Text style={styles.webCheckboxMark}>✓</Text> : null}</View>
              <Text style={styles.webTermsText}>Я согласен с <Text style={styles.webTermsLink}>Условиями использования</Text> и <Text style={styles.webTermsLink}>Политикой конфиденциальности</Text></Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable accessibilityRole="button" onPress={submitWeb} style={styles.webSubmitButton}>
              <Text style={styles.webSubmitText}>☻  Создать аккаунт</Text>
            </Pressable>

            <Text style={styles.webSocialLabel}>или зарегистрируйтесь через</Text>
            <View style={styles.webSocialRow}>
              {['Google', 'Facebook', 'Яндекс'].map((item) => (
                <Pressable key={item} accessibilityRole="button" onPress={socialNotice} style={styles.webSocialButton}>
                  <Text style={[styles.webSocialMark, item === 'Яндекс' && styles.yandexMark]}>{item[0]}</Text>
                  <Text style={styles.webSocialText}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" onPress={onLogin} style={styles.webSwitchButton}>
              <Text style={styles.webSwitchText}>Уже есть аккаунт?  <Text style={styles.webSwitchLink}>Войти</Text></Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8FBFF', '#F5F1FF']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <FixoraLogo size={70} wordmark />
          <Text style={styles.slogan}>Find trusted professionals instantly.</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Sign up once, then enter Fixora with real local mock authentication.</Text>

        <View style={styles.card}>
          <View style={styles.grid}>
            <Input label="First Name" value={form.firstName} onChangeText={(value) => update('firstName', value)} placeholder="First Name" />
            <Input label="Last Name" value={form.lastName} onChangeText={(value) => update('lastName', value)} placeholder="Last Name" />
            <Input label="Email" value={form.email} onChangeText={(value) => update('email', value)} placeholder="you@fixora.com" keyboardType="email-address" />
            <Input label="Phone Number" value={form.phone} onChangeText={(value) => update('phone', value)} placeholder="+374 00 000000" keyboardType="phone-pad" />
            <Input label="Password" value={form.password} onChangeText={(value) => update('password', value)} placeholder="Password" secureTextEntry />
            <Input label="Confirm Password" value={form.confirmPassword} onChangeText={(value) => update('confirmPassword', value)} placeholder="Confirm Password" secureTextEntry />
          </View>

          <Text style={styles.label}>Select your role</Text>
          <View style={styles.segment}>
            {roleOptions.map((item) => (
              <Pressable key={item.value} accessibilityRole="button" onPress={() => setRole(item.value)} style={[styles.segmentItem, role === item.value && styles.segmentActive]}>
                <Text style={[styles.segmentText, role === item.value && styles.segmentTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.grid}>
            {fields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={dynamicValues[field.id]}
                onChange={(value) => setDynamicValues((current) => ({ ...current, [field.id]: value }))}
              />
            ))}
          </View>

          <View style={styles.securityRow}>
            <View>
              <Text style={styles.label}>Security code</Text>
              <Text style={styles.code}>{securityCode}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => { setSecurityCode(makeCode()); setSecurityInput(''); }} style={styles.refreshButton}>
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>
          <Input label="Enter security code" value={securityInput} onChangeText={setSecurityInput} placeholder="ABC123" autoCapitalize="characters" />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" onPress={submit} style={styles.submitButton}>
            <Text style={styles.submitText}>Create Account</Text>
          </Pressable>

          <View style={styles.socialRow}>
            {['G', 'Y', Platform.OS === 'ios' ? 'A' : null, 'f'].filter(Boolean).map((item) => (
              <Pressable key={String(item)} accessibilityRole="button" onPress={socialNotice} style={styles.socialButton}>
                <Text style={styles.socialText}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={onLogin} style={styles.switchButton}>
            <Text style={styles.switchText}>Already have an account? Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function WebHeader({ onLogin }: { onLogin: () => void }) {
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
          <Text style={styles.webLoginText}>Войти</Text>
        </Pressable>
        <View style={styles.webRegisterButton}>
          <Text style={styles.webRegisterText}>☻  Регистрация</Text>
        </View>
      </View>
    </View>
  );
}

function PhoneMockup({ front = false }: { front?: boolean }) {
  return (
    <View style={[styles.webPhone, front ? styles.webPhoneFront : styles.webPhoneBack]}>
      <View style={styles.phoneNotch} />
      <Text style={styles.phoneLogo}>Fixora</Text>
      <View style={styles.phoneSearch} />
      <LinearGradient colors={['#6F45E8', '#8878FF']} style={styles.phoneBanner}>
        <Text style={styles.phoneBannerText}>Найдите специалиста за минуты</Text>
      </LinearGradient>
      <View style={styles.phoneTiles}>
        {[0, 1, 2, 3].map((item) => <View key={item} style={styles.phoneTile} />)}
      </View>
    </View>
  );
}

function DynamicField({ field, value, onChange }: { field: RegistrationFieldConfig; value: string | boolean | undefined; onChange: (value: string | boolean) => void }) {
  if (field.type === 'checkbox') {
    return (
      <Pressable accessibilityRole="checkbox" onPress={() => onChange(!value)} style={styles.checkboxRow}>
        <View style={[styles.checkbox, value && styles.checkboxOn]}>{value ? <Text style={styles.checkboxMark}>✓</Text> : null}</View>
        <Text style={styles.checkboxLabel}>{field.label}{field.required ? ' *' : ''}</Text>
      </Pressable>
    );
  }

  if (field.type === 'select') {
    return (
      <View style={styles.inputWrap}>
        <Text style={styles.label}>{field.label}{field.required ? ' *' : ''}</Text>
        <View style={styles.optionRow}>
          {(field.options?.length ? field.options : ['Option']).map((option) => (
            <Pressable key={option} onPress={() => onChange(option)} style={[styles.optionPill, value === option && styles.optionActive]}>
              <Text style={[styles.optionText, value === option && styles.optionTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Input
      label={`${field.label}${field.required ? ' *' : ''}`}
      value={String(value ?? '')}
      onChangeText={onChange}
      placeholder={field.placeholder}
      keyboardType={field.type === 'email' ? 'email-address' : field.type === 'phone' ? 'phone-pad' : field.type === 'number' ? 'numeric' : 'default'}
      secureTextEntry={field.type === 'password'}
    />
  );
}

function Input(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  web?: boolean;
}) {
  return (
    <View style={props.web ? styles.webInputWrap : styles.inputWrap}>
      <Text style={props.web ? styles.webInputLabel : styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
        secureTextEntry={props.secureTextEntry}
        autoCapitalize={props.autoCapitalize ?? 'none'}
        placeholderTextColor="#9AA6B8"
        style={props.web ? styles.webInput : styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webScreen: { flex: 1, backgroundColor: '#F8FAFF' },
  webHeader: { minHeight: 92, paddingHorizontal: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.96)', borderBottomWidth: 1, borderBottomColor: '#E8EDF7' },
  webNav: { flexDirection: 'row', alignItems: 'center', gap: 34 },
  webNavItem: { minHeight: 44, justifyContent: 'center' },
  webNavText: { color: '#09183F', fontSize: 15, fontWeight: '800' },
  webHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  webLoginButton: { minHeight: 48, paddingHorizontal: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C9D3E6' },
  webLoginText: { color: '#09183F', fontSize: 15, fontWeight: '900' },
  webRegisterButton: { minHeight: 48, paddingHorizontal: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6E45E8' },
  webRegisterText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  webContent: { minHeight: '100%', paddingHorizontal: 88, paddingTop: 34, paddingBottom: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 76 },
  webLeft: { flex: 1, maxWidth: 570 },
  webMarketingTitle: { color: '#07153C', fontSize: 42, lineHeight: 54, fontWeight: '900' },
  webMarketingAccent: { color: '#7454EA' },
  webMarketingText: { marginTop: 20, maxWidth: 430, color: '#66718A', fontSize: 17, lineHeight: 28, fontWeight: '600' },
  webPhoneStage: { height: 390, marginTop: 22 },
  webPhone: { position: 'absolute', width: 190, height: 360, padding: 14, borderRadius: 30, backgroundColor: '#FFFFFF', borderWidth: 7, borderColor: '#111827', shadowColor: '#4C1D95', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 20 } },
  webPhoneFront: { transform: [{ rotate: '-7deg' }], left: 130, top: 8, zIndex: 2 },
  webPhoneBack: { transform: [{ rotate: '8deg' }], left: 300, top: 28 },
  phoneNotch: { alignSelf: 'center', width: 70, height: 15, borderRadius: 10, backgroundColor: '#111827', marginTop: -10 },
  phoneLogo: { marginTop: 14, color: '#07153C', fontSize: 15, fontWeight: '900' },
  phoneSearch: { marginTop: 13, height: 32, borderRadius: 10, backgroundColor: '#F2F5FB' },
  phoneBanner: { marginTop: 12, height: 78, borderRadius: 14, padding: 12 },
  phoneBannerText: { color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '900' },
  phoneTiles: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  phoneTile: { width: 34, height: 42, borderRadius: 12, backgroundColor: '#F0EDFF' },
  webBenefits: { maxWidth: 560, padding: 24, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6ECF6', shadowColor: '#69779E', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 14 } },
  webBenefit: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  webBenefitIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0ECFF' },
  webBenefitIconText: { color: '#6F45E8', fontSize: 20, fontWeight: '900' },
  webBenefitText: { flex: 1, color: '#07153C', fontSize: 14, lineHeight: 20, fontWeight: '900' },
  webCard: { width: 660, padding: 34, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6ECF6', shadowColor: '#69779E', shadowOpacity: 0.13, shadowRadius: 28, shadowOffset: { width: 0, height: 18 } },
  webCardTitle: { color: '#07153C', fontSize: 31, fontWeight: '900', textAlign: 'center' },
  webCardSubtitle: { marginTop: 10, marginBottom: 30, color: '#68748D', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  webLabel: { marginBottom: 12, color: '#07153C', fontSize: 14, fontWeight: '900' },
  webRoleGrid: { flexDirection: 'row', gap: 12 },
  webRoleCard: { flex: 1, minHeight: 150, padding: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5F2' },
  webRoleActive: { borderColor: '#6F45E8', backgroundColor: '#FBFAFF' },
  webRoleIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1ECFF' },
  webRoleIconText: { color: '#6F45E8', fontSize: 22, fontWeight: '900' },
  webRoleTitle: { marginTop: 14, color: '#07153C', fontSize: 16, fontWeight: '900' },
  webRoleNote: { marginTop: 10, color: '#78839A', fontSize: 13, lineHeight: 18, fontWeight: '700', textAlign: 'center' },
  webGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  webInputWrap: { flexGrow: 1, flexBasis: 280 },
  webInputLabel: { marginBottom: 8, color: '#5C6680', fontSize: 14, fontWeight: '800' },
  webInput: { minHeight: 48, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#D7E0EF', color: '#07153C', backgroundColor: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  webTermsRow: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  webCheckbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#C5D0E2', alignItems: 'center', justifyContent: 'center' },
  webCheckboxOn: { backgroundColor: '#6F45E8', borderColor: '#6F45E8' },
  webCheckboxMark: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  webTermsText: { flex: 1, color: '#5E6982', fontSize: 14, fontWeight: '700' },
  webTermsLink: { color: '#4F35E8', fontWeight: '900' },
  webSubmitButton: { marginTop: 20, minHeight: 54, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6F45E8' },
  webSubmitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  webSocialLabel: { marginTop: 24, color: '#7B8498', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  webSocialRow: { marginTop: 16, flexDirection: 'row', gap: 12 },
  webSocialButton: { flex: 1, minHeight: 50, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DAE2EF' },
  webSocialMark: { color: '#2563EB', fontSize: 22, fontWeight: '900' },
  yandexMark: { color: '#DC2626' },
  webSocialText: { color: '#07153C', fontSize: 14, fontWeight: '900' },
  webSwitchButton: { marginTop: 24, alignItems: 'center' },
  webSwitchText: { color: '#5B6680', fontSize: 14, fontWeight: '700' },
  webSwitchLink: { color: '#4F35E8', fontWeight: '900' },
  screen: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 42, paddingBottom: 32, alignItems: 'center' },
  logo: { alignItems: 'center', marginBottom: 22 },
  slogan: { marginTop: 6, color: '#64748B', fontSize: 12, fontWeight: '700' },
  title: { color: '#09183F', fontSize: 34, lineHeight: 42, fontWeight: '900', textAlign: 'center' },
  subtitle: { marginTop: 8, maxWidth: 520, color: '#64748B', fontSize: 15, lineHeight: 22, fontWeight: '700', textAlign: 'center' },
  card: { marginTop: 24, width: '100%', maxWidth: 760, padding: 18, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5ECF8', shadowColor: '#5B6CFF', shadowOpacity: 0.10, shadowRadius: 24, shadowOffset: { width: 0, height: 16 } },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inputWrap: { flexGrow: 1, flexBasis: 260, marginTop: 12 },
  label: { marginBottom: 7, color: '#334155', fontSize: 12, fontWeight: '900' },
  input: { minHeight: 50, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: '#DDE5F2', color: '#09183F', backgroundColor: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  segment: { flexDirection: 'row', gap: 8, padding: 4, borderRadius: 18, backgroundColor: '#F2F5FB' },
  segmentItem: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: '#5B6CFF' },
  segmentText: { color: '#64748B', fontSize: 13, fontWeight: '900' },
  segmentTextActive: { color: '#FFFFFF' },
  checkboxRow: { flexGrow: 1, flexBasis: 260, minHeight: 50, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1, borderColor: '#B8C4D6', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  checkboxOn: { backgroundColor: '#5B6CFF', borderColor: '#5B6CFF' },
  checkboxMark: { color: '#FFFFFF', fontWeight: '900' },
  checkboxLabel: { flex: 1, color: '#334155', fontSize: 13, fontWeight: '800' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionPill: { minHeight: 38, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  optionActive: { backgroundColor: '#EEF2FF', borderColor: '#5B6CFF' },
  optionText: { color: '#64748B', fontWeight: '800' },
  optionTextActive: { color: '#4F46E5' },
  securityRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  code: { color: '#09183F', fontSize: 24, letterSpacing: 3, fontWeight: '900' },
  refreshButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF' },
  refreshText: { color: '#5B6CFF', fontWeight: '900' },
  error: { marginTop: 12, color: '#EF4444', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  submitButton: { marginTop: 18, minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5B6CFF' },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  socialRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  socialButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  socialText: { color: '#09183F', fontSize: 20, fontWeight: '900' },
  switchButton: { marginTop: 14, alignItems: 'center' },
  switchText: { color: '#5B6CFF', fontWeight: '900' },
});
