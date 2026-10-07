import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService, UserProfile, defaultProfile } from '../services/profileService';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfileForUser = async (userId: string, userEmail?: string | null) => {
    try {
      const fetched = await profileService.getProfile(userId);
      if (fetched) {
        setProfile(fetched);
      } else {
        // Fallback default profile if trigger hasn't fired yet
        setProfile({
          ...defaultProfile,
          id: userId,
          email: userEmail || null,
        });
      }
    } catch (e) {
      console.warn('Failed to load profile for user:', e);
      setProfile({
        ...defaultProfile,
        id: userId,
        email: userEmail || null,
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          setIsLoading(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          if (data.session?.user) {
            await fetchProfileForUser(data.session.user.id, data.session.user.email);
          }
        }
      } catch (e) {
        console.warn('Error checking session:', e);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            await fetchProfileForUser(newSession.user.id, newSession.user.email);
          } else {
            setProfile(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfileForUser(user.id, user.email);
    }
  };

  const signIn = async (email: string, password: string) => {
    const data = await authService.signIn(email, password);
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
      if (data.session.user) {
        await fetchProfileForUser(data.session.user.id, data.session.user.email);
      }
    }
  };

  const signUp = async (email: string, password: string, name: string = 'Champ') => {
    const data = await authService.signUp(email, password, name);
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
      if (data.session.user) {
        await fetchProfileForUser(data.session.user.id, data.session.user.email);
      }
    }
    return data;
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const sendPasswordReset = async (email: string) => {
    await authService.sendPasswordReset(email);
  };

  const signInWithGoogle = async () => {
    const data = await authService.signInWithGoogle();
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
      if (data.session.user) {
        await fetchProfileForUser(data.session.user.id, data.session.user.email);
      }
    }
    return data;
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user?.id) return null;
    const updated = await profileService.updateProfile(user.id, updates);
    if (updated) {
      setProfile(updated);
    }
    return updated;
  };

  const deleteAccount = async () => {
    if (!user?.id) return;
    await authService.deleteAccount(user.id);
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
        signInWithGoogle,
        refreshProfile,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
