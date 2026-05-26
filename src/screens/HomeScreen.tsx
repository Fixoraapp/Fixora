import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { FixoraLogo } from '../components/FixoraLogo';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { SectionHeader } from '../components/SectionHeader';
import { TextField } from '../components/TextField';
import { colors, typography } from '../constants/theme';
import { categories } from '../data/categories';
import { popularServices, professionals } from '../data/marketplace';
import { LocationSelection, UserRole } from '../types/navigation';

type HomeScreenProps = {
  location: LocationSelection;
  role: UserRole;
  onOpenCategories: () => void;
};

export default function HomeScreen({ location, role, onOpenCategories }: HomeScreenProps) {
  const premiumProfessionals = professionals.filter((item) => item.premium);
  const nearbyProfessionals = professionals.filter((item) => item.city === location.city).slice(0, 3);
  const nearby = nearbyProfessionals.length > 0 ? nearbyProfessionals : professionals.slice(0, 3);

  return (
    <AppShell>
      <View style={styles.header}>
        <FixoraLogo wordmark />
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{role}</Text>
        </View>
      </View>
      <Text style={styles.location}>{location.city}, {location.region}</Text>
      <Text style={styles.title}>What do you need done?</Text>
      <TextField placeholder="Search services, experts, companies" style={styles.search} />

      <SectionHeader title="Categories" action="View all" />
      <View style={styles.categoryGrid}>
        {categories.slice(0, 6).map((category) => (
          <GlassCard key={category.id} onPress={onOpenCategories}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </GlassCard>
        ))}
      </View>
      <PremiumButton title="Open All Categories" variant="secondary" onPress={onOpenCategories} style={styles.openCategories} />

      <SectionHeader title="Popular services" />
      <View style={styles.list}>
        {popularServices.map((service) => (
          <GlassCard key={service.id}>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{service.title}</Text>
                <Text style={styles.itemMeta}>{service.category}</Text>
              </View>
              <Text style={styles.price}>{service.price}</Text>
            </View>
          </GlassCard>
        ))}
      </View>

      <SectionHeader title="Top professionals" />
      <View style={styles.list}>
        {professionals.slice(0, 3).map((pro) => (
          <ProfessionalCard key={pro.id} pro={pro} />
        ))}
      </View>

      <SectionHeader title="Nearby professionals" />
      <View style={styles.list}>
        {nearby.map((pro) => (
          <ProfessionalCard key={`near-${pro.id}`} pro={pro} />
        ))}
      </View>

      <SectionHeader title="Premium professionals" />
      <View style={styles.premiumBlock}>
        <Text style={styles.premiumTitle}>Elite experts for high-trust work</Text>
        <Text style={styles.premiumBody}>Verified premium masters, concierge teams, and VIP-ready companies.</Text>
        <View style={styles.list}>
          {premiumProfessionals.map((pro) => (
            <ProfessionalCard key={`premium-${pro.id}`} pro={pro} premium />
          ))}
        </View>
      </View>
    </AppShell>
  );
}

function ProfessionalCard({
  pro,
  premium = false,
}: {
  pro: { name: string; role: string; rating: number; city: string; price: string; premium?: boolean; verified?: boolean };
  premium?: boolean;
}) {
  return (
    <GlassCard selected={premium || pro.premium}>
      <View style={styles.rowBetween}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{pro.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.itemTitle}>{pro.name}</Text>
          <Text style={styles.itemMeta}>{pro.role} / {pro.city}</Text>
          <Text style={styles.rating}>{pro.verified ? 'Verified / ' : ''}{pro.rating.toFixed(2)} rating</Text>
        </View>
        <Text style={styles.price}>{pro.price}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rolePill: {
    maxWidth: 138,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.panelStrong,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  roleText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  location: {
    marginTop: 24,
    color: colors.blue,
    fontSize: typography.small,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: typography.title,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: 0,
  },
  search: {
    marginTop: 18,
  },
  categoryGrid: {
    gap: 10,
  },
  categoryTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  openCategories: {
    marginTop: 12,
  },
  list: {
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  itemTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
  itemMeta: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  rating: {
    marginTop: 6,
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  price: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,168,255,0.17)',
    borderWidth: 1,
    borderColor: colors.strokeStrong,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  premiumBlock: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(139,53,255,0.14)',
    borderWidth: 1,
    borderColor: colors.strokeStrong,
  },
  premiumTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  premiumBody: {
    marginTop: 8,
    marginBottom: 14,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
});
