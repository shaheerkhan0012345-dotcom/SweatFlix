import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremium } from './PremiumContext';
import { ExerciseDetail, FAKE_EXERCISES } from '../data/fakeData';
import { workoutService, DbWorkout } from '../services/workoutService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CustomWorkoutExercise {
  exerciseId: string;
  name: string;
  bodyPart: string;
  thumbnail: string;
  sets: number;
  reps: number;
  kcalPerSet: number;
}

export interface CustomWorkout {
  id: string;
  name: string;
  exercises: CustomWorkoutExercise[];
  estimatedDuration: number;
  estimatedKcal: number;
  createdAt: number;
}

interface CustomWorkoutsContextValue {
  customWorkouts: CustomWorkout[];
  isLoading: boolean;
  createWorkout: (
    name: string,
    exercises: CustomWorkoutExercise[]
  ) => Promise<{ success: boolean; error?: 'LIMIT_REACHED' | 'INVALID_INPUT' }>;
  updateWorkout: (
    id: string,
    name: string,
    exercises: CustomWorkoutExercise[]
  ) => Promise<boolean>;
  deleteWorkout: (id: string) => Promise<void>;
  addExerciseToWorkout: (workoutId: string, exercise: ExerciseDetail) => Promise<boolean>;
  getWorkoutById: (id: string) => CustomWorkout | undefined;
  refreshWorkouts: () => Promise<void>;
}

const STORAGE_KEY = '@sweatflix_custom_workouts';
export const FREE_WORKOUT_LIMIT = 3;

const CustomWorkoutsContext = createContext<CustomWorkoutsContextValue | undefined>(undefined);

export const CustomWorkoutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium } = usePremium();
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const calculateEstimates = (exercises: CustomWorkoutExercise[]) => {
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const estimatedDuration = Math.max(totalSets * 2, 5);
    const estimatedKcal = exercises.reduce((acc, ex) => acc + ex.sets * ex.kcalPerSet, 0);
    return { estimatedDuration, estimatedKcal };
  };

  const mapDbToCustom = (db: DbWorkout): CustomWorkout => {
    const exercises: CustomWorkoutExercise[] = (db.workout_exercises || []).map((we) => {
      const match = FAKE_EXERCISES.find((e) => e.id === we.exercise_id);
      const repsNum = parseInt(we.reps.replace(/[^0-9]/g, ''), 10) || 12;
      return {
        exerciseId: we.exercise_id,
        name: match?.name || 'Exercise',
        bodyPart: match?.bodyPart || 'Full Body',
        thumbnail: match?.thumbnail || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
        sets: we.sets,
        reps: repsNum,
        kcalPerSet: match ? Math.round(match.kcal / 3) : 15,
      };
    });

    const { estimatedDuration, estimatedKcal } = calculateEstimates(exercises);
    return {
      id: db.id,
      name: db.name,
      exercises,
      estimatedDuration,
      estimatedKcal,
      createdAt: new Date(db.created_at).getTime(),
    };
  };

  const refreshWorkouts = async () => {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        try {
          const dbWorkouts = await workoutService.getWorkouts(session.user.id);
          if (dbWorkouts && dbWorkouts.length > 0) {
            const mapped = dbWorkouts.map(mapDbToCustom);
            setCustomWorkouts(mapped);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
            return;
          }
        } catch (e) {
          console.warn('Error fetching custom workouts from DB:', e);
        }
      }
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomWorkouts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load custom workouts:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await refreshWorkouts();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const saveWorkoutsToStorage = async (updated: CustomWorkout[]) => {
    setCustomWorkouts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom workouts:', e);
    }
  };

  const createWorkout = async (
    name: string,
    exercises: CustomWorkoutExercise[]
  ): Promise<{ success: boolean; error?: 'LIMIT_REACHED' | 'INVALID_INPUT' }> => {
    if (!name.trim() || exercises.length === 0) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    if (!isPremium && customWorkouts.length >= FREE_WORKOUT_LIMIT) {
      return { success: false, error: 'LIMIT_REACHED' };
    }

    const { estimatedDuration, estimatedKcal } = calculateEstimates(exercises);

    let createdId = `custom-${Date.now()}`;

    // Insert to database if logged in
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        try {
          const dbWorkout = await workoutService.createWorkout(
            session.user.id,
            name,
            exercises.map((e) => ({
              exerciseId: e.exerciseId,
              sets: e.sets,
              reps: `${e.reps} reps`,
            }))
          );
          if (dbWorkout?.id) {
            createdId = dbWorkout.id;
          }
        } catch (e) {
          console.warn('Error creating workout in database:', e);
        }
      }
    }

    const newWorkout: CustomWorkout = {
      id: createdId,
      name: name.trim(),
      exercises,
      estimatedDuration,
      estimatedKcal,
      createdAt: Date.now(),
    };

    const updated = [newWorkout, ...customWorkouts];
    await saveWorkoutsToStorage(updated);
    return { success: true };
  };

  const updateWorkout = async (
    id: string,
    name: string,
    exercises: CustomWorkoutExercise[]
  ): Promise<boolean> => {
    if (!name.trim() || exercises.length === 0) {
      return false;
    }

    const { estimatedDuration, estimatedKcal } = calculateEstimates(exercises);

    const updated = customWorkouts.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          name: name.trim(),
          exercises,
          estimatedDuration,
          estimatedKcal,
        };
      }
      return w;
    });

    await saveWorkoutsToStorage(updated);
    return true;
  };

  const deleteWorkout = async (id: string) => {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && !id.startsWith('custom-')) {
        try {
          await workoutService.deleteWorkout(session.user.id, id);
        } catch (e) {
          console.warn('Error deleting workout from DB:', e);
        }
      }
    }

    const updated = customWorkouts.filter((w) => w.id !== id);
    await saveWorkoutsToStorage(updated);
  };

  const addExerciseToWorkout = async (
    workoutId: string,
    exercise: ExerciseDetail
  ): Promise<boolean> => {
    const workout = customWorkouts.find((w) => w.id === workoutId);
    if (!workout) return false;

    const exists = workout.exercises.some((e) => e.exerciseId === exercise.id);
    if (exists) return true;

    const newExerciseItem: CustomWorkoutExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      thumbnail: exercise.thumbnail,
      sets: 3,
      reps: 12,
      kcalPerSet: Math.round(exercise.kcal / 3) || 15,
    };

    const updatedExercises = [...workout.exercises, newExerciseItem];
    const { estimatedDuration, estimatedKcal } = calculateEstimates(updatedExercises);

    const updated = customWorkouts.map((w) => {
      if (w.id === workoutId) {
        return {
          ...w,
          exercises: updatedExercises,
          estimatedDuration,
          estimatedKcal,
        };
      }
      return w;
    });

    await saveWorkoutsToStorage(updated);
    return true;
  };

  const getWorkoutById = (id: string): CustomWorkout | undefined => {
    return customWorkouts.find((w) => w.id === id);
  };

  return (
    <CustomWorkoutsContext.Provider
      value={{
        customWorkouts,
        isLoading,
        createWorkout,
        updateWorkout,
        deleteWorkout,
        addExerciseToWorkout,
        getWorkoutById,
        refreshWorkouts,
      }}
    >
      {children}
    </CustomWorkoutsContext.Provider>
  );
};

export const useCustomWorkouts = (): CustomWorkoutsContextValue => {
  const context = useContext(CustomWorkoutsContext);
  if (!context) {
    throw new Error('useCustomWorkouts must be used within a CustomWorkoutsProvider');
  }
  return context;
};
