import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string | null;
  name: string;
  gender: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal_kg: number | null;
  level: string | null;
  main_goal: string | null;
  body_focus: string[] | null;
  onboarding_completed: boolean;
  weekly_goal: number;
  units: 'metric' | 'imperial';
  language: string;
  is_premium: boolean;
  ads_removed: boolean;
  created_at: string;
}

export const defaultProfile: UserProfile = {
  id: '',
  email: null,
  name: 'Champ',
  gender: null,
  age: 26,
  height_cm: 175,
  weight_kg: 72,
  goal_kg: 70,
  level: 'Beginner',
  main_goal: 'Build Muscle',
  body_focus: ['Chest', 'Arms'],
  onboarding_completed: false,
  weekly_goal: 4,
  units: 'metric',
  language: 'en',
  is_premium: false,
  ads_removed: false,
  created_at: new Date().toISOString(),
};

export const profileService = {
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

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      // Filter out protected columns so client doesn't conflict
      const { is_premium, ads_removed, id, created_at, ...allowedUpdates } = updates;

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
