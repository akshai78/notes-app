import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionSheet, type ActionItem } from '@/components/action-sheet';
import { AppHeader } from '@/components/app-header';
import { FilterTabs } from '@/components/filter-tabs';
import { FolderCard, NewFolderCard } from '@/components/folder-card';
import { MonthNavigator } from '@/components/month-navigator';
import { NewNoteCard, NoteCard } from '@/components/note-card';
import { PromptModal } from '@/components/prompt-modal';
import { QuickCapture } from '@/components/quick-capture';
import { Screen } from '@/components/screen';
import { EmptyState } from '@/components/empty-state';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';
import { matchesFilter, startOfMonth } from '@/lib/dates';
import { openNewNote, titleFromText } from '@/lib/notes-actions';
import { success, tap } from '@/lib/haptics';
import type { DateFilter, Folder } from '@/lib/types';

export default function HomeScreen() {
  const {
    folders,
    activeNotes,
    notesInFolder,
    createNote,
    createFolder,
    renameFolder,
    deleteFolder,
    togglePin,
    archiveNote,
    trashNote,
    toggleCheckItem,
    updateNote,
  } = useNotes();
  const { columns, folderCardWidth, contentPad, noteGap, showSidebar, width } = useResponsive();
  const [query, setQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<DateFilter>('week');
  const [noteFilter, setNoteFilter] = useState<DateFilter>('week');
  const [noteMonth, setNoteMonth] = useState(() => new Date());
  const [folderModal, setFolderModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Folder | null>(null);
  const [sheet, setSheet] = useState<{ type: 'note' | 'folder' | 'move'; id: string } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const visibleFolders = useMemo(
    () => folders.filter((folder) => matchesFilter(folder.createdAt, folderFilter)),
    [folders, folderFilter]
  );

  const monthStart = startOfMonth(noteMonth);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeNotes.filter((note) => {
      const noteDate = note.datedAt ?? note.updatedAt;
      if (!q) {
        if (!matchesFilter(noteDate, noteFilter)) return false;
        if (noteFilter === 'month' || noteFilter === 'all') {
          const noteMonthStart = startOfMonth(new Date(noteDate));
          if (noteMonthStart !== monthStart) return false;
        }
        return true;
      }
      const hay = `${note.title} ${note.body} ${note.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [activeNotes, noteFilter, noteMonth, monthStart, query]);

  const innerWidth = Math.min(width - (showSidebar ? Layout.sidebarWidth : 0), Layout.maxContent);
  const usable = Math.max(innerWidth - contentPad * 2, 280);
  const cardWidth = columns === 1 ? usable : (usable - noteGap * (columns - 1)) / columns;

  const selectedNote = activeNotes.find((note) => sheet?.type !== 'folder' && sheet?.id === note.id);
  const selectedFolder = folders.find((folder) => sheet?.type === 'folder' && sheet.id === folder.id);

  const capture = (text: string) => {
    createNote({ title: titleFromText(text), body: text });
    success();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  const noteActions: ActionItem[] = selectedNote
    ? [
        {
          key: 'pin',
          label: selectedNote.pinned ? 'Unpin' : 'Pin to top',
          icon: 'pin-outline',
          onPress: () => togglePin(selectedNote.id),
        },
        {
          key: 'move',
          label: 'Move to folder',
          icon: 'folder-outline',
          onPress: () => setSheet({ type: 'move', id: selectedNote.id }),
        },
        {
          key: 'archive',
          label: 'Archive',
          icon: 'archive-outline',
          onPress: () => archiveNote(selectedNote.id),
        },
        {
          key: 'trash',
          label: 'Move to trash',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => trashNote(selectedNote.id),
        },
      ]
    : [];

  const folderActions: ActionItem[] = selectedFolder
    ? [
        {
          key: 'open',
          label: 'Open folder',
          icon: 'open-outline',
          onPress: () => router.push(`/folder/${selectedFolder.id}`),
        },
        {
          key: 'rename',
          label: 'Rename',
          icon: 'pencil-outline',
          onPress: () => setRenameTarget(selectedFolder),
        },
        {
          key: 'delete',
          label: 'Delete folder',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => deleteFolder(selectedFolder.id),
        },
      ]
    : [];

  const moveActions: ActionItem[] = [
    {
      key: 'none',
      label: 'No folder',
      icon: 'remove-circle-outline',
      onPress: () => selectedNote && updateNote(selectedNote.id, { folderId: null }),
    },
    ...folders.map((folder) => ({
      key: folder.id,
      label: folder.name,
      icon: 'folder-outline' as const,
      onPress: () => selectedNote && updateNote(selectedNote.id, { folderId: folder.id }),
    })),
  ];

  const shiftMonth = (delta: number) => {
    setNoteMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: contentPad, paddingBottom: Spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AppHeader title="My notes" search={query} onSearchChange={setQuery} />

        <QuickCapture
          onSubmit={capture}
          onExpand={(text) =>
            openNewNote(createNote, text ? { title: titleFromText(text), body: text } : {})
          }
        />
        {savedFlash ? (
          <View style={styles.flash}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.flashText}>Saved to notes</Text>
          </View>
        ) : null}

        {!query ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent folders</Text>
            <FilterTabs value={folderFilter} onChange={setFolderFilter} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.folderRow}>
              {visibleFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  noteCount={notesInFolder(folder.id).length}
                  width={folderCardWidth}
                  onPress={() => router.push(`/folder/${folder.id}`)}
                  onMore={() => setSheet({ type: 'folder', id: folder.id })}
                />
              ))}
              <NewFolderCard width={folderCardWidth} onPress={() => setFolderModal(true)} />
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>{query ? 'Results' : 'My notes'}</Text>
            {!query ? (
              <MonthNavigator
                date={noteMonth}
                onPrev={() => shiftMonth(-1)}
                onNext={() => shiftMonth(1)}
              />
            ) : null}
          </View>
          {!query ? <FilterTabs value={noteFilter} onChange={setNoteFilter} includeAll /> : null}

          {searched.length === 0 && query ? (
            <EmptyState
              icon="search-outline"
              title="Nothing matches"
              body="Try a different word, or jot a new note from the bar above."
            />
          ) : (
            <View style={[styles.grid, { gap: noteGap }]}>
              {searched.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  width={cardWidth}
                  onPress={() => router.push(`/note/${note.id}`)}
                  onMore={() => setSheet({ type: 'note', id: note.id })}
                  onToggleCheck={(itemId) => toggleCheckItem(note.id, itemId)}
                />
              ))}
              {!query ? (
                <NewNoteCard width={cardWidth} onPress={() => openNewNote(createNote)} />
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      <PromptModal
        visible={folderModal}
        title="New folder"
        placeholder="Folder name"
        confirmLabel="Create"
        onClose={() => setFolderModal(false)}
        onSubmit={(name) => {
          tap();
          createFolder(name);
        }}
      />
      <PromptModal
        visible={Boolean(renameTarget)}
        title="Rename folder"
        initialValue={renameTarget?.name ?? ''}
        onClose={() => setRenameTarget(null)}
        onSubmit={(name) => renameTarget && renameFolder(renameTarget.id, name)}
      />
      <ActionSheet
        visible={sheet?.type === 'note'}
        title={selectedNote?.title || 'Note'}
        actions={noteActions}
        onClose={() => setSheet(null)}
      />
      <ActionSheet
        visible={sheet?.type === 'folder'}
        title={selectedFolder?.name}
        actions={folderActions}
        onClose={() => setSheet(null)}
      />
      <ActionSheet
        visible={sheet?.type === 'move'}
        title="Move to folder"
        actions={moveActions}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.sm,
    gap: Spacing.xl,
  },
  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: -Spacing.sm,
  },
  flashText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: Typography.caption.fontSize,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: Typography.section.fontSize,
    fontWeight: Typography.section.fontWeight,
    lineHeight: Typography.section.lineHeight,
    color: Colors.text,
  },
  folderRow: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
});
