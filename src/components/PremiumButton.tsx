import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { radii } from '../constants/theme';
import { useTheme } from '../theme/useTheme';

type PremiumButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  children?: ReactNode;
};

export function PremiumButton({ title, onPress, variant = 'primary', style, children }: PremiumButtonProps) {
  const { theme } = useTheme();
  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: theme.isDark ? theme.colors.text : theme.colors.accent, borderColor: theme.isDark ? theme.colors.text : theme.colors.accent }
      : variant === 'secondary'
        ? { backgroundColor: theme.colors.surfaceStrong, borderColor: theme.colors.strokeStrong }
        : { backgroundColor: 'transparent', borderColor: theme.colors.stroke };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
      <Text style={[styles.text, { color: variant === 'primary' ? theme.colors.textInverse : theme.colors.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
