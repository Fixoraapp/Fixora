import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { colors, typography } from '../constants/theme';
import { categories } from '../data/categories';

type CategoriesScreenProps = {
  onBack: () => void;
};

export default function CategoriesScreen({ onBack }: CategoriesScreenProps) {
  return (
    <AppShell>
      <PremiumButton title="Back to Home" variant="ghost" onPress={onBack} style={styles.back} />
      <Text style={styles.kicker}>Fixora marketplace</Text>
      <Text style={styles.title}>Categories</Text>
      <Text style={styles.body}>Every vertical is ready for local supply, trust badges, and premium listings.</Text>
      <View style={styles.list}>
        {categories.map((category) => (
          <GlassCard key={category.id}>
            <Text style={styles.cardTitle}>{category.title}</Text>
            <Text style={styles.cardBody}>{category.description}</Text>
          </GlassCard>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    minHeight: 44,
    marginBottom: 18,
  },
  kicker: {
    color: colors.purple,
    fontSize: typography.small,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '900',
    letterSpacing: 0,
  },
  body: {
    marginTop: 10,
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    letterSpacing: 0,
  },
  list: {
    marginTop: 22,
    gap: 10,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardBody: {
    marginTop: 7,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
});
