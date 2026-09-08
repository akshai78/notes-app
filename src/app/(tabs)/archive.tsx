import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { NoteCard } from '@/components/note-card';
import { Screen } from '@/components/screen';
import { Colors, Fonts, Layout, Radius } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';
import { openNewNote } from '@/lib/notes-actions';
import type { Note } from '@/lib/types';

type Pane = 'archive' | 'trash';

export default function ArchiveScreen() {
  const { archivedNotes, trashedNotes, createNote, unarchiveNote, restoreNote, permanentlyDelete, emptyTrash, toggleCheckItem, setActiveCalendarDay } =
    useNotes();
  const [pane, setPane] = useState<Pane>('archive');

  useFocusEffect(
    useCallback(() => {
      setActiveCalendarDay(null);
    }, [setActiveCalendarDay])
  );
  const { columns, contentPad, noteGap, showSidebar, width } = useResponsive();
  const list: Note[] = pane === 'archive' ? archivedNotes : trashedNotes;
  const innerWidth = Math.min(width - (showSidebar ? Layout.sidebarWidth : 0), Layout.maxContent);
  const usable = Math.max(innerWidth - contentPad * 2, 280);
  const cardWidth = columns === 1 ? usable : (usable - noteGap * (columns - 1)) / columns;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: 40, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Records</Text>
        <Text style={styles.title}>Archive & trash</Text>
        <View style={styles.switch}>
          <Pressable onPress={() => setPane('archive')} style={[styles.pill, pane === 'archive' && styles.pillOn]}>
            <Text style={[styles.pillText, pane === 'archive' && styles.pillTextOn]}>
              Archive ({archivedNotes.length})
            </Text>
          </Pressable>
          <Pressable onPress={() => setPane('trash')} style={[styles.pill, pane === 'trash' && styles.pillOn]}>
            <Text style={[styles.pillText, pane === 'trash' && styles.pillTextOn]}>
              Trash ({trashedNotes.length})
            </Text>
          </Pressable>
        </View>

        {pane === 'trash' && trashedNotes.length > 0 ? (
          <Pressable onPress={emptyTrash} style={styles.emptyTrash}>
            <Text style={styles.emptyTrashText}>Empty trash</Text>
          </Pressable>
        ) : null}

        {list.length === 0 ? (
          <EmptyState
            icon={pane === 'archive' ? 'archive-outline' : 'trash-outline'}
            title={pane === 'archive' ? 'Archive is clear' : 'Trash is empty'}
            body={
              pane === 'archive'
                ? 'Park notes you are not using. They stay searchable here, off the home grid.'
                : 'Deleted notes land here until you restore or erase them for good.'
            }
            actionLabel="Write a note"
            onAction={() => openNewNote(createNote)}
          />
        ) : (
          <View style={[styles.grid, { gap: noteGap }]}>
            {list.map((note) => (
              <View key={note.id} style={{ width: cardWidth }}>
                <NoteCard
                  note={note}
                  onPress={() =>
                    pane === 'archive' ? router.push(`/note/${note.id}`) : restoreNote(note.id)
                  }
                  onMore={() =>
                    pane === 'archive' ? unarchiveNote(note.id) : restoreNote(note.id)
                  }
                  onToggleCheck={(itemId) => toggleCheckItem(note.id, itemId)}
                />
                <View style={styles.rowActions}>
                  {pane === 'archive' ? (
                    <Pressable onPress={() => unarchiveNote(note.id)}>
                      <Text style={styles.action}>Unarchive</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable onPress={() => restoreNote(note.id)}>
                        <Text style={styles.action}>Restore</Text>
                      </Pressable>
                      <Pressable onPress={() => permanentlyDelete(note.id)}>
                        <Text style={[styles.action, styles.danger]}>Delete forever</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
    marginBottom: 16,
  },
  switch: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOn: {
    backgroundColor: Colors.ink,
  },
  pillText: {
    fontWeight: '700',
    color: Colors.textSoft,
    fontSize: 13,
  },
  pillTextOn: {
    color: '#fff',
  },
  emptyTrash: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emptyTrashText: {
    color: Colors.danger,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  action: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  danger: {
    color: Colors.danger,
  },
});
