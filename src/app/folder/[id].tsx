import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionSheet, type ActionItem } from '@/components/action-sheet';
import { EmptyState } from '@/components/empty-state';
import { NewNoteCard, NoteCard } from '@/components/note-card';
import { PageHeader } from '@/components/page-header';
import { PromptModal } from '@/components/prompt-modal';
import { Screen } from '@/components/screen';
import { Colors, Fonts, Layout } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';
import { openNewNote } from '@/lib/notes-actions';
import type { Note } from '@/lib/types';

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { folders, notesInFolder, createNote, renameFolder, deleteFolder, toggleCheckItem, archiveNote, trashNote, togglePin } =
    useNotes();
  const folder = folders.find((item) => item.id === id);
  const notes = id ? notesInFolder(id) : [];
  const { columns, contentPad, noteGap, showSidebar, width } = useResponsive();
  const [rename, setRename] = useState(false);
  const [sheetNote, setSheetNote] = useState<Note | null>(null);

  const innerWidth = Math.min(width - (showSidebar ? Layout.sidebarWidth : 0), Layout.maxContent);
  const usable = Math.max(innerWidth - contentPad * 2, 280);
  const cardWidth = columns === 1 ? usable : (usable - noteGap * (columns - 1)) / columns;

  const actions: ActionItem[] = sheetNote
    ? [
        {
          key: 'pin',
          label: sheetNote.pinned ? 'Unpin' : 'Pin',
          icon: 'pin-outline',
          onPress: () => togglePin(sheetNote.id),
        },
        {
          key: 'archive',
          label: 'Archive',
          icon: 'archive-outline',
          onPress: () => archiveNote(sheetNote.id),
        },
        {
          key: 'trash',
          label: 'Move to trash',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => trashNote(sheetNote.id),
        },
      ]
    : [];

  const subtitle = useMemo(
    () => `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`,
    [notes.length]
  );

  if (!folder) {
    return (
      <Screen>
        <PageHeader title="Folder" onBack={() => router.back()} />
        <EmptyState icon="folder-outline" title="Folder missing" body="This folder was deleted." />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        title={folder.name}
        subtitle={subtitle}
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => setRename(true)} hitSlop={8}>
            <Text style={styles.link}>Rename</Text>
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: 40, gap: noteGap }}
        showsVerticalScrollIndicator={false}>
        {notes.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="Empty folder"
            body="Drop a quick note in here. It stays with this folder."
            actionLabel="New note"
            onAction={() => openNewNote(createNote, { folderId: folder.id, color: folder.color })}
          />
        ) : null}
        <View style={[styles.grid, { gap: noteGap }]}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              width={cardWidth}
              onPress={() => router.push(`/note/${note.id}`)}
              onMore={() => setSheetNote(note)}
              onToggleCheck={(itemId) => toggleCheckItem(note.id, itemId)}
            />
          ))}
          <NewNoteCard
            width={cardWidth}
            onPress={() => openNewNote(createNote, { folderId: folder.id, color: folder.color })}
          />
        </View>
        <Pressable
          onPress={() => {
            deleteFolder(folder.id);
            router.back();
          }}
          style={styles.delete}>
          <Text style={styles.deleteText}>Delete folder</Text>
        </Pressable>
      </ScrollView>
      <PromptModal
        visible={rename}
        title="Rename folder"
        initialValue={folder.name}
        onClose={() => setRename(false)}
        onSubmit={(name) => renameFolder(folder.id, name)}
      />
      <ActionSheet
        visible={Boolean(sheetNote)}
        title={sheetNote?.title}
        actions={actions}
        onClose={() => setSheetNote(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  link: {
    color: Colors.primary,
    fontWeight: '700',
    paddingRight: 8,
  },
  delete: {
    alignSelf: 'center',
    paddingVertical: 16,
  },
  deleteText: {
    color: Colors.danger,
    fontFamily: Fonts.medium,
    fontWeight: '700',
  },
});
