import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Pastels, Radius, Shadow } from '@/constants/theme';
import { formatCardDate, formatTimeDay } from '@/lib/dates';
import type { Note } from '@/lib/types';

type Props = {
  note: Note;
  width?: number;
  onPress: () => void;
  onMore: () => void;
  onToggleCheck?: (itemId: string) => void;
};

export function NoteCard({ note, width, onPress, onMore, onToggleCheck }: Props) {
  const palette = Pastels[note.color];
  const preview = note.body.trim();
  const visibleChecks = note.checklist.slice(0, 3);
  const done = note.checklist.filter((item) => item.done).length;
  const total = note.checklist.length;

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
        <View style={styles.topActions}>
          {note.pinned ? <Ionicons name="pin" size={14} color={palette.icon} /> : null}
          <Pressable onPress={onMore} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={16} color={palette.icon} />
          </Pressable>
        </View>
      </View>

      {note.tags.length ? (
        <View style={styles.tags}>
          {note.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: palette.tagBg }]}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text numberOfLines={2} style={styles.title}>
        {note.title.trim() || 'Untitled note'}
      </Text>
      {preview ? (
        <Text numberOfLines={3} style={styles.body}>
          {preview}
        </Text>
      ) : null}

      {visibleChecks.length ? (
        <View style={styles.checks}>
          {visibleChecks.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onToggleCheck?.(item.id)}
              style={styles.checkRow}
              hitSlop={4}>
              <Ionicons
                name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={item.done ? palette.accent : palette.icon}
              />
              <Text numberOfLines={1} style={[styles.checkText, item.done && styles.checkDone]}>
                {item.text || 'Untitled'}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {total > 0 ? (
        <View style={styles.dots}>
          {Array.from({ length: Math.min(total, 10) }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index < done ? palette.accent : 'rgba(255,255,255,0.7)' },
              ]}
            />
          ))}
        </View>
      ) : null}

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
      style={({ pressed }) => [styles.card, styles.dashed, { width, opacity: pressed ? 0.8 : 1 }]}>
      <View style={styles.plus}>
        <Ionicons name="document-text-outline" size={22} color={Colors.textMuted} />
      </View>
      <Text style={styles.dashedTitle}>New note</Text>
      <Text style={styles.body}>Tap to start writing. The first line becomes the title.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: 16,
    minHeight: 196,
  },
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D5D8E3',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSoft,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSoft,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 10,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSoft,
    marginTop: 6,
  },
  checks: {
    marginTop: 12,
    gap: 7,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.text,
  },
  checkDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSoft,
  },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5D8E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSoft,
  },
});
