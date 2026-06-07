import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AccountDropdown } from '../components/AccountDropdown';
import { CurrencySwitcher } from '../components/CurrencySwitcher';
import { FixoraLogo } from '../components/FixoraLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useCurrency } from '../context/CurrencyContext';
import { useTranslation } from '../i18n/I18nProvider';
import { RegisteredUser } from '../services/authStorage';
import { LocationSelection, UserRole } from '../types/navigation';

type HomeScreenProps = {
  location: LocationSelection;
  role: UserRole;
  currentUser: RegisteredUser | null;
  onOpenCategories: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
};

const webCategoryCards = [
  ['B', 'home.categories.construction', 'Construction', '#FFF3E5'],
  ['C', 'home.categories.cleaning', 'Cleaning', '#EEF6FF'],
  ['E', 'home.categories.electric', 'Electricity', '#FFF8D9'],
  ['P', 'home.categories.plumbing', 'Plumbing', '#EAF7FF'],
  ['M', 'home.categories.moving', 'Moving', '#EAFBF1'],
  ['T', 'home.categories.techRepair', 'Tech repair', '#F0F3FF'],
  ['A', 'home.categories.auto', 'Auto services', '#FFF0F0'],
  ['S', 'home.categories.beauty', 'Beauty', '#F7EDFF'],
  ['G', 'categories.title', 'Categories', '#F5F7FF'],
];

const webListings = [
  { color: '#F0F7FF', min: 19500, max: 39000, titleKey: 'home.listings.plumbing', fallback: 'Plumbing installation', placeKey: 'home.places.yerevan', placeFallback: 'Yerevan, Armenia', rating: '4.9', reviews: '(128)', kind: 'plumbing' },
  { color: '#FFF7EA', min: 11700, max: 27300, titleKey: 'home.listings.lighting', fallback: 'Lighting installation', placeKey: 'home.places.gyumri', placeFallback: 'Gyumri, Armenia', rating: '4.8', reviews: '(96)', kind: 'lighting' },
  { color: '#EFFAF3', min: 15600, max: 31200, titleKey: 'home.listings.cleaning', fallback: 'Deep cleaning', placeKey: 'home.places.yerevan', placeFallback: 'Yerevan, Armenia', rating: '4.9', reviews: '(166)', kind: 'cleaning' },
  { color: '#F8F0EA', min: 9750, max: 23400, titleKey: 'home.listings.furniture', fallback: 'Furniture assembly', placeKey: 'home.places.vanadzor', placeFallback: 'Vanadzor, Armenia', rating: '4.7', reviews: '(84)', kind: 'furniture' },
  { color: '#EEF2F7', min: 23400, max: 46800, titleKey: 'home.listings.auto', fallback: 'Car diagnostics', placeKey: 'home.places.yerevan', placeFallback: 'Yerevan, Armenia', rating: '4.9', reviews: '(203)', kind: 'auto' },
];

const mobileCategories = [
  { titleKey: 'home.categories.auto', fallback: 'Auto', icon: 'A', color: '#EEF2FF' },
  { titleKey: 'home.categories.home', fallback: 'Home', icon: 'H', color: '#F0FDF4' },
  { titleKey: 'home.categories.services', fallback: 'Services', icon: 'S', color: '#FFF7ED' },
  { titleKey: 'home.categories.beauty', fallback: 'Beauty', icon: 'B', color: '#FDF2F8' },
  { titleKey: 'home.categories.tech', fallback: 'Tech', icon: 'T', color: '#ECFEFF' },
  { titleKey: 'home.categories.business', fallback: 'Business', icon: 'B', color: '#F5F3FF' },
];

const offers = [
  { titleKey: 'home.offers.apartment', fallback: 'Apartment refresh', amount: 18000, tagKey: 'home.categories.home', tagFallback: 'Home' },
  { titleKey: 'home.offers.carDiagnostics', fallback: 'Car diagnostics', amount: 9000, tagKey: 'home.categories.auto', tagFallback: 'Auto' },
  { titleKey: 'home.offers.cleaningTeam', fallback: 'Cleaning team', amount: 14000, tagKey: 'home.categories.services', tagFallback: 'Services' },
];

const companies = ['Derakshan', 'Aram Shin', 'USAcars Armenia', 'Fixora Care', 'Urban Home'];

function cleanRoleLabel(role: UserRole) {
  if (role === 'super_admin') return 'Super Admin';
  return role[0].toUpperCase() + role.slice(1);
}

export default function HomeScreen({ location, role, currentUser, onOpenCategories, onOpenAdmin, onLogout }: HomeScreenProps) {
  const { t } = useTranslation();
  const { formatMoney } = useCurrency();
  const [tab, setTab] = useState('home');
  const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webScreen}>
        <View style={styles.webHeader}>
          <FixoraLogo size={50} wordmark />
          <View style={styles.webSearch}>
            <Text style={styles.webSearchIcon}>⌕</Text>
            <TextInput placeholder={t('home.search.placeholder', 'Search services, specialists, companies...')} placeholderTextColor="#7E8AA3" style={styles.webSearchInput} />
            <Pressable accessibilityRole="button" style={styles.webSearchButton}>
              <Text style={styles.webSearchButtonText}>{t('buttons.search', 'Search')}</Text>
            </Pressable>
          </View>
          <View style={styles.webToolbar}>
            <LanguageSwitcher compact />
            <CurrencySwitcher compact />
            <AccountDropdown user={currentUser} onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            {isAdminUser ? (
              <Pressable accessibilityRole="button" onPress={onOpenAdmin} style={styles.webAdminButton}>
                <Text style={styles.webAdminButtonText}>{t('admin.panel', 'Admin Panel')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.webMain}>
          <ScrollView contentContainerStyle={styles.webContent} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#7A3FF3', '#4F8BFF', '#C8D7FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.webHero}>
              <View style={styles.webHeroText}>
                <Text style={styles.webHeroTitle}>{t('home.web.hero.title', 'Find the best specialists')}{'\n'}{t('home.web.hero.title2', 'for any task')}</Text>
                <Text style={styles.webHeroSubtitle}>{t('home.web.hero.subtitle', 'Fast search, verified specialists, reliable services for you and your business')}</Text>
                <View style={styles.webHeroActions}>
                  <Pressable accessibilityRole="button" style={styles.webHeroPrimary}><Text style={styles.webHeroPrimaryText}>{t('home.hero.findSpecialist', 'Find specialist')}</Text></Pressable>
                  <Pressable accessibilityRole="button" style={styles.webHeroSecondary}><Text style={styles.webHeroSecondaryText}>{t('home.hero.postOrder', 'Post order')}</Text></Pressable>
                </View>
              </View>
              <View style={styles.masterFigure}>
                <View style={styles.masterHead} />
                <View style={styles.masterBody} />
                <View style={styles.masterTool} />
              </View>
              <View style={styles.webHeroStats}>
                {[
                  ['P', '5000+', t('home.stats.specialists', 'specialists')],
                  ['O', '100K+', t('home.stats.orders', 'completed orders')],
                  ['R', '98%', t('home.stats.happyClients', 'happy clients')],
                ].map(([icon, value, label]) => (
                  <View key={value} style={styles.webHeroStat}>
                    <Text style={styles.webHeroStatIcon}>{icon}</Text>
                    <View>
                      <Text style={styles.webHeroStatValue}>{value}</Text>
                      <Text style={styles.webHeroStatLabel}>{label}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <View style={styles.dots}><View style={styles.dot} /><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} /><View style={styles.dot} /></View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.webCategoryRow}>
              {webCategoryCards.map(([icon, key, fallback, color]) => (
                <Pressable key={key} accessibilityRole="button" onPress={onOpenCategories} style={styles.webCategoryCard}>
                  <View style={[styles.webCategoryIcon, { backgroundColor: color }]}><Text style={styles.webCategoryIconText}>{icon}</Text></View>
                  <Text style={styles.webCategoryTitle}>{t(key, fallback)}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.webListingsHeader}>
              <View style={styles.webTitleRow}>
                <Text style={styles.webSectionTitle}>{t('home.popular.title', 'Popular listings')}</Text>
                <Text style={styles.webNewBadge}>{t('home.popular.newBadge', '248 new')}</Text>
              </View>
              <View style={styles.webFilters}>
                {[t('home.filters.all', 'All listings'), t('home.filters.nearMe', 'Near me'), t('home.filters.newFirst', 'Newest first'), t('home.filters.verified', 'Verified')].map((filter, index) => (
                  <Pressable key={`${filter}-${index}`} accessibilityRole="button" style={[styles.webFilter, index === 0 && styles.webFilterActive]}>
                    <Text style={[styles.webFilterText, index === 0 && styles.webFilterTextActive]}>{filter}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.webListingGrid}>
              {webListings.map((listing) => (
                <View key={listing.titleKey} style={styles.webListingCard}>
                  <LinearGradient colors={[listing.color, '#FFFFFF']} style={styles.webListingImage}>
                    <Text style={styles.webListingKind}>{listing.kind}</Text>
                    <Text style={styles.webHeart}>♡</Text>
                  </LinearGradient>
                  <View style={styles.webListingBody}>
                    <Text style={styles.webListingPrice}>{formatMoney(listing.min)} - {formatMoney(listing.max)}</Text>
                    <Text style={styles.webListingTitle}>{t(listing.titleKey, listing.fallback)}</Text>
                    <Text style={styles.webListingPlace}>{t(listing.placeKey, listing.placeFallback)}</Text>
                    <Text style={styles.webRating}>★ {listing.rating} <Text style={styles.webReviews}>{listing.reviews}</Text></Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.webInfoGrid}>
              {[
                ['V', t('home.info.verified.title', 'Verified specialists'), t('home.info.verified.text', 'Every specialist passes Fixora verification.'), '#F1ECFF'],
                ['S', t('home.info.secure.title', 'Secure deals'), t('home.info.secure.text', 'Your payments are protected by secure deal flow.'), '#EAFBF1'],
                ['H', t('home.info.support.title', 'Fast support'), t('home.info.support.text', 'Support is ready when an order needs attention.'), '#EEF6FF'],
                ['Q', t('home.info.quality.title', 'Quality guarantee'), t('home.info.quality.text', 'Fixora quality standards cover services and orders.'), '#FFF5E6'],
              ].map(([icon, title, text, color]) => (
                <View key={title} style={styles.webInfoCard}>
                  <View style={[styles.webInfoIcon, { backgroundColor: color }]}><Text style={styles.webInfoIconText}>{icon}</Text></View>
                  <View>
                    <Text style={styles.webInfoTitle}>{title}</Text>
                    <Text style={styles.webInfoText}>{text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FixoraLogo size={48} wordmark />
          <View style={styles.mobileHeaderActions}>
            <LanguageSwitcher compact />
            <CurrencySwitcher compact />
          </View>
        </View>

        <View style={styles.profileStrip}>
          <AccountDropdown user={currentUser} onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput placeholder={t('home.search.placeholder', 'Search services, companies, specialists')} placeholderTextColor="#94A3B8" style={styles.searchInput} />
          <Text style={styles.cameraIcon}>□</Text>
        </View>

        <LinearGradient colors={['#7C3AED', '#2D7CFF']} style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroKicker}>{location.city || t('labels.localMarketplace', 'Local marketplace')} / {cleanRoleLabel(role)}</Text>
            <Text style={styles.heroTitle}>{t('home.mobile.hero.title', 'Trusted help, beautifully organized.')}</Text>
            <Text style={styles.heroSubtitle}>{t('home.mobile.hero.subtitle', 'Explore premium offers, verified companies, and local services in one clean workspace.')}</Text>
          </View>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>F</Text></View>
        </LinearGradient>

        <SectionTitle title={t('home.sections.topOffers', 'Top offers')} action={t('buttons.viewAll', 'View all')} onAction={onOpenCategories} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerRow}>
          {offers.map((offer) => (
            <View key={offer.titleKey} style={styles.offerCard}>
              <LinearGradient colors={['#EEF2FF', '#FFFFFF']} style={styles.offerImage}>
                <Text style={styles.offerTag}>{t(offer.tagKey, offer.tagFallback)}</Text>
              </LinearGradient>
              <Text style={styles.offerTitle}>{t(offer.titleKey, offer.fallback)}</Text>
              <Text style={styles.offerPrice}>{t('labels.fromPrice', 'from {{price}}').replace('{{price}}', formatMoney(offer.amount))}</Text>
            </View>
          ))}
        </ScrollView>

        <SectionTitle title={t('categories.title', 'Categories')} action={t('buttons.open', 'Open')} onAction={onOpenCategories} />
        <View style={styles.categoryGrid}>
          {mobileCategories.map((category) => (
            <Pressable key={category.titleKey} accessibilityRole="button" onPress={onOpenCategories} style={[styles.categoryCard, { backgroundColor: category.color }]}>
              <View style={styles.categoryIcon}><Text style={styles.categoryIconText}>{category.icon}</Text></View>
              <Text style={styles.categoryTitle}>{t(category.titleKey, category.fallback)}</Text>
            </Pressable>
          ))}
        </View>

        {[t('home.sections.company', 'Company'), t('home.categories.auto', 'Auto'), t('home.categories.home', 'Home'), t('home.categories.services', 'Services')].map((section) => (
          <View key={section} style={styles.companySection}>
            <SectionTitle title={section} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companyRow}>
              {companies.map((company, index) => (
                <View key={`${section}-${company}`} style={styles.companyCard}>
                  <LinearGradient colors={index % 2 === 0 ? ['#F5F3FF', '#E0F2FE'] : ['#FFFFFF', '#EEF2FF']} style={styles.companyLogo}>
                    <Text style={styles.companyLogoText}>{company.slice(0, 2).toUpperCase()}</Text>
                  </LinearGradient>
                  <Text style={styles.companyName}>{company}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          ['home', '⌂'],
          ['grid', '□'],
          ['add', '+'],
          ['chat', '○'],
          ['profile', '♙'],
        ].map(([id, icon]) => (
          <Pressable key={id} accessibilityRole="button" onPress={() => setTab(id)} style={[styles.navItem, tab === id && styles.navItemActive]}>
            <Text style={[styles.navIcon, tab === id && styles.navIconActive]}>{icon}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  webScreen: { flex: 1, backgroundColor: '#F8FAFF' },
  webHeader: { minHeight: 74, paddingHorizontal: 56, flexDirection: 'row', alignItems: 'center', gap: 28, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E7EDF7', zIndex: 50 },
  webSearch: { flex: 1, maxWidth: 560, minHeight: 42, borderRadius: 7, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D9E2F0', overflow: 'hidden' },
  webSearchIcon: { paddingLeft: 14, color: '#73809A', fontSize: 20, fontWeight: '900' },
  webSearchInput: { flex: 1, minHeight: 42, paddingHorizontal: 10, color: '#07153C', fontSize: 14, fontWeight: '700' },
  webSearchButton: { alignSelf: 'stretch', minWidth: 78, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6F45E8' },
  webSearchButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  webToolbar: { flexDirection: 'row', alignItems: 'center', gap: 14, zIndex: 60 },
  webAdminButton: { minHeight: 42, paddingHorizontal: 22, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6F45E8', shadowColor: '#6F45E8', shadowOpacity: 0.24, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  webAdminButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  webMain: { flex: 1, padding: 20, zIndex: 1 },
  webContent: { flexGrow: 1, paddingBottom: 40 },
  webHero: { minHeight: 338, borderRadius: 9, padding: 48, flexDirection: 'row', overflow: 'hidden' },
  webHeroText: { flex: 1 },
  webHeroTitle: { color: '#FFFFFF', fontSize: 38, lineHeight: 50, fontWeight: '900' },
  webHeroSubtitle: { marginTop: 18, maxWidth: 520, color: '#FFFFFF', fontSize: 18, lineHeight: 28, fontWeight: '700' },
  webHeroActions: { marginTop: 34, flexDirection: 'row', gap: 16 },
  webHeroPrimary: { minHeight: 52, paddingHorizontal: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6A38E8' },
  webHeroPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  webHeroSecondary: { minHeight: 52, paddingHorizontal: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  webHeroSecondaryText: { color: '#5B35E8', fontSize: 15, fontWeight: '900' },
  masterFigure: { width: 260, alignItems: 'center', justifyContent: 'center' },
  masterHead: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#F3C7A1', borderWidth: 6, borderColor: '#FFFFFF' },
  masterBody: { marginTop: -4, width: 150, height: 190, borderRadius: 40, backgroundColor: '#1D4F8F' },
  masterTool: { position: 'absolute', top: 112, width: 170, height: 28, borderRadius: 14, backgroundColor: '#2E3440', transform: [{ rotate: '7deg' }] },
  webHeroStats: { justifyContent: 'center', gap: 26 },
  webHeroStat: { width: 196, minHeight: 70, paddingHorizontal: 18, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.92)' },
  webHeroStatIcon: { color: '#6F45E8', fontSize: 24, fontWeight: '900' },
  webHeroStatValue: { color: '#07153C', fontSize: 21, fontWeight: '900' },
  webHeroStatLabel: { color: '#68748D', fontSize: 13, fontWeight: '700' },
  dots: { height: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C9D2E4' },
  dotActive: { backgroundColor: '#6F45E8' },
  webCategoryRow: { paddingVertical: 12, gap: 28 },
  webCategoryCard: { width: 112, height: 96, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F2', shadowColor: '#6D7BA8', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  webCategoryIcon: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  webCategoryIconText: { fontSize: 20, fontWeight: '900' },
  webCategoryTitle: { marginTop: 8, color: '#07153C', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  webListingsHeader: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  webTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  webSectionTitle: { color: '#07153C', fontSize: 25, fontWeight: '900' },
  webNewBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9, overflow: 'hidden', color: '#5B35E8', backgroundColor: '#F1ECFF', fontSize: 12, fontWeight: '900' },
  webFilters: { flexDirection: 'row', gap: 14 },
  webFilter: { minHeight: 42, paddingHorizontal: 18, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5F2' },
  webFilterActive: { backgroundColor: '#6F45E8', borderColor: '#6F45E8' },
  webFilterText: { color: '#52607A', fontSize: 14, fontWeight: '800' },
  webFilterTextActive: { color: '#FFFFFF' },
  webListingGrid: { marginTop: 14, flexDirection: 'row', gap: 18 },
  webListingCard: { flex: 1, minWidth: 170, borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E7F2', shadowColor: '#6D7BA8', shadowOpacity: 0.09, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  webListingImage: { height: 130, padding: 12 },
  webListingKind: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, overflow: 'hidden', color: '#475569', backgroundColor: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: '900' },
  webHeart: { position: 'absolute', top: 12, right: 12, color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  webListingBody: { padding: 14 },
  webListingPrice: { color: '#07153C', fontSize: 15, fontWeight: '900' },
  webListingTitle: { marginTop: 8, color: '#07153C', fontSize: 14, fontWeight: '800' },
  webListingPlace: { marginTop: 6, color: '#8A96AC', fontSize: 13, fontWeight: '700' },
  webRating: { marginTop: 8, color: '#F59E0B', fontSize: 13, fontWeight: '900' },
  webReviews: { color: '#61708B' },
  webInfoGrid: { marginTop: 28, flexDirection: 'row', gap: 16 },
  webInfoCard: { flex: 1, minHeight: 88, padding: 18, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F2' },
  webInfoIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  webInfoIconText: { color: '#6F45E8', fontSize: 21, fontWeight: '900' },
  webInfoTitle: { color: '#07153C', fontSize: 15, fontWeight: '900' },
  webInfoText: { marginTop: 5, maxWidth: 220, color: '#63708A', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingTop: 48, paddingHorizontal: 18, paddingBottom: 104 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 40 },
  mobileHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileStrip: { marginTop: 14, zIndex: 35 },
  searchWrap: { marginTop: 20, minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  searchIcon: { color: '#64748B', fontSize: 20, fontWeight: '900' },
  searchInput: { flex: 1, color: '#09183F', fontSize: 14, fontWeight: '700' },
  cameraIcon: { color: '#64748B', fontSize: 18, fontWeight: '900' },
  hero: { marginTop: 18, minHeight: 176, borderRadius: 26, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroText: { flex: 1 },
  heroKicker: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  heroTitle: { marginTop: 8, color: '#FFFFFF', fontSize: 26, lineHeight: 32, fontWeight: '900' },
  heroSubtitle: { marginTop: 8, color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  heroBadge: { width: 86, height: 86, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  heroBadgeText: { color: '#FFFFFF', fontSize: 44, fontWeight: '900' },
  sectionHeader: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#09183F', fontSize: 20, fontWeight: '900' },
  sectionAction: { color: '#5B6CFF', fontSize: 13, fontWeight: '900' },
  offerRow: { gap: 12, paddingRight: 18 },
  offerCard: { width: 190, padding: 10, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5ECF8', shadowColor: '#64748B', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  offerImage: { height: 120, borderRadius: 16, padding: 12 },
  offerTag: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, color: '#4F46E5', backgroundColor: '#FFFFFF', overflow: 'hidden', fontSize: 11, fontWeight: '900' },
  offerTitle: { marginTop: 10, color: '#09183F', fontSize: 14, fontWeight: '900' },
  offerPrice: { marginTop: 5, color: '#64748B', fontSize: 12, fontWeight: '800' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { flexGrow: 1, flexBasis: 100, minHeight: 96, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)' },
  categoryIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  categoryIconText: { color: '#5B6CFF', fontWeight: '900' },
  categoryTitle: { marginTop: 10, color: '#09183F', fontSize: 13, fontWeight: '900' },
  companySection: { marginTop: 6 },
  companyRow: { gap: 10, paddingRight: 18 },
  companyCard: { width: 118, padding: 10, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5ECF8' },
  companyLogo: { height: 66, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  companyLogoText: { color: '#4F46E5', fontSize: 18, fontWeight: '900' },
  companyName: { marginTop: 8, color: '#09183F', fontSize: 11, lineHeight: 15, fontWeight: '800', textAlign: 'center' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 78, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.96)', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  navItem: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  navItemActive: { backgroundColor: '#EEF2FF' },
  navIcon: { color: '#475569', fontSize: 26, fontWeight: '900' },
  navIconActive: { color: '#4F46E5' },
});
