import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface MacroTarget {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface WaterEntry {
  date: string;
  amountMl: number;
}

export interface HealthMetricsState {
  // Water
  waterIntakeMl: number;
  waterTargetMl: number;
  waterHistory: WaterEntry[];
  // Nutrition
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinGrams: number;
  proteinTarget: number;
  carbsGrams: number;
  carbsTarget: number;
  fatGrams: number;
  fatTarget: number;
  // Body stats
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  weightHistory: WeightEntry[];
}

interface HealthMetricsContextValue {
  metrics: HealthMetricsState;
  addWater: (amountMl?: number) => Promise<void>;
  resetWater: () => Promise<void>;
  logMeal: (calories: number, protein?: number, carbs?: number, fat?: number) => Promise<void>;
  resetMeals: () => Promise<void>;
  updateNutritionGoals: (
    caloriesTarget: number,
    proteinTarget: number,
    carbsTarget: number,
    fatTarget: number,
    currentWeightKg?: number,
    targetWeightKg?: number,
    heightCm?: number
  ) => Promise<void>;
  logWeight: (newWeight: number) => Promise<void>;
  bmi: number;
  bmiCategory: string;
  isLoading: boolean;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const defaultMetrics: HealthMetricsState = {
  waterIntakeMl: 0,
  waterTargetMl: 2500,
  waterHistory: [],
  caloriesConsumed: 0,
  caloriesTarget: 2200,
  proteinGrams: 0,
  proteinTarget: 140,
  carbsGrams: 0,
  carbsTarget: 230,
  fatGrams: 0,
  fatTarget: 65,
  currentWeightKg: 72.5,
  targetWeightKg: 70.0,
  heightCm: 175,
  weightHistory: [],
};

const HealthMetricsContext = createContext<HealthMetricsContextValue | undefined>(undefined);

export const HealthMetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetricsState>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const userPrefix = user?.id ? `@sweatflix_${user.id}_` : '@sweatflix_anon_';
  const todayKey = `${userPrefix}health_${getTodayDateString()}`;
  const weightHistoryKey = `${userPrefix}weight_history`;
  const waterHistoryKey = `${userPrefix}water_history`;

  // Load metrics from storage and sync with user profile
  useEffect(() => {
    let isCurrent = true;
    const loadData = async () => {
      try {
        const [dailyRaw, historyRaw, waterRaw] = await Promise.all([
          AsyncStorage.getItem(todayKey),
          AsyncStorage.getItem(weightHistoryKey),
          AsyncStorage.getItem(waterHistoryKey),
        ]);

        let loadedMetrics = { ...defaultMetrics };

        if (dailyRaw) {
          try {
            const parsedDaily = JSON.parse(dailyRaw);
            loadedMetrics = { ...loadedMetrics, ...parsedDaily };
          } catch (e) {
            console.warn('Failed to parse daily metrics:', e);
          }
        }

        if (historyRaw) {
          try {
            const parsedHistory = JSON.parse(historyRaw);
            if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
              loadedMetrics.weightHistory = parsedHistory;
              loadedMetrics.currentWeightKg = parsedHistory[parsedHistory.length - 1].weight;
            }
          } catch (e) {
            console.warn('Failed to parse weight history:', e);
          }
        }

        if (waterRaw) {
          try {
            const parsedWater = JSON.parse(waterRaw);
            if (Array.isArray(parsedWater) && parsedWater.length > 0) {
              loadedMetrics.waterHistory = parsedWater;
            }
          } catch (e) {
            console.warn('Failed to parse water history:', e);
          }
        }

        // Apply profile stats if available
        if (profile?.weight_kg) {
          loadedMetrics.currentWeightKg = profile.weight_kg;
        }
        if (profile?.goal_kg) {
          loadedMetrics.targetWeightKg = profile.goal_kg;
        }
        if (profile?.height_cm) {
          loadedMetrics.heightCm = profile.height_cm;
        }

        // Initialize real history based on current user stage (starts at 0 if no water logged)
        if (loadedMetrics.weightHistory.length === 0) {
          loadedMetrics.weightHistory = [
            { date: getTodayDateString(), weight: loadedMetrics.currentWeightKg },
          ];
        }
        if (loadedMetrics.waterHistory.length === 0) {
          loadedMetrics.waterHistory = [
            { date: getTodayDateString(), amountMl: loadedMetrics.waterIntakeMl || 0 },
          ];
        }

        if (isCurrent) {
          setMetrics(loadedMetrics);
        }
      } catch (e) {
        console.warn('Failed to load health metrics:', e);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [profile, user?.id, todayKey, weightHistoryKey, waterHistoryKey]);

  // Persist daily metrics
  const persistDaily = useCallback(async (updated: HealthMetricsState) => {
    try {
      const dailyData = {
        waterIntakeMl: updated.waterIntakeMl,
        waterTargetMl: updated.waterTargetMl,
        caloriesConsumed: updated.caloriesConsumed,
        caloriesTarget: updated.caloriesTarget,
        proteinGrams: updated.proteinGrams,
        proteinTarget: updated.proteinTarget,
        carbsGrams: updated.carbsGrams,
        carbsTarget: updated.carbsTarget,
        fatGrams: updated.fatGrams,
        fatTarget: updated.fatTarget,
      };
      await AsyncStorage.setItem(todayKey, JSON.stringify(dailyData));
    } catch (e) {
      console.warn('Failed to persist daily metrics:', e);
    }
  }, [todayKey]);

  // Water operations
  const addWater = useCallback(async (amountMl = 250) => {
    const today = getTodayDateString();
    setMetrics((prev) => {
      const nextMl = Math.min(prev.waterIntakeMl + amountMl, prev.waterTargetMl * 2);
      
      const existingIdx = prev.waterHistory.findIndex((entry) => entry.date === today);
      let updatedHistory: WaterEntry[];
      if (existingIdx >= 0) {
        updatedHistory = [...prev.waterHistory];
        updatedHistory[existingIdx] = { date: today, amountMl: nextMl };
      } else {
        updatedHistory = [...prev.waterHistory, { date: today, amountMl: nextMl }];
      }

      const updated = {
        ...prev,
        waterIntakeMl: nextMl,
        waterHistory: updatedHistory,
      };
      persistDaily(updated);
      AsyncStorage.setItem(waterHistoryKey, JSON.stringify(updatedHistory)).catch(console.warn);
      return updated;
    });
  }, [persistDaily, waterHistoryKey]);

  const resetWater = useCallback(async () => {
    const today = getTodayDateString();
    setMetrics((prev) => {
      const existingIdx = prev.waterHistory.findIndex((entry) => entry.date === today);
      let updatedHistory: WaterEntry[];
      if (existingIdx >= 0) {
        updatedHistory = [...prev.waterHistory];
        updatedHistory[existingIdx] = { date: today, amountMl: 0 };
      } else {
        updatedHistory = [...prev.waterHistory, { date: today, amountMl: 0 }];
      }

      const updated = {
        ...prev,
        waterIntakeMl: 0,
        waterHistory: updatedHistory,
      };
      persistDaily(updated);
      AsyncStorage.setItem(waterHistoryKey, JSON.stringify(updatedHistory)).catch(console.warn);
      return updated;
    });
  }, [persistDaily, waterHistoryKey]);

  // Nutrition operations
  const logMeal = useCallback(
    async (calories: number, protein = 0, carbs = 0, fat = 0) => {
      setMetrics((prev) => {
        const updated: HealthMetricsState = {
          ...prev,
          caloriesConsumed: prev.caloriesConsumed + calories,
          proteinGrams: prev.proteinGrams + protein,
          carbsGrams: prev.carbsGrams + carbs,
          fatGrams: prev.fatGrams + fat,
        };
        persistDaily(updated);
        return updated;
      });
    },
    [persistDaily]
  );

  const resetMeals = useCallback(async () => {
    setMetrics((prev) => {
      const updated: HealthMetricsState = {
        ...prev,
        caloriesConsumed: 0,
        proteinGrams: 0,
        carbsGrams: 0,
        fatGrams: 0,
      };
      persistDaily(updated);
      return updated;
    });
  }, [persistDaily]);

  // Weight operations
  const logWeight = useCallback(
    async (weightKg: number) => {
      const today = getTodayDateString();
      setMetrics((prev) => {
        const existingIdx = prev.weightHistory.findIndex((entry) => entry.date === today);
        let updatedHistory: WeightEntry[];

        if (existingIdx >= 0) {
          updatedHistory = [...prev.weightHistory];
          updatedHistory[existingIdx] = { date: today, weight: weightKg };
        } else {
          updatedHistory = [...prev.weightHistory, { date: today, weight: weightKg }];
        }

        const updated = {
          ...prev,
          currentWeightKg: weightKg,
          weightHistory: updatedHistory,
        };

        AsyncStorage.setItem(weightHistoryKey, JSON.stringify(updatedHistory)).catch(console.warn);

        // Sync to Supabase if logged in
        if (user?.id && isSupabaseConfigured) {
          supabase
            .from('profiles')
            .update({ weight_kg: weightKg })
            .eq('id', user.id)
            .then(({ error }) => {
              if (error) console.warn('Failed to sync weight to profile:', error.message);
            });
        }

        return updated;
      });
    },
    [user, weightHistoryKey]
  );

  // Calculate BMI
  const heightInMeters = (metrics.heightCm || 175) / 100;
  const bmi = Number(
    (metrics.currentWeightKg / (heightInMeters * heightInMeters)).toFixed(1)
  );

  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Healthy Weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  const updateNutritionGoals = useCallback(
    async (
      caloriesTarget: number,
      proteinTarget: number,
      carbsTarget: number,
      fatTarget: number,
      currentWeightKg?: number,
      targetWeightKg?: number,
      heightCm?: number
    ) => {
      setMetrics((prev) => {
        const updated: HealthMetricsState = {
          ...prev,
          caloriesTarget,
          proteinTarget,
          carbsTarget,
          fatTarget,
          ...(currentWeightKg ? { currentWeightKg } : {}),
          ...(targetWeightKg ? { targetWeightKg } : {}),
          ...(heightCm ? { heightCm } : {}),
        };
        persistDaily(updated);
        return updated;
      });
    },
    [persistDaily]
  );

  return (
    <HealthMetricsContext.Provider
      value={{
        metrics,
        addWater,
        resetWater,
        logMeal,
        resetMeals,
        logWeight,
        updateNutritionGoals,
        bmi,
        bmiCategory,
        isLoading,
      }}
    >
      {children}
    </HealthMetricsContext.Provider>
  );
};

export const useHealthMetrics = (): HealthMetricsContextValue => {
  const context = useContext(HealthMetricsContext);
  if (!context) {
    throw new Error('useHealthMetrics must be used within a HealthMetricsProvider');
  }
  return context;
};
