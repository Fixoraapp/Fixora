import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n/I18nProvider';
import { AppLanguage } from '../i18n/defaultTranslations';

const languages: Array<{ id: AppLanguage; label: string }> = [
  { id: 'ru', label: 'Р СѓСЃСЃРєРёР№' },
  { id: 'hy', label: 'ХЂХЎХµХҐЦЂХҐХ¶' },
  { id: 'en', label: 'English' },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {!compact ? <Text style={styles.label}>{t('labels.language', 'Language')}</Text> : null}
      <View style={styles.options}>
        {languages.map((item) => {
          const selected = language === item.id;
          return (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => { setLanguage(item.id).catch(() => undefined); }} style={[styles.option, selected && styles.optionActive]}>
              <Text style={[styles.optionText, selected && styles.optionTextActive]}>{compact ? item.id.toUpperCase() : item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  wrapCompact: {
    minWidth: 124,
  },
  label: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '900',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  option: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionActive: {
    backgroundColor: 'rgba(21,123,255,0.2)',
    borderColor: 'rgba(142,167,255,0.48)',
  },
  optionText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '900',
  },
  optionTextActive: {
    color: '#111827',
  },
});

