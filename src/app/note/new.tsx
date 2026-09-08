import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { startOfDay } from '@/lib/dates';
import type { NoteColorId } from '@/lib/types';

export default function NewNoteScreen() {
  const params = useLocalSearchParams<{
    date?: string;
    title?: string;
    body?: string;
    folderId?: string;
    color?: string;
  }>();
  const { createNote } = useNotes();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const rawDate = Array.isArray(params.date) ? params.date[0] : params.date;
    const datedAt = startOfDay(new Date(Number(rawDate) || Date.now()));
    const title = String(params.title ?? '');
    const body = String(params.body ?? '');
    const folderId = String(params.folderId ?? '');
    const color = String(params.color ?? '') as NoteColorId | '';

    const note = createNote({
      datedAt,
      title,
      body,
      folderId: folderId || null,
      color: color || undefined,
    });

    router.replace({
      pathname: '/note/[id]',
      params: { id: note.id, date: String(datedAt) },
    });
  }, [createNote, params.body, params.color, params.date, params.folderId, params.title]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});
