export type CheckItem = {
  id: string;
  text: string;
  done: boolean;
};

export type NoteColorId = 'blue' | 'pink' | 'yellow' | 'lavender' | 'mint' | 'peach';

export type Note = {
  id: string;
  title: string;
  body: string;
  color: NoteColorId;
  folderId: string | null;
  tags: string[];
  checklist: CheckItem[];
  pinned: boolean;
  archived: boolean;
  deletedAt: number | null;
  datedAt: number;
  createdAt: number;
  updatedAt: number;
};

export type Folder = {
  id: string;
  name: string;
  color: NoteColorId;
  createdAt: number;
};

export type Profile = {
  name: string;
  email: string;
};

export type DateFilter = 'today' | 'week' | 'month' | 'all';

export type AppState = {
  notes: Note[];
  folders: Folder[];
  profile: Profile;
};
