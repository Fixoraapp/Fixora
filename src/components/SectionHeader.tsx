import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type SectionHeaderProps = {
  title: string;
  action?: string;
};

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  action: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
