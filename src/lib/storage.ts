import AsyncStorage from '@react-native-async-storage/async-storage';

import { startOfDay } from '@/lib/dates';
import type { AppState, Note } from '@/lib/types';

const KEY = 'codered.app.v1';
const LEGACY_KEY = 'mino.app.v1';

export async function loadState(): Promise<AppState | null> {
  try {
    let raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      raw = await AsyncStorage.getItem(LEGACY_KEY);
      if (raw) await AsyncStorage.setItem(KEY, raw);
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...parsed,
      notes: (parsed.notes ?? []).map(normalizeNote),
    };
  } catch {
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort on web private mode.
  }
}

function normalizeNote(note: Note): Note {
  const datedAt = startOfDay(new Date(note.datedAt ?? note.createdAt ?? note.updatedAt ?? Date.now()));
  return { ...note, datedAt };
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
    await AsyncStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}
