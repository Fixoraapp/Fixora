import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { colors } from '../constants/theme';
import { categories } from '../data/categories';
import { popularServices } from '../data/marketplace';

type CategoriesScreenProps = {
  onBack: () => void;
};

export default function CategoriesScreen({ onBack }: CategoriesScreenProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? 'repair');
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? categories[0],
    [selectedCategoryId],
  );
  const localServices = selectedCategory?.localServices ?? [];
  const categoryServices = popularServices.filter((service) =>
    selectedCategory ? service.category.toLowerCase().includes(selectedCategory.title.split(' ')[0].toLowerCase()) : false,
  );

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient
        colors={['#050816', '#07111F', '#09071D', '#050816']}
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
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.body}>Explore local services, subcategories, popular bookings, and premium professionals by vertical.</Text>

        <View style={styles.categoryGrid}>
          {categories.map((category) => {
            const selected = selectedCategoryId === category.id;

            return (
              <Pressable key={category.id} onPress={() => setSelectedCategoryId(category.id)} style={styles.categoryPress}>
                <LinearGradient
                  colors={selected ? ['rgba(21,123,255,0.34)', 'rgba(168,85,247,0.24)'] : ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.04)']}
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
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  backLabel: {
    color: '#AAB0C0',
    fontSize: 13,
    fontWeight: '800',
  },
  kicker: {
    marginTop: 12,
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
  body: {
    marginTop: 10,
    color: '#AAB0C0',
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
    borderColor: 'rgba(255,255,255,0.13)',
  },
  categoryCardActive: {
    borderColor: 'rgba(142,167,255,0.58)',
    shadowColor: '#157BFF',
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,123,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.38)',
  },
  categoryIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  categoryTitle: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  categoryBody: {
    marginTop: 6,
    color: '#AAB0C0',
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
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  detailMeta: {
    marginTop: 5,
    color: '#8EA7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  detailIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.24)',
  },
  detailIconText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  localChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: 'rgba(21,123,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(142,167,255,0.28)',
  },
  chipText: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  serviceTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  serviceMeta: {
    color: '#AAB0C0',
    fontSize: 11,
    fontWeight: '900',
  },
  searchButton: {
    marginTop: 18,
  },
});
