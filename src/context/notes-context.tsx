import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { seedState } from '@/constants/seed';
import { PASTEL_ORDER } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { startOfDay } from '@/lib/dates';
import { createId } from '@/lib/id';
import { peekNoteDraft } from '@/lib/note-draft';
import { loadState, saveState } from '@/lib/storage';
import type { CheckItem, Folder, Note, NoteColorId, Profile } from '@/lib/types';

type NotesContextValue = {
  ready: boolean;
  notes: Note[];
  folders: Folder[];
  profile: Profile;
  activeNotes: Note[];
  archivedNotes: Note[];
  trashedNotes: Note[];
  createNote: (input?: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  discardIfEmpty: (id: string) => boolean;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  trashNote: (id: string) => void;
  restoreNote: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  emptyTrash: () => void;
  togglePin: (id: string) => void;
  toggleCheckItem: (noteId: string, itemId: string) => void;
  addCheckItem: (noteId: string, text?: string) => void;
  updateCheckItem: (noteId: string, itemId: string, patch: Partial<CheckItem>) => void;
  removeCheckItem: (noteId: string, itemId: string) => void;
  createFolder: (name: string, color?: NoteColorId) => Folder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  notesInFolder: (folderId: string) => Note[];
  updateProfile: (patch: Partial<Profile>) => void;
  resetDemo: () => void;
  selectedCalendarDay: number | null;
  setActiveCalendarDay: (day: number | null) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function nextColor(count: number): NoteColorId {
  return PASTEL_ORDER[count % PASTEL_ORDER.length];
}

function isEmptyNote(note: Note): boolean {
  return (
    !note.title.trim() &&
    !note.body.trim() &&
    note.checklist.every((item) => !item.text.trim()) &&
    note.tags.length === 0
  );
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [profile, setProfile] = useState<Profile>(seedState.profile);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calendarDayRef = useRef<number | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(() => startOfDay());

  const setActiveCalendarDay = useCallback((day: number | null) => {
    const next = day == null ? null : startOfDay(new Date(day));
    calendarDayRef.current = next;
    setSelectedCalendarDay(next);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadState()
      .then((stored) => {
        if (!mounted) return;
        const data = stored ?? seedState;
        setNotes(
          data.notes.map((note) => ({
            ...note,
            datedAt: startOfDay(new Date(note.datedAt ?? note.createdAt ?? note.updatedAt)),
          }))
        );
        setFolders(data.folders);
        setProfile(data.profile);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setNotes(seedState.notes);
        setFolders(seedState.folders);
        setProfile(seedState.profile);
        setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      saveState({ notes, folders, profile });
    }, 220);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [notes, folders, profile, ready]);

  const createNote = useCallback(
    (input: Partial<Note> = {}) => {
      const created: Note = {
        id: createId(),
        title: input.title ?? '',
        body: input.body ?? '',
        color: input.color ?? nextColor(notes.length),
        folderId: input.folderId || null,
        tags: input.tags ?? [],
        checklist: input.checklist ?? [],
        pinned: false,
        archived: false,
        deletedAt: null,
        datedAt: startOfDay(
          new Date(input.datedAt ?? peekNoteDraft()?.datedAt ?? calendarDayRef.current ?? Date.now())
        ),
        createdAt: input.createdAt ?? Date.now(),
        updatedAt: input.updatedAt ?? Date.now(),
      };
      setNotes((current) => [created, ...current]);
      return created;
    },
    [notes.length]
  );

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== id) return note;
        const datedAt =
          patch.datedAt === undefined || patch.datedAt === null
            ? note.datedAt
            : startOfDay(new Date(patch.datedAt));
        return { ...note, ...patch, datedAt, updatedAt: Date.now() };
      })
    );
  }, []);

  const discardIfEmpty = useCallback((id: string) => {
    let removed = false;
    setNotes((current) => {
      const target = current.find((note) => note.id === id);
      if (!target || !isEmptyNote(target)) return current;
      removed = true;
      return current.filter((note) => note.id !== id);
    });
    return removed;
  }, []);

  const archiveNote = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, archived: true, updatedAt: Date.now() } : note
      )
    );
  }, []);

  const unarchiveNote = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, archived: false, updatedAt: Date.now() } : note
      )
    );
  }, []);

  const trashNote = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, deletedAt: Date.now(), archived: false } : note
      )
    );
  }, []);

  const restoreNote = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, deletedAt: null, archived: false, updatedAt: Date.now() } : note
      )
    );
  }, []);

  const permanentlyDelete = useCallback((id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  const emptyTrash = useCallback(() => {
    setNotes((current) => current.filter((note) => !note.deletedAt));
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note
      )
    );
  }, []);

  const toggleCheckItem = useCallback((noteId: string, itemId: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id !== noteId
          ? note
          : {
              ...note,
              updatedAt: Date.now(),
              checklist: note.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            }
      )
    );
  }, []);

  const addCheckItem = useCallback((noteId: string, text = '') => {
    setNotes((current) =>
      current.map((note) =>
        note.id !== noteId
          ? note
          : {
              ...note,
              updatedAt: Date.now(),
              checklist: [...note.checklist, { id: createId(), text, done: false }],
            }
      )
    );
  }, []);

  const updateCheckItem = useCallback((noteId: string, itemId: string, patch: Partial<CheckItem>) => {
    setNotes((current) =>
      current.map((note) =>
        note.id !== noteId
          ? note
          : {
              ...note,
              updatedAt: Date.now(),
              checklist: note.checklist.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item
              ),
            }
      )
    );
  }, []);

  const removeCheckItem = useCallback((noteId: string, itemId: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id !== noteId
          ? note
          : {
              ...note,
              updatedAt: Date.now(),
              checklist: note.checklist.filter((item) => item.id !== itemId),
            }
      )
    );
  }, []);

  const createFolder = useCallback(
    (name: string, color?: NoteColorId) => {
      const folder: Folder = {
        id: createId(),
        name: name.trim() || 'Untitled folder',
        color: color ?? nextColor(folders.length + 2),
        createdAt: Date.now(),
      };
      setFolders((current) => [folder, ...current]);
      return folder;
    },
    [folders.length]
  );

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders((current) =>
      current.map((folder) => (folder.id === id ? { ...folder, name: name.trim() } : folder))
    );
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((current) => current.filter((folder) => folder.id !== id));
    setNotes((current) =>
      current.map((note) => (note.folderId === id ? { ...note, folderId: null } : note))
    );
  }, []);

  const notesInFolder = useCallback(
    (folderId: string) =>
      notes.filter((note) => note.folderId === folderId && !note.archived && !note.deletedAt),
    [notes]
  );

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((current) => ({ ...current, ...patch }));
  }, []);

  const resetDemo = useCallback(() => {
    setNotes(seedState.notes);
    setFolders(seedState.folders);
    setProfile(seedState.profile);
  }, []);

  const activeNotes = useMemo(
    () =>
      notes
        .filter((note) => !note.archived && !note.deletedAt)
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt),
    [notes]
  );

  const archivedNotes = useMemo(
    () => notes.filter((note) => note.archived && !note.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt),
    [notes]
  );

  const trashedNotes = useMemo(
    () => notes.filter((note) => Boolean(note.deletedAt)).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [notes]
  );

  const accountProfile = useMemo(
    () => ({
      ...profile,
      email: user?.email?.trim() || profile.email,
    }),
    [profile, user?.email]
  );

  const value = useMemo(
    () => ({
      ready,
      notes,
      folders,
      profile: accountProfile,
      activeNotes,
      archivedNotes,
      trashedNotes,
      createNote,
      updateNote,
      discardIfEmpty,
      archiveNote,
      unarchiveNote,
      trashNote,
      restoreNote,
      permanentlyDelete,
      emptyTrash,
      togglePin,
      toggleCheckItem,
      addCheckItem,
      updateCheckItem,
      removeCheckItem,
      createFolder,
      renameFolder,
      deleteFolder,
      notesInFolder,
      updateProfile,
      resetDemo,
      selectedCalendarDay,
      setActiveCalendarDay,
    }),
    [
      ready,
      notes,
      folders,
      accountProfile,
      activeNotes,
      archivedNotes,
      trashedNotes,
      createNote,
      updateNote,
      discardIfEmpty,
      archiveNote,
      unarchiveNote,
      trashNote,
      restoreNote,
      permanentlyDelete,
      emptyTrash,
      togglePin,
      toggleCheckItem,
      addCheckItem,
      updateCheckItem,
      removeCheckItem,
      createFolder,
      renameFolder,
      deleteFolder,
      notesInFolder,
      updateProfile,
      resetDemo,
      selectedCalendarDay,
      setActiveCalendarDay,
    ]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
