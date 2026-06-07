import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '../context/CurrencyContext';
import { useTranslation } from '../i18n/I18nProvider';
import { RegisteredUser } from '../services/authStorage';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySwitcher } from './CurrencySwitcher';

type AccountDropdownProps = {
  user: RegisteredUser | null;
  onLogout: () => void;
  onOpenAdmin?: () => void;
};

function displayName(user: RegisteredUser | null) {
  if (!user) {
    return 'Fixora Account';
  }
  return `${user.firstName} ${user.lastName}`.trim();
}

function initials(user: RegisteredUser | null) {
  const name = displayName(user);
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function roleLabel(role?: string) {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  if (role === 'master') return 'Master';
  if (role === 'company') return 'Company';
  return 'Client';
}

function profileLabel(user: RegisteredUser | null, t: ReturnType<typeof useTranslation>['t']) {
  if (user?.role === 'master') return t('profile.masterCabinet', 'Master Cabinet');
  if (user?.role === 'company') return t('profile.companyCabinet', 'Company Cabinet');
  if (user?.role === 'admin' || user?.role === 'super_admin') return t('profile.adminProfile', 'Admin Profile');
  return t('profile.clientCabinet', 'Client Cabinet');
}

export function AccountDropdown({ user, onLogout, onOpenAdmin }: AccountDropdownProps) {
  const { t } = useTranslation();
  const { formatMoney } = useCurrency();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuMotion = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { icon: '◎', label: profileLabel(user, t), onPress: undefined },
    { icon: '▤', label: t('orders.myOrders', 'My Orders'), onPress: undefined },
    { icon: '$', label: t('wallet.title', 'Wallet'), onPress: undefined },
    { icon: '♡', label: t('favorites.title', 'Favorites'), onPress: undefined },
    { icon: '⚙', label: t('settings.title', 'Settings'), onPress: undefined },
  ];
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    Animated.timing(menuMotion, {
      toValue: open ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [menuMotion, open]);

  const closeMenu = () => setOpen(false);
  const logout = () => {
    closeMenu();
    onLogout();
  };
  const openAdmin = () => {
    closeMenu();
    onOpenAdmin?.();
  };

  return (
    <View style={styles.wrap}>
      {open ? <Pressable accessibilityRole="button" onPress={closeMenu} style={styles.backdrop} /> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((value) => !value)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={[styles.trigger, (open || hovered) && styles.triggerActive]}
      >
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials(user)}</Text></View>
        <View style={styles.triggerCopy}>
          <Text style={styles.name} numberOfLines={1}>{displayName(user)}</Text>
          <Text style={styles.sub}>{t('home.profile.account', 'Account')} {open ? '^' : 'v'}</Text>
        </View>
      </Pressable>
      {open ? (
        <Animated.View
          style={[
            styles.menu,
            {
              opacity: menuMotion,
              transform: [
                { translateY: menuMotion.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
                { scale: menuMotion.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
              ],
            },
          ]}
        >
          <View style={styles.identity}>
            <View style={styles.bigAvatar}><Text style={styles.bigAvatarText}>{initials(user)}</Text></View>
            <View style={styles.identityCopy}>
              <Text style={styles.identityName} numberOfLines={1}>{displayName(user)}</Text>
              <Text style={styles.email} numberOfLines={1}>{user?.email ?? 'guest@fixora.local'}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>{roleLabel(user?.role)}</Text></View>
                <View style={styles.onlineBadge}><View style={styles.onlineDot} /><Text style={styles.onlineText}>{t('profile.online', 'Online')}</Text></View>
              </View>
            </View>
          </View>

          <View style={styles.walletStrip}>
            <Text style={styles.walletLabel}>{t('wallet.balance', 'Balance')}</Text>
            <Text style={styles.walletValue}>{formatMoney(42000)}</Text>
          </View>

          <View style={styles.items}>
            {menuItems.map((item) => (
              <Pressable key={item.label} accessibilityRole="button" onPress={item.onPress} style={styles.item}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemText}>{item.label}</Text>
              </Pressable>
            ))}
            {isAdmin ? (
              <Pressable accessibilityRole="button" onPress={openAdmin} style={[styles.item, styles.adminItem]}>
                <Text style={styles.adminItemIcon}>▣</Text>
                <Text style={styles.adminItemText}>{t('admin.panel', 'Admin Panel')}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>◇ {t('labels.language', 'Language')}</Text>
            <LanguageSwitcher compact />
          </View>
          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>$ {t('labels.currency', 'Currency')}</Text>
            <CurrencySwitcher compact />
          </View>

          <Pressable accessibilityRole="button" onPress={logout} style={styles.logout}>
            <Text style={styles.logoutIcon}>↪</Text>
            <Text style={styles.logoutText}>{t('auth.logoutAccount', 'Log out of account')}</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    zIndex: 950,
    elevation: 22,
  },
  backdrop: {
    position: 'absolute',
    top: -120,
    right: -1800,
    width: 3600,
    height: 2600,
    zIndex: 940,
  },
  trigger: {
    minHeight: 48,
    maxWidth: 190,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
  },
  triggerActive: {
    backgroundColor: '#F7FAFF',
    shadowColor: '#4169F6',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EEF8',
  },
  avatarText: { color: '#07153C', fontSize: 12, fontWeight: '900' },
  triggerCopy: { flex: 1, minWidth: 0 },
  name: { color: '#07153C', fontSize: 14, fontWeight: '900' },
  sub: { color: '#68748D', fontSize: 11, fontWeight: '700' },
  menu: {
    position: 'absolute',
    top: 58,
    right: 0,
    width: 320,
    padding: 16,
    borderRadius: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7ECF6',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    zIndex: 951,
    elevation: 28,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bigAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DDE7FF',
  },
  bigAvatarText: { color: '#3155F6', fontSize: 16, fontWeight: '900' },
  identityCopy: { flex: 1, minWidth: 0 },
  identityName: { color: '#07153C', fontSize: 16, fontWeight: '900' },
  email: { marginTop: 2, color: '#667085', fontSize: 12, fontWeight: '700' },
  badgeRow: { marginTop: 7, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F1ECFF',
  },
  roleBadgeText: { color: '#673DE6', fontSize: 10, fontWeight: '900' },
  onlineBadge: {
    minHeight: 22,
    paddingHorizontal: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF3',
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#12B76A' },
  onlineText: { color: '#027A48', fontSize: 10, fontWeight: '900' },
  walletStrip: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E6EAF4',
  },
  walletLabel: { color: '#667085', fontSize: 12, fontWeight: '800' },
  walletValue: { color: '#07153C', fontSize: 14, fontWeight: '900' },
  items: { gap: 3 },
  item: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemIcon: {
    width: 22,
    color: '#5B6CFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  itemText: { color: '#344054', fontSize: 13, fontWeight: '800' },
  adminItem: { backgroundColor: '#F1ECFF' },
  adminItemIcon: { width: 22, color: '#673DE6', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  adminItemText: { color: '#673DE6', fontSize: 13, fontWeight: '900' },
  settingBlock: { gap: 6 },
  settingLabel: { color: '#667085', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  logout: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F3',
    borderWidth: 1,
    borderColor: '#FECDD6',
  },
  logoutIcon: { color: '#D92D20', fontSize: 15, fontWeight: '900' },
  logoutText: { color: '#D92D20', fontSize: 13, fontWeight: '900' },
});
