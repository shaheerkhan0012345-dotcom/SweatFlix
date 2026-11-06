import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { profileService } from '../services/profileService';
import { pushNotificationService } from '../services/pushNotificationService';

export type RestTimerOption = 15 | 30 | 45 | 60;
export type UnitsOption = 'metric' | 'imperial';
export type SupportedLanguage = 'en' | 'hi' | 'ur' | 'ar' | 'es' | 'fr';

export interface WorkoutSettings {
  restTimer: RestTimerOption;
  soundEffects: boolean;
  vibration: boolean;
  autoPlayVideos: boolean;
  weeklyGoal: number; // 1-7
  units: UnitsOption;
}

export interface GeneralSettings {
  workoutReminders: boolean;
  reminderTime: string;
  notifications: boolean;
}

export interface SettingsState {
  name: string;
  workoutSettings: WorkoutSettings;
  generalSettings: GeneralSettings;
  adsRemoved: boolean;
  language: SupportedLanguage;
}

interface SettingsContextValue {
  settings: SettingsState;
  isLoading: boolean;
  updateName: (name: string) => Promise<void>;
  updateWorkoutSettings: (partial: Partial<WorkoutSettings>) => Promise<void>;
  updateGeneralSettings: (partial: Partial<GeneralSettings>) => Promise<void>;
  setAdsRemoved: (value: boolean) => Promise<void>;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  clearCache: () => Promise<void>;
  resetAllData: () => Promise<void>;
  refreshFromProfile: () => Promise<void>;
}

const STORAGE_KEY = '@sweatflix_settings';

const initialSettingsState: SettingsState = {
  name: 'Champ',
  workoutSettings: {
    restTimer: 30,
    soundEffects: true,
    vibration: true,
    autoPlayVideos: true,
    weeklyGoal: 4,
    units: 'metric',
  },
  generalSettings: {
    workoutReminders: true,
    reminderTime: '08:00 AM',
    notifications: true,
  },
  adsRemoved: false,
  language: 'en',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(initialSettingsState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshFromProfile = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const profile = await profileService.getProfile(session.user.id);
          if (profile) {
            setSettings((prev) => ({
              ...prev,
              name: profile.name || prev.name,
              workoutSettings: {
                ...prev.workoutSettings,
                weeklyGoal: profile.weekly_goal || prev.workoutSettings.weeklyGoal,
                units: (profile.units as UnitsOption) || prev.workoutSettings.units,
              },
              language: (profile.language as SupportedLanguage) || prev.language,
            }));
          }
        }
      } catch (e) {
        console.warn('Error refreshing settings from profile:', e);
      }
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SettingsState;
          setSettings(parsed);
          if (parsed.generalSettings) {
            pushNotificationService.scheduleWorkoutReminder(
              parsed.generalSettings.workoutReminders,
              parsed.generalSettings.reminderTime
            );
          }
        }
        await refreshFromProfile();
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (updated: SettingsState) => {
    setSettings(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const updateName = async (name: string) => {
    const trimmed = name.trim() || 'Champ';
    const updated: SettingsState = { ...settings, name: trimmed };
    await saveSettings(updated);

    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await profileService.updateProfile(session.user.id, { name: trimmed });
      }
    }
  };

  const updateWorkoutSettings = async (partial: Partial<WorkoutSettings>) => {
    const updated: SettingsState = {
      ...settings,
      workoutSettings: {
        ...settings.workoutSettings,
        ...partial,
      },
    };
    await saveSettings(updated);

    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        if (partial.weeklyGoal !== undefined) {
          await profileService.updateWeeklyGoal(session.user.id, partial.weeklyGoal);
        }
        if (partial.units !== undefined) {
          await profileService.updateUnits(session.user.id, partial.units);
        }
      }
    }
  };

  const updateGeneralSettings = async (partial: Partial<GeneralSettings>) => {
    const updated: SettingsState = {
      ...settings,
      generalSettings: {
        ...settings.generalSettings,
        ...partial,
      },
    };
    await saveSettings(updated);

    // Schedule or cancel real daily local workout reminder
    if (partial.workoutReminders !== undefined || partial.reminderTime !== undefined) {
      pushNotificationService.scheduleWorkoutReminder(
        updated.generalSettings.workoutReminders,
        updated.generalSettings.reminderTime
      );
    }
  };

  const setAdsRemoved = async (value: boolean) => {
    const updated: SettingsState = { ...settings, adsRemoved: value };
    await saveSettings(updated);
  };

  const setLanguage = async (lang: SupportedLanguage) => {
    const updated: SettingsState = { ...settings, language: lang };
    await saveSettings(updated);

    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await profileService.updateLanguage(session.user.id, lang);
      }
    }
  };

  const clearCache = async () => {
    // Cache cleared
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        '@sweatflix_onboarding',
        '@sweatflix_home_progress',
        '@sweatflix_is_premium',
        '@sweatflix_custom_workouts',
        STORAGE_KEY,
      ]);
      setSettings(initialSettingsState);
    } catch (e) {
      console.error('Failed to reset all data:', e);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateName,
        updateWorkoutSettings,
        updateGeneralSettings,
        setAdsRemoved,
        setLanguage,
        clearCache,
        resetAllData,
        refreshFromProfile,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
