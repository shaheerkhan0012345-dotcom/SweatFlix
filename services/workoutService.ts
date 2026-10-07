import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FAKE_EXERCISES, FAKE_CHALLENGES, ExerciseDetail, ChallengeItem } from '../data/fakeData';

export interface DbExercise {
  id: string;
  name: string;
  body_part: string;
  level: string;
  duration_or_reps: string;
  kcal: number;
  thumbnail_url: string;
  video_url: string;
  steps: string[];
  is_premium: boolean;
}

export interface DbChallenge {
  id: string;
  title: string;
  days: number;
  target?: string;
  description?: string;
  banner_color?: string;
}

export interface UserChallengeRecord {
  id: string;
  user_id: string;
  challenge_id: string;
  current_day: number;
  started_at: string;
}

export interface DbWorkoutExercise {
  id?: string;
  workout_id?: string;
  exercise_id: string;
  sets: number;
  reps: string;
  position: number;
  exercise?: DbExercise;
}

export interface DbWorkout {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  workout_exercises?: DbWorkoutExercise[];
}

export interface DbSession {
  id: string;
  user_id: string;
  workout_id: string | null;
  workout_name: string;
  done_at: string;
  kcal: number;
}

export interface DbWeeklyGoal {
  id: string;
  user_id: string;
  week_start: string;
  target_workouts: number;
  completed: number;
}

// Convert DB exercise row to ExerciseDetail interface expected by UI
export const mapDbExerciseToDetail = (db: DbExercise): ExerciseDetail => ({
  id: db.id,
  name: db.name,
  bodyPart: db.body_part as any,
  level: db.level as any,
  reps: db.duration_or_reps,
  kcal: db.kcal,
  thumbnail: db.thumbnail_url,
  videoUrl: db.video_url,
  steps: db.steps || [],
  isPremium: Boolean(db.is_premium),
});

export const mapDbChallengeToItem = (db: DbChallenge): ChallengeItem => ({
  id: db.id,
  title: db.title,
  totalDays: db.days,
  defaultDay: 1,
  description: db.description || '',
  bannerColor: db.banner_color || '#FF8A1F',
});

export const workoutService = {
  // 1. Exercises
  async getExercises(bodyPart?: string): Promise<ExerciseDetail[]> {
    if (!isSupabaseConfigured) {
      if (bodyPart) {
        return FAKE_EXERCISES.filter((e) => e.bodyPart === bodyPart);
      }
      return FAKE_EXERCISES;
    }

    try {
      let query = supabase.from('exercises').select('*').order('name');
      if (bodyPart) {
        query = query.eq('body_part', bodyPart);
      }
      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to fake data if table is empty or error
        return bodyPart
          ? FAKE_EXERCISES.filter((e) => e.bodyPart === bodyPart)
          : FAKE_EXERCISES;
      }

      return (data as DbExercise[]).map(mapDbExerciseToDetail);
    } catch {
      return bodyPart
        ? FAKE_EXERCISES.filter((e) => e.bodyPart === bodyPart)
        : FAKE_EXERCISES;
    }
  },

  async getExerciseById(id: string): Promise<ExerciseDetail | null> {
    if (!isSupabaseConfigured) {
      return FAKE_EXERCISES.find((e) => e.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return FAKE_EXERCISES.find((e) => e.id === id) || null;
      }

      return mapDbExerciseToDetail(data as DbExercise);
    } catch {
      return FAKE_EXERCISES.find((e) => e.id === id) || null;
    }
  },

  // 2. Challenges
  async getChallenges(): Promise<ChallengeItem[]> {
    if (!isSupabaseConfigured) {
      return FAKE_CHALLENGES;
    }

    try {
      const { data, error } = await supabase.from('challenges').select('*');
      if (error || !data || data.length === 0) {
        return FAKE_CHALLENGES;
      }
      return (data as DbChallenge[]).map(mapDbChallengeToItem);
    } catch {
      return FAKE_CHALLENGES;
    }
  },

  async getUserChallenges(userId: string): Promise<UserChallengeRecord[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data as UserChallengeRecord[];
    } catch {
      return [];
    }
  },

  async advanceUserChallenge(userId: string, challengeId: string, nextDay: number): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;

    try {
      await supabase.from('user_challenges').upsert(
        {
          user_id: userId,
          challenge_id: challengeId,
          current_day: nextDay,
          started_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,challenge_id' }
      );
    } catch (e: any) {
      console.warn('Error advancing user challenge:', e?.message);
    }
  },

  // 3. Custom Workouts
  async getWorkouts(userId: string): Promise<DbWorkout[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          user_id,
          name,
          created_at,
          workout_exercises (
            id,
            workout_id,
            exercise_id,
            sets,
            reps,
            position
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Error fetching workouts:', error?.message);
        return [];
      }

      return data as DbWorkout[];
    } catch (e: any) {
      console.warn('Error fetching workouts:', e?.message);
      return [];
    }
  },

  async createWorkout(
    userId: string,
    name: string,
    exercises: { exerciseId: string; sets: number; reps: string }[]
  ): Promise<DbWorkout> {
    if (!isSupabaseConfigured || !userId) {
      throw new Error('Database is not connected');
    }

    // 1. Insert parent workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        name: name.trim(),
      })
      .select()
      .single();

    if (workoutError || !workout) {
      throw new Error(workoutError?.message || 'Failed to create workout');
    }

    // 2. Insert exercises if any
    if (exercises.length > 0) {
      const rows = exercises.map((item, index) => ({
        workout_id: workout.id,
        exercise_id: item.exerciseId,
        sets: item.sets,
        reps: item.reps,
        position: index,
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(rows);

      if (exercisesError) {
        console.warn('Error inserting workout exercises:', exercisesError.message);
      }
    }

    return workout as DbWorkout;
  },

  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    if (!isSupabaseConfigured || !userId || !workoutId) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (e: any) {
      console.warn('Error deleting workout:', e?.message);
      throw e;
    }
  },

  // 4. Completed Sessions
  async getSessions(userId: string): Promise<DbSession[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('done_at', { ascending: false });

      if (error || !data) return [];
      return data as DbSession[];
    } catch {
      return [];
    }
  },

  async saveSession(
    userId: string,
    workoutName: string,
    kcal: number = 0,
    workoutId: string | null = null
  ): Promise<DbSession | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          workout_name: workoutName,
          kcal,
          workout_id: workoutId,
          done_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('Error saving session:', error.message);
        return null;
      }

      return data as DbSession;
    } catch (e: any) {
      console.warn('Error saving session:', e?.message);
      return null;
    }
  },

  // 5. Weekly Goals
  async getWeeklyGoal(userId: string, weekStart: string): Promise<DbWeeklyGoal | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (error || !data) return null;
      return data as DbWeeklyGoal;
    } catch {
      return null;
    }
  },

  async incrementWeeklyGoal(
    userId: string,
    weekStart: string,
    targetWorkouts: number = 4
  ): Promise<number> {
    if (!isSupabaseConfigured || !userId) return 1;

    try {
      // Check current
      const current = await this.getWeeklyGoal(userId, weekStart);
      const newCompleted = (current?.completed || 0) + 1;

      await supabase.from('weekly_goals').upsert(
        {
          user_id: userId,
          week_start: weekStart,
          target_workouts: targetWorkouts,
          completed: newCompleted,
        },
        { onConflict: 'user_id,week_start' }
      );

      return newCompleted;
    } catch (e: any) {
      console.warn('Error updating weekly goal:', e?.message);
      return 1;
    }
  },
};
