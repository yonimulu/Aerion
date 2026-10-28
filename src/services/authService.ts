import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export const AuthService = {
  /**
   * Retrieves current authenticated user session.
   */
  async getSession(): Promise<Session | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the current user profile.
   */
  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  /**
   * Signs in with email and password.
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { user: null, error: 'Supabase client is not configured with URL and Anon Key.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Authentication failed.' };
    }
  },

  /**
   * Signs up a new administrator or user with email and password.
   */
  async signUp(email: string, password: string): Promise<{ user: User | null; error: string | null; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { user: null, error: 'Supabase client is not configured.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return {
        user: data.user,
        error: null,
        message: data.session ? 'Account created and signed in.' : 'Account registered. Please verify your email if confirmation is required.'
      };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Registration failed.' };
    }
  },

  /**
   * Signs out the current user session.
   */
  async signOut(): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: null };
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err?.message || 'Sign out failed.' };
    }
  },

  /**
   * Subscribes to authentication state changes.
   */
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    const supabase = getSupabase();
    if (!supabase) {
      callback(null, null);
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null, session);
    });

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
};
