import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

export type LocationSelectorItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: ReactNode;
};

type LocationSelectorProps = {
  items: LocationSelectorItem[];
  selectedId?: string;
  onSelect: (item: LocationSelectorItem) => void;
};

export function LocationSelector({ items, selectedId, onSelect }: LocationSelectorProps) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <GlassCard
          key={item.id}
          selected={selectedId === item.id}
          onPress={() => onSelect(item)}
          style={styles.card}
        >
          <View style={styles.row}>
            {item.leading ? <View style={styles.leading}>{item.leading}</View> : null}
            <View style={styles.textBlock}>
              <Text style={styles.title}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
            </View>
            {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.title}`}
              onPress={() => onSelect(item)}
              style={[styles.check, selectedId === item.id && styles.checkActive]}
            >
              <Text style={styles.checkText}>{selectedId === item.id ? 'вњ“' : 'вЂє'}</Text>
            </Pressable>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    padding: 13,
    borderRadius: 14,
  },
  row: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leading: {
    minWidth: 34,
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  meta: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '800',
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#FFFFFF',
  },
  checkActive: {
    backgroundColor: '#2D7CFF',
    borderColor: '#78A8FF',
    shadowColor: '#2D7CFF',
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  checkText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
  },
});

