import {
  isNoteColor,
  isUuid,
  mergeSnapshots,
  type CheckItem,
  type SyncFolder,
  type SyncNote,
  type SyncProfile,
  type SyncSnapshot,
} from '../../shared/sync';
import { getSql } from './db';

type FolderRow = {
  id: string;
  name: string;
  color: string;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date | null;
};

type NoteRow = {
  id: string;
  title: string;
  body: string;
  color: string;
  folder_id: string | null;
  tags: string[] | null;
  checklist: unknown;
  pinned: boolean;
  archived: boolean;
  dated_at: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date | null;
  purged_at: string | Date | null;
};

type ProfileRow = {
  name: string;
  email: string;
  updated_at: string | Date;
};

function epoch(value: string | Date | null | undefined): number | null {
  if (value == null) return null;
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function requiredEpoch(value: string | Date | null | undefined, fallback: number): number {
  return epoch(value) ?? fallback;
}

function iso(ms: number | null): string | null {
  if (ms == null) return null;
  return new Date(ms).toISOString();
}

function asChecklist(value: unknown): CheckItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string') return [];
    return [
      {
        id: row.id,
        text: typeof row.text === 'string' ? row.text : '',
        done: Boolean(row.done),
      },
    ];
  });
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
}

function toFolder(row: FolderRow): SyncFolder {
  const createdAt = requiredEpoch(row.created_at, Date.now());
  return {
    id: row.id,
    name: row.name,
    color: isNoteColor(row.color) ? row.color : 'blue',
    createdAt,
    updatedAt: requiredEpoch(row.updated_at, createdAt),
    deletedAt: epoch(row.deleted_at),
  };
}

function toNote(row: NoteRow): SyncNote {
  const createdAt = requiredEpoch(row.created_at, Date.now());
  return {
    id: row.id,
    title: row.title ?? '',
    body: row.body ?? '',
    color: isNoteColor(row.color) ? row.color : 'blue',
    folderId: row.folder_id,
    tags: asTags(row.tags),
    checklist: asChecklist(row.checklist),
    pinned: Boolean(row.pinned),
    archived: Boolean(row.archived),
    deletedAt: epoch(row.deleted_at),
    purgedAt: epoch(row.purged_at),
    datedAt: requiredEpoch(row.dated_at, createdAt),
    createdAt,
    updatedAt: requiredEpoch(row.updated_at, createdAt),
  };
}

function sanitizeFolder(raw: SyncFolder): SyncFolder | null {
  if (!isUuid(raw.id) || !isNoteColor(raw.color)) return null;
  return {
    id: raw.id,
    name: (raw.name ?? '').trim() || 'Untitled folder',
    color: raw.color,
    createdAt: Number(raw.createdAt) || Date.now(),
    updatedAt: Number(raw.updatedAt) || Date.now(),
    deletedAt: raw.deletedAt == null ? null : Number(raw.deletedAt) || null,
  };
}

function sanitizeNote(raw: SyncNote, folderIds: Set<string>): SyncNote | null {
  if (!isUuid(raw.id) || !isNoteColor(raw.color)) return null;
  const folderId = raw.folderId && isUuid(raw.folderId) && folderIds.has(raw.folderId) ? raw.folderId : null;
  const createdAt = Number(raw.createdAt) || Date.now();
  return {
    id: raw.id,
    title: typeof raw.title === 'string' ? raw.title : '',
    body: typeof raw.body === 'string' ? raw.body : '',
    color: raw.color,
    folderId,
    tags: asTags(raw.tags),
    checklist: asChecklist(raw.checklist),
    pinned: Boolean(raw.pinned),
    archived: Boolean(raw.archived),
    deletedAt: raw.deletedAt == null ? null : Number(raw.deletedAt) || null,
    purgedAt: raw.purgedAt == null ? null : Number(raw.purgedAt) || null,
    datedAt: Number(raw.datedAt) || createdAt,
    createdAt,
    updatedAt: Number(raw.updatedAt) || createdAt,
  };
}

function sanitizeProfile(raw: SyncProfile): SyncProfile {
  return {
    name: typeof raw.name === 'string' ? raw.name.trim() : '',
    email: typeof raw.email === 'string' ? raw.email.trim() : '',
    updatedAt: Number(raw.updatedAt) || Date.now(),
  };
}

export async function syncUserData(userId: string, incoming: SyncSnapshot): Promise<SyncSnapshot> {
  const sql = getSql();

  const loaded = await sql.transaction((txn) => [
    txn`select set_config('app.current_user_id', ${userId}, true)`,
    txn`select name, email, updated_at from public.profiles where user_id = ${userId} limit 1`,
    txn`
      select id, name, color, created_at, updated_at, deleted_at
      from public.folders
      where user_id = ${userId}
    `,
    txn`
      select
        id, title, body, color, folder_id, tags, checklist, pinned, archived,
        dated_at, created_at, updated_at, deleted_at, purged_at
      from public.notes
      where user_id = ${userId}
    `,
  ]);

  const profileRow = (loaded[1] as ProfileRow[])[0] ?? null;
  const remote: SyncSnapshot = {
    profile: profileRow
      ? {
          name: profileRow.name,
          email: profileRow.email,
          updatedAt: requiredEpoch(profileRow.updated_at, 0),
        }
      : incoming.profile,
    folders: (loaded[2] as FolderRow[]).map(toFolder),
    notes: (loaded[3] as NoteRow[]).map(toNote),
  };

  const merged = mergeSnapshots(incoming, remote);
  const folders = merged.folders.map(sanitizeFolder).filter((folder): folder is SyncFolder => Boolean(folder));
  const folderIds = new Set(folders.map((folder) => folder.id));
  const notes = merged.notes
    .map((note) => sanitizeNote(note, folderIds))
    .filter((note): note is SyncNote => Boolean(note));
  const profile = sanitizeProfile(merged.profile);

  const folderJson = JSON.stringify(
    folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      created_at: iso(folder.createdAt),
      updated_at: iso(folder.updatedAt),
      deleted_at: iso(folder.deletedAt),
    }))
  );

  const noteJson = JSON.stringify(
    notes.map((note) => ({
      id: note.id,
      title: note.title,
      body: note.body,
      color: note.color,
      folder_id: note.folderId,
      tags: note.tags,
      checklist: note.checklist,
      pinned: note.pinned,
      archived: note.archived,
      dated_at: iso(note.datedAt),
      created_at: iso(note.createdAt),
      updated_at: iso(note.updatedAt),
      deleted_at: iso(note.deletedAt),
      purged_at: iso(note.purgedAt),
    }))
  );

  await sql.transaction((txn) => [
    txn`select set_config('app.current_user_id', ${userId}, true)`,
    txn`
      insert into public.profiles (user_id, name, email, updated_at)
      values (${userId}, ${profile.name}, ${profile.email}, ${iso(profile.updatedAt)}::timestamptz)
      on conflict (user_id) do update set
        name = excluded.name,
        email = excluded.email,
        updated_at = excluded.updated_at
      where excluded.updated_at >= public.profiles.updated_at
    `,
    txn`
      insert into public.folders (id, user_id, name, color, created_at, updated_at, deleted_at)
      select
        x.id,
        ${userId},
        x.name,
        x.color,
        x.created_at,
        x.updated_at,
        x.deleted_at
      from jsonb_to_recordset(${folderJson}::jsonb) as x(
        id uuid,
        name text,
        color text,
        created_at timestamptz,
        updated_at timestamptz,
        deleted_at timestamptz
      )
      on conflict (id) do update set
        name = excluded.name,
        color = excluded.color,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at
      where public.folders.user_id = ${userId}
        and excluded.updated_at >= public.folders.updated_at
    `,
    txn`
      insert into public.notes (
        id, user_id, title, body, color, folder_id, tags, checklist, pinned, archived,
        dated_at, created_at, updated_at, deleted_at, purged_at
      )
      select
        x.id,
        ${userId},
        x.title,
        x.body,
        x.color,
        x.folder_id,
        coalesce(
          (select array_agg(tag) from jsonb_array_elements_text(coalesce(x.tags, '[]'::jsonb)) as tag),
          '{}'::text[]
        ),
        coalesce(x.checklist, '[]'::jsonb),
        x.pinned,
        x.archived,
        x.dated_at,
        x.created_at,
        x.updated_at,
        x.deleted_at,
        x.purged_at
      from jsonb_to_recordset(${noteJson}::jsonb) as x(
        id uuid,
        title text,
        body text,
        color text,
        folder_id uuid,
        tags jsonb,
        checklist jsonb,
        pinned boolean,
        archived boolean,
        dated_at timestamptz,
        created_at timestamptz,
        updated_at timestamptz,
        deleted_at timestamptz,
        purged_at timestamptz
      )
      on conflict (id) do update set
        title = excluded.title,
        body = excluded.body,
        color = excluded.color,
        folder_id = excluded.folder_id,
        tags = excluded.tags,
        checklist = excluded.checklist,
        pinned = excluded.pinned,
        archived = excluded.archived,
        dated_at = excluded.dated_at,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at,
        purged_at = excluded.purged_at
      where public.notes.user_id = ${userId}
        and excluded.updated_at >= public.notes.updated_at
    `,
  ]);

  return { profile, folders, notes };
}
