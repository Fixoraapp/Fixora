import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { accentPalette, AccentColor } from '../theme/colors';
import { AnimationSpeed, ThemeMode } from '../theme/themes';
import { useTheme } from '../theme/useTheme';

const themeModes: Array<{ id: ThemeMode; title: string; subtitle: string }> = [
  { id: 'dark', title: 'Dark', subtitle: 'Fixora neon luxury' },
  { id: 'light', title: 'Light', subtitle: 'Clean Apple style' },
  { id: 'amoled', title: 'AMOLED', subtitle: 'Pure black premium' },
  { id: 'system', title: 'System', subtitle: 'Follow device' },
];

const animationSpeeds: AnimationSpeed[] = ['slow', 'normal', 'fast'];

export function AppearanceSettings() {
  const {
    theme,
    preferences,
    setThemeMode,
    setAccentColor,
    setFontScale,
    setAnimationSpeed,
    setReduceMotion,
  } = useTheme();

  return (
    <GlassCard style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Appearance</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Theme, accent, size, and motion.</Text>
        </View>
        <View style={[styles.liveBadge, { borderColor: theme.colors.strokeStrong, backgroundColor: `${theme.colors.accent}1E` }]}>
          <Text style={[styles.liveBadgeText, { color: theme.colors.accent }]}>LIVE</Text>
        </View>
      </View>

      <View style={styles.previewRow}>
        {themeModes.map((mode) => {
          const selected = preferences.selectedTheme === mode.id;
          const isLight = mode.id === 'light';
          return (
            <Pressable key={mode.id} onPress={() => setThemeMode(mode.id)} style={[styles.modeCard, { borderColor: selected ? theme.colors.accent : theme.colors.stroke, backgroundColor: selected ? `${theme.colors.accent}18` : theme.colors.surface }]}>
              <LinearGradient
                colors={isLight ? ['#FFFFFF', '#EEF4FF', '#F6F1FF'] : mode.id === 'amoled' ? ['#000000', '#050505', '#12051F'] : ['#050816', '#07111F', '#160A2A']}
                style={styles.previewMini}
              >
                <View style={[styles.previewTop, { backgroundColor: isLight ? '#DCE7FF' : 'rgba(255,255,255,0.16)' }]} />
                <View style={[styles.previewLine, { backgroundColor: accentPalette[preferences.accentColor] }]} />
                <View style={[styles.previewBlock, { backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.14)' }]} />
              </LinearGradient>
              <Text style={[styles.modeTitle, { color: theme.colors.text }]}>{mode.title}</Text>
              <Text style={[styles.modeSubtitle, { color: theme.colors.muted }]}>{mode.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.muted }]}>Accent color</Text>
      <View style={styles.swatchGrid}>
        {(Object.keys(accentPalette) as AccentColor[]).map((accent) => {
          const selected = preferences.accentColor === accent;
          return (
            <Pressable key={accent} onPress={() => setAccentColor(accent)} style={[styles.swatchShell, selected && { borderColor: accentPalette[accent] }]}>
              <View style={[styles.swatch, { backgroundColor: accentPalette[accent] }]}>
                {selected ? <Text style={styles.swatchCheck}>OK</Text> : null}
              </View>
              <Text style={[styles.swatchLabel, { color: theme.colors.text }]}>{accent}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.muted }]}>Font size</Text>
      <View style={styles.segmentRow}>
        {[0.95, 1, 1.1, 1.2].map((scale) => (
          <Pressable key={scale} onPress={() => setFontScale(scale)} style={[styles.segmentButton, { borderColor: preferences.fontScale === scale ? theme.colors.accent : theme.colors.stroke, backgroundColor: preferences.fontScale === scale ? `${theme.colors.accent}1F` : theme.colors.surface }]}>
            <Text style={[styles.segmentText, { color: theme.colors.text }]}>{Math.round(scale * 100)}%</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.muted }]}>Animation speed</Text>
      <View style={styles.segmentRow}>
        {animationSpeeds.map((speed) => (
          <Pressable key={speed} onPress={() => setAnimationSpeed(speed)} style={[styles.segmentButton, { borderColor: preferences.animationSpeed === speed ? theme.colors.accent : theme.colors.stroke, backgroundColor: preferences.animationSpeed === speed ? `${theme.colors.accent}1F` : theme.colors.surface }]}>
            <Text style={[styles.segmentText, { color: theme.colors.text }]}>{speed}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => setReduceMotion(!preferences.reduceMotion)} style={[styles.motionRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.stroke }]}>
        <View>
          <Text style={[styles.motionTitle, { color: theme.colors.text }]}>Reduce Motion</Text>
          <Text style={[styles.motionSubtitle, { color: theme.colors.muted }]}>Lower pulse and transition intensity.</Text>
        </View>
        <View style={[styles.toggle, preferences.reduceMotion && { backgroundColor: theme.colors.accent }]}>
          <View style={[styles.knob, preferences.reduceMotion && styles.knobOn]} />
        </View>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 18,
    borderRadius: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    borderWidth: 1,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  previewRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 146,
    borderRadius: 17,
    padding: 10,
    borderWidth: 1,
  },
  previewMini: {
    height: 70,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
  },
  previewTop: {
    width: '42%',
    height: 8,
    borderRadius: 4,
  },
  previewLine: {
    width: '72%',
    height: 6,
    borderRadius: 3,
  },
  previewBlock: {
    width: '100%',
    height: 22,
    borderRadius: 8,
  },
  modeTitle: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: '900',
  },
  modeSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatchShell: {
    width: '22%',
    minWidth: 68,
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCheck: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  swatchLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  motionRow: {
    marginTop: 16,
    minHeight: 62,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  motionTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  motionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: 'rgba(142,167,255,0.24)',
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  knobOn: {
    transform: [{ translateX: 20 }],
  },
});
