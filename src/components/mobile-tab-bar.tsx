import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts, Layout, Radius, Shadow, Spacing } from '@/constants/theme';
import { tap } from '@/lib/haptics';

type Tab = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: Tab[] = [
  { name: 'index', label: 'Notes', icon: 'document-text-outline', iconActive: 'document-text' },
  { name: 'calendar', label: 'Calendar', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'archive', label: 'Archive', icon: 'archive-outline', iconActive: 'archive' },
  { name: 'profile', label: 'You', icon: 'person-outline', iconActive: 'person' },
];

type Props = {
  current: string;
  onTab: (name: string) => void;
  onCreate: () => void;
};

export function MobileTabBar({ current, onTab, onCreate }: Props) {
  const insets = useSafeAreaInsets();
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row}>
        {left.map((tab) => (
          <TabButton key={tab.name} tab={tab} active={current === tab.name} onPress={() => onTab(tab.name)} />
        ))}
        <View style={styles.fabSlot}>
          <Pressable
            onPress={() => {
              tap();
              onCreate();
            }}
            style={({ pressed }) => [styles.fab, Shadow.fab, pressed && { transform: [{ scale: 0.96 }] }]}>
            <Ionicons name="add" size={28} color="#fff" />
          </Pressable>
        </View>
        {right.map((tab) => (
          <TabButton key={tab.name} tab={tab} active={current === tab.name} onPress={() => onTab(tab.name)} />
        ))}
      </View>
    </View>
  );
}

function TabButton({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tab} accessibilityRole="button" accessibilityLabel={tab.label}>
      <Ionicons name={active ? tab.iconActive : tab.icon} size={22} color={active ? Colors.text : Colors.textMuted} />
      <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  row: {
    minHeight: Layout.tabBarHeight - 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  fabSlot: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fab: {
    width: 58,
    height: 58,
    marginTop: -28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
