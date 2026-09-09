# AGENTS.md

Reference for coding agents working in this repository.

Code Red is a notes product. The mobile client lives in this Expo app. Cloud identity and data use the stack below — not Supabase Auth as the long-term IAM, and not a local SQLite file as the source of truth for signed-in users.

## Stack (authoritative)

| Layer | Choice | Notes |
|--------|--------|--------|
| Backend | **Next.js** (App Router, TypeScript) | HTTP API and server-only data access. Route Handlers under `app/api`. |
| Database | **Neon Postgres** | Serverless Postgres. Schema and queries follow `.agents/skills/postgres-best-practices`. |
| IAM | **Clerk** | Sign-in, sessions, and user ids. The database never stores passwords. |

Do not introduce a second auth vendor, a second Postgres host, or an ORM/query layer besides the one already in the Next.js app. If the Next.js app is not in the tree yet, add it as a sibling app (for example `apps/api` or `backend/`) rather than rewriting the Expo client into Next.js.

## Current vs target

- **Today:** Expo (SDK 57) client, local-first notes in AsyncStorage, optional Supabase email auth.
- **Target:** Expo client talks to a **Next.js** backend. **Clerk** identifies the user. **Neon** stores profiles, folders, and notes.

Guest mode stays local-only. Cloud sync runs only after Clerk has a session.

## Next.js backend

- App Router only. TypeScript. Server Components and Route Handlers for privileged work.
- Database and Clerk secret keys stay on the server. Never prefix them with `NEXT_PUBLIC_` except Clerk’s publishable key.
- Prefer Route Handlers (`app/api/.../route.ts`) for the mobile client. Keep request/response JSON small and stable.
- Validate every body (ids, colors, tag arrays, checklist JSON). Reject unknown fields.
- Return `401` when Clerk has no session. Return `403` when the row belongs to another user. Return `404` when the row is missing or soft-deleted (do not leak that it exists for someone else).
- Do not query Neon from the Expo app. The phone calls Next.js; Next.js calls Neon.

Typical routes for this product:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/me` | Profile for the Clerk user |
| `GET` | `/api/notes` | Notes for the current user (not deleted) |
| `PUT` | `/api/notes/:id` | Upsert one note the user owns |
| `DELETE` | `/api/notes/:id` | Soft-delete (`deleted_at`) |
| `GET`/`PUT`/`DELETE` | `/api/folders` and `/api/folders/:id` | Same ownership rules |

## Clerk (IAM)

- Use `@clerk/nextjs` on the Next.js app. Protect `/api/*` with `clerkMiddleware` and `createRouteMatcher`.
- On the server, read the user with `auth()` / `currentUser()`. The Clerk user id (`user_...`) is the tenant key in Postgres (`user_id text not null`).
- Do not map Clerk users onto `auth.users` from Supabase. Do not use Supabase RLS helpers (`auth.uid()`).
- Sync profile rows on Clerk **`user.created`** / **`user.updated`** webhooks (`svix` verification). Store `name` and primary `email` on `profiles`.
- Expo talks to Clerk with the official Expo/React Native SDK, then sends the session token to Next.js (`Authorization: Bearer <token>`). Next.js verifies that token; it does not trust a `user_id` in the JSON body.
- Confirmation / reset email branding and redirect URLs are Clerk Dashboard settings, not Neon.

## Neon Postgres

Read `.agents/skills/postgres-best-practices/SKILL.md` before writing SQL or migrations.

### Connections

Neon gives two URLs. Use the right one:

| Env | Use |
|-----|-----|
| `DATABASE_URL` | Pooled. Runtime queries from Next.js (serverless / Node). |
| `DATABASE_URL_UNPOOLED` | Direct. Migrations, `psql`, one-off scripts. |

Prefer `@neondatabase/serverless` (HTTP or websocket) from Route Handlers so each invocation does not open a raw `max_connections` session. Do not create a global `pg.Pool` with a large `max` on serverless.

### Schema conventions

- `timestamptz` for every instant. No naive `timestamp`.
- `text` over `varchar(n)`. Add `CHECK` when a length limit matters.
- Client-generated note/folder ids stay `uuid` primary keys (the Expo app already mints ids).
- `user_id` is Clerk’s string id (`text`), not `uuid`, and not a FK to Supabase `auth.users`.
- Soft delete with `deleted_at timestamptz`. List queries use `deleted_at is null`.
- Composite indexes match list filters: `(user_id, updated_at desc)` on notes and folders; `(user_id, dated_at)` if calendar queries need it.
- `checklist` is `jsonb` (array of `{ id, text, done }`). `tags` is `text[]`.
- Enable RLS on user tables **and** still filter `where user_id = $clerkUserId` in the API. Neon + Clerk has no `auth.uid()`; RLS must use a session setting you set per request, or rely on the API filter. Prefer: set `set_config('app.user_id', $clerkUserId, true)` at the start of the request and write policies as `user_id = current_setting('app.user_id', true)`. If that is not wired yet, the API filter is mandatory.

Canonical tables (align with `src/lib/types.ts` and `supabase/schema.sql`, minus Supabase auth):

```sql
create table if not exists public.profiles (
  id text primary key,                 -- Clerk user id
  name text not null default '',
  email text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.folders (
  id uuid primary key,
  user_id text not null references public.profiles (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.notes (
  id uuid primary key,
  user_id text not null references public.profiles (id) on delete cascade,
  title text not null default '',
  body text not null default '',
  color text not null,
  folder_id uuid references public.folders (id) on delete set null,
  tags text[] not null default '{}',
  checklist jsonb not null default '[]'::jsonb,
  pinned boolean not null default false,
  archived boolean not null default false,
  dated_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create index if not exists folders_user_updated on public.folders (user_id, updated_at desc);
create index if not exists notes_user_updated on public.notes (user_id, updated_at desc);
create index if not exists notes_user_dated on public.notes (user_id, dated_at);
```

Migrations live with the Next.js app (Drizzle or SQL files). Apply them against `DATABASE_URL_UNPOOLED`. Never edit production data by hand when a migration will do.

### Query habits

- Always include `user_id = $1` (Clerk id) on note/folder reads and writes.
- Upsert on `(id)` only after proving the existing row is missing or owned by that user.
- Pagination: keyset on `(updated_at, id)`, not `OFFSET`.
- No `SELECT *` in new queries. No unbounded `in (...)` of client ids without a user filter.

## Environment

Next.js (server):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=                 # Neon pooled
DATABASE_URL_UNPOOLED=        # Neon direct
```

Expo (client):

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_URL=          # Next.js origin, no trailing slash
```

Ship a local/mock fallback only when a secret is missing and the feature can degrade (guest / local notes). Do not block the Expo guest path on Clerk or Neon.

## Product rules agents must not break

- Calendar notes use `datedAt` / `dated_at`. Compose and the draft queue must still land on the selected day, including future dates.
- Empty notes are discarded. Soft-deleted notes stay out of the board.
- Welcome / guest: guest is local; leaving guest returns to sign-in. Cloud users enter only after Clerk session + API allow.
- Confirmation links must open the **app** (`codered://welcome`) or the Next.js app URL Clerk is configured with — never a leftover `localhost` Site URL from another vendor.

## Skills in this repo

| Skill | When to read |
|--------|----------------|
| `.agents/skills/postgres-best-practices` | Any SQL, index, migration, or Neon connection question |
| `.agents/skills/skill-creator` | Adding another agent skill |
| `.agents/skills/supabase` | Legacy Supabase-only work (do not extend this path for new auth) |

New backend work follows **Next.js + Neon + Clerk** in this file first.
