import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadGuest, saveGuest } from '@/lib/guest';
import { allowApp, denyApp } from '@/lib/session-gate';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

function authErrorMessage(message?: string | null): string | null {
  if (!message) return null;
  const lower = message.toLowerCase();
  if (lower.includes('rate limit')) {
    return 'Too many emails were sent just now. Wait about an hour, or continue as guest. In Supabase: Authentication → Providers → Email, you can turn off Confirm email while testing.';
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'That email already has an account. Sign in, or use Forgot password.';
  }
  return message;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  user: User | null;
  guest: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  continueAsGuest: () => Promise<void>;
  leaveGuest: () => Promise<void>;
  signOut: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    let mounted = true;

    const finish = (nextGuest: boolean, nextSession: Session | null) => {
      if (!mounted) return;
      if (nextGuest || nextSession) allowApp();
      setGuest(nextGuest);
      setSession(nextSession);
      setReady(true);
    };

    const boot = async () => {
      let wasGuest = false;
      try {
        wasGuest = await loadGuest();
      } catch {
        wasGuest = false;
      }

      if (!supabase) {
        finish(wasGuest, null);
        return;
      }

      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 4000);
        finish(wasGuest && !data.session, data.session);
      } catch {
        finish(wasGuest, null);
      }
    };

    void boot();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        allowApp();
        setGuest(false);
        void saveGuest(false);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Cloud sync is not configured.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return authErrorMessage(error.message);
    allowApp();
    setGuest(false);
    await saveGuest(false);
    return null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Cloud sync is not configured.';
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return authErrorMessage(error.message);
    if (!data.session) return 'Account created. Confirm the email from Supabase, then sign in.';
    allowApp();
    setGuest(false);
    await saveGuest(false);
    return null;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return 'Cloud sync is not configured.';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'codered://welcome',
    });
    return authErrorMessage(error?.message);
  }, []);

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
    if (!supabase) return null;
    const { error } = await supabase.auth.signOut();
    return authErrorMessage(error?.message);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured(),
      ready,
      session,
      user: session?.user ?? null,
      guest,
      signIn,
      signUp,
      resetPassword,
      continueAsGuest,
      leaveGuest,
      signOut,
    }),
    [ready, session, guest, signIn, signUp, resetPassword, continueAsGuest, leaveGuest, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
