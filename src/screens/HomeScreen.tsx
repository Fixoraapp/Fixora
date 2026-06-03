import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FixoraLogo } from '../components/FixoraLogo';
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

const webCategories = [
  ['☰', 'Все категории'],
  ['⚒', 'Строительство и ремонт'],
  ['♟', 'Уборка и клининг'],
  ['⚡', 'Электрика'],
  ['♒', 'Сантехника'],
  ['▣', 'Грузоперевозки'],
  ['▧', 'Ремонт техники'],
  ['▵', 'Автоуслуги'],
  ['✂', 'Красота и здоровье'],
  ['▥', 'Репетиторы и обучение'],
  ['▭', 'IT и компьютеры'],
  ['✎', 'Дизайн и творчество'],
  ['⌂', 'Все для дома'],
  ['♙', 'Бизнес и финансы'],
];

const webCategoryCards = [
  ['🏗', 'Строительство', '#FFF3E5'],
  ['♟', 'Уборка', '#EEF6FF'],
  ['⚡', 'Электрика', '#FFF8D9'],
  ['♒', 'Сантехника', '#EAF7FF'],
  ['▣', 'Грузоперевозки', '#EAFBF1'],
  ['⚙', 'Ремонт техники', '#F0F3FF'],
  ['▵', 'Автоуслуги', '#FFF0F0'],
  ['✂', 'Красота', '#F7EDFF'],
  ['▦', 'Все категории', '#F5F7FF'],
];

const webListings = [
  ['#F0F7FF', '$50 - $100', 'Установка сантехники', 'Ереван, Армения', '4.9', '(128)', 'plumbing'],
  ['#FFF7EA', '$30 - $70', 'Монтаж освещения', 'Гюмри, Армения', '4.8', '(96)', 'lighting'],
  ['#EFFAF3', '$40 - $80', 'Генеральная уборка', 'Ереван, Армения', '4.9', '(166)', 'cleaning'],
  ['#F8F0EA', '$25 - $60', 'Сборка мебели', 'Ванадзор, Армения', '4.7', '(84)', 'furniture'],
  ['#EEF2F7', '$60 - $120', 'Диагностика автомобиля', 'Ереван, Армения', '4.9', '(203)', 'auto'],
];

const categories = [
  { title: 'Auto', icon: 'A', color: '#EEF2FF' },
  { title: 'Home', icon: 'H', color: '#F0FDF4' },
  { title: 'Services', icon: 'S', color: '#FFF7ED' },
  { title: 'Beauty', icon: 'B', color: '#FDF2F8' },
  { title: 'Tech', icon: 'T', color: '#ECFEFF' },
  { title: 'Business', icon: 'B', color: '#F5F3FF' },
];

const offers = [
  { title: 'Apartment refresh', price: 'from 18,000 AMD', tag: 'Home' },
  { title: 'Car diagnostics', price: 'from 9,000 AMD', tag: 'Auto' },
  { title: 'Cleaning team', price: 'today available', tag: 'Services' },
];

const companies = ['Derakshan', 'Aram Shin', 'USAcars Armenia', 'Fixora Care', 'Urban Home'];

export default function HomeScreen({ location, role, currentUser, onOpenCategories, onOpenAdmin, onLogout }: HomeScreenProps) {
  const [tab, setTab] = useState('home');
  const roleLabel = role[0].toUpperCase() + role.slice(1);
  const isAdminUser = currentUser?.email.toLowerCase() === 'admin@gmail.com';

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webScreen}>
        <View style={styles.webHeader}>
          <FixoraLogo size={50} wordmark />
          <View style={styles.webSearch}>
            <Text style={styles.webSearchIcon}>⌕</Text>
            <TextInput placeholder="Поиск услуг, специалистов, компаний..." placeholderTextColor="#7E8AA3" style={styles.webSearchInput} />
            <Pressable accessibilityRole="button" style={styles.webSearchButton}>
              <Text style={styles.webSearchButtonText}>Найти</Text>
            </Pressable>
          </View>
          <View style={styles.webToolbar}>
            <Pressable accessibilityRole="button" style={styles.webSelect}><Text style={styles.webSelectText}>◎ Русский⌄</Text></Pressable>
            <Pressable accessibilityRole="button" style={styles.webSelect}><Text style={styles.webSelectText}>USD⌄</Text></Pressable>
            {['♢', '☏', '♡'].map((icon) => (
              <Pressable key={icon} accessibilityRole="button" style={styles.webIconButton}><Text style={styles.webIconText}>{icon}</Text></Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={onLogout} style={styles.webProfile}>
              <View style={styles.webAvatar}><Text style={styles.webAvatarText}>ИИ</Text></View>
              <View>
                <Text style={styles.webProfileName}>{isAdminUser ? 'Super Admin' : 'Иван Иванов'}</Text>
                <Text style={styles.webProfileSub}>Личный кабинет⌄</Text>
              </View>
            </Pressable>
            {isAdminUser ? (
              <Pressable accessibilityRole="button" onPress={onOpenAdmin} style={styles.webAdminButton}>
                <Text style={styles.webAdminButtonText}>Admin Panel</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.webMain}>
          <View style={styles.webSidebar}>
            {webCategories.map(([icon, label], index) => (
              <Pressable key={label} accessibilityRole="button" onPress={index === 0 ? onOpenCategories : undefined} style={[styles.webSideItem, index === 0 && styles.webSideActive]}>
                <Text style={[styles.webSideIcon, index === 0 && styles.webSideTextActive]}>{icon}</Text>
                <Text style={[styles.webSideText, index === 0 && styles.webSideTextActive]}>{label}</Text>
                {index > 0 ? <Text style={styles.webSideArrow}>›</Text> : null}
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={onOpenCategories} style={styles.webShowAll}>
              <Text style={styles.webShowAllText}>Показать все категории⌄</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.webContent} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#7A3FF3', '#4F8BFF', '#C8D7FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.webHero}>
              <View style={styles.webHeroText}>
                <Text style={styles.webHeroTitle}>Найдите лучших специалистов{'\n'}для любых задач</Text>
                <Text style={styles.webHeroSubtitle}>Быстрый поиск, проверенные специалисты, надежные услуги для вас и вашего бизнеса</Text>
                <View style={styles.webHeroActions}>
                  <Pressable accessibilityRole="button" style={styles.webHeroPrimary}><Text style={styles.webHeroPrimaryText}>Найти специалиста</Text></Pressable>
                  <Pressable accessibilityRole="button" style={styles.webHeroSecondary}><Text style={styles.webHeroSecondaryText}>Разместить заказ</Text></Pressable>
                </View>
              </View>
              <View style={styles.masterFigure}>
                <View style={styles.masterHead} />
                <View style={styles.masterBody} />
                <View style={styles.masterTool} />
              </View>
              <View style={styles.webHeroStats}>
                {[
                  ['☻', '5000+', 'специалистов'],
                  ['▤', '100K+', 'Выполненных заказов'],
                  ['★', '98%', 'Довольных клиентов'],
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
              {webCategoryCards.map(([icon, label, color]) => (
                <Pressable key={label} accessibilityRole="button" onPress={onOpenCategories} style={styles.webCategoryCard}>
                  <View style={[styles.webCategoryIcon, { backgroundColor: color }]}><Text style={styles.webCategoryIconText}>{icon}</Text></View>
                  <Text style={styles.webCategoryTitle}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.webListingsHeader}>
              <View style={styles.webTitleRow}>
                <Text style={styles.webSectionTitle}>Популярные объявления</Text>
                <Text style={styles.webNewBadge}>248 новых</Text>
              </View>
              <View style={styles.webFilters}>
                {['Все объявления', 'Рядом со мной⌄', 'Сначала новые⌄', 'Все объявления'].map((filter, index) => (
                  <Pressable key={`${filter}-${index}`} accessibilityRole="button" style={[styles.webFilter, index === 0 && styles.webFilterActive]}>
                    <Text style={[styles.webFilterText, index === 0 && styles.webFilterTextActive]}>{filter}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.webListingGrid}>
              {webListings.map(([color, price, title, place, rating, reviews, kind]) => (
                <View key={title} style={styles.webListingCard}>
                  <LinearGradient colors={[color, '#FFFFFF']} style={styles.webListingImage}>
                    <Text style={styles.webListingKind}>{kind}</Text>
                    <Text style={styles.webHeart}>♡</Text>
                  </LinearGradient>
                  <View style={styles.webListingBody}>
                    <Text style={styles.webListingPrice}>{price}</Text>
                    <Text style={styles.webListingTitle}>{title}</Text>
                    <Text style={styles.webListingPlace}>{place}</Text>
                    <Text style={styles.webRating}>★ {rating} <Text style={styles.webReviews}>{reviews}</Text></Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.webInfoGrid}>
              {[
                ['☻', 'Проверенные специалисты', 'Все специалисты проходят проверку и верификацию', '#F1ECFF'],
                ['✓', 'Безопасные сделки', 'Ваши платежи защищены нашей системой', '#EAFBF1'],
                ['☏', 'Быстрая поддержка', 'Наша команда поддержки всегда на связи', '#EEF6FF'],
                ['★', 'Гарантия качества', 'Гарантия на все работы и услуги', '#FFF5E6'],
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
          <Pressable accessibilityRole="button" onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput placeholder="Search services, companies, specialists" placeholderTextColor="#94A3B8" style={styles.searchInput} />
          <Text style={styles.cameraIcon}>▣</Text>
        </View>

        <LinearGradient colors={['#7C3AED', '#2D7CFF']} style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroKicker}>{location.city || 'Local marketplace'} / {roleLabel}</Text>
            <Text style={styles.heroTitle}>Trusted help, beautifully organized.</Text>
            <Text style={styles.heroSubtitle}>Explore premium offers, verified companies, and local services in one clean workspace.</Text>
          </View>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>F</Text></View>
        </LinearGradient>

        <SectionTitle title="Top offers" action="View all" onAction={onOpenCategories} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerRow}>
          {offers.map((offer) => (
            <View key={offer.title} style={styles.offerCard}>
              <LinearGradient colors={['#EEF2FF', '#FFFFFF']} style={styles.offerImage}>
                <Text style={styles.offerTag}>{offer.tag}</Text>
              </LinearGradient>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerPrice}>{offer.price}</Text>
            </View>
          ))}
        </ScrollView>

        <SectionTitle title="Categories" action="Open" onAction={onOpenCategories} />
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <Pressable key={category.title} accessibilityRole="button" onPress={onOpenCategories} style={[styles.categoryCard, { backgroundColor: category.color }]}>
              <View style={styles.categoryIcon}><Text style={styles.categoryIconText}>{category.icon}</Text></View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </Pressable>
          ))}
        </View>

        {['Company', 'Auto', 'Home', 'Services'].map((section) => (
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
          ['grid', '▦'],
          ['add', '+'],
          ['chat', '◌'],
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
  webHeader: { minHeight: 74, paddingHorizontal: 56, flexDirection: 'row', alignItems: 'center', gap: 28, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E7EDF7' },
  webSearch: { flex: 1, maxWidth: 560, minHeight: 42, borderRadius: 7, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D9E2F0', overflow: 'hidden' },
  webSearchIcon: { paddingLeft: 14, color: '#73809A', fontSize: 20, fontWeight: '900' },
  webSearchInput: { flex: 1, minHeight: 42, paddingHorizontal: 10, color: '#07153C', fontSize: 14, fontWeight: '700' },
  webSearchButton: { alignSelf: 'stretch', minWidth: 78, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6F45E8' },
  webSearchButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  webToolbar: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  webSelect: { minHeight: 40, paddingHorizontal: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D9E2F0' },
  webSelectText: { color: '#07153C', fontSize: 14, fontWeight: '900' },
  webIconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  webIconText: { color: '#07153C', fontSize: 20, fontWeight: '900' },
  webProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  webAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9EEF8' },
  webAvatarText: { color: '#07153C', fontSize: 12, fontWeight: '900' },
  webProfileName: { color: '#07153C', fontSize: 15, fontWeight: '900' },
  webProfileSub: { color: '#68748D', fontSize: 12, fontWeight: '700' },
  webAdminButton: { minHeight: 42, paddingHorizontal: 22, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6F45E8', shadowColor: '#6F45E8', shadowOpacity: 0.24, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  webAdminButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  webMain: { flex: 1, flexDirection: 'row', padding: 20, gap: 28 },
  webSidebar: { width: 244, paddingVertical: 2, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F2', shadowColor: '#6D7BA8', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  webSideItem: { minHeight: 39, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  webSideActive: { margin: 4, borderRadius: 6, backgroundColor: '#6F45E8' },
  webSideIcon: { width: 20, color: '#5D55E8', fontSize: 15, fontWeight: '900' },
  webSideText: { flex: 1, color: '#07153C', fontSize: 14, fontWeight: '700' },
  webSideTextActive: { color: '#FFFFFF' },
  webSideArrow: { color: '#70809C', fontSize: 22, fontWeight: '900' },
  webShowAll: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center' },
  webShowAllText: { color: '#5B35E8', fontSize: 14, fontWeight: '900' },
  webContent: { paddingBottom: 40 },
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
  webCategoryIconText: { fontSize: 24, fontWeight: '900' },
  webCategoryTitle: { marginTop: 8, color: '#07153C', fontSize: 13, fontWeight: '900' },
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoutButton: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  logoutText: { color: '#475569', fontSize: 12, fontWeight: '900' },
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
