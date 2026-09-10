import { getUserId, isClerkConfigured } from '../../../lib/auth';
import { emptyOptions, json } from '../../../lib/cors';
import { isDatabaseConfigured } from '../../../lib/db';
import { syncUserData } from '../../../lib/sync';
import type { SyncSnapshot } from '../../../../shared/sync';

export const runtime = 'nodejs';

function isSnapshot(value: unknown): value is SyncSnapshot {
  if (!value || typeof value !== 'object') return false;
  const body = value as Partial<SyncSnapshot>;
  return Boolean(body.profile) && Array.isArray(body.folders) && Array.isArray(body.notes);
}

export async function OPTIONS() {
  return emptyOptions();
}

export async function POST(request: Request) {
  if (!isClerkConfigured()) {
    return json({ error: 'Clerk is not configured on the server.' }, 503);
  }
  if (!isDatabaseConfigured()) {
    return json({ error: 'Neon DATABASE_URL is not configured.' }, 503);
  }

  const userId = await getUserId(request);
  if (!userId) return json({ error: 'Sign in to sync.' }, 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Expected JSON.' }, 400);
  }

  if (!isSnapshot(payload)) {
    return json({ error: 'Send profile, folders, and notes.' }, 400);
  }

  try {
    const snapshot = await syncUserData(userId, payload);
    return json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed.';
    return json({ error: message }, 500);
  }
}
