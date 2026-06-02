import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { colors } from '../constants/theme';
import { useAdminConfig } from '../context/AdminConfigContext';
import { categories } from '../data/categories';
import { popularServices } from '../data/marketplace';
import { useTranslation } from '../i18n/I18nProvider';

type CategoriesScreenProps = {
  onBack: () => void;
};

export default function CategoriesScreen({ onBack }: CategoriesScreenProps) {
  const adminConfig = useAdminConfig();
  const { t } = useTranslation();
  const adminCategories = useMemo(
    () => adminConfig.state.categories
      .filter((category) => category.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        id: category.id,
        title: category.name_en || category.slug,
        description: `${category.availableCities.join(', ') || 'Local'} marketplace category`,
        icon: category.icon,
        subcategories: category.availableRegions,
        popularServices: [category.name_en],
        localServices: category.availableCities,
      })),
    [adminConfig.state.categories],
  );
  const visibleCategories = adminCategories.length > 0 ? adminCategories : categories;
  const [selectedCategoryId, setSelectedCategoryId] = useState(visibleCategories[0]?.id ?? 'repair');
  const selectedCategory = useMemo(
    () => visibleCategories.find((category) => category.id === selectedCategoryId) ?? visibleCategories[0],
    [selectedCategoryId, visibleCategories],
  );
  const localServices = selectedCategory?.localServices ?? [];
  const categoryServices = popularServices.filter((service) =>
    selectedCategory ? service.category.toLowerCase().includes(selectedCategory.title.split(' ')[0].toLowerCase()) : false,
  );

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient
        colors={['#F7F8FC', '#FFFFFF', '#F5F0FF', '#EEF4FF']}
        locations={[0, 0.45, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.blueGlow} />
      <View style={styles.purpleGlow} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
          <Text style={styles.backLabel}>Back to marketplace</Text>
        </Pressable>

        <Text style={styles.kicker}>Fixora marketplace</Text>
        <Text style={styles.title}>{t('categories.title', 'Categories')}</Text>
        <Text style={styles.body}>{t('categories.subtitle', 'Explore local services, subcategories, popular bookings, and premium professionals by vertical.')}</Text>

        <View style={styles.categoryGrid}>
          {visibleCategories.map((category) => {
            const selected = selectedCategoryId === category.id;

            return (
              <Pressable key={category.id} onPress={() => setSelectedCategoryId(category.id)} style={styles.categoryPress}>
                <LinearGradient
                  colors={selected ? ['rgba(214,91,255,0.14)', 'rgba(45,124,255,0.12)'] : ['#FFFFFF', '#FFFFFF']}
                  style={[styles.categoryCard, selected && styles.categoryCardActive]}
                >
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryIconText}>{category.icon ?? category.title.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryBody}>{category.description}</Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {selectedCategory ? (
          <GlassCard style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailTitle}>{selectedCategory.title}</Text>
                <Text style={styles.detailMeta}>Local-first category workspace</Text>
              </View>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>{selectedCategory.icon}</Text>
              </View>
            </View>
            <Text style={styles.sectionLabel}>Subcategories</Text>
            <View style={styles.chipWrap}>
              {(selectedCategory.subcategories ?? []).map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionLabel}>Popular services</Text>
            <View style={styles.serviceList}>
              {[...(selectedCategory.popularServices ?? []), ...categoryServices.map((service) => service.title)].slice(0, 4).map((item) => (
                <View key={item} style={styles.serviceRow}>
                  <Text style={styles.serviceTitle}>{item}</Text>
                  <Text style={styles.serviceMeta}>Recommended</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionLabel}>Local services</Text>
            <View style={styles.chipWrap}>
              {localServices.map((item) => (
                <View key={item} style={styles.localChip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
            <GradientButton title="Search this category" onPress={onBack} style={styles.searchButton} />
          </GlassCard>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  blueGlow: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#2D7CFF',
    opacity: 0.1,
  },
  purpleGlow: {
    position: 'absolute',
    bottom: 70,
    right: -170,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#D65BFF',
    opacity: 0.1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 42,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  backLabel: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '800',
  },
  kicker: {
    marginTop: 12,
    color: '#6D5DFB',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: colors.text,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
  body: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  categoryGrid: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPress: {
    width: '48%',
    minWidth: 150,
  },
  categoryCard: {
    minHeight: 158,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#6D5DFB',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  categoryCardActive: {
    borderColor: 'rgba(109,93,251,0.32)',
    shadowColor: '#6D5DFB',
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(109,93,251,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(109,93,251,0.18)',
  },
  categoryIconText: {
    color: '#6D5DFB',
    fontSize: 12,
    fontWeight: '900',
  },
  categoryTitle: {
    marginTop: 12,
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  categoryBody: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  detailCard: {
    marginTop: 22,
    borderRadius: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  detailTitle: {
    color: '#111827',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  detailMeta: {
    marginTop: 5,
    color: '#6D5DFB',
    fontSize: 12,
    fontWeight: '900',
  },
  detailIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(109,93,251,0.1)',
  },
  detailIconText: {
    color: '#6D5DFB',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  localChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: 'rgba(45,124,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45,124,255,0.18)',
  },
  chipText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '900',
  },
  serviceList: {
    gap: 8,
  },
  serviceRow: {
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
  },
  serviceMeta: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '900',
  },
  searchButton: {
    marginTop: 18,
  },
});
