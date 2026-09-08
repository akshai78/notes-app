import { router } from 'expo-router';

import type { Note } from '@/lib/types';
import { tap } from '@/lib/haptics';

export function titleFromText(text: string): string {
  const line = text.trim().split('\n')[0] ?? '';
  return line.slice(0, 72);
}

export function openNewNote(
  createNote: (input?: Partial<Note>) => Note,
  input: Partial<Note> = {}
): string {
  tap();
  const note = createNote(input);
  router.push(`/note/${note.id}`);
  return note.id;
}
