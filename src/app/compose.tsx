import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useNotes } from '@/context/notes-context';
import { consumeNoteDraft } from '@/lib/note-draft';

export default function ComposeScreen() {
  const { createNote } = useNotes();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const draft = consumeNoteDraft();
    const note = createNote({
      datedAt: draft?.datedAt,
      title: draft?.title ?? '',
      body: draft?.body ?? '',
      folderId: draft?.folderId ?? null,
      color: draft?.color || undefined,
    });

    router.replace(`/note/${note.id}`);
  }, [createNote]);

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
