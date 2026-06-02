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
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 34,
    backgroundColor: colors.background,
  },
  blueGlow: {
    position: 'absolute',
    top: -100,
    right: -140,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: colors.blue,
    opacity: 0.18,
  },
  purpleGlow: {
    position: 'absolute',
    bottom: 90,
    left: -160,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.purple,
    opacity: 0.15,
  },
});
