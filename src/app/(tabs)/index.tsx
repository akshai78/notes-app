import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionSheet, type ActionItem } from '@/components/action-sheet';
import { FilterTabs } from '@/components/filter-tabs';
import { FolderCard, NewFolderCard } from '@/components/folder-card';
import { NewNoteCard, NoteCard } from '@/components/note-card';
import { PromptModal } from '@/components/prompt-modal';
import { QuickCapture } from '@/components/quick-capture';
import { Screen } from '@/components/screen';
import { SearchBar } from '@/components/search-bar';
import { EmptyState } from '@/components/empty-state';
import { Colors, Fonts, Layout, Radius } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { useResponsive } from '@/hooks/use-responsive';
import { formatCardDate, greetingForNow, matchesFilter } from '@/lib/dates';
import { openNewNote, titleFromText } from '@/lib/notes-actions';
import { success, tap } from '@/lib/haptics';
import type { DateFilter, Folder } from '@/lib/types';

export default function HomeScreen() {
  const {
    profile,
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
  const [folderFilter, setFolderFilter] = useState<DateFilter>('all');
  const [noteFilter, setNoteFilter] = useState<DateFilter>('all');
  const [folderModal, setFolderModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Folder | null>(null);
  const [sheet, setSheet] = useState<{ type: 'note' | 'folder' | 'move'; id: string } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const visibleFolders = useMemo(
    () => folders.filter((folder) => matchesFilter(folder.createdAt, folderFilter)),
    [folders, folderFilter]
  );

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeNotes.filter((note) => {
      if (!matchesFilter(note.datedAt ?? note.updatedAt, noteFilter) && !q) return false;
      if (!q) return true;
      const hay = `${note.title} ${note.body} ${note.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [activeNotes, noteFilter, query]);

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

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: contentPad, paddingBottom: 48 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>{greetingForNow()}</Text>
            <Text style={styles.hello}>Welcome, {profile.name}.</Text>
            <Text style={styles.today}>{formatCardDate(Date.now())}</Text>
          </View>
          <Pressable onPress={() => router.push('/profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'M'}</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <SearchBar value={query} onChange={setQuery} />
          {showSidebar ? (
            <Pressable
              onPress={() => openNewNote(createNote)}
              style={({ pressed }) => [styles.create, pressed && { opacity: 0.88 }]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.createLabel}>Create note</Text>
            </Pressable>
          ) : null}
        </View>

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
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recent folders</Text>
              <FilterTabs value={folderFilter} onChange={setFolderFilter} />
            </View>
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
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{query ? 'Results' : 'My notes'}</Text>
            {!query ? <FilterTabs value={noteFilter} onChange={setNoteFilter} /> : null}
          </View>

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
    paddingTop: 8,
    gap: 16,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  kicker: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  hello: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  today: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 13,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  create: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
  },
  flashText: {
    color: Colors.success,
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    gap: 14,
    marginTop: 8,
  },
  sectionHead: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  folderRow: {
    gap: 12,
    paddingVertical: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
