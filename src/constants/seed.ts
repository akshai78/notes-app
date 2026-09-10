import { createId } from '@/lib/id';
import type { AppState, Folder, Note } from '@/lib/types';

const now = Date.now();
const hour = 3_600_000;
const day = 86_400_000;

const folderIds = {
  movies: createId(),
  university: createId(),
  work: createId(),
  personal: createId(),
};

function note(partial: Partial<Note> & Pick<Note, 'title' | 'body' | 'color' | 'createdAt' | 'updatedAt'>): Note {
  return {
    id: createId(),
    pinned: false,
    archived: false,
    deletedAt: null,
    purgedAt: null,
    tags: [],
    checklist: [],
    folderId: null,
    datedAt: partial.createdAt,
    ...partial,
  };
}

const folders: Folder[] = [
  { id: folderIds.movies, name: 'Movie Review', color: 'blue', createdAt: now - 6 * day, updatedAt: now - 6 * day, deletedAt: null },
  { id: folderIds.university, name: 'University', color: 'pink', createdAt: now - 3 * day, updatedAt: now - 3 * day, deletedAt: null },
  { id: folderIds.work, name: 'Work', color: 'lavender', createdAt: now - 10 * day, updatedAt: now - 10 * day, deletedAt: null },
  { id: folderIds.personal, name: 'Personal', color: 'mint', createdAt: now - 20 * day, updatedAt: now - 20 * day, deletedAt: null },
];

const notes: Note[] = [
  note({
    title: 'Mid test exam',
    body: 'Cover chapters 4–7. Focus on thermodynamics, practice the past paper, and rewrite the formula sheet before Thursday.',
    color: 'pink',
    folderId: folderIds.university,
    tags: ['#exam', '#study'],
    createdAt: now - 2 * hour,
    updatedAt: now - 40 * 60 * 1000,
  }),
  note({
    title: 'Weekend grocery',
    body: 'Grab these on the way home so dinner is easy.',
    color: 'mint',
    folderId: folderIds.personal,
    tags: ['#errands'],
    checklist: [
      { id: createId(), text: 'Oat milk', done: true },
      { id: createId(), text: 'Cherry tomatoes', done: true },
      { id: createId(), text: 'Sourdough', done: false },
      { id: createId(), text: 'Basil', done: false },
      { id: createId(), text: 'Sparkling water', done: false },
    ],
    createdAt: now - 5 * hour,
    updatedAt: now - 5 * hour,
  }),
  note({
    title: 'New website for Grape',
    body: 'Hero should feel calm and premium. Keep the pastel cards, add a quick-capture strip, and ship the mobile layout first.',
    color: 'blue',
    folderId: folderIds.work,
    tags: ['#website', '#client'],
    createdAt: now - 1 * day,
    updatedAt: now - 3 * hour,
  }),
  note({
    title: 'Dune: Part Two',
    body: 'Sand, silence, and scale. The stillsuits sequence is the one to write about — practical costume design that still feels mythic.',
    color: 'yellow',
    folderId: folderIds.movies,
    tags: ['#film'],
    createdAt: now - 2 * day,
    updatedAt: now - 2 * day,
  }),
  note({
    title: 'Client kickoff',
    body: 'Confirm timeline, share the note-taking flow, and ask for brand colors before Friday.',
    color: 'peach',
    folderId: folderIds.work,
    tags: ['#client', '#meeting'],
    checklist: [
      { id: createId(), text: 'Send agenda', done: true },
      { id: createId(), text: 'Record action items', done: false },
      { id: createId(), text: 'Follow up on assets', done: false },
    ],
    createdAt: now - 4 * day,
    updatedAt: now - 26 * hour,
  }),
  note({
    title: 'Quick dump',
    body: 'Call the dentist. Move the 4pm walk. Buy a new charger before the trip.',
    color: 'lavender',
    folderId: folderIds.personal,
    tags: ['#inbox'],
    createdAt: now - 20 * 60 * 1000,
    updatedAt: now - 20 * 60 * 1000,
    pinned: true,
  }),
  note({
    title: 'Lecture notes — week 3',
    body: 'Entropy is a bookkeeping tool for missing information. The exam will ask for a written definition, not just the formula.',
    color: 'pink',
    folderId: folderIds.university,
    tags: ['#lecture'],
    createdAt: now - 12 * day,
    updatedAt: now - 12 * day,
    archived: true,
  }),
];

export const seedState: AppState = {
  folders,
  notes,
  profile: {
    name: 'Akshai',
    email: 'akshai@notes.app',
    updatedAt: now,
  },
};
