import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FixoraLogo } from '../components/FixoraLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  AdminConfigState,
  CategoryRecord,
  defaultRegistrationFields,
  RegistrationFieldConfig,
  RegistrationFieldType,
  RegistrationFieldsState,
  useAdminConfig,
} from '../context/AdminConfigContext';
import { useTranslation } from '../i18n/I18nProvider';
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
  | 'registration'
  | 'telegram'
  | 'logs'
  | 'settings';

type StatusTone = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'red' | 'slate';

const moduleGroups: Array<{ group: string; items: Array<{ id: AdminModule; label: string; icon: string }> }> = [
  { group: 'CORE', items: [{ id: 'dashboard', label: 'Дашборд', icon: '⌂' }] },
  {
    group: 'MARKETPLACE',
    items: [
      { id: 'categories', label: 'Категории', icon: '▦' },
      { id: 'locations', label: 'Локации', icon: '⌾' },
    ],
  },
  {
    group: 'PLATFORM',
    items: [
      { id: 'translations', label: 'Переводы', icon: 'AЖ' },
      { id: 'users', label: 'Пользователи', icon: '☷' },
    ],
  },
  {
    group: 'OPERATIONS',
    items: [
      { id: 'verification', label: 'Верификация', icon: '✓' },
      { id: 'orders', label: 'Заказы', icon: '▤' },
      { id: 'finance', label: 'Финансы', icon: '$' },
    ],
  },
  {
    group: 'GROWTH',
    items: [
      { id: 'marketing', label: 'Маркетинг', icon: '⌁' },
      { id: 'support', label: 'Поддержка', icon: '◎' },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { id: 'registration', label: 'Registration Management', icon: '◉' },
      { id: 'telegram', label: 'Telegram', icon: '➤' },
      { id: 'logs', label: 'Логи', icon: '▣' },
      { id: 'settings', label: 'Настройки', icon: '⚙' },
    ],
  },
];

const moduleMeta: Record<AdminModule, { title: string; subtitle: string; search: string; action: string }> = {
  dashboard: { title: 'Добро пожаловать, Super Admin! 👋', subtitle: 'Вот что происходит в Fixora сегодня.', search: 'Поиск по админ-данным...', action: '+ Quick Action' },
  categories: { title: 'Категории', subtitle: 'Управляйте всеми категориями и их настройками', search: 'Поиск по категориям...', action: '+ Добавить категорию' },
  locations: { title: 'Локации', subtitle: 'Управляйте странами, регионами и городами для геосистемы платформы', search: 'Поиск по локациям...', action: '+ Добавить страну' },
  translations: { title: 'Переводы', subtitle: 'Управляйте переводами для всех языков платформы Fixora', search: 'Поиск по переводам...', action: '+ Добавить перевод' },
  users: { title: 'Пользователи', subtitle: 'Управляйте пользователями, ролями, доступами и активностью в системе', search: 'Поиск по имени, email, телефону, ID...', action: '+ Добавить пользователя' },
  verification: { title: 'Верификация', subtitle: 'Управляйте верификациями мастеров, бейджами и статусами доверия', search: 'Поиск по имени, email, телефону, ID...', action: '+ Быстрое действие' },
  orders: { title: 'Заказы', subtitle: 'Управляйте всеми заказами платформы: отслеживание, статус, диспетчеризация и финансы', search: 'Поиск по заказам, клиентам, ID...', action: '+ Быстрое действие' },
  finance: { title: 'Финансы', subtitle: 'Обзор финансовых показателей, комиссий и выплат платформы', search: 'Поиск по заказам, пользователям, транзакциям...', action: '+ Быстрое действие' },
  marketing: { title: 'Маркетинг', subtitle: 'Управляйте маркетинговыми кампаниями, рекламными материалами и гео-таргетингом', search: 'Поиск по кампаниям, кодам, мастерам...', action: '+ Quick Action' },
  support: { title: 'Поддержка', subtitle: 'Управляйте обращениями, жалобами, спорами и приоритетными запросами пользователей', search: 'Поиск по тикетам, пользователям, заказам...', action: '+ Быстрое действие' },
  registration: { title: 'Registration Management', subtitle: 'Design and manage client & master registration forms, fields, and settings.', search: 'Поиск по админ-данным...', action: '+ Add Field' },
  telegram: { title: 'Telegram Notification Center', subtitle: 'Configure Telegram bot, channels, templates and notifications for all platform events.', search: 'Поиск по событиям, шаблонам...', action: '+ Быстрое действие' },
  logs: { title: 'Логи', subtitle: 'Просматривайте и анализируйте действия в системе, изменения модулей, старые и новые значения.', search: 'Поиск по логам, ID, модулю или действию...', action: '+ Быстрое действие' },
  settings: { title: 'Настройки', subtitle: 'Welcome back. Control app runtime behavior, payments, Telegram, maps, AI recommendations, and more.', search: 'Поиск по настройкам...', action: '+ Быстрое действие' },
};

const sectionKeyByModule: Partial<Record<AdminModule, keyof AdminConfigState>> = {
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

const spark = [18, 32, 24, 36, 28, 42, 34, 54];
const autoKey = (scope: string, text: string) => `${scope}.${text.toLowerCase().replace(/[^a-z0-9]+/gi, '.').replace(/^\.+|\.+$/g, '').slice(0, 70) || 'text'}`;
const dateRange = '23 мая 2025 - 30 мая 2025';

export default function AdminScreen({ onExit }: { onExit: () => void }) {
  const admin = useAdminConfig();
  const { t } = useTranslation();
  const { state } = admin;
  const [active, setActive] = useState<AdminModule>('dashboard');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('client');
  const [collapsed, setCollapsed] = useState(false);

  const meta = {
    title: t(`admin.${active}.title`, moduleMeta[active].title),
    subtitle: t(`admin.${active}.subtitle`, moduleMeta[active].subtitle),
    search: t(`admin.${active}.search`, moduleMeta[active].search),
    action: t(`admin.${active}.action`, moduleMeta[active].action),
  };

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const saveActive = async () => {
    const section = sectionKeyByModule[active];
    if (section) {
      await admin.saveSection(section, meta.title, 'saved admin section');
      notify('Saved successfully');
    }
  };

  const resetActive = async () => {
    const section = sectionKeyByModule[active];
    if (section) {
      await admin.resetSection(section, meta.title);
      notify('Reset successfully');
    }
  };

  const setSection = <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => {
    admin.updateSection(section, value);
  };

  const addCategory = () => {
    const next: CategoryRecord = {
      id: `cat-${Date.now()}`,
      name_ru: 'Новая категория',
      name_en: 'New Category',
      name_hy: 'New Category',
      slug: `new-category-${Date.now()}`,
      icon: 'NC',
      color: '#6D5DFB',
      isActive: true,
      sortOrder: state.categories.length + 1,
      parentCategoryId: '',
      availableCountries: ['AM'],
      availableRegions: ['Yerevan'],
      availableCities: ['Yerevan'],
    };
    setSection('categories', [next, ...state.categories]);
    admin.addLog('created category', 'Categories', 'Added a new category', undefined, next).catch(() => undefined);
    notify('Category added');
  };

  const addRegistrationField = () => {
    const field: RegistrationFieldConfig = {
      id: `${regRole}-${Date.now()}`,
      role: regRole,
      label: 'New Field',
      placeholder: 'Enter value',
      type: 'text',
      required: false,
      sortOrder: state.registrationFields[regRole].length + 1,
    };
    setSection('registrationFields', {
      ...state.registrationFields,
      [regRole]: [...state.registrationFields[regRole], field],
    });
    notify('Field added');
  };

  const renderContent = () => {
    switch (active) {
      case 'dashboard':
        return <DashboardSection state={state} />;
      case 'categories':
        return <CategoriesSection state={state} setSection={setSection} addCategory={addCategory} />;
      case 'locations':
        return <LocationsSection state={state} setSection={setSection} />;
      case 'translations':
        return <TranslationsSection state={state} />;
      case 'users':
        return <UsersSection state={state} />;
      case 'verification':
        return <VerificationSection state={state} />;
      case 'orders':
        return <OrdersSection state={state} />;
      case 'finance':
        return <FinanceSection state={state} setSection={setSection} />;
      case 'marketing':
        return <MarketingSection state={state} setSection={setSection} />;
      case 'support':
        return <SupportSection state={state} />;
      case 'registration':
        return <RegistrationSection state={state} regRole={regRole} setRegRole={setRegRole} setSection={setSection} addField={addRegistrationField} save={saveActive} />;
      case 'telegram':
        return <TelegramSection state={state} setSection={setSection} save={saveActive} />;
      case 'logs':
        return <LogsSection state={state} />;
      case 'settings':
        return <SettingsSection state={state} setSection={setSection} save={saveActive} />;
      default:
        return null;
    }
  };

  const runQuickAction = () => {
    if (active === 'categories') {
      addCategory();
      return;
    }
    if (active === 'registration') {
      addRegistrationField();
      return;
    }
    notify('Quick action ready');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.shell}>
        <AdminSidebar active={active} collapsed={collapsed} setCollapsed={setCollapsed} onChange={setActive} onExit={onExit} />
        <View style={styles.workspace}>
          <AdminTopbar meta={meta} query={query} setQuery={setQuery} onQuickAction={runQuickAction} onReset={resetActive} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {renderContent()}
            <Text style={styles.footer}>© 2025 Fixora Pro Admin Panel. Все права защищены.</Text>
          </ScrollView>
        </View>
      </View>
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function AdminSidebar({ active, collapsed, setCollapsed, onChange, onExit }: {
  active: AdminModule;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  onChange: (module: AdminModule) => void;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <View style={styles.brandRow}>
        <FixoraLogo size={collapsed ? 42 : 56} wordmark={!collapsed} />
        <Pressable accessibilityRole="button" onPress={() => setCollapsed(!collapsed)} style={styles.collapseButton}>
          <Text style={styles.collapseText}>{collapsed ? '›' : '‹'}</Text>
        </Pressable>
      </View>
      {!collapsed ? <Text style={styles.superLabel}>{t('admin.sidebar.superAdmin', 'Super Admin')}</Text> : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
        {moduleGroups.map((group) => (
          <View key={group.group} style={styles.navGroup}>
            {!collapsed ? <Text style={styles.navGroupTitle}>{t(`admin.nav.group.${group.group.toLowerCase()}`, group.group)}</Text> : null}
            {group.items.map((item) => {
              const selected = active === item.id;
              return (
                <Pressable key={item.id} accessibilityRole="button" onPress={() => onChange(item.id)} style={[styles.navItem, selected && styles.navItemActive]}>
                  <View style={[styles.navIcon, selected && styles.navIconActive]}>
                    <Text style={[styles.navIconText, selected && styles.navIconTextActive]}>{item.icon}</Text>
                  </View>
                  {!collapsed ? <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{t(`admin.nav.${item.id}`, item.label)}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.adminCard}>
        <View style={styles.adminAvatar}><Text style={styles.adminAvatarText}>SA</Text></View>
        {!collapsed ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>{t('admin.sidebar.superAdmin', 'Super Admin')}</Text>
            <Text style={styles.adminEmail}>admin@fixora.pro</Text>
            <Text style={styles.online}>{t('admin.sidebar.online', '● Online')}</Text>
          </View>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" onPress={onExit} style={styles.exitButton}>
        <Text style={styles.exitText}>{collapsed ? '↩' : t('admin.sidebar.exit', 'Exit admin')}</Text>
      </Pressable>
    </View>
  );
}

function AdminTopbar({ meta, query, setQuery, onQuickAction, onReset }: {
  meta: { title: string; subtitle: string; search: string; action: string };
  query: string;
  setQuery: (value: string) => void;
  onQuickAction: () => void;
  onReset: () => void;
}) {
  return (
    <View style={styles.topbar}>
      <View style={styles.titleBlock}>
        <Text style={styles.crumb}>Production foundation / Supabase-ready mock</Text>
        <Text style={styles.pageTitle}>{meta.title}</Text>
        <Text style={styles.pageSubtitle}>{meta.subtitle}</Text>
      </View>
      <View style={styles.topActions}>
        <View style={styles.globalSearch}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput value={query} onChangeText={setQuery} placeholder={meta.search} placeholderTextColor="#8A94AA" style={styles.globalSearchInput} />
          <Text style={styles.shortcut}>Ctrl + K</Text>
        </View>
        <Badge label="● Live" tone="green" />
        <LanguageSwitcher compact />
        <IconButton label="♢" badge="8" />
        <IconButton label="◐" />
        <AdminButton title={meta.action} onPress={onQuickAction} />
        <Pressable accessibilityRole="button" style={styles.dateButton}>
          <Text style={styles.dateText}>▣  {dateRange}  ⌄</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onReset} style={styles.resetButton}>
          <Text style={styles.resetText}>RESET</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DashboardSection({ state }: { state: AdminConfigState }) {
  const revenue = state.orders.reduce((sum, item) => sum + item.amount, 0);
  return (
    <View style={styles.stack}>
      <View style={styles.kpiRow}>
        <StatCard title="Общий доход" value={`${revenue.toLocaleString()} AMD`} icon="$" tone="purple" change="+12.5%" />
        <StatCard title="Всего заказов" value="3 128" icon="▣" tone="blue" change="+8.3%" />
        <StatCard title="Пользователи" value="2 894" icon="☷" tone="green" change="+15.2%" />
        <StatCard title="Активные мастера" value="1 256" icon="♙" tone="orange" change="+7.1%" />
        <StatCard title="Конверсия" value="8.24%" icon="◎" tone="pink" change="+3.6%" />
      </View>
      <View style={styles.dashboardGrid}>
        <Panel title="Обзор доходов" action="7 дней⌄" style={styles.chartWide}>
          <LineChart color="#6D5DFB" height={214} />
        </Panel>
        <Panel title="Обзор заказов" action="7 дней⌄" style={styles.chartMid}>
          <DonutChart value="3 128" label="Всего заказов" />
          <Legend items={[['Новые', '1256', 'blue'], ['В работе', '842', 'purple'], ['Завершённые', '730', 'green'], ['Отменённые', '210', 'orange'], ['Ожидание', '90', 'slate']]} />
        </Panel>
        <Panel title="Активность в реальном времени" action="Смотреть все" style={styles.chartSide}>
          <ActivityList />
        </Panel>
      </View>
      <View style={styles.bottomGrid}>
        <Panel title="Последние регистрации" action="Смотреть все">
          <CompactPeople rows={['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'David Brown']} />
        </Panel>
        <Panel title="Ожидают верификации" action="Смотреть все">
          <CompactPeople rows={['Alex Thompson', 'Lisa Anderson', 'Robert Garcia', 'Maria Rodriguez']} />
        </Panel>
        <Panel title="Топ категории" action="Смотреть все">
          <ProgressRows rows={[['Строительство и ремонт', 96], ['Уборка и клининг', 74], ['Электрика', 62], ['Сантехника', 58], ['Ремонт техники', 42]]} />
        </Panel>
        <Panel title="Быстрые действия">
          <QuickActions />
        </Panel>
      </View>
    </View>
  );
}

function CategoriesSection({ state, setSection, addCategory }: {
  state: AdminConfigState;
  setSection: <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => void;
  addCategory: () => void;
}) {
  const rows = state.categories.slice(0, 8);
  return (
    <View style={styles.stack}>
      <Panel title="Управление категориями" description="Создавайте, редактируйте и управляйте категориями на платформе" actionNode={<AdminButton title="+ Добавить категорию" onPress={addCategory} />}>
        <FilterBar fields={['Поиск категорий...', 'Статус: Все', 'Регион: Все регионы']} />
        <View style={styles.kpiRowSmall}>
          <StatCard title="Всего категорий" value={String(state.categories.length)} icon="▣" tone="blue" compact />
          <StatCard title="Активных категорий" value={String(state.categories.filter((item) => item.isActive).length)} icon="✓" tone="green" compact />
          <StatCard title="Неактивных категорий" value={String(state.categories.filter((item) => !item.isActive).length)} icon="+" tone="red" compact />
          <StatCard title="Видимых в результатах" value="16" icon="◎" tone="blue" compact />
          <StatCard title="Всего подкатегорий" value="48" icon="▤" tone="orange" compact />
        </View>
      </Panel>
      <Panel title="Список категорий" action="1-10 из 16">
        <AdminTable headers={['Категория', 'Переводы', 'Слаг / Родитель', 'Порядок', 'Статус', 'Видимость', 'Регион', 'Действия']}>
          {rows.map((item, index) => (
            <TableRow key={item.id}>
              <Cell wide><Identity title={item.name_ru} subtitle={`ID: ${item.id}`} color={item.color} initials={item.name_ru.slice(0, 2).toUpperCase()} /></Cell>
              <Cell><Text style={styles.tableText}>🇷🇺 🇺🇸 🇦🇲  +2</Text></Cell>
              <Cell><Text style={styles.tableText}>{item.slug}</Text><Text style={styles.tableMuted}>Корневая категория</Text></Cell>
              <Cell><Text style={styles.tableText}>{index + 1}</Text></Cell>
              <Cell><Badge label={item.isActive ? 'Активная' : 'Скрыта'} tone={item.isActive ? 'green' : 'red'} /></Cell>
              <Cell><Toggle value={item.isActive} onChange={() => setSection('categories', state.categories.map((row) => row.id === item.id ? { ...row, isActive: !row.isActive } : row))} /></Cell>
              <Cell><Text style={styles.tableText}>◎ Все регионы</Text></Cell>
              <Cell><ActionIcons onDelete={() => setSection('categories', state.categories.filter((row) => row.id !== item.id))} /></Cell>
            </TableRow>
          ))}
        </AdminTable>
      </Panel>
    </View>
  );
}

function LocationsSection({ state, setSection }: {
  state: AdminConfigState;
  setSection: <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => void;
}) {
  return (
    <View style={styles.stack}>
      <Panel title="Управление локациями" description="Создавайте, редактируйте и управляйте странами, регионами и городами. Используется для фильтрации, маршрутизации и локализации." actionNode={<AdminButton title="+ Добавить страну" />}>
        <FilterBar fields={['Поиск локаций...', 'Тип: Все', 'Статус: Все', 'Регион: Все регионы']} />
        <View style={styles.kpiRowSmall}>
          <StatCard title="Всего стран" value={String(state.countries.length)} icon="◎" tone="blue" compact />
          <StatCard title="Всего регионов" value={String(state.regions.length)} icon="◇" tone="blue" compact />
          <StatCard title="Всего городов" value={String(state.cities.length)} icon="▥" tone="purple" compact />
          <StatCard title="Активные локации" value="10" icon="✓" tone="green" compact />
          <StatCard title="Видимые локации" value="10" icon="◎" tone="orange" compact />
        </View>
      </Panel>
      <Panel title="">
        <Tabs tabs={['Страны', 'Регионы', 'Города']} active="Страны" />
        <AdminTable headers={['Страна', 'Код', 'Регионов', 'Городов', 'Статус', 'Видимость', 'Сортировка', 'Действия']}>
          {state.countries.map((country, index) => (
            <TableRow key={country.id}>
              <Cell><Identity title={country.name_en} subtitle={country.name_ru} color={index ? '#2F80ED' : '#EF4444'} initials={country.iso2} /></Cell>
              <Cell><Text style={styles.tableText}>{country.iso2}</Text></Cell>
              <Cell><Text style={styles.tableText}>2</Text><Text style={styles.tableMuted}>Региона</Text></Cell>
              <Cell><Text style={styles.tableText}>2</Text><Text style={styles.tableMuted}>Города</Text></Cell>
              <Cell><Badge label="Активна" tone="green" /></Cell>
              <Cell><Toggle value={country.isActive} onChange={() => setSection('countries', state.countries.map((row) => row.id === country.id ? { ...row, isActive: !row.isActive } : row))} /></Cell>
              <Cell><Text style={styles.tableText}>{index + 1}</Text></Cell>
              <Cell><ActionIcons /></Cell>
            </TableRow>
          ))}
        </AdminTable>
      </Panel>
      <View style={styles.twoCards}>
        <Panel title="Недавние добавления">
          <ActivityRows rows={['Армения - страна добавлена', 'Yerevan - город добавлен', 'California - регион добавлен']} />
        </Panel>
        <Panel title="Быстрые действия">
          <ActionTiles labels={['Добавить страну', 'Добавить регион', 'Добавить город', 'Импорт локаций', 'Экспорт данных']} />
        </Panel>
      </View>
    </View>
  );
}

function TranslationsSection({ state }: { state: AdminConfigState }) {
  const admin = useAdminConfig();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [missingOnly, setMissingOnly] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [importJson, setImportJson] = useState('');
  const [newLanguage, setNewLanguage] = useState({ name: '', nativeName: '', code: '', flag: '🏳️', direction: 'ltr' as 'ltr' | 'rtl', isActive: true, isDefault: false });
  const activeLanguages = state.languages.filter((item) => item.isActive);
  const modules = Array.from(new Set(state.translations.map((item) => item.module))).sort();

  const completionFor = (code: string) => {
    if (!state.translations.length) {
      return 100;
    }
    const complete = state.translations.filter((item) => {
      const values: Record<string, string> = { ru: item.ru, en: item.en, hy: item.hy, ...(item.values ?? {}) };
      return Boolean(values[code]);
    }).length;
    return Math.round((complete / state.translations.length) * 100);
  };

  const normalizeRow = (row: AdminConfigState['translations'][number]) => {
    const values: Record<string, string> = { ru: row.ru, en: row.en, hy: row.hy, ...(row.values ?? {}) };
    const missing = activeLanguages.some((language) => !values[language.code]?.trim());
    const partial = activeLanguages.some((language) => values[language.code]?.trim()) && missing;
    return { ...row, values, status: missing ? (partial ? 'partial' as const : 'missing' as const) : 'complete' as const };
  };

  const rows = state.translations
    .map(normalizeRow)
    .filter((item) => {
      const haystack = [item.key, item.module, item.screen, item.description, ...Object.values(item.values ?? {})].join(' ').toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      const matchesLanguage = languageFilter === 'all' || Boolean(item.values?.[languageFilter]);
      const matchesModule = moduleFilter === 'all' || item.module === moduleFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesMissing = !missingOnly || item.status !== 'complete';
      return matchesSearch && matchesLanguage && matchesModule && matchesStatus && matchesMissing;
    });

  const updateTranslations = (next: AdminConfigState['translations']) => {
    admin.updateSection('translations', next);
  };

  const updateRow = (id: string, patch: Partial<AdminConfigState['translations'][number]>) => {
    updateTranslations(state.translations.map((item) => {
      if (item.id !== id) {
        return item;
      }
      const next = { ...item, ...patch, updatedAt: new Date().toISOString() };
      const values: Record<string, string> = { ru: next.ru, en: next.en, hy: next.hy, ...(next.values ?? {}) };
      return { ...next, values, status: activeLanguages.every((language) => values[language.code]?.trim()) ? 'complete' : 'partial' };
    }));
  };

  const updateValue = (id: string, code: string, value: string) => {
    const row = state.translations.find((item) => item.id === id);
    if (!row) {
      return;
    }
    updateRow(id, {
      ru: code === 'ru' ? value : row.ru,
      en: code === 'en' ? value : row.en,
      hy: code === 'hy' ? value : row.hy,
      values: { ru: row.ru, en: row.en, hy: row.hy, ...row.values, [code]: value },
    });
  };

  const addTranslationKey = () => {
    const key = `custom.key.${Date.now()}`;
    const values = Object.fromEntries(state.languages.map((language) => [language.code, '']));
    updateTranslations([
      {
        id: `tr-${Date.now()}`,
        key,
        module: 'custom',
        screen: 'custom',
        description: 'New admin-created translation key.',
        ru: '',
        en: '',
        hy: '',
        values,
        status: 'missing',
        updatedAt: new Date().toISOString(),
      },
      ...state.translations,
    ]);
  };

  const addLanguage = () => {
    const code = newLanguage.code.trim().toLowerCase();
    if (!code || state.languages.some((item) => item.code === code)) {
      return;
    }
    const language = {
      id: `lang-${code}-${Date.now()}`,
      name: newLanguage.name || code.toUpperCase(),
      nativeName: newLanguage.nativeName || newLanguage.name || code.toUpperCase(),
      code,
      flag: newLanguage.flag || '🏳️',
      direction: newLanguage.direction,
      isActive: newLanguage.isActive,
      isDefault: newLanguage.isDefault,
    };
    const languages = newLanguage.isDefault
      ? state.languages.map((item) => ({ ...item, isDefault: false }))
      : state.languages;
    admin.updateSection('languages', [language, ...languages]);
    updateTranslations(state.translations.map((item) => ({ ...item, values: { ru: item.ru, en: item.en, hy: item.hy, ...item.values, [code]: '' }, status: 'partial' })));
    admin.addLog('added language', 'Translations', `Added language ${code}`, undefined, language).catch(() => undefined);
    setNewLanguage({ name: '', nativeName: '', code: '', flag: '🏳️', direction: 'ltr', isActive: true, isDefault: false });
  };

  const updateLanguage = (id: string, patch: Partial<AdminConfigState['languages'][number]>) => {
    admin.updateSection('languages', state.languages.map((item) => {
      if (item.id !== id) {
        return patch.isDefault ? { ...item, isDefault: false } : item;
      }
      return { ...item, ...patch };
    }));
  };

  const deleteLanguage = (id: string) => {
    const language = state.languages.find((item) => item.id === id);
    if (!language || ['ru', 'en', 'hy'].includes(language.code)) {
      updateLanguage(id, { isActive: false });
      return;
    }
    admin.updateSection('languages', state.languages.filter((item) => item.id !== id));
  };

  const saveAll = async () => {
    await admin.saveSection('translations', 'Translations', 'updated translations');
    await admin.saveSection('languages', 'Translations', 'updated languages');
  };

  const resetTranslations = async () => {
    await admin.resetSection('translations', 'Translations');
  };

  const exportAll = () => {
    setExportJson(JSON.stringify({ languages: state.languages, translations: state.translations }, null, 2));
  };

  const importAll = () => {
    try {
      const parsed = JSON.parse(importJson) as Partial<AdminConfigState>;
      if (Array.isArray(parsed.languages)) {
        admin.updateSection('languages', parsed.languages);
      }
      if (Array.isArray(parsed.translations)) {
        const existingByKey = new Map(state.translations.map((item) => [item.key, item]));
        parsed.translations.forEach((item) => existingByKey.set(item.key, { ...existingByKey.get(item.key), ...item } as AdminConfigState['translations'][number]));
        updateTranslations(Array.from(existingByKey.values()));
      }
      admin.addLog('imported translations json', 'Translations', 'Imported translation JSON', undefined, parsed).catch(() => undefined);
    } catch {
      admin.addLog('failed translations import', 'Translations', 'Invalid translation JSON').catch(() => undefined);
    }
  };

  const completed = state.translations.filter((item) => normalizeRow(item).status === 'complete').length;
  const missing = state.translations.length - completed;
  const lastUpdated = state.translations.map((item) => item.updatedAt).sort().reverse()[0] ?? 'Never';

  return (
    <View style={styles.stack}>
      <Panel
        title="Translation Center"
        description="Manage all Fixora texts across mobile app, web app, and admin panel."
        actionNode={<AdminButton title="Save All" onPress={saveAll} />}
      >
        <View style={styles.rowActions}>
          <AdminButton title="Add Language" tone="light" onPress={addLanguage} />
          <AdminButton title="Add Translation Key" tone="light" onPress={addTranslationKey} />
          <AdminButton title="Export JSON" tone="blue" onPress={exportAll} />
          <AdminButton title="Import JSON" tone="green" onPress={importAll} />
          <AdminButton title="Reset" tone="red" onPress={resetTranslations} />
        </View>
        <View style={styles.kpiRowSmall}>
          <StatCard title="Total translation keys" value={String(state.translations.length)} icon="∞" tone="purple" compact />
          <StatCard title="Active languages" value={String(activeLanguages.length)} icon="◎" tone="blue" compact />
          <StatCard title="Completed translations" value={String(completed)} icon="✓" tone="green" compact />
          <StatCard title="Missing translations" value={String(missing)} icon="!" tone={missing ? 'orange' : 'green'} compact />
          <StatCard title="Last updated" value={lastUpdated.slice(0, 10)} icon="+" tone="pink" compact />
        </View>
        <View style={styles.kpiRowSmall}>
          {state.languages.map((language) => (
            <ProgressCard key={language.id} label={`${language.flag} ${language.name}`} value={completionFor(language.code)} />
          ))}
        </View>
      </Panel>

      <Panel title="Languages" description="Languages are stored in AdminStore and drive every language switcher.">
        <View style={styles.formGrid}>
          <AdminInput label="Language name" value={newLanguage.name} onChangeText={(value) => setNewLanguage((current) => ({ ...current, name: value }))} />
          <AdminInput label="Native name" value={newLanguage.nativeName} onChangeText={(value) => setNewLanguage((current) => ({ ...current, nativeName: value }))} />
          <AdminInput label="Code" value={newLanguage.code} onChangeText={(value) => setNewLanguage((current) => ({ ...current, code: value }))} />
          <AdminInput label="Flag" value={newLanguage.flag} onChangeText={(value) => setNewLanguage((current) => ({ ...current, flag: value }))} />
          <ToggleRow label="Active" value={newLanguage.isActive} onChange={() => setNewLanguage((current) => ({ ...current, isActive: !current.isActive }))} />
          <ToggleRow label="Default" value={newLanguage.isDefault} onChange={() => setNewLanguage((current) => ({ ...current, isDefault: !current.isDefault }))} />
        </View>
        <View style={styles.kpiRowSmall}>
          {state.languages.map((language) => (
            <View key={language.id} style={styles.levelCard}>
              <Text style={styles.levelIcon}>{language.flag}</Text>
              <Text style={styles.levelTitle}>{language.name} / {language.nativeName}</Text>
              <Text style={styles.levelLine}>Code: {language.code.toUpperCase()} · {language.direction}</Text>
              <Text style={styles.levelLine}>Completion: {completionFor(language.code)}%</Text>
              <View style={styles.rowActions}>
                <AdminButton title={language.isActive ? 'Disable' : 'Enable'} tone={language.isActive ? 'red' : 'green'} onPress={() => updateLanguage(language.id, { isActive: !language.isActive })} />
                <AdminButton title="Set Default" tone="light" onPress={() => updateLanguage(language.id, { isDefault: true })} />
                <AdminButton title="Delete" tone="red" onPress={() => deleteLanguage(language.id)} />
              </View>
            </View>
          ))}
        </View>
      </Panel>

      <Panel title="Translation Keys" description="Inline edits update the live TranslationProvider immediately; Save All persists to localStorage.">
        <View style={styles.formGrid}>
          <AdminInput label="Search key, text, module, screen" value={search} onChangeText={setSearch} />
          <AdminInput label="Language filter" value={languageFilter} onChangeText={setLanguageFilter} />
          <AdminInput label="Module filter" value={moduleFilter} onChangeText={setModuleFilter} />
          <AdminInput label="Status filter" value={statusFilter} onChangeText={setStatusFilter} />
        </View>
        <View style={styles.rowActions}>
          <AdminButton title={missingOnly ? 'Showing Missing' : 'Show Missing'} tone={missingOnly ? 'blue' : 'light'} onPress={() => setMissingOnly((current) => !current)} />
          <AdminButton title="Show All Languages" tone="light" onPress={() => setLanguageFilter('all')} />
          <AdminButton title="Reset Filters" tone="light" onPress={() => { setSearch(''); setLanguageFilter('all'); setModuleFilter('all'); setStatusFilter('all'); setMissingOnly(false); }} />
          {modules.slice(0, 6).map((module) => <AdminButton key={module} title={module} tone="ghost" onPress={() => setModuleFilter(module)} />)}
        </View>
        <AdminTable headers={['Key', 'Module / screen', ...activeLanguages.map((item) => item.code.toUpperCase()), 'Status', 'Actions']}>
          {rows.slice(0, 40).map((item) => (
            <TableRow key={item.id}>
              <Cell wide>
                <TextInput value={item.key} onChangeText={(value) => updateRow(item.id, { key: value })} style={styles.input} />
                <Text style={styles.tableMuted}>{item.description ?? 'Editable from Admin Translations'}</Text>
              </Cell>
              <Cell>
                <TextInput value={item.module} onChangeText={(value) => updateRow(item.id, { module: value })} style={styles.input} />
                <Text style={styles.tableMuted}>{item.screen ?? item.module}</Text>
              </Cell>
              {activeLanguages.map((language) => (
                <Cell key={`${item.id}-${language.code}`} wide>
                  <TextInput
                    value={item.values?.[language.code] ?? ''}
                    onChangeText={(value) => updateValue(item.id, language.code, value)}
                    multiline
                    style={[styles.input, { minHeight: 70 }]}
                  />
                </Cell>
              ))}
              <Cell><Badge label={item.status} tone={item.status === 'complete' ? 'green' : item.status === 'missing' ? 'red' : 'orange'} /></Cell>
              <Cell>
                <View style={styles.rowActions}>
                  <AdminButton title="Save Row" tone="green" onPress={saveAll} />
                  <AdminButton title="Duplicate" tone="light" onPress={() => updateTranslations([{ ...item, id: `tr-copy-${Date.now()}`, key: `${item.key}.copy` }, ...state.translations])} />
                  <AdminButton title="Delete" tone="red" onPress={() => updateTranslations(state.translations.filter((row) => row.id !== item.id))} />
                </View>
              </Cell>
            </TableRow>
          ))}
        </AdminTable>
      </Panel>

      <View style={styles.twoCards}>
        <Panel title="Export JSON" description="Copy or inspect the generated translation payload.">
          <TextInput value={exportJson} onChangeText={setExportJson} multiline style={[styles.input, { minHeight: 160 }]} />
        </Panel>
        <Panel title="Import JSON" description="Paste JSON with languages/translations and press Import JSON. Existing keys are merged.">
          <TextInput value={importJson} onChangeText={setImportJson} multiline style={[styles.input, { minHeight: 160 }]} />
        </Panel>
      </View>
    </View>
  );
}

function UsersSection({ state }: { state: AdminConfigState }) {
  const users = [
    ['Mariam K.', 'Клиент', 'mariam.k@email.com', 'Yerevan', 'Онлайн', 'Проверен', 'Premium', '12', '4.8'],
    ['Alex Thompson', 'Мастер', 'alex.t@email.com', 'Los Angeles', 'Активный', 'Проверен', 'Premium', '45', '4.9'],
    ['Fixora Services LLC', 'Компания', 'info@fixora.com', 'New York', 'Активный', 'Проверен', '—', '128', '5.0'],
    ...state.users.map((user) => [user.name, user.role, `${user.id}@fixora.pro`, user.city, user.status, user.verification, user.premium ? 'Premium' : '—', String(user.completedOrders), String(user.rating)]),
  ].slice(0, 8);
  return (
    <View style={styles.stack}>
      <View style={styles.kpiRowSmall}>
        <StatCard title="Всего пользователей" value="1,248" icon="☷" tone="purple" compact />
        <StatCard title="Онлайн сейчас" value="78" icon="▣" tone="green" compact />
        <StatCard title="Верифицировано" value="932" icon="✓" tone="blue" compact />
        <StatCard title="Premium" value="128" icon="★" tone="orange" compact />
        <StatCard title="Мастера" value="342" icon="☷" tone="purple" compact />
        <StatCard title="Клиенты" value="843" icon="♙" tone="blue" compact />
        <StatCard title="Компании" value="63" icon="▥" tone="green" compact />
        <StatCard title="Заблокировано" value="12" icon="⊘" tone="red" compact />
      </View>
      <Panel title="">
        <View style={styles.filterColumns}>
          <FilterPills label="Роль" options={['Все', 'Клиент', 'Мастер', 'Компания', 'Админ']} />
          <FilterPills label="Статус" options={['Все', 'Онлайн', 'Активный', 'Неактивный', 'Заблокирован']} />
          <FilterPills label="Верификация" options={['Все', 'Проверен', 'Ожидает', 'Отклонен']} />
          <FilterPills label="Premium" options={['Все', 'Да', 'Нет']} />
        </View>
      </Panel>
      <Panel title="" actionNode={<AdminButton title="+ Добавить пользователя" />}>
        <AdminTable headers={['Пользователь', 'Роль', 'Контакты', 'Локация', 'Статус', 'Верификация', 'Премиум', 'Заказы', 'Рейтинг', 'Действия']}>
          {users.map((user) => (
            <TableRow key={`${user[0]}-${user[2]}`}>
              <Cell><Identity title={user[0]} subtitle={`ID: #USR-${Math.floor(Math.random() * 9000)}`} color="#E6DBFF" initials={user[0].slice(0, 2)} dark /></Cell>
              <Cell><Badge label={user[1]} tone={user[1] === 'Мастер' ? 'blue' : user[1] === 'Компания' ? 'purple' : 'green'} /></Cell>
              <Cell><Text style={styles.tableText}>{user[2]}</Text><Text style={styles.tableMuted}>+374 93 123 456</Text></Cell>
              <Cell><Text style={styles.tableText}>⌾ {user[3]}</Text><Text style={styles.tableMuted}>🇦🇲 Armenia</Text></Cell>
              <Cell><Badge label={user[4]} tone={user[4] === 'Онлайн' || user[4] === 'Активный' ? 'green' : 'orange'} /></Cell>
              <Cell><Badge label={user[5]} tone="green" /></Cell>
              <Cell><Badge label={user[6]} tone={user[6] === 'Premium' ? 'orange' : 'slate'} /></Cell>
              <Cell><Text style={styles.tableText}>{user[7]}</Text></Cell>
              <Cell><Text style={styles.rating}>★ {user[8]}</Text></Cell>
              <Cell><ActionIcons /></Cell>
            </TableRow>
          ))}
        </AdminTable>
      </Panel>
    </View>
  );
}

function VerificationSection({ state }: { state: AdminConfigState }) {
  return (
    <View style={styles.stack}>
      <Panel title="Master Verification" description="Проверяйте мастеров, управляйте бейджами доверия и уровнями верификации">
        <View style={styles.kpiRowSmall}>
          <StatCard title="Всего заявок" value="128" icon="▣" tone="purple" compact />
          <StatCard title="На рассмотрении" value="24" icon="▤" tone="blue" compact />
          <StatCard title="Одобрено" value="92" icon="✓" tone="orange" compact />
          <StatCard title="Отклонено" value="8" icon="×" tone="red" compact />
          <StatCard title="Premium мастера" value="42" icon="♛" tone="green" compact />
        </View>
        <FilterBar fields={['Поиск по имени, email, телефону, ID...', 'Все категории', 'Все локации', 'Выберите период']} />
      </Panel>
      <Panel title="Очередь на рассмотрение" action="24 новые заявки">
        <View style={styles.reviewCard}>
          <Identity title="Арман Мкртчян" subtitle="ID: #USR-00124  •  Ереван, Армения  •  Рейтинг: 4.9" color="#2F80ED" initials="AM" />
          <InfoPair label="Тип верификации" value="Документы и портфолио" />
          <InfoPair label="Уровень" value="Премиум" />
          <Badge label="На рассмотрении" tone="orange" />
          <View style={styles.rowActions}>
            <AdminButton title="✓ Одобрить" tone="green" />
            <AdminButton title="× Отклонить" tone="red" />
            <AdminButton title="◎ Подробнее" tone="light" />
          </View>
        </View>
      </Panel>
      <Panel title="Уровни верификации">
        <View style={styles.threeCards}>
          {['Базовая верификация', 'Расширенная верификация', 'Премиум верификация'].map((title, index) => (
            <View key={title} style={styles.levelCard}>
              <Text style={styles.levelIcon}>{index === 2 ? '♛' : '✓'}</Text>
              <Text style={styles.levelTitle}>{title}</Text>
              <Text style={styles.levelLine}>✓ Проверка личности</Text>
              <Text style={styles.levelLine}>✓ Проверка адреса</Text>
              <Text style={styles.levelLine}>✓ Документы и портфолио</Text>
            </View>
          ))}
        </View>
      </Panel>
      <SimpleDataTable title="Таблица верификаций" rows={state.users.map((user) => [user.name, user.categories, user.city, user.verification, '23 мая 2025'])} />
    </View>
  );
}

function OrdersSection({ state }: { state: AdminConfigState }) {
  const rows = [
    ['#FR-1081', 'Mariam K.', 'Home Service', 'Ереван', 'Arman Master', 'Ожидает', 'Не оплачено', '8 000 AMD'],
    ['#FR-1082', 'Artur S.', 'Repair', 'Гюмри', 'Hakob Master', 'Принят', 'Оплачено', '23 000 AMD'],
    ['#FR-1083', 'George M.', 'Cleaning', 'Ванадзор', 'Mariam K.', 'В работе', 'Частично', '14 000 AMD'],
    ...state.orders.map((order) => [order.id, order.client, 'Service', order.city, order.master, order.status, order.secureDeal, `${order.amount.toLocaleString()} AMD`]),
  ].slice(0, 7);
  return (
    <View style={styles.stack}>
      <Panel title="Orders Management" description="Отслеживайте заказы, управляйте статусами, назначайте мастеров и контролируйте оплату." actionNode={<AdminButton title="Open Dispatch" />}>
        <FilterBar fields={['Поиск заказов', 'Статус: Все', 'Город: Все', 'Мастер: Все', 'Вид: Таблица']} />
      </Panel>
      <View style={styles.kpiRowSmall}>
        <StatCard title="Всего заказов" value="128" icon="▤" tone="purple" compact />
        <StatCard title="Активные" value="76" icon="⌂" tone="blue" compact />
        <StatCard title="В работе" value="34" icon="◎" tone="orange" compact />
        <StatCard title="Завершенные" value="16" icon="✓" tone="green" compact />
        <StatCard title="Отмененные" value="8" icon="×" tone="red" compact />
        <StatCard title="Забронировано" value="22 000" icon="$" tone="purple" compact />
      </View>
      <Panel title="Таблица заказов" actionNode={<AdminButton title="+ Добавить заказ" />}>
        <AdminTable headers={['ID заказа', 'Клиент', 'Услуга', 'Город', 'Мастер', 'Статус', 'Платеж', 'Сумма', 'Действия']}>
          {rows.map((row) => (
            <TableRow key={row[0]}>
              {row.map((cell, index) => index < 8 ? (
                <Cell key={`${row[0]}-${index}`}>
                  {index === 5 || index === 6 ? <Badge label={cell} tone={index === 5 ? 'blue' : cell.includes('Не') ? 'red' : 'green'} /> : <Text style={styles.tableText}>{cell}</Text>}
                </Cell>
              ) : null)}
              <Cell><ActionIcons /></Cell>
            </TableRow>
          ))}
        </AdminTable>
      </Panel>
    </View>
  );
}

function FinanceSection({ state, setSection }: {
  state: AdminConfigState;
  setSection: <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => void;
}) {
  return (
    <View style={styles.stack}>
      <View style={styles.kpiRow}>
        <StatCard title="Общий доход" value="47 000 AMD" icon="▤" tone="purple" />
        <StatCard title="Комиссия платформы" value={`${state.financeSettings.commissionPercent} %`} icon="▣" tone="blue" />
        <StatCard title="Ожидающие выплаты" value="19 360 AMD" icon="♙" tone="orange" />
        <StatCard title="Завершённые выплаты" value="22 000 AMD" icon="▤" tone="green" />
        <StatCard title="Возвраты" value={`${state.financeSettings.refundReserve} AMD`} icon="⊘" tone="red" />
      </View>
      <View style={styles.dashboardGrid}>
        <Panel title="Динамика доходов" style={styles.chartWide}><LineChart color="#6D5DFB" height={230} /></Panel>
        <Panel title="Запросы на выплаты" style={styles.chartMid}><BarChart color="#F59E0B" /></Panel>
        <Panel title="Активность финансов" style={styles.chartSide}><ActivityRows rows={['Выплата мастеру - 8 000 AMD', 'Комиссия платформы - 5 640 AMD', 'Возврат средств - 2 000 AMD', 'Новый заказ - 12 000 AMD']} /></Panel>
      </View>
      <Panel title="Настройки комиссий и выплат" actionNode={<AdminButton title="Редактировать настройки" />}>
        <View style={styles.formGrid}>
          <AdminInput label="Комиссия платформы (%)" value={state.financeSettings.commissionPercent} onChangeText={(value) => setSection('financeSettings', { ...state.financeSettings, commissionPercent: value })} />
          <AdminInput label="Процент выплат мастерам (%)" value={state.financeSettings.payoutPercent} onChangeText={(value) => setSection('financeSettings', { ...state.financeSettings, payoutPercent: value })} />
          <AdminInput label="Резерв на возвраты (AMD)" value={state.financeSettings.refundReserve} onChangeText={(value) => setSection('financeSettings', { ...state.financeSettings, refundReserve: value })} />
          <AdminInput label="Метод выплат по умолчанию" value={state.financeSettings.defaultMethod} onChangeText={(value) => setSection('financeSettings', { ...state.financeSettings, defaultMethod: value })} />
        </View>
        <ToggleRow label="Автоматические выплаты" value={state.financeSettings.isActive} onChange={() => setSection('financeSettings', { ...state.financeSettings, isActive: !state.financeSettings.isActive })} />
      </Panel>
    </View>
  );
}

function MarketingSection({ state, setSection }: {
  state: AdminConfigState;
  setSection: <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => void;
}) {
  return (
    <View style={styles.stack}>
      <View style={styles.kpiRow}>
        <StatCard title="Активные баннеры" value="1" icon="▣" tone="purple" />
        <StatCard title="Промо-кодов" value="4" icon="▤" tone="blue" />
        <StatCard title="Мастеров в Featured" value="12" icon="♛" tone="orange" />
        <StatCard title="Push-кампаний" value="5" icon="➤" tone="green" />
        <StatCard title="Охват" value="120,450" icon="⌁" tone="pink" />
      </View>
      <Panel title="">
        <FilterBar fields={['Поиск по кампаниям', 'Канал: Все', 'Статус: Все', 'Гео: AM / Yerevan / Kentron']} />
      </Panel>
      <View style={styles.campaignGrid}>
        {state.marketingBanners.map((banner) => (
          <Panel key={banner.id} title={banner.title_en} action={banner.isActive ? 'Активная' : 'Запланирована'}>
            <InfoPair label="Период" value={`${banner.startDate} → ${banner.endDate}`} />
            <InfoPair label="Таргетинг" value={banner.target} />
            <InfoPair label="Показы" value="24,580" />
            <AdminButton title="Редактировать" tone="light" />
            <Toggle value={banner.isActive} onChange={() => setSection('marketingBanners', state.marketingBanners.map((item) => item.id === banner.id ? { ...item, isActive: !item.isActive } : item))} />
          </Panel>
        ))}
      </View>
      <SimpleDataTable title="Список кампаний" rows={state.marketingBanners.map((item) => [item.title_en, item.target, `${item.startDate} - ${item.endDate}`, item.isActive ? 'Активная' : 'Неактивная', '8.72%'])} />
    </View>
  );
}

function SupportSection({ state }: { state: AdminConfigState }) {
  return (
    <View style={styles.stack}>
      <View style={styles.kpiRow}>
        <StatCard title="Открытые тикеты" value="34" icon="◆" tone="purple" />
        <StatCard title="В работе" value="18" icon="▣" tone="blue" />
        <StatCard title="Ожидают ответа" value="8" icon="▤" tone="orange" />
        <StatCard title="Решённые" value="76" icon="✓" tone="green" />
        <StatCard title="Жалобы" value="5" icon="!" tone="pink" />
      </View>
      <Panel title="">
        <FilterBar fields={['Поиск по тикетам...', 'Тип: Все', 'Статус: Все', 'Приоритет: Все', 'Период']} />
      </Panel>
      <View style={styles.dashboardGrid}>
        <Panel title="Статистика по статусам" style={styles.chartMid}><DonutChart value="141" label="Всего тикетов" /></Panel>
        <Panel title="Тикеты по приоритетам" style={styles.chartWide}><ProgressRows rows={[['Высокий', 28], ['Средний', 78], ['Низкий', 35]]} /></Panel>
        <Panel title="Удовлетворённость" style={styles.chartSide}><Text style={styles.bigMetric}>4.7 / 5</Text><Text style={styles.ratingLarge}>★★★★★</Text></Panel>
      </View>
      <SimpleDataTable title="Таблица тикетов" rows={state.supportTickets.map((item) => [item.id, item.type, item.assigned, item.status, item.orderId, item.message])} />
    </View>
  );
}

function RegistrationSection({ state, regRole, setRegRole, setSection, addField, save }: {
  state: AdminConfigState;
  regRole: UserRole;
  setRegRole: (role: UserRole) => void;
  setSection: <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => void;
  addField: () => void;
  save: () => void;
}) {
  const fields = state.registrationFields[regRole];
  const updateField = (id: string, patch: Partial<RegistrationFieldConfig>) => {
    setSection('registrationFields', {
      ...state.registrationFields,
      [regRole]: fields.map((field) => field.id === id ? { ...field, ...patch } : field),
    });
  };
  const removeField = (id: string) => {
    setSection('registrationFields', { ...state.registrationFields, [regRole]: fields.filter((field) => field.id !== id) });
  };
  return (
    <View style={styles.stack}>
      <LinearGradient colors={['#006CFF', '#6D5DFB', '#A832FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.builderHero}>
        <View style={styles.builderIcon}><Text style={styles.builderIconText}>⚙</Text></View>
        <View style={styles.builderCopy}>
          <Text style={styles.builderTitle}>Registration Builder</Text>
          <Text style={styles.builderSubtitle}>Create, organize and manage all registration fields for clients and masters. Drag & drop to reorder.</Text>
        </View>
        <BuilderMetric value="58" label="Registration Fields" />
        <BuilderMetric value="24" label="Client Fields" />
        <BuilderMetric value="34" label="Master Fields" />
        <BuilderMetric value="2" label="Active Forms" />
        <View style={styles.builderActions}>
          <AdminButton title="+ Add Field" tone="light" onPress={addField} />
          <AdminButton title="▣ Duplicate Form" tone="ghost" onPress={() => setSection('registrationFields', { ...state.registrationFields, [regRole]: [...fields, ...fields.map((field) => ({ ...field, id: `${field.id}-copy-${Date.now()}` }))] })} />
          <AdminButton title="☑ Save Changes" tone="blue" onPress={save} />
        </View>
      </LinearGradient>

      <View style={styles.builderTabs}>
        <Tabs tabs={['Client Registration', 'Master Registration', 'Company Registration']} active={regRole === 'client' ? 'Client Registration' : regRole === 'master' ? 'Master Registration' : 'Company Registration'} onSelect={(label) => setRegRole(label.startsWith('Client') ? 'client' : label.startsWith('Master') ? 'master' : 'company')} />
        <Tabs tabs={['Field Builder', 'Form Settings', 'Validations', 'Analytics']} active="Field Builder" />
      </View>

      <View style={styles.builderGrid}>
        <Panel title="Field Types" description="Drag & drop fields to the form" style={styles.toolbox}>
          {(['text', 'email', 'phone', 'password', 'select', 'checkbox', 'number', 'upload'] as RegistrationFieldType[]).map((type) => (
            <Pressable key={type} accessibilityRole="button" onPress={addField} style={styles.fieldTypeRow}>
              <Text style={styles.fieldTypeIcon}>{fieldIcon(type)}</Text>
              <Text style={styles.fieldTypeText}>{fieldLabel(type)}</Text>
              <Text style={styles.moreDots}>⋮</Text>
            </Pressable>
          ))}
        </Panel>
        <Panel title="Form Builder" description="Drag fields to reorder. Click to edit field settings." style={styles.formBuilder} actionNode={<Badge label={`${regRole} Form`} tone="slate" />}>
          {fields.map((field) => (
            <View key={field.id} style={styles.builderField}>
              <Text style={styles.dragHandle}>⋮⋮</Text>
              <View style={styles.fieldIconBox}><Text style={styles.fieldTypeIcon}>{fieldIcon(field.type)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.builderFieldTitle}>{field.label}</Text>
                <Text style={styles.builderFieldMeta}>{fieldLabel(field.type)}</Text>
              </View>
              <Badge label={field.required ? 'Required' : 'Optional'} tone={field.required ? 'pink' : 'blue'} />
              <Text style={styles.localeText}>◎ RU EN HY</Text>
              <ActionIcons onDelete={() => removeField(field.id)} />
            </View>
          ))}
        </Panel>
        <Panel title="Live Preview" description="This is how your form will look for users" style={styles.previewPanel}>
          <View style={styles.phonePreview}>
            <View style={styles.phoneNotch} />
            <Text style={styles.phoneBrand}>Fixora</Text>
            <Text style={styles.phoneTitle}>Create your account</Text>
            {fields.slice(0, 7).map((field) => (
              <View key={field.id} style={styles.phoneInput}>
                <Text style={styles.phoneLabel}>{field.label}</Text>
                <Text style={styles.phonePlaceholder}>{field.placeholder}</Text>
              </View>
            ))}
            <LinearGradient colors={['#006CFF', '#A832FF']} style={styles.phoneButton}><Text style={styles.phoneButtonText}>Continue</Text></LinearGradient>
          </View>
          <View style={styles.fieldSettings}>
            <Text style={styles.settingsTitle}>Field Settings</Text>
            {fields[0] ? (
              <>
                <AdminInput label="Field Label" value={fields[0].label} onChangeText={(value) => updateField(fields[0].id, { label: value })} />
                <AdminInput label="Placeholder" value={fields[0].placeholder} onChangeText={(value) => updateField(fields[0].id, { placeholder: value })} />
                <AdminInput label="Field Type" value={fieldLabel(fields[0].type)} onChangeText={() => undefined} />
                <ToggleRow label="Required" value={fields[0].required} onChange={() => updateField(fields[0].id, { required: !fields[0].required })} />
              </>
            ) : null}
          </View>
        </Panel>
      </View>
    </View>
  );
}

function TelegramSection({ state, setSection, save }: {
  state: AdminConfigState;
  setSection: <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => void;
  save: () => void;
}) {
  const channels = state.telegram.channels;
  return (
    <View style={styles.stack}>
      <View style={styles.kpiRow}>
        <StatCard title="Статус бота" value={state.telegram.enabled ? 'Подключен' : 'Отключен'} icon="➤" tone="blue" />
        <StatCard title="Активные каналы" value={`${channels.filter((item) => item.enabled).length} / ${channels.length}`} icon="➤" tone="blue" />
        <StatCard title="Отправлено сообщений" value="1,248" icon="➤" tone="purple" />
        <StatCard title="Доставлено" value="98.6%" icon="✓" tone="green" />
        <StatCard title="Ошибки доставки" value="18" icon="!" tone="pink" />
        <StatCard title="Подписчики" value="2,540" icon="☷" tone="orange" />
      </View>
      <View style={styles.telegramGrid}>
        <Panel title="Настройки Telegram бота" actionNode={<AdminButton title="Редактировать" tone="light" />}>
          <AdminInput label="Bot Token" value={state.telegram.botToken || '123456789:AAH************************'} onChangeText={(value) => setSection('telegram', { ...state.telegram, botToken: value })} />
          <AdminInput label="Username" value="@FixoraSupportBot" onChangeText={() => undefined} />
          <AdminInput label="Webhook URL" value="https://fixora.pro/api/telegram/webhook" onChangeText={() => undefined} />
          <Badge label="● Подключен" tone="green" />
          <AdminButton title="Тест отправки" onPress={save} />
        </Panel>
        <Panel title="Быстрые действия">
          <ActionTiles labels={['Добавить канал', 'Создать шаблон', 'Настроить уведомления', 'Журнал отправок']} />
        </Panel>
        <Panel title="Предпросмотр сообщения" description="Как будет выглядеть сообщение в Telegram">
          <View style={styles.telegramPhone}>
            <Text style={styles.telegramBubble}>Новый заказ #ORD-1001{'\n'}Клиент: Mariam K.{'\n'}Мастер: Arman Master{'\n'}Сумма: 8 000 AMD</Text>
          </View>
        </Panel>
      </View>
      <Panel title="Управление каналами" actionNode={<AdminButton title="+ Добавить канал" />}>
        <View style={styles.channelGrid}>
          {channels.slice(0, 5).map((channel) => (
            <View key={channel.id} style={styles.channelCard}>
              <Text style={styles.channelIcon}>➤</Text>
              <Text style={styles.channelName}>{channel.name}</Text>
              <Text style={styles.tableMuted}>{channel.description}</Text>
              <Badge label={channel.enabled ? 'Активен' : 'Отключен'} tone={channel.enabled ? 'green' : 'red'} />
            </View>
          ))}
        </View>
      </Panel>
      <SimpleDataTable title="Шаблоны сообщений" rows={channels.slice(0, 5).map((item) => [item.name, item.notificationTitle, item.enabled ? 'Активен' : 'Отключен', item.lastSentAt ?? '23 мая 2025'])} />
    </View>
  );
}

function LogsSection({ state }: { state: AdminConfigState }) {
  return (
    <View style={styles.stack}>
      <View style={styles.kpiRow}>
        <StatCard title="Всего логов" value="1,342" icon="▣" tone="blue" />
        <StatCard title="Успешные действия" value="1,089" icon="✓" tone="green" />
        <StatCard title="Предупреждения" value="142" icon="!" tone="orange" />
        <StatCard title="Ошибки" value="111" icon="⊘" tone="pink" />
        <StatCard title="Уникальные админы" value="12" icon="☷" tone="purple" />
      </View>
      <Panel title="">
        <FilterBar fields={['Введите запрос...', 'Все модули', 'Все действия', 'Все статусы', 'Все админы']} />
      </Panel>
      <View style={styles.dashboardGrid}>
        <Panel title="Лента активности" style={styles.chartMid}>
          <ActivityRows rows={state.logs.slice(0, 8).map((log) => `${log.action} - ${log.module}`)} />
        </Panel>
        <Panel title="Таблица логов" style={styles.chartWide}>
          <AdminTable headers={['ID', 'Модуль', 'Действие', 'Старое / Новое', 'Админ', 'Создано']}>
            {state.logs.slice(0, 8).map((log) => (
              <TableRow key={log.id}>
                <Cell><Text style={styles.tableText}>{log.id}</Text></Cell>
                <Cell><Text style={styles.tableText}>{log.module}</Text></Cell>
                <Cell><Text style={styles.tableText}>{log.action}</Text></Cell>
                <Cell><Text style={styles.tableMuted}>No value{'\n'}No value</Text></Cell>
                <Cell><Text style={styles.tableText}>{log.adminName}</Text></Cell>
                <Cell><Text style={styles.tableText}>{log.dateTime}</Text></Cell>
              </TableRow>
            ))}
          </AdminTable>
        </Panel>
      </View>
    </View>
  );
}

function SettingsSection({ state, setSection, save }: {
  state: AdminConfigState;
  setSection: <K extends keyof AdminConfigState>(section: K, value: AdminConfigState[K]) => void;
  save: () => void;
}) {
  return (
    <View style={styles.stack}>
      <Panel title="Settings Center" description="Control app runtime behavior, payments, Telegram, maps, AI recommendations, language, currency, and release versions." actionNode={<AdminButton title="Сохранить настройки" onPress={save} />}>
        <View style={styles.kpiRowSmall}>
          <StatCard title="Runtime Flags" value="4 / 5" icon="⚑" tone="blue" compact />
          <StatCard title="App Version" value={state.appSettings.appVersion} icon="▣" tone="purple" compact />
          <StatCard title="Default Locale" value={`${state.appSettings.defaultLanguage} / ${state.appSettings.defaultCurrency}`} icon="◎" tone="green" compact />
          <StatCard title="Commission" value={`${state.appSettings.commissionPercent} %`} icon="%" tone="orange" compact />
        </View>
      </Panel>
      <View style={styles.twoCards}>
        <Panel title="Application Defaults">
          <View style={styles.formGrid}>
            <AdminInput label="App version" value={state.appSettings.appVersion} onChangeText={(value) => setSection('appSettings', { ...state.appSettings, appVersion: value })} />
            <AdminInput label="Minimum app version" value={state.appSettings.minimumAppVersion} onChangeText={(value) => setSection('appSettings', { ...state.appSettings, minimumAppVersion: value })} />
            <AdminInput label="Default currency" value={state.appSettings.defaultCurrency} onChangeText={(value) => setSection('appSettings', { ...state.appSettings, defaultCurrency: value })} />
            <AdminInput label="Default language" value={state.appSettings.defaultLanguage} onChangeText={(value) => setSection('appSettings', { ...state.appSettings, defaultLanguage: value })} />
            <AdminInput label="Commission percent" value={state.appSettings.commissionPercent} onChangeText={(value) => setSection('appSettings', { ...state.appSettings, commissionPercent: value })} />
          </View>
          <AdminButton title="Сохранить настройки приложения" onPress={save} />
        </Panel>
        <Panel title="Feature Gates">
          <ToggleRow label="Maintenance mode" value={state.appSettings.maintenanceMode} onChange={() => setSection('appSettings', { ...state.appSettings, maintenanceMode: !state.appSettings.maintenanceMode })} />
          <ToggleRow label="Enable payments" value={state.appSettings.payments} onChange={() => setSection('appSettings', { ...state.appSettings, payments: !state.appSettings.payments })} />
          <ToggleRow label="Enable Telegram notifications" value={state.appSettings.telegramNotifications} onChange={() => setSection('appSettings', { ...state.appSettings, telegramNotifications: !state.appSettings.telegramNotifications })} />
          <ToggleRow label="Enable AI recommendations" value={state.appSettings.aiRecommendations} onChange={() => setSection('appSettings', { ...state.appSettings, aiRecommendations: !state.appSettings.aiRecommendations })} />
          <ToggleRow label="Enable map system" value={state.appSettings.mapSystem} onChange={() => setSection('appSettings', { ...state.appSettings, mapSystem: !state.appSettings.mapSystem })} />
        </Panel>
      </View>
      <SimpleDataTable title="Runtime Preview" rows={[
        ['Payments', state.appSettings.payments ? 'enabled' : 'disabled', 'Secure deal flow', 'Active'],
        ['Map system', state.appSettings.mapSystem ? 'enabled' : 'disabled', 'Location services', 'Active'],
        ['AI recommendations', state.appSettings.aiRecommendations ? 'enabled' : 'disabled', 'Smart matching', 'Active'],
        ['Maintenance mode', state.appSettings.maintenanceMode ? 'enabled' : 'disabled', 'System availability', state.appSettings.maintenanceMode ? 'Active' : 'Inactive'],
      ]} />
    </View>
  );
}

function SimpleDataTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <Panel title={title} action="1-10 из 128">
      <AdminTable headers={['Название', 'Параметр', 'Значение', 'Статус', 'Действия']}>
        {rows.slice(0, 8).map((row, index) => (
          <TableRow key={`${title}-${index}`}>
            <Cell><Text style={styles.tableText}>{row[0]}</Text></Cell>
            <Cell><Text style={styles.tableText}>{row[1]}</Text></Cell>
            <Cell><Text style={styles.tableText}>{row[2]}</Text></Cell>
            <Cell><Badge label={row[3] ?? 'Активен'} tone={(row[3] ?? '').includes('Inactive') ? 'slate' : 'green'} /></Cell>
            <Cell><ActionIcons /></Cell>
          </TableRow>
        ))}
      </AdminTable>
    </Panel>
  );
}

function StatCard({ title, value, icon, tone, change = '+12.5%', compact = false }: { title: string; value: string; icon: string; tone: StatusTone; change?: string; compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.statCard, compact && styles.statCardCompact]}>
      <View style={styles.statTop}>
        <View style={[styles.statIcon, toneStyle(tone).soft]}>
          <Text style={[styles.statIconText, toneStyle(tone).text]}>{icon}</Text>
        </View>
        {!compact ? <MiniSpark tone={tone} /> : null}
      </View>
      <Text style={styles.statTitle}>{t(autoKey('admin.stat', title), title)}</Text>
      <Text style={[styles.statValue, compact && styles.statValueCompact]}>{value}</Text>
      <Text style={[styles.statChange, change.startsWith('-') && styles.negative]}>{change} <Text style={styles.statPeriod}>за неделю</Text></Text>
      {compact ? null : <MiniLine tone={tone} />}
    </View>
  );
}

function ProgressCard({ label, value }: { label: string; value: number }) {
  const { t } = useTranslation();
  const tone: StatusTone = value >= 100 ? 'green' : value >= 70 ? 'orange' : 'red';
  return (
    <View style={styles.levelCard}>
      <Text style={styles.levelTitle}>{t(autoKey('admin.progress', label), label)}</Text>
      <Text style={[styles.bigMetric, { marginTop: 8, fontSize: 30 }]}>{value}%</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, toneStyle(tone).solid, { width: `${Math.max(4, Math.min(100, value))}%` }]} />
      </View>
    </View>
  );
}

function Panel({ title, description, action, actionNode, children, style }: { title: string; description?: string; action?: string; actionNode?: ReactNode; children: ReactNode; style?: object }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.panel, style]}>
      {(title || description || action || actionNode) ? (
        <View style={styles.panelHeader}>
          <View>
            {title ? <Text style={styles.panelTitle}>{t(autoKey('admin.panel.title', title), title)}</Text> : null}
            {description ? <Text style={styles.panelDescription}>{t(autoKey('admin.panel.description', description), description)}</Text> : null}
          </View>
          {actionNode ?? (action ? <Badge label={action} tone="purple" /> : null)}
        </View>
      ) : null}
      {children}
    </View>
  );
}

function AdminTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={styles.tableHeadRow}>
          {headers.map((header) => <Cell key={header}><Text style={styles.tableHead}>{header}</Text></Cell>)}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

function TableRow({ children }: { children: ReactNode }) {
  return <View style={styles.tableRow}>{children}</View>;
}

function Cell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <View style={[styles.cell, wide && styles.cellWide]}>{children}</View>;
}

function AdminButton({ title, onPress, tone = 'primary' }: { title: string; onPress?: () => void; tone?: 'primary' | 'light' | 'ghost' | 'blue' | 'green' | 'red' }) {
  const { t } = useTranslation();
  const translatedTitle = t(autoKey('admin.button', title), title);
  const isPrimary = tone === 'primary' || tone === 'blue';
  if (isPrimary) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.buttonShadow}>
        <LinearGradient colors={tone === 'blue' ? ['#2F80ED', '#6D5DFB'] : ['#6D5DFB', '#3B82F6']} style={styles.button}>
          <Text style={styles.buttonText}>{translatedTitle}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.plainButton, tone === 'green' && styles.greenButton, tone === 'red' && styles.redButton, tone === 'ghost' && styles.ghostButton]}>
      <Text style={[styles.plainButtonText, tone === 'green' && styles.greenText, tone === 'red' && styles.redText]}>{translatedTitle}</Text>
    </Pressable>
  );
}

function AdminInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{t(autoKey('admin.input', label), label)}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholderTextColor="#98A2B3" style={styles.input} />
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: StatusTone }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.badge, toneStyle(tone).soft]}>
      <Text style={[styles.badgeText, toneStyle(tone).text]}>{t(autoKey('admin.badge', label), label)}</Text>
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange?: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onChange} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <View>
        <Text style={styles.toggleTitle}>{label}</Text>
        <Text style={styles.tableMuted}>Runtime setting</Text>
      </View>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}

function Tabs({ tabs, active, onSelect }: { tabs: string[]; active: string; onSelect?: (value: string) => void }) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <Pressable key={tab} accessibilityRole="button" onPress={() => onSelect?.(tab)} style={[styles.tab, active === tab && styles.tabActive]}>
          <Text style={[styles.tabText, active === tab && styles.tabTextActive]}>{tab}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Segmented({ options, active }: { options: string[]; active: string }) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => <Text key={option} style={[styles.segmentText, option === active && styles.segmentActive]}>{option}</Text>)}
    </View>
  );
}

function IconButton({ label, badge }: { label: string; badge?: string }) {
  return (
    <View style={styles.iconButton}>
      <Text style={styles.iconButtonText}>{label}</Text>
      {badge ? <Text style={styles.iconBadge}>{badge}</Text> : null}
    </View>
  );
}

function FilterBar({ fields }: { fields: string[] }) {
  return (
    <View style={styles.filterBar}>
      {fields.map((field, index) => (
        <View key={`${field}-${index}`} style={styles.filterInput}>
          <Text style={styles.filterText}>{index === 0 ? '⌕  ' : ''}{field}</Text>
          {index > 0 ? <Text style={styles.filterChevron}>⌄</Text> : null}
        </View>
      ))}
    </View>
  );
}

function FilterPills({ label, options }: { label: string; options: string[] }) {
  return (
    <View style={styles.filterPillBlock}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map((option, index) => (
          <View key={option} style={[styles.filterPill, index === 0 && styles.filterPillActive]}>
            <Text style={[styles.filterPillText, index === 0 && styles.filterPillTextActive]}>{option}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ActionIcons({ onDelete }: { onDelete?: () => void }) {
  return (
    <View style={styles.actionIcons}>
      <Pressable accessibilityRole="button" style={styles.actionIcon}><Text style={styles.actionIconText}>✎</Text></Pressable>
      <Pressable accessibilityRole="button" style={[styles.actionIcon, styles.viewIcon]}><Text style={styles.viewIconText}>◎</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onDelete} style={[styles.actionIcon, styles.deleteIcon]}><Text style={styles.deleteIconText}>⌫</Text></Pressable>
    </View>
  );
}

function Identity({ title, subtitle, color, initials, dark = false }: { title: string; subtitle: string; color: string; initials: string; dark?: boolean }) {
  return (
    <View style={styles.identity}>
      <View style={[styles.identityAvatar, { backgroundColor: color }]}><Text style={[styles.identityText, dark && styles.identityTextDark]}>{initials}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.identityTitle}>{title}</Text>
        <Text style={styles.identitySub}>{subtitle}</Text>
      </View>
    </View>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoPair}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MiniSpark({ tone }: { tone: StatusTone }) {
  return <View style={[styles.miniSpark, toneStyle(tone).soft]}><Text style={[styles.miniSparkText, toneStyle(tone).text]}>⌁</Text></View>;
}

function MiniLine({ tone }: { tone: StatusTone }) {
  return (
    <View style={styles.sparkLine}>
      {spark.map((height, index) => <View key={index} style={[styles.sparkPoint, { height }, toneStyle(tone).solid]} />)}
    </View>
  );
}

function LineChart({ color, height }: { color: string; height: number }) {
  const points = [42, 84, 64, 70, 96, 112, 88, 116];
  return (
    <View style={[styles.lineChart, { height }]}>
      {[0, 1, 2, 3, 4].map((line) => <View key={line} style={[styles.gridLine, { bottom: line * 42 + 14 }]} />)}
      <View style={styles.lineBars}>
        {points.map((point, index) => (
          <View key={index} style={styles.lineColumn}>
            <LinearGradient colors={[`${color}66`, `${color}11`]} style={[styles.lineFill, { height: point + 46 }]} />
            <View style={[styles.lineDot, { backgroundColor: color, bottom: point + 44 }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

function BarChart({ color }: { color: string }) {
  return (
    <View style={styles.barChart}>
      {[74, 130, 118, 126, 142, 182, 166, 196].map((height, index) => (
        <View key={index} style={styles.barColumn}>
          <View style={[styles.bar, { height, backgroundColor: color }]} />
          <Text style={styles.barLabel}>{23 + index} мая</Text>
        </View>
      ))}
    </View>
  );
}

function DonutChart({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.donutWrap}>
      <LinearGradient colors={['#3B82F6', '#6D5DFB', '#22C55E', '#F59E0B']} style={styles.donut}>
        <View style={styles.donutCenter}>
          <Text style={styles.donutValue}>{value}</Text>
          <Text style={styles.donutLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function Legend({ items }: { items: Array<[string, string, StatusTone]> }) {
  return (
    <View style={styles.legend}>
      {items.map(([label, value, tone]) => (
        <View key={label} style={styles.legendRow}>
          <View style={[styles.legendDot, toneStyle(tone).solid]} />
          <Text style={styles.legendText}>{label}</Text>
          <Text style={styles.legendValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function ActivityList() {
  return <ActivityRows rows={['Новый пользователь зарегистрирован', 'Заказ #1234 завершён', 'Платёж получен', 'Новый мастер верифицирован', 'Новый тикет поддержки']} />;
}

function ActivityRows({ rows }: { rows: string[] }) {
  return (
    <View style={styles.activityRows}>
      {rows.map((row, index) => (
        <View key={`${row}-${index}`} style={styles.activityRow}>
          <View style={[styles.activityIcon, toneStyle(['green', 'blue', 'orange', 'purple', 'pink'][index % 5] as StatusTone).soft]}>
            <Text style={[styles.activityIconText, toneStyle(['green', 'blue', 'orange', 'purple', 'pink'][index % 5] as StatusTone).text]}>●</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>{row}</Text>
            <Text style={styles.activityMeta}>{2 + index * 5} мин. назад</Text>
          </View>
          <View style={[styles.liveDot, toneStyle(['green', 'blue', 'orange', 'purple', 'pink'][index % 5] as StatusTone).solid]} />
        </View>
      ))}
    </View>
  );
}

function CompactPeople({ rows }: { rows: string[] }) {
  return (
    <View style={styles.activityRows}>
      {rows.map((name, index) => (
        <View key={name} style={styles.peopleRow}>
          <Identity title={name} subtitle={`${name.toLowerCase().replace(' ', '')}@mail.com`} color={['#D8EEFF', '#FFE0E8', '#EDE7FF'][index % 3]} initials={name.slice(0, 2)} dark />
          <Badge label={index % 2 ? 'Мастер' : 'Клиент'} tone={index % 2 ? 'orange' : 'purple'} />
          <Text style={styles.tableMuted}>{2 + index * 5} мин. назад</Text>
        </View>
      ))}
    </View>
  );
}

function ProgressRows({ rows }: { rows: Array<[string, number]> }) {
  return (
    <View style={styles.progressRows}>
      {rows.map(([label, value], index) => (
        <View key={label} style={styles.progressRow}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>{label}</Text>
            <Text style={styles.progressValue}>{value * 13}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(value, 100)}%`, backgroundColor: ['#6D5DFB', '#2F80ED', '#22C55E', '#F59E0B', '#EC4899'][index % 5] }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function QuickActions() {
  return <ActionTiles labels={['Добавить категорию', 'Добавить пользователя', 'Добавить мастера', 'Создать заказ', 'Отправить уведомление', 'Настройки сайта']} />;
}

function ActionTiles({ labels }: { labels: string[] }) {
  return (
    <View style={styles.actionTileGrid}>
      {labels.map((label, index) => (
        <View key={label} style={styles.actionTile}>
          <Text style={[styles.actionTileIcon, toneStyle(['purple', 'blue', 'green', 'orange', 'pink'][index % 5] as StatusTone).text]}>{['+', '☷', '✓', '▤', '➤'][index % 5]}</Text>
          <Text style={styles.actionTileText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function BuilderMetric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.builderMetric}>
      <Text style={styles.builderMetricValue}>{value}</Text>
      <Text style={styles.builderMetricLabel}>{label}</Text>
    </View>
  );
}

function fieldLabel(type: RegistrationFieldType) {
  return {
    text: 'Text Field',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    select: 'Select / Dropdown',
    checkbox: 'Checkbox',
    number: 'Number',
    upload: 'File Upload',
  }[type];
}

function fieldIcon(type: RegistrationFieldType) {
  return {
    text: '☷',
    email: '✉',
    phone: '☎',
    password: '▣',
    select: '⌄',
    checkbox: '☑',
    number: '#',
    upload: '⇧',
  }[type];
}

function toneStyle(tone: StatusTone) {
  const map = {
    purple: { soft: { backgroundColor: '#F0ECFF' }, text: { color: '#6D5DFB' }, solid: { backgroundColor: '#6D5DFB' } },
    blue: { soft: { backgroundColor: '#EAF3FF' }, text: { color: '#2F80ED' }, solid: { backgroundColor: '#2F80ED' } },
    green: { soft: { backgroundColor: '#EAFBF1' }, text: { color: '#16A765' }, solid: { backgroundColor: '#22C55E' } },
    orange: { soft: { backgroundColor: '#FFF5E6' }, text: { color: '#F59E0B' }, solid: { backgroundColor: '#F59E0B' } },
    pink: { soft: { backgroundColor: '#FFF0F8' }, text: { color: '#EC4899' }, solid: { backgroundColor: '#EC4899' } },
    red: { soft: { backgroundColor: '#FFF0F2' }, text: { color: '#EF4444' }, solid: { backgroundColor: '#EF4444' } },
    slate: { soft: { backgroundColor: '#F3F6FB' }, text: { color: '#667085' }, solid: { backgroundColor: '#94A3B8' } },
  };
  return map[tone];
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFF' },
  shell: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 286, padding: 18, backgroundColor: '#FFFFFF', borderRightWidth: 1, borderRightColor: '#E7EAF3' },
  sidebarCollapsed: { width: 86, alignItems: 'center' },
  brandRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collapseButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3', shadowColor: '#6D5DFB', shadowOpacity: 0.12, shadowRadius: 12 },
  collapseText: { color: '#6D5DFB', fontSize: 22, fontWeight: '900' },
  superLabel: { marginLeft: 82, marginTop: -18, color: '#6D5DFB', fontSize: 12, fontWeight: '900' },
  sidebarScroll: { paddingTop: 24, paddingBottom: 18 },
  navGroup: { marginBottom: 18 },
  navGroupTitle: { marginBottom: 10, color: '#8A94AA', fontSize: 11, fontWeight: '900' },
  navItem: { minHeight: 44, paddingHorizontal: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  navItemActive: { backgroundColor: '#EEE9FF', shadowColor: '#6D5DFB', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  navIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFF' },
  navIconActive: { backgroundColor: '#6D5DFB' },
  navIconText: { color: '#667085', fontSize: 13, fontWeight: '900' },
  navIconTextActive: { color: '#FFFFFF' },
  navLabel: { flex: 1, color: '#0F172A', fontSize: 13, fontWeight: '900' },
  navLabelActive: { color: '#271B9D' },
  adminCard: { minHeight: 72, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3', shadowColor: '#6D5DFB', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  adminAvatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2D9' },
  adminAvatarText: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  adminName: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  adminEmail: { marginTop: 3, color: '#667085', fontSize: 11, fontWeight: '700' },
  online: { marginTop: 4, color: '#22C55E', fontSize: 11, fontWeight: '900' },
  exitButton: { marginTop: 14, minHeight: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  exitText: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  workspace: { flex: 1 },
  topbar: { minHeight: 112, paddingHorizontal: 26, paddingTop: 14, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E7EAF3' },
  titleBlock: { minWidth: 360, flex: 1 },
  crumb: { color: '#6D5DFB', fontSize: 12, fontWeight: '900' },
  pageTitle: { marginTop: 4, color: '#0F172A', fontSize: 26, lineHeight: 32, fontWeight: '900' },
  pageSubtitle: { marginTop: 4, color: '#667085', fontSize: 13, fontWeight: '700' },
  topActions: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' },
  globalSearch: { width: 420, minHeight: 46, paddingHorizontal: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE3EF', shadowColor: '#667085', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  searchIcon: { color: '#667085', fontSize: 20, fontWeight: '900' },
  globalSearchInput: { flex: 1, color: '#0F172A', fontSize: 13, fontWeight: '800' },
  shortcut: { color: '#667085', fontSize: 12, fontWeight: '900' },
  dateButton: { minHeight: 42, paddingHorizontal: 18, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  dateText: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  resetButton: { minHeight: 42, paddingHorizontal: 18, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F2' },
  resetText: { color: '#EF4444', fontSize: 12, fontWeight: '900' },
  content: { padding: 26, paddingBottom: 44 },
  stack: { gap: 18 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  kpiRowSmall: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  statCard: { flex: 1, minWidth: 210, minHeight: 156, padding: 18, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3', shadowColor: '#6D5DFB', shadowOpacity: 0.09, shadowRadius: 22, shadowOffset: { width: 0, height: 14 } },
  statCardCompact: { minHeight: 104 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statIconText: { fontSize: 20, fontWeight: '900' },
  statTitle: { marginTop: 10, color: '#56627A', fontSize: 12, fontWeight: '900' },
  statValue: { marginTop: 7, color: '#0F172A', fontSize: 28, fontWeight: '900' },
  statValueCompact: { fontSize: 24 },
  statChange: { marginTop: 8, color: '#16A765', fontSize: 12, fontWeight: '900' },
  negative: { color: '#EF4444' },
  statPeriod: { color: '#667085' },
  miniSpark: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  miniSparkText: { fontSize: 22, fontWeight: '900' },
  sparkLine: { marginTop: 8, height: 34, flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  sparkPoint: { flex: 1, borderRadius: 6, opacity: 0.75 },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  bottomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  panel: { flex: 1, minWidth: 320, padding: 18, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3', shadowColor: '#6D5DFB', shadowOpacity: 0.07, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  panelHeader: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  panelTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  panelDescription: { marginTop: 6, color: '#667085', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  chartWide: { flexBasis: 620, minHeight: 300 },
  chartMid: { flexBasis: 430, minHeight: 300 },
  chartSide: { flexBasis: 330, minHeight: 300 },
  twoCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  threeCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  campaignGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  filterColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: 28 },
  filterBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  filterInput: { flexGrow: 1, minWidth: 230, minHeight: 44, paddingHorizontal: 14, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE3EF' },
  filterText: { color: '#667085', fontSize: 13, fontWeight: '800' },
  filterChevron: { color: '#667085', fontSize: 16, fontWeight: '900' },
  filterPillBlock: { flex: 1, minWidth: 260 },
  filterLabel: { marginBottom: 10, color: '#667085', fontSize: 12, fontWeight: '900' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterPill: { minHeight: 34, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E6F0' },
  filterPillActive: { backgroundColor: '#6D5DFB', borderColor: '#6D5DFB' },
  filterPillText: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  filterPillTextActive: { color: '#FFFFFF' },
  table: { minWidth: 1100, flex: 1 },
  tableHeadRow: { minHeight: 50, flexDirection: 'row', backgroundColor: '#F8FAFF', borderBottomWidth: 1, borderBottomColor: '#E7EAF3' },
  tableRow: { minHeight: 70, flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF1F7' },
  cell: { width: 150, paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'center' },
  cellWide: { width: 230 },
  tableHead: { color: '#667085', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  tableText: { color: '#0F172A', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  tableMuted: { marginTop: 3, color: '#667085', fontSize: 11, lineHeight: 16, fontWeight: '700' },
  badge: { alignSelf: 'flex-start', minHeight: 26, paddingHorizontal: 10, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 11, fontWeight: '900' },
  buttonShadow: { shadowColor: '#6D5DFB', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  button: { minHeight: 44, paddingHorizontal: 20, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  plainButton: { minHeight: 42, paddingHorizontal: 16, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE3EF' },
  ghostButton: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.4)' },
  greenButton: { backgroundColor: '#EAFBF1', borderColor: '#CBEFDC' },
  redButton: { backgroundColor: '#FFF0F2', borderColor: '#FFD5DD' },
  plainButtonText: { color: '#6D5DFB', fontSize: 13, fontWeight: '900' },
  greenText: { color: '#16A765' },
  redText: { color: '#EF4444' },
  segmented: { minHeight: 38, padding: 3, borderRadius: 12, flexDirection: 'row', backgroundColor: '#F3F6FB' },
  segmentText: { minWidth: 36, paddingHorizontal: 10, borderRadius: 10, color: '#0F172A', fontSize: 12, lineHeight: 30, textAlign: 'center', fontWeight: '900' },
  segmentActive: { color: '#0F172A', backgroundColor: '#DCEBFF' },
  iconButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  iconButtonText: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  iconBadge: { position: 'absolute', right: -4, top: -6, minWidth: 18, height: 18, borderRadius: 9, color: '#FFFFFF', backgroundColor: '#F43F5E', overflow: 'hidden', fontSize: 10, lineHeight: 18, textAlign: 'center', fontWeight: '900' },
  tabs: { marginBottom: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { minHeight: 40, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F6FB' },
  tabActive: { backgroundColor: '#6D5DFB' },
  tabText: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  tabTextActive: { color: '#FFFFFF' },
  inputWrap: { flexGrow: 1, flexBasis: 240 },
  inputLabel: { marginBottom: 7, color: '#667085', fontSize: 12, fontWeight: '900' },
  input: { minHeight: 44, paddingHorizontal: 12, borderRadius: 10, color: '#0F172A', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE3EF', fontSize: 13, fontWeight: '800' },
  toggleRow: { minHeight: 58, marginTop: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EDF1F7' },
  toggleTitle: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  toggle: { width: 42, height: 24, borderRadius: 12, padding: 3, backgroundColor: '#D9E1EE' },
  toggleOn: { backgroundColor: '#6D5DFB' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  toggleKnobOn: { transform: [{ translateX: 18 }] },
  actionIcons: { flexDirection: 'row', gap: 8 },
  actionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0ECFF', borderWidth: 1, borderColor: '#E2D8FF' },
  actionIconText: { color: '#6D5DFB', fontSize: 14, fontWeight: '900' },
  viewIcon: { backgroundColor: '#EAF3FF', borderColor: '#D4E8FF' },
  viewIconText: { color: '#2F80ED', fontSize: 14, fontWeight: '900' },
  deleteIcon: { backgroundColor: '#FFF0F2', borderColor: '#FFD5DD' },
  deleteIconText: { color: '#EF4444', fontSize: 14, fontWeight: '900' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  identityAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  identityText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  identityTextDark: { color: '#0F172A' },
  identityTitle: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  identitySub: { marginTop: 3, color: '#667085', fontSize: 11, fontWeight: '700' },
  lineChart: { position: 'relative', overflow: 'hidden' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#E9EEF7' },
  lineBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  lineColumn: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  lineFill: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  lineDot: { position: 'absolute', alignSelf: 'center', width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#FFFFFF' },
  barChart: { height: 250, flexDirection: 'row', alignItems: 'flex-end', gap: 18 },
  barColumn: { flex: 1, alignItems: 'center', gap: 8 },
  bar: { width: 26, borderRadius: 8, opacity: 0.78 },
  barLabel: { color: '#667085', fontSize: 10, fontWeight: '800' },
  donutWrap: { alignItems: 'center', justifyContent: 'center' },
  donut: { width: 190, height: 190, borderRadius: 95, alignItems: 'center', justifyContent: 'center' },
  donutCenter: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  donutValue: { color: '#0F172A', fontSize: 24, fontWeight: '900' },
  donutLabel: { color: '#667085', fontSize: 11, fontWeight: '800' },
  legend: { marginTop: 14, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { flex: 1, color: '#0F172A', fontSize: 12, fontWeight: '800' },
  legendValue: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  activityRows: { gap: 10 },
  activityRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  activityIconText: { fontSize: 14, fontWeight: '900' },
  activityTitle: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  activityMeta: { marginTop: 3, color: '#667085', fontSize: 10, fontWeight: '700' },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  peopleRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressRows: { gap: 16 },
  progressRow: { gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  progressValue: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  progressTrack: { height: 9, borderRadius: 5, backgroundColor: '#EEF2F7', overflow: 'hidden' },
  progressFill: { height: 9, borderRadius: 5 },
  actionTileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  actionTile: { flexGrow: 1, flexBasis: 126, minHeight: 112, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3', shadowColor: '#6D5DFB', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  actionTileIcon: { fontSize: 28, fontWeight: '900' },
  actionTileText: { color: '#0F172A', fontSize: 12, lineHeight: 16, textAlign: 'center', fontWeight: '900' },
  infoPair: { minWidth: 150, gap: 4 },
  infoLabel: { color: '#667085', fontSize: 11, fontWeight: '900' },
  infoValue: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  reviewCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 28 },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  levelCard: { flex: 1, minWidth: 260, minHeight: 150, padding: 18, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  levelIcon: { color: '#6D5DFB', fontSize: 28, fontWeight: '900' },
  levelTitle: { marginTop: 8, color: '#0F172A', fontSize: 15, fontWeight: '900' },
  levelLine: { marginTop: 8, color: '#667085', fontSize: 12, fontWeight: '800' },
  rating: { color: '#F59E0B', fontSize: 12, fontWeight: '900' },
  ratingLarge: { marginTop: 20, color: '#F59E0B', fontSize: 26, letterSpacing: 2, fontWeight: '900' },
  bigMetric: { marginTop: 40, color: '#0F172A', fontSize: 42, fontWeight: '900' },
  builderHero: { minHeight: 174, borderRadius: 0, padding: 26, flexDirection: 'row', alignItems: 'center', gap: 18 },
  builderIcon: { width: 76, height: 76, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  builderIconText: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  builderCopy: { flex: 1, maxWidth: 420 },
  builderTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  builderSubtitle: { marginTop: 7, color: '#FFFFFF', fontSize: 13, lineHeight: 20, fontWeight: '700' },
  builderMetric: { width: 150, minHeight: 92, padding: 14, borderRadius: 15, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  builderMetricValue: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  builderMetricLabel: { marginTop: 5, color: '#FFFFFF', fontSize: 12, lineHeight: 16, fontWeight: '800' },
  builderActions: { width: 190, gap: 12 },
  builderTabs: { paddingHorizontal: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 80, borderBottomWidth: 1, borderBottomColor: '#E7EAF3' },
  builderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  toolbox: { flexBasis: 250 },
  formBuilder: { flexBasis: 640 },
  previewPanel: { flexBasis: 590, flexDirection: 'row', gap: 18 },
  fieldTypeRow: { minHeight: 40, marginBottom: 8, paddingHorizontal: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  fieldTypeIcon: { color: '#6D5DFB', fontSize: 16, fontWeight: '900' },
  fieldTypeText: { flex: 1, color: '#0F172A', fontSize: 12, fontWeight: '900' },
  moreDots: { color: '#98A2B3', fontSize: 16, fontWeight: '900' },
  builderField: { minHeight: 68, marginBottom: 12, paddingHorizontal: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  dragHandle: { color: '#98A2B3', fontSize: 15, fontWeight: '900' },
  fieldIconBox: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0ECFF' },
  builderFieldTitle: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  builderFieldMeta: { marginTop: 3, color: '#667085', fontSize: 11, fontWeight: '700' },
  localeText: { color: '#667085', fontSize: 11, fontWeight: '800' },
  phonePreview: { width: 260, padding: 16, borderRadius: 34, backgroundColor: '#FFFFFF', borderWidth: 8, borderColor: '#0F172A' },
  phoneNotch: { alignSelf: 'center', width: 92, height: 20, borderRadius: 12, backgroundColor: '#0F172A', marginTop: -8 },
  phoneBrand: { marginTop: 16, color: '#0F172A', fontSize: 14, fontWeight: '900' },
  phoneTitle: { marginTop: 12, color: '#0F172A', fontSize: 16, fontWeight: '900' },
  phoneInput: { marginTop: 10 },
  phoneLabel: { color: '#0F172A', fontSize: 10, fontWeight: '900' },
  phonePlaceholder: { marginTop: 4, minHeight: 28, paddingHorizontal: 8, borderRadius: 7, color: '#98A2B3', borderWidth: 1, borderColor: '#E7EAF3', fontSize: 10, lineHeight: 26, fontWeight: '700' },
  phoneButton: { marginTop: 12, minHeight: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  phoneButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  fieldSettings: { flex: 1, minWidth: 210, padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  settingsTitle: { marginBottom: 14, color: '#0F172A', fontSize: 16, fontWeight: '900' },
  telegramGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  telegramPhone: { alignSelf: 'center', width: 280, height: 360, padding: 24, borderRadius: 32, backgroundColor: '#CFEAD0', borderWidth: 8, borderColor: '#0F172A', justifyContent: 'center' },
  telegramBubble: { padding: 16, borderRadius: 12, color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: 13, lineHeight: 20, fontWeight: '800' },
  channelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  channelCard: { flexGrow: 1, flexBasis: 210, minHeight: 120, padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7EAF3' },
  channelIcon: { color: '#2F80ED', fontSize: 24, fontWeight: '900' },
  channelName: { marginTop: 8, color: '#0F172A', fontSize: 13, fontWeight: '900' },
  footer: { marginTop: 24, color: '#667085', fontSize: 12, textAlign: 'center', fontWeight: '800' },
  toast: { position: 'absolute', right: 28, bottom: 28, minHeight: 48, paddingHorizontal: 18, borderRadius: 14, justifyContent: 'center', backgroundColor: '#6D5DFB', shadowColor: '#6D5DFB', shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
