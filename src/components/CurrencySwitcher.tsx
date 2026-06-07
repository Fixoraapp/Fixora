import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCurrency, useCurrency } from '../context/CurrencyContext';
import { useTranslation } from '../i18n/I18nProvider';

export function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currentCurrency, currencies, setCurrency } = useCurrency();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const chooseCurrency = (currency: AppCurrency) => {
    setOpen(false);
    setCurrency(currency).catch(() => undefined);
  };

  return (
    <View style={styles.wrap}>
      {!compact ? <Text style={styles.label}>{t('labels.currency', 'Currency')}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => setOpen((value) => !value)} style={[styles.button, open && styles.buttonActive]}>
        <Text style={styles.buttonText}>{currentCurrency}</Text>
        <Text style={styles.chevron}>{open ? '^' : 'v'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {currencies.map((currency) => {
            const selected = currency === currentCurrency;
            return (
              <Pressable key={currency} accessibilityRole="button" onPress={() => chooseCurrency(currency)} style={[styles.item, selected && styles.itemActive]}>
                <Text style={[styles.itemText, selected && styles.itemTextActive]}>{currency}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    zIndex: 900,
    elevation: 20,
    gap: 8,
  },
  label: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '900',
  },
  button: {
    minHeight: 40,
    minWidth: 72,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2F0',
  },
  buttonActive: {
    borderColor: '#95B7FF',
    backgroundColor: '#F7FAFF',
  },
  buttonText: {
    color: '#07153C',
    fontSize: 13,
    fontWeight: '900',
  },
  chevron: {
    color: '#07153C',
    fontSize: 12,
    fontWeight: '900',
  },
  menu: {
    position: 'absolute',
    top: 46,
    right: 0,
    width: 104,
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9F4',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    zIndex: 901,
    elevation: 24,
  },
  item: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: '#EEF4FF',
  },
  itemText: {
    color: '#475467',
    fontSize: 12,
    fontWeight: '900',
  },
  itemTextActive: {
    color: '#3155F6',
  },
});
