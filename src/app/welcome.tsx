import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
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

type Mode = 'choose' | 'signin' | 'signup' | 'reset';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { configured, ready, user, guest, signIn, signUp, resetPassword, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.text} />
      </View>
    );
  }

  if (user || guest) return <Redirect href="/" />;

  const goGuest = async () => {
    setBusy(true);
    setMessage(null);
    await continueAsGuest();
    setBusy(false);
    router.replace('/');
  };

  const submit = async () => {
    const nextEmail = email.trim();
    if (mode === 'reset') {
      if (!nextEmail) {
        setMessage('Enter the email on your account.');
        return;
      }
      setBusy(true);
      setMessage(null);
      setInfo(null);
      const error = await resetPassword(nextEmail);
      setBusy(false);
      if (error) {
        setMessage(error);
        return;
      }
      setInfo('Check that inbox for a reset link, then sign in with the new password.');
      return;
    }

    if (!nextEmail || password.length < 6) {
      setMessage('Enter an email and a password with at least 6 characters.');
      return;
    }
    setBusy(true);
    setMessage(null);
    setInfo(null);
    const error = mode === 'signup' ? await signUp(nextEmail, password) : await signIn(nextEmail, password);
    setBusy(false);
    if (error) setMessage(error);
  };

  const title =
    mode === 'signup' ? 'Create account' : mode === 'signin' ? 'Sign in' : mode === 'reset' ? 'Reset password' : 'Welcome';
  const subtitle =
    mode === 'choose'
      ? 'Sign in, create an account, or continue as a guest.'
      : mode === 'signup'
        ? 'A new Code Red account on this device.'
        : mode === 'reset'
          ? 'We will email a link to set a new password.'
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
          <View style={styles.choices}>
            <Text style={styles.message}>Cloud accounts are not configured. You can still continue as a guest.</Text>
            <Pressable
              disabled={busy}
              onPress={goGuest}
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
              <Text style={styles.primaryLabel}>{busy ? 'Opening…' : 'Continue as guest'}</Text>
            </Pressable>
          </View>
        ) : mode === 'choose' ? (
          <View style={styles.choices}>
            <Pressable
              onPress={() => {
                setMode('signin');
                setMessage(null);
                setInfo(null);
              }}
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
              <Text style={styles.primaryLabel}>Sign in</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode('signup');
                setMessage(null);
                setInfo(null);
              }}
              style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.88 }]}>
              <Text style={styles.secondaryLabel}>Create account</Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={goGuest}
              style={({ pressed }) => [styles.guest, pressed && { opacity: 0.88 }]}>
              <Text style={styles.guestLabel}>{busy ? 'Opening…' : 'Continue as guest'}</Text>
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
            {mode !== 'reset' ? (
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password (6+ characters)"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={8}
                  style={styles.eye}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSoft} />
                </Pressable>
              </View>
            ) : null}
            {mode === 'signin' ? (
              <Pressable
                disabled={busy}
                onPress={() => {
                  setMode('reset');
                  setMessage(null);
                  setInfo(null);
                }}
                style={styles.forgotBtn}>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            ) : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}
            <Pressable
              disabled={busy}
              onPress={submit}
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
              <Text style={styles.primaryLabel}>
                {busy
                  ? 'Working…'
                  : mode === 'signup'
                    ? 'Create account'
                    : mode === 'reset'
                      ? 'Send reset link'
                      : 'Sign in'}
              </Text>
            </Pressable>
            {mode !== 'reset' ? (
              <Pressable
                disabled={busy}
                onPress={goGuest}
                style={({ pressed }) => [styles.guest, pressed && { opacity: 0.88 }]}>
                <Text style={styles.guestLabel}>Continue as guest</Text>
              </Pressable>
            ) : null}
            {mode !== 'reset' ? (
              <Pressable
                disabled={busy}
                onPress={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup');
                  setMessage(null);
                  setInfo(null);
                }}
                style={styles.linkBtn}>
                <Text style={styles.link}>
                  {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                disabled={busy}
                onPress={() => {
                  setMode('signin');
                  setMessage(null);
                  setInfo(null);
                }}
                style={styles.linkBtn}>
                <Text style={styles.link}>Back to sign in</Text>
              </Pressable>
            )}
            <Pressable
              disabled={busy}
              onPress={() => {
                setMode('choose');
                setMessage(null);
                setInfo(null);
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
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingRight: Spacing.sm,
  },
  passwordInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  eye: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
  },
  forgot: {
    color: Colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
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
  guest: {
    minHeight: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  guestLabel: {
    color: Colors.textSoft,
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    fontSize: 15,
  },
  message: {
    color: Colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  info: {
    color: Colors.success,
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
