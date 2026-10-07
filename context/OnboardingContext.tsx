import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService } from '../services/profileService';
import { supabase } from '../lib/supabase';

export type GenderType = 'Male' | 'Female' | 'Other';
export type FitnessLevelType = 'Beginner' | 'Intermediate' | 'Advanced';
export type MainGoalType = 'Lose weight' | 'Build muscle' | 'Stay fit';

export interface OnboardingState {
  gender: GenderType | null;
  bodyFocus: string[];
  age: string;
  height: string;
  weight: string;
  goalWeight: string;
  fitnessLevel: FitnessLevelType | null;
  mainGoal: MainGoalType | null;
  isCompleted: boolean;
}

interface OnboardingContextValue {
  state: OnboardingState;
  isLoading: boolean;
  setGender: (gender: GenderType) => void;
  toggleBodyFocus: (focus: string) => void;
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  saveAndCompleteOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const STORAGE_KEY = '@sweatflix_onboarding';

const initialState: OnboardingState = {
  gender: null,
  bodyFocus: [],
  age: '',
  height: '',
  weight: '',
  goalWeight: '',
  fitnessLevel: null,
  mainGoal: null,
  isCompleted: false,
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as OnboardingState;
          setState(parsed);
        }
      } catch (err) {
        console.error('Failed to load onboarding data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const setGender = (gender: GenderType) => {
    setState((prev) => ({ ...prev, gender }));
  };

  const toggleBodyFocus = (focus: string) => {
    setState((prev) => {
      if (focus === 'Full Body') {
        return { ...prev, bodyFocus: ['Full Body'] };
      } else {
        const withoutFullBody = prev.bodyFocus.filter((item) => item !== 'Full Body');
        const exists = withoutFullBody.includes(focus);
        const updated = exists
          ? withoutFullBody.filter((item) => item !== focus)
          : [...withoutFullBody, focus];
        return { ...prev, bodyFocus: updated };
      }
    });
  };

  const setField = <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const saveAndCompleteOnboarding = async () => {
    try {
      const completedState: OnboardingState = {
        ...state,
        isCompleted: true,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedState));
      setState(completedState);

      // Save to Supabase profiles table if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await profileService.completeOnboarding(session.user.id, {
          gender: state.gender,
          body_focus: state.bodyFocus,
          level: state.fitnessLevel,
          main_goal: state.mainGoal,
          age: state.age ? parseInt(state.age, 10) : undefined,
          height_cm: state.height ? parseFloat(state.height) : undefined,
          weight_kg: state.weight ? parseFloat(state.weight) : undefined,
          goal_kg: state.goalWeight ? parseFloat(state.goalWeight) : undefined,
        });
      }
    } catch (err) {
      console.warn('Failed to save onboarding data to Supabase:', err);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setState(initialState);
    } catch (err) {
      console.error('Failed to reset onboarding data:', err);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        isLoading,
        setGender,
        toggleBodyFocus,
        setField,
        saveAndCompleteOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
