-- Run this in the Supabase SQL editor for project tdjderirryagsqjenosu.
-- Auth users are created by the app (email + password). These tables store synced notes.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.folders (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.notes (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
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
  deleted_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.notes enable row level security;

drop policy if exists "profiles are own rows" on public.profiles;
create policy "profiles are own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "folders are own rows" on public.folders;
create policy "folders are own rows" on public.folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notes are own rows" on public.notes;
create policy "notes are own rows" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists folders_user_updated on public.folders (user_id, updated_at);
create index if not exists notes_user_updated on public.notes (user_id, updated_at);
