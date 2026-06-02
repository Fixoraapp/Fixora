import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { FixoraLogo } from '../components/FixoraLogo';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { SectionHeader } from '../components/SectionHeader';
import { TextField } from '../components/TextField';
import { colors } from '../constants/theme';
import { useAdminConfig } from '../context/AdminConfigContext';
import {
  ChatMessage,
  ClientWallet,
  MarketplaceNotification,
  MarketplaceOrder,
  MasterWallet,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  WalletTransaction,
  useMarketplace,
} from '../context/MarketplaceContext';
import { popularServices, professionals } from '../data/marketplace';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../i18n/I18nProvider';
import { Professional } from '../types/marketplace';
import { LocationSelection, UserRole } from '../types/navigation';

type ClientTab = 'home' | 'map' | 'orders' | 'chat' | 'wallet' | 'profile';
type MasterTab = 'dashboard' | 'map' | 'orders' | 'messages' | 'earnings' | 'profile';
type MasterOrderFilter = 'pending' | 'accepted' | 'in_progress' | 'completed';
type SortOption = 'recommended' | 'nearest' | 'topRated' | 'cheapest' | 'premium';
type FilterKey = 'budget' | 'topRated' | 'nearby' | 'availableNow' | 'verified' | 'premium' | 'experienced' | 'english' | 'cardPayment';

type HomeScreenProps = {
  location: LocationSelection;
  role: UserRole;
  onOpenCategories: () => void;
};

const tabItems: Array<{ id: ClientTab; label: string; icon: string }> = [
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'map', label: 'Map', icon: 'M' },
  { id: 'orders', label: 'Orders', icon: 'O' },
  { id: 'chat', label: 'Chat', icon: 'C' },
  { id: 'wallet', label: 'Wallet', icon: 'W' },
  { id: 'profile', label: 'Profile', icon: 'P' },
];

const masterTabs: Array<{ id: MasterTab; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D' },
  { id: 'map', label: 'Map', icon: 'M' },
  { id: 'orders', label: 'Orders', icon: 'O' },
  { id: 'messages', label: 'Messages', icon: 'M' },
  { id: 'earnings', label: 'Earnings', icon: 'E' },
  { id: 'profile', label: 'Profile', icon: 'P' },
];

const categoryVisuals = ['Repair', 'Cleaning', 'Auto', 'Beauty', 'IT', 'Health', 'Delivery', 'More'];
const mapCategories = ['All', 'Repair', 'Cleaning', 'IT', 'Beauty'];
const sortOptions: Array<{ id: SortOption; label: string }> = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'nearest', label: 'Nearest' },
  { id: 'topRated', label: 'Top rated' },
  { id: 'cheapest', label: 'Cheapest' },
  { id: 'premium', label: 'Premium' },
];
const filterOptions: Array<{ id: FilterKey; label: string }> = [
  { id: 'budget', label: 'Good price' },
  { id: 'topRated', label: '4.95+' },
  { id: 'nearby', label: '< 3 km' },
  { id: 'availableNow', label: 'Available now' },
  { id: 'verified', label: 'Verified' },
  { id: 'premium', label: 'Premium' },
  { id: 'experienced', label: '5+ yrs' },
  { id: 'english', label: 'English' },
  { id: 'cardPayment', label: 'Card pay' },
];
const cityOffsets = [
  { x: '18%', y: '32%', distance: '1.2 km', eta: '5 min' },
  { x: '62%', y: '24%', distance: '2.1 km', eta: '8 min' },
  { x: '42%', y: '58%', distance: '3.4 km', eta: '11 min' },
  { x: '74%', y: '66%', distance: '4.0 km', eta: '14 min' },
  { x: '28%', y: '72%', distance: '5.1 km', eta: '18 min' },
] as const;

function professionalMeta(pro: Professional) {
  const seed = pro.id.charCodeAt(pro.id.length - 1);
  const price = Number(pro.price.replace(/[^0-9.]/g, '')) || 50;

  return {
    distanceKm: Number((1 + (seed % 6) * 0.7).toFixed(1)),
    eta: `${5 + (seed % 5) * 3} min`,
    price,
    availableNow: seed % 2 === 0 || Boolean(pro.premium),
    experienceYears: 3 + (seed % 7),
    languages: seed % 2 === 0 ? ['English', 'Russian'] : ['English', 'Armenian'],
    payments: seed % 2 === 0 ? ['Card', 'Cash'] : ['Cash', 'Transfer'],
  };
}

function searchMatches(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

export default function HomeScreen({ location, role, onOpenCategories }: HomeScreenProps) {
  const { theme } = useTheme();
  const marketplace = useMarketplace();
  const [activeTab, setActiveTab] = useState<ClientTab>('home');
  const [masterTab, setMasterTab] = useState<MasterTab>('dashboard');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [clientChatOrderId, setClientChatOrderId] = useState<string | null>(null);
  const [masterChatOrderId, setMasterChatOrderId] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<MarketplaceOrder | null>(null);
  const premiumProfessionals = professionals.filter((item) => item.premium);
  const nearbyProfessionals = professionals.filter((item) => item.city === location.city).slice(0, 3);
  const nearby = nearbyProfessionals.length > 0 ? nearbyProfessionals : professionals.slice(0, 3);
  const roleLabel = role === 'client' ? 'Client' : 'Master';

  if (role === 'master') {
    return (
      <MasterSide
        location={location}
        activeTab={masterTab}
        orders={marketplace.orders}
        messages={marketplace.messages}
        notifications={marketplace.notifications}
        masterWallet={marketplace.masterWallet}
        activeChatOrderId={masterChatOrderId}
        onChangeTab={setMasterTab}
        onAccept={marketplace.acceptOrder}
        onDecline={marketplace.declineOrder}
        onStart={marketplace.startOrder}
        onComplete={marketplace.completeOrder}
        onRequestPayout={marketplace.requestPayout}
        onOpenChat={(orderId) => {
          setMasterChatOrderId(orderId);
          setMasterTab('messages');
        }}
        onBackChat={() => setMasterChatOrderId(null)}
        onSendMessage={(orderId, text, kind) => marketplace.sendMessage(orderId, 'master', text, kind)}
        onReadNotifications={() => marketplace.markNotificationsRead('master')}
      />
    );
  }

  const content = useMemo(() => {
    const clientChatOrder = marketplace.orders.find((item) => item.id === clientChatOrderId);

    if (selectedProfessional) {
      return (
        <ProfessionalProfileScreen
          pro={selectedProfessional}
          onBack={() => setSelectedProfessional(null)}
          onChat={() => {
            const existing = marketplace.orders.find((item) => item.masterName === selectedProfessional.name);
            if (existing) {
              setClientChatOrderId(existing.id);
              setSelectedProfessional(null);
              setActiveTab('chat');
            }
          }}
          onBook={() => {
            const order = marketplace.createOrder({
              masterName: selectedProfessional.name,
              serviceTitle: selectedProfessional.role,
              city: location.city,
              district: location.region,
              price: selectedProfessional.price,
            });
            setClientChatOrderId(order.id);
            setSelectedProfessional(null);
            setActiveTab('orders');
          }}
        />
      );
    }

    if (activeTab === 'map') {
      return (
        <MapScreen
          role="client"
          location={location}
          professionals={nearby}
          orders={marketplace.orders}
          onBookMaster={(pro) => {
            const order = marketplace.createOrder({
              masterName: pro.name,
              serviceTitle: pro.role,
              city: location.city,
              district: location.region,
              price: pro.price,
            });
            setClientChatOrderId(order.id);
            setActiveTab('orders');
          }}
          onAcceptOrder={marketplace.acceptOrder}
        />
      );
    }

    if (activeTab === 'orders') {
      return (
        <ClientOrdersScreen
          orders={marketplace.orders}
          onCancel={marketplace.cancelOrder}
          onReleasePayment={marketplace.releasePayment}
          onRefundPayment={marketplace.refundPayment}
          onMessage={(orderId) => {
            setClientChatOrderId(orderId);
            setActiveTab('chat');
          }}
          onReview={setReviewOrder}
        />
      );
    }

    if (activeTab === 'chat') {
      return clientChatOrder ? (
        <ChatConversationScreen
          role="client"
          order={clientChatOrder}
          messages={marketplace.messages.filter((item) => item.orderId === clientChatOrder.id)}
          onBack={() => setClientChatOrderId(null)}
          onSend={(text, kind) => marketplace.sendMessage(clientChatOrder.id, 'client', text, kind)}
        />
      ) : (
        <ChatListScreen
          role="client"
          orders={marketplace.orders}
          messages={marketplace.messages}
          onOpenChat={setClientChatOrderId}
        />
      );
    }

    if (activeTab === 'wallet') {
      return (
        <ClientWalletScreen
          wallet={marketplace.clientWallet}
          orders={marketplace.orders}
          onApplyPromo={marketplace.applyPromoCode}
          onReservePayment={marketplace.reservePayment}
          onRefundPayment={marketplace.refundPayment}
          onReleasePayment={marketplace.releasePayment}
        />
      );
    }

    if (activeTab === 'profile') {
      return (
        <ClientProfileTab
          location={location}
          roleLabel={roleLabel}
          notifications={marketplace.notifications}
          onReadNotifications={() => marketplace.markNotificationsRead('client')}
        />
      );
    }

    return (
      <MarketplaceHome
        location={location}
        roleLabel={roleLabel}
        nearby={nearby}
        premiumProfessionals={premiumProfessionals}
        onOpenCategories={onOpenCategories}
        onOpenProfessional={setSelectedProfessional}
      />
    );
  }, [activeTab, clientChatOrderId, location, marketplace, nearby, onOpenCategories, premiumProfessionals, roleLabel, selectedProfessional]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.gradients.appBackground}
        locations={[0, 0.42, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blueGlow, { backgroundColor: theme.colors.accent, opacity: theme.isDark ? 0.14 : 0.08 }]} />
      <View style={[styles.purpleGlow, { opacity: theme.isDark ? 0.14 : 0.07 }]} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
      {!selectedProfessional ? (
        <View style={styles.bottomShell}>
          <LinearGradient
            colors={theme.isDark ? ['rgba(9,14,34,0.96)', 'rgba(12,9,31,0.96)'] : ['rgba(255,255,255,0.96)', 'rgba(238,244,255,0.96)']}
            style={[styles.bottomNav, { borderColor: theme.colors.stroke }]}
          >
            {tabItems.map((item) => {
              const selected = activeTab === item.id;

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => setActiveTab(item.id)}
                  style={styles.tabButton}
                >
                  <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
                    <Text style={[styles.tabIconText, selected && styles.tabIconTextActive]}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </LinearGradient>
        </View>
      ) : null}
      {reviewOrder ? (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSubmit={(rating, text, photoAttached) => {
            marketplace.submitReview(reviewOrder.id, rating, text, photoAttached);
            setReviewOrder(null);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function MarketplaceHome({
  location,
  roleLabel,
  nearby,
  premiumProfessionals,
  onOpenCategories,
  onOpenProfessional,
}: {
  location: LocationSelection;
  roleLabel: string;
  nearby: Professional[];
  premiumProfessionals: Professional[];
  onOpenCategories: () => void;
  onOpenProfessional: (pro: Professional) => void;
}) {
  const adminConfig = useAdminConfig();
  const { t } = useTranslation();
  const adminCategories = useMemo(
    () => adminConfig.state.categories
      .filter((category) => category.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder),
    [adminConfig.state.categories],
  );
  const marketingBanners = adminConfig.state.marketingBanners.filter((banner) => banner.isActive);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('recommended');
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const categoryPool = ['All', ...adminCategories.slice(0, 7).map((category) => category.name_en || category.slug)];
  const searchedServices = popularServices.filter((service) =>
    !normalizedQuery
      ? false
      : searchMatches(service.title, normalizedQuery) || searchMatches(service.category, normalizedQuery),
  );
  const filteredProfessionals = professionals
    .filter((pro) => {
      const meta = professionalMeta(pro);
      const localMatch = pro.city === location.city || nearby.some((item) => item.id === pro.id);
      const queryMatch =
        !normalizedQuery ||
        searchMatches(pro.name, normalizedQuery) ||
        searchMatches(pro.role, normalizedQuery) ||
        searchMatches(pro.city, normalizedQuery) ||
        popularServices.some((service) => searchMatches(service.title, normalizedQuery) || searchMatches(service.category, normalizedQuery));
      const categoryMatch = selectedCategory === 'All' || searchMatches(pro.role, selectedCategory) || searchMatches(selectedCategory, pro.role);

      return (
        localMatch &&
        queryMatch &&
        categoryMatch &&
        (!activeFilters.includes('budget') || meta.price <= 75) &&
        (!activeFilters.includes('topRated') || pro.rating >= 4.95) &&
        (!activeFilters.includes('nearby') || meta.distanceKm <= 3) &&
        (!activeFilters.includes('availableNow') || meta.availableNow) &&
        (!activeFilters.includes('verified') || Boolean(pro.verified)) &&
        (!activeFilters.includes('premium') || Boolean(pro.premium)) &&
        (!activeFilters.includes('experienced') || meta.experienceYears >= 5) &&
        (!activeFilters.includes('english') || meta.languages.includes('English')) &&
        (!activeFilters.includes('cardPayment') || meta.payments.includes('Card'))
      );
    })
    .sort((left, right) => {
      const leftMeta = professionalMeta(left);
      const rightMeta = professionalMeta(right);

      if (sort === 'nearest') {
        return leftMeta.distanceKm - rightMeta.distanceKm;
      }
      if (sort === 'topRated') {
        return right.rating - left.rating;
      }
      if (sort === 'cheapest') {
        return leftMeta.price - rightMeta.price;
      }
      if (sort === 'premium') {
        return Number(Boolean(right.premium)) - Number(Boolean(left.premium));
      }

      return Number(Boolean(right.verified)) - Number(Boolean(left.verified)) || right.rating - left.rating;
    });
  const hasSearchMode = normalizedQuery.length > 0 || selectedCategory !== 'All' || activeFilters.length > 0 || sort !== 'recommended';
  const toggleFilter = (filter: FilterKey) =>
    setActiveFilters((items) => (items.includes(filter) ? items.filter((item) => item !== filter) : [...items, filter]));

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.locationText}>{location.city}, {location.countryCode}</Text>
          <FixoraLogo wordmark />
        </View>
        <View style={styles.headerActions}>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
          <View style={styles.bell}>
            <Text style={styles.bellText}>N</Text>
          </View>
        </View>
      </View>

      <TextField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search services, masters, companies, categories..."
        style={styles.search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.searchChipRow}>
        {categoryPool.map((category) => {
          const selected = selectedCategory === category;

          return (
            <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.searchChip, selected && styles.searchChipActive]}>
              <Text style={[styles.searchChipText, selected && styles.searchChipTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.filterPanel}>
        <Text style={styles.filterPanelTitle}>Smart filters</Text>
        <View style={styles.filterGrid}>
          {filterOptions.map((filter) => {
            const selected = activeFilters.includes(filter.id);

            return (
              <Pressable key={filter.id} onPress={() => toggleFilter(filter.id)} style={[styles.filterPill, selected && styles.filterPillActive]}>
                <Text style={[styles.filterPillText, selected && styles.filterPillTextActive]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {sortOptions.map((option) => {
            const selected = sort === option.id;

            return (
              <Pressable key={option.id} onPress={() => setSort(option.id)} style={[styles.sortPill, selected && styles.sortPillActive]}>
                <Text style={[styles.sortPillText, selected && styles.sortPillTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {adminConfig.state.appSettings.maintenanceMode ? (
        <GlassCard style={styles.adminNotice}>
          <Text style={styles.adminNoticeTitle}>Maintenance mode</Text>
          <Text style={styles.adminNoticeText}>Some marketplace actions may be limited by admin settings.</Text>
        </GlassCard>
      ) : null}

      {hasSearchMode ? (
        <SearchResultsBlock
          query={searchQuery}
          city={location.city}
          professionals={filteredProfessionals}
          services={searchedServices}
          onOpenProfessional={onOpenProfessional}
        />
      ) : null}

      <LinearGradient
        colors={['rgba(21,123,255,0.92)', 'rgba(45,64,190,0.68)', 'rgba(124,58,237,0.64)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>{t('clientHome.hero.title', 'Find the best specialists near you')}</Text>
          <Text style={styles.heroText}>{t('clientHome.hero.subtitle', 'Fast booking, verified reviews, secure payments, local pricing.')}</Text>
          <Pressable onPress={onOpenCategories} style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Find a master</Text>
          </Pressable>
        </View>
        <View style={styles.heroPerson}>
          <Text style={styles.heroPersonText}>PRO</Text>
        </View>
      </LinearGradient>

      {marketingBanners.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {marketingBanners.map((banner) => (
            <LinearGradient key={banner.id} colors={['rgba(249,215,126,0.2)', 'rgba(21,123,255,0.14)']} style={styles.marketingBanner}>
              <Text style={styles.marketingBannerTitle}>{banner.title_en}</Text>
              <Text style={styles.marketingBannerMeta}>{banner.target} / {banner.startDate} - {banner.endDate}</Text>
            </LinearGradient>
          ))}
        </ScrollView>
      ) : null}

      <SectionHeader title={t('clientHome.categories', 'Service categories')} action="All" />
      <View style={styles.categoryGrid}>
        {[...adminCategories.slice(0, 7), { id: 'more', name_en: 'More', icon: 'MO', color: '#7C3AED' }].map((item, index) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={index === Math.min(adminCategories.length, 7) ? onOpenCategories : undefined}
            style={styles.categoryCard}
          >
            <LinearGradient colors={[`${item.color ?? '#157BFF'}33`, 'rgba(168,85,247,0.12)']} style={styles.categoryIcon}>
              <Text style={styles.categoryIconText}>{item.icon ?? item.name_en.slice(0, 2).toUpperCase()}</Text>
            </LinearGradient>
            <Text style={styles.categoryLabel}>{item.name_en}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title={t('clientHome.popularServices', 'Popular services')} action="All" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {popularServices.map((service, index) => (
          <Pressable key={service.id} style={styles.serviceCard}>
            <LinearGradient
              colors={index % 2 === 0 ? ['rgba(255,255,255,0.12)', 'rgba(21,123,255,0.16)'] : ['rgba(255,255,255,0.1)', 'rgba(168,85,247,0.14)']}
              style={styles.serviceImage}
            >
              <Text style={styles.serviceImageText}>{service.category.slice(0, 2).toUpperCase()}</Text>
            </LinearGradient>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.servicePrice}>{service.price}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeader title={t('clientHome.bestNearby', 'Best masters nearby')} />
      <View style={styles.list}>
        {nearby.map((pro) => (
          <ProfessionalCard key={pro.id} pro={pro} onPress={() => onOpenProfessional(pro)} />
        ))}
      </View>

      <SectionHeader title="Premium professionals" />
      <View style={styles.premiumBlock}>
        <Text style={styles.premiumTitle}>Elite experts for high-trust work</Text>
        <Text style={styles.premiumBody}>Verified premium masters, concierge teams, and VIP-ready specialists.</Text>
        <View style={styles.list}>
          {premiumProfessionals.map((pro) => (
            <ProfessionalCard key={`premium-${pro.id}`} pro={pro} onPress={() => onOpenProfessional(pro)} premium />
          ))}
        </View>
      </View>
    </>
  );
}

function MasterSide({
  location,
  activeTab,
  orders,
  messages,
  notifications,
  masterWallet,
  activeChatOrderId,
  onChangeTab,
  onAccept,
  onDecline,
  onStart,
  onComplete,
  onRequestPayout,
  onOpenChat,
  onBackChat,
  onSendMessage,
  onReadNotifications,
}: {
  location: LocationSelection;
  activeTab: MasterTab;
  orders: MarketplaceOrder[];
  messages: ChatMessage[];
  notifications: MarketplaceNotification[];
  masterWallet: MasterWallet;
  activeChatOrderId: string | null;
  onChangeTab: (tab: MasterTab) => void;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  onStart: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onRequestPayout: () => void;
  onOpenChat: (orderId: string) => void;
  onBackChat: () => void;
  onSendMessage: (orderId: string, text: string, kind?: 'text' | 'image' | 'voice') => void;
  onReadNotifications: () => void;
}) {
  const { theme } = useTheme();
  const content = useMemo(() => {
    const activeChatOrder = orders.find((item) => item.id === activeChatOrderId);

    if (activeTab === 'map') {
      return (
        <MapScreen
          role="master"
          location={location}
          professionals={[]}
          orders={orders}
          onBookMaster={() => undefined}
          onAcceptOrder={onAccept}
        />
      );
    }

    if (activeTab === 'orders') {
      return (
        <MasterOrdersScreen
          orders={orders}
          onAccept={onAccept}
          onDecline={onDecline}
          onStart={onStart}
          onComplete={onComplete}
          onOpenChat={onOpenChat}
        />
      );
    }

    if (activeTab === 'messages') {
      return activeChatOrder ? (
        <ChatConversationScreen
          role="master"
          order={activeChatOrder}
          messages={messages.filter((item) => item.orderId === activeChatOrder.id)}
          onBack={onBackChat}
          onSend={(text, kind) => onSendMessage(activeChatOrder.id, text, kind)}
        />
      ) : (
        <ChatListScreen role="master" orders={orders} messages={messages} onOpenChat={onOpenChat} />
      );
    }

    if (activeTab === 'earnings') {
      return <MasterWalletScreen wallet={masterWallet} orders={orders} onRequestPayout={onRequestPayout} />;
    }

    if (activeTab === 'profile') {
      return <MasterProfileScreen location={location} />;
    }

    return (
      <MasterDashboardScreen
        location={location}
        orders={orders}
        notifications={notifications}
        onOpenOrders={() => onChangeTab('orders')}
        onAccept={onAccept}
        onDecline={onDecline}
        onStart={onStart}
        onComplete={onComplete}
        onOpenChat={onOpenChat}
        onReadNotifications={onReadNotifications}
      />
    );
  }, [activeChatOrderId, activeTab, location, masterWallet, messages, notifications, onAccept, onBackChat, onChangeTab, onComplete, onDecline, onOpenChat, onReadNotifications, onRequestPayout, onSendMessage, onStart, orders]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.gradients.appBackground}
        locations={[0, 0.42, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blueGlow, { backgroundColor: theme.colors.accent, opacity: theme.isDark ? 0.14 : 0.08 }]} />
      <View style={[styles.masterPurpleGlow, { opacity: theme.isDark ? 0.14 : 0.07 }]} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
      <View style={styles.bottomShell}>
        <LinearGradient
          colors={theme.isDark ? ['rgba(9,14,34,0.96)', 'rgba(12,9,31,0.96)'] : ['rgba(255,255,255,0.96)', 'rgba(238,244,255,0.96)']}
          style={[styles.bottomNav, { borderColor: theme.colors.stroke }]}
        >
          {masterTabs.map((item) => {
            const selected = activeTab === item.id;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => onChangeTab(item.id)}
                style={styles.tabButton}
              >
                <View style={[styles.tabIcon, selected && styles.masterTabIconActive]}>
                  <Text style={[styles.tabIconText, selected && styles.tabIconTextActive]}>{item.icon}</Text>
                </View>
                <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

function MasterDashboardScreen({
  location,
  orders,
  notifications,
  onOpenOrders,
  onAccept,
  onDecline,
  onStart,
  onComplete,
  onOpenChat,
  onReadNotifications,
}: {
  location: LocationSelection;
  orders: MarketplaceOrder[];
  notifications: MarketplaceNotification[];
  onOpenOrders: () => void;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  onStart: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onOpenChat: (orderId: string) => void;
  onReadNotifications: () => void;
}) {
  const newOrders = orders.filter((item) => item.status === 'pending');
  const activeOrders = orders.filter((item) => item.status === 'accepted' || item.status === 'master_on_way' || item.status === 'in_progress');

  return (
    <>
      <View style={styles.masterHeader}>
        <View style={styles.menuButton}><Text style={styles.menuText}>M</Text></View>
        <View style={styles.flex}>
          <Text style={styles.masterGreeting}>Hello, Master</Text>
          <Text style={styles.masterLocation}>{location.city}, {location.region}</Text>
        </View>
        <View style={styles.bell}><Text style={styles.bellText}>N</Text></View>
      </View>

      <GlassCard style={styles.completionCard}>
        <View style={styles.sectionHeaderMini}>
          <Text style={styles.masterCardTitle}>Profile is 85% complete</Text>
          <Text style={styles.sectionAction}>Finish</Text>
        </View>
        <Text style={styles.masterCardBody}>Complete your profile to receive more premium orders.</Text>
        <View style={styles.masterProgressTrack}>
          <View style={styles.masterProgressFill} />
        </View>
      </GlassCard>

      <LinearGradient colors={['rgba(21,123,255,0.26)', 'rgba(124,58,237,0.22)']} style={styles.incomeCard}>
        <View style={styles.incomeTop}>
          <View>
            <Text style={styles.incomeLabel}>Today income</Text>
            <Text style={styles.incomeValue}>32,500 AMD</Text>
            <Text style={styles.incomeDelta}>+12% since yesterday</Text>
          </View>
          <View style={styles.moneyOrb}><Text style={styles.moneyText}>$</Text></View>
        </View>
        <View style={styles.chart}>
          {[18, 24, 22, 34, 28, 48, 30, 57, 38, 52, 44, 62].map((height, index) => (
            <View key={index} style={[styles.chartBar, { height }]} />
          ))}
        </View>
      </LinearGradient>

      <View style={styles.masterStatsGrid}>
        <MasterMetric title="Today orders" value="5" tone="blue" />
        <MasterMetric title="Active orders" value={String(activeOrders.length)} tone="blue" />
        <MasterMetric title="Rating" value="4.9" tone="gold" />
        <MasterMetric title="Reviews" value="128" tone="purple" />
      </View>

      <SectionHeader title="New requests" action="All" />
      <View style={styles.list}>
        {newOrders.slice(0, 2).map((order) => (
          <MasterOrderCard
            key={order.id}
            order={order}
            onAccept={onAccept}
            onDecline={onDecline}
            onStart={onStart}
            onComplete={onComplete}
            onOpenChat={onOpenChat}
          />
        ))}
      </View>

      <SectionHeader title="Active orders" action="All" />
      <View style={styles.list}>
        {activeOrders.length > 0 ? (
          activeOrders.map((order) => (
            <MasterActiveOrderCard key={order.id} order={order} onOpenChat={onOpenChat} onStart={onStart} onComplete={onComplete} />
          ))
        ) : (
          <GlassCard style={styles.emptyMasterCard}>
            <Text style={styles.masterCardTitle}>No active orders yet</Text>
            <Text style={styles.masterCardBody}>Accept a new request to start tracking active work.</Text>
            <GradientButton title="Open orders" onPress={onOpenOrders} style={styles.utilityButton} />
          </GlassCard>
        )}
      </View>
      <NotificationCenter role="master" notifications={notifications} onRead={onReadNotifications} />
    </>
  );
}

function MasterOrdersScreen({
  orders,
  onAccept,
  onDecline,
  onStart,
  onComplete,
  onOpenChat,
}: {
  orders: MarketplaceOrder[];
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  onStart: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onOpenChat: (orderId: string) => void;
}) {
  const [filter, setFilter] = useState<MasterOrderFilter>('pending');
  const filteredOrders = orders.filter((item) =>
    filter === 'in_progress' ? item.status === 'in_progress' || item.status === 'master_on_way' : item.status === filter,
  );
  const filters: Array<{ id: MasterOrderFilter; label: string }> = [
    { id: 'pending', label: 'New' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <>
      <View style={styles.profileHeaderBar}>
        <Text style={styles.profileNavTitle}>My orders</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.masterFilterRow}>
        {filters.map((item) => {
          const selected = filter === item.id;

          return (
            <Pressable key={item.id} onPress={() => setFilter(item.id)} style={[styles.masterFilter, selected && styles.masterFilterActive]}>
              <Text style={[styles.masterFilterText, selected && styles.masterFilterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.list}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <MasterOrderCard
              key={order.id}
              order={order}
              onAccept={onAccept}
              onDecline={onDecline}
              onStart={onStart}
              onComplete={onComplete}
              onOpenChat={onOpenChat}
            />
          ))
        ) : (
          <GlassCard style={styles.emptyMasterCard}>
            <Text style={styles.masterCardTitle}>No orders here</Text>
            <Text style={styles.masterCardBody}>This tab will fill automatically when orders move into this status.</Text>
          </GlassCard>
        )}
      </View>
    </>
  );
}

function MasterOrderCard({
  order,
  onAccept,
  onDecline,
  onStart,
  onComplete,
  onOpenChat,
}: {
  order: MarketplaceOrder;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  onStart: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onOpenChat: (orderId: string) => void;
}) {
  return (
    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(124,58,237,0.08)']} style={styles.masterOrderCard}>
      <View style={styles.orderTop}>
        <View style={styles.orderAvatar}><Text style={styles.orderAvatarText}>{order.clientName.slice(0, 1)}</Text></View>
        <View style={styles.flex}>
          <Text style={styles.orderTitle}>{order.serviceTitle}</Text>
          <Text style={styles.orderMeta}>{order.city}, {order.district}</Text>
          <Text style={styles.orderPrice}>{order.price}</Text>
          <Text style={styles.orderMeta}>{order.time}</Text>
        </View>
        <View>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{statusLabel(order.status)}</Text></View>
          <PaymentBadge order={order} />
          <Text style={styles.distanceText}>{order.distance}</Text>
        </View>
      </View>
      <OrderStatusTimeline status={order.status} />
      {order.status === 'pending' ? (
        <View style={styles.orderActions}>
          <Pressable style={styles.declineButton} onPress={() => onDecline(order.id)}>
            <Text style={styles.declineText}>Decline</Text>
          </Pressable>
          <Pressable style={styles.acceptButton} onPress={() => onAccept(order.id)}>
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>
        </View>
      ) : null}
      {order.status === 'accepted' ? (
        <View style={styles.orderActions}>
          <Pressable style={styles.declineButton} onPress={() => onOpenChat(order.id)}>
            <Text style={styles.declineText}>Message</Text>
          </Pressable>
          <Pressable style={styles.acceptButton} onPress={() => onStart(order.id)}>
            <Text style={styles.acceptText}>Start work</Text>
          </Pressable>
        </View>
      ) : null}
      {order.status === 'master_on_way' || order.status === 'in_progress' ? (
        <View style={styles.orderActions}>
          <Pressable style={styles.declineButton} onPress={() => onOpenChat(order.id)}>
            <Text style={styles.declineText}>Message</Text>
          </Pressable>
          <Pressable style={styles.acceptButton} onPress={() => onComplete(order.id)}>
            <Text style={styles.acceptText}>Complete</Text>
          </Pressable>
        </View>
      ) : null}
    </LinearGradient>
  );
}

function MasterActiveOrderCard({
  order,
  onOpenChat,
  onStart,
  onComplete,
}: {
  order: MarketplaceOrder;
  onOpenChat: (orderId: string) => void;
  onStart: (orderId: string) => void;
  onComplete: (orderId: string) => void;
}) {
  return (
    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(21,123,255,0.1)']} style={styles.masterOrderCard}>
      <View style={styles.orderTop}>
        <View style={styles.orderAvatar}><Text style={styles.orderAvatarText}>{order.clientName.slice(0, 1)}</Text></View>
        <View style={styles.flex}>
          <Text style={styles.orderTitle}>{order.serviceTitle}</Text>
          <Text style={styles.orderMeta}>{order.city}, {order.district}</Text>
          <Text style={styles.orderPrice}>{order.price}</Text>
        </View>
        <View>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{statusLabel(order.status)}</Text></View>
          <PaymentBadge order={order} />
        </View>
      </View>
      <OrderStatusTimeline status={order.status} />
      <View style={styles.orderActions}>
        <Pressable style={styles.declineButton} onPress={() => onOpenChat(order.id)}>
          <Text style={styles.declineText}>Message</Text>
        </Pressable>
        <Pressable style={styles.acceptButton} onPress={() => (order.status === 'accepted' ? onStart(order.id) : onComplete(order.id))}>
          <Text style={styles.acceptText}>{order.status === 'accepted' ? 'Start work' : 'Complete'}</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function MasterMetric({ title, value, tone }: { title: string; value: string; tone: 'blue' | 'purple' | 'gold' }) {
  const backgroundColor =
    tone === 'blue' ? 'rgba(21,123,255,0.16)' : tone === 'purple' ? 'rgba(168,85,247,0.16)' : 'rgba(249,215,126,0.16)';

  return (
    <View style={[styles.masterMetric, { backgroundColor }]}>
      <Text style={styles.masterMetricTitle}>{title}</Text>
      <Text style={styles.masterMetricValue}>{value}</Text>
    </View>
  );
}

function MasterUtilityScreen({ title, subtitle, action }: { title: string; subtitle: string; action: string }) {
  return (
    <>
      <Text style={styles.utilityTitle}>{title}</Text>
      <Text style={styles.utilitySubtitle}>{subtitle}</Text>
      <GlassCard style={styles.utilityCard}>
        <LinearGradient colors={['rgba(21,123,255,0.2)', 'rgba(168,85,247,0.16)']} style={styles.utilityVisual}>
          <Text style={styles.utilityVisualText}>{title.toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.sectionBody}>Master workspace is ready for live data, client chat, payout analytics, and profile growth tools.</Text>
        <GradientButton title={action} onPress={() => undefined} style={styles.utilityButton} />
      </GlassCard>
    </>
  );
}

function ClientWalletScreen({
  wallet,
  orders,
  onApplyPromo,
  onReservePayment,
  onRefundPayment,
  onReleasePayment,
}: {
  wallet: ClientWallet;
  orders: MarketplaceOrder[];
  onApplyPromo: (code: string) => void;
  onReservePayment: (orderId: string) => void;
  onRefundPayment: (orderId: string) => void;
  onReleasePayment: (orderId: string) => void;
}) {
  const [promoCode, setPromoCode] = useState('');
  const availableMethods = wallet.paymentMethods.filter((method) => {
    if (method.type === 'apple_pay') {
      return Platform.OS === 'ios';
    }
    if (method.type === 'google_pay') {
      return Platform.OS === 'android';
    }

    return true;
  });
  const actionableOrder = orders.find((order) => order.paymentStatus === 'unpaid' || order.paymentStatus === 'reserved');

  return (
    <>
      <Text style={styles.utilityTitle}>Fixora Wallet</Text>
      <Text style={styles.utilitySubtitle}>Secure balance, saved cards, promo rewards, and deal protection.</Text>
      <LinearGradient colors={['rgba(21,123,255,0.92)', 'rgba(85,56,255,0.82)', 'rgba(168,85,247,0.72)']} style={styles.walletHero}>
        <View>
          <Text style={styles.walletEyebrow}>Available balance</Text>
          <Text style={styles.walletBalance}>{formatAmd(wallet.balance)}</Text>
          <Text style={styles.walletSubline}>{formatAmd(wallet.cashback)} cashback ready</Text>
        </View>
        <View style={styles.secureBadge}>
          <Text style={styles.secureBadgeText}>SECURE DEAL</Text>
        </View>
      </LinearGradient>

      <View style={styles.walletStatsRow}>
        <WalletStat label="Saved cards" value={String(wallet.savedCards.length)} />
        <WalletStat label="Promo codes" value={String(wallet.promoCodes.length)} />
        <WalletStat label="Reserved" value={String(orders.filter((order) => order.paymentStatus === 'reserved').length)} />
      </View>

      <WalletSection title="Payment methods">
        <View style={styles.paymentGrid}>
          {availableMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </View>
      </WalletSection>

      <WalletSection title="Promo codes">
        <View style={styles.promoRow}>
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Enter code"
            placeholderTextColor="#69748F"
            style={styles.promoInput}
          />
          <Pressable
            style={styles.promoButton}
            onPress={() => {
              onApplyPromo(promoCode);
              setPromoCode('');
            }}
          >
            <Text style={styles.acceptText}>Apply</Text>
          </Pressable>
        </View>
        <View style={styles.promoList}>
          {wallet.promoCodes.map((code) => (
            <View key={code} style={styles.promoPill}><Text style={styles.promoPillText}>{code}</Text></View>
          ))}
        </View>
      </WalletSection>

      <WalletSection title="Secure deal controls">
        <Text style={styles.sectionBody}>Mock reserve, release, and refund actions are wired for backend replacement.</Text>
        <View style={styles.orderActions}>
          <Pressable style={styles.declineButton} onPress={() => actionableOrder ? onRefundPayment(actionableOrder.id) : undefined}>
            <Text style={styles.declineText}>Refund</Text>
          </Pressable>
          <Pressable style={styles.declineButton} onPress={() => actionableOrder ? onReservePayment(actionableOrder.id) : undefined}>
            <Text style={styles.declineText}>Reserve</Text>
          </Pressable>
          <Pressable style={styles.acceptButton} onPress={() => actionableOrder ? onReleasePayment(actionableOrder.id) : undefined}>
            <Text style={styles.acceptText}>Release</Text>
          </Pressable>
        </View>
      </WalletSection>

      <WalletSection title="Transactions">
        <View style={styles.list}>
          {wallet.transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>
      </WalletSection>
    </>
  );
}

function MasterWalletScreen({ wallet, orders, onRequestPayout }: { wallet: MasterWallet; orders: MarketplaceOrder[]; onRequestPayout: () => void }) {
  const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');

  return (
    <>
      <Text style={styles.utilityTitle}>Master Wallet</Text>
      <Text style={styles.utilitySubtitle}>Earnings balance, commissions, and payout requests for completed secure deals.</Text>
      <LinearGradient colors={['rgba(168,85,247,0.9)', 'rgba(85,56,255,0.78)', 'rgba(21,123,255,0.64)']} style={styles.walletHero}>
        <View>
          <Text style={styles.walletEyebrow}>Earnings balance</Text>
          <Text style={styles.walletBalance}>{formatAmd(wallet.earningsBalance)}</Text>
          <Text style={styles.walletSubline}>{Math.round(wallet.commissionRate * 100)}% Fixora commission</Text>
        </View>
        <Pressable style={styles.secureBadge} onPress={onRequestPayout}>
          <Text style={styles.secureBadgeText}>PAYOUT</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.walletStatsRow}>
        <WalletStat label="Pending payouts" value={formatAmd(wallet.pendingPayouts)} />
        <WalletStat label="Completed payouts" value={formatAmd(wallet.completedPayouts)} />
        <WalletStat label="Paid orders" value={String(paidOrders.length)} />
      </View>

      <WalletSection title="Payouts">
        <GradientButton title="Request payout" onPress={onRequestPayout} style={styles.utilityButton} />
      </WalletSection>

      <WalletSection title="Transactions">
        <View style={styles.list}>
          {wallet.transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>
      </WalletSection>
    </>
  );
}

function MasterProfileScreen({ location }: { location: LocationSelection }) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={styles.utilityTitle}>{t('profile.title', 'Profile')}</Text>
      <Text style={styles.utilitySubtitle}>Grow profile rating, services, reviews, and local visibility.</Text>
      <GlassCard style={styles.profileCard}>
        <View style={styles.clientAvatar}><Text style={styles.clientAvatarText}>M</Text></View>
        <Text style={styles.profileName}>Arman Master</Text>
        <Text style={styles.profileRole}>Electrical services / {location.city}</Text>
        <View style={styles.profileRows}>
          <ProfileRow label="Rating" value="4.9" />
          <ProfileRow label="Reviews" value="128" />
          <ProfileRow label="Profile completion" value="85%" />
          <ProfileRow label="Local marketplace" value={location.region} />
        </View>
      </GlassCard>
      <GlassCard style={styles.profileCard}>
        <LanguageSwitcher />
      </GlassCard>
      <AppearanceSettings />
    </>
  );
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    pending: 'New',
    accepted: 'Accepted',
    master_on_way: 'On way',
    in_progress: 'In progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return labels[status];
}

function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    unpaid: 'Unpaid',
    reserved: 'Reserved',
    paid: 'Paid',
    refunded: 'Refunded',
    failed: 'Failed',
  };

  return labels[status];
}

function ProfessionalProfileScreen({
  pro,
  onBack,
  onChat,
  onBook,
}: {
  pro: Professional;
  onBack: () => void;
  onChat: () => void;
  onBook: () => void;
}) {
  const services = [
    { title: 'Consultation and diagnostics', price: pro.price },
    { title: 'Priority booking', price: 'from $35' },
    { title: 'Full service package', price: 'custom quote' },
  ];

  return (
    <>
      <View style={styles.profileHeaderBar}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.profileNavTitle}>Professional profile</Text>
        <View style={styles.heartButton}><Text style={styles.heartText}>H</Text></View>
      </View>

      <LinearGradient colors={['rgba(21,123,255,0.2)', 'rgba(124,58,237,0.16)']} style={styles.profileHero}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{pro.name.slice(0, 1)}</Text>
          {pro.verified ? <View style={styles.verifiedDot}><Text style={styles.verifiedText}>OK</Text></View> : null}
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.profileNameRow}>
            <Text style={styles.profileName}>{pro.name}</Text>
            {pro.verified ? <Text style={styles.verifiedBadge}>Verified</Text> : null}
          </View>
          <Text style={styles.profileRole}>{pro.role}</Text>
          <Text style={styles.profileMeta}>{pro.rating.toFixed(2)} rating / 1.2 km away</Text>
          <View style={styles.badgeRow}>
            <View style={styles.blueBadge}><Text style={styles.badgeText}>Checked</Text></View>
            {pro.premium ? <View style={styles.goldBadge}><Text style={styles.goldBadgeText}>Premium</Text></View> : null}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatBox value="128" label="Orders" />
        <StatBox value="4 yrs" label="Experience" />
        <StatBox value="98%" label="Rating" />
        <StatBox value="20 min" label="Reply" />
      </View>

      <GlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionBody}>
          Premium verified professional focused on clean execution, transparent pricing, and secure local service delivery.
        </Text>
      </GlassCard>

      <GlassCard style={styles.sectionCard}>
        <View style={styles.sectionHeaderMini}>
          <Text style={styles.sectionTitle}>Services</Text>
          <Text style={styles.sectionAction}>See all</Text>
        </View>
        {services.map((service) => (
          <View key={service.title} style={styles.pricingRow}>
            <Text style={styles.pricingTitle}>{service.title}</Text>
            <Text style={styles.pricingPrice}>{service.price}</Text>
          </View>
        ))}
      </GlassCard>

      <View style={styles.profileActions}>
        <Pressable style={styles.secondaryAction} onPress={onChat}><Text style={styles.secondaryActionText}>Chat</Text></Pressable>
        <Pressable style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Call</Text></Pressable>
      </View>
      <GradientButton title="Book now" onPress={onBook} style={styles.bookButton} />
    </>
  );
}

function ProfessionalCard({
  pro,
  premium = false,
  compact = false,
  onPress,
}: {
  pro: Professional;
  premium?: boolean;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <LinearGradient
        colors={premium || pro.premium ? ['rgba(124,58,237,0.26)', 'rgba(21,123,255,0.12)'] : ['rgba(255,255,255,0.095)', 'rgba(255,255,255,0.045)']}
        style={[styles.proCard, compact && styles.proCardCompact]}
      >
        <View style={styles.proAvatar}>
          <Text style={styles.proAvatarText}>{pro.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.flex}>
          <View style={styles.proNameRow}>
            <Text style={styles.proName}>{pro.name}</Text>
            {pro.verified ? <Text style={styles.proCheck}>OK</Text> : null}
          </View>
          <Text style={styles.proRole}>{pro.role}</Text>
          <Text style={styles.proMeta}>{pro.rating.toFixed(2)} / {pro.city}</Text>
        </View>
        <Text style={styles.proPrice}>{pro.price}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SearchResultsBlock({
  query,
  city,
  professionals: results,
  services,
  onOpenProfessional,
}: {
  query: string;
  city: string;
  professionals: Professional[];
  services: typeof popularServices;
  onOpenProfessional: (pro: Professional) => void;
}) {
  return (
    <GlassCard style={styles.searchResultsPanel}>
      <View style={styles.sectionHeaderMini}>
        <View>
          <Text style={styles.sectionTitle}>Search results</Text>
          <Text style={styles.searchContext}>{query.trim() ? `"${query.trim()}" in ${city}` : `Filtered professionals in ${city}`}</Text>
        </View>
        <Text style={styles.sectionAction}>{results.length} found</Text>
      </View>
      {services.length > 0 ? (
        <View style={styles.serviceResultStrip}>
          {services.slice(0, 3).map((service) => (
            <View key={service.id} style={styles.serviceResultPill}>
              <Text style={styles.serviceResultTitle}>{service.title}</Text>
              <Text style={styles.serviceResultMeta}>{service.price}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.list}>
        {results.length > 0 ? (
          results.map((pro) => {
            const meta = professionalMeta(pro);

            return (
              <Pressable key={`search-${pro.id}`} onPress={() => onOpenProfessional(pro)} accessibilityRole="button">
                <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(21,123,255,0.08)']} style={styles.searchResultCard}>
                  <View style={styles.proAvatar}>
                    <Text style={styles.proAvatarText}>{pro.name.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.proNameRow}>
                      <Text style={styles.proName}>{pro.name}</Text>
                      {pro.verified ? <Text style={styles.proCheck}>Verified</Text> : null}
                    </View>
                    <Text style={styles.proRole}>{pro.role}</Text>
                    <Text style={styles.proMeta}>
                      {pro.rating.toFixed(2)} / {meta.distanceKm} km / {meta.eta} / {meta.experienceYears} yrs
                    </Text>
                    <Text style={styles.searchMetaLine}>{meta.languages.join(', ')} / {meta.payments.join(', ')}</Text>
                  </View>
                  <View style={styles.resultPriceColumn}>
                    <Text style={styles.proPrice}>{pro.price}</Text>
                    {meta.availableNow ? <Text style={styles.availableText}>Now</Text> : null}
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptySearchState}>
            <Text style={styles.masterCardTitle}>No exact matches</Text>
            <Text style={styles.masterCardBody}>Try clearing one filter or searching another service category.</Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
}

function MapScreen({
  role,
  location,
  professionals,
  orders,
  onBookMaster,
  onAcceptOrder,
}: {
  role: UserRole;
  location: LocationSelection;
  professionals: Professional[];
  orders: MarketplaceOrder[];
  onBookMaster: (pro: Professional) => void;
  onAcceptOrder: (orderId: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const cityOrders = orders.filter((order) => order.city === location.city);
  const localOrders = cityOrders.length > 0 ? cityOrders : orders.filter((order) => order.status === 'pending');
  const [selectedMasterId, setSelectedMasterId] = useState(professionals[0]?.id ?? '');
  const [selectedOrderId, setSelectedOrderId] = useState(localOrders[0]?.id ?? '');
  const selectedMaster = professionals.find((item) => item.id === selectedMasterId) ?? professionals[0];
  const selectedOrder = localOrders.find((item) => item.id === selectedOrderId) ?? localOrders[0];

  return (
    <>
      <View style={styles.mapHeader}>
        <View>
          <Text style={styles.locationText}>{location.city}, {location.region}</Text>
          <Text style={styles.mapTitle}>{role === 'client' ? 'Nearby masters' : 'Nearby orders'}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live mock</Text>
        </View>
      </View>

      <View style={styles.mapSearchShell}>
        <Text style={styles.mapSearchIcon}>S</Text>
        <TextInput
          placeholder={role === 'client' ? 'Search services on map...' : 'Search local orders...'}
          placeholderTextColor="#69748F"
          style={styles.mapSearchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapChipRow}>
        {mapCategories.map((category) => {
          const selected = selectedCategory === category;

          return (
            <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.mapChip, selected && styles.mapChipActive]}>
              <Text style={[styles.mapChipText, selected && styles.mapChipTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <LinearGradient colors={['#020611', '#061225', '#080620']} style={styles.mapCanvas}>
        <View style={styles.mapGrid} />
        <View style={styles.mapRoadOne} />
        <View style={styles.mapRoadTwo} />
        <View style={styles.mapRoadThree} />
        <View style={styles.cityBounds}>
          <Text style={styles.cityBoundsText}>{location.city} service zone</Text>
        </View>
        <View style={styles.clientMarker}>
          <View style={styles.clientMarkerCore} />
          <Text style={styles.markerMiniLabel}>You</Text>
        </View>

        {role === 'client'
          ? professionals.map((pro, index) => {
              const position = cityOffsets[index % cityOffsets.length];
              const selected = selectedMaster?.id === pro.id;

              return (
                <Pressable
                  key={pro.id}
                  onPress={() => setSelectedMasterId(pro.id)}
                  style={[styles.mapMarker, { left: position.x, top: position.y }, selected && styles.mapMarkerSelected]}
                >
                  <Text style={styles.markerText}>{pro.name.slice(0, 1)}</Text>
                </Pressable>
              );
            })
          : localOrders.map((order, index) => {
              const position = cityOffsets[index % cityOffsets.length];
              const selected = selectedOrder?.id === order.id;

              return (
                <Pressable
                  key={order.id}
                  onPress={() => setSelectedOrderId(order.id)}
                  style={[styles.orderMapMarker, { left: position.x, top: position.y }, selected && styles.mapMarkerSelected]}
                >
                  <Text style={styles.markerText}>O</Text>
                </Pressable>
              );
            })}
      </LinearGradient>

      <LinearGradient colors={['rgba(9,14,34,0.96)', 'rgba(14,9,36,0.96)']} style={styles.mapBottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sectionHeaderMini}>
          <Text style={styles.sectionTitle}>{role === 'client' ? 'Available now' : 'Nearest requests'}</Text>
          <Text style={styles.sectionAction}>{selectedCategory}</Text>
        </View>

        {role === 'client' && selectedMaster ? (
          <MapMasterCard
            pro={selectedMaster}
            distance={cityOffsets[professionals.findIndex((item) => item.id === selectedMaster.id) % cityOffsets.length]?.distance ?? '1.2 km'}
            eta={cityOffsets[professionals.findIndex((item) => item.id === selectedMaster.id) % cityOffsets.length]?.eta ?? '5 min'}
            onBook={() => onBookMaster(selectedMaster)}
          />
        ) : null}

        {role === 'master' && selectedOrder ? (
          <MapOrderCard order={selectedOrder} onAccept={() => onAcceptOrder(selectedOrder.id)} />
        ) : null}
      </LinearGradient>
    </>
  );
}

function MapMasterCard({
  pro,
  distance,
  eta,
  onBook,
}: {
  pro: Professional;
  distance: string;
  eta: string;
  onBook: () => void;
}) {
  return (
    <View style={styles.mapSheetCard}>
      <View style={styles.orderTop}>
        <View style={styles.proAvatar}><Text style={styles.proAvatarText}>{pro.name.slice(0, 1)}</Text></View>
        <View style={styles.flex}>
          <Text style={styles.orderTitle}>{pro.name}</Text>
          <Text style={styles.orderMeta}>{pro.role}</Text>
          <Text style={styles.proMeta}>{pro.rating.toFixed(2)} rating / {distance} / {eta}</Text>
        </View>
        <View style={styles.statusBadge}><Text style={styles.statusText}>Available</Text></View>
      </View>
      <View style={styles.orderActions}>
        <Pressable style={styles.declineButton}><Text style={styles.declineText}>Mini profile</Text></Pressable>
        <Pressable style={styles.acceptButton} onPress={onBook}><Text style={styles.acceptText}>Book from map</Text></Pressable>
      </View>
    </View>
  );
}

function MapOrderCard({ order, onAccept }: { order: MarketplaceOrder; onAccept: () => void }) {
  return (
    <View style={styles.mapSheetCard}>
      <View style={styles.orderTop}>
        <View style={styles.orderAvatar}><Text style={styles.orderAvatarText}>{order.clientName.slice(0, 1)}</Text></View>
        <View style={styles.flex}>
          <Text style={styles.orderTitle}>{order.serviceTitle}</Text>
          <Text style={styles.orderMeta}>{order.city}, {order.district}</Text>
          <Text style={styles.orderPrice}>{order.price}</Text>
        </View>
        <Text style={styles.distanceText}>{order.distance === 'nearby' ? '1.2 km' : order.distance}</Text>
      </View>
      <View style={styles.orderActions}>
        <Pressable style={styles.declineButton}><Text style={styles.declineText}>Navigate</Text></Pressable>
        <Pressable style={styles.acceptButton} onPress={onAccept}><Text style={styles.acceptText}>Accept nearest</Text></Pressable>
      </View>
    </View>
  );
}

function ClientOrdersScreen({
  orders,
  onCancel,
  onReleasePayment,
  onRefundPayment,
  onMessage,
  onReview,
}: {
  orders: MarketplaceOrder[];
  onCancel: (orderId: string) => void;
  onReleasePayment: (orderId: string) => void;
  onRefundPayment: (orderId: string) => void;
  onMessage: (orderId: string) => void;
  onReview: (order: MarketplaceOrder) => void;
}) {
  return (
    <>
      <Text style={styles.utilityTitle}>Orders</Text>
      <Text style={styles.utilitySubtitle}>Track every booking, chat with your master, and review completed work.</Text>
      <View style={styles.list}>
        {orders.length > 0 ? (
          orders.map((order) => (
            <LinearGradient key={order.id} colors={['rgba(255,255,255,0.1)', 'rgba(21,123,255,0.08)']} style={styles.clientOrderCard}>
              <View style={styles.sectionHeaderMini}>
                <View style={styles.flex}>
                  <Text style={styles.orderTitle}>{order.serviceTitle}</Text>
                  <Text style={styles.orderMeta}>{order.masterName} / {order.city}, {order.district}</Text>
                </View>
                <View>
                  <View style={styles.statusBadge}><Text style={styles.statusText}>{statusLabel(order.status)}</Text></View>
                  <PaymentBadge order={order} />
                </View>
              </View>
              <Text style={styles.orderPrice}>{order.price}</Text>
              <Text style={styles.orderMeta}>Secure deal: {formatAmd(order.amount)} / master earns {formatAmd(order.masterEarnings)}</Text>
              <OrderStatusTimeline status={order.status} />
              <View style={styles.orderActions}>
                <Pressable style={styles.declineButton} onPress={() => onMessage(order.id)}>
                  <Text style={styles.declineText}>Message</Text>
                </Pressable>
                {order.status === 'completed' ? (
                  <Pressable style={styles.acceptButton} onPress={() => onReview(order)}>
                    <Text style={styles.acceptText}>{order.review ? 'Review sent' : 'Leave review'}</Text>
                  </Pressable>
                ) : order.paymentStatus === 'reserved' ? (
                  <Pressable style={styles.acceptButton} onPress={() => onRefundPayment(order.id)}>
                    <Text style={styles.acceptText}>Refund</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.acceptButton} onPress={() => onCancel(order.id)}>
                    <Text style={styles.acceptText}>Cancel</Text>
                  </Pressable>
                )}
              </View>
              {order.status === 'completed' && order.paymentStatus === 'reserved' ? (
                <GradientButton title="Confirm and release payment" onPress={() => onReleasePayment(order.id)} style={styles.utilityButton} />
              ) : null}
            </LinearGradient>
          ))
        ) : (
          <GlassCard style={styles.utilityCard}>
            <Text style={styles.sectionTitle}>No orders yet</Text>
            <Text style={styles.sectionBody}>Book a verified professional and the live order timeline will appear here.</Text>
          </GlassCard>
        )}
      </View>
    </>
  );
}

function ChatListScreen({
  role,
  orders,
  messages,
  onOpenChat,
}: {
  role: UserRole;
  orders: MarketplaceOrder[];
  messages: ChatMessage[];
  onOpenChat: (orderId: string) => void;
}) {
  const activeOrders = orders.filter((order) => order.status !== 'cancelled');

  return (
    <>
      <Text style={styles.utilityTitle}>Messages</Text>
      <Text style={styles.utilitySubtitle}>Real-time service conversations with unread badges, order context, and premium chat controls.</Text>
      <View style={styles.list}>
        {activeOrders.map((order) => {
          const lastMessage = [...messages].reverse().find((message) => message.orderId === order.id);
          const unread = role === 'client' ? order.unreadForClient : order.unreadForMaster;
          const peerName = role === 'client' ? order.masterName : order.clientName;

          return (
            <Pressable key={order.id} onPress={() => onOpenChat(order.id)} accessibilityRole="button">
              <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(124,58,237,0.08)']} style={styles.chatListCard}>
                <View style={styles.chatAvatar}><Text style={styles.chatAvatarText}>{peerName.slice(0, 1)}</Text></View>
                <View style={styles.flex}>
                  <View style={styles.chatTitleRow}>
                    <Text style={styles.orderTitle}>{peerName}</Text>
                    <Text style={styles.chatTime}>{lastMessage?.timestamp ?? order.createdAt}</Text>
                  </View>
                  <Text style={styles.orderMeta}>{order.serviceTitle}</Text>
                  <Text style={styles.chatPreview} numberOfLines={1}>{lastMessage?.text || 'Order chat is ready.'}</Text>
                </View>
                {unread > 0 ? <View style={styles.unreadBadge}><Text style={styles.unreadText}>{unread}</Text></View> : null}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

function ChatConversationScreen({
  role,
  order,
  messages,
  onBack,
  onSend,
}: {
  role: UserRole;
  order: MarketplaceOrder;
  messages: ChatMessage[];
  onBack: () => void;
  onSend: (text: string, kind?: 'text' | 'image' | 'voice') => void;
}) {
  const [draft, setDraft] = useState('');
  const peerName = role === 'client' ? order.masterName : order.clientName;

  const sendDraft = () => {
    onSend(draft);
    setDraft('');
  };

  return (
    <>
      <View style={styles.chatHeader}>
        <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>{'<'}</Text></Pressable>
        <View style={styles.chatAvatarSmall}><Text style={styles.chatAvatarText}>{peerName.slice(0, 1)}</Text></View>
        <View style={styles.flex}>
          <Text style={styles.profileNavTitle}>{peerName}</Text>
          <Text style={styles.onlineText}>Online now / typing mock enabled</Text>
        </View>
      </View>
      <GlassCard style={styles.chatContextCard}>
        <View style={styles.sectionHeaderMini}>
          <Text style={styles.sectionTitle}>{order.serviceTitle}</Text>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{statusLabel(order.status)}</Text></View>
        </View>
        <OrderStatusTimeline status={order.status} />
      </GlassCard>
      <View style={styles.chatBubbleList}>
        {messages.map((message) => {
          const own = message.sender === role;

          return (
            <View key={message.id} style={[styles.messageRow, own && styles.messageRowOwn]}>
              <LinearGradient
                colors={own ? ['#157BFF', '#7C3AED'] : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.07)']}
                style={[styles.messageBubble, own && styles.messageBubbleOwn]}
              >
                <Text style={styles.messageText}>
                  {message.kind === 'image' ? 'Image placeholder attached' : message.kind === 'voice' ? 'Voice message placeholder' : message.text}
                </Text>
                <Text style={styles.messageTime}>{message.timestamp}</Text>
              </LinearGradient>
            </View>
          );
        })}
        <Text style={styles.typingText}>{peerName} is typing...</Text>
      </View>
      <View style={styles.chatComposer}>
        <Pressable style={styles.composerIcon} onPress={() => onSend('Image placeholder', 'image')}><Text style={styles.composerIconText}>IMG</Text></Pressable>
        <Pressable style={styles.composerIcon} onPress={() => onSend('Voice message placeholder', 'voice')}><Text style={styles.composerIconText}>MIC</Text></Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor="#69748F"
          style={styles.chatInput}
        />
        <Pressable style={styles.sendButton} onPress={sendDraft}><Text style={styles.sendText}>Send</Text></Pressable>
      </View>
    </>
  );
}

function NotificationCenter({
  role,
  notifications,
  onRead,
}: {
  role: UserRole;
  notifications: MarketplaceNotification[];
  onRead: () => void;
}) {
  const roleNotifications = notifications.filter((item) => item.role === role).slice(0, 4);

  return (
    <GlassCard style={styles.notificationPanel}>
      <View style={styles.sectionHeaderMini}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Pressable onPress={onRead}><Text style={styles.sectionAction}>Mark read</Text></Pressable>
      </View>
      <View style={styles.notificationList}>
        {roleNotifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={[styles.notificationIcon, notification.unread && styles.notificationIconUnread]}>
              <Text style={styles.notificationIconText}>{notification.category.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationBody}>{notification.body}</Text>
            </View>
            <Text style={styles.chatTime}>{notification.time}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const steps: Array<{ id: OrderStatus; label: string }> = [
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'master_on_way', label: 'On way' },
    { id: 'in_progress', label: 'Work' },
    { id: 'completed', label: 'Done' },
  ];
  const currentIndex = status === 'cancelled' ? 0 : steps.findIndex((step) => step.id === status);

  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const active = index <= currentIndex && status !== 'cancelled';

        return (
          <View key={step.id} style={styles.timelineStep}>
            <View style={[styles.timelineDot, active && styles.timelineDotActive]} />
            <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ReviewModal({
  order,
  onClose,
  onSubmit,
}: {
  order: MarketplaceOrder;
  onClose: () => void;
  onSubmit: (rating: number, text: string, photoAttached: boolean) => void;
}) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);

  return (
    <View style={styles.modalOverlay}>
      <LinearGradient colors={['rgba(9,14,34,0.98)', 'rgba(12,9,31,0.98)']} style={styles.reviewModal}>
        <View style={styles.sectionHeaderMini}>
          <Text style={styles.sectionTitle}>Rate your order</Text>
          <Pressable onPress={onClose}><Text style={styles.sectionAction}>Close</Text></Pressable>
        </View>
        <Text style={styles.sectionBody}>{order.serviceTitle} with {order.masterName}</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} style={[styles.starButton, star <= rating && styles.starButtonActive]}>
              <Text style={styles.starText}>*</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Write a short review..."
          placeholderTextColor="#69748F"
          style={styles.reviewInput}
        />
        <Pressable style={styles.photoAttach} onPress={() => setPhotoAttached((value) => !value)}>
          <Text style={styles.declineText}>{photoAttached ? 'Photo placeholder attached' : 'Attach photo placeholder'}</Text>
        </Pressable>
        <GradientButton title="Submit review" onPress={() => onSubmit(rating, text || 'Great service.', photoAttached)} style={styles.utilityButton} />
      </LinearGradient>
    </View>
  );
}

function ClientUtilityTab({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Text style={styles.utilityTitle}>{title}</Text>
      <Text style={styles.utilitySubtitle}>{subtitle}</Text>
      <GlassCard style={styles.utilityCard}>
        <LinearGradient colors={['rgba(21,123,255,0.18)', 'rgba(168,85,247,0.13)']} style={styles.utilityVisual}>
          <Text style={styles.utilityVisualText}>{title.toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.sectionBody}>A premium client workspace is ready for real backend data, notifications, and order state.</Text>
        <GradientButton title={action} onPress={() => undefined} style={styles.utilityButton} />
      </GlassCard>
      {children ? <View style={styles.list}>{children}</View> : null}
    </>
  );
}

function ClientProfileTab({
  location,
  roleLabel,
  notifications,
  onReadNotifications,
}: {
  location: LocationSelection;
  roleLabel: string;
  notifications: MarketplaceNotification[];
  onReadNotifications: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={styles.utilityTitle}>{t('profile.title', 'Profile')}</Text>
      <Text style={styles.utilitySubtitle}>Your premium client account and marketplace preferences.</Text>
      <GlassCard style={styles.profileCard}>
        <View style={styles.clientAvatar}><Text style={styles.clientAvatarText}>C</Text></View>
        <Text style={styles.profileName}>Fixora {roleLabel}</Text>
        <Text style={styles.profileRole}>{location.city}, {location.country}</Text>
        <View style={styles.profileRows}>
          <ProfileRow label="Currency" value={location.currency} />
          <ProfileRow label="Language" value={location.language.toUpperCase()} />
          <ProfileRow label="Marketplace" value={location.region} />
        </View>
      </GlassCard>
      <GlassCard style={styles.profileCard}>
        <LanguageSwitcher />
      </GlassCard>
      <AppearanceSettings />
      <NotificationCenter role="client" notifications={notifications} onRead={onReadNotifications} />
    </>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileRowLabel}>{label}</Text>
      <Text style={styles.profileRowValue}>{value}</Text>
    </View>
  );
}

function formatAmd(amount: number) {
  return `${Math.round(amount).toLocaleString()} AMD`;
}

function WalletSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard style={styles.walletSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </GlassCard>
  );
}

function WalletStat({ label, value }: { label: string; value: string }) {
  return (
    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(21,123,255,0.08)']} style={styles.walletStat}>
      <Text style={styles.walletStatValue}>{value}</Text>
      <Text style={styles.walletStatLabel}>{label}</Text>
    </LinearGradient>
  );
}

function PaymentMethodCard({ method }: { method: PaymentMethod }) {
  return (
    <View style={styles.paymentMethodCard}>
      <Text style={styles.paymentMethodIcon}>{method.label.slice(0, 2).toUpperCase()}</Text>
      <View style={styles.flex}>
        <Text style={styles.paymentMethodTitle}>{method.label}</Text>
        <Text style={styles.paymentMethodDetail}>{method.detail}</Text>
      </View>
    </View>
  );
}

function TransactionCard({ transaction }: { transaction: WalletTransaction }) {
  const positive = transaction.amount >= 0;

  return (
    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(124,58,237,0.08)']} style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>{transaction.type.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionMeta}>{transaction.status} / {transaction.time}</Text>
      </View>
      <Text style={[styles.transactionAmount, positive ? styles.transactionAmountPositive : styles.transactionAmountNegative]}>
        {positive ? '+' : ''}{formatAmd(transaction.amount)}
      </Text>
    </LinearGradient>
  );
}

function PaymentBadge({ order }: { order: MarketplaceOrder }) {
  return (
    <View style={styles.paymentBadge}>
      <Text style={styles.paymentBadgeText}>{paymentStatusLabel(order.paymentStatus)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050816',
  },
  blueGlow: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#157BFF',
    opacity: 0.14,
  },
  purpleGlow: {
    position: 'absolute',
    bottom: 70,
    right: -170,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#7C3AED',
    opacity: 0.16,
  },
  masterPurpleGlow: {
    position: 'absolute',
    top: 180,
    right: -150,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#7C3AED',
    opacity: 0.18,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 112,
  },
  walletHero: {
    minHeight: 178,
    marginTop: 22,
    borderRadius: 28,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.42,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
  },
  walletEyebrow: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '900',
  },
  walletBalance: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  walletSubline: {
    marginTop: 7,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '800',
  },
  secureBadge: {
    alignSelf: 'flex-start',
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  secureBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  walletStatsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  walletStat: {
    flex: 1,
    minHeight: 78,
    borderRadius: 18,
    padding: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  walletStatValue: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  walletStatLabel: {
    marginTop: 4,
    color: '#AAB0C0',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },
  walletSection: {
    marginTop: 16,
    borderRadius: 22,
  },
  paymentGrid: {
    marginTop: 12,
    gap: 10,
  },
  paymentMethodCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'rgba(21,123,255,0.28)',
    fontSize: 12,
    fontWeight: '900',
  },
  paymentMethodTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  paymentMethodDetail: {
    marginTop: 3,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '700',
  },
  promoRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 15,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    fontWeight: '800',
  },
  promoButton: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5538FF',
  },
  promoList: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promoPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(65,230,164,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(65,230,164,0.26)',
  },
  promoPillText: {
    color: '#41E6A4',
    fontSize: 11,
    fontWeight: '900',
  },
  transactionCard: {
    minHeight: 70,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168,85,247,0.2)',
  },
  transactionIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  transactionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  transactionMeta: {
    marginTop: 4,
    color: '#AAB0C0',
    fontSize: 11,
    fontWeight: '700',
  },
  transactionAmount: {
    maxWidth: 96,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
  },
  transactionAmountPositive: {
    color: '#41E6A4',
  },
  transactionAmountNegative: {
    color: '#F9D77E',
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 11,
    backgroundColor: 'rgba(65,230,164,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(65,230,164,0.25)',
  },
  paymentBadgeText: {
    color: '#41E6A4',
    fontSize: 10,
    fontWeight: '900',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  locationText: {
    marginBottom: 8,
    color: '#F9D77E',
    fontSize: 13,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  roleText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  bell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  bellText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  search: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  searchChipRow: {
    gap: 8,
    paddingTop: 12,
    paddingRight: 20,
  },
  searchChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  searchChipActive: {
    backgroundColor: 'rgba(21,123,255,0.3)',
    borderColor: 'rgba(142,167,255,0.55)',
  },
  searchChipText: {
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '900',
  },
  searchChipTextActive: {
    color: '#FFFFFF',
  },
  filterPanel: {
    marginTop: 12,
    padding: 13,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.065)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterPanelTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  filterGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(124,58,237,0.34)',
    borderColor: 'rgba(168,85,247,0.55)',
  },
  filterPillText: {
    color: '#AAB0C0',
    fontSize: 11,
    fontWeight: '900',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    gap: 8,
    paddingTop: 12,
    paddingRight: 20,
  },
  sortPill: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },
  sortPillActive: {
    backgroundColor: '#157BFF',
    borderColor: '#8EA7FF',
  },
  sortPillText: {
    color: '#AAB0C0',
    fontSize: 11,
    fontWeight: '900',
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  searchResultsPanel: {
    marginTop: 14,
    borderRadius: 22,
  },
  searchContext: {
    marginTop: 5,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '800',
  },
  serviceResultStrip: {
    marginTop: 13,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  serviceResultPill: {
    flexGrow: 1,
    minWidth: 120,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(21,123,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.26)',
  },
  serviceResultTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  serviceResultMeta: {
    marginTop: 5,
    color: '#8EA7FF',
    fontSize: 11,
    fontWeight: '900',
  },
  searchResultCard: {
    minHeight: 94,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  searchMetaLine: {
    marginTop: 5,
    color: '#69748F',
    fontSize: 11,
    fontWeight: '800',
  },
  resultPriceColumn: {
    alignItems: 'flex-end',
    gap: 7,
  },
  availableText: {
    color: '#41E6A4',
    fontSize: 10,
    fontWeight: '900',
  },
  emptySearchState: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  adminNotice: {
    marginTop: 14,
    borderRadius: 18,
  },
  adminNoticeTitle: {
    color: '#F9D77E',
    fontSize: 14,
    fontWeight: '900',
  },
  adminNoticeText: {
    marginTop: 6,
    color: '#D7DDF0',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  heroBanner: {
    minHeight: 160,
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#157BFF',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  heroCopy: {
    flex: 1,
  },
  heroKicker: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  heroText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  heroPerson: {
    width: 92,
    height: 118,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3,8,24,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  heroPersonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '22.7%',
    minWidth: 72,
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    color: '#8EA7FF',
    fontSize: 11,
    fontWeight: '900',
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  horizontalList: {
    gap: 12,
    paddingRight: 20,
  },
  marketingBanner: {
    width: 230,
    minHeight: 88,
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(249,215,126,0.22)',
  },
  marketingBannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  marketingBannerMeta: {
    marginTop: 8,
    color: '#F9D77E',
    fontSize: 11,
    fontWeight: '800',
  },
  serviceCard: {
    width: 142,
    borderRadius: 18,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  serviceImage: {
    height: 82,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceImageText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  serviceTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  servicePrice: {
    marginTop: 5,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  proCard: {
    minHeight: 78,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  proCardCompact: {
    marginTop: 10,
  },
  proAvatar: {
    width: 52,
    height: 52,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.42)',
  },
  proAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  flex: {
    flex: 1,
  },
  proNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  proCheck: {
    color: '#55D7FF',
    fontSize: 10,
    fontWeight: '900',
  },
  proRole: {
    marginTop: 4,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '700',
  },
  proMeta: {
    marginTop: 5,
    color: '#F9D77E',
    fontSize: 11,
    fontWeight: '800',
  },
  proPrice: {
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  premiumBlock: {
    marginTop: 4,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(124,58,237,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.32)',
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  premiumBody: {
    marginTop: 8,
    marginBottom: 14,
    color: '#AAB0C0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  bottomShell: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  bottomNav: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: '#157BFF',
    shadowColor: '#157BFF',
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  masterTabIconActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#A855F7',
    shadowOpacity: 0.58,
    shadowRadius: 14,
  },
  tabIconText: {
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '900',
  },
  tabIconTextActive: {
    color: '#FFFFFF',
  },
  tabLabel: {
    color: '#AAB0C0',
    fontSize: 10,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  profileHeaderBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  profileNavTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heartText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  profileHero: {
    marginTop: 14,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.5)',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '900',
  },
  verifiedDot: {
    position: 'absolute',
    right: -5,
    bottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#36D99B',
  },
  verifiedText: {
    color: '#03101C',
    fontSize: 9,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
  },
  verifiedBadge: {
    color: '#55D7FF',
    fontSize: 11,
    fontWeight: '900',
  },
  profileRole: {
    marginTop: 5,
    color: '#AAB0C0',
    fontSize: 13,
    fontWeight: '800',
  },
  profileMeta: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  badgeRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  blueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(21,123,255,0.22)',
  },
  goldBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(249,215,126,0.18)',
  },
  badgeText: {
    color: '#8EA7FF',
    fontSize: 11,
    fontWeight: '900',
  },
  goldBadgeText: {
    color: '#F9D77E',
    fontSize: 11,
    fontWeight: '900',
  },
  statsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minHeight: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 5,
    color: '#AAB0C0',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionCard: {
    marginTop: 14,
    borderRadius: 20,
  },
  sectionHeaderMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionAction: {
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionBody: {
    marginTop: 10,
    color: '#AAB0C0',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  pricingRow: {
    marginTop: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.09)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pricingTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  pricingPrice: {
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '900',
  },
  profileActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  secondaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  bookButton: {
    marginTop: 10,
  },
  utilityTitle: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900',
  },
  utilitySubtitle: {
    marginTop: 8,
    color: '#AAB0C0',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  utilityCard: {
    marginTop: 22,
    borderRadius: 24,
  },
  utilityVisual: {
    height: 148,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityVisualText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  utilityButton: {
    marginTop: 18,
  },
  profileCard: {
    marginTop: 22,
    alignItems: 'center',
  },
  clientAvatar: {
    width: 96,
    height: 96,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.5)',
  },
  clientAvatarText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
  },
  profileRows: {
    alignSelf: 'stretch',
    marginTop: 18,
    gap: 10,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  profileRowLabel: {
    color: '#AAB0C0',
    fontSize: 13,
    fontWeight: '800',
  },
  profileRowValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  masterHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  masterGreeting: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  masterLocation: {
    marginTop: 4,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '800',
  },
  completionCard: {
    marginTop: 14,
    borderRadius: 18,
  },
  masterCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  masterCardBody: {
    marginTop: 7,
    color: '#AAB0C0',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  masterProgressTrack: {
    marginTop: 13,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.11)',
    overflow: 'hidden',
  },
  masterProgressFill: {
    width: '85%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A855F7',
  },
  incomeCard: {
    marginTop: 14,
    minHeight: 170,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  incomeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  incomeLabel: {
    color: '#AAB0C0',
    fontSize: 13,
    fontWeight: '800',
  },
  incomeValue: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
  },
  incomeDelta: {
    marginTop: 4,
    color: '#36D99B',
    fontSize: 12,
    fontWeight: '900',
  },
  moneyOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168,85,247,0.9)',
    shadowColor: '#A855F7',
    shadowOpacity: 0.75,
    shadowRadius: 18,
  },
  moneyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  chart: {
    height: 70,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  chartBar: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#426BFF',
    shadowColor: '#157BFF',
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  masterStatsGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  masterMetric: {
    width: '48%',
    minHeight: 80,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  masterMetricTitle: {
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '800',
  },
  masterMetricValue: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  masterFilterRow: {
    gap: 8,
    paddingVertical: 14,
    paddingRight: 20,
  },
  masterFilter: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  masterFilterActive: {
    backgroundColor: '#157BFF',
    borderColor: '#8EA7FF',
  },
  masterFilterText: {
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '900',
  },
  masterFilterTextActive: {
    color: '#FFFFFF',
  },
  masterOrderCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  orderTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  orderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.42)',
  },
  orderAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  orderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  orderMeta: {
    marginTop: 4,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '700',
  },
  orderPrice: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 11,
    backgroundColor: 'rgba(249,215,126,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(249,215,126,0.24)',
  },
  statusText: {
    color: '#F9D77E',
    fontSize: 10,
    fontWeight: '900',
  },
  distanceText: {
    marginTop: 10,
    color: '#8EA7FF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
  },
  orderActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  declineButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  declineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  acceptButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5538FF',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.42,
    shadowRadius: 12,
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  orderProgressTrack: {
    marginTop: 14,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  orderProgressFill: {
    width: '60%',
    height: 5,
    borderRadius: 3,
    backgroundColor: '#426BFF',
  },
  clientOrderCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  mapHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  mapTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  liveBadge: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(65,230,164,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(65,230,164,0.28)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#41E6A4',
    shadowColor: '#41E6A4',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  liveText: {
    color: '#41E6A4',
    fontSize: 11,
    fontWeight: '900',
  },
  mapSearchShell: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  mapSearchIcon: {
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  mapSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mapChipRow: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 20,
  },
  mapChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  mapChipActive: {
    backgroundColor: 'rgba(21,123,255,0.34)',
    borderColor: 'rgba(142,167,255,0.55)',
  },
  mapChipText: {
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '900',
  },
  mapChipTextActive: {
    color: '#FFFFFF',
  },
  mapCanvas: {
    height: 470,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#157BFF',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.08)',
    backgroundColor: 'rgba(21,123,255,0.035)',
  },
  mapRoadOne: {
    position: 'absolute',
    left: -40,
    right: -30,
    top: 170,
    height: 26,
    borderRadius: 18,
    backgroundColor: 'rgba(21,123,255,0.12)',
    transform: [{ rotate: '-16deg' }],
  },
  mapRoadTwo: {
    position: 'absolute',
    left: 60,
    top: -20,
    width: 24,
    bottom: -20,
    borderRadius: 18,
    backgroundColor: 'rgba(168,85,247,0.12)',
    transform: [{ rotate: '22deg' }],
  },
  mapRoadThree: {
    position: 'absolute',
    right: -30,
    top: 70,
    width: 210,
    height: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.055)',
    transform: [{ rotate: '38deg' }],
  },
  cityBounds: {
    position: 'absolute',
    left: '13%',
    right: '12%',
    top: '18%',
    bottom: '18%',
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.25)',
    backgroundColor: 'rgba(21,123,255,0.035)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  cityBoundsText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    fontWeight: '900',
  },
  clientMarker: {
    position: 'absolute',
    left: '47%',
    top: '42%',
    alignItems: 'center',
  },
  clientMarkerCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#41E6A4',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#41E6A4',
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  markerMiniLabel: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  mapMarker: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#157BFF',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#157BFF',
    shadowOpacity: 0.85,
    shadowRadius: 18,
  },
  orderMapMarker: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#A855F7',
    shadowOpacity: 0.85,
    shadowRadius: 18,
  },
  mapMarkerSelected: {
    transform: [{ scale: 1.14 }],
    borderColor: '#F9D77E',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  mapBottomSheet: {
    marginTop: -118,
    marginHorizontal: 12,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  mapSheetCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  timeline: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  timelineDotActive: {
    backgroundColor: '#8EA7FF',
    shadowColor: '#157BFF',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  timelineLabel: {
    color: '#69748F',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#FFFFFF',
  },
  chatHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.45)',
  },
  chatAvatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.26)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  chatAvatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  onlineText: {
    marginTop: 3,
    color: '#41E6A4',
    fontSize: 12,
    fontWeight: '800',
  },
  chatContextCard: {
    marginTop: 8,
    borderRadius: 20,
  },
  chatListCard: {
    minHeight: 82,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  chatTime: {
    color: '#69748F',
    fontSize: 10,
    fontWeight: '900',
  },
  chatPreview: {
    marginTop: 5,
    color: '#AAB0C0',
    fontSize: 12,
    fontWeight: '700',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A855F7',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  chatBubbleList: {
    marginTop: 16,
    gap: 10,
  },
  messageRow: {
    alignItems: 'flex-start',
  },
  messageRowOwn: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  messageBubbleOwn: {
    shadowColor: '#7C3AED',
    shadowOpacity: 0.34,
    shadowRadius: 16,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  messageTime: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.64)',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'right',
  },
  typingText: {
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '800',
  },
  chatComposer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  composerIcon: {
    minWidth: 42,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.18)',
  },
  composerIconText: {
    color: '#8EA7FF',
    fontSize: 10,
    fontWeight: '900',
  },
  chatInput: {
    flex: 1,
    minHeight: 42,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sendButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5538FF',
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  notificationPanel: {
    marginTop: 18,
    borderRadius: 22,
  },
  notificationList: {
    marginTop: 12,
    gap: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  notificationIconUnread: {
    backgroundColor: 'rgba(21,123,255,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.45)',
  },
  notificationIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  notificationBody: {
    marginTop: 4,
    color: '#AAB0C0',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  reviewModal: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  starRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  starButtonActive: {
    backgroundColor: 'rgba(249,215,126,0.24)',
    borderColor: 'rgba(249,215,126,0.5)',
  },
  starText: {
    color: '#F9D77E',
    fontSize: 22,
    fontWeight: '900',
  },
  reviewInput: {
    minHeight: 96,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    textAlignVertical: 'top',
    fontWeight: '700',
  },
  photoAttach: {
    minHeight: 44,
    marginTop: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  emptyMasterCard: {
    borderRadius: 20,
  },
});
