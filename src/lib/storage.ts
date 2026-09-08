import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppState } from '@/lib/types';

const KEY = 'mino.app.v1';

export async function loadState(): Promise<AppState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
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

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
