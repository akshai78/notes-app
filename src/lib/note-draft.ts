import type { NoteColorId } from '@/lib/types';

export type NoteDraft = {
  datedAt: number;
  title?: string;
  body?: string;
  folderId?: string | null;
  color?: NoteColorId | '';
};

let draft: NoteDraft | null = null;

export function queueNoteDraft(next: NoteDraft): void {
  draft = next;
}

export function consumeNoteDraft(): NoteDraft | null {
  const next = draft;
  draft = null;
  return next;
}

export function peekNoteDraft(): NoteDraft | null {
  return draft;
}
