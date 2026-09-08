import '@/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';
import { NotesProvider, useNotes } from '@/context/notes-context';

function RootNav() {
  const { ready } = useNotes();

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="note/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="folder/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotesProvider>
        <RootNav />
      </NotesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});
