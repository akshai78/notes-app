import { apiBaseUrl } from '@/lib/env';
import type { AppState, Folder, Note, Profile } from '@/lib/types';
import type { SyncFolder, SyncNote, SyncProfile, SyncSnapshot } from '../../shared/sync';

export type SyncError = {
  status: number;
  message: string;
};

export function toSnapshot(state: AppState): SyncSnapshot {
  return {
    profile: toSyncProfile(state.profile),
    folders: state.folders.map(toSyncFolder),
    notes: state.notes.map(toSyncNote),
  };
}

export function fromSnapshot(snapshot: SyncSnapshot): AppState {
  return {
    profile: snapshot.profile,
    folders: snapshot.folders,
    notes: snapshot.notes,
  };
}

function toSyncProfile(profile: Profile): SyncProfile {
  return {
    name: profile.name,
    email: profile.email,
    updatedAt: profile.updatedAt,
  };
}

function toSyncFolder(folder: Folder): SyncFolder {
  return {
    id: folder.id,
    name: folder.name,
    color: folder.color,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
    deletedAt: folder.deletedAt,
  };
}

function toSyncNote(note: Note): SyncNote {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    color: note.color,
    folderId: note.folderId,
    tags: note.tags,
    checklist: note.checklist,
    pinned: note.pinned,
    archived: note.archived,
    deletedAt: note.deletedAt,
    purgedAt: note.purgedAt,
    datedAt: note.datedAt,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function syncSnapshot(token: string, snapshot: SyncSnapshot): Promise<SyncSnapshot> {
  const base = apiBaseUrl();
  if (!base) {
    throw Object.assign(new Error('Set EXPO_PUBLIC_API_URL to your Vercel URL.'), { status: 0 }) as SyncError;
  }

  const response = await fetch(`${base}/api/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(snapshot),
  });

  const data = (await response.json().catch(() => null)) as SyncSnapshot | { error?: string } | null;
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && data.error
        ? data.error
        : `Sync failed (${response.status})`;
    throw Object.assign(new Error(message), { status: response.status }) as SyncError;
  }
  if (!data || !('profile' in data) || !('folders' in data) || !('notes' in data)) {
    throw Object.assign(new Error('Unexpected sync response.'), { status: response.status }) as SyncError;
  }
  return data;
}
