import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type FixoraLogoProps = {
  size?: number;
  wordmark?: boolean;
};

export function FixoraLogo({ size = 56, wordmark = false }: FixoraLogoProps) {
  return (
    <View style={styles.row}>
      <LinearGradient colors={['#D65BFF', '#6D5DFB', '#2D7CFF']} style={[styles.mark, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <View style={[styles.topBlade, { height: size * 0.23, borderRadius: size * 0.12 }]} />
        <View style={[styles.midBlade, { height: size * 0.2, top: size * 0.39, borderRadius: size * 0.11 }]} />
        <Text style={[styles.letter, { fontSize: size * 0.74, lineHeight: size * 0.82 }]}>F</Text>
      </LinearGradient>
      {wordmark ? <Text style={styles.wordmark}>Fixora</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mark: {
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    shadowColor: colors.blue,
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  topBlade: {
    position: 'absolute',
    top: '18%',
    left: '18%',
    right: '10%',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  midBlade: {
    position: 'absolute',
    left: '18%',
    right: '22%',
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  letter: {
    color: 'rgba(255,255,255,0.24)',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  wordmark: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
