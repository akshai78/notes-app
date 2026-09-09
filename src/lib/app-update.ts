import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const RELEASES_URL = 'https://api.github.com/repos/akshai78/notes-app/releases/latest';
const DISMISS_KEY = 'codered.update.dismissed';

export type AppUpdate = {
  version: string;
  title: string;
  notes: string;
  apkUrl: string;
  pageUrl: string;
};

export function currentAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.2.2';
}

export function compareVersions(a: string, b: string): number {
  const left = a.replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const right = b.replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) return delta > 0 ? 1 : -1;
  }
  return 0;
}

export async function fetchLatestUpdate(): Promise<AppUpdate | null> {
  try {
    const response = await fetch(RELEASES_URL, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      tag_name?: string;
      name?: string;
      body?: string;
      html_url?: string;
      assets?: { name?: string; browser_download_url?: string }[];
    };
    const version = (data.tag_name ?? '').replace(/^v/i, '');
    if (!version) return null;
    const apk = data.assets?.find((asset) => asset.name?.toLowerCase().endsWith('.apk'));
    return {
      version,
      title: data.name?.trim() || `Code Red ${version}`,
      notes: (data.body ?? '').trim(),
      apkUrl: apk?.browser_download_url ?? data.html_url ?? RELEASES_URL,
      pageUrl: data.html_url ?? 'https://github.com/akshai78/notes-app/releases/latest',
    };
  } catch {
    return null;
  }
}

export async function isUpdateDismissed(version: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DISMISS_KEY)) === version;
  } catch {
    return false;
  }
}

export async function dismissUpdate(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISS_KEY, version);
  } catch {
    // ignore
  }
}

export async function checkForAppUpdate(): Promise<AppUpdate | null> {
  const latest = await fetchLatestUpdate();
  if (!latest) return null;
  if (compareVersions(latest.version, currentAppVersion()) <= 0) return null;
  return latest;
}
