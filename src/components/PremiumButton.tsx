import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
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
      ? { backgroundColor: 'transparent', borderColor: theme.colors.strokeStrong, shadowColor: theme.colors.glow, shadowOpacity: theme.isDark ? 0.28 : 0.14 }
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
      {variant === 'primary' ? (
        <LinearGradient colors={theme.gradients.primaryButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
          {children}
          <Text style={[styles.text, styles.primaryText]}>{title}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.fill}>
          {children}
          <Text style={[styles.text, { color: theme.colors.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  fill: {
    flex: 1,
    minHeight: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
