export const NOTE_COLORS = ['blue', 'pink', 'yellow', 'lavender', 'mint', 'peach'] as const;

export type NoteColorId = (typeof NOTE_COLORS)[number];

export type CheckItem = {
  id: string;
  text: string;
  done: boolean;
};

export type SyncNote = {
  id: string;
  title: string;
  body: string;
  color: NoteColorId;
  folderId: string | null;
  tags: string[];
  checklist: CheckItem[];
  pinned: boolean;
  archived: boolean;
  deletedAt: number | null;
  purgedAt: number | null;
  datedAt: number;
  createdAt: number;
  updatedAt: number;
};

export type SyncFolder = {
  id: string;
  name: string;
  color: NoteColorId;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

export type SyncProfile = {
  name: string;
  email: string;
  updatedAt: number;
};

export type SyncSnapshot = {
  profile: SyncProfile;
  folders: SyncFolder[];
  notes: SyncNote[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isNoteColor(value: unknown): value is NoteColorId {
  return typeof value === 'string' && (NOTE_COLORS as readonly string[]).includes(value);
}

export function lastWriteWins<T extends { id: string; updatedAt: number }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of remote) map.set(item.id, item);
  for (const item of local) {
    const current = map.get(item.id);
    if (!current || item.updatedAt >= current.updatedAt) map.set(item.id, item);
  }
  return [...map.values()];
}

export function lastWriteWinsProfile(local: SyncProfile, remote: SyncProfile | null): SyncProfile {
  if (!remote) return local;
  return local.updatedAt >= remote.updatedAt ? local : remote;
}

export function mergeSnapshots(local: SyncSnapshot, remote: SyncSnapshot | null): SyncSnapshot {
  if (!remote) return local;
  return {
    profile: lastWriteWinsProfile(local.profile, remote.profile),
    folders: lastWriteWins(local.folders, remote.folders),
    notes: lastWriteWins(local.notes, remote.notes),
  };
}
