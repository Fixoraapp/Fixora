import { LinearGradient } from 'expo-linear-gradient';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';
import { colors } from '../constants/theme';
import { defaultRegistrationFields, defaultTelegramChannels, FinanceSettings, MarketingBanner, RegistrationFieldConfig, RegistrationFieldsState, RegistrationFieldType, SupportTicket, TelegramChannelConfig, useAdminConfig } from '../context/AdminConfigContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/I18nProvider';
import { translationModules } from '../i18n/defaultTranslations';
import { TableRow } from '../lib/database.types';

type AdminModule =
  | 'dashboard'
  | 'categories'
  | 'locations'
  | 'translations'
  | 'users'
  | 'verification'
  | 'orders'
  | 'finance'
  | 'marketing'
  | 'support'
  | 'registration'
  | 'telegram'
  | 'logs'
  | 'settings';
type AdminIconName =
  | 'LayoutDashboard'
  | 'Grid3x3'
  | 'MapPinned'
  | 'Languages'
  | 'Users'
  | 'ShieldCheck'
  | 'ClipboardList'
  | 'Wallet'
  | 'Megaphone'
  | 'LifeBuoy'
  | 'Palette'
  | 'Send'
  | 'FileText'
  | 'Settings'
  | 'Bell'
  | 'Bolt'
  | 'Search'
  | 'Dollar'
  | 'TrendingUp';
type Lang = 'ru' | 'en' | 'hy';
type Status = 'active' | 'pending' | 'blocked' | 'completed' | 'failed';

type AdminLog = {
  id: string;
  adminName: string;
  action: string;
  module: string;
  dateTime: string;
  ip: string;
  status: Status;
  details: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt?: string;
};

type CategoryRecord = {
  id: string;
  name_ru: string;
  name_en: string;
  name_hy: string;
  slug: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  parentCategoryId: string;
  availableCountries: string[];
  availableRegions: string[];
  availableCities: string[];
};

type CountryRecord = {
  id: string;
  name_ru: string;
  name_en: string;
  name_hy: string;
  iso2: string;
  iso3: string;
  emoji: string;
  flagImage: string;
  countryPhoto: string;
  currency: string;
  language: string;
  capital_ru: string;
  capital_en: string;
  isActive: boolean;
  marketplaceEnabled: boolean;
};

type RegionRecord = {
  id: string;
  countryIso2: string;
  name_ru: string;
  name_en: string;
  name_hy: string;
  type_ru: string;
  type_en: string;
  capital_ru: string;
  capital_en: string;
  isActive: boolean;
};

type CityRecord = {
  id: string;
  regionId: string;
  name_ru: string;
  name_en: string;
  name_hy: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
};

type TranslationRecord = {
  id: string;
  key: string;
  module: string;
  ru: string;
  en: string;
  hy: string;
  status: 'complete' | 'missing';
  updatedAt: string;
};

type AdminUser = {
  id: string;
  name: string;
  role: 'Client' | 'Master' | 'Company' | 'Admin';
  city: string;
  status: Status;
  verification: 'verified' | 'pending' | 'rejected';
  rating: number;
  completedOrders: number;
  categories: string;
  premium: boolean;
};

type OrderRecord = {
  id: string;
  client: string;
  master: string;
  city: string;
  status: 'pending' | 'accepted' | 'master_on_way' | 'in_progress' | 'completed' | 'cancelled' | 'refunded' | 'disputed';
  amount: number;
  secureDeal: 'unpaid' | 'reserved' | 'paid' | 'refunded' | 'failed';
};

type TelegramSettings = {
  enabled: boolean;
  botToken: string;
  orderNotificationChatId: string;
  supportChatId: string;
  paymentAlertChatId: string;
  systemLogsChatId: string;
  siteChangeLogsChatId: string;
  newOrder: boolean;
  payment: boolean;
  supportTicket: boolean;
  verificationRequest: boolean;
  siteChangeLog: boolean;
  adminActionLog: boolean;
  channels: TelegramChannelConfig[];
};

type AppSettings = {
  maintenanceMode: boolean;
  appVersion: string;
  minimumAppVersion: string;
  defaultCurrency: string;
  defaultLanguage: string;
  commissionPercent: string;
  payments: boolean;
  telegramNotifications: boolean;
  aiRecommendations: boolean;
  mapSystem: boolean;
};

type ModalState =
  | { kind: 'category'; item?: CategoryRecord }
  | { kind: 'country'; item?: CountryRecord }
  | { kind: 'region'; item?: RegionRecord }
  | { kind: 'city'; item?: CityRecord }
  | { kind: 'translation'; item?: TranslationRecord }
  | { kind: 'user'; item: AdminUser }
  | { kind: 'order'; item: OrderRecord }
  | { kind: 'banner'; item?: MarketingBanner }
  | { kind: 'log'; item: AdminLog }
  | null;

const modules: Array<{ id: AdminModule; label: string; group: string }> = [
  { id: 'dashboard', label: 'Dashboard', group: 'Core' },
  { id: 'categories', label: 'Categories', group: 'Marketplace' },
  { id: 'locations', label: 'Locations', group: 'Marketplace' },
  { id: 'translations', label: 'Translations', group: 'Platform' },
  { id: 'users', label: 'Users', group: 'Platform' },
  { id: 'verification', label: 'Verification', group: 'Operations' },
  { id: 'orders', label: 'Orders', group: 'Operations' },
  { id: 'finance', label: 'Finance', group: 'Operations' },
  { id: 'marketing', label: 'Marketing', group: 'Growth' },
  { id: 'support', label: 'Support', group: 'Growth' },
  { id: 'registration', label: 'Registration Management', group: 'Settings' },
  { id: 'telegram', label: 'Telegram', group: 'Settings' },
  { id: 'logs', label: 'Logs', group: 'Settings' },
  { id: 'settings', label: 'App Settings', group: 'Settings' },
];

const moduleIcons: Record<AdminModule, AdminIconName> = {
  dashboard: 'LayoutDashboard',
  categories: 'Grid3x3',
  locations: 'MapPinned',
  translations: 'Languages',
  users: 'Users',
  verification: 'ShieldCheck',
  orders: 'ClipboardList',
  finance: 'Wallet',
  marketing: 'Megaphone',
  support: 'LifeBuoy',
  registration: 'Palette',
  telegram: 'Send',
  logs: 'FileText',
  settings: 'Settings',
};

const categorySeeds = [
  'Repair & Construction',
  'Cleaning',
  'Delivery',
  'Auto Services',
  'Beauty & SPA',
  'Health',
  'Education',
  'Photo & Video',
  'IT & AI',
  'Business & Legal',
  'Events',
  'Security',
  'Tech Repair',
  'Production',
  'Tourism',
  'Premium & VIP',
];

const nowStamp = () => new Date().toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
const amd = (amount: number) => `${amount.toLocaleString()} AMD`;

const initialCategories: CategoryRecord[] = categorySeeds.map((name, index) => ({
  id: `cat-${index + 1}`,
  name_ru: name,
  name_en: name,
  name_hy: name,
  slug: name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  icon: name.slice(0, 2).toUpperCase(),
  color: ['#2D7CFF', '#6D5DFB', '#22C55E', '#F59E0B'][index % 4],
  isActive: index < 14,
  sortOrder: index + 1,
  parentCategoryId: '',
  availableCountries: ['AM', 'US'],
  availableRegions: ['Yerevan', 'California'],
  availableCities: ['Yerevan', 'Los Angeles'],
}));

const initialCountries: CountryRecord[] = [
  {
    id: 'country-am',
    name_ru: 'РђСЂРјРµРЅРёСЏ',
    name_en: 'Armenia',
    name_hy: 'ХЂХЎХµХЎХЅХїХЎХ¶',
    iso2: 'AM',
    iso3: 'ARM',
    emoji: 'AM',
    flagImage: 'flag-placeholder-am.png',
    countryPhoto: 'country-photo-am.png',
    currency: 'AMD',
    language: 'hy',
    capital_ru: 'Р•СЂРµРІР°РЅ',
    capital_en: 'Yerevan',
    isActive: true,
    marketplaceEnabled: true,
  },
  {
    id: 'country-us',
    name_ru: 'РЎРЁРђ',
    name_en: 'United States',
    name_hy: 'Ф±Х„Х†',
    iso2: 'US',
    iso3: 'USA',
    emoji: 'US',
    flagImage: 'flag-placeholder-us.png',
    countryPhoto: 'country-photo-us.png',
    currency: 'USD',
    language: 'en',
    capital_ru: 'Р’Р°С€РёРЅРіС‚РѕРЅ',
    capital_en: 'Washington',
    isActive: true,
    marketplaceEnabled: false,
  },
];

const initialRegions: RegionRecord[] = [
  { id: 'region-yerevan', countryIso2: 'AM', name_ru: 'Р•СЂРµРІР°РЅ', name_en: 'Yerevan', name_hy: 'ФµЦЂЦ‡ХЎХ¶', type_ru: 'РіРѕСЂРѕРґ', type_en: 'city', capital_ru: 'Р•СЂРµРІР°РЅ', capital_en: 'Yerevan', isActive: true },
  { id: 'region-california', countryIso2: 'US', name_ru: 'РљР°Р»РёС„РѕСЂРЅРёСЏ', name_en: 'California', name_hy: 'ФїХЎХ¬Х«Ц†ХёХјХ¶Х«ХЎ', type_ru: 'С€С‚Р°С‚', type_en: 'state', capital_ru: 'РЎР°РєСЂР°РјРµРЅС‚Рѕ', capital_en: 'Sacramento', isActive: true },
];

const initialCities: CityRecord[] = [
  { id: 'city-yerevan', regionId: 'region-yerevan', name_ru: 'Р•СЂРµРІР°РЅ', name_en: 'Yerevan', name_hy: 'ФµЦЂЦ‡ХЎХ¶', isActive: true, latitude: '40.1792', longitude: '44.4991' },
  { id: 'city-la', regionId: 'region-california', name_ru: 'Р›РѕСЃ-РђРЅРґР¶РµР»РµСЃ', name_en: 'Los Angeles', name_hy: 'ФјХёХЅ Ф±Х¶Х»ХҐХ¬ХҐХЅ', isActive: true, latitude: '34.0522', longitude: '-118.2437' },
];

const initialTranslations: TranslationRecord[] = [
  { id: 'tr-1', key: 'home.hero.title', module: 'home', ru: 'РќР°Р№РґРёС‚Рµ РјР°СЃС‚РµСЂР°', en: 'Find a master', hy: 'ФіХїХҐЦ„ ХѕХЎЦЂХєХҐХї', status: 'complete', updatedAt: 'Today' },
  { id: 'tr-2', key: 'wallet.secure_deal', module: 'wallet', ru: 'Р‘РµР·РѕРїР°СЃРЅР°СЏ СЃРґРµР»РєР°', en: 'Secure deal', hy: '', status: 'missing', updatedAt: 'Today' },
  { id: 'tr-3', key: 'admin.telegram.title', module: 'admin', ru: 'Telegram СѓРІРµРґРѕРјР»РµРЅРёСЏ', en: 'Telegram notifications', hy: 'Telegram Х®ХЎХ¶ХёЦ‚ЦЃХёЦ‚ХґХ¶ХҐЦЂ', status: 'complete', updatedAt: 'Yesterday' },
];

const initialUsers: AdminUser[] = [
  { id: 'u-1', name: 'Mariam K.', role: 'Client', city: 'Yerevan', status: 'active', verification: 'verified', rating: 5, completedOrders: 12, categories: 'Cleaning', premium: false },
  { id: 'u-2', name: 'Arman Master', role: 'Master', city: 'Yerevan', status: 'pending', verification: 'pending', rating: 4.9, completedOrders: 128, categories: 'Repair, IT', premium: true },
  { id: 'u-3', name: 'Fixora Admin', role: 'Admin', city: 'Remote', status: 'active', verification: 'verified', rating: 0, completedOrders: 0, categories: 'Operations', premium: false },
  { id: 'u-4', name: 'CleanPro LLC', role: 'Company', city: 'Gyumri', status: 'active', verification: 'verified', rating: 4.7, completedOrders: 80, categories: 'Cleaning', premium: true },
];

const initialOrders: OrderRecord[] = [
  { id: 'ord-1001', client: 'Mariam K.', master: 'Arman Master', city: 'Yerevan', status: 'pending', amount: 8000, secureDeal: 'reserved' },
  { id: 'ord-1002', client: 'Artem S.', master: 'Fixora Master', city: 'Yerevan', status: 'completed', amount: 25000, secureDeal: 'paid' },
  { id: 'ord-1003', client: 'Georg M.', master: 'CleanPro LLC', city: 'Gyumri', status: 'disputed', amount: 14000, secureDeal: 'reserved' },
];

const initialLogs: AdminLog[] = [
  { id: 'log-1', adminName: 'Super Admin', action: 'admin login', module: 'Auth', dateTime: 'Today 09:20', ip: '127.0.0.1', status: 'completed', details: 'Super Admin signed into the admin panel.' },
  { id: 'log-2', adminName: 'Super Admin', action: 'changed category', module: 'Categories', dateTime: 'Today 10:05', ip: '127.0.0.1', status: 'completed', details: 'Updated IT & AI sort order.' },
  { id: 'log-3', adminName: 'Ops Admin', action: 'approved master', module: 'Verification', dateTime: 'Yesterday 18:12', ip: '10.0.0.24', status: 'completed', details: 'Approved master document set.' },
  { id: 'log-4', adminName: 'Super Admin', action: 'changed Telegram settings', module: 'Settings', dateTime: 'Yesterday 17:02', ip: '127.0.0.1', status: 'completed', details: 'Saved Telegram routing configuration.' },
];

const initialTelegram: TelegramSettings = {
  enabled: true,
  botToken: '',
  orderNotificationChatId: '',
  supportChatId: '',
  paymentAlertChatId: '',
  systemLogsChatId: '',
  siteChangeLogsChatId: '',
  newOrder: true,
  payment: true,
  supportTicket: true,
  verificationRequest: true,
  siteChangeLog: true,
  adminActionLog: true,
  channels: defaultTelegramChannels,
};

const initialAppSettings: AppSettings = {
  maintenanceMode: false,
  appVersion: '2.1.0',
  minimumAppVersion: '1.0.0',
  defaultCurrency: 'AMD',
  defaultLanguage: 'en',
  commissionPercent: '12',
  payments: true,
  telegramNotifications: true,
  aiRecommendations: true,
  mapSystem: true,
};

export default function AdminScreen({ onExit }: { onExit: () => void }) {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const compact = width < 900;
  const adminConfig = useAdminConfig();
  const { state } = adminConfig;
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const categories = state.categories as CategoryRecord[];
  const countries = state.countries as CountryRecord[];
  const regions = state.regions as RegionRecord[];
  const cities = state.cities as CityRecord[];
  const translations = state.translations as TranslationRecord[];
  const users = state.users as AdminUser[];
  const orders = state.orders as OrderRecord[];
  const logs = state.logs as AdminLog[];
  const telegram = state.telegram as TelegramSettings;
  const appSettings = state.appSettings as AppSettings;
  const financeSettings = state.financeSettings;
  const marketingBanners = state.marketingBanners;
  const supportTickets = state.supportTickets;
  const registrationFields = state.registrationFields as RegistrationFieldsState;
  const setSection = <T,>(section: keyof typeof state, current: T, next: SetStateAction<T>) => {
    adminConfig.updateSection(section, typeof next === 'function' ? (next as (value: T) => T)(current) as never : next as never);
  };
  const setCategories: Dispatch<SetStateAction<CategoryRecord[]>> = (next) => setSection('categories', categories, next);
  const setCountries: Dispatch<SetStateAction<CountryRecord[]>> = (next) => setSection('countries', countries, next);
  const setRegions: Dispatch<SetStateAction<RegionRecord[]>> = (next) => setSection('regions', regions, next);
  const setCities: Dispatch<SetStateAction<CityRecord[]>> = (next) => setSection('cities', cities, next);
  const setTranslations: Dispatch<SetStateAction<TranslationRecord[]>> = (next) => setSection('translations', translations, next);
  const setUsers: Dispatch<SetStateAction<AdminUser[]>> = (next) => setSection('users', users, next);
  const setOrders: Dispatch<SetStateAction<OrderRecord[]>> = (next) => setSection('orders', orders, next);
  const setTelegram: Dispatch<SetStateAction<TelegramSettings>> = (next) => setSection('telegram', telegram, next);
  const setAppSettings: Dispatch<SetStateAction<AppSettings>> = (next) => setSection('appSettings', appSettings, next);
  const setFinanceSettings: Dispatch<SetStateAction<FinanceSettings>> = (next) => setSection('financeSettings', financeSettings, next);
  const setMarketingBanners: Dispatch<SetStateAction<MarketingBanner[]>> = (next) => setSection('marketingBanners', marketingBanners, next);
  const setSupportTickets: Dispatch<SetStateAction<SupportTicket[]>> = (next) => setSection('supportTickets', supportTickets, next);
  const setRegistrationFields: Dispatch<SetStateAction<RegistrationFieldsState>> = (next) => setSection('registrationFields', registrationFields, next);

  const addLog = (action: string, moduleName: string, details: string, oldValue?: unknown, newValue?: unknown) => {
    adminConfig.addLog(action, moduleName, details, oldValue, newValue).catch(() => undefined);
  };
  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };
  const storageSectionByModule: Partial<Record<AdminModule, keyof typeof state>> = {
    categories: 'categories',
    locations: 'countries',
    translations: 'translations',
    users: 'users',
    verification: 'users',
    orders: 'orders',
    finance: 'financeSettings',
    marketing: 'marketingBanners',
    support: 'supportTickets',
    registration: 'registrationFields',
    telegram: 'telegram',
    logs: 'logs',
    settings: 'appSettings',
  };
  const saveActiveModule = async () => {
    const section = storageSectionByModule[activeModule];
    if (section) {
      await adminConfig.saveSection(section, modules.find((item) => item.id === activeModule)?.label ?? activeModule, 'saved section');
    }
    notify(t('toasts.saved', 'Saved successfully'));
  };
  const resetActiveModule = async () => {
    const section = storageSectionByModule[activeModule];
    if (section) {
      await adminConfig.resetSection(section, modules.find((item) => item.id === activeModule)?.label ?? activeModule);
    }
    notify(t('toasts.reset', 'Reset successfully'));
  };
  const saveTelegram = () => {
    adminConfig.saveSection('telegram', 'Telegram', 'changed Telegram settings').then(() => notify(t('toasts.saved', 'Saved successfully'))).catch(() => notify('Save failed'));
  };
  const sendTelegramTest = (channelId: string) => {
    sendTelegramNotification(channelId, telegramMockPayload(channelId))
      .then((result) => {
        setTelegram((current) => ({
          ...current,
          channels: ensureTelegramChannels(current).map((channel) => channel.id === channelId ? { ...channel, lastSentAt: result.sentAt, lastStatus: 'mock success' } : channel),
        }));
        addLog('sent Telegram test notification', 'Telegram', `Mock Telegram notification sent for ${channelId}.`, undefined, result);
        notify('Test notification sent');
      })
      .catch(() => notify('Test notification failed'));
  };

  const dashboard = useMemo(() => {
    const masters = users.filter((user) => user.role === 'Master');
    return {
      totalClients: users.filter((user) => user.role === 'Client').length,
      totalMasters: masters.length,
      pendingMasters: masters.filter((user) => user.verification === 'pending').length,
      activeOrders: orders.filter((order) => !['completed', 'cancelled', 'refunded'].includes(order.status)).length,
      completedOrders: orders.filter((order) => order.status === 'completed').length,
      revenue: orders.reduce((sum, order) => sum + order.amount * (Number(financeSettings.commissionPercent) / 100), 0),
      payouts: orders.filter((order) => order.secureDeal === 'paid').reduce((sum, order) => sum + order.amount * (Number(financeSettings.payoutPercent) / 100), 0),
      activeCountries: countries.filter((country) => country.isActive).length,
      activeCities: cities.filter((city) => city.isActive).length,
      supportTickets: supportTickets.length,
    };
  }, [cities, countries, financeSettings.commissionPercent, financeSettings.payoutPercent, orders, supportTickets.length, users]);

  const content = (() => {
    if (activeModule === 'dashboard') {
      return <Dashboard dashboard={dashboard} />;
    }
    if (activeModule === 'telegram') {
      return <TelegramSettingsPanel settings={telegram} onChange={setTelegram} onSave={saveTelegram} onReset={() => { resetActiveModule().catch(() => notify('Reset failed')); }} onTest={sendTelegramTest} />;
    }
    if (activeModule === 'logs') {
      return <LogsPanel logs={logs} query={query} onDetails={(item) => setModal({ kind: 'log', item })} />;
    }
    if (activeModule === 'categories') {
      return (
        <CategoriesPanel
          categories={categories}
          query={query}
          onAdd={() => setModal({ kind: 'category' })}
          onEdit={(item) => setModal({ kind: 'category', item })}
          onDelete={(id) => {
            setCategories((items) => items.filter((item) => item.id !== id));
            addLog('deleted category', 'Categories', `Deleted category ${id}.`);
          }}
          onToggle={(id) => setCategories((items) => items.map((item) => item.id === id ? { ...item, isActive: !item.isActive } : item))}
        />
      );
    }
    if (activeModule === 'locations') {
      return (
        <LocationsPanel
          countries={countries}
          regions={regions}
          cities={cities}
          query={query}
          onAddCountry={() => setModal({ kind: 'country' })}
          onAddRegion={() => setModal({ kind: 'region' })}
          onAddCity={() => setModal({ kind: 'city' })}
          onEditCountry={(item) => setModal({ kind: 'country', item })}
          onEditRegion={(item) => setModal({ kind: 'region', item })}
          onEditCity={(item) => setModal({ kind: 'city', item })}
          onDeleteCountry={(id) => {
            setCountries((items) => items.filter((item) => item.id !== id));
            addLog('deleted country', 'Locations', `Deleted country ${id}.`);
          }}
          onDeleteRegion={(id) => {
            setRegions((items) => items.filter((item) => item.id !== id));
            addLog('deleted region', 'Locations', `Deleted region ${id}.`);
          }}
          onDeleteCity={(id) => {
            setCities((items) => items.filter((item) => item.id !== id));
            addLog('deleted city', 'Locations', `Deleted city ${id}.`);
          }}
          onToggleCountry={(id) => setCountries((items) => items.map((item) => item.id === id ? { ...item, isActive: !item.isActive } : item))}
          onToggleRegion={(id) => setRegions((items) => items.map((item) => item.id === id ? { ...item, isActive: !item.isActive } : item))}
          onToggleCity={(id) => setCities((items) => items.map((item) => item.id === id ? { ...item, isActive: !item.isActive } : item))}
        />
      );
    }
    if (activeModule === 'translations') {
      return <TranslationsPanel translations={translations} query={query} onAdd={() => setModal({ kind: 'translation' })} onEdit={(item) => setModal({ kind: 'translation', item })} onInlineSave={(item) => { setTranslations((items) => items.map((translation) => translation.id === item.id ? item : translation)); addLog('inline edited translation', 'Translations', `Updated ${item.key}.`); }} onDelete={(id) => { setTranslations((items) => items.filter((item) => item.id !== id)); addLog('deleted translation', 'Translations', `Deleted translation ${id}.`); }} onCopyKey={(key) => notify(`Copied key: ${key}`)} onExport={() => notify('Translations JSON exported locally')} onImport={() => notify('Import JSON placeholder')} />;
    }
    if (activeModule === 'users') {
      return <UsersPanel users={users} query={query} onEdit={(item) => setModal({ kind: 'user', item })} onToggle={(id) => { setUsers((items) => items.map((item) => item.id === id ? { ...item, status: item.status === 'blocked' ? 'active' : 'blocked' } : item)); addLog('changed user status', 'Users', `Toggled user ${id}.`); }} onPremium={(id) => { setUsers((items) => items.map((item) => item.id === id ? { ...item, premium: !item.premium } : item)); addLog('changed premium status', 'Users', `Toggled premium ${id}.`); }} onActivate={(id) => { setUsers((items) => items.map((item) => item.id === id ? { ...item, status: item.status === 'active' ? 'pending' : 'active' } : item)); addLog('changed activation status', 'Users', `Changed activation ${id}.`); }} />;
    }
    if (activeModule === 'verification') {
      return (
        <VerificationPanel
          masters={users.filter((user) => user.role === 'Master')}
          query={query}
          onApprove={(id) => {
            setUsers((items) => items.map((item) => item.id === id ? { ...item, verification: 'verified', status: 'active' } : item));
            addLog('approved master', 'Verification', `Approved master ${id}.`);
          }}
          onReject={(id, reason) => {
            setUsers((items) => items.map((item) => item.id === id ? { ...item, verification: 'rejected', status: 'blocked' } : item));
            addLog('rejected master', 'Verification', `Rejected master ${id}. Reason: ${reason || 'Not specified'}.`);
          }}
          onPremium={(id) => {
            setUsers((items) => items.map((item) => item.id === id ? { ...item, premium: !item.premium } : item));
            addLog('changed premium badge', 'Verification', `Toggled premium badge for master ${id}.`);
          }}
          onToggleVerified={(id) => {
            setUsers((items) => items.map((item) => item.id === id ? { ...item, verification: item.verification === 'verified' ? 'pending' : 'verified', status: item.verification === 'verified' ? 'pending' : 'active' } : item));
            addLog('changed verified badge', 'Verification', `Toggled verified badge for master ${id}.`);
          }}
        />
      );
    }
    if (activeModule === 'orders') {
      return <OrdersPanel orders={orders} query={query} onDetails={(item) => setModal({ kind: 'order', item })} onStatus={(id, status) => { setOrders((items) => items.map((item) => item.id === id ? { ...item, status, secureDeal: status === 'refunded' ? 'refunded' : item.secureDeal } : item)); addLog('changed order status', 'Orders', `Changed order ${id} to ${status}.`); }} />;
    }
    if (activeModule === 'finance') {
      return <FinancePanel orders={orders} users={users} settings={financeSettings} onChange={setFinanceSettings} />;
    }
    if (activeModule === 'marketing') {
      return <MarketingPanel banners={marketingBanners} query={query} onAddBanner={() => setModal({ kind: 'banner' })} onEditBanner={(item) => setModal({ kind: 'banner', item })} onToggle={(id) => { setMarketingBanners((items) => items.map((item) => item.id === id ? { ...item, isActive: !item.isActive } : item)); addLog('changed marketing campaign', 'Marketing', `Toggled marketing banner ${id}.`); }} onDelete={(id) => { setMarketingBanners((items) => items.filter((item) => item.id !== id)); addLog('deleted marketing campaign', 'Marketing', `Deleted marketing banner ${id}.`); }} />;
    }
    if (activeModule === 'support') {
      return <SupportPanel tickets={supportTickets} query={query} onStatus={(id, status) => { setSupportTickets((items) => items.map((item) => item.id === id ? { ...item, status } : item)); addLog('changed support ticket status', 'Support', `Changed ticket ${id} to ${status}.`); }} onAssign={(id, assigned) => { setSupportTickets((items) => items.map((item) => item.id === id ? { ...item, assigned } : item)); addLog('assigned support ticket', 'Support', `Assigned ticket ${id} to ${assigned}.`); }} />;
    }
    if (activeModule === 'registration') {
      return (
        <RegistrationManagementPanel
          fields={registrationFields}
          onChange={setRegistrationFields}
          onSave={() => { addLog('changed registration fields', 'Registration Management', 'Saved registration field configuration.'); notify('Registration fields saved'); }}
          onReset={() => { setRegistrationFields(defaultRegistrationFields); addLog('reset registration fields', 'Registration Management', 'Reset registration fields to defaults.'); notify('Registration fields reset'); }}
        />
      );
    }
    return <AppSettingsPanel settings={appSettings} onChange={setAppSettings} onSave={() => { addLog('changed app settings', 'Settings', 'Saved app settings locally.'); notify('App settings saved'); }} />;
  })();

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#F7F8FC', '#FFFFFF', '#F5F0FF', '#EEF4FF']} locations={[0, 0.44, 0.78, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.adminAurora} />
      <View style={styles.adminGoldGlow} />
      <View style={[styles.shell, (compact || sidebarCollapsed) && styles.shellCompact]}>
        <Sidebar
          active={activeModule}
          compact={compact || sidebarCollapsed}
          onSelect={setActiveModule}
          onExit={onExit}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />
        <View style={styles.main}>
          <Topbar active={activeModule} query={query} onQuery={setQuery} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.adminSaveRow}>
              <ActionButton label={t('buttons.save', 'Save')} onPress={() => { saveActiveModule().catch(() => notify('Save failed')); }} />
              <ActionButton label={t('buttons.reset', 'Reset')} variant="secondary" onPress={() => { resetActiveModule().catch(() => notify('Reset failed')); }} />
            </View>
            {content}
          </ScrollView>
        </View>
      </View>
      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
      <AdminModal
        key={modal ? `${modal.kind}-${'item' in modal && modal.item ? modal.item.id : 'new'}` : 'closed'}
        modal={modal}
        onClose={() => setModal(null)}
        onSaveCategory={(item) => {
          setCategories((items) => item.id ? items.map((category) => category.id === item.id ? item : category) : [{ ...item, id: uid('cat') }, ...items]);
          addLog(item.id ? 'changed category' : 'added category', 'Categories', `Saved category ${item.name_en}.`);
          setModal(null);
        }}
        onSaveCountry={(item) => {
          setCountries((items) => item.id ? items.map((country) => country.id === item.id ? item : country) : [{ ...item, id: uid('country') }, ...items]);
          addLog(item.id ? 'edited country' : 'added country', 'Locations', `Saved country ${item.name_en}.`);
          setModal(null);
        }}
        onSaveRegion={(item) => {
          setRegions((items) => item.id ? items.map((region) => region.id === item.id ? item : region) : [{ ...item, id: uid('region') }, ...items]);
          addLog(item.id ? 'edited region' : 'added region', 'Locations', `Saved region ${item.name_en}.`);
          setModal(null);
        }}
        onSaveCity={(item) => {
          setCities((items) => item.id ? items.map((city) => city.id === item.id ? item : city) : [{ ...item, id: uid('city') }, ...items]);
          addLog(item.id ? 'edited city' : 'added city', 'Locations', `Saved city ${item.name_en}.`);
          setModal(null);
        }}
        onSaveTranslation={(item) => {
          setTranslations((items) => item.id ? items.map((translation) => translation.id === item.id ? item : translation) : [{ ...item, id: uid('tr') }, ...items]);
          addLog('changed translations', 'Translations', `Saved translation key ${item.key}.`);
          setModal(null);
        }}
        onSaveUser={(item) => {
          setUsers((items) => items.map((user) => user.id === item.id ? item : user));
          addLog('edited user', 'Users', `Saved user ${item.name}.`);
          setModal(null);
        }}
        onSaveOrder={(item) => {
          setOrders((items) => items.map((order) => order.id === item.id ? item : order));
          addLog('changed order', 'Orders', `Saved order ${item.id}.`);
          setModal(null);
        }}
        onSaveBanner={(item) => {
          setMarketingBanners((items) => item.id ? items.map((banner) => banner.id === item.id ? item : banner) : [{ ...item, id: uid('ban') }, ...items]);
          addLog(item.id ? 'changed marketing banner' : 'added marketing banner', 'Marketing', `Saved banner ${item.title_en}.`);
          setModal(null);
        }}
        onToast={notify}
      />
    </SafeAreaView>
  );
}

function normalizeIconName(icon: string): AdminIconName {
  if (icon in moduleIcons) {
    return moduleIcons[icon as AdminModule];
  }
  if (icon === '$' || icon === '%' || icon === 'P' || icon === 'OK' || icon === 'R') {
    return 'Wallet';
  }
  if (icon === 'TrendingUp') return 'TrendingUp';
  if (icon === 'ClipboardList') return 'ClipboardList';
  if (icon === 'Users') return 'Users';
  if (icon === 'ShieldCheck') return 'ShieldCheck';
  if (icon === 'Wallet') return 'Wallet';
  return 'LayoutDashboard';
}

function AdminIcon({ name, active = false, light = false, size = 18 }: { name: AdminIconName; active?: boolean; light?: boolean; size?: number }) {
  const color = light ? '#FFFFFF' : active ? '#6D5DFB' : '#6B7280';
  const stroke = { borderColor: color } as ViewStyle;
  const fill = { backgroundColor: color } as ViewStyle;
  const box = { width: size, height: size } as ViewStyle;

  if (name === 'LayoutDashboard') {
    return <View style={[styles.iconGrid, box]}><View style={[styles.iconPaneTall, stroke]} /><View style={[styles.iconPane, stroke]} /><View style={[styles.iconPane, stroke]} /></View>;
  }
  if (name === 'Grid3x3') {
    return <View style={[styles.iconGrid3, box]}>{Array.from({ length: 9 }).map((_, index) => <View key={index} style={[styles.iconGridDot, stroke]} />)}</View>;
  }
  if (name === 'MapPinned') {
    return <View style={[styles.iconMap, box]}><View style={[styles.iconMapFold, stroke]} /><View style={[styles.iconPin, stroke]}><View style={[styles.iconPinCore, fill]} /></View></View>;
  }
  if (name === 'Languages') {
    return <View style={[styles.iconLanguage, box]}><Text style={[styles.iconGlyph, { color, fontSize: size * 0.52 }]}>A</Text><Text style={[styles.iconGlyphSmall, { color }]}>文</Text></View>;
  }
  if (name === 'Users') {
    return <View style={[styles.iconUsers, box]}><View style={[styles.iconUserHead, stroke]} /><View style={[styles.iconUserBody, stroke]} /><View style={[styles.iconUserHeadSmall, stroke]} /></View>;
  }
  if (name === 'ShieldCheck') {
    return <View style={[styles.iconShield, box, stroke]}><View style={[styles.iconCheckA, fill]} /><View style={[styles.iconCheckB, fill]} /></View>;
  }
  if (name === 'ClipboardList' || name === 'FileText') {
    return <View style={[styles.iconFile, box, stroke]}><View style={[styles.iconClip, stroke]} />{[0, 1, 2].map((item) => <View key={item} style={[styles.iconLine, fill, { top: 6 + item * 4 }]} />)}</View>;
  }
  if (name === 'Wallet') {
    return <View style={[styles.iconWallet, box, stroke]}><View style={[styles.iconWalletPocket, stroke]} /><View style={[styles.iconWalletDot, fill]} /></View>;
  }
  if (name === 'Megaphone') {
    return <View style={[styles.iconMegaphone, box]}><View style={[styles.iconHorn, stroke]} /><View style={[styles.iconHandle, fill]} /><View style={[styles.iconSound, stroke]} /></View>;
  }
  if (name === 'LifeBuoy') {
    return <View style={[styles.iconBuoy, box, stroke]}><View style={[styles.iconBuoyCore, stroke]} /></View>;
  }
  if (name === 'Palette') {
    return <View style={[styles.iconPalette, box, stroke]}>{[0, 1, 2].map((item) => <View key={item} style={[styles.iconPaletteDot, fill, { left: 4 + item * 5 }]} />)}</View>;
  }
  if (name === 'Send') {
    return <View style={[styles.iconSend, box]}><View style={[styles.iconSendWing, stroke]} /><View style={[styles.iconSendLine, fill]} /></View>;
  }
  if (name === 'Settings') {
    return <View style={[styles.iconGear, box, stroke]}>{[0, 1, 2, 3].map((item) => <View key={item} style={[styles.iconGearTooth, fill, { transform: [{ rotate: `${item * 45}deg` }] }]} />)}<View style={[styles.iconGearCore, stroke]} /></View>;
  }
  if (name === 'Bell') {
    return <View style={[styles.iconBell, box, stroke]}><View style={[styles.iconBellBase, fill]} /></View>;
  }
  if (name === 'Bolt') {
    return <View style={[styles.iconBolt, box]}><View style={[styles.iconBoltTop, fill]} /><View style={[styles.iconBoltBottom, fill]} /></View>;
  }
  if (name === 'Search') {
    return <View style={[styles.iconSearch, box, stroke]}><View style={[styles.iconSearchHandle, fill]} /></View>;
  }
  return <View style={[styles.iconTrend, box]}><View style={[styles.iconTrendLine, fill]} /><View style={[styles.iconTrendArrow, stroke]} /></View>;
}

function Sidebar({
  active,
  compact,
  collapsed,
  onSelect,
  onExit,
  onToggleCollapse,
}: {
  active: AdminModule;
  compact: boolean;
  collapsed: boolean;
  onSelect: (module: AdminModule) => void;
  onExit: () => void;
  onToggleCollapse: () => void;
}) {
  const { t } = useTranslation();
  const grouped = modules.reduce<Record<string, typeof modules>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  return (
    <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
      <View style={styles.brandRow}>
        <LinearGradient colors={['#D65BFF', '#6D5DFB', '#2D7CFF']} style={styles.brandMark}><AdminIcon name="LayoutDashboard" light size={22} /></LinearGradient>
        {!compact ? <View><Text style={styles.brandTitle}>Fixora Pro</Text><Text style={styles.brandSubtitle}>Super Admin</Text></View> : null}
        {!compact ? (
          <Pressable accessibilityRole="button" onPress={onToggleCollapse} style={styles.collapseButton}>
            <Text style={styles.collapseText}>{collapsed ? '>' : '<'}</Text>
          </Pressable>
        ) : null}
      </View>
      {compact ? (
        <Pressable accessibilityRole="button" onPress={onToggleCollapse} style={styles.expandButton}>
          <Text style={styles.collapseText}>{'>'}</Text>
        </Pressable>
      ) : null}
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([group, items]) => (
          <View key={group} style={styles.navGroup}>
            {!compact ? <Text style={styles.navGroupText}>{group}</Text> : null}
            {items.map((item) => {
              const selected = active === item.id;
              return (
                <Pressable key={item.id} onPress={() => onSelect(item.id)} style={[styles.navItem, selected && styles.navItemActive]}>
                  <View style={[styles.navIconBox, selected && styles.navIconBoxActive]}>
                    <AdminIcon name={moduleIcons[item.id]} active={selected} size={18} />
                  </View>
                  {!compact ? <Text style={[styles.navText, selected && styles.navTextActive]}>{t(adminModuleKey(item.id), item.label)}</Text> : null}
                  {!compact && selected ? <Text style={styles.navChevron}>вЂє</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
      {!compact ? (
        <View style={styles.adminProfileCard}>
          <View style={styles.adminProfileAvatar}><Text style={styles.adminProfileAvatarText}>SA</Text></View>
          <View style={styles.flex}>
            <Text style={styles.adminProfileName}>Super Admin</Text>
            <Text style={styles.adminProfileEmail}>admin@fixora.pro</Text>
          </View>
          <Text style={styles.adminProfileChevron}>вЂє</Text>
        </View>
      ) : null}
      <Pressable onPress={onExit} style={styles.exitButton}><Text style={styles.exitText}>{compact ? '<' : 'Exit admin'}</Text></Pressable>
    </View>
  );
}

function Topbar({ active, query, onQuery }: { active: AdminModule; query: string; onQuery: (value: string) => void }) {
  const { t } = useTranslation();
  const moduleInfo = modules.find((item) => item.id === active);
  const title = t(adminModuleKey(active), moduleInfo?.label ?? 'Admin');
  return (
    <View style={styles.topbar}>
      <View style={styles.topTitleBlock}>
        <Text style={styles.topKicker}>Production foundation / Supabase-ready mock</Text>
        <Text style={styles.topTitle}>{title}</Text>
        <Text style={styles.topSubtitle}>Welcome back. Here is what is happening across Fixora today.</Text>
      </View>
      <View style={styles.topActions}>
        <View style={styles.searchShell}>
          <AdminIcon name="Search" size={16} />
          <TextInput value={query} onChangeText={onQuery} placeholder={t('placeholders.searchAdmin', 'Search admin data...')} placeholderTextColor="#9CA3AF" style={styles.searchInput} />
        </View>
        <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>Live</Text></View>
        <LanguageSwitcher compact />
        <View style={styles.bell}><AdminIcon name="Bell" size={17} /></View>
        <View style={styles.bell}><AdminIcon name="Bolt" size={17} /></View>
        <ActionButton label="+ Quick Action" onPress={() => undefined} />
        <View style={styles.dateRange}><Text style={styles.dateRangeText}>May 23, 2025 - May 30, 2025</Text></View>
        <View style={styles.adminAvatar}><Text style={styles.adminAvatarText}>SA</Text></View>
      </View>
    </View>
  );
}

function Dashboard({ dashboard }: { dashboard: Record<string, number> }) {
  const metrics = [
    ['Total Revenue', dashboard.revenue, '+12.5%', 'Wallet'],
    ['Total Orders', dashboard.activeOrders + dashboard.completedOrders, '+8.3%', 'ClipboardList'],
    ['Total Users', dashboard.totalClients + dashboard.totalMasters, '+15.2%', 'Users'],
    ['Active Masters', dashboard.totalMasters, '+7.1%', 'ShieldCheck'],
    ['Conversion Rate', '8.24%', '+3.6%', 'TrendingUp'],
  ];
  return (
    <>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.dashboardTitle}>Dashboard Overview</Text>
          <Text style={styles.dashboardSubtitle}>Live operational snapshot from local AdminStore.</Text>
        </View>
        <View style={styles.dateRange}><Text style={styles.dateRangeText}>Last 7 days</Text></View>
      </View>
      <View style={styles.metricsGrid}>
        {metrics.map(([label, value, trend, icon]) => <MetricCard key={label} label={String(label)} value={typeof value === 'number' && value > 1000 ? amd(value) : String(value)} trend={String(trend)} icon={String(icon)} />)}
      </View>
      <View style={styles.dashboardGrid}>
        <ChartPlaceholder title="Revenue Overview" variant="line" large />
        <ChartPlaceholder title="Orders Overview" variant="bar" large />
        <ActivityFeed title="Live Activity" items={['New user registered', 'Order #1234 completed', 'Payment received', 'New master verified', 'New support ticket']} />
      </View>
      <View style={styles.dashboardGrid}>
        <ActivityFeed title="Recent Registrations" items={['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'David Brown']} />
        <ActivityFeed title="Pending Verification" items={['Alex Thompson / Verification Review', 'Lisa Anderson / Verification Review', 'Robert Garcia / Verification Review', 'Maria Rodriguez / Verification Review']} />
        <ActivityFeed title="Support Tickets" items={['#T1234 Payment not received', '#T1235 Account verification', '#T1236 Feature request', '#T1237 Bug report']} />
      </View>
    </>
  );
}

function MetricCard({ label, value, trend = '+4.8%', icon = 'LayoutDashboard' }: { label: string; value: string; trend?: string; icon?: string }) {
  const iconName = normalizeIconName(icon);

  return (
    <LinearGradient colors={['#FFFFFF', '#F7F8FC', 'rgba(109,93,251,0.12)']} style={styles.metricCard}>
      <View style={styles.metricSheen} />
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <LinearGradient colors={['#D65BFF', '#6D5DFB', '#2D7CFF']} style={styles.metricIcon}><AdminIcon name={iconName} active light size={20} /></LinearGradient>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTrend}>{trend} vs last 7 days</Text>
      <View style={styles.sparkline}>{[12, 18, 24, 20, 29, 36, 42].map((height, index) => <LinearGradient key={index} colors={['#B75CFF', '#2D7CFF']} style={[styles.sparkSegment, { height }]} />)}</View>
    </LinearGradient>
  );
}

function ChartPlaceholder({ title, variant = 'bar', large = false }: { title: string; variant?: 'bar' | 'line'; large?: boolean }) {
  return (
    <LinearGradient colors={['rgba(17,24,39,0.98)', 'rgba(31,41,55,0.96)', 'rgba(109,93,251,0.24)']} style={[styles.chartCard, large && styles.chartCardLarge]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Badge label="Last 7 days" tone="blue" />
      </View>
      <View style={variant === 'line' ? styles.lineChart : styles.chartBars}>
        {variant === 'line'
          ? [30, 44, 58, 52, 72, 66, 92].map((height, index) => <View key={index} style={[styles.linePoint, { height, marginTop: 104 - height }]} />)
          : [86, 74, 92, 128, 110, 82, 96].map((height, index) => <LinearGradient key={index} colors={['#D65BFF', '#6D5DFB', '#2D7CFF']} style={[styles.chartBar, { height }]} />)}
      </View>
    </LinearGradient>
  );
}

function ActivityFeed({ title, items }: { title: string; items: string[] }) {
  return (
    <GlassCard style={styles.activityCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TinyButton label="View all" onPress={() => undefined} />
      </View>
      <View style={styles.activityList}>
        {items.map((item, index) => (
          <View key={item} style={styles.activityRow}>
            <LinearGradient colors={index % 2 === 0 ? ['#6D5DFB', '#2563EB'] : ['#0F766E', '#2563EB']} style={styles.activityIcon}>
              <Text style={styles.activityIconText}>{index + 1}</Text>
            </LinearGradient>
            <View style={styles.flex}>
              <Text style={styles.activityTitle}>{item}</Text>
              <Text style={styles.activityMeta}>{2 + index * 5} min ago</Text>
            </View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

function TelegramSettingsPanel({
  settings,
  onChange,
  onSave,
  onReset,
  onTest,
}: {
  settings: TelegramSettings;
  onChange: (settings: TelegramSettings) => void;
  onSave: () => void;
  onReset: () => void;
  onTest: (channelId: string) => void;
}) {
  const channels = ensureTelegramChannels(settings);
  const activeChannels = channels.filter((channel) => channel.enabled).length;
  const configuredChannels = channels.filter((channel) => channel.botToken.trim() && channel.chatId.trim()).length;
  const patchChannel = (id: string, patch: Partial<TelegramChannelConfig>) => {
    onChange({ ...settings, channels: channels.map((channel) => channel.id === id ? { ...channel, ...patch } : channel) });
  };
  return (
    <>
      <MarketplaceHeader
        title="Telegram Notification Center"
        description="Configure separate Telegram bot tokens, chat IDs, titles, and message templates for every Fixora event stream."
        action="Save All"
        onAction={onSave}
      />
      <View style={styles.marketStats}>
        <MiniStat label="Global Status" value={settings.enabled ? 'Enabled' : 'Disabled'} />
        <MiniStat label="Active Channels" value={`${activeChannels}/${channels.length}`} />
        <MiniStat label="Configured Routes" value={`${configuredChannels}/${channels.length}`} />
        <MiniStat label="Last Mock Send" value={channels.find((channel) => channel.lastSentAt)?.lastStatus ?? 'Ready'} />
      </View>
      <GlassCard style={styles.marketToolbar}>
        <ToggleRow label="Enable Telegram Notification Center" value={settings.enabled} onChange={() => onChange({ ...settings, enabled: !settings.enabled })} />
        <View style={styles.rowActionWrap}>
          <ActionButton label="Save All" onPress={onSave} />
          <ActionButton label="Reset" variant="secondary" onPress={onReset} />
        </View>
      </GlassCard>
      <View style={styles.telegramChannelGrid}>
        {channels.map((channel) => (
          <LinearGradient key={channel.id} colors={channel.enabled ? ['#FFFFFF', 'rgba(45,124,255,0.08)'] : ['#FFFFFF', '#F9FAFB']} style={styles.telegramChannelCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{channel.name}</Text>
                <Text style={styles.cardMeta}>{channel.description}</Text>
              </View>
              <Badge label={channel.enabled ? (channel.botToken && channel.chatId ? 'connected' : 'setup') : 'disabled'} tone={channel.enabled && channel.botToken && channel.chatId ? 'green' : channel.enabled ? 'gold' : 'blue'} />
            </View>
            <ToggleRow label="Channel enabled" value={channel.enabled} onChange={() => patchChannel(channel.id, { enabled: !channel.enabled })} />
            <View style={styles.formGrid}>
              <AdminInput label="Bot Token" value={channel.botToken} onChange={(value) => patchChannel(channel.id, { botToken: value })} />
              <AdminInput label="Chat ID" value={channel.chatId} onChange={(value) => patchChannel(channel.id, { chatId: value })} />
              <AdminInput label="Notification Title" value={channel.notificationTitle} onChange={(value) => patchChannel(channel.id, { notificationTitle: value })} />
            </View>
            <AdminTextArea label="Message Template" value={channel.messageTemplate} onChange={(value) => patchChannel(channel.id, { messageTemplate: value })} />
            <View style={styles.telegramStatusRow}>
              <ProfileInfo label="Last sent" value={channel.lastSentAt ? new Date(channel.lastSentAt).toLocaleString() : 'Never'} />
              <ProfileInfo label="Last status" value={channel.lastStatus ?? 'Ready'} />
              <ProfileInfo label="Last error" value="No error" />
            </View>
            <View style={styles.actionRow}>
              <TinyButton label="Send Test Message" onPress={() => onTest(channel.id)} />
              <TinyButton label="Use Defaults" onPress={() => patchChannel(channel.id, defaultTelegramChannels.find((item) => item.id === channel.id) ?? channel)} />
            </View>
          </LinearGradient>
        ))}
      </View>
    </>
  );
}

function LogsPanel({ logs, query, onDetails }: { logs: AdminLog[]; query: string; onDetails: (log: AdminLog) => void }) {
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const modules = Array.from(new Set(logs.map((log) => log.module)));
  const admins = Array.from(new Set(logs.map((log) => log.adminName)));
  const actions = Array.from(new Set(logs.map((log) => log.action)));
  const filtered = searchRows(logs, query, (item) => [item.adminName, item.action, item.module, item.details, item.status])
    .filter((log) => moduleFilter === 'all' || log.module === moduleFilter)
    .filter((log) => statusFilter === 'all' || log.status === statusFilter)
    .filter((log) => adminFilter === 'all' || log.adminName === adminFilter)
    .filter((log) => actionFilter === 'all' || log.action === actionFilter);
  return (
    <>
      <MarketplaceHeader
        title="Enterprise Logs Viewer"
        description="Audit admin actions, module changes, old/new values, storage saves, resets, and operational activity across Fixora."
        action="Export Logs"
        onAction={() => undefined}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search logs" value={query} onChange={() => undefined} />
        <FilterPills label="Module" options={['all', ...modules]} active={moduleFilter} onChange={setModuleFilter} />
        <FilterPills label="Status" options={['all', 'active', 'pending', 'blocked', 'completed', 'failed']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
        <FilterPills label="Admin" options={['all', ...admins]} active={adminFilter} onChange={setAdminFilter} />
        <FilterPills label="Action" options={['all', ...actions]} active={actionFilter} onChange={setActionFilter} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Visible Logs" value={String(filtered.length)} />
        <MiniStat label="Modules" value={String(modules.length)} />
        <MiniStat label="Admins" value={String(admins.length)} />
        <MiniStat label="Completed" value={String(logs.filter((log) => log.status === 'completed').length)} />
      </View>
      <View style={styles.settingsGrid}>
        <GlassCard style={styles.settingsSideCard}>
          <SectionTitle title="Activity Timeline" action="Latest" />
          {filtered.slice(0, 7).map((log) => (
            <View key={log.id} style={styles.activityRow}>
              <LinearGradient colors={['#6D5DFB', '#2563EB']} style={styles.activityIcon}><Text style={styles.activityIconText}>{log.module.slice(0, 1)}</Text></LinearGradient>
              <View style={styles.flex}>
                <Text style={styles.activityTitle}>{log.action}</Text>
                <Text style={styles.activityMeta}>{log.module} / {log.createdAt || log.dateTime}</Text>
              </View>
            </View>
          ))}
        </GlassCard>
        <GlassCard style={styles.settingsPrimaryCard}>
          <SectionTitle title="Logs Table" action={`${filtered.length} records`} />
          <DataTable columns={['ID', 'Module', 'Action', 'Old / New', 'Admin', 'Created At', 'Status', 'Details']} rows={filtered.map((log) => [
            log.id,
            log.module,
            log.action,
            <View key="diff"><Text style={styles.tableSubText}>{formatLogValue(log.oldValue)}</Text><Text style={styles.tableText}>{formatLogValue(log.newValue)}</Text></View>,
            log.adminName,
            log.createdAt || log.dateTime,
            <Badge key="status" label={log.status} tone={log.status === 'completed' ? 'green' : log.status === 'failed' ? 'gold' : 'blue'} />,
            <TinyButton key="details" label="Details" onPress={() => onDetails(log)} />,
          ])} />
        </GlassCard>
      </View>
    </>
  );
}

function CategoriesPanel({ categories, query, onAdd, onEdit, onDelete, onToggle }: { categories: CategoryRecord[]; query: string; onAdd: () => void; onEdit: (item: CategoryRecord) => void; onDelete: (id: string) => void; onToggle: (id: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const scopes = Array.from(new Set(categories.flatMap((item) => [...item.availableCountries, ...item.availableRegions]).filter(Boolean)));
  const filtered = searchRows(categories, query, (item) => [item.name_en, item.slug, item.name_ru, item.name_hy, item.availableCountries.join(' '), item.availableRegions.join(' ')])
    .filter((item) => statusFilter === 'all' || (statusFilter === 'active' ? item.isActive : !item.isActive))
    .filter((item) => scopeFilter === 'all' || item.availableCountries.includes(scopeFilter) || item.availableRegions.includes(scopeFilter) || item.availableCities.includes(scopeFilter));
  return (
    <>
      <MarketplaceHeader
        title="Categories Management"
        description="Manage service taxonomy, localized names, category availability, icon previews, sort order, and live ClientHome category publishing."
        action="Add Category"
        onAction={onAdd}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search categories" value={query} onChange={() => undefined} />
        <FilterPills label="Status" options={['all', 'active', 'inactive']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
        <FilterPills label="Country / Region" options={['all', ...scopes]} active={scopeFilter} onChange={setScopeFilter} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Total Categories" value={String(categories.length)} />
        <MiniStat label="Active" value={String(categories.filter((item) => item.isActive).length)} />
        <MiniStat label="Inactive" value={String(categories.filter((item) => !item.isActive).length)} />
        <MiniStat label="Visible Results" value={String(filtered.length)} />
      </View>
      <View style={styles.categoryGrid}>
        {filtered.slice(0, 6).map((category) => <CategoryTile key={category.id} category={category} onEdit={() => onEdit(category)} onToggle={() => onToggle(category.id)} />)}
      </View>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Category Directory" action={`${filtered.length} records`} />
        <DataTable columns={['Preview', 'Translations', 'Slug / Parent', 'Scope', 'Order', 'Status', 'Actions']} rows={filtered.map((category) => [
          <View key="preview" style={styles.previewCell}><View style={[styles.tileIcon, { backgroundColor: category.color }]}><Text style={styles.tileIconText}>{category.icon}</Text></View><Text style={styles.tableText}>{category.color}</Text></View>,
          <View key="names"><Text style={styles.tableText}>EN {category.name_en}</Text><Text style={styles.tableSubText}>RU {category.name_ru}</Text><Text style={styles.tableSubText}>HY {category.name_hy}</Text></View>,
          <View key="slug"><Text style={styles.tableText}>{category.slug}</Text><Text style={styles.tableSubText}>{category.parentCategoryId || 'No parent'}</Text></View>,
          <View key="scope"><Text style={styles.tableText}>{category.availableCountries.join(', ')}</Text><Text style={styles.tableSubText}>{category.availableRegions.join(', ')}</Text></View>,
          String(category.sortOrder),
          <View key="status" style={styles.rowActionWrap}><AdminStatusBadge active={category.isActive} /><Toggle value={category.isActive} onChange={() => onToggle(category.id)} /></View>,
          <RowActions key="actions" onEdit={() => onEdit(category)} onDelete={() => onDelete(category.id)} />,
        ])} />
      </GlassCard>
    </>
  );
}

function CategoryTile({ category, onEdit, onToggle }: { category: CategoryRecord; onEdit: () => void; onToggle: () => void }) {
  return (
    <LinearGradient colors={['#FFFFFF', 'rgba(109,93,251,0.08)']} style={styles.categoryTile}>
      <View style={styles.tileTopRow}>
        <View style={[styles.tileIcon, { backgroundColor: category.color }]}><Text style={styles.tileIconText}>{category.icon}</Text></View>
        <AdminStatusBadge active={category.isActive} />
      </View>
      <Text style={styles.tileTitle}>{category.name_en}</Text>
      <Text style={styles.tileMeta}>{category.slug}</Text>
      <Text style={styles.tileMeta}>{category.availableCities.join(', ')}</Text>
      <View style={styles.actionRow}><TinyButton label="Edit" onPress={onEdit} /><Toggle value={category.isActive} onChange={onToggle} /></View>
    </LinearGradient>
  );
}

function LocationsPanel({
  countries,
  regions,
  cities,
  query,
  onAddCountry,
  onAddRegion,
  onAddCity,
  onEditCountry,
  onEditRegion,
  onEditCity,
  onDeleteCountry,
  onDeleteRegion,
  onDeleteCity,
  onToggleCountry,
  onToggleRegion,
  onToggleCity,
}: {
  countries: CountryRecord[];
  regions: RegionRecord[];
  cities: CityRecord[];
  query: string;
  onAddCountry: () => void;
  onAddRegion: () => void;
  onAddCity: () => void;
  onEditCountry: (item: CountryRecord) => void;
  onEditRegion: (item: RegionRecord) => void;
  onEditCity: (item: CityRecord) => void;
  onDeleteCountry: (id: string) => void;
  onDeleteRegion: (id: string) => void;
  onDeleteCity: (id: string) => void;
  onToggleCountry: (id: string) => void;
  onToggleRegion: (id: string) => void;
  onToggleCity: (id: string) => void;
}) {
  const [level, setLevel] = useState<'countries' | 'regions' | 'cities'>('countries');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const filteredCountries = searchRows(countries, query, (item) => [item.name_en, item.iso2, item.currency, item.capital_en])
    .filter((item) => statusFilter === 'all' || (statusFilter === 'active' ? item.isActive : !item.isActive))
    .filter((item) => countryFilter === 'all' || item.iso2 === countryFilter);
  const filteredRegions = searchRows(regions, query, (item) => [item.name_en, item.countryIso2, item.type_en, item.capital_en])
    .filter((item) => statusFilter === 'all' || (statusFilter === 'active' ? item.isActive : !item.isActive))
    .filter((item) => countryFilter === 'all' || item.countryIso2 === countryFilter);
  const filteredCities = searchRows(cities, query, (item) => [item.name_en, item.regionId, item.latitude, item.longitude])
    .filter((item) => statusFilter === 'all' || (statusFilter === 'active' ? item.isActive : !item.isActive))
    .filter((item) => countryFilter === 'all' || regions.some((region) => region.id === item.regionId && region.countryIso2 === countryFilter));
  return (
    <>
      <MarketplaceHeader
        title="Locations Management"
        description="Control country, region, and city availability for onboarding, marketplace targeting, currency, language, and local ClientHome routing."
        action={level === 'countries' ? 'Add Country' : level === 'regions' ? 'Add Region' : 'Add City'}
        onAction={level === 'countries' ? onAddCountry : level === 'regions' ? onAddRegion : onAddCity}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search locations" value={query} onChange={() => undefined} />
        <FilterPills label="View" options={['countries', 'regions', 'cities']} active={level} onChange={(value) => setLevel(value as typeof level)} />
        <FilterPills label="Status" options={['all', 'active', 'inactive']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
        <FilterPills label="Country" options={['all', ...countries.map((item) => item.iso2)]} active={countryFilter} onChange={setCountryFilter} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Countries" value={String(countries.length)} />
        <MiniStat label="Regions" value={String(regions.length)} />
        <MiniStat label="Cities" value={String(cities.length)} />
        <MiniStat label="Active Countries" value={String(countries.filter((item) => item.isActive).length)} />
      </View>
      <GlassCard style={styles.panel}>
        {level === 'countries' ? (
          <DataTable columns={['Flag', 'Translations', 'ISO', 'Currency / Language', 'Capital', 'Status', 'Actions']} rows={filteredCountries.map((country) => [
            <View key="flag" style={styles.flagPreview}><Text style={styles.flagPreviewText}>{country.emoji || country.iso2}</Text></View>,
            <View key="names"><Text style={styles.tableText}>EN {country.name_en}</Text><Text style={styles.tableSubText}>RU {country.name_ru}</Text><Text style={styles.tableSubText}>HY {country.name_hy}</Text></View>,
            `${country.iso2} / ${country.iso3}`,
            `${country.currency} / ${country.language.toUpperCase()}`,
            `${country.capital_en} / ${country.capital_ru}`,
            <View key="status" style={styles.rowActionWrap}><AdminStatusBadge active={country.isActive} /><Toggle value={country.isActive} onChange={() => onToggleCountry(country.id)} /></View>,
            <RowActions key="actions" onEdit={() => onEditCountry(country)} onDelete={() => onDeleteCountry(country.id)} />,
          ])} />
        ) : null}
        {level === 'regions' ? (
          <DataTable columns={['Country', 'Translations', 'Type', 'Capital', 'Status', 'Actions']} rows={filteredRegions.map((region) => [
            region.countryIso2,
            <View key="names"><Text style={styles.tableText}>EN {region.name_en}</Text><Text style={styles.tableSubText}>RU {region.name_ru}</Text><Text style={styles.tableSubText}>HY {region.name_hy}</Text></View>,
            `${region.type_en} / ${region.type_ru}`,
            `${region.capital_en} / ${region.capital_ru}`,
            <View key="status" style={styles.rowActionWrap}><AdminStatusBadge active={region.isActive} /><Toggle value={region.isActive} onChange={() => onToggleRegion(region.id)} /></View>,
            <RowActions key="actions" onEdit={() => onEditRegion(region)} onDelete={() => onDeleteRegion(region.id)} />,
          ])} />
        ) : null}
        {level === 'cities' ? (
          <DataTable columns={['Region', 'Translations', 'Coordinates', 'Status', 'Actions']} rows={filteredCities.map((city) => [
            city.regionId,
            <View key="names"><Text style={styles.tableText}>EN {city.name_en}</Text><Text style={styles.tableSubText}>RU {city.name_ru}</Text><Text style={styles.tableSubText}>HY {city.name_hy}</Text></View>,
            `${city.latitude}, ${city.longitude}`,
            <View key="status" style={styles.rowActionWrap}><AdminStatusBadge active={city.isActive} /><Toggle value={city.isActive} onChange={() => onToggleCity(city.id)} /></View>,
            <RowActions key="actions" onEdit={() => onEditCity(city)} onDelete={() => onDeleteCity(city.id)} />,
          ])} />
        ) : null}
      </GlassCard>
      <View style={styles.locationTreeGrid}>
        {filteredCountries.slice(0, 4).map((country) => (
          <GlassCard key={country.id} style={styles.locationTreeCard}>
            <View style={styles.sectionHeader}>
              <View><Text style={styles.cardTitle}>{country.emoji} {country.name_en}</Text><Text style={styles.cardMeta}>{country.currency} / {country.language.toUpperCase()}</Text></View>
              <AdminStatusBadge active={country.isActive} />
            </View>
            {regions.filter((region) => region.countryIso2 === country.iso2).slice(0, 4).map((region) => (
              <View key={region.id} style={styles.locationTreeRow}>
                <Text style={styles.tableText}>{region.name_en}</Text>
                <Text style={styles.tableSubText}>{cities.filter((city) => city.regionId === region.id).length} cities</Text>
              </View>
            ))}
          </GlassCard>
        ))}
      </View>
    </>
  );
}

function TranslationsPanel({
  translations,
  query,
  onAdd,
  onEdit,
  onInlineSave,
  onDelete,
  onCopyKey,
  onExport,
  onImport,
}: {
  translations: TranslationRecord[];
  query: string;
  onAdd: () => void;
  onEdit: (item: TranslationRecord) => void;
  onInlineSave: (item: TranslationRecord) => void;
  onDelete: (id: string) => void;
  onCopyKey: (key: string) => void;
  onExport: () => void;
  onImport: () => void;
}) {
  const { t } = useTranslation();
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TranslationRecord['status']>('all');
  const [inlineDrafts, setInlineDrafts] = useState<Record<string, TranslationRecord>>({});
  const moduleOptions = Array.from(new Set([...translationModules, ...translations.map((item) => item.module)]));
  const filtered = searchRows(translations, query, (item) => [item.key, item.module, item.ru, item.en, item.hy])
    .filter((item) => moduleFilter === 'all' || item.module === moduleFilter)
    .filter((item) => statusFilter === 'all' || item.status === statusFilter);
  const missingCount = translations.filter((item) => item.status === 'missing').length;
  return (
    <>
      <MarketplaceHeader
        title={t('adminTranslations.title', 'Translations Management')}
        description="Manage application copy across Russian, Armenian, and English. Changes are live through TranslationProvider and persisted locally."
        action="Add Translation"
        onAction={onAdd}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search translations" value={query} onChange={() => undefined} />
        <FilterPills label="Module" options={['all', ...moduleOptions]} active={moduleFilter} onChange={setModuleFilter} />
        <FilterPills label="Status" options={['all', 'complete', 'missing']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Translation Keys" value={String(translations.length)} />
        <MiniStat label="Complete" value={String(translations.filter((item) => item.status === 'complete').length)} />
        <MiniStat label="Missing" value={String(missingCount)} />
        <MiniStat label="Visible Results" value={String(filtered.length)} />
      </View>
      <GlassCard style={styles.panel}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Translation Manager</Text>
            {missingCount > 0 ? <Text style={styles.warningText}>{missingCount} missing translations need review</Text> : null}
          </View>
          <View style={styles.rowActionWrap}>
            <TinyButton label="Export JSON" onPress={onExport} />
            <TinyButton label="Import JSON" onPress={onImport} />
          </View>
        </View>
        <DataTable columns={['Key', 'Module', 'RU', 'EN', 'HY', 'Status / Updated', 'Actions']} rows={filtered.map((item) => {
          const draft = inlineDrafts[item.id] ?? item;
          const saveDraft = () => onInlineSave({ ...draft, status: translationStatus(draft), updatedAt: nowStamp() });
          const patchDraft = (patch: Partial<TranslationRecord>) => setInlineDrafts((items) => ({ ...items, [item.id]: { ...draft, ...patch } }));

          return [
            <View key="key"><Text style={styles.tableText}>{item.key}</Text><TinyButton label="Copy" onPress={() => onCopyKey(item.key)} /></View>,
            item.module,
            <InlineTranslationInput key="ru" value={draft.ru} onChange={(value) => patchDraft({ ru: value })} />,
            <InlineTranslationInput key="en" value={draft.en} onChange={(value) => patchDraft({ en: value })} />,
            <InlineTranslationInput key="hy" value={draft.hy} onChange={(value) => patchDraft({ hy: value })} />,
            <View key="status"><Badge label={translationStatus(draft)} tone={translationStatus(draft) === 'missing' ? 'gold' : 'green'} /><Text style={styles.tableSubText}>{item.updatedAt}</Text></View>,
            <View key="actions" style={styles.rowActionWrap}><TinyButton label="Save" onPress={saveDraft} /><TinyButton label="Edit" onPress={() => onEdit(item)} /><TinyButton label="Delete" onPress={() => onDelete(item.id)} /></View>,
          ];
        })} />
      </GlassCard>
    </>
  );
}

function UsersPanel({ users, query, onEdit, onToggle, onPremium, onActivate }: { users: AdminUser[]; query: string; onEdit: (item: AdminUser) => void; onToggle: (id: string) => void; onPremium: (id: string) => void; onActivate: (id: string) => void }) {
  const [tab, setTab] = useState<AdminUser['role']>('Client');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | AdminUser['verification']>('all');
  const filtered = searchRows(users.filter((user) => user.role === tab), query, (item) => [item.name, item.city, item.categories])
    .filter((user) => statusFilter === 'all' || user.status === statusFilter)
    .filter((user) => verificationFilter === 'all' || user.verification === verificationFilter);
  return (
    <>
      <MarketplaceHeader
        title="Users Management"
        description="Manage clients, masters, companies, and administrators with verification status, premium access, activity, and account controls."
        action="View Audit Logs"
        onAction={() => undefined}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search users" value={query} onChange={() => undefined} />
        <FilterPills label="Role" options={['Client', 'Master', 'Company', 'Admin']} active={tab} onChange={(value) => setTab(value as AdminUser['role'])} />
        <FilterPills label="Status" options={['all', 'active', 'pending', 'blocked']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
        <FilterPills label="Verification" options={['all', 'verified', 'pending', 'rejected']} active={verificationFilter} onChange={(value) => setVerificationFilter(value as typeof verificationFilter)} />
        <FilterPills label="View" options={['table', 'grid']} active={viewMode} onChange={(value) => setViewMode(value as typeof viewMode)} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Visible Users" value={String(filtered.length)} />
        <MiniStat label="Verified" value={String(filtered.filter((item) => item.verification === 'verified').length)} />
        <MiniStat label="Premium" value={String(filtered.filter((item) => item.premium).length)} />
        <MiniStat label="Blocked" value={String(filtered.filter((item) => item.status === 'blocked').length)} />
      </View>
      {viewMode === 'grid' ? (
        <View style={styles.userGrid}>
          {filtered.map((user) => <UserCard key={user.id} user={user} onEdit={() => onEdit(user)} onToggle={() => onToggle(user.id)} onPremium={() => onPremium(user.id)} onActivate={() => onActivate(user.id)} />)}
        </View>
      ) : (
        <GlassCard style={styles.panel}>
          <DataTable columns={['User', 'Role', 'City / Categories', 'Verification', 'Activity', 'Premium', 'Actions']} rows={filtered.map((user) => [
            <UserIdentity key="user" user={user} />,
            <Badge key="role" label={user.role} tone={user.role === 'Master' ? 'blue' : user.role === 'Admin' ? 'gold' : 'green'} />,
            <View key="scope"><Text style={styles.tableText}>{user.city}</Text><Text style={styles.tableSubText}>{user.categories}</Text></View>,
            <Badge key="verification" label={user.verification} tone={user.verification === 'verified' ? 'green' : user.verification === 'pending' ? 'gold' : 'blue'} />,
            <View key="activity"><AdminStatusBadge active={user.status === 'active'} /><Text style={styles.tableSubText}>{user.completedOrders} orders / {user.rating} rating</Text></View>,
            <View key="premium" style={styles.rowActionWrap}><Text style={styles.tableText}>{user.premium ? 'Premium' : 'Standard'}</Text><Toggle value={user.premium} onChange={() => onPremium(user.id)} /></View>,
            <View key="actions" style={styles.rowActionWrap}><TinyButton label="Profile" onPress={() => onEdit(user)} /><TinyButton label={user.status === 'blocked' ? 'Unblock' : 'Block'} onPress={() => onToggle(user.id)} /><TinyButton label={user.status === 'active' ? 'Deactivate' : 'Activate'} onPress={() => onActivate(user.id)} /></View>,
          ])} />
        </GlassCard>
      )}
    </>
  );
}

function VerificationPanel({
  masters,
  query,
  onApprove,
  onReject,
  onPremium,
  onToggleVerified,
}: {
  masters: AdminUser[];
  query: string;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onPremium: (id: string) => void;
  onToggleVerified: (id: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'premium'>('all');
  const [rejecting, setRejecting] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState('');
  const filtered = searchRows(masters, query, (item) => [item.name, item.city, item.categories, item.verification])
    .filter((master) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'approved') return master.verification === 'verified';
      if (statusFilter === 'premium') return master.premium;
      return master.verification === statusFilter;
    });
  return (
    <>
      <MarketplaceHeader
        title="Master Verification"
        description="Review master identity, selfie, certificates, professional score, verified badges, and premium status before publishing profiles."
        action="Pending Queue"
        onAction={() => setStatusFilter('pending')}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search verifications" value={query} onChange={() => undefined} />
        <FilterPills label="Verification status" options={['all', 'pending', 'approved', 'rejected', 'premium']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Pending Review" value={String(masters.filter((item) => item.verification === 'pending').length)} />
        <MiniStat label="Approved Masters" value={String(masters.filter((item) => item.verification === 'verified').length)} />
        <MiniStat label="Rejected" value={String(masters.filter((item) => item.verification === 'rejected').length)} />
        <MiniStat label="Premium" value={String(masters.filter((item) => item.premium).length)} />
      </View>
      <View style={styles.operationGrid}>
        {filtered.map((master) => (
          <LinearGradient key={master.id} colors={['#FFFFFF', 'rgba(109,93,251,0.08)']} style={styles.verificationCard}>
            <View style={styles.sectionHeader}>
              <UserIdentity user={master} />
              <Badge label={master.verification === 'verified' ? 'approved' : master.verification} tone={master.verification === 'verified' ? 'green' : master.verification === 'pending' ? 'gold' : 'blue'} />
            </View>
            <View style={styles.profileRows}>
              <ProfileInfo label="Profession" value={master.categories} />
              <ProfileInfo label="City" value={master.city} />
              <ProfileInfo label="Orders" value={String(master.completedOrders)} />
              <ProfileInfo label="Rating" value={String(master.rating)} />
            </View>
            <Text style={styles.cardMeta}>Registered {master.completedOrders > 100 ? 'May 12, 2026' : 'May 24, 2026'}</Text>
            <View style={styles.docGrid}>
              {['ID document', 'Selfie preview', 'Certificates'].map((doc, index) => (
                <LinearGradient key={doc} colors={index === 0 ? ['#172554', '#1D4ED8'] : index === 1 ? ['#312E81', '#6D5DFB'] : ['#064E3B', '#0F766E']} style={styles.documentPreview}>
                  <Text style={styles.documentIcon}>{index === 0 ? 'ID' : index === 1 ? 'SF' : 'CT'}</Text>
                  <Text style={styles.docText}>{doc}</Text>
                </LinearGradient>
              ))}
            </View>
            <View style={styles.toggleGrid}>
              <ToggleRow label="Verified badge" value={master.verification === 'verified'} onChange={() => onToggleVerified(master.id)} />
              <ToggleRow label="Premium badge" value={master.premium} onChange={() => onPremium(master.id)} />
            </View>
            <View style={styles.actionRow}>
              <ActionButton label="Approve" onPress={() => onApprove(master.id)} />
              <ActionButton label="Reject" variant="danger" onPress={() => { setRejecting(master); setReason(''); }} />
            </View>
          </LinearGradient>
        ))}
      </View>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Verification Table" action={`${filtered.length} applications`} />
        <DataTable columns={['Master', 'Profession / City', 'Orders', 'Rating', 'Verification', 'Badges', 'Actions']} rows={filtered.map((master) => [
          <UserIdentity key="master" user={master} />,
          <View key="scope"><Text style={styles.tableText}>{master.categories}</Text><Text style={styles.tableSubText}>{master.city}</Text></View>,
          String(master.completedOrders),
          String(master.rating),
          <Badge key="verification" label={master.verification === 'verified' ? 'approved' : master.verification} tone={master.verification === 'verified' ? 'green' : master.verification === 'pending' ? 'gold' : 'blue'} />,
          <View key="badges"><Text style={styles.tableText}>{master.premium ? 'Premium' : 'Standard'}</Text><Text style={styles.tableSubText}>{master.status}</Text></View>,
          <View key="actions" style={styles.rowActionWrap}><TinyButton label="Approve" onPress={() => onApprove(master.id)} /><TinyButton label="Reject" onPress={() => { setRejecting(master); setReason(''); }} /><TinyButton label="Premium" onPress={() => onPremium(master.id)} /></View>,
        ])} />
      </GlassCard>
      <Modal transparent animationType="fade" visible={Boolean(rejecting)} onRequestClose={() => setRejecting(null)}>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#FFFFFF', '#F8F0FF']} style={styles.rejectModal}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.modalTitle}>Reject verification</Text>
                <Text style={styles.cardMeta}>{rejecting?.name}</Text>
              </View>
              <Pressable onPress={() => setRejecting(null)}><Text style={styles.closeText}>Close</Text></Pressable>
            </View>
            <AdminInput label="Rejection reason" value={reason} onChange={setReason} />
            <View style={styles.actionRow}>
              <ActionButton label="Confirm rejection" variant="danger" onPress={() => { if (rejecting) onReject(rejecting.id, reason); setRejecting(null); }} />
              <ActionButton label="Cancel" variant="secondary" onPress={() => setRejecting(null)} />
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

function OrdersPanel({ orders, query, onDetails, onStatus }: { orders: OrderRecord[]; query: string; onDetails: (item: OrderRecord) => void; onStatus: (id: string, status: OrderRecord['status']) => void }) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderRecord['status']>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [masterFilter, setMasterFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | OrderRecord['secureDeal']>('all');
  const cities = Array.from(new Set(orders.map((order) => order.city)));
  const masters = Array.from(new Set(orders.map((order) => order.master)));
  const clients = Array.from(new Set(orders.map((order) => order.client)));
  const filtered = searchRows(orders, query, (item) => [item.id, item.client, item.master, item.city, item.status, item.secureDeal])
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .filter((order) => cityFilter === 'all' || order.city === cityFilter)
    .filter((order) => masterFilter === 'all' || order.master === masterFilter)
    .filter((order) => clientFilter === 'all' || order.client === clientFilter)
    .filter((order) => paymentFilter === 'all' || order.secureDeal === paymentFilter);
  return (
    <>
      <MarketplaceHeader
        title="Orders Management"
        description="Track marketplace jobs, payment holds, disputes, refunds, client and master activity, and operational status flow."
        action="Open Disputes"
        onAction={() => setStatusFilter('disputed')}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search orders" value={query} onChange={() => undefined} />
        <FilterPills label="Status" options={['all', 'pending', 'accepted', 'master_on_way', 'in_progress', 'completed', 'cancelled', 'refunded', 'disputed']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
        <FilterPills label="City" options={['all', ...cities]} active={cityFilter} onChange={setCityFilter} />
        <FilterPills label="Master" options={['all', ...masters]} active={masterFilter} onChange={setMasterFilter} />
        <FilterPills label="Client" options={['all', ...clients]} active={clientFilter} onChange={setClientFilter} />
        <FilterPills label="Payment" options={['all', 'unpaid', 'reserved', 'paid', 'refunded', 'failed']} active={paymentFilter} onChange={(value) => setPaymentFilter(value as typeof paymentFilter)} />
        <FilterPills label="View" options={['table', 'grid']} active={viewMode} onChange={(value) => setViewMode(value as typeof viewMode)} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Visible Orders" value={String(filtered.length)} />
        <MiniStat label="Active Flow" value={String(orders.filter((item) => ['pending', 'accepted', 'master_on_way', 'in_progress'].includes(item.status)).length)} />
        <MiniStat label="Disputes" value={String(orders.filter((item) => item.status === 'disputed').length)} />
        <MiniStat label="Reserved Funds" value={amd(orders.filter((item) => item.secureDeal === 'reserved').reduce((sum, item) => sum + item.amount, 0))} />
      </View>
      {viewMode === 'grid' ? (
        <View style={styles.operationGrid}>
          {filtered.map((order, index) => <OrderCard key={order.id} order={order} index={index} onDetails={() => onDetails(order)} onStatus={(status) => onStatus(order.id, status)} />)}
        </View>
      ) : (
        <GlassCard style={styles.panel}>
          <SectionTitle title="Orders Table" action={`${filtered.length} records`} />
          <DataTable columns={['Order', 'Client', 'Master', 'Category / City', 'Amount', 'Payment', 'Current Status', 'Actions']} rows={filtered.map((order, index) => [
            <View key="order"><Text style={styles.tableText}>{order.id}</Text><Text style={styles.tableSubText}>May {23 + index}, 2026</Text></View>,
            order.client,
            order.master,
            <View key="scope"><Text style={styles.tableText}>{orderCategory(order)}</Text><Text style={styles.tableSubText}>{order.city}</Text></View>,
            amd(order.amount),
            <Badge key="payment" label={order.secureDeal} tone={order.secureDeal === 'paid' ? 'green' : order.secureDeal === 'reserved' ? 'gold' : 'blue'} />,
            <Badge key="status" label={order.status} tone={order.status === 'completed' ? 'green' : order.status === 'disputed' ? 'gold' : 'blue'} />,
            <View key="actions" style={styles.rowActionWrap}><TinyButton label="Details" onPress={() => onDetails(order)} /><TinyButton label="Complete" onPress={() => onStatus(order.id, 'completed')} /><TinyButton label="Refund" onPress={() => onStatus(order.id, 'refunded')} /></View>,
          ])} />
        </GlassCard>
      )}
    </>
  );
}

function OrderCard({ order, index, onDetails, onStatus }: { order: OrderRecord; index: number; onDetails: () => void; onStatus: (status: OrderRecord['status']) => void }) {
  const flow: OrderRecord['status'][] = ['pending', 'accepted', 'master_on_way', 'in_progress', 'completed'];
  const activeIndex = Math.max(0, flow.indexOf(order.status));
  return (
    <LinearGradient colors={['#FFFFFF', 'rgba(45,124,255,0.08)']} style={styles.orderCard}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.cardTitle}>{order.id}</Text>
          <Text style={styles.cardMeta}>Created May {23 + index}, 2026 / {order.city}</Text>
        </View>
        <Badge label={order.status} tone={order.status === 'completed' ? 'green' : order.status === 'disputed' ? 'gold' : 'blue'} />
      </View>
      <View style={styles.profileRows}>
        <ProfileInfo label="Client" value={order.client} />
        <ProfileInfo label="Master" value={order.master} />
        <ProfileInfo label="Category" value={orderCategory(order)} />
        <ProfileInfo label="Amount" value={amd(order.amount)} />
      </View>
      <View style={styles.orderTimeline}>
        {flow.map((status, stepIndex) => (
          <View key={status} style={styles.timelineStep}>
            <View style={[styles.timelineDot, stepIndex <= activeIndex && styles.timelineDotActive]} />
            <Text style={[styles.timelineText, stepIndex <= activeIndex && styles.timelineTextActive]}>{status.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actionRow}>
        <TinyButton label="Details" onPress={onDetails} />
        <TinyButton label="Accept" onPress={() => onStatus('accepted')} />
        <TinyButton label="Complete" onPress={() => onStatus('completed')} />
        <TinyButton label="Refund" onPress={() => onStatus('refunded')} />
      </View>
    </LinearGradient>
  );
}

function orderCategory(order: OrderRecord) {
  if (order.master.toLowerCase().includes('clean')) return 'Cleaning';
  if (order.amount > 20000) return 'Repair';
  if (order.status === 'disputed') return 'Support case';
  return 'Home services';
}

function FinancePanel({ orders, users, settings, onChange }: { orders: OrderRecord[]; users: AdminUser[]; settings: FinanceSettings; onChange: (settings: FinanceSettings) => void }) {
  const commission = Number(settings.commissionPercent) / 100;
  const payout = Number(settings.payoutPercent) / 100;
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const paid = orders.filter((order) => order.secureDeal === 'paid');
  const refunded = orders.filter((order) => order.secureDeal === 'refunded' || order.status === 'refunded');
  const pendingPayouts = orders.filter((order) => order.secureDeal === 'reserved').reduce((sum, order) => sum + order.amount * payout, 0);
  const completedPayouts = paid.reduce((sum, order) => sum + order.amount * payout, 0);
  const transactions = orders.map((order, index) => ({
    id: `trx-${order.id}`,
    user: order.secureDeal === 'paid' ? order.master : order.client,
    amount: order.status === 'refunded' ? -order.amount : order.amount,
    type: order.status === 'refunded' ? 'refund' : order.secureDeal === 'paid' ? 'payout' : 'payment hold',
    status: order.status === 'refunded' ? 'refunded' : order.secureDeal,
    method: settings.defaultMethod,
    createdAt: `May ${23 + index}, 2026`,
  }));
  return (
    <>
      <MarketplaceHeader
        title="Finance Dashboard"
        description="Monitor revenue, commission, master payouts, wallet exposure, payment methods, refund requests, and secure deal ledger health."
        action="Export Ledger"
        onAction={() => undefined}
      />
      <View style={styles.metricsGrid}>
        <MetricCard label="Total Revenue" value={amd(totalRevenue)} trend="+12.5%" icon="$" />
        <MetricCard label="Platform Commission" value={amd(totalRevenue * commission)} trend="+8.3%" icon="%" />
        <MetricCard label="Pending Payouts" value={amd(pendingPayouts)} trend="+4.8%" icon="P" />
        <MetricCard label="Completed Payouts" value={amd(completedPayouts)} trend="+7.1%" icon="OK" />
        <MetricCard label="Refund Requests" value={amd(refunded.reduce((sum, order) => sum + order.amount, 0) + Number(settings.refundReserve || 0))} trend="+1.2%" icon="R" />
      </View>
      <View style={styles.financeChartGrid}>
        <ChartPlaceholder title="Revenue Overview" variant="line" large />
        <ChartPlaceholder title="Payout Requests" />
        <ActivityFeed title="Finance Activity" items={transactions.slice(0, 5).map((item) => `${item.type} / ${item.id} / ${amd(Math.abs(item.amount))}`)} />
      </View>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Commission & Payment Settings" action={settings.isActive ? 'Finance active' : 'Finance disabled'} />
        <View style={styles.formGrid}>
          <AdminInput label="Commission percent" value={settings.commissionPercent} onChange={(value) => onChange({ ...settings, commissionPercent: value })} />
          <AdminInput label="Payout percent" value={settings.payoutPercent} onChange={(value) => onChange({ ...settings, payoutPercent: value })} />
          <AdminInput label="Refund reserve" value={settings.refundReserve} onChange={(value) => onChange({ ...settings, refundReserve: value })} />
          <AdminInput label="Default method" value={settings.defaultMethod} onChange={(value) => onChange({ ...settings, defaultMethod: value })} />
        </View>
        <ToggleRow label="Finance module active" value={settings.isActive} onChange={() => onChange({ ...settings, isActive: !settings.isActive })} />
      </GlassCard>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Transactions / Payout Requests" action="Secure deal ledger" />
        <DataTable columns={['Transaction', 'User', 'Amount', 'Type', 'Status', 'Method', 'Created At']} rows={transactions.map((transaction) => [
          transaction.id,
          transaction.user,
          amd(transaction.amount),
          transaction.type,
          <Badge key="status" label={transaction.status} tone={transaction.status === 'paid' ? 'green' : transaction.status === 'reserved' ? 'gold' : 'blue'} />,
          transaction.method,
          transaction.createdAt,
        ])} />
      </GlassCard>
      <View style={styles.financeLedgerGrid}>
        <GlassCard style={styles.financeLedgerCard}>
          <SectionTitle title="Wallet Balances" action={`${users.length} users`} />
          {users.slice(0, 5).map((user, index) => (
            <View key={user.id} style={styles.ledgerRow}>
              <UserIdentity user={user} />
              <Text style={styles.tableText}>{amd((index + 1) * 18000)}</Text>
            </View>
          ))}
        </GlassCard>
        <GlassCard style={styles.financeLedgerCard}>
          <SectionTitle title="Payment Methods" action={settings.defaultMethod} />
          {['Idram', 'Visa / Mastercard', 'Bank transfer'].map((method, index) => (
            <View key={method} style={styles.ledgerRow}>
              <View>
                <Text style={styles.tableText}>{method}</Text>
                <Text style={styles.tableSubText}>{index === 0 ? 'Default local method' : 'Ready placeholder'}</Text>
              </View>
              <AdminStatusBadge active={index === 0 || settings.isActive} />
            </View>
          ))}
        </GlassCard>
      </View>
    </>
  );
}

function adminModuleKey(module: AdminModule) {
  const keyByModule: Record<AdminModule, string> = {
    dashboard: 'adminDashboard.title',
    categories: 'adminCategories.title',
    locations: 'adminLocations.title',
    translations: 'adminTranslations.title',
    users: 'adminUsers.title',
    verification: 'adminVerification.title',
    orders: 'adminOrders.title',
    finance: 'adminFinance.title',
    marketing: 'adminMarketing.title',
    support: 'adminSupport.title',
    registration: 'adminRegistration.title',
    telegram: 'adminTelegram.title',
    logs: 'adminLogs.title',
    settings: 'settings.title',
  };
  return keyByModule[module];
}

function MarketingPanel({
  banners,
  query,
  onAddBanner,
  onEditBanner,
  onToggle,
  onDelete,
}: {
  banners: MarketingBanner[];
  query: string;
  onAddBanner: () => void;
  onEditBanner: (item: MarketingBanner) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [tab, setTab] = useState<'banners' | 'ads' | 'promos' | 'featured' | 'push'>('banners');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const targets = Array.from(new Set(banners.map((banner) => banner.target).filter(Boolean)));
  const filtered = searchRows(banners, query, (item) => [item.title_en, item.title_ru, item.title_hy, item.target, item.link])
    .filter((banner) => statusFilter === 'all' || (statusFilter === 'active' ? banner.isActive : !banner.isActive))
    .filter((banner) => targetFilter === 'all' || banner.target === targetFilter);
  return (
    <>
      <MarketplaceHeader
        title="Marketing Center"
        description="Manage banners, ads, promo codes, featured masters, push campaigns, and geo targeting for ClientHome growth surfaces."
        action="Add Campaign"
        onAction={onAddBanner}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search campaigns" value={query} onChange={() => undefined} />
        <FilterPills label="Channel" options={['banners', 'ads', 'promos', 'featured', 'push']} active={tab} onChange={(value) => setTab(value as typeof tab)} />
        <FilterPills label="Status" options={['all', 'active', 'inactive']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
        <FilterPills label="City / Region Target" options={['all', ...targets]} active={targetFilter} onChange={setTargetFilter} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Active Banners" value={String(banners.filter((item) => item.isActive).length)} />
        <MiniStat label="Promo Codes" value="4" />
        <MiniStat label="Featured Masters" value="12" />
        <MiniStat label="Push Campaigns" value={String(filtered.length + 3)} />
      </View>
      <View style={styles.growthGrid}>
        {filtered.map((banner, index) => <MarketingCampaignCard key={banner.id} banner={banner} index={index} onEdit={() => onEditBanner(banner)} onToggle={() => onToggle(banner.id)} onDelete={() => onDelete(banner.id)} />)}
      </View>
      <View style={styles.growthGrid}>
        <GrowthChannelCard title="Ads Management" metric={`${Math.max(1, filtered.length)} ad sets`} subtitle="Search, city feed, and profile placement inventory" status={tab === 'ads' ? 'Selected' : 'Ready'} />
        <GrowthChannelCard title="Promo Codes" metric="FIXORA20" subtitle="20% discount / Yerevan / new clients" status={tab === 'promos' ? 'Selected' : 'Active'} />
        <GrowthChannelCard title="Featured Masters" metric="12 masters" subtitle="Premium ranking surface for verified providers" status={tab === 'featured' ? 'Selected' : 'Live'} />
        <GrowthChannelCard title="Push Campaigns" metric="3 scheduled" subtitle="Segmented push notifications by city and category" status={tab === 'push' ? 'Selected' : 'Queued'} />
      </View>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Campaign Directory" action={`${filtered.length} campaigns`} />
        <DataTable columns={['Campaign', 'RU / HY', 'Targeting', 'Schedule', 'Status', 'Actions']} rows={filtered.map((banner) => {
          const target = marketingTargetParts(banner.target);
          return [
            <View key="title"><Text style={styles.tableText}>{banner.title_en}</Text><Text style={styles.tableSubText}>{banner.link || 'ClientHome placement'}</Text></View>,
            <View key="langs"><Text style={styles.tableText}>{banner.title_ru}</Text><Text style={styles.tableSubText}>{banner.title_hy}</Text></View>,
            <View key="target"><Text style={styles.tableText}>{target.country} / {target.region}</Text><Text style={styles.tableSubText}>{target.city}</Text></View>,
            `${banner.startDate} - ${banner.endDate}`,
            <View key="status" style={styles.rowActionWrap}><AdminStatusBadge active={banner.isActive} /><Toggle value={banner.isActive} onChange={() => onToggle(banner.id)} /></View>,
            <View key="actions" style={styles.rowActionWrap}><TinyButton label="Edit" onPress={() => onEditBanner(banner)} /><TinyButton label="Delete" onPress={() => onDelete(banner.id)} /></View>,
          ];
        })} />
      </GlassCard>
    </>
  );
}

function MarketingCampaignCard({ banner, index, onEdit, onToggle, onDelete }: { banner: MarketingBanner; index: number; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const target = marketingTargetParts(banner.target);
  return (
    <LinearGradient colors={index % 2 === 0 ? ['#FFFFFF', 'rgba(214,91,255,0.1)'] : ['#FFFFFF', 'rgba(34,197,94,0.08)']} style={styles.marketingCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.campaignPreview}>
          <Text style={styles.campaignPreviewText}>{banner.image || 'AD'}</Text>
        </View>
        <AdminStatusBadge active={banner.isActive} />
      </View>
      <Text style={styles.cardTitle}>{banner.title_en}</Text>
      <Text style={styles.cardMeta}>{target.country} / {target.region} / {target.city}</Text>
      <View style={styles.profileRows}>
        <ProfileInfo label="Start" value={banner.startDate} />
        <ProfileInfo label="End" value={banner.endDate} />
      </View>
      <View style={styles.actionRow}>
        <TinyButton label="Edit" onPress={onEdit} />
        <TinyButton label={banner.isActive ? 'Disable' : 'Enable'} onPress={onToggle} />
        <TinyButton label="Delete" onPress={onDelete} />
      </View>
    </LinearGradient>
  );
}

function GrowthChannelCard({ title, metric, subtitle, status }: { title: string; metric: string; subtitle: string; status: string }) {
  return (
    <GlassCard style={styles.growthChannelCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Badge label={status} tone={status === 'Active' || status === 'Live' ? 'green' : 'blue'} />
      </View>
      <Text style={styles.metricValue}>{metric}</Text>
      <Text style={styles.cardMeta}>{subtitle}</Text>
    </GlassCard>
  );
}

function marketingTargetParts(target: string) {
  const [country = 'All countries', region = 'All regions', city = 'All cities'] = target.split('/').map((part) => part.trim()).filter(Boolean);
  return { country, region, city };
}

function SupportPanel({ tickets, query, onStatus, onAssign }: { tickets: SupportTicket[]; query: string; onStatus: (id: string, status: SupportTicket['status']) => void; onAssign: (id: string, assigned: string) => void }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicket['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [replying, setReplying] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const types = Array.from(new Set(tickets.map((ticket) => ticket.type)));
  const filtered = searchRows(tickets, query, (ticket) => [ticket.id, ticket.type, ticket.assigned, ticket.status, ticket.orderId, ticket.message])
    .filter((ticket) => typeFilter === 'all' || ticket.type === typeFilter)
    .filter((ticket) => statusFilter === 'all' || ticket.status === statusFilter)
    .filter((ticket) => priorityFilter === 'all' || supportPriority(ticket) === priorityFilter);
  return (
    <>
      <MarketplaceHeader
        title="Support Desk"
        description="Handle tickets, complaints, order disputes, user reports, operator assignment, response previews, and priority queues."
        action="Open Queue"
        onAction={() => setStatusFilter('open')}
      />
      <GlassCard style={styles.marketToolbar}>
        <AdminInput label="Search tickets" value={query} onChange={() => undefined} />
        <FilterPills label="Type" options={['all', ...types]} active={typeFilter} onChange={setTypeFilter} />
        <FilterPills label="Status" options={['all', 'open', 'in progress', 'review', 'closed']} active={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} />
        <FilterPills label="Priority" options={['all', 'high', 'medium', 'low']} active={priorityFilter} onChange={(value) => setPriorityFilter(value as typeof priorityFilter)} />
      </GlassCard>
      <View style={styles.marketStats}>
        <MiniStat label="Open Tickets" value={String(tickets.filter((item) => item.status === 'open').length)} />
        <MiniStat label="Order Disputes" value={String(tickets.filter((item) => item.type.toLowerCase().includes('dispute')).length)} />
        <MiniStat label="Complaints" value={String(tickets.filter((item) => item.type.toLowerCase().includes('complaint')).length)} />
        <MiniStat label="High Priority" value={String(tickets.filter((item) => supportPriority(item) === 'high').length)} />
      </View>
      <View style={styles.growthGrid}>
        {filtered.slice(0, 4).map((ticket) => (
          <LinearGradient key={ticket.id} colors={['#FFFFFF', 'rgba(109,93,251,0.08)']} style={styles.supportCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.cardTitle}>{ticket.id}</Text>
                <Text style={styles.cardMeta}>{supportUser(ticket)} / {supportCreatedAt(ticket)}</Text>
              </View>
              <Badge label={supportPriority(ticket)} tone={supportPriority(ticket) === 'high' ? 'gold' : supportPriority(ticket) === 'medium' ? 'blue' : 'green'} />
            </View>
            <Text style={styles.tableText}>{ticket.type}</Text>
            <Text style={styles.bodyText}>{supportLastMessage(ticket)}</Text>
            <View style={styles.profileRows}>
              <ProfileInfo label="Assigned" value={ticket.assigned} />
              <ProfileInfo label="Order" value={ticket.orderId} />
            </View>
            <View style={styles.actionRow}>
              <TinyButton label="Reply" onPress={() => { setReplying(ticket); setReply(''); }} />
              <TinyButton label="Assign A" onPress={() => onAssign(ticket.id, 'Operator A')} />
              <TinyButton label="Review" onPress={() => onStatus(ticket.id, 'review')} />
              <TinyButton label="Close" onPress={() => onStatus(ticket.id, 'closed')} />
            </View>
          </LinearGradient>
        ))}
      </View>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Tickets Table" action={`${filtered.length} tickets`} />
        <DataTable columns={['Ticket', 'User / Type', 'Priority', 'Status', 'Assigned', 'Conversation Preview', 'Actions']} rows={filtered.map((ticket) => [
          <View key="ticket"><Text style={styles.tableText}>{ticket.id}</Text><Text style={styles.tableSubText}>{supportCreatedAt(ticket)}</Text></View>,
          <View key="user"><Text style={styles.tableText}>{supportUser(ticket)}</Text><Text style={styles.tableSubText}>{ticket.type}</Text></View>,
          <Badge key="priority" label={supportPriority(ticket)} tone={supportPriority(ticket) === 'high' ? 'gold' : supportPriority(ticket) === 'medium' ? 'blue' : 'green'} />,
          <Badge key="status" label={ticket.status} tone={ticket.status === 'closed' ? 'green' : ticket.status === 'open' ? 'gold' : 'blue'} />,
          ticket.assigned,
          <Text key="message" style={styles.tableText}>{supportLastMessage(ticket)}</Text>,
          <View key="actions" style={styles.rowActionWrap}><TinyButton label="Reply" onPress={() => { setReplying(ticket); setReply(''); }} /><TinyButton label="Assign B" onPress={() => onAssign(ticket.id, 'Operator B')} /><TinyButton label="Progress" onPress={() => onStatus(ticket.id, 'in progress')} /><TinyButton label="Close" onPress={() => onStatus(ticket.id, 'closed')} /></View>,
        ])} />
      </GlassCard>
      <Modal transparent animationType="fade" visible={Boolean(replying)} onRequestClose={() => setReplying(null)}>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#FFFFFF', '#F8F0FF']} style={styles.rejectModal}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.modalTitle}>Support response</Text>
                <Text style={styles.cardMeta}>{replying?.id} / {replying ? supportUser(replying) : ''}</Text>
              </View>
              <Pressable onPress={() => setReplying(null)}><Text style={styles.closeText}>Close</Text></Pressable>
            </View>
            <Text style={styles.bodyText}>{replying ? supportLastMessage(replying) : ''}</Text>
            <AdminInput label="Response message" value={reply} onChange={setReply} />
            <View style={styles.actionRow}>
              <ActionButton label="Send response" onPress={() => { if (replying) onStatus(replying.id, 'in progress'); setReplying(null); }} />
              <ActionButton label="Close ticket" variant="secondary" onPress={() => { if (replying) onStatus(replying.id, 'closed'); setReplying(null); }} />
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

function supportPriority(ticket: SupportTicket): 'low' | 'medium' | 'high' {
  if (ticket.type.toLowerCase().includes('dispute') || ticket.type.toLowerCase().includes('complaint')) return 'high';
  if (ticket.status === 'review' || ticket.status === 'in progress') return 'medium';
  return 'low';
}

function supportUser(ticket: SupportTicket) {
  if (ticket.id.endsWith('1')) return 'Mariam K.';
  if (ticket.id.endsWith('2')) return 'Artem S.';
  return 'Georg M.';
}

function supportCreatedAt(ticket: SupportTicket) {
  if (ticket.id.endsWith('1')) return 'May 26, 2026 10:20';
  if (ticket.id.endsWith('2')) return 'May 26, 2026 11:05';
  return 'May 25, 2026 18:45';
}

function supportLastMessage(ticket: SupportTicket) {
  return ticket.message || 'No conversation preview yet.';
}

function AppSettingsPanel({ settings, onChange, onSave }: { settings: AppSettings; onChange: (settings: AppSettings) => void; onSave: () => void }) {
  const toggles: Array<[keyof AppSettings, string]> = [
    ['maintenanceMode', 'Maintenance mode'],
    ['payments', 'Enable payments'],
    ['telegramNotifications', 'Enable Telegram notifications'],
    ['aiRecommendations', 'Enable AI recommendations'],
    ['mapSystem', 'Enable map system'],
  ];
  const activeFlags = toggles.filter(([key]) => Boolean(settings[key])).length;
  const setCommission = (next: number) => onChange({ ...settings, commissionPercent: String(Math.max(0, Math.min(40, next))) });
  return (
    <>
      <MarketplaceHeader
        title="Settings Center"
        description="Control app runtime behavior, payments, Telegram, maps, AI recommendations, language, currency, and release versions."
        action="Save Settings"
        onAction={onSave}
      />
      <View style={styles.marketStats}>
        <MiniStat label="Runtime Flags" value={`${activeFlags}/${toggles.length}`} />
        <MiniStat label="App Version" value={settings.appVersion} />
        <MiniStat label="Default Locale" value={`${settings.defaultLanguage}/${settings.defaultCurrency}`} />
        <MiniStat label="Commission" value={`${settings.commissionPercent}%`} />
      </View>
      <View style={styles.settingsGrid}>
        <GlassCard style={styles.settingsPrimaryCard}>
          <SectionTitle title="Application Defaults" action="Live apply" />
          <View style={styles.formGrid}>
            <AdminInput label="App version" value={settings.appVersion} onChange={(value) => onChange({ ...settings, appVersion: value })} />
            <AdminInput label="Minimum app version" value={settings.minimumAppVersion} onChange={(value) => onChange({ ...settings, minimumAppVersion: value })} />
            <AdminInput label="Default currency" value={settings.defaultCurrency} onChange={(value) => onChange({ ...settings, defaultCurrency: value })} />
            <AdminInput label="Default language" value={settings.defaultLanguage} onChange={(value) => onChange({ ...settings, defaultLanguage: value })} />
            <AdminInput label="Commission percent" value={settings.commissionPercent} onChange={(value) => onChange({ ...settings, commissionPercent: value })} />
          </View>
          <View style={styles.sliderCard}>
            <View>
              <Text style={styles.cardTitle}>Commission slider</Text>
              <Text style={styles.cardMeta}>{settings.commissionPercent}% platform commission</Text>
            </View>
            <View style={styles.rowActionWrap}>
              <TinyButton label="-1" onPress={() => setCommission(Number(settings.commissionPercent) - 1)} />
              <View style={styles.sliderTrack}><View style={[styles.sliderFill, { width: `${Math.min(100, Number(settings.commissionPercent) * 2.5)}%` }]} /></View>
              <TinyButton label="+1" onPress={() => setCommission(Number(settings.commissionPercent) + 1)} />
            </View>
          </View>
          <ActionButton label="Save app settings" onPress={onSave} />
        </GlassCard>
        <GlassCard style={styles.settingsSideCard}>
          <SectionTitle title="Feature Gates" action="Instant UI state" />
          <View style={styles.toggleGrid}>
            {toggles.map(([key, label]) => <ToggleRow key={key} label={label} value={Boolean(settings[key])} onChange={() => onChange({ ...settings, [key]: !settings[key] })} />)}
          </View>
        </GlassCard>
      </View>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Runtime Preview" action={settings.maintenanceMode ? 'Maintenance enabled' : 'Production ready'} />
        <DataTable columns={['Setting', 'Value', 'Impact']} rows={[
          ['Payments', settings.payments ? 'enabled' : 'disabled', 'Secure deal flow'],
          ['Map system', settings.mapSystem ? 'enabled' : 'disabled', 'Location services'],
          ['AI recommendations', settings.aiRecommendations ? 'enabled' : 'disabled', 'Smart matching'],
        ]} />
      </GlassCard>
    </>
  );
}

function RegistrationManagementPanel({
  fields,
  onChange,
  onSave,
  onReset,
}: {
  fields: RegistrationFieldsState;
  onChange: (next: RegistrationFieldsState) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const [activeRole, setActiveRole] = useState<keyof RegistrationFieldsState>('client');
  const activeFields = [...fields[activeRole]].sort((a, b) => a.sortOrder - b.sortOrder);
  const fieldTypes: RegistrationFieldType[] = ['text', 'email', 'phone', 'password', 'select', 'checkbox', 'number', 'upload'];

  const replaceRoleFields = (nextFields: RegistrationFieldConfig[]) => {
    onChange({ ...fields, [activeRole]: nextFields.map((field, index) => ({ ...field, sortOrder: index + 1 })) });
  };

  const patchField = (id: string, patch: Partial<RegistrationFieldConfig>) => {
    replaceRoleFields(activeFields.map((field) => field.id === id ? { ...field, ...patch } : field));
  };

  const addField = () => {
    replaceRoleFields([
      ...activeFields,
      {
        id: `${activeRole}-field-${Date.now()}`,
        role: activeRole,
        label: 'New field',
        placeholder: 'Enter value',
        type: 'text',
        required: false,
        sortOrder: activeFields.length + 1,
      },
    ]);
  };

  const moveField = (id: string, direction: -1 | 1) => {
    const index = activeFields.findIndex((field) => field.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= activeFields.length) return;
    const nextFields = [...activeFields];
    const [item] = nextFields.splice(index, 1);
    nextFields.splice(nextIndex, 0, item);
    replaceRoleFields(nextFields);
  };

  return (
    <>
      <MarketplaceHeader
        title="Registration Management"
        description="Manage configurable registration fields for Client, Master, and Company accounts. Register screen reads this AdminStore config live."
        action="Save"
        onAction={onSave}
      />
      <View style={styles.actionRow}>
        <ActionButton label="Add field" onPress={addField} />
        <ActionButton label="Reset" variant="secondary" onPress={onReset} />
      </View>
      <GlassCard style={styles.panel}>
        <TabRow tabs={['client', 'master', 'company']} active={activeRole} onChange={(tab) => setActiveRole(tab as keyof RegistrationFieldsState)} />
        <View style={styles.registrationList}>
          {activeFields.map((field) => (
            <View key={field.id} style={styles.registrationFieldCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.cardTitle}>{field.label}</Text>
                  <Text style={styles.cardMeta}>{field.type} / order {field.sortOrder}</Text>
                </View>
                <View style={styles.rowActionWrap}>
                  <TinyButton label="Up" onPress={() => moveField(field.id, -1)} />
                  <TinyButton label="Down" onPress={() => moveField(field.id, 1)} />
                  <TinyButton label="Delete" onPress={() => replaceRoleFields(activeFields.filter((item) => item.id !== field.id))} />
                </View>
              </View>
              <View style={styles.formGrid}>
                <AdminInput label="Label" value={field.label} onChange={(value) => patchField(field.id, { label: value })} />
                <AdminInput label="Placeholder" value={field.placeholder} onChange={(value) => patchField(field.id, { placeholder: value })} />
                <AdminInput label="Options CSV" value={(field.options ?? []).join(', ')} onChange={(value) => patchField(field.id, { options: splitCsv(value) })} />
              </View>
              <View style={styles.actionRow}>
                <ToggleRow label="Required" value={field.required} onChange={() => patchField(field.id, { required: !field.required })} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillRow}>
                {fieldTypes.map((type) => (
                  <Pressable key={type} onPress={() => patchField(field.id, { type })} style={[styles.filterPill, field.type === type && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, field.type === type && styles.filterPillTextActive]}>{type}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      </GlassCard>
    </>
  );
}

function clampNumber(value: string, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return min;
  }
  return Math.min(max, Math.max(min, parsed));
}

function AdminModal({
  modal,
  onClose,
  onSaveCategory,
  onSaveCountry,
  onSaveRegion,
  onSaveCity,
  onSaveTranslation,
  onSaveUser,
  onSaveOrder,
  onSaveBanner,
  onToast,
}: {
  modal: ModalState;
  onClose: () => void;
  onSaveCategory: (item: CategoryRecord) => void;
  onSaveCountry: (item: CountryRecord) => void;
  onSaveRegion: (item: RegionRecord) => void;
  onSaveCity: (item: CityRecord) => void;
  onSaveTranslation: (item: TranslationRecord) => void;
  onSaveUser: (item: AdminUser) => void;
  onSaveOrder: (item: OrderRecord) => void;
  onSaveBanner: (item: MarketingBanner) => void;
  onToast: (message: string) => void;
}) {
  const [lang, setLang] = useState<Lang>('en');
  const [draftCategory, setDraftCategory] = useState<CategoryRecord>(modal?.kind === 'category' && modal.item ? modal.item : {
    id: '',
    name_ru: '',
    name_en: '',
    name_hy: '',
    slug: '',
    icon: 'FX',
    color: '#2D7CFF',
    isActive: true,
    sortOrder: 1,
    parentCategoryId: '',
    availableCountries: ['AM'],
    availableRegions: ['Yerevan'],
    availableCities: ['Yerevan'],
  });
  const [draftCountry, setDraftCountry] = useState<CountryRecord>(modal?.kind === 'country' && modal.item ? modal.item : {
    id: '',
    name_ru: '',
    name_en: '',
    name_hy: '',
    iso2: '',
    iso3: '',
    emoji: '',
    flagImage: '',
    countryPhoto: '',
    currency: 'AMD',
    language: 'en',
    capital_ru: '',
    capital_en: '',
    isActive: true,
    marketplaceEnabled: true,
  });
  const [draftRegion, setDraftRegion] = useState<RegionRecord>(modal?.kind === 'region' && modal.item ? modal.item : {
    id: '',
    countryIso2: 'AM',
    name_ru: '',
    name_en: '',
    name_hy: '',
    type_ru: 'region',
    type_en: 'region',
    capital_ru: '',
    capital_en: '',
    isActive: true,
  });
  const [draftCity, setDraftCity] = useState<CityRecord>(modal?.kind === 'city' && modal.item ? modal.item : {
    id: '',
    regionId: 'region-yerevan',
    name_ru: '',
    name_en: '',
    name_hy: '',
    isActive: true,
    latitude: '',
    longitude: '',
  });
  const [draftTranslation, setDraftTranslation] = useState<TranslationRecord>(modal?.kind === 'translation' && modal.item ? modal.item : {
    id: '',
    key: '',
    module: 'home',
    ru: '',
    en: '',
    hy: '',
    status: 'missing',
    updatedAt: nowStamp(),
  });
  const [draftUser, setDraftUser] = useState<AdminUser | null>(modal?.kind === 'user' ? modal.item : null);
  const [draftOrder, setDraftOrder] = useState<OrderRecord | null>(modal?.kind === 'order' ? modal.item : null);
  const [draftBanner, setDraftBanner] = useState<MarketingBanner>(modal?.kind === 'banner' && modal.item ? modal.item : {
    id: '',
    title_ru: '',
    title_en: '',
    title_hy: '',
    image: '',
    link: '',
    target: 'All countries',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  if (!modal) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient colors={['#FFFFFF', '#F8F0FF']} style={styles.modalCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.modalTitle}>{modalTitle(modal)}</Text>
            <Pressable onPress={onClose}><Text style={styles.closeText}>Close</Text></Pressable>
          </View>
          {modal.kind === 'log' ? (
            <View>
              <Text style={styles.cardTitle}>{modal.item.action}</Text>
              <Text style={styles.cardMeta}>{modal.item.adminName} / {modal.item.module} / {modal.item.ip}</Text>
              <Text style={styles.bodyText}>{modal.item.details}</Text>
            </View>
          ) : null}
          {modal.kind === 'category' ? (
            <>
              <TabRow tabs={['ru', 'en', 'hy']} active={lang} onChange={(value) => setLang(value as Lang)} />
              <AdminInput label={`Name ${lang.toUpperCase()}`} value={draftCategory[`name_${lang}`]} onChange={(value) => setDraftCategory({ ...draftCategory, [`name_${lang}`]: value })} />
              <View style={styles.formGrid}>
                <AdminInput label="Slug" value={draftCategory.slug} onChange={(value) => setDraftCategory({ ...draftCategory, slug: value })} />
                <AdminInput label="Icon picker placeholder" value={draftCategory.icon} onChange={(value) => setDraftCategory({ ...draftCategory, icon: value })} />
                <AdminInput label="Color" value={draftCategory.color} onChange={(value) => setDraftCategory({ ...draftCategory, color: value })} />
                <AdminInput label="Sort order" value={String(draftCategory.sortOrder)} onChange={(value) => setDraftCategory({ ...draftCategory, sortOrder: Number(value) || 0 })} />
                <AdminInput label="Parent Category ID" value={draftCategory.parentCategoryId} onChange={(value) => setDraftCategory({ ...draftCategory, parentCategoryId: value })} />
                <AdminInput label="Countries" value={draftCategory.availableCountries.join(', ')} onChange={(value) => setDraftCategory({ ...draftCategory, availableCountries: splitCsv(value) })} />
                <AdminInput label="Regions" value={draftCategory.availableRegions.join(', ')} onChange={(value) => setDraftCategory({ ...draftCategory, availableRegions: splitCsv(value) })} />
                <AdminInput label="Cities" value={draftCategory.availableCities.join(', ')} onChange={(value) => setDraftCategory({ ...draftCategory, availableCities: splitCsv(value) })} />
              </View>
              <ToggleRow label="Active" value={draftCategory.isActive} onChange={() => setDraftCategory({ ...draftCategory, isActive: !draftCategory.isActive })} />
              <ActionButton label="Save category" onPress={() => onSaveCategory(draftCategory)} />
            </>
          ) : null}
          {modal.kind === 'country' ? (
            <>
              <View style={styles.formGrid}>
                <AdminInput label="Name RU" value={draftCountry.name_ru} onChange={(value) => setDraftCountry({ ...draftCountry, name_ru: value })} />
                <AdminInput label="Name EN" value={draftCountry.name_en} onChange={(value) => setDraftCountry({ ...draftCountry, name_en: value })} />
                <AdminInput label="Name HY" value={draftCountry.name_hy} onChange={(value) => setDraftCountry({ ...draftCountry, name_hy: value })} />
                <AdminInput label="ISO2" value={draftCountry.iso2} onChange={(value) => setDraftCountry({ ...draftCountry, iso2: value })} />
                <AdminInput label="ISO3" value={draftCountry.iso3} onChange={(value) => setDraftCountry({ ...draftCountry, iso3: value })} />
                <AdminInput label="Emoji flag" value={draftCountry.emoji} onChange={(value) => setDraftCountry({ ...draftCountry, emoji: value })} />
                <AdminInput label="Flag image" value={draftCountry.flagImage} onChange={(value) => setDraftCountry({ ...draftCountry, flagImage: value })} />
                <AdminInput label="Country photo" value={draftCountry.countryPhoto} onChange={(value) => setDraftCountry({ ...draftCountry, countryPhoto: value })} />
                <AdminInput label="Currency" value={draftCountry.currency} onChange={(value) => setDraftCountry({ ...draftCountry, currency: value })} />
                <AdminInput label="Default language" value={draftCountry.language} onChange={(value) => setDraftCountry({ ...draftCountry, language: value })} />
                <AdminInput label="Capital RU" value={draftCountry.capital_ru} onChange={(value) => setDraftCountry({ ...draftCountry, capital_ru: value })} />
                <AdminInput label="Capital EN" value={draftCountry.capital_en} onChange={(value) => setDraftCountry({ ...draftCountry, capital_en: value })} />
              </View>
              <ToggleRow label="Active" value={draftCountry.isActive} onChange={() => setDraftCountry({ ...draftCountry, isActive: !draftCountry.isActive })} />
              <ToggleRow label="Local marketplace enabled" value={draftCountry.marketplaceEnabled} onChange={() => setDraftCountry({ ...draftCountry, marketplaceEnabled: !draftCountry.marketplaceEnabled })} />
              <ActionButton label="Save country" onPress={() => onSaveCountry(draftCountry)} />
            </>
          ) : null}
          {modal.kind === 'region' ? (
            <>
              <View style={styles.formGrid}>
                <AdminInput label="Country ISO2" value={draftRegion.countryIso2} onChange={(value) => setDraftRegion({ ...draftRegion, countryIso2: value.toUpperCase() })} />
                <AdminInput label="Name RU" value={draftRegion.name_ru} onChange={(value) => setDraftRegion({ ...draftRegion, name_ru: value })} />
                <AdminInput label="Name EN" value={draftRegion.name_en} onChange={(value) => setDraftRegion({ ...draftRegion, name_en: value })} />
                <AdminInput label="Name HY" value={draftRegion.name_hy} onChange={(value) => setDraftRegion({ ...draftRegion, name_hy: value })} />
                <AdminInput label="Type RU" value={draftRegion.type_ru} onChange={(value) => setDraftRegion({ ...draftRegion, type_ru: value })} />
                <AdminInput label="Type EN" value={draftRegion.type_en} onChange={(value) => setDraftRegion({ ...draftRegion, type_en: value })} />
                <AdminInput label="Capital RU" value={draftRegion.capital_ru} onChange={(value) => setDraftRegion({ ...draftRegion, capital_ru: value })} />
                <AdminInput label="Capital EN" value={draftRegion.capital_en} onChange={(value) => setDraftRegion({ ...draftRegion, capital_en: value })} />
              </View>
              <ToggleRow label="Active" value={draftRegion.isActive} onChange={() => setDraftRegion({ ...draftRegion, isActive: !draftRegion.isActive })} />
              <ActionButton label="Save region" onPress={() => onSaveRegion(draftRegion)} />
            </>
          ) : null}
          {modal.kind === 'city' ? (
            <>
              <View style={styles.formGrid}>
                <AdminInput label="Region ID" value={draftCity.regionId} onChange={(value) => setDraftCity({ ...draftCity, regionId: value })} />
                <AdminInput label="Name RU" value={draftCity.name_ru} onChange={(value) => setDraftCity({ ...draftCity, name_ru: value })} />
                <AdminInput label="Name EN" value={draftCity.name_en} onChange={(value) => setDraftCity({ ...draftCity, name_en: value })} />
                <AdminInput label="Name HY" value={draftCity.name_hy} onChange={(value) => setDraftCity({ ...draftCity, name_hy: value })} />
                <AdminInput label="Latitude" value={draftCity.latitude} onChange={(value) => setDraftCity({ ...draftCity, latitude: value })} />
                <AdminInput label="Longitude" value={draftCity.longitude} onChange={(value) => setDraftCity({ ...draftCity, longitude: value })} />
              </View>
              <ToggleRow label="Active" value={draftCity.isActive} onChange={() => setDraftCity({ ...draftCity, isActive: !draftCity.isActive })} />
              <ActionButton label="Save city" onPress={() => onSaveCity(draftCity)} />
            </>
          ) : null}
          {modal.kind === 'translation' ? (
            <>
              <View style={styles.formGrid}>
                <AdminInput label="Key" value={draftTranslation.key} onChange={(value) => setDraftTranslation({ ...draftTranslation, key: value })} />
                <AdminInput label="Module" value={draftTranslation.module} onChange={(value) => setDraftTranslation({ ...draftTranslation, module: value })} />
                <AdminInput label="RU" value={draftTranslation.ru} onChange={(value) => setDraftTranslation({ ...draftTranslation, ru: value, status: translationStatus({ ...draftTranslation, ru: value }) })} />
                <AdminInput label="EN" value={draftTranslation.en} onChange={(value) => setDraftTranslation({ ...draftTranslation, en: value, status: translationStatus({ ...draftTranslation, en: value }) })} />
                <AdminInput label="HY" value={draftTranslation.hy} onChange={(value) => setDraftTranslation({ ...draftTranslation, hy: value, status: translationStatus({ ...draftTranslation, hy: value }) })} />
              </View>
              <ActionButton label="Save translation" onPress={() => onSaveTranslation({ ...draftTranslation, updatedAt: nowStamp() })} />
            </>
          ) : null}
          {modal.kind === 'user' && draftUser ? (
            <>
              <View style={styles.formGrid}>
                <AdminInput label="Name" value={draftUser.name} onChange={(value) => setDraftUser({ ...draftUser, name: value })} />
                <AdminInput label="Role management" value={draftUser.role} onChange={(value) => setDraftUser({ ...draftUser, role: value as AdminUser['role'] })} />
                <AdminInput label="City" value={draftUser.city} onChange={(value) => setDraftUser({ ...draftUser, city: value })} />
                <AdminInput label="Categories" value={draftUser.categories} onChange={(value) => setDraftUser({ ...draftUser, categories: value })} />
              </View>
              <ToggleRow label="Premium status" value={draftUser.premium} onChange={() => setDraftUser({ ...draftUser, premium: !draftUser.premium })} />
              <ActionButton label="Save user" onPress={() => onSaveUser(draftUser)} />
            </>
          ) : null}
          {modal.kind === 'order' && draftOrder ? (
            <>
              <View style={styles.formGrid}>
                <AdminInput label="Status" value={draftOrder.status} onChange={(value) => setDraftOrder({ ...draftOrder, status: value as OrderRecord['status'] })} />
                <AdminInput label="Secure deal status" value={draftOrder.secureDeal} onChange={(value) => setDraftOrder({ ...draftOrder, secureDeal: value as OrderRecord['secureDeal'] })} />
              </View>
              <View style={styles.actionRow}><ActionButton label="Save order" onPress={() => onSaveOrder(draftOrder)} /><ActionButton label="Refund placeholder" variant="secondary" onPress={() => onToast('Refund placeholder executed')} /></View>
            </>
          ) : null}
          {modal.kind === 'banner' ? (
            <>
              <View style={styles.formGrid}>
                <AdminInput label="Title RU" value={draftBanner.title_ru} onChange={(value) => setDraftBanner({ ...draftBanner, title_ru: value })} />
                <AdminInput label="Title EN" value={draftBanner.title_en} onChange={(value) => setDraftBanner({ ...draftBanner, title_en: value })} />
                <AdminInput label="Title HY" value={draftBanner.title_hy} onChange={(value) => setDraftBanner({ ...draftBanner, title_hy: value })} />
                <AdminInput label="Image" value={draftBanner.image} onChange={(value) => setDraftBanner({ ...draftBanner, image: value })} />
                <AdminInput label="Link" value={draftBanner.link} onChange={(value) => setDraftBanner({ ...draftBanner, link: value })} />
                <AdminInput label="Target country / region / city" value={draftBanner.target} onChange={(value) => setDraftBanner({ ...draftBanner, target: value })} />
                <AdminInput label="Start date" value={draftBanner.startDate} onChange={(value) => setDraftBanner({ ...draftBanner, startDate: value })} />
                <AdminInput label="End date" value={draftBanner.endDate} onChange={(value) => setDraftBanner({ ...draftBanner, endDate: value })} />
              </View>
              <ToggleRow label="Active" value={draftBanner.isActive} onChange={() => setDraftBanner({ ...draftBanner, isActive: !draftBanner.isActive })} />
              <ActionButton label="Save banner" onPress={() => onSaveBanner(draftBanner)} />
            </>
          ) : null}
        </LinearGradient>
      </View>
    </Modal>
  );
}

function modalTitle(modal: Exclude<ModalState, null>) {
  if (modal.kind === 'category') return modal.item ? 'Edit category' : 'Add category';
  if (modal.kind === 'country') return modal.item ? 'Edit country' : 'Add country';
  if (modal.kind === 'region') return modal.item ? 'Edit region' : 'Add region';
  if (modal.kind === 'city') return modal.item ? 'Edit city' : 'Add city';
  if (modal.kind === 'translation') return modal.item ? 'Edit translation' : 'Add translation key';
  if (modal.kind === 'user') return 'View / edit user';
  if (modal.kind === 'order') return 'Order details';
  if (modal.kind === 'banner') return modal.item ? 'Edit marketing banner' : 'Add marketing banner';
  return 'Log details';
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? onAction ? <TinyButton label={action} onPress={onAction} /> : <Badge label={action} tone="blue" /> : null}
    </View>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <View style={styles.tableShell}>
      <View style={styles.tableToolbar}>
        <View style={styles.tableSearchHint}><AdminIcon name="Search" size={14} /><Text style={styles.tableToolbarText}>Filter rows, badges, and actions</Text></View>
        <View style={styles.tablePager}><Text style={styles.tablePagerText}>1-{Math.min(rows.length, 10)} of {rows.length}</Text></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.tableRowHead}>
            {columns.map((column) => <Text key={column} style={[styles.tableCell, styles.tableHead]}>{column}</Text>)}
          </View>
          {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.tableRow, rowIndex % 2 === 1 && styles.tableRowAlt]}>
              {row.map((cell, cellIndex) => <View key={cellIndex} style={styles.tableCell}>{typeof cell === 'string' ? <Text style={styles.tableText}>{cell}</Text> : cell}</View>)}
          </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={label} placeholderTextColor="#69748F" style={styles.input} />
    </View>
  );
}

function AdminTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} multiline textAlignVertical="top" placeholder={label} placeholderTextColor="#69748F" style={[styles.input, styles.textArea]} />
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return <Pressable onPress={onChange} style={[styles.toggle, value && styles.toggleOn]}><View style={[styles.toggleKnob, value && styles.toggleKnobOn]} /></Pressable>;
}

function Badge({ label, tone }: { label: string; tone: 'blue' | 'green' | 'gold' }) {
  return <View style={[styles.badge, tone === 'green' && styles.badgeGreen, tone === 'gold' && styles.badgeGold]}><Text style={styles.badgeText}>{label}</Text></View>;
}

function ActionButton({ label, variant = 'primary', onPress }: { label: string; variant?: 'primary' | 'secondary' | 'danger'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, variant === 'secondary' && styles.secondaryButton, variant === 'danger' && styles.dangerButton]}>
      {variant === 'primary' ? (
        <LinearGradient colors={['#6D5DFB', '#5B5BFF']} style={styles.actionButtonGradient}>
          <Text style={styles.actionButtonText}>{label}</Text>
        </LinearGradient>
      ) : (
        <Text style={styles.actionButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

function MarketplaceHeader({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) {
  return (
    <View style={styles.marketHeader}>
      <View style={styles.flex}>
        <Text style={styles.dashboardTitle}>{title}</Text>
        <Text style={styles.dashboardSubtitle}>{description}</Text>
      </View>
      <ActionButton label={action} onPress={onAction} />
    </View>
  );
}

function FilterPills({ label, options, active, onChange }: { label: string; options: string[]; active: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillRow}>
        {options.map((option) => (
          <Pressable key={option} onPress={() => onChange(option)} style={[styles.filterPill, active === option && styles.filterPillActive]}>
            <Text style={[styles.filterPillText, active === option && styles.filterPillTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.miniStat}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </LinearGradient>
  );
}

function AdminStatusBadge({ active }: { active: boolean }) {
  return <Badge label={active ? 'active' : 'inactive'} tone={active ? 'green' : 'gold'} />;
}

function InlineTranslationInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <TextInput value={value} onChangeText={onChange} placeholder="Missing" placeholderTextColor="#64748B" style={styles.inlineInput} />;
}

function UserIdentity({ user }: { user: AdminUser }) {
  return (
    <View style={styles.userIdentity}>
      <LinearGradient colors={['#6D5DFB', '#2563EB']} style={styles.userAvatar}><Text style={styles.userAvatarText}>{user.name.slice(0, 2).toUpperCase()}</Text></LinearGradient>
      <View style={styles.flex}>
        <Text style={styles.tableText}>{user.name}</Text>
        <Text style={styles.tableSubText}>{user.id}</Text>
      </View>
    </View>
  );
}

function UserCard({ user, onEdit, onToggle, onPremium, onActivate }: { user: AdminUser; onEdit: () => void; onToggle: () => void; onPremium: () => void; onActivate: () => void }) {
  return (
    <LinearGradient colors={['#FFFFFF', 'rgba(45,124,255,0.08)']} style={styles.userCard}>
      <View style={styles.sectionHeader}>
        <UserIdentity user={user} />
        <Badge label={user.role} tone={user.role === 'Master' ? 'blue' : user.role === 'Admin' ? 'gold' : 'green'} />
      </View>
      <View style={styles.profileRows}>
        <ProfileInfo label="City" value={user.city} />
        <ProfileInfo label="Categories" value={user.categories} />
        <ProfileInfo label="Orders" value={String(user.completedOrders)} />
        <ProfileInfo label="Rating" value={String(user.rating)} />
      </View>
      <View style={styles.rowActionWrap}>
        <Badge label={user.verification} tone={user.verification === 'verified' ? 'green' : user.verification === 'pending' ? 'gold' : 'blue'} />
        <AdminStatusBadge active={user.status === 'active'} />
      </View>
      <View style={styles.actionRow}>
        <TinyButton label="Profile" onPress={onEdit} />
        <TinyButton label={user.status === 'blocked' ? 'Unblock' : 'Block'} onPress={onToggle} />
        <TinyButton label={user.status === 'active' ? 'Deactivate' : 'Activate'} onPress={onActivate} />
        {user.role === 'Master' ? <TinyButton label={user.premium ? 'Premium off' : 'Premium on'} onPress={onPremium} /> : null}
      </View>
    </LinearGradient>
  );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileInfo}>
      <Text style={styles.tableSubText}>{label}</Text>
      <Text style={styles.tableText}>{value}</Text>
    </View>
  );
}

function TinyButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.tinyButton}><Text style={styles.tinyButtonText}>{label}</Text></Pressable>;
}

function RowActions({ onEdit, onDelete, editLabel = 'Edit', deleteLabel = 'Delete' }: { onEdit: () => void; onDelete: () => void; editLabel?: string; deleteLabel?: string }) {
  return <View style={styles.rowActionWrap}><TinyButton label={editLabel} onPress={onEdit} /><TinyButton label={deleteLabel} onPress={onDelete} /></View>;
}

function TabRow({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
      {tabs.map((tab) => <Pressable key={tab} onPress={() => onChange(tab)} style={[styles.tab, active === tab && styles.tabActive]}><Text style={[styles.tabText, active === tab && styles.tabTextActive]}>{tab}</Text></Pressable>)}
    </ScrollView>
  );
}

function NestedList({ title, items }: { title: string; items: string[] }) {
  return (
    <GlassCard style={styles.panel}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => <Text key={item} style={styles.bodyText}>{item}</Text>)}
    </GlassCard>
  );
}

function searchRows<T>(items: T[], query: string, fields: (item: T) => string[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => fields(item).some((field) => field.toLowerCase().includes(normalized)));
}

function formatLogValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return 'No value';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value).slice(0, 80);
  } catch {
    return String(value);
  }
}

function ensureTelegramChannels(settings: TelegramSettings) {
  const channels = settings.channels ?? [];
  const merged = defaultTelegramChannels.map((defaultChannel) => ({
    ...defaultChannel,
    ...channels.find((channel) => channel.id === defaultChannel.id),
  }));
  const custom = channels.filter((channel) => !merged.some((item) => item.id === channel.id));
  return [...merged, ...custom];
}

async function sendTelegramNotification(channelId: string, payload: Record<string, unknown>) {
  return {
    channelId,
    payload,
    sentAt: new Date().toISOString(),
    status: 'mock success',
  };
}

function telegramMockPayload(channelId: string): Record<string, unknown> {
  const createdAt = new Date().toISOString();
  const payloads: Record<string, Record<string, unknown>> = {
    'code-change-logs': { adminName: 'Super Admin', module: 'Telegram', action: 'test notification', oldValue: 'disabled', newValue: 'enabled', createdAt, status: 'completed' },
    'client-order-created': { orderId: 'ord-test', clientName: 'Mariam K.', clientPhone: '+37400000000', clientEmail: 'client@example.com', category: 'Cleaning', description: 'Apartment cleaning', address: 'Yerevan, Kentron', country: 'Armenia', region: 'Yerevan', city: 'Yerevan', budget: '18000 AMD', photo: 'order-photo-placeholder.png', createdAt },
    'master-accepted-order': { orderId: 'ord-test', orderTitle: 'Apartment cleaning', masterName: 'Arman Master', masterPhone: '+37411111111', masterEmail: 'master@example.com', profession: 'Cleaning', amount: '18000 AMD', platformCommission: '2160 AMD', masterPayout: '15840 AMD', city: 'Yerevan', createdAt },
    'finance-logs': { transactionId: 'trx-test', userName: 'Mariam K.', userRole: 'Client', phone: '+37400000000', email: 'client@example.com', amount: 18000, currency: 'AMD', paymentMethod: 'Idram', balanceBefore: 2000, balanceAfter: 20000, status: 'completed', createdAt },
    'support-logs': { ticketId: 'SUP-test', userName: 'Georg M.', userRole: 'Client', phone: '+37422222222', email: 'support@example.com', complaintType: 'Order dispute', message: 'Master did not arrive', priority: 'high', city: 'Yerevan', createdAt },
    'verification-logs': { masterName: 'Arman Master', profession: 'Repair specialist', phone: '+37411111111', email: 'master@example.com', documentsUploaded: 'passport,selfie,certificate', verificationStatus: 'pending', adminAction: 'review requested', rejectionReason: '', createdAt },
  };
  return payloads[channelId] ?? { channelId, createdAt };
}

function splitCsv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function translationStatus(item: TranslationRecord): TranslationRecord['status'] {
  return item.ru && item.en && item.hy ? 'complete' : 'missing';
}

function mapCategoryFromDb(row: TableRow<'categories'>): CategoryRecord {
  return {
    id: row.id,
    name_ru: row.name_ru,
    name_en: row.name_en,
    name_hy: row.name_hy,
    slug: row.slug,
    icon: row.icon_url || row.name_en.slice(0, 2).toUpperCase(),
    color: row.color,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    parentCategoryId: row.parent_category_id || '',
    availableCountries: row.available_countries,
    availableRegions: row.available_regions,
    availableCities: row.available_cities,
  };
}

function mapCategoryToDb(item: CategoryRecord) {
  return {
    name_ru: item.name_ru,
    name_en: item.name_en,
    name_hy: item.name_hy,
    slug: item.slug,
    icon_url: item.icon,
    color: item.color,
    is_active: item.isActive,
    sort_order: item.sortOrder,
    parent_category_id: item.parentCategoryId || null,
    available_countries: item.availableCountries,
    available_regions: item.availableRegions,
    available_cities: item.availableCities,
  };
}

function mapCountryFromDb(row: TableRow<'countries'>): CountryRecord {
  return {
    id: row.id,
    name_ru: row.name_ru,
    name_en: row.name_en,
    name_hy: row.name_hy,
    iso2: row.iso2,
    iso3: row.iso3,
    emoji: row.emoji,
    flagImage: row.flag_image || '',
    countryPhoto: row.country_photo || '',
    currency: row.currency,
    language: row.language,
    capital_ru: row.capital_ru,
    capital_en: row.capital_en,
    isActive: row.is_active,
    marketplaceEnabled: row.marketplace_enabled,
  };
}

function mapCountryToDb(item: CountryRecord) {
  return {
    name_ru: item.name_ru,
    name_en: item.name_en,
    name_hy: item.name_hy,
    iso2: item.iso2,
    iso3: item.iso3,
    emoji: item.emoji,
    flag_image: item.flagImage || null,
    country_photo: item.countryPhoto || null,
    currency: item.currency,
    language: item.language,
    capital_ru: item.capital_ru,
    capital_en: item.capital_en,
    is_active: item.isActive,
    marketplace_enabled: item.marketplaceEnabled,
  };
}

function mapTranslationFromDb(row: TableRow<'translations'>): TranslationRecord {
  return { id: row.id, key: row.key, module: row.module, ru: row.ru, en: row.en, hy: row.hy, status: row.status === 'missing' ? 'missing' : 'complete', updatedAt: row.updated_at };
}

function mapTranslationToDb(item: TranslationRecord) {
  return { key: item.key, module: item.module, ru: item.ru, en: item.en, hy: item.hy, status: item.status, updated_at: new Date().toISOString() };
}

function mapOrderFromDb(row: TableRow<'orders'>): OrderRecord {
  return {
    id: row.id,
    client: row.client_id,
    master: row.master_id || 'Unassigned',
    city: row.city_id || 'Unknown',
    status: row.status,
    amount: row.amount,
    secureDeal: row.payment_status,
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FC' },
  adminAurora: { position: 'absolute', top: -190, right: -170, width: 560, height: 560, borderRadius: 280, backgroundColor: '#2D7CFF', opacity: 0.11 },
  adminGoldGlow: { position: 'absolute', bottom: -240, left: 260, width: 560, height: 560, borderRadius: 280, backgroundColor: '#B75CFF', opacity: 0.08 },
  flex: { flex: 1 },
  shell: { flex: 1, flexDirection: 'row' },
  shellCompact: { flexDirection: 'row' },
  sidebar: {
    width: 292,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(109,93,251,0.16)',
    backgroundColor: 'rgba(255,255,255,0.84)',
    shadowColor: '#6D5DFB',
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 12, height: 0 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(26px)', transitionDuration: '220ms' } as ViewStyle : null),
  },
  sidebarCompact: { width: 78, paddingHorizontal: 10 },
  brandRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  brandMark: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#6D5DFB', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  brandMarkText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  brandTitle: { color: '#111827', fontSize: 18, fontWeight: '900' },
  brandSubtitle: { marginTop: 2, color: '#A78BFA', fontSize: 11, fontWeight: '900' },
  collapseButton: { marginLeft: 'auto', width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  expandButton: { width: 36, height: 36, marginBottom: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  collapseText: { color: '#6D5DFB', fontSize: 14, fontWeight: '900' },
  navGroup: { marginTop: 18, gap: 7 },
  navGroupText: { color: '#9CA3AF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  navItem: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' ? { transitionDuration: '180ms' } as ViewStyle : null),
  },
  navItemActive: { backgroundColor: 'rgba(109,93,251,0.1)', borderColor: 'rgba(109,93,251,0.22)', shadowColor: '#6D5DFB', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } },
  navIconBox: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#EEF2FF' },
  navIconBoxActive: { backgroundColor: '#FFFFFF', borderColor: 'rgba(109,93,251,0.24)', transform: [{ scale: 1.03 }] },
  navIcon: { width: 22, color: '#374151', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  navText: { flex: 1, color: '#374151', fontSize: 13, fontWeight: '800' },
  navTextActive: { color: '#111827' },
  navChevron: { color: '#111827', fontSize: 19, fontWeight: '900' },
  adminProfileCard: { minHeight: 60, marginTop: 14, padding: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  adminProfileAvatar: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  adminProfileAvatarText: { color: '#111827', fontSize: 11, fontWeight: '900' },
  adminProfileName: { color: '#111827', fontSize: 12, fontWeight: '900' },
  adminProfileEmail: { marginTop: 2, color: '#6B7280', fontSize: 10, fontWeight: '700' },
  adminProfileChevron: { color: '#6B7280', fontSize: 18, fontWeight: '900' },
  exitButton: { minHeight: 42, marginTop: 12, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  exitText: { color: '#111827', fontSize: 12, fontWeight: '900' },
  main: { flex: 1 },
  topbar: {
    minHeight: 92,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,231,235,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.78)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(22px)' } as ViewStyle : null),
  },
  topTitleBlock: { minWidth: 220 },
  topKicker: { color: '#A78BFA', fontSize: 11, fontWeight: '900' },
  topTitle: { marginTop: 4, color: '#111827', fontSize: 25, fontWeight: '900' },
  topSubtitle: { marginTop: 3, color: '#6B7280', fontSize: 11, fontWeight: '700' },
  topActions: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 9 },
  searchShell: { flex: 1, minHeight: 44, minWidth: 240, maxWidth: 440, paddingHorizontal: 13, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#6D5DFB', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  searchInput: { flex: 1, minHeight: 42, color: '#111827', fontWeight: '800' },
  liveBadge: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.24)' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' },
  liveText: { color: '#15803D', fontSize: 11, fontWeight: '900' },
  bell: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#6D5DFB', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
  bellText: { color: '#111827', fontSize: 12, fontWeight: '900' },
  dateRange: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  dateRangeText: { color: '#374151', fontSize: 11, fontWeight: '800' },
  adminAvatar: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(124,58,237,0.3)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.5)' },
  adminAvatarText: { color: '#111827', fontSize: 12, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 76 },
  adminSaveRow: { marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' },
  dashboardHeader: { marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  dashboardTitle: { color: '#111827', fontSize: 20, fontWeight: '900' },
  dashboardSubtitle: { marginTop: 4, color: '#6B7280', fontSize: 12, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metricCard: {
    flexGrow: 1,
    flexBasis: 220,
    minHeight: 162,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(109,93,251,0.16)',
    overflow: 'hidden',
    shadowColor: '#6D5DFB',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
    ...(Platform.OS === 'web' ? { transitionDuration: '180ms' } as ViewStyle : null),
  },
  metricSheen: { position: 'absolute', top: -52, right: -42, width: 148, height: 148, borderRadius: 74, backgroundColor: 'rgba(109,93,251,0.1)' },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  metricIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  metricIconText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  metricLabel: { color: '#374151', fontSize: 12, fontWeight: '800' },
  metricValue: { marginTop: 8, color: '#111827', fontSize: 26, lineHeight: 32, fontWeight: '900' },
  metricTrend: { marginTop: 4, color: '#34D399', fontSize: 11, fontWeight: '800' },
  sparkline: { position: 'absolute', right: 14, bottom: 12, width: 96, height: 48, flexDirection: 'row', alignItems: 'flex-end', gap: 4, opacity: 0.8 },
  sparkSegment: { flex: 1, borderRadius: 6 },
  dashboardGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'stretch' },
  marketHeader: { marginBottom: 14, padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  marketToolbar: { marginBottom: 14, borderRadius: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', backgroundColor: '#FFFFFF' },
  filterBlock: { flexGrow: 1, flexBasis: 220, marginTop: 8 },
  filterPillRow: { gap: 8, paddingRight: 10 },
  filterPill: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#2D7CFF', borderColor: 'rgba(220,232,255,0.5)' },
  filterPillText: { color: '#374151', fontSize: 11, fontWeight: '900', textTransform: 'capitalize' },
  filterPillTextActive: { color: '#111827' },
  marketStats: { marginBottom: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  miniStat: { flexGrow: 1, flexBasis: 180, minHeight: 84, padding: 14, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(148,163,184,0.14)' },
  chartGrid: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chartCard: { flexGrow: 1, flexBasis: 320, minHeight: 240, borderRadius: 20, padding: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', shadowColor: '#111827', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 14 } },
  chartCardLarge: { flexBasis: 460, minHeight: 270 },
  chartTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  chartBars: { flex: 1, marginTop: 18, minHeight: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  chartBar: { flex: 1, maxWidth: 34, borderRadius: 8 },
  lineChart: { flex: 1, marginTop: 14, minHeight: 150, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  linePoint: { flex: 1, marginHorizontal: 3, borderTopWidth: 3, borderTopColor: '#D65BFF', backgroundColor: 'rgba(109,93,251,0.34)', borderRadius: 8 },
  activityCard: { flexGrow: 1, flexBasis: 320, minHeight: 230, borderRadius: 18, backgroundColor: '#FFFFFF' },
  activityList: { gap: 12 },
  activityRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 11 },
  activityIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activityIconText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  activityTitle: { color: '#111827', fontSize: 12, fontWeight: '800' },
  activityMeta: { marginTop: 2, color: '#9CA3AF', fontSize: 10, fontWeight: '700' },
  panel: { marginTop: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  registrationList: { marginTop: 12, gap: 12 },
  registrationFieldCard: { padding: 14, borderRadius: 18, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  sectionTitle: { color: '#111827', fontSize: 18, fontWeight: '900' },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inputWrap: { flexGrow: 1, flexBasis: 220, marginTop: 8 },
  inputLabel: { marginBottom: 7, color: '#6B7280', fontSize: 12, fontWeight: '900' },
  input: { minHeight: 46, paddingHorizontal: 13, borderRadius: 12, color: '#111827', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', fontWeight: '800' },
  inlineInput: { minHeight: 40, minWidth: 124, paddingHorizontal: 11, borderRadius: 11, color: '#111827', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', fontSize: 11, fontWeight: '800' },
  textArea: { minHeight: 132, paddingTop: 12, lineHeight: 18 },
  toggleGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toggleRow: { flexGrow: 1, flexBasis: 240, minHeight: 50, paddingHorizontal: 13, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  toggleLabel: { flex: 1, color: '#111827', fontSize: 13, fontWeight: '800' },
  toggle: { width: 46, height: 26, borderRadius: 13, padding: 3, backgroundColor: '#E5E7EB' },
  toggleOn: { backgroundColor: '#2D7CFF' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  toggleKnobOn: { transform: [{ translateX: 20 }] },
  actionRow: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  actionButton: { minHeight: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D7CFF', overflow: 'hidden', shadowColor: '#2D7CFF', shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  actionButtonGradient: { minHeight: 40, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  dangerButton: { backgroundColor: '#EF4444' },
  actionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  tinyButton: { minHeight: 34, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(109,93,251,0.18)' },
  tinyButtonText: { color: '#111827', fontSize: 11, fontWeight: '900' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(35,184,255,0.14)', borderWidth: 1, borderColor: 'rgba(35,184,255,0.28)' },
  badgeGreen: { backgroundColor: 'rgba(53,230,166,0.12)', borderColor: 'rgba(53,230,166,0.28)' },
  badgeGold: { backgroundColor: 'rgba(247,212,122,0.14)', borderColor: 'rgba(247,212,122,0.3)' },
  badgeText: { color: '#111827', fontSize: 10, fontWeight: '900' },
  tableShell: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', shadowColor: '#6D5DFB', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  tableToolbar: { minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  tableSearchHint: { minHeight: 34, paddingHorizontal: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
  tableToolbarText: { color: '#6B7280', fontSize: 11, fontWeight: '800' },
  tablePager: { minHeight: 32, paddingHorizontal: 10, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(109,93,251,0.08)', borderWidth: 1, borderColor: 'rgba(109,93,251,0.14)' },
  tablePagerText: { color: '#6D5DFB', fontSize: 11, fontWeight: '900' },
  table: { minWidth: 920 },
  tableRowHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEF2F7', backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? { transitionDuration: '160ms' } as ViewStyle : null) },
  tableRowAlt: { backgroundColor: '#FBFCFF' },
  tableCell: { width: 150, minHeight: 54, justifyContent: 'center', paddingHorizontal: 13, paddingVertical: 10 },
  tableHead: { color: '#6B7280', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  tableText: { color: '#111827', fontSize: 12, fontWeight: '700' },
  tableSubText: { marginTop: 4, color: '#6B7280', fontSize: 10, fontWeight: '700' },
  rowActionWrap: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  previewCell: { gap: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryTile: { flexGrow: 1, flexBasis: 220, minHeight: 166, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  tileTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tileIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  tileTitle: { marginTop: 12, color: '#111827', fontSize: 15, fontWeight: '900' },
  tileMeta: { marginTop: 6, color: '#6B7280', fontSize: 12, fontWeight: '700' },
  flagPreview: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(124,58,237,0.18)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.22)' },
  flagPreviewText: { color: '#111827', fontSize: 13, fontWeight: '900' },
  locationTreeGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  locationTreeCard: { flexGrow: 1, flexBasis: 280, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.12)' },
  locationTreeRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.1)' },
  userGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  userCard: { flexGrow: 1, flexBasis: 320, minHeight: 230, borderRadius: 18, padding: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  userIdentity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAvatar: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  profileRows: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  profileInfo: { flexGrow: 1, flexBasis: 120, minHeight: 54, padding: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.1)' },
  twoColumn: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tabs: { gap: 8, paddingBottom: 12 },
  tab: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  tabActive: { backgroundColor: '#2D7CFF' },
  tabText: { color: '#6B7280', fontSize: 12, fontWeight: '900' },
  tabTextActive: { color: '#111827' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  verifyCard: { flexGrow: 1, flexBasis: 320, padding: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' },
  cardTitle: { color: '#111827', fontSize: 16, fontWeight: '900' },
  cardMeta: { marginTop: 6, color: '#6B7280', fontSize: 12, fontWeight: '700' },
  docGrid: { marginTop: 12, flexDirection: 'row', gap: 8 },
  docBox: { flex: 1, minHeight: 78, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21,123,255,0.12)' },
  docText: { color: '#FFFFFF', fontSize: 10, lineHeight: 14, textAlign: 'center', fontWeight: '900' },
  operationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  verificationCard: { flexGrow: 1, flexBasis: 360, minHeight: 360, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  documentPreview: { flex: 1, minHeight: 92, borderRadius: 14, padding: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  documentIcon: { marginBottom: 8, color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  rejectModal: { width: '100%', maxWidth: 560, alignSelf: 'center', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(109,93,251,0.16)' },
  orderCard: { flexGrow: 1, flexBasis: 360, minHeight: 310, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  orderTimeline: { marginTop: 14, gap: 8 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(148,163,184,0.28)' },
  timelineDotActive: { backgroundColor: '#2D7CFF' },
  timelineText: { color: '#9CA3AF', fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  timelineTextActive: { color: '#111827' },
  financeChartGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  financeLedgerGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  financeLedgerCard: { flexGrow: 1, flexBasis: 360, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.12)' },
  ledgerRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.1)' },
  growthGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  marketingCard: { flexGrow: 1, flexBasis: 320, minHeight: 260, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  campaignPreview: { width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'rgba(109,93,251,0.16)' },
  campaignPreviewText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  growthChannelCard: { flexGrow: 1, flexBasis: 260, minHeight: 150, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.12)' },
  supportCard: { flexGrow: 1, flexBasis: 340, minHeight: 270, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  settingsGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' },
  settingsPrimaryCard: { flexGrow: 1, flexBasis: 620, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.12)' },
  settingsSideCard: { flexGrow: 1, flexBasis: 340, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.12)' },
  sliderCard: { marginTop: 14, minHeight: 88, padding: 14, borderRadius: 15, gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.12)' },
  sliderTrack: { width: 170, height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: 'rgba(148,163,184,0.18)' },
  sliderFill: { height: 10, borderRadius: 5, backgroundColor: '#2D7CFF' },
  builderSummaryGrid: { marginBottom: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  builderSummaryCard: { flexGrow: 1, flexBasis: 180, minHeight: 72, padding: 12, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(220,232,255,0.12)' },
  telegramChannelGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  telegramChannelCard: { flexGrow: 1, flexBasis: 520, minHeight: 430, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  telegramStatusRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bodyText: { marginTop: 8, color: '#6B7280', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  warningText: { marginTop: 8, color: '#F59E0B', fontSize: 12, fontWeight: '900' },
  toast: { position: 'absolute', right: 22, bottom: 22, minHeight: 48, paddingHorizontal: 16, borderRadius: 14, justifyContent: 'center', backgroundColor: '#2D7CFF', shadowColor: '#2D7CFF', shadowOpacity: 0.4, shadowRadius: 16 },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  modalOverlay: { flex: 1, padding: 18, justifyContent: 'center', backgroundColor: 'rgba(17,24,39,0.36)' },
  modalCard: { width: '100%', maxWidth: 920, maxHeight: '92%', alignSelf: 'center', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(109,93,251,0.18)' },
  modalTitle: { color: '#111827', fontSize: 20, fontWeight: '900' },
  closeText: { color: '#6D5DFB', fontSize: 13, fontWeight: '900' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  iconPaneTall: { width: '42%', height: '100%', borderWidth: 2, borderRadius: 4 },
  iconPane: { width: '46%', height: '46%', borderWidth: 2, borderRadius: 4 },
  iconGrid3: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  iconGridDot: { width: 4, height: 4, borderRadius: 2, borderWidth: 1.5 },
  iconMap: { justifyContent: 'center' },
  iconMapFold: { position: 'absolute', left: 1, right: 1, top: 4, bottom: 4, borderWidth: 2, borderRadius: 4, transform: [{ rotate: '-7deg' }] },
  iconPin: { alignSelf: 'center', width: 10, height: 10, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  iconPinCore: { width: 3, height: 3, borderRadius: 2 },
  iconLanguage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontWeight: '900' },
  iconGlyphSmall: { marginLeft: -1, fontSize: 9, fontWeight: '900' },
  iconUsers: { alignItems: 'center', justifyContent: 'center' },
  iconUserHead: { width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  iconUserBody: { width: 15, height: 8, marginTop: 1, borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  iconUserHeadSmall: { position: 'absolute', right: 1, top: 4, width: 6, height: 6, borderRadius: 3, borderWidth: 1.6 },
  iconShield: { borderWidth: 2, borderRadius: 6, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconCheckA: { position: 'absolute', width: 6, height: 2, borderRadius: 2, transform: [{ translateX: -3 }, { rotate: '38deg' }] },
  iconCheckB: { position: 'absolute', width: 10, height: 2, borderRadius: 2, transform: [{ translateX: 3 }, { rotate: '-45deg' }] },
  iconFile: { borderWidth: 2, borderRadius: 4 },
  iconClip: { position: 'absolute', top: -3, left: 5, width: 8, height: 5, borderWidth: 1.5, borderRadius: 3, backgroundColor: '#FFFFFF' },
  iconLine: { position: 'absolute', left: 4, width: 10, height: 2, borderRadius: 2 },
  iconWallet: { borderWidth: 2, borderRadius: 5, justifyContent: 'center' },
  iconWalletPocket: { position: 'absolute', right: -1, width: 9, height: 8, borderWidth: 2, borderRadius: 4 },
  iconWalletDot: { position: 'absolute', right: 4, width: 3, height: 3, borderRadius: 2 },
  iconMegaphone: { justifyContent: 'center' },
  iconHorn: { width: 15, height: 11, borderWidth: 2, borderRadius: 3, transform: [{ skewX: '-12deg' }] },
  iconHandle: { width: 4, height: 8, marginLeft: 4, marginTop: -1, borderRadius: 2 },
  iconSound: { position: 'absolute', right: 0, width: 5, height: 12, borderRightWidth: 2, borderRadius: 8 },
  iconBuoy: { borderWidth: 2, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  iconBuoyCore: { width: '42%', height: '42%', borderWidth: 2, borderRadius: 999 },
  iconPalette: { borderWidth: 2, borderRadius: 999 },
  iconPaletteDot: { position: 'absolute', top: 5, width: 3, height: 3, borderRadius: 2 },
  iconSend: { justifyContent: 'center' },
  iconSendWing: { width: 16, height: 16, borderTopWidth: 2, borderRightWidth: 2, transform: [{ rotate: '45deg' }] },
  iconSendLine: { position: 'absolute', left: 4, width: 11, height: 2, borderRadius: 2, transform: [{ rotate: '-18deg' }] },
  iconGear: { borderWidth: 2, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  iconGearTooth: { position: 'absolute', width: 3, height: 20, borderRadius: 2 },
  iconGearCore: { width: 7, height: 7, borderWidth: 2, borderRadius: 4, backgroundColor: '#FFFFFF' },
  iconBell: { borderWidth: 2, borderTopLeftRadius: 9, borderTopRightRadius: 9, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  iconBellBase: { position: 'absolute', bottom: -3, alignSelf: 'center', width: 7, height: 2, borderRadius: 2 },
  iconBolt: { justifyContent: 'center', alignItems: 'center' },
  iconBoltTop: { width: 7, height: 10, borderRadius: 2, transform: [{ skewX: '-22deg' }, { translateY: 2 }] },
  iconBoltBottom: { width: 7, height: 10, borderRadius: 2, transform: [{ skewX: '-22deg' }, { translateY: -2 }, { translateX: 4 }] },
  iconSearch: { borderWidth: 2, borderRadius: 999 },
  iconSearchHandle: { position: 'absolute', right: -3, bottom: -2, width: 7, height: 2, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  iconTrend: { justifyContent: 'center' },
  iconTrendLine: { width: 16, height: 2, borderRadius: 2, transform: [{ rotate: '-28deg' }] },
  iconTrendArrow: { position: 'absolute', right: 0, top: 3, width: 6, height: 6, borderTopWidth: 2, borderRightWidth: 2, transform: [{ rotate: '18deg' }] },
});

