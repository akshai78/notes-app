import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';

type Props = {
  title?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  right?: React.ReactNode;
};

export function AppHeader({
  title = 'My notes',
  search = '',
  onSearchChange,
  showSearch = true,
  right,
}: Props) {
  const { profile } = useNotes();
  const { isPhone, showSidebar } = useResponsive();

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (isPhone) {
    return (
      <View style={styles.mobileWrap}>
        <View style={styles.mobileTop}>
          <Text style={styles.display}>{title}</Text>
          <Pressable onPress={() => router.push('/profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'M'}</Text>
          </Pressable>
        </View>
        {showSearch && onSearchChange ? (
          <SearchBar value={search} onChange={onSearchChange} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.desktopWrap, showSidebar && styles.desktopWithSidebar]}>
      <View style={styles.titleCol}>
        <Text style={styles.display}>{title}</Text>
      </View>
      <View style={styles.centerCol}>
        {showSearch && onSearchChange ? (
          <SearchBar value={search} onChange={onSearchChange} />
        ) : null}
      </View>
      <View style={styles.profileRow}>
        {right}
        <Text numberOfLines={1} style={styles.profileName}>
          {profile.name}
        </Text>
        <Pressable onPress={() => router.push('/profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'M'}</Text>
        </Pressable>
        <Pressable hitSlop={8} style={styles.menuBtn}>
          <Ionicons name="menu-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileWrap: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  mobileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  desktopWithSidebar: {
    paddingTop: Spacing.lg,
  },
  titleCol: {
    flex: 1,
  },
  centerCol: {
    flex: 2,
    maxWidth: 420,
    alignSelf: 'center',
  },
  display: {
    fontFamily: Fonts.bold,
    fontSize: Typography.display.fontSize,
    fontWeight: Typography.display.fontWeight,
    letterSpacing: Typography.display.letterSpacing,
    lineHeight: Typography.display.lineHeight,
    color: Colors.text,
    textTransform: 'uppercase',
  },
  profileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  profileName: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSoft,
    maxWidth: 140,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
