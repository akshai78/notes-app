import '@/global.css';

import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UpdateAvailable } from '@/components/update-available';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { NotesProvider, useNotes } from '@/context/notes-context';

function RootNav() {
  const pathname = usePathname();
  const { ready: authReady, user, guest, configured } = useAuth();
  const { ready: notesReady } = useNotes();

  if (!authReady || !notesReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.text} />
      </View>
    );
  }

  if (configured && !user && !guest && pathname !== '/welcome') {
    return <Redirect href="/welcome" />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="compose" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="note/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="folder/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <UpdateAvailable enabled={pathname !== '/welcome'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotesProvider>
          <RootNav />
        </NotesProvider>
      </AuthProvider>
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
