import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';
import { colors } from '../constants/theme';
import { RoleCardSettings, RolePreviewMode, useRoleCardSettings } from '../context/RoleCardSettingsContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { TableRow } from '../lib/database.types';
import { adminBackend } from '../services/adminBackend';
import { UserRole } from '../types/navigation';

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
  | 'roleCustomization'
  | 'telegram'
  | 'logs'
  | 'settings';
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
  clientRegistrationChatId: string;
  masterRegistrationChatId: string;
  orderNotificationChatId: string;
  supportChatId: string;
  paymentAlertChatId: string;
  systemLogsChatId: string;
  siteChangeLogsChatId: string;
  newClientRegistration: boolean;
  newMasterRegistration: boolean;
  newOrder: boolean;
  payment: boolean;
  supportTicket: boolean;
  verificationRequest: boolean;
  siteChangeLog: boolean;
  adminActionLog: boolean;
};

type AppSettings = {
  maintenanceMode: boolean;
  appVersion: string;
  minimumAppVersion: string;
  defaultCurrency: string;
  defaultLanguage: string;
  commissionPercent: string;
  guestLogin: boolean;
  masterRegistration: boolean;
  clientRegistration: boolean;
  payments: boolean;
  telegramNotifications: boolean;
  aiRecommendations: boolean;
  mapSystem: boolean;
};

type ModalState =
  | { kind: 'category'; item?: CategoryRecord }
  | { kind: 'country'; item?: CountryRecord }
  | { kind: 'translation'; item?: TranslationRecord }
  | { kind: 'user'; item: AdminUser }
  | { kind: 'order'; item: OrderRecord }
  | { kind: 'banner' }
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
  { id: 'roleCustomization', label: 'Role Customization', group: 'Settings' },
  { id: 'telegram', label: 'Telegram', group: 'Settings' },
  { id: 'logs', label: 'Logs', group: 'Settings' },
  { id: 'settings', label: 'App Settings', group: 'Settings' },
];

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
  color: ['#157BFF', '#7C3AED', '#41E6A4', '#F9D77E'][index % 4],
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
    name_ru: 'Армения',
    name_en: 'Armenia',
    name_hy: 'Հայաստան',
    iso2: 'AM',
    iso3: 'ARM',
    emoji: 'AM',
    flagImage: 'flag-placeholder-am.png',
    countryPhoto: 'country-photo-am.png',
    currency: 'AMD',
    language: 'hy',
    capital_ru: 'Ереван',
    capital_en: 'Yerevan',
    isActive: true,
    marketplaceEnabled: true,
  },
  {
    id: 'country-us',
    name_ru: 'США',
    name_en: 'United States',
    name_hy: 'ԱՄՆ',
    iso2: 'US',
    iso3: 'USA',
    emoji: 'US',
    flagImage: 'flag-placeholder-us.png',
    countryPhoto: 'country-photo-us.png',
    currency: 'USD',
    language: 'en',
    capital_ru: 'Вашингтон',
    capital_en: 'Washington',
    isActive: true,
    marketplaceEnabled: false,
  },
];

const initialRegions: RegionRecord[] = [
  { id: 'region-yerevan', countryIso2: 'AM', name_ru: 'Ереван', name_en: 'Yerevan', name_hy: 'Երևան', type_ru: 'город', type_en: 'city', capital_ru: 'Ереван', capital_en: 'Yerevan', isActive: true },
  { id: 'region-california', countryIso2: 'US', name_ru: 'Калифорния', name_en: 'California', name_hy: 'Կալիֆոռնիա', type_ru: 'штат', type_en: 'state', capital_ru: 'Сакраменто', capital_en: 'Sacramento', isActive: true },
];

const initialCities: CityRecord[] = [
  { id: 'city-yerevan', regionId: 'region-yerevan', name_ru: 'Ереван', name_en: 'Yerevan', name_hy: 'Երևան', isActive: true, latitude: '40.1792', longitude: '44.4991' },
  { id: 'city-la', regionId: 'region-california', name_ru: 'Лос-Анджелес', name_en: 'Los Angeles', name_hy: 'Լոս Անջելես', isActive: true, latitude: '34.0522', longitude: '-118.2437' },
];

const initialTranslations: TranslationRecord[] = [
  { id: 'tr-1', key: 'home.hero.title', module: 'home', ru: 'Найдите мастера', en: 'Find a master', hy: 'Գտեք վարպետ', status: 'complete', updatedAt: 'Today' },
  { id: 'tr-2', key: 'wallet.secure_deal', module: 'wallet', ru: 'Безопасная сделка', en: 'Secure deal', hy: '', status: 'missing', updatedAt: 'Today' },
  { id: 'tr-3', key: 'admin.telegram.title', module: 'admin', ru: 'Telegram уведомления', en: 'Telegram notifications', hy: 'Telegram ծանուցումներ', status: 'complete', updatedAt: 'Yesterday' },
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
  clientRegistrationChatId: '',
  masterRegistrationChatId: '',
  orderNotificationChatId: '',
  supportChatId: '',
  paymentAlertChatId: '',
  systemLogsChatId: '',
  siteChangeLogsChatId: '',
  newClientRegistration: true,
  newMasterRegistration: true,
  newOrder: true,
  payment: true,
  supportTicket: true,
  verificationRequest: true,
  siteChangeLog: true,
  adminActionLog: true,
};

const initialAppSettings: AppSettings = {
  maintenanceMode: false,
  appVersion: '2.1.0',
  minimumAppVersion: '1.0.0',
  defaultCurrency: 'AMD',
  defaultLanguage: 'en',
  commissionPercent: '12',
  guestLogin: true,
  masterRegistration: true,
  clientRegistration: true,
  payments: true,
  telegramNotifications: true,
  aiRecommendations: true,
  mapSystem: true,
};

export default function AdminScreen({ onExit }: { onExit: () => void }) {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const roleCards = useRoleCardSettings();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [categories, setCategories] = useState(initialCategories);
  const [countries, setCountries] = useState(initialCountries);
  const [regions, setRegions] = useState(initialRegions);
  const [cities, setCities] = useState(initialCities);
  const [translations, setTranslations] = useState(initialTranslations);
  const [users, setUsers] = useState(initialUsers);
  const [orders, setOrders] = useState(initialOrders);
  const [logs, setLogs] = useState(initialLogs);
  const [telegram, setTelegram] = useState(initialTelegram);
  const [appSettings, setAppSettings] = useState(initialAppSettings);

  const addLog = (action: string, moduleName: string, details: string) => {
    setLogs((items) => [
      { id: uid('log'), adminName: 'Super Admin', action, module: moduleName, dateTime: nowStamp(), ip: '127.0.0.1', status: 'completed', details },
      ...items,
    ]);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    Promise.all([
      adminBackend.listCategories(),
      adminBackend.listCountries(),
      adminBackend.listTranslations(),
      adminBackend.listOrders(),
    ])
      .then(([categoryRows, countryRows, translationRows, orderRows]) => {
        setCategories(categoryRows.map(mapCategoryFromDb));
        setCountries(countryRows.map(mapCountryFromDb));
        setTranslations(translationRows.map(mapTranslationFromDb));
        setOrders(orderRows.map(mapOrderFromDb));
        notify('Admin data synced from Supabase');
      })
      .catch((error) => notify(error instanceof Error ? error.message : 'Supabase admin sync failed'));
  }, []);
  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };
  const saveTelegram = () => {
    addLog('changed Telegram settings', 'Settings', 'Saved Telegram notification settings locally.');
    notify('Telegram settings saved locally');
  };
  const sendTelegramTest = () => {
    addLog('sent Telegram test message', 'Settings', 'Mock Telegram Bot API test message succeeded.');
    notify('Test message sent successfully');
  };

  const dashboard = useMemo(() => {
    const masters = users.filter((user) => user.role === 'Master');
    return {
      totalClients: users.filter((user) => user.role === 'Client').length,
      totalMasters: masters.length,
      pendingMasters: masters.filter((user) => user.verification === 'pending').length,
      activeOrders: orders.filter((order) => !['completed', 'cancelled', 'refunded'].includes(order.status)).length,
      completedOrders: orders.filter((order) => order.status === 'completed').length,
      revenue: orders.reduce((sum, order) => sum + order.amount * 0.12, 0),
      payouts: orders.filter((order) => order.secureDeal === 'paid').reduce((sum, order) => sum + order.amount * 0.88, 0),
      activeCountries: countries.filter((country) => country.isActive).length,
      activeCities: cities.filter((city) => city.isActive).length,
      supportTickets: 8,
    };
  }, [cities, countries, orders, users]);

  const content = (() => {
    if (activeModule === 'dashboard') {
      return <Dashboard dashboard={dashboard} />;
    }
    if (activeModule === 'telegram') {
      return <TelegramSettingsPanel settings={telegram} onChange={setTelegram} onSave={saveTelegram} onTest={sendTelegramTest} />;
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
            if (isSupabaseConfigured) {
              adminBackend.deleteCategory(id).catch((error) => notify(error instanceof Error ? error.message : 'Category delete failed'));
            }
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
          onEditCountry={(item) => setModal({ kind: 'country', item })}
          onToggleCountry={(id) => setCountries((items) => items.map((item) => item.id === id ? { ...item, isActive: !item.isActive } : item))}
        />
      );
    }
    if (activeModule === 'translations') {
      return <TranslationsPanel translations={translations} query={query} onAdd={() => setModal({ kind: 'translation' })} onEdit={(item) => setModal({ kind: 'translation', item })} />;
    }
    if (activeModule === 'users') {
      return <UsersPanel users={users} query={query} onEdit={(item) => setModal({ kind: 'user', item })} onToggle={(id) => setUsers((items) => items.map((item) => item.id === id ? { ...item, status: item.status === 'blocked' ? 'active' : 'blocked' } : item))} />;
    }
    if (activeModule === 'verification') {
      return <VerificationPanel masters={users.filter((user) => user.role === 'Master')} onApprove={(id) => setUsers((items) => items.map((item) => item.id === id ? { ...item, verification: 'verified', status: 'active' } : item))} onReject={(id) => setUsers((items) => items.map((item) => item.id === id ? { ...item, verification: 'rejected' } : item))} />;
    }
    if (activeModule === 'orders') {
      return <OrdersPanel orders={orders} query={query} onDetails={(item) => setModal({ kind: 'order', item })} onStatus={(id, status) => setOrders((items) => items.map((item) => item.id === id ? { ...item, status } : item))} />;
    }
    if (activeModule === 'finance') {
      return <FinancePanel orders={orders} users={users} />;
    }
    if (activeModule === 'marketing') {
      return <MarketingPanel onAddBanner={() => setModal({ kind: 'banner' })} />;
    }
    if (activeModule === 'support') {
      return <SupportPanel />;
    }
    if (activeModule === 'roleCustomization') {
      return (
        <RoleRegistrationCustomizationPanel
          settings={roleCards.settings}
          onReplace={roleCards.replaceRoleCard}
          onReset={async () => {
            await roleCards.resetRoleCards();
            addLog('changed role registration customization', 'App Customization', 'Reset role cards to default configuration.');
            notify('Role cards reset');
          }}
          onSave={() => {
            addLog('changed role registration customization', 'App Customization', 'Saved role card visual configuration locally.');
            notify('Role registration customization saved');
          }}
        />
      );
    }
    return <AppSettingsPanel settings={appSettings} onChange={setAppSettings} onSave={() => { addLog('changed app settings', 'Settings', 'Saved app settings locally.'); notify('App settings saved'); }} />;
  })();

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#050816', '#08111F', '#09071D']} style={StyleSheet.absoluteFill} />
      <View style={[styles.shell, compact && styles.shellCompact]}>
        <Sidebar active={activeModule} compact={compact} onSelect={setActiveModule} onExit={onExit} />
        <View style={styles.main}>
          <Topbar active={activeModule} query={query} onQuery={setQuery} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          if (isSupabaseConfigured) {
            adminBackend.saveCategory(item.id || null, mapCategoryToDb(item)).catch((error) => notify(error instanceof Error ? error.message : 'Category save failed'));
          }
          addLog(item.id ? 'changed category' : 'added category', 'Categories', `Saved category ${item.name_en}.`);
          setModal(null);
        }}
        onSaveCountry={(item) => {
          setCountries((items) => item.id ? items.map((country) => country.id === item.id ? item : country) : [{ ...item, id: uid('country') }, ...items]);
          if (isSupabaseConfigured) {
            adminBackend.saveCountry(item.id || null, mapCountryToDb(item)).catch((error) => notify(error instanceof Error ? error.message : 'Country save failed'));
          }
          addLog(item.id ? 'edited country' : 'added country', 'Locations', `Saved country ${item.name_en}.`);
          setModal(null);
        }}
        onSaveTranslation={(item) => {
          setTranslations((items) => item.id ? items.map((translation) => translation.id === item.id ? item : translation) : [{ ...item, id: uid('tr') }, ...items]);
          if (isSupabaseConfigured) {
            adminBackend.saveTranslation(item.id || null, mapTranslationToDb(item)).catch((error) => notify(error instanceof Error ? error.message : 'Translation save failed'));
          }
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
          if (isSupabaseConfigured) {
            adminBackend.updateOrder(item.id, { status: item.status, payment_status: item.secureDeal }).catch((error) => notify(error instanceof Error ? error.message : 'Order save failed'));
          }
          addLog('changed order', 'Orders', `Saved order ${item.id}.`);
          setModal(null);
        }}
        onToast={notify}
      />
    </SafeAreaView>
  );
}

function Sidebar({ active, compact, onSelect, onExit }: { active: AdminModule; compact: boolean; onSelect: (module: AdminModule) => void; onExit: () => void }) {
  const grouped = modules.reduce<Record<string, typeof modules>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  return (
    <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>F</Text></View>
        {!compact ? <View><Text style={styles.brandTitle}>Fixora Pro</Text><Text style={styles.brandSubtitle}>Super Admin</Text></View> : null}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([group, items]) => (
          <View key={group} style={styles.navGroup}>
            {!compact ? <Text style={styles.navGroupText}>{group}</Text> : null}
            {items.map((item) => {
              const selected = active === item.id;
              return (
                <Pressable key={item.id} onPress={() => onSelect(item.id)} style={[styles.navItem, selected && styles.navItemActive]}>
                  <Text style={[styles.navIcon, selected && styles.navTextActive]}>{item.label.slice(0, 1)}</Text>
                  {!compact ? <Text style={[styles.navText, selected && styles.navTextActive]}>{item.label}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
      <Pressable onPress={onExit} style={styles.exitButton}><Text style={styles.exitText}>{compact ? '<' : 'Exit admin'}</Text></Pressable>
    </View>
  );
}

function Topbar({ active, query, onQuery }: { active: AdminModule; query: string; onQuery: (value: string) => void }) {
  const title = modules.find((item) => item.id === active)?.label ?? 'Admin';
  return (
    <View style={styles.topbar}>
      <View>
        <Text style={styles.topKicker}>Production foundation / Supabase-ready mock</Text>
        <Text style={styles.topTitle}>{title}</Text>
      </View>
      <View style={styles.topActions}>
        <TextInput value={query} onChangeText={onQuery} placeholder="Search admin data..." placeholderTextColor="#69748F" style={styles.searchInput} />
        <View style={styles.bell}><Text style={styles.bellText}>N</Text></View>
        <View style={styles.adminAvatar}><Text style={styles.adminAvatarText}>SA</Text></View>
      </View>
    </View>
  );
}

function Dashboard({ dashboard }: { dashboard: Record<string, number> }) {
  const metrics = [
    ['Total Clients', dashboard.totalClients],
    ['Total Masters', dashboard.totalMasters],
    ['New Registrations', 34],
    ['Pending Master Verification', dashboard.pendingMasters],
    ['Active Orders', dashboard.activeOrders],
    ['Completed Orders', dashboard.completedOrders],
    ['Revenue', dashboard.revenue],
    ['Payouts', dashboard.payouts],
    ['Active Countries', dashboard.activeCountries],
    ['Active Cities', dashboard.activeCities],
    ['Support Tickets', dashboard.supportTickets],
  ];
  return (
    <>
      <View style={styles.metricsGrid}>
        {metrics.map(([label, value]) => <MetricCard key={label} label={String(label)} value={typeof value === 'number' && value > 1000 ? amd(value) : String(value)} />)}
      </View>
      <View style={styles.chartGrid}>
        {['Registrations chart', 'Orders chart', 'Revenue chart', 'Masters growth chart'].map((title) => <ChartPlaceholder key={title} title={title} />)}
      </View>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(21,123,255,0.07)']} style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </LinearGradient>
  );
}

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <GlassCard style={styles.chartCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Badge label="Mock chart" tone="blue" />
      </View>
      <View style={styles.chartBars}>
        {[42, 78, 56, 88, 64, 96, 72, 84].map((height, index) => <View key={index} style={[styles.chartBar, { height }]} />)}
      </View>
    </GlassCard>
  );
}

function TelegramSettingsPanel({ settings, onChange, onSave, onTest }: { settings: TelegramSettings; onChange: (settings: TelegramSettings) => void; onSave: () => void; onTest: () => void }) {
  const fields: Array<[keyof TelegramSettings, string]> = [
    ['botToken', 'Bot Token'],
    ['clientRegistrationChatId', 'Client Registration Chat ID'],
    ['masterRegistrationChatId', 'Master Registration Chat ID'],
    ['orderNotificationChatId', 'Order Notification Chat ID'],
    ['supportChatId', 'Support Chat ID'],
    ['paymentAlertChatId', 'Payment Alert Chat ID'],
    ['systemLogsChatId', 'System Logs Chat ID'],
    ['siteChangeLogsChatId', 'Site Change Logs Chat ID'],
  ];
  const toggles: Array<[keyof TelegramSettings, string]> = [
    ['enabled', 'Enable Telegram notifications'],
    ['newClientRegistration', 'New client registration'],
    ['newMasterRegistration', 'New master registration'],
    ['newOrder', 'New order'],
    ['payment', 'Payment'],
    ['supportTicket', 'Support ticket'],
    ['verificationRequest', 'Verification request'],
    ['siteChangeLog', 'Site change log'],
    ['adminActionLog', 'Admin action log'],
  ];
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="Settings / Telegram Notifications" action="Ready for Telegram Bot API" />
      <View style={styles.formGrid}>
        {fields.map(([key, label]) => <AdminInput key={key} label={label} value={String(settings[key])} onChange={(value) => onChange({ ...settings, [key]: value })} />)}
      </View>
      <View style={styles.toggleGrid}>
        {toggles.map(([key, label]) => <ToggleRow key={key} label={label} value={Boolean(settings[key])} onChange={() => onChange({ ...settings, [key]: !settings[key] })} />)}
      </View>
      <View style={styles.actionRow}>
        <ActionButton label="Save settings" onPress={onSave} />
        <ActionButton label="Send test message" variant="secondary" onPress={onTest} />
      </View>
    </GlassCard>
  );
}

function LogsPanel({ logs, query, onDetails }: { logs: AdminLog[]; query: string; onDetails: (log: AdminLog) => void }) {
  const filtered = searchRows(logs, query, (item) => [item.adminName, item.action, item.module, item.details]);
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="Admin Action Logs" action={`${filtered.length} logs`} />
      <DataTable columns={['Admin', 'Action', 'Module', 'Date / IP', 'Status', '']} rows={filtered.map((log) => [
        log.adminName,
        log.action,
        log.module,
        `${log.dateTime} / ${log.ip}`,
        <Badge key="status" label={log.status} tone="green" />,
        <TinyButton key="details" label="Details" onPress={() => onDetails(log)} />,
      ])} />
    </GlassCard>
  );
}

function CategoriesPanel({ categories, query, onAdd, onEdit, onDelete, onToggle }: { categories: CategoryRecord[]; query: string; onAdd: () => void; onEdit: (item: CategoryRecord) => void; onDelete: (id: string) => void; onToggle: (id: string) => void }) {
  const filtered = searchRows(categories, query, (item) => [item.name_en, item.slug, item.name_ru, item.name_hy]);
  return (
    <>
      <SectionTitle title="Category Management" action="Add category" onAction={onAdd} />
      <View style={styles.categoryGrid}>
        {filtered.slice(0, 8).map((category) => <CategoryTile key={category.id} category={category} onEdit={() => onEdit(category)} onToggle={() => onToggle(category.id)} />)}
      </View>
      <GlassCard style={styles.panel}>
        <DataTable columns={['Icon', 'Name', 'Slug', 'Order', 'Countries', 'Status', 'Actions']} rows={filtered.map((category) => [
          category.icon,
          category.name_en,
          category.slug,
          String(category.sortOrder),
          category.availableCountries.join(', '),
          <Toggle key="toggle" value={category.isActive} onChange={() => onToggle(category.id)} />,
          <RowActions key="actions" onEdit={() => onEdit(category)} onDelete={() => onDelete(category.id)} />,
        ])} />
      </GlassCard>
    </>
  );
}

function CategoryTile({ category, onEdit, onToggle }: { category: CategoryRecord; onEdit: () => void; onToggle: () => void }) {
  return (
    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(124,58,237,0.08)']} style={styles.categoryTile}>
      <View style={[styles.tileIcon, { backgroundColor: category.color }]}><Text style={styles.tileIconText}>{category.icon}</Text></View>
      <Text style={styles.tileTitle}>{category.name_en}</Text>
      <Text style={styles.tileMeta}>{category.availableCities.join(', ')}</Text>
      <View style={styles.actionRow}><TinyButton label="Edit" onPress={onEdit} /><Toggle value={category.isActive} onChange={onToggle} /></View>
    </LinearGradient>
  );
}

function LocationsPanel({ countries, regions, cities, query, onAddCountry, onEditCountry, onToggleCountry }: { countries: CountryRecord[]; regions: RegionRecord[]; cities: CityRecord[]; query: string; onAddCountry: () => void; onEditCountry: (item: CountryRecord) => void; onToggleCountry: (id: string) => void }) {
  const filtered = searchRows(countries, query, (item) => [item.name_en, item.iso2, item.currency, item.capital_en]);
  return (
    <>
      <SectionTitle title="Location Management" action="Add country" onAction={onAddCountry} />
      <GlassCard style={styles.panel}>
        <DataTable columns={['Country', 'ISO', 'Currency', 'Capital', 'Marketplace', 'Active', 'Actions']} rows={filtered.map((country) => [
          `${country.emoji} ${country.name_en}`,
          `${country.iso2} / ${country.iso3}`,
          country.currency,
          country.capital_en,
          country.marketplaceEnabled ? 'Enabled' : 'Disabled',
          <Toggle key="active" value={country.isActive} onChange={() => onToggleCountry(country.id)} />,
          <TinyButton key="edit" label="Edit" onPress={() => onEditCountry(country)} />,
        ])} />
      </GlassCard>
      <View style={styles.twoColumn}>
        <NestedList title="Regions" items={regions.map((region) => `${region.name_en} / ${region.countryIso2} / ${region.type_en}`)} />
        <NestedList title="Cities" items={cities.map((city) => `${city.name_en} / ${city.latitude}, ${city.longitude}`)} />
      </View>
    </>
  );
}

function TranslationsPanel({ translations, query, onAdd, onEdit }: { translations: TranslationRecord[]; query: string; onAdd: () => void; onEdit: (item: TranslationRecord) => void }) {
  const filtered = searchRows(translations, query, (item) => [item.key, item.module, item.ru, item.en, item.hy]);
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="Translation Manager" action="Add key" onAction={onAdd} />
      <View style={styles.actionRow}>
        <TinyButton label="Export JSON" onPress={() => undefined} />
        <TinyButton label="Import JSON" onPress={() => undefined} />
      </View>
      <DataTable columns={['Key', 'Module', 'RU', 'EN', 'HY', 'Status', '']} rows={filtered.map((item) => [
        item.key,
        item.module,
        item.ru || 'Missing',
        item.en || 'Missing',
        item.hy || 'Missing',
        <Badge key="status" label={item.status} tone={item.status === 'missing' ? 'gold' : 'green'} />,
        <TinyButton key="edit" label="Edit" onPress={() => onEdit(item)} />,
      ])} />
    </GlassCard>
  );
}

function UsersPanel({ users, query, onEdit, onToggle }: { users: AdminUser[]; query: string; onEdit: (item: AdminUser) => void; onToggle: (id: string) => void }) {
  const [tab, setTab] = useState<AdminUser['role']>('Client');
  const filtered = searchRows(users.filter((user) => user.role === tab), query, (item) => [item.name, item.city, item.categories]);
  return (
    <GlassCard style={styles.panel}>
      <TabRow tabs={['Client', 'Master', 'Company', 'Admin']} active={tab} onChange={(value) => setTab(value as AdminUser['role'])} />
      <DataTable columns={['Name', 'City', 'Verification', 'Rating', 'Orders', 'Premium', 'Actions']} rows={filtered.map((user) => [
        user.name,
        user.city,
        user.verification,
        String(user.rating),
        String(user.completedOrders),
        user.premium ? 'Yes' : 'No',
        <RowActions key="actions" editLabel="View/Edit" deleteLabel={user.status === 'blocked' ? 'Unblock' : 'Block'} onEdit={() => onEdit(user)} onDelete={() => onToggle(user.id)} />,
      ])} />
    </GlassCard>
  );
}

function VerificationPanel({ masters, onApprove, onReject }: { masters: AdminUser[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="Master Verification" action="Document queue" />
      <View style={styles.cardGrid}>
        {masters.map((master) => (
          <View key={master.id} style={styles.verifyCard}>
            <Text style={styles.cardTitle}>{master.name}</Text>
            <Text style={styles.cardMeta}>{master.city} / {master.categories}</Text>
            <View style={styles.docGrid}>
              {['Passport placeholder', 'Selfie placeholder', 'Certificates placeholder'].map((doc) => <View key={doc} style={styles.docBox}><Text style={styles.docText}>{doc}</Text></View>)}
            </View>
            <AdminInput label="Rejection reason" value="" onChange={() => undefined} />
            <View style={styles.actionRow}><ActionButton label="Approve" onPress={() => onApprove(master.id)} /><ActionButton label="Reject" variant="danger" onPress={() => onReject(master.id)} /></View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

function OrdersPanel({ orders, query, onDetails, onStatus }: { orders: OrderRecord[]; query: string; onDetails: (item: OrderRecord) => void; onStatus: (id: string, status: OrderRecord['status']) => void }) {
  const filtered = searchRows(orders, query, (item) => [item.id, item.client, item.master, item.city, item.status]);
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="Orders Management" action="Disputes enabled" />
      <DataTable columns={['Order', 'Client', 'Master', 'City', 'Status', 'Secure Deal', 'Actions']} rows={filtered.map((order) => [
        `${order.id} / ${amd(order.amount)}`,
        order.client,
        order.master,
        order.city,
        <Badge key="status" label={order.status} tone={order.status === 'disputed' ? 'gold' : 'blue'} />,
        order.secureDeal,
        <View key="actions" style={styles.rowActionWrap}><TinyButton label="Details" onPress={() => onDetails(order)} /><TinyButton label="Refund" onPress={() => onStatus(order.id, 'refunded')} /></View>,
      ])} />
    </GlassCard>
  );
}

function FinancePanel({ orders, users }: { orders: OrderRecord[]; users: AdminUser[] }) {
  const paid = orders.filter((order) => order.secureDeal === 'paid');
  return (
    <>
      <View style={styles.metricsGrid}>
        <MetricCard label="Commissions" value={amd(orders.reduce((sum, order) => sum + order.amount * 0.12, 0))} />
        <MetricCard label="Master payouts" value={amd(paid.reduce((sum, order) => sum + order.amount * 0.88, 0))} />
        <MetricCard label="Client refunds" value={amd(12000)} />
        <MetricCard label="Wallet balances" value={amd(users.length * 18000)} />
      </View>
      <GlassCard style={styles.panel}>
        <SectionTitle title="Transactions / Payout requests" action="Secure deal ledger" />
        <DataTable columns={['Order', 'Amount', 'Commission', 'Master payout', 'Method', 'Status']} rows={orders.map((order) => [order.id, amd(order.amount), amd(order.amount * 0.12), amd(order.amount * 0.88), 'Bank/Card/Idram', order.secureDeal])} />
      </GlassCard>
    </>
  );
}

function MarketingPanel({ onAddBanner }: { onAddBanner: () => void }) {
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="Marketing Management" action="Add banner" onAction={onAddBanner} />
      <DataTable columns={['Asset', 'Target', 'Dates', 'Status', 'Tools']} rows={[
        ['Homepage VIP banner', 'AM / Yerevan / Kentron', 'Jun 01 - Jun 30', <Badge key="active" label="active" tone="green" />, 'Banners, ads, promo codes'],
        ['Featured masters push', 'All countries', 'Always on', <Badge key="draft" label="draft" tone="gold" />, 'Push notifications'],
        ['Premium placements', 'Yerevan', 'May 26 - Jun 05', <Badge key="active2" label="active" tone="green" />, 'Featured masters'],
      ]} />
    </GlassCard>
  );
}

function SupportPanel() {
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="Support System" action="Operator queue" />
      <DataTable columns={['Ticket', 'Type', 'Assigned', 'Status', 'Order', 'Action']} rows={[
        ['SUP-1001', 'Complaint', 'Operator A', <Badge key="open" label="open" tone="gold" />, 'ord-1003', 'Assign / status update'],
        ['SUP-1002', 'User message', 'Operator B', <Badge key="progress" label="in progress" tone="blue" />, '-', 'Reply placeholder'],
        ['SUP-1003', 'Order dispute', 'Operator A', <Badge key="review" label="review" tone="gold" />, 'ord-1003', 'Dispute management'],
      ]} />
    </GlassCard>
  );
}

function AppSettingsPanel({ settings, onChange, onSave }: { settings: AppSettings; onChange: (settings: AppSettings) => void; onSave: () => void }) {
  const toggles: Array<[keyof AppSettings, string]> = [
    ['maintenanceMode', 'Maintenance mode'],
    ['guestLogin', 'Enable guest login'],
    ['masterRegistration', 'Enable master registration'],
    ['clientRegistration', 'Enable client registration'],
    ['payments', 'Enable payments'],
    ['telegramNotifications', 'Enable Telegram notifications'],
    ['aiRecommendations', 'Enable AI recommendations'],
    ['mapSystem', 'Enable map system'],
  ];
  return (
    <GlassCard style={styles.panel}>
      <SectionTitle title="App Settings" action="Runtime flags" />
      <View style={styles.formGrid}>
        <AdminInput label="App version" value={settings.appVersion} onChange={(value) => onChange({ ...settings, appVersion: value })} />
        <AdminInput label="Minimum app version" value={settings.minimumAppVersion} onChange={(value) => onChange({ ...settings, minimumAppVersion: value })} />
        <AdminInput label="Default currency" value={settings.defaultCurrency} onChange={(value) => onChange({ ...settings, defaultCurrency: value })} />
        <AdminInput label="Default language" value={settings.defaultLanguage} onChange={(value) => onChange({ ...settings, defaultLanguage: value })} />
        <AdminInput label="Commission percent" value={settings.commissionPercent} onChange={(value) => onChange({ ...settings, commissionPercent: value })} />
      </View>
      <View style={styles.toggleGrid}>
        {toggles.map(([key, label]) => <ToggleRow key={key} label={label} value={Boolean(settings[key])} onChange={() => onChange({ ...settings, [key]: !settings[key] })} />)}
      </View>
      <ActionButton label="Save app settings" onPress={onSave} />
    </GlassCard>
  );
}

const roleColorPresets = ['#157BFF', '#7C3AED', '#06B6D4', '#41E6A4', '#FF5D7A', '#F97316', '#EC4899', '#F9D77E'];

function RoleRegistrationCustomizationPanel({
  settings,
  onReplace,
  onReset,
  onSave,
}: {
  settings: Record<UserRole, RoleCardSettings>;
  onReplace: (role: UserRole, next: RoleCardSettings) => Promise<void>;
  onReset: () => Promise<void>;
  onSave: () => void;
}) {
  const [activeRole, setActiveRole] = useState<UserRole>('master');
  const [previewMode, setPreviewMode] = useState<RolePreviewMode>('dark');
  const card = settings[activeRole];

  const replace = (next: RoleCardSettings) => {
    onReplace(activeRole, next).catch(() => undefined);
  };

  const patch = (patchValue: Partial<RoleCardSettings>) => replace({ ...card, ...patchValue });
  const patchVisual = (patchValue: Partial<RoleCardSettings['visual']>) => replace({ ...card, visual: { ...card.visual, ...patchValue } });
  const patchDesign = (patchValue: Partial<RoleCardSettings['design']>) => replace({ ...card, design: { ...card.design, ...patchValue } });
  const patchTypography = (patchValue: Partial<RoleCardSettings['typography']>) => replace({ ...card, typography: { ...card.typography, ...patchValue } });

  return (
    <View>
      <SectionTitle title="Role Registration Customization" action="Live config" />
      <View style={styles.customizerShell}>
        <GlassCard style={styles.customizerEditor}>
          <View style={styles.sectionHeader}>
            <TabRow tabs={['master', 'client']} active={activeRole} onChange={(tab) => setActiveRole(tab as UserRole)} />
            <View style={styles.rowActionWrap}>
              <ActionButton label="Save" onPress={onSave} />
              <ActionButton label="Reset" variant="secondary" onPress={() => onReset()} />
            </View>
          </View>

          <Text style={styles.cardTitle}>Content</Text>
          <View style={styles.formGrid}>
            <AdminInput label="Role title" value={card.title} onChange={(value) => patch({ title: value })} />
            <AdminInput label="Subtitle" value={card.subtitle} onChange={(value) => patch({ subtitle: value })} />
            <AdminInput label="Button text" value={card.buttonText} onChange={(value) => patch({ buttonText: value })} />
            <AdminInput label="Description" value={card.description} onChange={(value) => patch({ description: value })} />
            <AdminInput label="Feature list" value={card.features.join(', ')} onChange={(value) => patch({ features: splitCsv(value) })} />
            <AdminInput label="Sort order" value={String(card.sortOrder)} onChange={(value) => patch({ sortOrder: Number(value) || 1 })} />
          </View>
          <View style={styles.toggleGrid}>
            <ToggleRow label="Role enabled" value={card.enabled} onChange={() => patch({ enabled: !card.enabled })} />
            <ToggleRow label="Show features" value={card.showFeatures} onChange={() => patch({ showFeatures: !card.showFeatures })} />
          </View>

          <Text style={styles.cardTitle}>Image management</Text>
          <View style={styles.formGrid}>
            <AdminInput label="Image URL / storage path" value={card.visual.image} onChange={(value) => patchVisual({ image: value })} />
            <AdminInput label="Image position" value={card.visual.imagePosition} onChange={(value) => patchVisual({ imagePosition: value as RoleCardSettings['visual']['imagePosition'] })} />
            <AdminInput label="Image size %" value={String(card.visual.imageSize)} onChange={(value) => patchVisual({ imageSize: clampNumber(value, 45, 160) })} />
            <AdminInput label="Image overlay" value={card.visual.imageOverlay} onChange={(value) => patchVisual({ imageOverlay: value })} />
            <AdminInput label="Brightness %" value={String(card.visual.imageBrightness)} onChange={(value) => patchVisual({ imageBrightness: clampNumber(value, 20, 140) })} />
            <AdminInput label="Blur" value={String(card.visual.imageBlur)} onChange={(value) => patchVisual({ imageBlur: clampNumber(value, 0, 18) })} />
          </View>
          <View style={styles.rowActionWrap}>
            <ActionButton label="Upload placeholder" variant="secondary" onPress={() => patchVisual({ image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&q=80' })} />
            <ActionButton label="Crop placeholder" variant="secondary" onPress={() => undefined} />
            <ActionButton label="Delete image" variant="danger" onPress={() => patchVisual({ image: '' })} />
          </View>

          <Text style={styles.cardTitle}>Design</Text>
          <View style={styles.formGrid}>
            <AdminInput label="Card background" value={card.design.background} onChange={(value) => patchDesign({ background: value })} />
            <AdminInput label="Gradient color 1" value={card.design.gradientColors[0]} onChange={(value) => patchDesign({ gradientColors: [value, card.design.gradientColors[1], card.design.gradientColors[2]] })} />
            <AdminInput label="Gradient color 2" value={card.design.gradientColors[1]} onChange={(value) => patchDesign({ gradientColors: [card.design.gradientColors[0], value, card.design.gradientColors[2]] })} />
            <AdminInput label="Gradient color 3" value={card.design.gradientColors[2]} onChange={(value) => patchDesign({ gradientColors: [card.design.gradientColors[0], card.design.gradientColors[1], value] })} />
            <AdminInput label="Border color" value={card.design.borderColor} onChange={(value) => patchDesign({ borderColor: value })} />
            <AdminInput label="Glow color" value={card.design.glowColor} onChange={(value) => patchDesign({ glowColor: value })} />
            <AdminInput label="Shadow intensity" value={String(card.design.shadowIntensity)} onChange={(value) => patchDesign({ shadowIntensity: clampNumber(value, 0, 100) })} />
            <AdminInput label="Selected glow" value={card.design.selectedGlow} onChange={(value) => patchDesign({ selectedGlow: value })} />
            <AdminInput label="Selected border" value={card.design.selectedBorder} onChange={(value) => patchDesign({ selectedBorder: value })} />
            <AdminInput label="Check icon style" value={card.design.checkIconStyle} onChange={(value) => patchDesign({ checkIconStyle: value as RoleCardSettings['design']['checkIconStyle'] })} />
          </View>
          <ColorPresetRow onPick={(value) => patchDesign({ glowColor: value, selectedGlow: value, gradientColors: [card.design.gradientColors[0], value, card.design.gradientColors[2]] })} />

          <Text style={styles.cardTitle}>Typography and icon</Text>
          <View style={styles.formGrid}>
            <AdminInput label="Font family" value={card.typography.fontFamily} onChange={(value) => patchTypography({ fontFamily: value })} />
            <AdminInput label="Title size" value={String(card.typography.titleSize)} onChange={(value) => patchTypography({ titleSize: clampNumber(value, 14, 36) })} />
            <AdminInput label="Subtitle size" value={String(card.typography.subtitleSize)} onChange={(value) => patchTypography({ subtitleSize: clampNumber(value, 12, 28) })} />
            <AdminInput label="Description size" value={String(card.typography.descriptionSize)} onChange={(value) => patchTypography({ descriptionSize: clampNumber(value, 10, 22) })} />
            <AdminInput label="Font weight" value={card.typography.fontWeight} onChange={(value) => patchTypography({ fontWeight: value as RoleCardSettings['typography']['fontWeight'] })} />
            <AdminInput label="Line height multiplier" value={String(card.typography.lineHeight)} onChange={(value) => patchTypography({ lineHeight: clampNumber(value, 1, 1.8) })} />
            <AdminInput label="Letter spacing" value={String(card.typography.letterSpacing)} onChange={(value) => patchTypography({ letterSpacing: clampNumber(value, -1, 4) })} />
            <AdminInput label="Text color" value={card.typography.textColor} onChange={(value) => patchTypography({ textColor: value })} />
            <AdminInput label="Muted color" value={card.typography.mutedColor} onChange={(value) => patchTypography({ mutedColor: value })} />
            <AdminInput label="Icon" value={card.visual.icon} onChange={(value) => patchVisual({ icon: value.slice(0, 3).toUpperCase() })} />
            <AdminInput label="Icon color" value={card.visual.iconColor} onChange={(value) => patchVisual({ iconColor: value })} />
            <AdminInput label="Icon size" value={String(card.visual.iconSize)} onChange={(value) => patchVisual({ iconSize: clampNumber(value, 24, 72) })} />
          </View>

          <Text style={styles.cardTitle}>Extra settings</Text>
          <View style={styles.formGrid}>
            <AdminInput label="Animation type" value={card.animation} onChange={(value) => patch({ animation: value as RoleCardSettings['animation'] })} />
            <AdminInput label="Card layout" value={card.layout} onChange={(value) => patch({ layout: value as RoleCardSettings['layout'] })} />
          </View>
        </GlassCard>

        <GlassCard style={styles.previewPanel}>
          <SectionTitle title="Real live preview" action="Instant update" />
          <TabRow tabs={['dark', 'light', 'mobile', 'tablet']} active={previewMode} onChange={(tab) => setPreviewMode(tab as RolePreviewMode)} />
          <View style={[styles.previewDevice, previewMode === 'tablet' && styles.previewTablet, previewMode === 'light' && styles.previewDeviceLight]}>
            <RoleCustomizationPreview card={card} previewMode={previewMode} />
          </View>
          <Text style={styles.bodyText}>Storage: role_card_settings config. Supabase-ready fields: role, title, subtitle, description, features, image, colors, gradients, typography, glow, borders, buttonText, updatedAt.</Text>
        </GlassCard>
      </View>
    </View>
  );
}

function ColorPresetRow({ onPick }: { onPick: (color: string) => void }) {
  return (
    <View style={styles.colorPresetRow}>
      {roleColorPresets.map((item) => (
        <Pressable key={item} onPress={() => onPick(item)} style={[styles.colorPreset, { backgroundColor: item }]} />
      ))}
    </View>
  );
}

function RoleCustomizationPreview({ card, previewMode }: { card: RoleCardSettings; previewMode: RolePreviewMode }) {
  const light = previewMode === 'light';
  return (
    <LinearGradient colors={light ? ['#F8FBFF', '#EEF4FF', '#FFFFFF'] : ['#050816', '#07111F', '#09071D']} style={styles.previewCanvas}>
      <View style={[styles.previewRoleCard, { borderColor: card.design.selectedBorder, shadowColor: card.design.glowColor, shadowOpacity: card.design.shadowIntensity / 100 }]}>
        <LinearGradient colors={card.design.gradientColors} style={styles.previewVisual}>
          {card.visual.image ? (
            <Text style={styles.previewImageLabel}>IMAGE</Text>
          ) : (
            <View style={[styles.previewIcon, { width: card.visual.iconSize, height: card.visual.iconSize, borderRadius: card.visual.iconSize / 2, borderColor: card.visual.iconColor }]}>
              <Text style={[styles.previewIconText, { color: card.visual.iconColor }]}>{card.visual.icon}</Text>
            </View>
          )}
        </LinearGradient>
        <Text style={[styles.previewTitle, { color: card.typography.textColor, fontSize: card.typography.titleSize, fontWeight: card.typography.fontWeight }]}>{card.title}</Text>
        <Text style={[styles.previewSubtitle, { color: card.typography.textColor, fontSize: card.typography.subtitleSize }]}>{card.subtitle}</Text>
        <Text style={[styles.previewDescription, { color: card.typography.mutedColor, fontSize: card.typography.descriptionSize }]}>{card.description}</Text>
        {card.showFeatures ? <View style={styles.previewFeatures}>{card.features.map((feature) => <Text key={feature} style={[styles.previewFeature, { color: card.visual.iconColor }]}>{feature}</Text>)}</View> : null}
        <View style={[styles.previewButton, { backgroundColor: card.design.selectedGlow }]}><Text style={styles.previewButtonText}>{card.buttonText}</Text></View>
      </View>
    </LinearGradient>
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
  onSaveTranslation,
  onSaveUser,
  onSaveOrder,
  onToast,
}: {
  modal: ModalState;
  onClose: () => void;
  onSaveCategory: (item: CategoryRecord) => void;
  onSaveCountry: (item: CountryRecord) => void;
  onSaveTranslation: (item: TranslationRecord) => void;
  onSaveUser: (item: AdminUser) => void;
  onSaveOrder: (item: OrderRecord) => void;
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
    color: '#157BFF',
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

  if (!modal) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient colors={['rgba(9,14,34,0.98)', 'rgba(12,9,31,0.98)']} style={styles.modalCard}>
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
                {['title_ru', 'title_en', 'title_hy', 'image', 'link', 'target country/region/city', 'start date', 'end date'].map((label) => <AdminInput key={label} label={label} value="" onChange={() => undefined} />)}
              </View>
              <ActionButton label="Save banner placeholder" onPress={() => { onToast('Banner saved locally'); onClose(); }} />
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
  if (modal.kind === 'translation') return modal.item ? 'Edit translation' : 'Add translation key';
  if (modal.kind === 'user') return 'View / edit user';
  if (modal.kind === 'order') return 'Order details';
  if (modal.kind === 'banner') return 'Add marketing banner';
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {columns.map((column) => <Text key={column} style={[styles.tableCell, styles.tableHead]}>{column}</Text>)}
        </View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {row.map((cell, cellIndex) => <View key={cellIndex} style={styles.tableCell}>{typeof cell === 'string' ? <Text style={styles.tableText}>{cell}</Text> : cell}</View>)}
          </View>
        ))}
      </View>
    </ScrollView>
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
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
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
  root: { flex: 1, backgroundColor: '#050816' },
  shell: { flex: 1, flexDirection: 'row' },
  shellCompact: { flexDirection: 'row' },
  sidebar: { width: 264, padding: 16, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(5,8,22,0.72)' },
  sidebarCompact: { width: 78, paddingHorizontal: 10 },
  brandRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5538FF' },
  brandMarkText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  brandTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  brandSubtitle: { marginTop: 2, color: '#8EA7FF', fontSize: 11, fontWeight: '900' },
  navGroup: { marginTop: 16, gap: 6 },
  navGroupText: { color: '#69748F', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  navItem: { minHeight: 40, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  navItemActive: { backgroundColor: 'rgba(21,123,255,0.18)', borderWidth: 1, borderColor: 'rgba(142,167,255,0.36)' },
  navIcon: { width: 20, color: '#AAB0C0', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  navText: { color: '#AAB0C0', fontSize: 13, fontWeight: '800' },
  navTextActive: { color: '#FFFFFF' },
  exitButton: { minHeight: 42, marginTop: 14, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' },
  exitText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  main: { flex: 1 },
  topbar: { minHeight: 76, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  topKicker: { color: '#8EA7FF', fontSize: 11, fontWeight: '900' },
  topTitle: { marginTop: 4, color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  topActions: { flex: 1, maxWidth: 640, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  searchInput: { flex: 1, minHeight: 42, minWidth: 160, paddingHorizontal: 14, borderRadius: 14, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', fontWeight: '800' },
  bell: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' },
  bellText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  adminAvatar: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(124,58,237,0.3)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.5)' },
  adminAvatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 60 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 180, minHeight: 106, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  metricLabel: { color: '#AAB0C0', fontSize: 12, fontWeight: '800' },
  metricValue: { marginTop: 12, color: '#FFFFFF', fontSize: 25, lineHeight: 31, fontWeight: '900' },
  chartGrid: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chartCard: { flexGrow: 1, flexBasis: 320, minHeight: 240, borderRadius: 20 },
  chartBars: { flex: 1, marginTop: 18, minHeight: 140, flexDirection: 'row', alignItems: 'flex-end', gap: 9 },
  chartBar: { flex: 1, borderRadius: 7, backgroundColor: '#426BFF' },
  panel: { marginTop: 14, borderRadius: 20 },
  customizerShell: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' },
  customizerEditor: { flexGrow: 1, flexBasis: 620, borderRadius: 20 },
  previewPanel: { flexGrow: 1, flexBasis: 340, borderRadius: 20 },
  colorPresetRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  colorPreset: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.36)' },
  previewDevice: { marginTop: 10, width: '100%', maxWidth: 390, minHeight: 620, alignSelf: 'center', borderRadius: 34, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: '#050816' },
  previewTablet: { maxWidth: 560, minHeight: 520, borderRadius: 28 },
  previewDeviceLight: { backgroundColor: '#F8FBFF', borderColor: 'rgba(16,24,40,0.12)' },
  previewCanvas: { flex: 1, padding: 18, alignItems: 'center', justifyContent: 'center' },
  previewRoleCard: { width: '100%', maxWidth: 330, minHeight: 420, padding: 14, borderRadius: 26, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)', shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 16 },
  previewVisual: { minHeight: 168, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewImageLabel: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  previewIcon: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  previewIconText: { fontSize: 17, fontWeight: '900' },
  previewTitle: { marginTop: 16, lineHeight: 27 },
  previewSubtitle: { marginTop: 7, lineHeight: 22, fontWeight: '800' },
  previewDescription: { marginTop: 8, lineHeight: 20, fontWeight: '700' },
  previewFeatures: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  previewFeature: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', fontSize: 10, fontWeight: '900' },
  previewButton: { marginTop: 16, minHeight: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  previewButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inputWrap: { flexGrow: 1, flexBasis: 220, marginTop: 8 },
  inputLabel: { marginBottom: 7, color: '#AAB0C0', fontSize: 12, fontWeight: '900' },
  input: { minHeight: 44, paddingHorizontal: 12, borderRadius: 13, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', fontWeight: '800' },
  toggleGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toggleRow: { flexGrow: 1, flexBasis: 240, minHeight: 48, paddingHorizontal: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)' },
  toggleLabel: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  toggle: { width: 46, height: 26, borderRadius: 13, padding: 3, backgroundColor: 'rgba(255,255,255,0.14)' },
  toggleOn: { backgroundColor: '#5538FF' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  toggleKnobOn: { transform: [{ translateX: 20 }] },
  actionRow: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  actionButton: { minHeight: 44, paddingHorizontal: 16, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5538FF' },
  secondaryButton: { backgroundColor: 'rgba(255,255,255,0.1)' },
  dangerButton: { backgroundColor: '#FF5D7A' },
  actionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  tinyButton: { minHeight: 32, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21,123,255,0.18)', borderWidth: 1, borderColor: 'rgba(142,167,255,0.3)' },
  tinyButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(21,123,255,0.16)', borderWidth: 1, borderColor: 'rgba(142,167,255,0.26)' },
  badgeGreen: { backgroundColor: 'rgba(65,230,164,0.12)', borderColor: 'rgba(65,230,164,0.28)' },
  badgeGold: { backgroundColor: 'rgba(249,215,126,0.14)', borderColor: 'rgba(249,215,126,0.28)' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  table: { minWidth: 860 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tableCell: { width: 140, minHeight: 48, justifyContent: 'center', padding: 10 },
  tableHead: { color: '#8EA7FF', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  tableText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  rowActionWrap: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryTile: { flexGrow: 1, flexBasis: 220, minHeight: 166, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  tileIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tileIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  tileTitle: { marginTop: 12, color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  tileMeta: { marginTop: 6, color: '#AAB0C0', fontSize: 12, fontWeight: '700' },
  twoColumn: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tabs: { gap: 8, paddingBottom: 12 },
  tab: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' },
  tabActive: { backgroundColor: '#5538FF' },
  tabText: { color: '#AAB0C0', fontSize: 12, fontWeight: '900' },
  tabTextActive: { color: '#FFFFFF' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  verifyCard: { flexGrow: 1, flexBasis: 320, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  cardMeta: { marginTop: 6, color: '#AAB0C0', fontSize: 12, fontWeight: '700' },
  docGrid: { marginTop: 12, flexDirection: 'row', gap: 8 },
  docBox: { flex: 1, minHeight: 78, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21,123,255,0.12)' },
  docText: { color: '#FFFFFF', fontSize: 10, lineHeight: 14, textAlign: 'center', fontWeight: '900' },
  bodyText: { marginTop: 8, color: '#AAB0C0', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  toast: { position: 'absolute', right: 22, bottom: 22, minHeight: 48, paddingHorizontal: 16, borderRadius: 14, justifyContent: 'center', backgroundColor: '#5538FF', shadowColor: '#7C3AED', shadowOpacity: 0.4, shadowRadius: 16 },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  modalOverlay: { flex: 1, padding: 18, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.62)' },
  modalCard: { width: '100%', maxWidth: 920, maxHeight: '92%', alignSelf: 'center', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  closeText: { color: '#8EA7FF', fontSize: 13, fontWeight: '900' },
});
