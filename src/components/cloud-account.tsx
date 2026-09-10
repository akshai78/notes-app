import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Colors, Fonts, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useNotes } from '@/context/notes-context';
import { apiBaseUrl } from '@/lib/env';

export function CloudAccount() {
  const { configured, ready, user, guest, signOut, leaveGuest } = useAuth();
  const { syncStatus, syncNow } = useNotes();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const api = apiBaseUrl();

  if (!configured && !guest) {
    return (
      <View style={[styles.card, Shadow.card]}>
        <Text style={styles.title}>Cloud account</Text>
        <Text style={styles.body}>Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to enable Clerk accounts.</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.card, Shadow.card]}>
        <ActivityIndicator color={Colors.text} />
      </View>
    );
  }

  if (guest && !user) {
    return (
      <View style={[styles.card, Shadow.card]}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Ionicons name="person-outline" size={18} color={Colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Guest</Text>
            <Text style={styles.body}>Notes stay on this device. Sign in anytime to sync with Clerk.</Text>
          </View>
        </View>
        <Pressable
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            await leaveGuest();
            setBusy(false);
            router.replace('/welcome');
          }}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
          <Text style={styles.buttonLabel}>{busy ? 'Opening…' : 'Sign in or create account'}</Text>
        </Pressable>
      </View>
    );
  }

  if (!user) return null;

  const syncLabel =
    syncStatus.state === 'syncing'
      ? 'Syncing…'
      : syncStatus.state === 'synced'
        ? 'Notes are synced'
        : syncStatus.state === 'offline'
          ? 'Offline — notes stay on this device'
          : syncStatus.message || (api ? 'Waiting to sync' : 'Set EXPO_PUBLIC_API_URL to sync');

  return (
    <View style={[styles.card, Shadow.card]}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons
            name={syncStatus.state === 'synced' ? 'cloud-done-outline' : 'cloud-outline'}
            size={18}
            color={Colors.text}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Signed in</Text>
          <Text style={styles.body}>{user.email || 'Clerk account'}</Text>
          <Text style={styles.sync}>{syncLabel}</Text>
        </View>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          disabled={busy || syncStatus.state === 'syncing'}
          onPress={() => {
            void syncNow();
          }}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
          <Text style={styles.buttonLabel}>Sync now</Text>
        </Pressable>
        <Pressable
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            setMessage(null);
            const error = await signOut();
            setBusy(false);
            if (error) setMessage(error);
          }}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
          <Text style={styles.buttonLabel}>{busy ? 'Signing out…' : 'Sign out'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 16,
    color: Colors.text,
  },
  body: {
    marginTop: 4,
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  sync: {
    marginTop: 6,
    color: Colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    color: Colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  buttonLabel: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
});
