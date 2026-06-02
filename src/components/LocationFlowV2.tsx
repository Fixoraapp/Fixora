import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from './GradientButton';
import { useTheme } from '../theme/useTheme';

type LocationFlowV2Action = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

type LocationFlowV2Props = {
  title?: string;
  status?: string;
  body?: ReactNode;
  primaryAction?: LocationFlowV2Action;
  secondaryAction?: LocationFlowV2Action;
  children?: ReactNode;
};

export function LocationFlowV2({
  title = 'LocationFlowV2',
  status,
  body,
  primaryAction,
  secondaryAction,
  children,
}: LocationFlowV2Props) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {status ? <Text style={[styles.status, { color: theme.colors.muted }]}>{status}</Text> : null}
        </View>
        {body ? <View style={styles.body}>{body}</View> : null}
        {children}
      </ScrollView>

      {(primaryAction || secondaryAction) ? (
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          {primaryAction ? (
            <GradientButton title={primaryAction.title} onPress={primaryAction.onPress} disabled={primaryAction.disabled} />
          ) : null}
          {secondaryAction ? (
            <Pressable
              accessibilityRole="button"
              disabled={secondaryAction.disabled}
              onPress={secondaryAction.onPress}
              style={[styles.secondaryButton, { borderColor: theme.colors.stroke, backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.secondaryText, { color: theme.colors.text }]}>{secondaryAction.title}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 150,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  status: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  body: {
    marginTop: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '900',
  },
});
