export type AppLanguage = 'ru' | 'hy' | 'en';

export type TranslationItem = {
  key: string;
  module: string;
  ru: string;
  en: string;
  hy: string;
  status: 'complete' | 'missing' | 'partial' | 'outdated';
  updatedAt: string;
};

const now = new Date().toISOString();

function item(key: string, module: string, en: string, ru = en, hy = en): TranslationItem {
  return {
    key,
    module,
    ru,
    en,
    hy,
    status: ru && en && hy ? 'complete' : 'missing',
    updatedAt: now,
  };
}

export const translationModules = [
  'splash',
  'onboarding',
  'location',
  'categories',
  'orders',
  'chat',
  'notifications',
  'wallet',
  'settings',
  'profile',
  'adminDashboard',
  'adminCategories',
  'adminLocations',
  'adminTranslations',
  'adminUsers',
  'adminVerification',
  'adminOrders',
  'adminFinance',
  'adminMarketing',
  'adminSupport',
  'adminTelegram',
  'adminLogs',
  'errors',
  'buttons',
  'labels',
  'placeholders',
  'emptyStates',
  'toasts',
] as const;

export const defaultTranslations: TranslationItem[] = [
  item('splash.tagline', 'splash', 'Services at your fingertips.', 'Сервисы у вас под рукой.', 'Ծառայությունները ձեր մատների տակ։'),
  item('splash.start', 'splash', 'Start Fixora', 'Начать Fixora', 'Սկսել Fixora'),
  item('onboarding.slide1.title', 'onboarding', 'Book premium local services.', 'Бронируйте премиальные локальные сервисы.', 'Ամրագրեք պրեմիում տեղական ծառայություններ։'),
  item('onboarding.slide1.subtitle', 'onboarding', 'Thousands of verified specialists are ready to help in your city.', 'Тысячи проверенных специалистов готовы помочь в вашем городе.', 'Հազարավոր ստուգված մասնագետներ պատրաստ են օգնել ձեր քաղաքում։'),
  item('onboarding.slide2.title', 'onboarding', 'Book services near you.', 'Заказывайте услуги рядом с вами.', 'Պատվիրեք ծառայություններ ձեր մոտակայքում։'),
  item('onboarding.slide2.subtitle', 'onboarding', 'Choose your city, compare professionals, and book safely.', 'Выберите город, сравните специалистов и бронируйте безопасно.', 'Ընտրեք քաղաքը, համեմատեք մասնագետներին և ամրագրեք անվտանգ։'),
  item('onboarding.slide3.title', 'onboarding', 'Work with verified experts.', 'Работайте с проверенными экспертами.', 'Աշխատեք ստուգված փորձագետների հետ։'),
  item('onboarding.slide3.subtitle', 'onboarding', 'Chat, call, pay securely, and track every order in real time.', 'Пишите, звоните, платите безопасно и отслеживайте каждый заказ.', 'Գրեք, զանգեք, վճարեք անվտանգ և հետևեք յուրաքանչյուր պատվերին։'),
  item('onboarding.skip', 'onboarding', 'Skip', 'Пропустить', 'Բաց թողնել'),
  item('location.smart.title.ready', 'location', 'Location detection', 'Определение локации', 'Տեղադրության որոշում'),
  item('location.smart.title.detected', 'location', 'Your location detected', 'Ваше местоположение найдено', 'Ձեր տեղադրությունը գտնվեց'),
  item('location.smart.subtitle.ready', 'location', 'Use GPS to set your local marketplace with real address details.', 'Используйте GPS, чтобы настроить локальный маркетплейс с реальным адресом.', 'Օգտագործեք GPS՝ տեղական շուկան իրական հասցեով կարգավորելու համար։'),
  item('location.smart.subtitle.detected', 'location', 'Fixora matched your local marketplace, language, currency, and exact coordinates.', 'Fixora подобрала локальный маркетплейс, язык, валюту и координаты.', 'Fixora-ն ընտրեց ձեր շուկան, լեզուն, արժույթը և կոորդինատները։'),
  item('location.manual.title', 'location', 'Where are you located?', 'Где вы находитесь?', 'Որտե՞ղ եք գտնվում։'),
  item('location.manual.country', 'location', 'Select your country to get started', 'Выберите страну, чтобы начать', 'Ընտրեք երկիրը՝ սկսելու համար'),
  item('categories.title', 'categories', 'Categories', 'Категории', 'Կատեգորիաներ'),
  item('categories.subtitle', 'categories', 'Explore local services, subcategories, popular bookings, and premium professionals by vertical.', 'Изучайте локальные услуги, подкатегории и популярных специалистов.', 'Ուսումնասիրեք տեղական ծառայությունները և մասնագետներին։'),
  item('orders.title', 'orders', 'Orders', 'Заказы', 'Պատվերներ'),
  item('chat.title', 'chat', 'Chat', 'Чат', 'Չատ'),
  item('notifications.title', 'notifications', 'Notifications', 'Уведомления', 'Ծանուցումներ'),
  item('wallet.title', 'wallet', 'Wallet', 'Кошелёк', 'Դրամապանակ'),
  item('settings.title', 'settings', 'Settings', 'Настройки', 'Կարգավորումներ'),
  item('profile.title', 'profile', 'Profile', 'Профиль', 'Պրոֆիլ'),
  item('adminDashboard.title', 'adminDashboard', 'Dashboard', 'Дашборд', 'Վահանակ'),
  item('adminCategories.title', 'adminCategories', 'Categories', 'Категории', 'Կատեգորիաներ'),
  item('adminLocations.title', 'adminLocations', 'Locations', 'Локации', 'Տեղադրություններ'),
  item('adminTranslations.title', 'adminTranslations', 'Translations', 'Переводы', 'Թարգմանություններ'),
  item('adminUsers.title', 'adminUsers', 'Users', 'Пользователи', 'Օգտատերեր'),
  item('adminVerification.title', 'adminVerification', 'Verification', 'Верификация', 'Վերիֆիկացիա'),
  item('adminOrders.title', 'adminOrders', 'Orders', 'Заказы', 'Պատվերներ'),
  item('adminFinance.title', 'adminFinance', 'Finance', 'Финансы', 'Ֆինանսներ'),
  item('adminMarketing.title', 'adminMarketing', 'Marketing', 'Маркетинг', 'Մարքեթինգ'),
  item('adminSupport.title', 'adminSupport', 'Support', 'Поддержка', 'Աջակցություն'),
  item('adminTelegram.title', 'adminTelegram', 'Telegram', 'Telegram', 'Telegram'),
  item('adminLogs.title', 'adminLogs', 'Logs', 'Логи', 'Լոգեր'),
  item('errors.authFailed', 'errors', 'Authentication failed.', 'Ошибка авторизации.', 'Նույնականացումը ձախողվեց։'),
  item('errors.required', 'errors', 'This field is required.', 'Это поле обязательно.', 'Այս դաշտը պարտադիր է։'),
  item('errors.passwordMismatch', 'errors', 'Passwords do not match.', 'Пароли не совпадают.', 'Գաղտնաբառերը չեն համընկնում։'),
  item('buttons.continue', 'buttons', 'Continue', 'Продолжить', 'Շարունակել'),
  item('buttons.next', 'buttons', 'Next', 'Далее', 'Հաջորդ'),
  item('buttons.getStarted', 'buttons', 'Get Started', 'Начать', 'Սկսել'),
  item('buttons.save', 'buttons', 'Save', 'Сохранить', 'Պահպանել'),
  item('buttons.reset', 'buttons', 'Reset', 'Сбросить', 'Վերակայել'),
  item('buttons.delete', 'buttons', 'Delete', 'Удалить', 'Ջնջել'),
  item('buttons.edit', 'buttons', 'Edit', 'Изменить', 'Խմբագրել'),
  item('buttons.back', 'buttons', 'Back', 'Назад', 'Հետ'),
  item('labels.language', 'labels', 'Language', 'Язык', 'Լեզու'),
  item('labels.status', 'labels', 'Status', 'Статус', 'Կարգավիճակ'),
  item('labels.module', 'labels', 'Module', 'Модуль', 'Մոդուլ'),
  item('placeholders.searchAdmin', 'placeholders', 'Search admin data...', 'Поиск по админ-данным...', 'Որոնել ադմին տվյալներում...'),
  item('placeholders.searchTranslations', 'placeholders', 'Search translation keys...', 'Поиск ключей переводов...', 'Որոնել թարգմանության բանալիներ...'),
  item('emptyStates.noResults', 'emptyStates', 'No results found', 'Ничего не найдено', 'Արդյունքներ չկան'),
  item('toasts.saved', 'toasts', 'Saved successfully', 'Успешно сохранено', 'Հաջողությամբ պահպանվեց'),
  item('toasts.reset', 'toasts', 'Reset successfully', 'Успешно сброшено', 'Հաջողությամբ վերակայվեց'),
  item('toasts.languageChanged', 'toasts', 'Language changed', 'Язык изменён', 'Լեզուն փոխվեց'),
];
