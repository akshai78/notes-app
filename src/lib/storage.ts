import AsyncStorage from '@react-native-async-storage/async-storage';

import { startOfDay } from '@/lib/dates';
import { createId } from '@/lib/id';
import type { AppState, Folder, Note, Profile } from '@/lib/types';
import { isUuid } from '../../shared/sync';

const GUEST_KEY = 'codered.app.v1';
const LEGACY_KEY = 'mino.app.v1';

export function stateKey(userId?: string | null): string {
  return userId ? `codered.app.user.${userId}` : GUEST_KEY;
}

export async function loadState(userId?: string | null): Promise<AppState | null> {
  try {
    const key = stateKey(userId);
    let raw = await AsyncStorage.getItem(key);
    if (!raw && userId) raw = await AsyncStorage.getItem(GUEST_KEY);
    if (!raw && !userId) {
      raw = await AsyncStorage.getItem(LEGACY_KEY);
      if (raw) await AsyncStorage.setItem(GUEST_KEY, raw);
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    return coerceIds({
      notes: (parsed.notes ?? []).map(normalizeNote),
      folders: (parsed.folders ?? []).map(normalizeFolder),
      profile: normalizeProfile(parsed.profile),
    });
  } catch {
    return null;
  }
}

export async function saveState(state: AppState, userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(stateKey(userId), JSON.stringify(state));
  } catch {
    // Persistence is best-effort on web private mode.
  }
}

function normalizeNote(note: Note): Note {
  const datedAt = startOfDay(new Date(note.datedAt ?? note.createdAt ?? note.updatedAt ?? Date.now()));
  return {
    ...note,
    datedAt,
    purgedAt: note.purgedAt ?? null,
    deletedAt: note.deletedAt ?? null,
  };
}

function normalizeFolder(folder: Folder): Folder {
  return {
    ...folder,
    updatedAt: folder.updatedAt ?? folder.createdAt,
    deletedAt: folder.deletedAt ?? null,
  };
}

function normalizeProfile(profile: Profile | undefined): Profile {
  return {
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    updatedAt: profile?.updatedAt ?? Date.now(),
  };
}

function coerceIds(state: AppState): AppState {
  const folderIds = new Map<string, string>();
  const folders = state.folders.map((folder) => {
    const id = isUuid(folder.id) ? folder.id : createId();
    folderIds.set(folder.id, id);
    return { ...folder, id };
  });
  const notes = state.notes.map((note) => {
    const folderId = note.folderId ? (folderIds.get(note.folderId) ?? null) : null;
    return {
      ...note,
      id: isUuid(note.id) ? note.id : createId(),
      folderId,
    };
  });
  return { ...state, folders, notes };
}

export async function clearState(userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.removeItem(stateKey(userId));
    if (!userId) await AsyncStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}
