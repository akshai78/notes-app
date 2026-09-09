import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Colors, Fonts, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export function CloudAccount() {
  const { configured, ready, user, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!configured) {
    return (
      <View style={[styles.card, Shadow.card]}>
        <Text style={styles.title}>Cloud account</Text>
        <Text style={styles.body}>Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable accounts.</Text>
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

  if (!user) return null;

  return (
    <View style={[styles.card, Shadow.card]}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="cloud-done-outline" size={18} color={Colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Signed in</Text>
          <Text style={styles.body}>{user.email}</Text>
        </View>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  message: {
    color: Colors.danger,
    fontSize: 13,
    lineHeight: 18,
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
