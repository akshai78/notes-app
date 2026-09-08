import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Colors, Fonts, Layout, Radius } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { tap } from '@/lib/haptics';

const ITEMS: { href: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { href: '/', label: 'Notes', icon: 'document-text-outline' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar-outline' },
  { href: '/archive', label: 'Archive', icon: 'archive-outline' },
  { href: '/profile', label: 'Profile', icon: 'person-outline' },
];

type Props = {
  onCreate: () => void;
};

export function Sidebar({ onCreate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, activeNotes, archivedNotes, trashedNotes } = useNotes();
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const counts: Record<string, number> = {
    '/': activeNotes.length,
    '/archive': archivedNotes.length + trashedNotes.length,
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 16 }]}>
      <Logo />
      <Pressable
        onPress={() => {
          tap();
          onCreate();
        }}
        style={({ pressed }) => [styles.add, pressed && { opacity: 0.88 }]}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.addLabel}>Add new</Text>
      </Pressable>

      <View style={styles.menu}>
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={[styles.item, active && styles.itemActive]}>
              <Ionicons name={item.icon} size={18} color={active ? Colors.primary : Colors.textSoft} />
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
              {counts[item.href] ? (
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{counts[item.href]}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />
      <Pressable onPress={() => router.push('/profile')} style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'M'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.profileName}>
            {profile.name}
          </Text>
          <Text numberOfLines={1} style={styles.profileEmail}>
            {profile.email}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: Layout.sidebarWidth,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: 18,
  },
  add: {
    marginTop: 22,
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addLabel: {
    color: '#fff',
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 15,
  },
  menu: {
    marginTop: 28,
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
  },
  itemActive: {
    backgroundColor: Colors.primarySoft,
  },
  itemLabel: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textSoft,
    fontWeight: '600',
  },
  itemLabelActive: {
    color: Colors.text,
  },
  badge: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: Colors.surface,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  badgeTextActive: {
    color: Colors.primary,
  },
  spacer: {
    flex: 1,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: Colors.bg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  profileName: {
    fontFamily: Fonts.semibold,
    fontWeight: '700',
    color: Colors.text,
    fontSize: 13,
  },
  profileEmail: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
});
