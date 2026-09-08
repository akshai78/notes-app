import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Pastels, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { formatCardDate } from '@/lib/dates';
import type { Folder } from '@/lib/types';

type Props = {
  folder: Folder;
  noteCount: number;
  width: number;
  onPress: () => void;
  onMore: () => void;
};

export function FolderCard({ folder, noteCount, width, onPress, onMore }: Props) {
  const palette = Pastels[folder.color];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onMore}
      style={({ pressed }) => [
        styles.card,
        Shadow.card,
        { width, backgroundColor: palette.bg, opacity: pressed ? 0.92 : 1 },
      ]}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={20} color={palette.icon} />
        </View>
        <Pressable onPress={onMore} hitSlop={12} style={styles.more}>
          <Ionicons name="ellipsis-horizontal" size={18} color={palette.icon} />
        </Pressable>
      </View>
      <View style={styles.bottom}>
        <Text numberOfLines={2} style={styles.title}>
          {folder.name}
        </Text>
        <Text style={styles.meta}>{formatCardDate(folder.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

export function NewFolderCard({ width, onPress }: { width: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles.dashed, { width, opacity: pressed ? 0.85 : 1 }]}>
      <View style={styles.plus}>
        <Ionicons name="add" size={22} color={Colors.textMuted} />
      </View>
      <Text style={styles.dashedTitle}>New folder</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 132,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  more: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: Typography.cardTitle.fontSize,
    fontWeight: Typography.cardTitle.fontWeight,
    lineHeight: Typography.cardTitle.lineHeight,
    color: Colors.text,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
  },
  plus: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedTitle: {
    fontFamily: Fonts.medium,
    fontSize: Typography.cardTitle.fontSize,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
