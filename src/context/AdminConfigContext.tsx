import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultTranslations } from '../i18n/defaultTranslations';
import { UserRole } from '../types/navigation';
import { storage, subscribeStorage } from '../utils/storage';

type Status = 'active' | 'pending' | 'blocked' | 'completed' | 'failed';
type SectionKey = keyof AdminConfigState;

export type AdminLog = {
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
  createdAt: string;
};

export type CategoryRecord = {
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

export type CountryRecord = {
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

export type RegionRecord = {
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

export type CityRecord = {
  id: string;
  regionId: string;
  name_ru: string;
  name_en: string;
  name_hy: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
};

export type TranslationRecord = {
  id: string;
  key: string;
  module: string;
  screen?: string;
  description?: string;
  ru: string;
  en: string;
  hy: string;
  values?: Record<string, string>;
  status: 'complete' | 'missing' | 'partial' | 'outdated';
  updatedAt: string;
};

export type LanguageRecord = {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  isDefault: boolean;
};

export type AdminUser = {
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

export type OrderRecord = {
  id: string;
  client: string;
  master: string;
  city: string;
  status: 'pending' | 'accepted' | 'master_on_way' | 'in_progress' | 'completed' | 'cancelled' | 'refunded' | 'disputed';
  amount: number;
  secureDeal: 'unpaid' | 'reserved' | 'paid' | 'refunded' | 'failed';
};

export type TelegramChannelConfig = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  botToken: string;
  chatId: string;
  notificationTitle: string;
  messageTemplate: string;
  lastSentAt?: string;
  lastStatus?: string;
};

export type TelegramSettings = {
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

export type AppSettings = {
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

export type MarketingBanner = {
  id: string;
  title_ru: string;
  title_en: string;
  title_hy: string;
  image: string;
  link: string;
  target: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type SupportTicket = {
  id: string;
  type: string;
  assigned: string;
  status: 'open' | 'in progress' | 'review' | 'closed';
  orderId: string;
  message: string;
};

export type FinanceSettings = {
  commissionPercent: string;
  payoutPercent: string;
  refundReserve: string;
  defaultMethod: string;
  isActive: boolean;
};

export type RegistrationFieldType = 'text' | 'email' | 'phone' | 'password' | 'select' | 'checkbox' | 'number' | 'upload';

export type RegistrationFieldConfig = {
  id: string;
  role: UserRole;
  label: string;
  placeholder: string;
  type: RegistrationFieldType;
  required: boolean;
  sortOrder: number;
  options?: string[];
};

export type RegistrationFieldsState = Record<UserRole, RegistrationFieldConfig[]>;

export type AdminConfigState = {
  languages: LanguageRecord[];
  categories: CategoryRecord[];
  countries: CountryRecord[];
  regions: RegionRecord[];
  cities: CityRecord[];
  translations: TranslationRecord[];
  users: AdminUser[];
  orders: OrderRecord[];
  financeSettings: FinanceSettings;
  marketingBanners: MarketingBanner[];
  supportTickets: SupportTicket[];
  registrationFields: RegistrationFieldsState;
  telegram: TelegramSettings;
  appSettings: AppSettings;
  logs: AdminLog[];
};

type AdminConfigContextValue = {
  state: AdminConfigState;
  loading: boolean;
  updateSection: (section: SectionKey, next: AdminConfigState[SectionKey]) => void;
  saveSection: (section: SectionKey, moduleName?: string, action?: string) => Promise<void>;
  resetSection: (section: SectionKey, moduleName?: string) => Promise<void>;
  addLog: (action: string, moduleName: string, details: string, oldValue?: unknown, newValue?: unknown) => Promise<void>;
  t: (key: string, fallback: string, lang?: 'ru' | 'en' | 'hy') => string;
};

const STORAGE_KEY = 'fixora.adminConfig.v1';
const nowStamp = () => new Date().toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;

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

export const defaultLanguages: LanguageRecord[] = [
  { id: 'lang-ru', name: 'Russian', nativeName: 'Русский', code: 'ru', flag: '🇷🇺', direction: 'ltr', isActive: true, isDefault: false },
  { id: 'lang-en', name: 'English', nativeName: 'English', code: 'en', flag: '🇺🇸', direction: 'ltr', isActive: true, isDefault: true },
  { id: 'lang-hy', name: 'Armenian', nativeName: 'Հայերեն', code: 'hy', flag: '🇦🇲', direction: 'ltr', isActive: true, isDefault: false },
];

export const defaultRegistrationFields: RegistrationFieldsState = {
  client: [
    { id: 'client-address', role: 'client', label: 'Address', placeholder: 'Street, building, apartment', type: 'text', required: false, sortOrder: 1 },
    { id: 'client-city', role: 'client', label: 'City', placeholder: 'Your city', type: 'text', required: true, sortOrder: 2 },
    { id: 'client-notes', role: 'client', label: 'Service interests', placeholder: 'Cleaning, repair, delivery...', type: 'text', required: false, sortOrder: 3 },
  ],
  master: [
    { id: 'master-profession', role: 'master', label: 'Profession', placeholder: 'Electrician, cleaner, designer...', type: 'text', required: true, sortOrder: 1 },
    { id: 'master-experience', role: 'master', label: 'Experience years', placeholder: '5', type: 'number', required: true, sortOrder: 2 },
    { id: 'master-category', role: 'master', label: 'Main category', placeholder: 'Select category', type: 'select', required: true, sortOrder: 3, options: ['Repair', 'Cleaning', 'Auto', 'Beauty', 'IT'] },
  ],
  company: [
    { id: 'company-name', role: 'company', label: 'Company name', placeholder: 'Fixora Services LLC', type: 'text', required: true, sortOrder: 1 },
    { id: 'company-tax', role: 'company', label: 'Registration number', placeholder: 'Company registration ID', type: 'text', required: true, sortOrder: 2 },
    { id: 'company-size', role: 'company', label: 'Team size', placeholder: '12', type: 'number', required: false, sortOrder: 3 },
  ],
  admin: [],
  super_admin: [],
};

export const defaultTelegramChannels: TelegramChannelConfig[] = [
  {
    id: 'code-change-logs',
    name: 'Code / Site Change Logs',
    description: 'Who changed what, module, old/new values, timestamp, and status.',
    enabled: true,
    botToken: '',
    chatId: '',
    notificationTitle: 'Fixora code/site change',
    messageTemplate: 'Admin: {{adminName}}\nModule: {{module}}\nAction: {{action}}\nOld: {{oldValue}}\nNew: {{newValue}}\nDate: {{createdAt}}\nStatus: {{status}}',
  },
  {
    id: 'client-order-created',
    name: 'Client Order Logs',
    description: 'Order creation details, client contacts, category, address, budget, datetime, and photo placeholder.',
    enabled: true,
    botToken: '',
    chatId: '',
    notificationTitle: 'Client order created',
    messageTemplate: 'Order: {{orderId}}\nClient: {{clientName}}\nPhone: {{clientPhone}}\nEmail: {{clientEmail}}\nCategory: {{category}}\nDescription: {{description}}\nAddress: {{address}}\nLocation: {{country}} / {{region}} / {{city}}\nBudget: {{budget}}\nPhoto: {{photo}}\nCreated: {{createdAt}}',
  },
  {
    id: 'master-accepted-order',
    name: 'Master Accepted Order Logs',
    description: 'Accepted order, master contacts, profession, order sum, commission, payout, city, and datetime.',
    enabled: true,
    botToken: '',
    chatId: '',
    notificationTitle: 'Master accepted order',
    messageTemplate: 'Order: {{orderId}}\nAccepted: {{orderTitle}}\nMaster: {{masterName}}\nPhone: {{masterPhone}}\nEmail: {{masterEmail}}\nProfession: {{profession}}\nAmount: {{amount}}\nCommission: {{platformCommission}}\nMaster payout: {{masterPayout}}\nCity: {{city}}\nDate: {{createdAt}}',
  },
  {
    id: 'finance-logs',
    name: 'Finance / Balance Logs',
    description: 'Transaction, user, amount, currency, method, before/after balances, status, and datetime.',
    enabled: true,
    botToken: '',
    chatId: '',
    notificationTitle: 'Finance balance event',
    messageTemplate: 'Transaction: {{transactionId}}\nUser: {{userName}} / {{userRole}}\nPhone: {{phone}}\nEmail: {{email}}\nAmount: {{amount}} {{currency}}\nMethod: {{paymentMethod}}\nBalance: {{balanceBefore}} -> {{balanceAfter}}\nStatus: {{status}}\nDate: {{createdAt}}',
  },
  {
    id: 'support-logs',
    name: 'Support / Complaint Logs',
    description: 'Ticket, user, role, contacts, complaint type, message, priority, city, and created date.',
    enabled: true,
    botToken: '',
    chatId: '',
    notificationTitle: 'Support complaint event',
    messageTemplate: 'Ticket: {{ticketId}}\nUser: {{userName}} / {{userRole}}\nContact: {{phone}} / {{email}}\nType: {{complaintType}}\nMessage: {{message}}\nPriority: {{priority}}\nCity: {{city}}\nCreated: {{createdAt}}',
  },
  {
    id: 'verification-logs',
    name: 'Master Verification Logs',
    description: 'Master verification documents, status, admin action, and rejection reason if rejected.',
    enabled: true,
    botToken: '',
    chatId: '',
    notificationTitle: 'Master verification event',
    messageTemplate: 'Master: {{masterName}}\nProfession: {{profession}}\nPhone: {{phone}}\nEmail: {{email}}\nDocuments: {{documentsUploaded}}\nStatus: {{verificationStatus}}\nAdmin action: {{adminAction}}\nRejection reason: {{rejectionReason}}',
  },
];

export const defaultAdminConfig: AdminConfigState = {
  languages: defaultLanguages,
  categories: categorySeeds.map((name, index) => ({
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
  })),
  countries: [
    { id: 'country-am', name_ru: 'Armenia', name_en: 'Armenia', name_hy: 'Armenia', iso2: 'AM', iso3: 'ARM', emoji: 'AM', flagImage: 'flag-placeholder-am.png', countryPhoto: 'country-photo-am.png', currency: 'AMD', language: 'hy', capital_ru: 'Yerevan', capital_en: 'Yerevan', isActive: true, marketplaceEnabled: true },
    { id: 'country-us', name_ru: 'United States', name_en: 'United States', name_hy: 'United States', iso2: 'US', iso3: 'USA', emoji: 'US', flagImage: 'flag-placeholder-us.png', countryPhoto: 'country-photo-us.png', currency: 'USD', language: 'en', capital_ru: 'Washington', capital_en: 'Washington', isActive: true, marketplaceEnabled: false },
  ],
  regions: [
    { id: 'region-yerevan', countryIso2: 'AM', name_ru: 'Yerevan', name_en: 'Yerevan', name_hy: 'Yerevan', type_ru: 'city', type_en: 'city', capital_ru: 'Yerevan', capital_en: 'Yerevan', isActive: true },
    { id: 'region-california', countryIso2: 'US', name_ru: 'California', name_en: 'California', name_hy: 'California', type_ru: 'state', type_en: 'state', capital_ru: 'Sacramento', capital_en: 'Sacramento', isActive: true },
  ],
  cities: [
    { id: 'city-yerevan', regionId: 'region-yerevan', name_ru: 'Yerevan', name_en: 'Yerevan', name_hy: 'Yerevan', isActive: true, latitude: '40.1792', longitude: '44.4991' },
    { id: 'city-la', regionId: 'region-california', name_ru: 'Los Angeles', name_en: 'Los Angeles', name_hy: 'Los Angeles', isActive: true, latitude: '34.0522', longitude: '-118.2437' },
  ],
  translations: defaultTranslations.map((translation, index) => ({ id: `tr-${index + 1}`, values: { ru: translation.ru, en: translation.en, hy: translation.hy }, ...translation })),
  users: [
    { id: 'u-1', name: 'Mariam K.', role: 'Client', city: 'Yerevan', status: 'active', verification: 'verified', rating: 5, completedOrders: 12, categories: 'Cleaning', premium: false },
    { id: 'u-2', name: 'Arman Master', role: 'Master', city: 'Yerevan', status: 'pending', verification: 'pending', rating: 4.9, completedOrders: 128, categories: 'Repair, IT', premium: true },
    { id: 'u-3', name: 'Fixora Admin', role: 'Admin', city: 'Remote', status: 'active', verification: 'verified', rating: 0, completedOrders: 0, categories: 'Operations', premium: false },
    { id: 'u-4', name: 'CleanPro LLC', role: 'Company', city: 'Gyumri', status: 'active', verification: 'verified', rating: 4.7, completedOrders: 80, categories: 'Cleaning', premium: true },
  ],
  orders: [
    { id: 'ord-1001', client: 'Mariam K.', master: 'Arman Master', city: 'Yerevan', status: 'pending', amount: 8000, secureDeal: 'reserved' },
    { id: 'ord-1002', client: 'Artem S.', master: 'Fixora Master', city: 'Yerevan', status: 'completed', amount: 25000, secureDeal: 'paid' },
    { id: 'ord-1003', client: 'Georg M.', master: 'CleanPro LLC', city: 'Gyumri', status: 'disputed', amount: 14000, secureDeal: 'reserved' },
  ],
  financeSettings: { commissionPercent: '12', payoutPercent: '88', refundReserve: '12000', defaultMethod: 'Bank/Card/Idram', isActive: true },
  marketingBanners: [
    { id: 'ban-1', title_ru: 'Homepage VIP banner', title_en: 'Homepage VIP banner', title_hy: 'Homepage VIP banner', image: '', link: '', target: 'AM / Yerevan / Kentron', startDate: 'Jun 01', endDate: 'Jun 30', isActive: true },
    { id: 'ban-2', title_ru: 'Featured masters push', title_en: 'Featured masters push', title_hy: 'Featured masters push', image: '', link: '', target: 'All countries', startDate: 'Always', endDate: 'on', isActive: false },
  ],
  supportTickets: [
    { id: 'SUP-1001', type: 'Complaint', assigned: 'Operator A', status: 'open', orderId: 'ord-1003', message: 'Customer reported a dispute.' },
    { id: 'SUP-1002', type: 'User message', assigned: 'Operator B', status: 'in progress', orderId: '-', message: 'General support request.' },
    { id: 'SUP-1003', type: 'Order dispute', assigned: 'Operator A', status: 'review', orderId: 'ord-1003', message: 'Secure deal review.' },
  ],
  registrationFields: defaultRegistrationFields,
  telegram: {
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
  },
  appSettings: {
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
  },
  logs: [
    { id: 'log-1', adminName: 'Super Admin', action: 'admin login', module: 'Auth', dateTime: 'Today 09:20', ip: '127.0.0.1', status: 'completed', details: 'Super Admin signed into the admin panel.', createdAt: new Date().toISOString() },
  ],
};

const AdminConfigContext = createContext<AdminConfigContextValue | null>(null);

function mergeState(stored: Partial<AdminConfigState> | null): AdminConfigState {
  const storedTranslations = stored?.translations ?? [];
  const mergedTranslations = defaultAdminConfig.translations.map((defaultItem) => {
    const storedItem = storedTranslations.find((item) => item.key === defaultItem.key);
    const storedWasAutoMissing =
      storedItem?.status === 'missing' ||
      storedItem?.id?.startsWith('tr-missing-') ||
      storedItem?.description === 'Auto-created by TranslationProvider missing-key tracking.';

    if (!storedItem || storedWasAutoMissing) {
      return defaultItem;
    }

    const merged = { ...defaultItem, ...storedItem };
    return { ...merged, values: { ...defaultItem.values, ru: merged.ru, en: merged.en, hy: merged.hy, ...storedItem.values } };
  });
  const customTranslations = storedTranslations.filter((item) => !mergedTranslations.some((existing) => existing.key === item.key));
  const storedTelegram = stored?.telegram as Partial<TelegramSettings> | undefined;
  const storedChannels = storedTelegram?.channels ?? [];
  const mergedTelegramChannels = defaultTelegramChannels.map((defaultChannel) => ({
    ...defaultChannel,
    ...storedChannels.find((channel) => channel.id === defaultChannel.id),
  }));
  const customTelegramChannels = storedChannels.filter((channel) => !mergedTelegramChannels.some((existing) => existing.id === channel.id));

  return {
    ...defaultAdminConfig,
    ...stored,
    languages: stored?.languages?.length ? stored.languages : defaultLanguages,
    translations: [...mergedTranslations, ...customTranslations],
    financeSettings: { ...defaultAdminConfig.financeSettings, ...stored?.financeSettings },
    registrationFields: {
      client: stored?.registrationFields?.client ?? defaultRegistrationFields.client,
      master: stored?.registrationFields?.master ?? defaultRegistrationFields.master,
      company: stored?.registrationFields?.company ?? defaultRegistrationFields.company,
      admin: stored?.registrationFields?.admin ?? defaultRegistrationFields.admin,
      super_admin: stored?.registrationFields?.super_admin ?? defaultRegistrationFields.super_admin,
    },
    telegram: { ...defaultAdminConfig.telegram, ...storedTelegram, channels: [...mergedTelegramChannels, ...customTelegramChannels] },
    appSettings: { ...defaultAdminConfig.appSettings, ...stored?.appSettings },
  };
}

function createLog(action: string, moduleName: string, details: string, oldValue?: unknown, newValue?: unknown): AdminLog {
  return {
    id: uid('log'),
    adminName: 'Super Admin',
    action,
    module: moduleName,
    dateTime: nowStamp(),
    ip: '127.0.0.1',
    status: 'completed',
    details,
    oldValue,
    newValue,
    createdAt: new Date().toISOString(),
  };
}

export function AdminConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminConfigState>(defaultAdminConfig);
  const stateRef = useRef(defaultAdminConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    storage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted || !stored) {
          return;
        }

        const next = mergeState(JSON.parse(stored) as Partial<AdminConfigState>);
        stateRef.current = next;
        setState(next);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const unsubscribe = subscribeStorage(STORAGE_KEY, (value) => {
      if (!mounted || !value) {
        return;
      }

      try {
        const next = mergeState(JSON.parse(value) as Partial<AdminConfigState>);
        stateRef.current = next;
        setState(next);
      } catch {
        // ignore broken local storage values
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const commit = useCallback((next: AdminConfigState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const persist = useCallback(async (next: AdminConfigState) => {
    commit(next);
    await storage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [commit]);

  const updateSection = useCallback((section: SectionKey, nextSection: AdminConfigState[SectionKey]) => {
    commit({ ...stateRef.current, [section]: nextSection });
  }, [commit]);

  const addLog = useCallback(async (action: string, moduleName: string, details: string, oldValue?: unknown, newValue?: unknown) => {
    const next = {
      ...stateRef.current,
      logs: [createLog(action, moduleName, details, oldValue, newValue), ...stateRef.current.logs],
    };
    await persist(next);
  }, [persist]);

  const saveSection = useCallback(async (section: SectionKey, moduleName: string = section, action = 'saved section') => {
    const current = stateRef.current;
    const next = {
      ...current,
      logs: [createLog(action, moduleName, 'Saved successfully', undefined, current[section]), ...current.logs],
    };
    await persist(next);
  }, [persist]);

  const resetSection = useCallback(async (section: SectionKey, moduleName: string = section) => {
    const current = stateRef.current;
    const next = {
      ...current,
      [section]: defaultAdminConfig[section],
      logs: [createLog('reset section', moduleName, 'Reset to default data', current[section], defaultAdminConfig[section]), ...current.logs],
    };
    await persist(next);
  }, [persist]);

  const t = useCallback((key: string, fallback: string, lang: 'ru' | 'en' | 'hy' = 'en') => {
    const row = stateRef.current.translations.find((item) => item.key === key);
    return row?.[lang] || row?.en || fallback;
  }, []);

  const value = useMemo<AdminConfigContextValue>(() => ({
    state,
    loading,
    updateSection,
    saveSection,
    resetSection,
    addLog,
    t,
  }), [addLog, loading, resetSection, saveSection, state, t, updateSection]);

  return <AdminConfigContext.Provider value={value}>{children}</AdminConfigContext.Provider>;
}

export function useAdminConfig() {
  const value = useContext(AdminConfigContext);
  if (!value) {
    throw new Error('useAdminConfig must be used inside AdminConfigProvider');
  }
  return value;
}
