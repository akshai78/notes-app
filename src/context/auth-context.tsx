import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth as useClerkAuth, useSignIn, useSignUp, useUser } from '@clerk/expo';

import { isClerkConfigured } from '@/lib/env';
import { loadGuest, saveGuest } from '@/lib/guest';
import { allowApp, denyApp } from '@/lib/session-gate';

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthActionResult = {
  error: string | null;
  needsCode?: 'signup' | 'reset' | 'trust';
};

type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  user: AuthUser | null;
  guest: boolean;
  getToken: () => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  verifyCode: (code: string, newPassword?: string) => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  continueAsGuest: () => Promise<void>;
  leaveGuest: () => Promise<void>;
  signOut: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function clerkMessage(error: unknown): string {
  if (!error) return 'Something went wrong.';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const value = error as {
      message?: string;
      longMessage?: string;
      errors?: { longMessage?: string; message?: string }[];
    };
    const first = value.errors?.[0];
    const text = first?.longMessage || first?.message || value.longMessage || value.message;
    if (text) {
      const lower = text.toLowerCase();
      if (lower.includes('already') && lower.includes('taken')) {
        return 'That email already has an account. Sign in, or use Forgot password.';
      }
      if (lower.includes('rate')) {
        return 'Too many emails were sent just now. Wait a bit, or continue as guest.';
      }
      return text;
    }
  }
  return 'Something went wrong.';
}

async function activateSession(
  finalize: (args?: { navigate?: () => Promise<void> }) => Promise<{ error: unknown | null }>
): Promise<AuthActionResult> {
  const { error } = await finalize({ navigate: async () => undefined });
  if (error) return { error: clerkMessage(error) };
  allowApp();
  await saveGuest(false);
  return { error: null };
}

function GuestAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadGuest()
      .then((wasGuest) => {
        if (!mounted) return;
        if (wasGuest) allowApp();
        setGuest(wasGuest);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const notConfigured = useCallback(
    async (): Promise<AuthActionResult> => ({
      error: 'Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to enable accounts.',
    }),
    []
  );

  const continueAsGuest = useCallback(async () => {
    allowApp();
    setGuest(true);
    await saveGuest(true);
  }, []);

  const leaveGuest = useCallback(async () => {
    denyApp();
    setGuest(false);
    await saveGuest(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: false,
      ready,
      user: null,
      guest,
      getToken: async () => null,
      signIn: notConfigured,
      signUp: notConfigured,
      verifyCode: notConfigured,
      resetPassword: notConfigured,
      continueAsGuest,
      leaveGuest,
      signOut: async () => null,
    }),
    [ready, guest, notConfigured, continueAsGuest, leaveGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken: clerkGetToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [guest, setGuest] = useState(false);
  const [guestReady, setGuestReady] = useState(false);
  const [pending, setPending] = useState<'signup' | 'reset' | 'trust' | null>(null);

  useEffect(() => {
    let mounted = true;
    loadGuest()
      .then((wasGuest) => {
        if (!mounted) return;
        setGuest(wasGuest && !isSignedIn);
        if (wasGuest && !isSignedIn) allowApp();
        setGuestReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setGuestReady(true);
      });
    return () => {
      mounted = false;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    allowApp();
    void saveGuest(false);
  }, [isSignedIn]);

  const user = useMemo<AuthUser | null>(() => {
    if (!isSignedIn || !userId) return null;
    return {
      id: userId,
      email: clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? null,
    };
  }, [isSignedIn, userId, clerkUser]);

  const getToken = useCallback(async () => {
    try {
      return (await clerkGetToken()) ?? null;
    } catch {
      return null;
    }
  }, [clerkGetToken]);

  const signedIn = useCallback(async (): Promise<AuthActionResult> => {
    setGuest(false);
    setPending(null);
    return activateSession((args) => signIn.finalize(args));
  }, [signIn]);

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      try {
        const { error } = await signIn.password({ emailAddress: email, password });
        if (error) return { error: clerkMessage(error) };
        if (signIn.status === 'complete') return signedIn();
        if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
          const sent = await signIn.mfa.sendEmailCode();
          if (sent.error) return { error: clerkMessage(sent.error) };
          setPending('trust');
          return { error: null, needsCode: 'trust' };
        }
        return { error: 'Could not finish sign in. Check email and password settings in Clerk.' };
      } catch (error) {
        return { error: clerkMessage(error) };
      }
    },
    [signIn, signedIn]
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      try {
        const { error } = await signUp.password({ emailAddress: email, password });
        if (error) return { error: clerkMessage(error) };
        if (signUp.status === 'complete') {
          setGuest(false);
          setPending(null);
          return activateSession((args) => signUp.finalize(args));
        }
        const sent = await signUp.verifications.sendEmailCode();
        if (sent.error) return { error: clerkMessage(sent.error) };
        setPending('signup');
        return { error: null, needsCode: 'signup' };
      } catch (error) {
        return { error: clerkMessage(error) };
      }
    },
    [signUp]
  );

  const resetPassword = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      try {
        const created = await signIn.create({ identifier: email });
        if (created.error) return { error: clerkMessage(created.error) };
        const sent = await signIn.resetPasswordEmailCode.sendCode();
        if (sent.error) return { error: clerkMessage(sent.error) };
        setPending('reset');
        return { error: null, needsCode: 'reset' };
      } catch (error) {
        return { error: clerkMessage(error) };
      }
    },
    [signIn]
  );

  const verifyCode = useCallback(
    async (code: string, newPassword?: string): Promise<AuthActionResult> => {
      try {
        if (pending === 'signup') {
          const verified = await signUp.verifications.verifyEmailCode({ code });
          if (verified.error) return { error: clerkMessage(verified.error) };
          setGuest(false);
          setPending(null);
          return activateSession((args) => signUp.finalize(args));
        }

        if (pending === 'reset') {
          const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
          if (verified.error) return { error: clerkMessage(verified.error) };
          if (!newPassword) return { error: 'Choose a new password with at least 6 characters.' };
          const submitted = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
          if (submitted.error) return { error: clerkMessage(submitted.error) };
          return signedIn();
        }

        if (pending === 'trust') {
          const verified = await signIn.mfa.verifyEmailCode({ code });
          if (verified.error) return { error: clerkMessage(verified.error) };
          return signedIn();
        }

        return { error: 'Enter the code from your email.' };
      } catch (error) {
        return { error: clerkMessage(error) };
      }
    },
    [pending, signIn, signUp, signedIn]
  );

  const continueAsGuest = useCallback(async () => {
    allowApp();
    setGuest(true);
    await saveGuest(true);
  }, []);

  const leaveGuest = useCallback(async () => {
    denyApp();
    setGuest(false);
    await saveGuest(false);
  }, []);

  const signOut = useCallback(async () => {
    denyApp();
    setGuest(false);
    await saveGuest(false);
    try {
      await clerkSignOut();
      return null;
    } catch (error) {
      return clerkMessage(error);
    }
  }, [clerkSignOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: true,
      ready: Boolean(isLoaded && guestReady),
      user,
      guest: guest && !user,
      getToken,
      signIn: signInWithPassword,
      signUp: signUpWithPassword,
      verifyCode,
      resetPassword,
      continueAsGuest,
      leaveGuest,
      signOut,
    }),
    [
      isLoaded,
      guestReady,
      user,
      guest,
      getToken,
      signInWithPassword,
      signUpWithPassword,
      verifyCode,
      resetPassword,
      continueAsGuest,
      leaveGuest,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isClerkConfigured()) return <GuestAuthProvider>{children}</GuestAuthProvider>;
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
