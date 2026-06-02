import { Pressable, StyleSheet, View } from 'react-native';

type StepDotsProps = {
  count: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
};

export function StepDots({ count, activeIndex, onSelect }: StepDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          accessibilityLabel={`Step ${index + 1} of ${count}`}
          onPress={() => onSelect?.(index)}
          style={[styles.dot, index === activeIndex && styles.active]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  active: {
    width: 25,
    backgroundColor: '#FFFFFF',
    shadowColor: '#A855F7',
    shadowOpacity: 0.75,
    shadowRadius: 10,
  },
});
