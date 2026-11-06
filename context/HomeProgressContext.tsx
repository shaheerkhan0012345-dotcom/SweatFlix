import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { workoutService } from '../services/workoutService';

export interface HomeProgressState {
  completedDays: number[]; // 0 = Mon, 1 = Tue, ..., 6 = Sun
  completedCount: number;
  weeklyTarget: number;
  streak: number;
  challengeDay: number;
  challengeTotalDays: number;
  lastCompletedDate: string | null;
  totalKcal: number;
  totalWorkouts: number;
}

interface HomeProgressContextValue {
  progress: HomeProgressState;
  isTodayDone: boolean;
  markTodayAsDone: (workoutName?: string, kcal?: number) => Promise<boolean>;
  resetProgress: () => Promise<void>;
  isLoading: boolean;
  refreshProgress: () => Promise<void>;
}

const STORAGE_KEY = '@sweatflix_home_progress';

export const getTodayDayIndex = (): number => {
  const day = new Date().getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  return day === 0 ? 6 : day - 1; // 0 = Mon, ..., 6 = Sun
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getMondayOfWeek = (d = new Date()): string => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const calculateStreakFromDates = (dateStrings: string[]): number => {
  if (dateStrings.length === 0) return 0;
  const uniqueDates = Array.from(new Set(dateStrings)).sort().reverse();
  const today = getTodayDateString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const mostRecent = uniqueDates[0];
  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(mostRecent);

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(expectedStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
};

const initialProgressState: HomeProgressState = {
  completedDays: [],
  completedCount: 0,
  weeklyTarget: 4,
  streak: 0,
  challengeDay: 1,
  challengeTotalDays: 7,
  lastCompletedDate: null,
  totalKcal: 0,
  totalWorkouts: 0,
};

const HomeProgressContext = createContext<HomeProgressContextValue | undefined>(undefined);

export const HomeProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<HomeProgressState>(initialProgressState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadFromDatabase = async (userId: string) => {
    try {
      // 1. Fetch sessions
      const sessions = await workoutService.getSessions(userId);
      const totalWorkouts = sessions.length;
      const totalKcal = sessions.reduce((acc, s) => acc + (s.kcal || 0), 0);

      // Session dates for streak
      const sessionDates = sessions.map((s) => s.done_at.split('T')[0]);
      const streak = calculateStreakFromDates(sessionDates);

      // Filter sessions for current week
      const currentWeekStart = new Date(getMondayOfWeek());
      const nextWeekStart = new Date(currentWeekStart.getTime() + 7 * 86400000);

      const weekSessions = sessions.filter((s) => {
        const d = new Date(s.done_at);
        return d >= currentWeekStart && d < nextWeekStart;
      });

      const completedDays = Array.from(
        new Set(
          weekSessions.map((s) => {
            const day = new Date(s.done_at).getDay();
            return day === 0 ? 6 : day - 1;
          })
        )
      );

      const lastCompletedDate = sessionDates[0] || null;

      // 2. Fetch active challenge
      const userChallenges = await workoutService.getUserChallenges(userId);
      const activeChallenge = userChallenges[0];
      const challengeDay = activeChallenge?.current_day || 1;

      // 3. Weekly target from weekly_goals or default 4
      const weeklyGoal = await workoutService.getWeeklyGoal(userId, getMondayOfWeek());
      const target = weeklyGoal?.target_workouts || 4;

      setProgress((prev) => ({
        ...prev,
        completedDays,
        completedCount: completedDays.length,
        weeklyTarget: target,
        streak,
        challengeDay,
        challengeTotalDays: 7,
        lastCompletedDate,
        totalKcal,
        totalWorkouts,
      }));
    } catch (e) {
      console.warn('Error loading progress from database:', e);
    }
  };

  const refreshProgress = React.useCallback(async () => {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await loadFromDatabase(session.user.id);
        return;
      }
    }

    // Local storage fallback
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load local home progress:', err);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const init = async () => {
      try {
        await refreshProgress();
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    init();
    return () => {
      isCurrent = false;
    };
  }, [refreshProgress]);

  const todayDateStr = getTodayDateString();
  const isTodayDone = progress.lastCompletedDate === todayDateStr;

  const markTodayAsDone = async (
    workoutName: string = 'Daily Routine',
    kcal: number = 280
  ): Promise<boolean> => {
    if (isTodayDone) {
      return false;
    }

    const todayIndex = getTodayDayIndex();
    const updatedDays = Array.from(new Set([...progress.completedDays, todayIndex]));
    const updatedCount = progress.completedCount + 1;
    const updatedStreak = progress.streak + 1;
    const updatedChallengeDay = Math.min(
      progress.challengeDay + 1,
      progress.challengeTotalDays
    );
    const updatedTotalKcal = progress.totalKcal + kcal;
    const updatedTotalWorkouts = progress.totalWorkouts + 1;

    const newProgress: HomeProgressState = {
      ...progress,
      completedDays: updatedDays,
      completedCount: updatedCount,
      streak: updatedStreak,
      challengeDay: updatedChallengeDay,
      lastCompletedDate: todayDateStr,
      totalKcal: updatedTotalKcal,
      totalWorkouts: updatedTotalWorkouts,
    };

    setProgress(newProgress);

    // Save to database if connected
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const userId = session.user.id;
        const weekStart = getMondayOfWeek();

        // 1. Save session
        await workoutService.saveSession(userId, workoutName, kcal);

        // 2. Increment weekly goal
        await workoutService.incrementWeeklyGoal(userId, weekStart, progress.weeklyTarget);

        // 3. Update user challenge
        await workoutService.advanceUserChallenge(userId, '7-day-abs', updatedChallengeDay);
      }
    }

    // Always persist locally
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch (err) {
      console.error('Failed to save home progress locally:', err);
    }

    return true;
  };

  const resetProgress = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setProgress(initialProgressState);
    } catch (err) {
      console.error('Failed to reset home progress:', err);
    }
  };

  return (
    <HomeProgressContext.Provider
      value={{
        progress,
        isTodayDone,
        markTodayAsDone,
        resetProgress,
        isLoading,
        refreshProgress,
      }}
    >
      {children}
    </HomeProgressContext.Provider>
  );
};

export const useHomeProgress = (): HomeProgressContextValue => {
  const context = useContext(HomeProgressContext);
  if (!context) {
    throw new Error('useHomeProgress must be used within a HomeProgressProvider');
  }
  return context;
};
