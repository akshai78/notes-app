import '@/global.css';

import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UpdateAvailable } from '@/components/update-available';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { NotesProvider, useNotes } from '@/context/notes-context';
import { isAppAllowed } from '@/lib/session-gate';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { ready: authReady, user, guest, configured } = useAuth();
  const { ready: notesReady } = useNotes();
  const booted = authReady && notesReady;
  const canEnter = Boolean(user || guest || isAppAllowed());
  const needsWelcome = configured && !canEnter && pathname !== '/welcome';

  useEffect(() => {
    if (booted) void SplashScreen.hideAsync().catch(() => undefined);
  }, [booted]);

  useEffect(() => {
    if (!booted || !needsWelcome) return;
    router.replace('/welcome');
  }, [booted, needsWelcome, router]);

  if (!booted) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.text} />
      </View>
    );
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
      <UpdateAvailable enabled={canEnter && pathname !== '/welcome'} />
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
