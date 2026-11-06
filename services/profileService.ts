import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fileUriToArrayBuffer } from '../lib/storageUpload';

export type AccountVisibility = 'public' | 'friends' | 'private';

export interface UserProfile {
  id: string;
  email: string | null;
  name: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  account_visibility: AccountVisibility;
  gender: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal_kg: number | null;
  level: string;
  total_points: number;
  show_on_leaderboard: boolean;
  main_goal: string | null;
  body_focus: string[] | null;
  onboarding_completed: boolean;
  weekly_goal: number;
  units: 'metric' | 'imperial';
  language: string;
  is_premium: boolean;
  ads_removed: boolean;
  league_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  reward_premium_until: string | null;
  is_weekly_champion: boolean;
  created_at: string;
}

/**
 * Returns true if user has lifetime premium or active reward free premium
 */
export function isUserPremium(profile?: Partial<UserProfile> | null): boolean {
  if (!profile) return false;
  if (profile.is_premium === true) return true;
  if (profile.reward_premium_until) {
    const expiresAt = new Date(profile.reward_premium_until).getTime();
    return !isNaN(expiresAt) && expiresAt > Date.now();
  }
  return false;
}

export interface PublicProfile {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  account_visibility: AccountVisibility;
  posts_count: number;
  friends_count: number;
  can_view_content?: boolean;
  league_tier?: string | null;
  is_weekly_champion?: boolean | null;
}

export const defaultProfile: UserProfile = {
  id: '',
  email: null,
  name: 'Champ',
  username: null,
  bio: null,
  avatar_url: null,
  account_visibility: 'public',
  gender: null,
  age: 26,
  height_cm: 175,
  weight_kg: 72,
  goal_kg: 70,
  level: 'Beginner',
  total_points: 0,
  show_on_leaderboard: false,
  main_goal: 'Build Muscle',
  body_focus: ['Chest', 'Arms'],
  onboarding_completed: false,
  weekly_goal: 4,
  units: 'metric',
  language: 'en',
  is_premium: false,
  ads_removed: false,
  league_tier: 'Bronze',
  reward_premium_until: null,
  is_weekly_champion: false,
  created_at: new Date().toISOString(),
};

export const profileService = {
  /**
   * Validate username format (3-20 characters, lowercase a-z 0-9 _ .)
   */
  validateUsername(username: string): { valid: boolean; error?: string } {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (clean.length > 20) {
      return { valid: false, error: 'Username cannot exceed 20 characters' };
    }
    const USERNAME_REGEX = /^[a-z0-9_.]+$/;
    if (!USERNAME_REGEX.test(clean)) {
      return {
        valid: false,
        error: 'Only lowercase letters, numbers, underscores and periods allowed',
      };
    }
    return { valid: true };
  },

  /**
   * Check if a username is available in real-time
   */
  async checkUsernameAvailable(
    username: string,
    currentUserId?: string
  ): Promise<{ available: boolean; error?: string }> {
    const clean = username.trim().toLowerCase();
    const validation = this.validateUsername(clean);
    if (!validation.valid) {
      return { available: false, error: validation.error };
    }

    if (!isSupabaseConfigured) {
      return { available: true };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', clean)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return { available: false, error: 'Error checking username' };
      }

      if (data && data.id !== currentUserId) {
        return { available: false, error: 'Username is already taken' };
      }

      return { available: true };
    } catch {
      return { available: false, error: 'Network error checking username' };
    }
  },

  /**
   * Update or claim unique username
   */
  async updateUsername(
    userId: string,
    username: string
  ): Promise<{ success: boolean; error?: string }> {
    const clean = username.trim().toLowerCase();
    const availability = await this.checkUsernameAvailable(clean, userId);
    if (!availability.available) {
      return { success: false, error: availability.error };
    }

    if (!isSupabaseConfigured || !userId) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: clean })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update username' };
    }
  },

  /**
   * Upload an avatar to the public 'avatars' storage bucket
   */
  async uploadAvatar(userId: string, localUri: string): Promise<string> {
    if (!isSupabaseConfigured || !userId) {
      return localUri;
    }

    const arrayBuffer = await fileUriToArrayBuffer(localUri);

    const fileName = `${userId}/avatar_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Avatar upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = publicUrlData.publicUrl;

    // Update profiles table
    await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    return avatarUrl;
  },

  /**
   * Fetch full user profile for current user
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile:', error.message);
        return null;
      }

      if (!data) return null;

      return {
        ...defaultProfile,
        ...data,
      };
    } catch (e: any) {
      console.warn('Network exception while fetching profile:', e?.message);
      return null;
    }
  },

  /**
   * Fetch public profile for any user (safe, never exposes email/metrics)
   */
  async getPublicProfile(
    targetUserId: string,
    viewerId?: string | null
  ): Promise<PublicProfile | null> {
    if (!isSupabaseConfigured || !targetUserId) {
      return {
        id: targetUserId,
        name: 'Athlete',
        username: 'athlete',
        avatar_url: null,
        bio: 'Crushing daily goals on SweatFlix 🔥',
        account_visibility: 'public',
        posts_count: 3,
        friends_count: 5,
        can_view_content: true,
      };
    }

    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      // Check whether viewer can see target user's content
      let canView = true;
      if (viewerId !== targetUserId) {
        if (data.account_visibility === 'private') {
          canView = false;
        } else if (data.account_visibility === 'friends') {
          if (!viewerId) {
            canView = false;
          } else {
            // Check are_friends
            const { data: friendCheck } = await supabase.rpc('are_friends', {
              a: viewerId,
              b: targetUserId,
            });
            canView = !!friendCheck;
          }
        }
      }

      return {
        id: data.id,
        name: data.name || 'Athlete',
        username: data.username || null,
        avatar_url: data.avatar_url || null,
        bio: data.bio || null,
        account_visibility: data.account_visibility || 'public',
        posts_count: canView ? Number(data.posts_count || 0) : 0,
        friends_count: Number(data.friends_count || 0),
        can_view_content: canView,
      };
    } catch (e: any) {
      console.warn('Error fetching public profile:', e?.message);
      return null;
    }
  },

  /**
   * Update current user profile fields
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      // Points, level, and league tier/rewards are managed exclusively by database functions and triggers
      const {
        is_premium,
        ads_removed,
        id,
        created_at,
        total_points,
        level,
        league_tier,
        reward_premium_until,
        is_weekly_champion,
        ...allowedUpdates
      } = updates;

      if (allowedUpdates.username) {
        allowedUpdates.username = allowedUpdates.username.trim().toLowerCase();
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as UserProfile;
    } catch (e: any) {
      console.warn('Error updating profile:', e?.message);
      throw e;
    }
  },

  /**
   * Update show_on_leaderboard toggle
   */
  async updateShowOnLeaderboard(
    userId: string,
    show: boolean
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return true;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_on_leaderboard: show })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (e: any) {
      console.warn('Error updating leaderboard visibility:', e?.message);
      throw e;
    }
  },

  /**
   * Update account privacy visibility ('public' | 'friends' | 'private')
   */
  async updateAccountVisibility(
    userId: string,
    visibility: AccountVisibility
  ): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_visibility: visibility })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (e: any) {
      console.warn('Error updating account visibility:', e?.message);
      throw e;
    }
  },

  async completeOnboarding(
    userId: string,
    payload: {
      gender?: string | null;
      body_focus?: string[] | null;
      level?: string | null;
      main_goal?: string | null;
      age?: number | null;
      height_cm?: number | null;
      weight_kg?: number | null;
      goal_kg?: number | null;
    }
  ): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...payload,
          onboarding_completed: true,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as UserProfile;
    } catch (e: any) {
      console.warn('Error completing onboarding:', e?.message);
      throw e;
    }
  },

  async updateWeeklyGoal(userId: string, weeklyGoal: number): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      await supabase
        .from('profiles')
        .update({ weekly_goal: weeklyGoal })
        .eq('id', userId);
    } catch (e: any) {
      console.warn('Error updating weekly goal:', e?.message);
    }
  },

  async updateUnits(userId: string, units: 'metric' | 'imperial'): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      await supabase
        .from('profiles')
        .update({ units })
        .eq('id', userId);
    } catch (e: any) {
      console.warn('Error updating units:', e?.message);
    }
  },

  async updateLanguage(userId: string, language: string): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      await supabase
        .from('profiles')
        .update({ language })
        .eq('id', userId);
    } catch (e: any) {
      console.warn('Error updating language:', e?.message);
    }
  },
};
