import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

type Mode = 'choose' | 'signin' | 'signup';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { configured, ready, user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.text} />
      </View>
    );
  }

  if (user) return <Redirect href="/" />;

  const submit = async () => {
    const nextEmail = email.trim();
    if (!nextEmail || password.length < 6) {
      setMessage('Enter an email and a password with at least 6 characters.');
      return;
    }
    setBusy(true);
    setMessage(null);
    const error = mode === 'signup' ? await signUp(nextEmail, password) : await signIn(nextEmail, password);
    setBusy(false);
    if (error) setMessage(error);
  };

  const title = mode === 'signup' ? 'Create account' : mode === 'signin' ? 'Sign in' : 'Welcome';
  const subtitle =
    mode === 'choose'
      ? 'Sign in or create an account to open your notes.'
      : mode === 'signup'
        ? 'A new Code Red account on this device.'
        : 'Welcome back. Your notes stay on this device first.';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Logo />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {!configured ? (
          <Text style={styles.message}>Cloud accounts are not configured. Add the Supabase keys to `.env`.</Text>
        ) : mode === 'choose' ? (
          <View style={styles.choices}>
            <Pressable
              onPress={() => {
                setMode('signin');
                setMessage(null);
              }}
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
              <Text style={styles.primaryLabel}>Sign in</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode('signup');
                setMessage(null);
              }}
              style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.88 }]}>
              <Text style={styles.secondaryLabel}>Create account</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
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
            <Pressable
              disabled={busy}
              onPress={submit}
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
              <Text style={styles.primaryLabel}>
                {busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setMessage(null);
              }}
              style={styles.linkBtn}>
              <Text style={styles.link}>
                {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
              </Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => {
                setMode('choose');
                setMessage(null);
              }}
              style={styles.linkBtn}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: Typography.display.fontSize,
    fontWeight: Typography.display.fontWeight,
    letterSpacing: Typography.display.letterSpacing,
    lineHeight: Typography.display.lineHeight,
    color: Colors.text,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSoft,
    marginBottom: Spacing.md,
  },
  choices: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  form: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  primary: {
    minHeight: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primaryLabel: {
    color: '#fff',
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 16,
  },
  secondary: {
    minHeight: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  secondaryLabel: {
    color: Colors.text,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 16,
  },
  message: {
    color: Colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  link: {
    color: Colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  back: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
