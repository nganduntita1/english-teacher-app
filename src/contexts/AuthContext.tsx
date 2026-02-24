'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { normalizeUsername } from '@/lib/usernameAuth';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Ensure a profile row exists for the authenticated user
  useEffect(() => {
    const syncProfile = async () => {
      if (!user) return;

      const emailPrefix = user.email?.split('@')[0] ?? null;
      const fallbackUsername = emailPrefix ? normalizeUsername(emailPrefix) : null;

      const { error } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email ?? '',
        full_name: (user as any)?.user_metadata?.full_name ?? null,
        username: (user as any)?.user_metadata?.username ?? fallbackUsername,
      });

      if (error) {
        console.error('Error syncing user profile:', error);
      }
    };

    syncProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ session, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
