import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

type AppShellProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function AppShell({ children, scroll = true }: AppShellProps) {
  const content = (
    <>
      <View style={styles.blueGlow} />
      <View style={styles.purpleGlow} />
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.root}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.content}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: colors.background,
  },
  blueGlow: {
    position: 'absolute',
    top: -70,
    right: -120,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: colors.blue,
    opacity: 0.14,
  },
  purpleGlow: {
    position: 'absolute',
    bottom: 120,
    left: -130,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: colors.purple,
    opacity: 0.13,
  },
});
