import { router } from 'expo-router';

import { startOfDay } from '@/lib/dates';
import { tap } from '@/lib/haptics';
import { queueNoteDraft } from '@/lib/note-draft';
import type { Note } from '@/lib/types';

export function titleFromText(text: string): string {
  const line = text.trim().split('\n')[0] ?? '';
  return line.slice(0, 72);
}

export function openNewNote(
  _createNote: (input?: Partial<Note>) => Note,
  input: Partial<Note> = {}
): void {
  tap();
  const datedAt = startOfDay(new Date(input.datedAt ?? Date.now()));
  queueNoteDraft({
    datedAt,
    title: input.title,
    body: input.body,
    folderId: input.folderId,
    color: input.color,
  });
  router.push('/compose');
}
