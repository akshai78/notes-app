import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export function CloudAccount() {
  const { configured, ready, user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!configured) {
    return (
      <View style={[styles.card, Shadow.card]}>
        <Text style={styles.title}>Cloud sync</Text>
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

  const run = async (action: () => Promise<string | null>) => {
    setBusy(true);
    setMessage(null);
    const error = await action();
    setBusy(false);
    if (error) setMessage(error);
  };

  if (user) {
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
        <Pressable
          disabled={busy}
          onPress={() => run(signOut)}
          style={({ pressed }) => [styles.button, styles.ghost, pressed && { opacity: 0.85 }]}>
          <Text style={styles.ghostLabel}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.card, Shadow.card]}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="cloud-outline" size={18} color={Colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Cloud sync</Text>
          <Text style={styles.body}>Sign in to keep notes on this Supabase project. They still save on this device first.</Text>
        </View>
      </View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password (6+ characters)"
        placeholderTextColor={Colors.textMuted}
        secureTextEntry
        style={styles.input}
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          disabled={busy || !email.trim() || password.length < 6}
          onPress={() => run(() => signIn(email.trim(), password))}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.88 }]}>
          <Text style={styles.buttonLabel}>{busy ? 'Working…' : 'Sign in'}</Text>
        </Pressable>
        <Pressable
          disabled={busy || !email.trim() || password.length < 6}
          onPress={() => run(() => signUp(email.trim(), password))}
          style={({ pressed }) => [styles.button, styles.ghost, pressed && { opacity: 0.85 }]}>
          <Text style={styles.ghostLabel}>Create account</Text>
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
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.bg,
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
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  ghost: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostLabel: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
});
