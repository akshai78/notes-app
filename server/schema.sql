-- Code Red notes schema for Neon Postgres.
-- Clerk user ids are text (user_…). Note and folder ids are UUIDs from the app.
-- Access is enforced in the Next.js API and again with FORCE RLS.

create table if not exists public.profiles (
  user_id text primary key,
  name text not null default '',
  email text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.folders (
  id uuid primary key,
  user_id text not null,
  name text not null,
  color text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists public.notes (
  id uuid primary key,
  user_id text not null,
  title text not null default '',
  body text not null default '',
  color text not null,
  folder_id uuid,
  tags text[] not null default '{}',
  checklist jsonb not null default '[]'::jsonb,
  pinned boolean not null default false,
  archived boolean not null default false,
  dated_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  purged_at timestamptz
);

alter table public.folders drop constraint if exists folders_color_check;
alter table public.folders
  add constraint folders_color_check
  check (color in ('blue', 'pink', 'yellow', 'lavender', 'mint', 'peach'));

alter table public.notes drop constraint if exists notes_color_check;
alter table public.notes
  add constraint notes_color_check
  check (color in ('blue', 'pink', 'yellow', 'lavender', 'mint', 'peach'));

alter table public.notes drop constraint if exists notes_folder_id_fkey;
alter table public.notes
  add constraint notes_folder_id_fkey
  foreign key (folder_id) references public.folders (id) on delete set null;

create index if not exists folders_user_id_idx on public.folders (user_id);
create index if not exists folders_user_updated_idx on public.folders (user_id, updated_at);
create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at);
create index if not exists notes_folder_id_idx on public.notes (folder_id);

alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.notes enable row level security;
alter table public.profiles force row level security;
alter table public.folders force row level security;
alter table public.notes force row level security;

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  using (user_id = current_setting('app.current_user_id', true))
  with check (user_id = current_setting('app.current_user_id', true));

drop policy if exists folders_own on public.folders;
create policy folders_own on public.folders
  using (user_id = current_setting('app.current_user_id', true))
  with check (user_id = current_setting('app.current_user_id', true));

drop policy if exists notes_own on public.notes;
create policy notes_own on public.notes
  using (user_id = current_setting('app.current_user_id', true))
  with check (user_id = current_setting('app.current_user_id', true));
