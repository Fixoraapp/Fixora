import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../constants/theme';

type GlassCardProps = {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
};

export function GlassCard({ children, onPress, selected = false }: GlassCardProps) {
  const style = [styles.card, selected && styles.selected];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: 16,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  selected: {
    backgroundColor: 'rgba(8,168,255,0.16)',
    borderColor: colors.blue,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
