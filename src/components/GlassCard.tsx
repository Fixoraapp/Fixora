import { ReactNode } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { radii } from '../constants/theme';
import { useTheme } from '../theme/useTheme';

type GlassCardProps = {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, onPress, selected = false, style }: GlassCardProps) {
  const { theme } = useTheme();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: selected ? `${theme.colors.accent}28` : theme.colors.card,
      borderColor: selected ? theme.colors.strokeStrong : theme.colors.stroke,
      shadowColor: theme.colors.glow,
      shadowOpacity: selected ? (theme.isDark ? 0.34 : 0.18) : (theme.isDark ? 0.2 : 0.1),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(22px)' } as ViewStyle : null),
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
