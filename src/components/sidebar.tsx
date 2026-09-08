import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { AccentDots, Colors, Fonts, Layout, Radius, Spacing } from '@/constants/theme';
import { tap } from '@/lib/haptics';

const ITEMS: { href: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { href: '/calendar', label: 'Calendar', icon: 'calendar-outline' },
  { href: '/archive', label: 'Archive', icon: 'archive-outline' },
  { href: '/archive?pane=trash', label: 'Trash', icon: 'trash-outline' },
];

type Props = {
  onCreate: () => void;
};

export function Sidebar({ onCreate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useGlobalSearchParams<{ pane?: string }>();
  const insets = useSafeAreaInsets();
  const onArchive = pathname.startsWith('/archive');
  const onTrash = onArchive && params.pane === 'trash';

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }]}>
      <Logo />

      <View style={styles.addSection}>
        <Text style={styles.addLabel}>Add new</Text>
        <View style={styles.dots}>
          <Pressable
            onPress={() => {
              tap();
              onCreate();
            }}
            style={[styles.dot, { backgroundColor: AccentDots.yellow }]}
          />
          <Pressable
            onPress={() => {
              tap();
              onCreate();
            }}
            style={[styles.dot, { backgroundColor: AccentDots.blue }]}
          />
          <Pressable
            onPress={() => {
              tap();
              onCreate();
            }}
            style={[styles.dot, { backgroundColor: AccentDots.red }]}
          />
        </View>
      </View>

      <View style={styles.menu}>
        <Pressable
          onPress={() => router.push('/')}
          style={[styles.item, pathname === '/' && styles.itemActive]}>
          <Ionicons name="document-text-outline" size={20} color={pathname === '/' ? Colors.text : Colors.textSoft} />
          <Text style={[styles.itemLabel, pathname === '/' && styles.itemLabelActive]}>Notes</Text>
        </Pressable>
        {ITEMS.map((item) => {
          const active =
            item.label === 'Trash'
              ? onTrash
              : item.label === 'Archive'
                ? onArchive && !onTrash
                : pathname.startsWith(item.href);
          return (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href as never)}
              style={[styles.item, active && styles.itemActive]}>
              <Ionicons name={item.icon} size={20} color={active ? Colors.text : Colors.textSoft} />
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: Layout.sidebarWidth,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
  },
  addSection: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  addLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSoft,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: Radius.pill,
  },
  menu: {
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
    height: 44,
    borderRadius: Radius.sm,
  },
  itemActive: {
    backgroundColor: Colors.primarySoft,
  },
  itemLabel: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textSoft,
    fontWeight: '500',
  },
  itemLabelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
});
