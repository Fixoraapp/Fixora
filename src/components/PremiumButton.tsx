import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii } from '../constants/theme';

type PremiumButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  children?: ReactNode;
};

export function PremiumButton({ title, onPress, variant = 'primary', style, children }: PremiumButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
      <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.lightText]}>{title}</Text>
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
  primary: {
    backgroundColor: colors.white,
    borderColor: colors.white,
    shadowColor: colors.blue,
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  secondary: {
    backgroundColor: colors.panelStrong,
    borderColor: colors.strokeStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.stroke,
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
  primaryText: {
    color: colors.background,
  },
  lightText: {
    color: colors.white,
  },
});
