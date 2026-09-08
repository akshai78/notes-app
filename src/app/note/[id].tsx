import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionSheet, type ActionItem } from '@/components/action-sheet';
import { ColorDots } from '@/components/color-dots';
import { PromptModal } from '@/components/prompt-modal';
import { Colors, Fonts, Pastels, Radius } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { formatDayLabel, startOfDay } from '@/lib/dates';
import type { NoteColorId } from '@/lib/types';

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    notes,
    folders,
    updateNote,
    discardIfEmpty,
    trashNote,
    archiveNote,
    togglePin,
    addCheckItem,
    updateCheckItem,
    toggleCheckItem,
    removeCheckItem,
  } = useNotes();
  const note = notes.find((item) => item.id === id);
  const titleRef = useRef<TextInput>(null);
  const bodyRef = useRef<TextInput>(null);
  const [sheet, setSheet] = useState(false);
  const [tagModal, setTagModal] = useState(false);
  const [folderSheet, setFolderSheet] = useState(false);

  useEffect(() => {
    if (!note) {
      router.back();
      return;
    }
    const timer = setTimeout(() => {
      if (!note.title) titleRef.current?.focus();
      else bodyRef.current?.focus();
    }, 80);
    return () => clearTimeout(timer);
    // only on mount / id change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const palette = note ? Pastels[note.color] : Pastels.blue;
  const folderName = folders.find((folder) => folder.id === note?.folderId)?.name;

  const close = () => {
    if (id) discardIfEmpty(id);
    router.back();
  };

  const actions: ActionItem[] = note
    ? [
        {
          key: 'pin',
          label: note.pinned ? 'Unpin' : 'Pin',
          icon: 'pin-outline',
          onPress: () => togglePin(note.id),
        },
        {
          key: 'archive',
          label: 'Archive',
          icon: 'archive-outline',
          onPress: () => {
            archiveNote(note.id);
            router.back();
          },
        },
        {
          key: 'trash',
          label: 'Move to trash',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => {
            trashNote(note.id);
            router.back();
          },
        },
      ]
    : [];

  const folderActions: ActionItem[] = useMemo(
    () =>
      note
        ? [
            {
              key: 'none',
              label: 'No folder',
              icon: 'remove-circle-outline',
              onPress: () => updateNote(note.id, { folderId: null }),
            },
            ...folders.map((folder) => ({
              key: folder.id,
              label: folder.name,
              icon: 'folder-outline' as const,
              onPress: () => updateNote(note.id, { folderId: folder.id }),
            })),
          ]
        : [],
    [folders, note, updateNote]
  );

  if (!note) return <View style={styles.root} />;

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
          <Pressable onPress={close} style={styles.roundBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.saved}>Auto-saved</Text>
          <Pressable onPress={() => setSheet(true)} style={styles.roundBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={Colors.text} />
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 120 }]}>
          <View style={styles.dateRow}>
            <Pressable
              onPress={() =>
                updateNote(note.id, { datedAt: startOfDay(new Date(note.datedAt - 86_400_000)) })
              }
              style={styles.dateStep}
              hitSlop={8}>
              <Ionicons name="chevron-back" size={16} color={Colors.text} />
            </Pressable>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={14} color={Colors.text} />
              <Text style={styles.dateLabel}>{formatDayLabel(note.datedAt)}</Text>
            </View>
            <Pressable
              onPress={() =>
                updateNote(note.id, { datedAt: startOfDay(new Date(note.datedAt + 86_400_000)) })
              }
              style={styles.dateStep}
              hitSlop={8}>
              <Ionicons name="chevron-forward" size={16} color={Colors.text} />
            </Pressable>
          </View>

          <ColorDots value={note.color} onChange={(color: NoteColorId) => updateNote(note.id, { color })} />

          {note.tags.length ? (
            <View style={styles.tags}>
              {note.tags.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() =>
                    updateNote(note.id, { tags: note.tags.filter((item) => item !== tag) })
                  }
                  style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <Ionicons name="close" size={12} color={Colors.textSoft} />
                </Pressable>
              ))}
            </View>
          ) : null}

          <TextInput
            ref={titleRef}
            value={note.title}
            onChangeText={(title) => updateNote(note.id, { title })}
            placeholder="Title"
            placeholderTextColor={Colors.textMuted}
            style={styles.title}
            returnKeyType="next"
            onSubmitEditing={() => bodyRef.current?.focus()}
          />
          <TextInput
            ref={bodyRef}
            value={note.body}
            onChangeText={(body) => updateNote(note.id, { body })}
            placeholder="Start writing. The point is to get it down fast."
            placeholderTextColor={Colors.textMuted}
            style={styles.editor}
            multiline
            textAlignVertical="top"
          />

          {note.checklist.map((item) => (
            <View key={item.id} style={styles.checkRow}>
              <Pressable onPress={() => toggleCheckItem(note.id, item.id)}>
                <Ionicons
                  name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={item.done ? palette.accent : Colors.textSoft}
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(text) => updateCheckItem(note.id, item.id, { text })}
                placeholder="List item"
                placeholderTextColor={Colors.textMuted}
                style={[styles.checkInput, item.done && styles.checkDone]}
              />
              <Pressable onPress={() => removeCheckItem(note.id, item.id)} hitSlop={8}>
                <Ionicons name="close" size={16} color={Colors.textMuted} />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Tool
            icon="checkbox-outline"
            label="Check"
            onPress={() => addCheckItem(note.id)}
          />
          <Tool icon="pricetag-outline" label="Tag" onPress={() => setTagModal(true)} />
          <Tool
            icon="folder-outline"
            label={folderName ?? 'Folder'}
            onPress={() => setFolderSheet(true)}
          />
          <Text style={styles.stamp}>{formatDayLabel(note.datedAt)}</Text>
        </View>
      </KeyboardAvoidingView>

      <PromptModal
        visible={tagModal}
        title="Add a tag"
        placeholder="#idea"
        confirmLabel="Add"
        onClose={() => setTagModal(false)}
        onSubmit={(value) => {
          const tag = value.startsWith('#') ? value : `#${value}`;
          if (!note.tags.includes(tag)) updateNote(note.id, { tags: [...note.tags, tag] });
        }}
      />
      <ActionSheet visible={sheet} title="Note actions" actions={actions} onClose={() => setSheet(false)} />
      <ActionSheet
        visible={folderSheet}
        title="Move to folder"
        actions={folderActions}
        onClose={() => setFolderSheet(false)}
      />
    </View>
  );
}

function Tool({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tool}>
      <Ionicons name={icon} size={16} color={Colors.text} />
      <Text numberOfLines={1} style={styles.toolLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saved: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSoft,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 12,
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateStep: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: Radius.pill,
    height: 36,
    paddingHorizontal: 12,
  },
  dateLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSoft,
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.6,
    paddingVertical: 4,
  },
  editor: {
    minHeight: 180,
    fontFamily: Fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: Colors.text,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 8,
  },
  checkDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.6)',
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    height: 36,
    maxWidth: 130,
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  stamp: {
    marginLeft: 'auto',
    fontSize: 11,
    color: Colors.textMuted,
  },
});
