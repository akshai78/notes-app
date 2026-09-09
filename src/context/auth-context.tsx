import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadGuest, saveGuest } from '@/lib/guest';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

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

    const boot = async () => {
      const wasGuest = await loadGuest();
      if (!supabase) {
        if (!mounted) return;
        setGuest(wasGuest);
        setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setGuest(wasGuest && !data.session);
      setReady(true);
    };

    void boot();

    if (!supabase) return () => {
      mounted = false;
    };

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
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
    if (error) return error.message;
    setGuest(false);
    await saveGuest(false);
    return null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Cloud sync is not configured.';
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (!data.session) return 'Account created. Confirm the email from Supabase, then sign in.';
    setGuest(false);
    await saveGuest(false);
    return null;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return 'Cloud sync is not configured.';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'codered://welcome',
    });
    return error?.message ?? null;
  }, []);

  const continueAsGuest = useCallback(async () => {
    setGuest(true);
    await saveGuest(true);
  }, []);

  const leaveGuest = useCallback(async () => {
    setGuest(false);
    await saveGuest(false);
  }, []);

  const signOut = useCallback(async () => {
    setGuest(false);
    await saveGuest(false);
    if (!supabase) return null;
    const { error } = await supabase.auth.signOut();
    return error?.message ?? null;
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
