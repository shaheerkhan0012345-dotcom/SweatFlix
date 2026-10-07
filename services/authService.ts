import * as WebBrowser from 'expo-web-browser';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export interface AuthErrorResult {
  message: string;
}

export const authService = {
  async signUp(email: string, password: string, name: string = 'Champ') {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Please configure your .env file.');
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: name.trim() || 'Champ',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if user already exists (Supabase returns identities: [] for existing users)
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('This email is already registered. Please log in with your password.');
    }

    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Please configure your .env file.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out warning:', error.message);
    }
  },

  async sendPasswordReset(email: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Please configure your .env file.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) {
      throw new Error(error.message);
    }
  },

  async signInWithGoogle() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }

    // 1. Fast preflight check: see if Google provider is enabled on Supabase
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ylkfddrtocsbnfvwewei.supabase.co';
      const checkRes = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google`);
      if (!checkRes.ok) {
        const errJson = await checkRes.json().catch(() => ({}));
        if (
          errJson.msg?.includes('provider is not enabled') ||
          errJson.error_code === 'validation_failed' ||
          errJson.code === 400
        ) {
          throw new Error('Google sign-in is not enabled in your Supabase project yet. Please sign in with email and password, or enable Google Provider in your Supabase Auth dashboard.');
        }
      }
    } catch (checkErr: any) {
      if (checkErr?.message?.includes('Google sign-in is not enabled')) {
        throw checkErr;
      }
      // If network offline or check fails, continue to regular flow
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'sweatflix://login',
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, 'sweatflix://');
        
        if (result.type === 'success' && result.url) {
          const hashIdx = result.url.indexOf('#');
          const queryIdx = result.url.indexOf('?');
          const paramStr = hashIdx !== -1
            ? result.url.substring(hashIdx + 1)
            : queryIdx !== -1
            ? result.url.substring(queryIdx + 1)
            : '';

          const params = new URLSearchParams(paramStr);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const errorDesc = params.get('error_description') || params.get('error');

          if (errorDesc) {
            throw new Error(errorDesc);
          }

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionErr) throw new Error(sessionErr.message);
            return sessionData;
          }
        }

        // User dismissed/cancelled the web session
        return null;
      }
      return null;
    } catch (err: any) {
      const msg = err?.message || '';
      if (
        msg.includes('provider is not enabled') ||
        msg.includes('validation_failed') ||
        msg.includes('Unsupported provider') ||
        msg.includes('unsupported_provider')
      ) {
        throw new Error('Google sign-in is not enabled in your Supabase project yet. Please sign in with email and password.');
      }
      throw err;
    }
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return null;
      return data.session;
    } catch {
      return null;
    }
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data.user;
    } catch {
      return null;
    }
  },

  async deleteAccount(userId: string) {
    if (!isSupabaseConfigured || !userId) return;

    try {
      // Delete user's row from profiles table (cascade will remove related user rows)
      await supabase.from('profiles').delete().eq('id', userId);
      // Sign out
      await supabase.auth.signOut();
    } catch (e: any) {
      console.warn('Account deletion cleanup warning:', e?.message);
      await supabase.auth.signOut();
    }
  },
};
