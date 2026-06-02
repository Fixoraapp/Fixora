import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInputProps,
  View,
} from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { TextField } from '../components/TextField';
import { colors, typography } from '../constants/theme';
import { useLocationContext } from '../context/LocationContext';
import { useTranslation } from '../i18n/I18nProvider';
import { authService } from '../services/authService';
import { AuthMethod, UserRole } from '../types/navigation';

type ClientAuthScreen =
  | 'ClientWelcomeAuthScreen'
  | 'ClientRegisterScreen'
  | 'ClientLoginScreen'
  | 'ClientOtpScreen'
  | 'ClientForgotPasswordScreen';

type MasterAuthScreen =
  | 'MasterWelcomeAuthScreen'
  | 'MasterRegisterScreen'
  | 'MasterLoginScreen'
  | 'MasterOtpScreen'
  | 'MasterForgotPasswordScreen'
  | 'MasterProfileSetupScreen';

type AuthScreenName = ClientAuthScreen | MasterAuthScreen;
type LoginMethod = 'phone' | 'email';
type FormErrors<T extends string> = Partial<Record<T, string>>;

type ClientRegisterField = 'fullName' | 'phone' | 'email' | 'password' | 'confirmPassword';
type ClientLoginField = 'identifier' | 'password';
type ForgotField = 'identifier';
type OtpField = 'code';
type MasterRegisterField =
  | 'fullName'
  | 'profession'
  | 'serviceCategory'
  | 'phone'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'city';
type MasterProfileField =
  | 'profilePhoto'
  | 'profession'
  | 'experience'
  | 'about'
  | 'serviceCategories'
  | 'languages'
  | 'workLocation'
  | 'portfolio'
  | 'priceRange'
  | 'availability';

type MockUser = {
  role: UserRole;
  authMethod: AuthMethod;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  profileComplete?: boolean;
};

type AuthScreenProps = {
  role: UserRole;
  onAuthenticated: () => void;
};

const clientInitial: Record<ClientRegisterField, string> = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const clientLoginInitial: Record<ClientLoginField, string> = {
  identifier: '',
  password: '',
};

const masterInitial: Record<MasterRegisterField, string> = {
  fullName: '',
  profession: '',
  serviceCategory: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  city: '',
};

const profileInitial: Record<MasterProfileField, string> = {
  profilePhoto: '',
  profession: '',
  experience: '',
  about: '',
  serviceCategories: '',
  languages: '',
  workLocation: '',
  portfolio: '',
  priceRange: '',
  availability: '',
};

export default function AuthScreen({ role, onAuthenticated }: AuthScreenProps) {
  const { t } = useTranslation();
  const { selectedLocation } = useLocationContext();
  const [screen, setScreen] = useState<AuthScreenName>(
    role === 'client' ? 'ClientWelcomeAuthScreen' : 'MasterWelcomeAuthScreen',
  );
  const [clientRegister, setClientRegister] = useState(clientInitial);
  const [clientLogin, setClientLogin] = useState(clientLoginInitial);
  const [masterRegister, setMasterRegister] = useState({
    ...masterInitial,
    city: selectedLocation.city,
  });
  const [masterProfile, setMasterProfile] = useState({
    ...profileInitial,
    workLocation: selectedLocation.city,
  });
  const [forgot, setForgot] = useState<Record<ForgotField, string>>({ identifier: '' });
  const [otp, setOtp] = useState<Record<OtpField, string>>({ code: '' });
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const appear = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, screen]);

  useEffect(() => {
    setMasterRegister((current) => ({ ...current, city: selectedLocation.city }));
    setMasterProfile((current) => ({ ...current, workLocation: selectedLocation.city }));
  }, [selectedLocation.city]);

  const animatedStyle = {
    opacity: appear,
    transform: [
      {
        translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
      },
    ],
  };

  const goTo = (nextScreen: AuthScreenName) => {
    setErrors({});
    setScreen(nextScreen);
  };

  const runAuth = async (task: () => Promise<void>) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await task();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t('errors.authFailed', 'Authentication failed.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const completeAuth = (user: MockUser) => {
    setMockUser(user);
    onAuthenticated();
  };

  const submitClientRegister = () => void runAuth(async () => {
    const nextErrors = validateRequired<ClientRegisterField>(clientRegister, [
      'fullName',
      'phone',
      'email',
      'password',
      'confirmPassword',
    ], t('errors.required', 'This field is required.'));

    if (clientRegister.password && clientRegister.confirmPassword && clientRegister.password !== clientRegister.confirmPassword) {
      nextErrors.confirmPassword = t('errors.passwordMismatch', 'Passwords do not match.');
    }

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    await authService.signUpWithEmail({
      role: 'client',
      authMethod: 'email',
      fullName: clientRegister.fullName,
      email: clientRegister.email,
      phone: clientRegister.phone,
      password: clientRegister.password,
      city: selectedLocation.city,
    });
    setMockUser({
      role: 'client',
      authMethod: 'phone',
      name: clientRegister.fullName,
      email: clientRegister.email,
      phone: clientRegister.phone,
    });
    setOtp({ code: '' });
    goTo('ClientOtpScreen');
  });

  const submitClientLogin = () => void runAuth(async () => {
    const requiredFields: ClientLoginField[] = loginMethod === 'phone' ? ['identifier'] : ['identifier', 'password'];
    const nextErrors = validateRequired<ClientLoginField>(clientLogin, requiredFields, t('errors.required', 'This field is required.'));

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    if (loginMethod === 'phone') {
      await authService.signInWithPhone(clientLogin.identifier);
      setMockUser({ role: 'client', authMethod: 'phone', phone: clientLogin.identifier });
      setOtp({ code: '' });
      goTo('ClientOtpScreen');
      return;
    }

    await authService.signInWithEmail(clientLogin.identifier, clientLogin.password);
    completeAuth({ role: 'client', authMethod: 'email', email: clientLogin.identifier });
  });

  const submitMasterRegister = () => void runAuth(async () => {
    const nextErrors = validateRequired<MasterRegisterField>(masterRegister, [
      'fullName',
      'profession',
      'serviceCategory',
      'phone',
      'email',
      'password',
      'confirmPassword',
      'city',
    ], t('errors.required', 'This field is required.'));

    if (masterRegister.password && masterRegister.confirmPassword && masterRegister.password !== masterRegister.confirmPassword) {
      nextErrors.confirmPassword = t('errors.passwordMismatch', 'Passwords do not match.');
    }

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    await authService.signUpWithEmail({
      role: 'master',
      authMethod: 'email',
      fullName: masterRegister.fullName,
      email: masterRegister.email,
      phone: masterRegister.phone,
      password: masterRegister.password,
      city: masterRegister.city,
      profession: masterRegister.profession,
      serviceCategory: masterRegister.serviceCategory,
    });
    setMockUser({
      role: 'master',
      authMethod: 'phone',
      name: masterRegister.fullName,
      email: masterRegister.email,
      phone: masterRegister.phone,
      city: masterRegister.city,
    });
    goTo('MasterProfileSetupScreen');
  });

  const submitMasterLogin = () => void runAuth(async () => {
    const requiredFields: ClientLoginField[] = loginMethod === 'phone' ? ['identifier'] : ['identifier', 'password'];
    const nextErrors = validateRequired<ClientLoginField>(clientLogin, requiredFields, t('errors.required', 'This field is required.'));

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    if (loginMethod === 'phone') {
      await authService.signInWithPhone(clientLogin.identifier);
      setMockUser({ role: 'master', authMethod: 'phone', phone: clientLogin.identifier, city: selectedLocation.city });
      setOtp({ code: '' });
      goTo('MasterOtpScreen');
      return;
    }

    await authService.signInWithEmail(clientLogin.identifier, clientLogin.password);
    setMockUser({ role: 'master', authMethod: 'email', email: clientLogin.identifier, city: selectedLocation.city });
    goTo('MasterProfileSetupScreen');
  });

  const submitForgot = () => {
    const nextErrors = validateRequired<ForgotField>(forgot, ['identifier'], t('errors.required', 'This field is required.'));

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setOtp({ code: '' });
    goTo(role === 'client' ? 'ClientOtpScreen' : 'MasterOtpScreen');
  };

  const submitOtp = () => void runAuth(async () => {
    const nextErrors = validateRequired<OtpField>(otp, ['code'], t('errors.required', 'This field is required.'));

    if (otp.code && otp.code.trim().length < 4) {
      nextErrors.code = 'Enter the OTP code.';
    }

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    const phone = mockUser?.phone || clientLogin.identifier;
    if (phone) {
      await authService.verifyPhoneOtp(phone, otp.code);
    }
    if (role === 'master') {
      goTo('MasterProfileSetupScreen');
      return;
    }

    completeAuth(mockUser ?? { role, authMethod: 'phone' });
  });

  const submitMasterProfile = () => {
    const nextErrors = validateRequired<MasterProfileField>(masterProfile, [
      'profession',
      'experience',
      'about',
      'serviceCategories',
      'languages',
      'workLocation',
      'priceRange',
      'availability',
    ], t('errors.required', 'This field is required.'));

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    completeAuth({
      ...(mockUser ?? { role: 'master', authMethod: 'email' }),
      profileComplete: true,
      city: masterProfile.workLocation,
    });
  };

  const continueGuest = () => completeAuth({ role: 'client', authMethod: 'guest', city: selectedLocation.city });
  const continueSocial = (method: Extract<AuthMethod, 'google' | 'apple'>) => void runAuth(async () => {
    await authService.signInWithOAuth(method);
    const nextUser: MockUser = {
      role,
      authMethod: method,
      name: method === 'google' ? 'Google User' : 'Apple User',
      city: selectedLocation.city,
    };

    if (role === 'master') {
      setMockUser(nextUser);
      goTo('MasterProfileSetupScreen');
      return;
    }

    completeAuth(nextUser);
  });

  const openPhoneLogin = () => {
    setLoginMethod('phone');
    goTo(role === 'client' ? 'ClientLoginScreen' : 'MasterLoginScreen');
  };

  const openEmailLogin = () => {
    setLoginMethod('email');
    goTo(role === 'client' ? 'ClientLoginScreen' : 'MasterLoginScreen');
  };

  const content = useMemo(() => {
    switch (screen) {
      case 'ClientWelcomeAuthScreen':
        return (
          <WelcomeAuthScreen
            roleLabel="Client"
            title="Welcome to Fixora"
            subtitle="Book trusted professionals, compare prices, chat, and pay securely."
            onRegister={() => goTo('ClientRegisterScreen')}
            onPhone={openPhoneLogin}
            onEmail={openEmailLogin}
            onGoogle={() => continueSocial('google')}
            onApple={() => continueSocial('apple')}
            onGuest={continueGuest}
          />
        );
      case 'ClientRegisterScreen':
        return (
          <ClientRegisterScreen
            values={clientRegister}
            errors={errors}
            onChange={(field, value) => setClientRegister((current) => ({ ...current, [field]: value }))}
            onSubmit={submitClientRegister}
            onLogin={() => goTo('ClientLoginScreen')}
            onSocial={continueSocial}
            onGuest={continueGuest}
            onBack={() => goTo('ClientWelcomeAuthScreen')}
          />
        );
      case 'ClientLoginScreen':
        return (
          <LoginScreen
            roleLabel="Client"
            method={loginMethod}
            values={clientLogin}
            errors={errors}
            onMethodChange={setLoginMethod}
            onChange={(field, value) => setClientLogin((current) => ({ ...current, [field]: value }))}
            onSubmit={submitClientLogin}
            onForgot={() => goTo('ClientForgotPasswordScreen')}
            onRegister={() => goTo('ClientRegisterScreen')}
            onBack={() => goTo('ClientWelcomeAuthScreen')}
          />
        );
      case 'ClientOtpScreen':
        return (
          <OtpScreen
            roleLabel="Client"
            value={otp.code}
            error={errors.code}
            onChange={(value) => setOtp({ code: value })}
            onVerify={submitOtp}
            onBack={() => goTo('ClientLoginScreen')}
          />
        );
      case 'ClientForgotPasswordScreen':
        return (
          <ForgotPasswordScreen
            value={forgot.identifier}
            error={errors.identifier}
            onChange={(value) => setForgot({ identifier: value })}
            onSubmit={submitForgot}
            onBack={() => goTo('ClientLoginScreen')}
          />
        );
      case 'MasterWelcomeAuthScreen':
        return (
          <WelcomeAuthScreen
            roleLabel="Master"
            title="Welcome, professional"
            subtitle="Register your services, receive local orders, and grow your income."
            onRegister={() => goTo('MasterRegisterScreen')}
            onPhone={openPhoneLogin}
            onEmail={openEmailLogin}
            onGoogle={() => continueSocial('google')}
            onApple={() => continueSocial('apple')}
          />
        );
      case 'MasterRegisterScreen':
        return (
          <MasterRegisterScreen
            values={masterRegister}
            errors={errors}
            onChange={(field, value) => setMasterRegister((current) => ({ ...current, [field]: value }))}
            onSubmit={submitMasterRegister}
            onLogin={() => goTo('MasterLoginScreen')}
            onBack={() => goTo('MasterWelcomeAuthScreen')}
          />
        );
      case 'MasterLoginScreen':
        return (
          <LoginScreen
            roleLabel="Master"
            method={loginMethod}
            values={clientLogin}
            errors={errors}
            onMethodChange={setLoginMethod}
            onChange={(field, value) => setClientLogin((current) => ({ ...current, [field]: value }))}
            onSubmit={submitMasterLogin}
            onForgot={() => goTo('MasterForgotPasswordScreen')}
            onRegister={() => goTo('MasterRegisterScreen')}
            onBack={() => goTo('MasterWelcomeAuthScreen')}
          />
        );
      case 'MasterOtpScreen':
        return (
          <OtpScreen
            roleLabel="Master"
            value={otp.code}
            error={errors.code}
            onChange={(value) => setOtp({ code: value })}
            onVerify={submitOtp}
            onBack={() => goTo('MasterLoginScreen')}
          />
        );
      case 'MasterForgotPasswordScreen':
        return (
          <ForgotPasswordScreen
            value={forgot.identifier}
            error={errors.identifier}
            onChange={(value) => setForgot({ identifier: value })}
            onSubmit={submitForgot}
            onBack={() => goTo('MasterLoginScreen')}
          />
        );
      case 'MasterProfileSetupScreen':
        return (
          <MasterProfileSetupScreen
            values={masterProfile}
            errors={errors}
            onChange={(field, value) => setMasterProfile((current) => ({ ...current, [field]: value }))}
            onSubmit={submitMasterProfile}
          />
        );
      default:
        return null;
    }
  }, [
    clientLogin,
    clientRegister,
    errors,
    forgot.identifier,
    loginMethod,
    masterProfile,
    masterRegister,
    mockUser,
    otp.code,
    role,
    screen,
    selectedLocation.city,
  ]);

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <FixoraLogo wordmark />
          </View>
          <Animated.View style={animatedStyle}>{content}</Animated.View>
          {authError ? <Text style={styles.authError}>{authError}</Text> : null}
          {authLoading ? <Text style={styles.authHint}>Connecting to Supabase...</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function WelcomeAuthScreen({
  roleLabel,
  title,
  subtitle,
  onRegister,
  onPhone,
  onEmail,
  onGoogle,
  onApple,
  onGuest,
}: {
  roleLabel: string;
  title: string;
  subtitle: string;
  onRegister: () => void;
  onPhone: () => void;
  onEmail: () => void;
  onGoogle: () => void;
  onApple: () => void;
  onGuest?: () => void;
}) {
  return (
    <>
      <AuthHeader kicker={`${roleLabel} Auth`} title={title} subtitle={subtitle} />
      <GlassCard style={styles.card}>
        <LinearGradient colors={['rgba(21,123,255,0.3)', 'rgba(168,85,247,0.18)']} style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{roleLabel.toUpperCase()}</Text>
        </LinearGradient>
        <GradientButton title="Create Account" onPress={onRegister} style={styles.submit} />
        <PremiumButton title="Continue with Phone" variant="secondary" onPress={onPhone} style={styles.buttonGap} />
        <PremiumButton title="Continue with Email" variant="secondary" onPress={onEmail} style={styles.buttonGap} />
        <PremiumButton title="Continue with Google" variant="secondary" onPress={onGoogle} style={styles.buttonGap} />
        {Platform.OS === 'ios' ? (
          <PremiumButton title="Continue with Apple" variant="secondary" onPress={onApple} style={styles.buttonGap} />
        ) : null}
        {onGuest ? <PremiumButton title="Continue as Guest" variant="ghost" onPress={onGuest} style={styles.buttonGap} /> : null}
      </GlassCard>
    </>
  );
}

function ClientRegisterScreen({
  values,
  errors,
  onChange,
  onSubmit,
  onLogin,
  onSocial,
  onGuest,
  onBack,
}: {
  values: Record<ClientRegisterField, string>;
  errors: Record<string, string>;
  onChange: (field: ClientRegisterField, value: string) => void;
  onSubmit: () => void;
  onLogin: () => void;
  onSocial: (method: Extract<AuthMethod, 'google' | 'apple'>) => void;
  onGuest: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <BackButton onBack={onBack} />
      <AuthHeader kicker="Client Registration" title="Create your client account" subtitle="Register with phone, email, social sign-in, or continue as guest." />
      <GlassCard style={styles.card}>
        <Input label="Full Name" value={values.fullName} error={errors.fullName} onChangeText={(value) => onChange('fullName', value)} placeholder="Ivan Ivanov" />
        <Input label="Phone Number" value={values.phone} error={errors.phone} onChangeText={(value) => onChange('phone', value)} placeholder="+1 999 123-45-67" keyboardType="phone-pad" />
        <Input label="Email" value={values.email} error={errors.email} onChangeText={(value) => onChange('email', value)} placeholder="ivan@example.com" keyboardType="email-address" />
        <Input label="Password" value={values.password} error={errors.password} onChangeText={(value) => onChange('password', value)} placeholder="Password" secureTextEntry />
        <Input label="Confirm Password" value={values.confirmPassword} error={errors.confirmPassword} onChangeText={(value) => onChange('confirmPassword', value)} placeholder="Confirm password" secureTextEntry />
        <GradientButton title="Register" onPress={onSubmit} style={styles.submit} />
        <View style={styles.socialRow}>
          <PremiumButton title="Continue with Google" variant="secondary" onPress={() => onSocial('google')} style={styles.socialButton} />
          {Platform.OS === 'ios' ? (
            <PremiumButton title="Continue with Apple" variant="secondary" onPress={() => onSocial('apple')} style={styles.socialButton} />
          ) : null}
        </View>
        <PremiumButton title="Continue as Guest" variant="ghost" onPress={onGuest} style={styles.buttonGap} />
        <FooterLink text="Already have an account?" action="Login" onPress={onLogin} />
      </GlassCard>
    </>
  );
}

function MasterRegisterScreen({
  values,
  errors,
  onChange,
  onSubmit,
  onLogin,
  onBack,
}: {
  values: Record<MasterRegisterField, string>;
  errors: Record<string, string>;
  onChange: (field: MasterRegisterField, value: string) => void;
  onSubmit: () => void;
  onLogin: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <BackButton onBack={onBack} />
      <AuthHeader kicker="Master Registration" title="Create your master account" subtitle="Build a trusted profile and start receiving nearby local orders." />
      <GlassCard style={styles.card}>
        <Input label="Full Name" value={values.fullName} error={errors.fullName} onChangeText={(value) => onChange('fullName', value)} placeholder="Alexei Petrov" />
        <Input label="Profession" value={values.profession} error={errors.profession} onChangeText={(value) => onChange('profession', value)} placeholder="Electrician" />
        <Input label="Service Category" value={values.serviceCategory} error={errors.serviceCategory} onChangeText={(value) => onChange('serviceCategory', value)} placeholder="Home repair" />
        <Input label="Phone Number" value={values.phone} error={errors.phone} onChangeText={(value) => onChange('phone', value)} placeholder="+7 999 765-43-21" keyboardType="phone-pad" />
        <Input label="Email" value={values.email} error={errors.email} onChangeText={(value) => onChange('email', value)} placeholder="petrov@example.com" keyboardType="email-address" />
        <Input label="Password" value={values.password} error={errors.password} onChangeText={(value) => onChange('password', value)} placeholder="Password" secureTextEntry />
        <Input label="Confirm Password" value={values.confirmPassword} error={errors.confirmPassword} onChangeText={(value) => onChange('confirmPassword', value)} placeholder="Confirm password" secureTextEntry />
        <Input label="City from selectedLocation" value={values.city} error={errors.city} onChangeText={(value) => onChange('city', value)} placeholder="Selected city" />
        <View style={styles.avatarUpload}>
          <LinearGradient colors={['rgba(21,123,255,0.28)', 'rgba(168,85,247,0.22)']} style={styles.avatarCircle}>
            <Text style={styles.avatarText}>PHOTO</Text>
          </LinearGradient>
          <View style={styles.flex}>
            <Text style={styles.uploadTitle}>Upload Avatar placeholder</Text>
            <Text style={styles.uploadBody}>Add a professional photo during profile setup.</Text>
          </View>
        </View>
        <GradientButton title="Continue" onPress={onSubmit} style={styles.submit} />
        <FooterLink text="Already have an account?" action="Login" onPress={onLogin} />
      </GlassCard>
    </>
  );
}

function LoginScreen({
  roleLabel,
  method,
  values,
  errors,
  onMethodChange,
  onChange,
  onSubmit,
  onForgot,
  onRegister,
  onBack,
}: {
  roleLabel: string;
  method: LoginMethod;
  values: Record<ClientLoginField, string>;
  errors: Record<string, string>;
  onMethodChange: (method: LoginMethod) => void;
  onChange: (field: ClientLoginField, value: string) => void;
  onSubmit: () => void;
  onForgot: () => void;
  onRegister: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <BackButton onBack={onBack} />
      <AuthHeader kicker={`${roleLabel} Login`} title="Welcome back" subtitle="Choose phone OTP or email password login." />
      <View style={styles.segment}>
        <PremiumButton title="Phone" variant={method === 'phone' ? 'primary' : 'secondary'} onPress={() => onMethodChange('phone')} style={styles.segmentButton} />
        <PremiumButton title="Email" variant={method === 'email' ? 'primary' : 'secondary'} onPress={() => onMethodChange('email')} style={styles.segmentButton} />
      </View>
      <GlassCard style={styles.card}>
        <Input
          label={method === 'phone' ? 'Phone Number' : 'Email'}
          value={values.identifier}
          error={errors.identifier}
          onChangeText={(value) => onChange('identifier', value)}
          placeholder={method === 'phone' ? '+1 999 123-45-67' : 'you@fixora.com'}
          keyboardType={method === 'phone' ? 'phone-pad' : 'email-address'}
        />
        {method === 'email' ? (
          <>
            <Input label="Password" value={values.password} error={errors.password} onChangeText={(value) => onChange('password', value)} placeholder="Password" secureTextEntry />
            <Pressable accessibilityRole="button" onPress={onForgot} style={styles.textAction}>
              <Text style={styles.textActionLabel}>Forgot password?</Text>
            </Pressable>
          </>
        ) : null}
        <GradientButton title={method === 'phone' ? 'Send OTP Code' : 'Login with Email'} onPress={onSubmit} style={styles.submit} />
        <FooterLink text="No account yet?" action="Register" onPress={onRegister} />
      </GlassCard>
    </>
  );
}

function OtpScreen({
  roleLabel,
  value,
  error,
  onChange,
  onVerify,
  onBack,
}: {
  roleLabel: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onVerify: () => void;
  onBack: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(45);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <>
      <BackButton onBack={onBack} />
      <AuthHeader kicker={`${roleLabel} OTP`} title="Enter code" subtitle="We sent a secure code to your phone or email." />
      <GlassCard style={styles.card}>
        <Input label="OTP code" value={value} error={error} onChangeText={onChange} placeholder="123456" keyboardType="phone-pad" />
        <Pressable
          accessibilityRole="button"
          disabled={secondsLeft > 0}
          onPress={() => {
            setSecondsLeft(45);
            onChange('');
          }}
          style={styles.resendButton}
        >
          <Text style={styles.resend}>
            {secondsLeft > 0 ? `Resend code in 00:${String(secondsLeft).padStart(2, '0')}` : 'Resend code'}
          </Text>
        </Pressable>
        <GradientButton title="Verify" onPress={onVerify} style={styles.submit} />
      </GlassCard>
    </>
  );
}

function ForgotPasswordScreen({
  value,
  error,
  onChange,
  onSubmit,
  onBack,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <BackButton onBack={onBack} />
      <AuthHeader kicker="Recovery" title="Forgot password" subtitle="Enter email or phone and Fixora will send a secure recovery code." />
      <GlassCard style={styles.card}>
        <Input label="Email or Phone" value={value} error={error} onChangeText={onChange} placeholder="ivan@example.com" />
        <GradientButton title="Send Code" onPress={onSubmit} style={styles.submit} />
      </GlassCard>
    </>
  );
}

function MasterProfileSetupScreen({
  values,
  errors,
  onChange,
  onSubmit,
}: {
  values: Record<MasterProfileField, string>;
  errors: Record<string, string>;
  onChange: (field: MasterProfileField, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <AuthHeader kicker="Master Profile Setup" title="Complete your profile" subtitle="Clients choose masters by trust, clarity, portfolio, and availability." />
      <GlassCard style={styles.card}>
        <View style={styles.profilePhoto}>
          <LinearGradient colors={['#157BFF', '#7C3AED']} style={styles.profilePhotoCircle}>
            <Text style={styles.avatarText}>PHOTO</Text>
          </LinearGradient>
          <Input label="Profile Photo placeholder" value={values.profilePhoto} error={errors.profilePhoto} onChangeText={(value) => onChange('profilePhoto', value)} placeholder="Photo will be uploaded later" />
        </View>
        <Input label="Profession" value={values.profession} error={errors.profession} onChangeText={(value) => onChange('profession', value)} placeholder="Electrician" />
        <Input label="Experience" value={values.experience} error={errors.experience} onChangeText={(value) => onChange('experience', value)} placeholder="5 years" />
        <Input label="About Me" value={values.about} error={errors.about} onChangeText={(value) => onChange('about', value)} placeholder="Describe your work and standards" multiline />
        <Input label="Service Categories" value={values.serviceCategories} error={errors.serviceCategories} onChangeText={(value) => onChange('serviceCategories', value)} placeholder="Electrical, repair, installation" />
        <Input label="Languages" value={values.languages} error={errors.languages} onChangeText={(value) => onChange('languages', value)} placeholder="English, Russian, Armenian" />
        <Input label="Work Location" value={values.workLocation} error={errors.workLocation} onChangeText={(value) => onChange('workLocation', value)} placeholder="Selected city" />
        <Input label="Portfolio placeholder" value={values.portfolio} error={errors.portfolio} onChangeText={(value) => onChange('portfolio', value)} placeholder="Portfolio will be added later" />
        <Input label="Price Range" value={values.priceRange} error={errors.priceRange} onChangeText={(value) => onChange('priceRange', value)} placeholder="$40 - $120 / hour" />
        <Input label="Availability" value={values.availability} error={errors.availability} onChangeText={(value) => onChange('availability', value)} placeholder="Mon-Sat, 09:00-18:00" />
        <GradientButton title="Complete Profile" onPress={onSubmit} style={styles.submit} />
      </GlassCard>
    </>
  );
}

function AuthHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{subtitle}</Text>
    </>
  );
}

function Input({
  label,
  value,
  error,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  multiline,
}: {
  label: string;
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  const focus = useRef(new Animated.Value(0)).current;
  const borderOpacity = focus.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.9] });

  const onFocus = () => {
    Animated.timing(focus, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    Animated.timing(focus, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Animated.View style={[styles.inputFrame, { borderColor: error ? '#FF5D7A' : '#157BFF', opacity: error ? 1 : borderOpacity }]}>
        <TextField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          onFocus={onFocus}
          onBlur={onBlur}
          style={[styles.fieldReset, multiline && styles.multilineInput]}
        />
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onBack} hitSlop={12} style={styles.backButton}>
      <Text style={styles.backText}>{'<'}</Text>
    </Pressable>
  );
}

function FooterLink({ text, action, onPress }: { text: string; action: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.footerLink}>
      <Text style={styles.footerLinkText}>{text} <Text style={styles.footerLinkAction}>{action}</Text></Text>
    </Pressable>
  );
}

function validateRequired<T extends string>(values: Record<T, string>, fields: T[], message = 'This field is required.'): FormErrors<T> {
  return fields.reduce<FormErrors<T>>((nextErrors, field) => {
    if (!values[field]?.trim()) {
      nextErrors[field] = message;
    }

    return nextErrors;
  }, {});
}

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 34,
  },
  brand: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  kicker: {
    color: colors.blue,
    fontSize: typography.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 8,
    color: colors.text,
    fontSize: typography.title,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: 0,
  },
  body: {
    marginTop: 10,
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    letterSpacing: 0,
  },
  card: {
    marginTop: 24,
    borderRadius: 24,
  },
  heroBadge: {
    height: 116,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(109,93,251,0.16)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  segment: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
  },
  inputWrap: {
    marginTop: 12,
  },
  inputLabel: {
    marginBottom: 7,
    color: '#111827',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  inputFrame: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  fieldReset: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  errorText: {
    marginTop: 6,
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  authError: {
    marginTop: 14,
    color: '#EF4444',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  authHint: {
    marginTop: 10,
    color: '#6D5DFB',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  submit: {
    marginTop: 18,
  },
  buttonGap: {
    marginTop: 12,
  },
  socialRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
  },
  textAction: {
    alignSelf: 'flex-end',
    paddingTop: 12,
    paddingBottom: 4,
  },
  textActionLabel: {
    color: '#6D5DFB',
    fontSize: 13,
    fontWeight: '800',
  },
  footerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerLinkText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
  footerLinkAction: {
    color: '#6D5DFB',
    fontWeight: '900',
  },
  avatarUpload: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  flex: {
    flex: 1,
  },
  uploadTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  uploadBody: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  resend: {
    marginTop: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  resendButton: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profilePhoto: {
    alignItems: 'center',
    marginBottom: 2,
  },
  profilePhotoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
  },
});
