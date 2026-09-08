import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Pastels, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { formatCardDate, formatTimeDay } from '@/lib/dates';
import type { Note } from '@/lib/types';

type Props = {
  note: Note;
  width?: number;
  onPress: () => void;
  onMore: () => void;
  onToggleCheck?: (itemId: string) => void;
};

export function NoteCard({ note, width, onPress, onMore }: Props) {
  const palette = Pastels[note.color];
  const preview = note.body.trim();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onMore}
      style={({ pressed }) => [
        styles.card,
        Shadow.card,
        { backgroundColor: palette.bg, width, opacity: pressed ? 0.94 : 1 },
      ]}>
      <View style={styles.top}>
        <Text style={styles.date}>{formatCardDate(note.datedAt ?? note.updatedAt)}</Text>
        <Pressable onPress={onMore} hitSlop={8} style={styles.editBtn}>
          <Ionicons name="create-outline" size={14} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {note.title.trim() || 'Untitled note'}
        </Text>
        {preview ? (
          <Text numberOfLines={4} style={styles.body}>
            {preview}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Ionicons name="time-outline" size={13} color={Colors.textSoft} />
        <Text style={styles.footerText}>{formatTimeDay(note.updatedAt)}</Text>
      </View>
    </Pressable>
  );
}

export function NewNoteCard({ width, onPress }: { width?: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles.dashed, { width, opacity: pressed ? 0.85 : 1 }]}>
      <View style={styles.plus}>
        <Ionicons name="document-text-outline" size={22} color={Colors.textMuted} />
      </View>
      <Text style={styles.dashedTitle}>New note</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 220,
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
    minHeight: 220,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontFamily: Fonts.medium,
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.textSoft,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    color: Colors.textSoft,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: Typography.caption.fontSize,
    color: Colors.textSoft,
  },
  plus: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
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
