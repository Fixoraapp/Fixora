import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FixoraLogo } from '../components/FixoraLogo';
import { useAdminConfig } from '../context/AdminConfigContext';
import { categories as fallbackCategories } from '../data/categories';
import { popularServices } from '../data/marketplace';
import { useTranslation } from '../i18n/I18nProvider';
import { Category } from '../types/marketplace';

type CategoriesScreenProps = {
  onBack: () => void;
};

type PremiumCategory = Category & {
  accent: string;
  softAccent: string;
  cityLabel: string;
};

const accents = ['#4169F6', '#7C3AED', '#0EA5E9', '#14B8A6', '#F59E0B', '#EC4899'];

const iconLibrary = [
  { match: ['repair', 'construction', 'electric', 'plumb', 'tech'], icon: '🛠️' },
  { match: ['clean'], icon: '✨' },
  { match: ['delivery', 'courier', 'moving'], icon: '🚚' },
  { match: ['auto', 'car'], icon: '🚗' },
  { match: ['beauty', 'spa'], icon: '💎' },
  { match: ['health', 'care'], icon: '🩺' },
  { match: ['education', 'tutor'], icon: '🎓' },
  { match: ['photo', 'video', 'media'], icon: '📷' },
  { match: ['it', 'ai', 'software'], icon: '💻' },
  { match: ['business', 'legal', 'finance'], icon: '⚖️' },
  { match: ['event'], icon: '🎉' },
  { match: ['security'], icon: '🛡️' },
  { match: ['tourism', 'travel'], icon: '✈️' },
  { match: ['premium', 'vip'], icon: '👑' },
];

const defaultSubcategories = ['Express booking', 'Verified pros', 'Home visit', 'Premium teams'];
const defaultPopularServices = ['Same-day request', 'Verified specialist', 'Secure deal', 'Premium support'];

function iconFor(category: Pick<Category, 'title' | 'icon'> & { slug?: string }) {
  const searchable = `${category.title} ${category.slug ?? ''}`.toLowerCase();
  const matched = iconLibrary.find((item) => item.match.some((keyword) => searchable.includes(keyword)));
  return matched?.icon ?? (category.icon && category.icon.length > 2 ? category.icon : '🏷️');
}

function normalizeAdminCategories(stateCategories: ReturnType<typeof useAdminConfig>['state']['categories']): PremiumCategory[] {
  return stateCategories
    .filter((category) => category.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((category, index) => {
      const fallback = fallbackCategories.find((item) => {
        const slug = item.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return slug === category.slug || item.title.toLowerCase() === category.name_en.toLowerCase();
      });
      const title = category.name_en || category.name_ru || category.slug || 'Fixora category';
      const accent = category.color || accents[index % accents.length];

      return {
        id: category.id,
        title,
        description: fallback?.description ?? `Trusted ${title.toLowerCase()} services with verified Fixora specialists.`,
        icon: iconFor({ title, icon: category.icon, slug: category.slug }),
        subcategories: fallback?.subcategories ?? defaultSubcategories,
        popularServices: fallback?.popularServices ?? defaultPopularServices,
        localServices: category.availableCities.length > 0 ? category.availableCities : category.availableRegions,
        accent,
        softAccent: `${accent}18`,
        cityLabel: category.availableCities.slice(0, 2).join(', ') || category.availableRegions.slice(0, 2).join(', ') || 'Local',
      };
    });
}

function normalizeFallbackCategories(): PremiumCategory[] {
  return fallbackCategories.map((category, index) => ({
    ...category,
    icon: iconFor(category),
    accent: accents[index % accents.length],
    softAccent: `${accents[index % accents.length]}18`,
    cityLabel: 'Local',
  }));
}

export default function CategoriesScreen({ onBack }: CategoriesScreenProps) {
  const adminConfig = useAdminConfig();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWide = isWeb && width >= 980;
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const adminCategories = normalizeAdminCategories(adminConfig.state.categories);
    return adminCategories.length > 0 ? adminCategories : normalizeFallbackCategories();
  }, [adminConfig.state.categories]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return allCategories;
    }

    return allCategories.filter((category) =>
      [category.title, category.description, ...(category.subcategories ?? []), ...(category.popularServices ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allCategories, query]);

  const selectedCategory = useMemo(
    () => filteredCategories.find((category) => category.id === selectedCategoryId) ?? filteredCategories[0] ?? allCategories[0],
    [allCategories, filteredCategories, selectedCategoryId],
  );

  const selectedServices = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    const marketplaceMatches = popularServices
      .filter((service) => service.category.toLowerCase().includes(selectedCategory.title.split(' ')[0].toLowerCase()))
      .map((service) => service.title);

    return [...(selectedCategory.popularServices ?? []), ...marketplaceMatches, ...defaultPopularServices]
      .filter((service, index, services) => services.indexOf(service) === index)
      .slice(0, isWide ? 6 : 4);
  }, [isWide, selectedCategory]);

  const appLanguage = adminConfig.state.appSettings.defaultLanguage.toUpperCase();
  const appCurrency = adminConfig.state.appSettings.defaultCurrency.toUpperCase();

  if (isWeb) {
    return (
      <SafeAreaView style={styles.webRoot}>
        <View style={styles.webHeader}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.webBackButton}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.webBackText}>{t('buttons.back', 'Back')}</Text>
          </Pressable>
          <FixoraLogo size={48} wordmark />
          <View style={styles.webSearch}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('categories.search.placeholder', 'Search categories, subcategories, services...')}
              placeholderTextColor="#8A94A8"
              style={styles.webSearchInput}
            />
          </View>
          <View style={styles.webSettings}>
            <View style={styles.webPill}><Text style={styles.webPillText}>{appLanguage}</Text></View>
            <View style={styles.webPill}><Text style={styles.webPillText}>{appCurrency}</Text></View>
          </View>
        </View>

        <View style={styles.webShell}>
          {isWide ? (
            <View style={styles.sidebar}>
              <Text style={styles.sidebarTitle}>{t('categories.title', 'Categories')}</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {allCategories.map((category) => {
                  const active = selectedCategory?.id === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      accessibilityRole="button"
                      onPress={() => setSelectedCategoryId(category.id)}
                      onHoverIn={() => setHoveredCategoryId(category.id)}
                      onHoverOut={() => setHoveredCategoryId(null)}
                      style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                    >
                      <Text style={styles.sidebarIcon}>{category.icon}</Text>
                      <Text style={[styles.sidebarText, active && styles.sidebarTextActive]} numberOfLines={1}>{category.title}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <ScrollView contentContainerStyle={styles.webContent} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#FFFFFF', '#F4F7FF', '#F7F1FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>{t('categories.kicker', 'Fixora marketplace')}</Text>
                <Text style={styles.webTitle}>{t('categories.web.title', 'Premium services by category')}</Text>
                <Text style={styles.webSubtitle}>
                  {t('categories.web.subtitle', 'Explore live AdminStore categories, browse subcategories, and book trusted local professionals from one polished marketplace view.')}
                </Text>
                <View style={styles.heroActions}>
                  <Pressable accessibilityRole="button" style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>{t('categories.actions.searchServices', 'Search services')}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={onBack} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>{t('categories.actions.backMarketplace', 'Back to marketplace')}</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.heroPanel}>
                <Text style={styles.heroPanelIcon}>{selectedCategory?.icon}</Text>
                <Text style={styles.heroPanelTitle}>{selectedCategory?.title}</Text>
                <Text style={styles.heroPanelMeta}>{t('categories.availableCount', `${filteredCategories.length} categories available`)}</Text>
              </View>
            </LinearGradient>

            <View style={[styles.categoryGrid, isWide && styles.webCategoryGrid]}>
              {filteredCategories.map((category) => {
                const active = selectedCategory?.id === category.id;
                const hovered = hoveredCategoryId === category.id;
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    onPress={() => setSelectedCategoryId(category.id)}
                    onHoverIn={() => setHoveredCategoryId(category.id)}
                    onHoverOut={() => setHoveredCategoryId(null)}
                    style={[
                      styles.categoryCard,
                      isWide && styles.webCategoryCard,
                      active && styles.categoryCardActive,
                      hovered && styles.categoryCardHover,
                    ]}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.softAccent }]}>
                      <Text style={styles.categoryIconText}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription} numberOfLines={2}>{category.description}</Text>
                    <Text style={[styles.categoryMeta, { color: category.accent }]}>{category.cityLabel}</Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedCategory ? (
              <View style={styles.detailGrid}>
                <DetailSection title={t('categories.sections.subcategories', 'Subcategories')} accent={selectedCategory.accent} items={selectedCategory.subcategories ?? defaultSubcategories} />
                <DetailSection title={t('categories.sections.popularServices', 'Popular services')} accent={selectedCategory.accent} items={selectedServices} />
                <DetailSection title={t('categories.sections.locations', 'Available locations')} accent={selectedCategory.accent} items={selectedCategory.localServices ?? [t('labels.local', 'Local')]} compact />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appRoot}>
      <ScrollView contentContainerStyle={styles.appContent} showsVerticalScrollIndicator={false}>
        <View style={styles.appHeader}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.appBackButton}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <FixoraLogo size={44} wordmark />
          <View style={styles.appCurrency}><Text style={styles.appCurrencyText}>{appCurrency}</Text></View>
        </View>

        <View style={styles.appSearch}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('categories.search.servicesPlaceholder', 'Search services')}
            placeholderTextColor="#8A94A8"
            style={styles.appSearchInput}
          />
        </View>

        <LinearGradient colors={['#EEF4FF', '#FFFFFF', '#F7F1FF']} style={styles.appHero}>
          <Text style={styles.kicker}>{t('categories.app.kicker', 'All categories')}</Text>
          <Text style={styles.appTitle}>{t('categories.app.title', 'Choose your service')}</Text>
          <Text style={styles.appSubtitle}>{t('categories.app.subtitle', 'Live categories from AdminStore, organized for quick booking.')}</Text>
        </LinearGradient>

        <View style={styles.appCategoryGrid}>
          {filteredCategories.map((category) => {
            const active = selectedCategory?.id === category.id;
            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                onPress={() => setSelectedCategoryId(category.id)}
                style={[styles.categoryCard, styles.appCategoryCard, active && styles.categoryCardActive]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.softAccent }]}>
                  <Text style={styles.categoryIconText}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryTitle} numberOfLines={2}>{category.title}</Text>
                <Text style={styles.categoryMeta}>{category.cityLabel}</Text>
              </Pressable>
            );
          })}
        </View>

        {selectedCategory ? (
          <>
            <DetailSection title={t('categories.sections.subcategories', 'Subcategories')} accent={selectedCategory.accent} items={selectedCategory.subcategories ?? defaultSubcategories} />
            <DetailSection title={t('categories.sections.popularServices', 'Popular services')} accent={selectedCategory.accent} items={selectedServices} />
          </>
        ) : null}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          ['home', t('home.nav.home', 'Home'), '⌂'],
          ['categories', t('categories.title', 'Categories'), '▦'],
          ['post', t('home.nav.post', 'Post'), '+'],
          ['orders', t('orders.title', 'Orders'), '◌'],
          ['profile', t('profile.title', 'Profile'), '♙'],
        ].map(([id, label, icon]) => (
          <Pressable key={id} accessibilityRole="button" onPress={id === 'home' ? onBack : undefined} style={[styles.navItem, id === 'categories' && styles.navItemActive]}>
            <Text style={[styles.navIcon, id === 'categories' && styles.navIconActive]}>{icon}</Text>
            <Text style={[styles.navLabel, id === 'categories' && styles.navLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function DetailSection({ title, items, accent, compact = false }: { title: string; items: string[]; accent: string; compact?: boolean }) {
  return (
    <View style={styles.detailSection}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{title}</Text>
        <View style={[styles.detailDot, { backgroundColor: accent }]} />
      </View>
      <View style={compact ? styles.compactList : styles.chipWrap}>
        {items.length > 0 ? items.map((item) => (
          <View key={item} style={compact ? styles.locationRow : styles.chip}>
            <Text style={compact ? styles.locationText : styles.chipText}>{item}</Text>
          </View>
        )) : (
          <View style={styles.chip}><Text style={styles.chipText}>Coming soon</Text></View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: { flex: 1, backgroundColor: '#F8FAFF' },
  webHeader: {
    minHeight: 76,
    paddingHorizontal: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECF6',
  },
  webBackButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F7F9FD',
    borderWidth: 1,
    borderColor: '#E4EAF4',
  },
  backArrow: { color: '#101828', fontSize: 30, lineHeight: 32, fontWeight: '900' },
  webBackText: { color: '#475467', fontSize: 13, fontWeight: '900' },
  webSearch: {
    flex: 1,
    minHeight: 46,
    maxWidth: 650,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#DDE5F2',
  },
  searchIcon: { color: '#667085', fontSize: 22, fontWeight: '900' },
  webSearchInput: { flex: 1, minHeight: 44, color: '#101828', fontSize: 14, fontWeight: '700' },
  webSettings: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  webPill: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5F2',
  },
  webPillText: { color: '#101828', fontSize: 13, fontWeight: '900' },
  webShell: { flex: 1, flexDirection: 'row', gap: 22, padding: 22 },
  sidebar: {
    width: 270,
    padding: 14,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9F4',
    shadowColor: '#667085',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  sidebarTitle: { marginBottom: 10, color: '#101828', fontSize: 18, fontWeight: '900' },
  sidebarItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sidebarItemActive: { backgroundColor: '#EEF4FF' },
  sidebarIcon: { width: 28, fontSize: 20, textAlign: 'center' },
  sidebarText: { flex: 1, color: '#475467', fontSize: 14, fontWeight: '800' },
  sidebarTextActive: { color: '#3458F6' },
  webContent: { flexGrow: 1, paddingBottom: 34 },
  hero: {
    minHeight: 298,
    padding: 34,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E6EAF4',
    overflow: 'hidden',
  },
  heroCopy: { flex: 1, maxWidth: 680 },
  kicker: { color: '#5D5FEF', fontSize: 12, letterSpacing: 0, textTransform: 'uppercase', fontWeight: '900' },
  webTitle: { marginTop: 10, color: '#101828', fontSize: 44, lineHeight: 52, fontWeight: '900' },
  webSubtitle: { marginTop: 12, maxWidth: 620, color: '#667085', fontSize: 17, lineHeight: 26, fontWeight: '700' },
  heroActions: { marginTop: 24, flexDirection: 'row', gap: 12 },
  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169F6',
    shadowColor: '#4169F6',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5F2',
  },
  secondaryButtonText: { color: '#344054', fontSize: 14, fontWeight: '900' },
  heroPanel: {
    width: 230,
    minHeight: 210,
    padding: 22,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  heroPanelIcon: { fontSize: 62 },
  heroPanelTitle: { marginTop: 14, color: '#101828', fontSize: 19, textAlign: 'center', fontWeight: '900' },
  heroPanelMeta: { marginTop: 8, color: '#667085', fontSize: 13, fontWeight: '800' },
  categoryGrid: { marginTop: 22, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  webCategoryGrid: { alignItems: 'stretch' },
  categoryCard: {
    minHeight: 160,
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9F4',
    shadowColor: '#667085',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  webCategoryCard: { width: 218 },
  appCategoryCard: { width: '48%', minHeight: 142 },
  categoryCardActive: { borderColor: '#A9B8FF', backgroundColor: '#FBFCFF' },
  categoryCardHover: { transform: [{ translateY: -3 }], shadowOpacity: 0.14 },
  categoryIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: { fontSize: 26 },
  categoryTitle: { marginTop: 14, color: '#101828', fontSize: 16, lineHeight: 21, fontWeight: '900' },
  categoryDescription: { marginTop: 7, color: '#667085', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  categoryMeta: { marginTop: 10, color: '#4169F6', fontSize: 12, fontWeight: '900' },
  detailGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  detailSection: {
    flexGrow: 1,
    flexBasis: 280,
    marginTop: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9F4',
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  detailTitle: { color: '#101828', fontSize: 18, fontWeight: '900' },
  detailDot: { width: 10, height: 10, borderRadius: 5 },
  chipWrap: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E4EAF4',
  },
  chipText: { color: '#344054', fontSize: 13, fontWeight: '900' },
  compactList: { marginTop: 14, gap: 8 },
  locationRow: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E4EAF4',
  },
  locationText: { color: '#344054', fontSize: 13, fontWeight: '800' },
  appRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  appContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 108 },
  appHeader: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appBackButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E4EAF4',
  },
  appCurrency: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E4EAF4',
  },
  appCurrencyText: { color: '#344054', fontSize: 12, fontWeight: '900' },
  appSearch: {
    marginTop: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E4EAF4',
  },
  appSearchInput: { flex: 1, minHeight: 48, color: '#101828', fontSize: 14, fontWeight: '700' },
  appHero: {
    marginTop: 18,
    minHeight: 166,
    padding: 20,
    borderRadius: 24,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EAF4',
  },
  appTitle: { marginTop: 8, color: '#101828', fontSize: 30, lineHeight: 36, fontWeight: '900' },
  appSubtitle: { marginTop: 8, color: '#667085', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  appCategoryGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 78,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E4EAF4',
  },
  navItem: { width: 66, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  navItemActive: { backgroundColor: '#EEF4FF' },
  navIcon: { color: '#667085', fontSize: 22, fontWeight: '900' },
  navIconActive: { color: '#4169F6' },
  navLabel: { marginTop: 2, color: '#667085', fontSize: 10, fontWeight: '800' },
  navLabelActive: { color: '#4169F6' },
});
