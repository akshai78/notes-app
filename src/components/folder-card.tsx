import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Pastels, Radius, Shadow } from '@/constants/theme';
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
      style={({ pressed }) => [styles.card, Shadow.card, { width, backgroundColor: palette.bg, opacity: pressed ? 0.92 : 1 }]}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name="folder" size={22} color={palette.icon} />
        </View>
        <Pressable onPress={onMore} hitSlop={10} style={styles.more}>
          <Ionicons name="ellipsis-horizontal" size={16} color={palette.icon} />
        </Pressable>
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {folder.name}
      </Text>
      <Text style={styles.meta}>
        {formatCardDate(folder.createdAt)} · {noteCount} {noteCount === 1 ? 'note' : 'notes'}
      </Text>
    </Pressable>
  );
}

export function NewFolderCard({ width, onPress }: { width: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles.dashed, { width, opacity: pressed ? 0.8 : 1 }]}>
      <View style={styles.plus}>
        <Ionicons name="add" size={22} color={Colors.textMuted} />
      </View>
      <Text style={styles.dashedTitle}>New folder</Text>
      <Text style={styles.meta}>Group notes faster</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 148,
    borderRadius: Radius.lg,
    padding: 16,
    justifyContent: 'space-between',
  },
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D5D8E3',
    backgroundColor: 'transparent',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  more: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 18,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSoft,
    marginTop: 6,
  },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5D8E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSoft,
    marginTop: 18,
  },
});
