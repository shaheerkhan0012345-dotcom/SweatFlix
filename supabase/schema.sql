-- SweatFlix Supabase Database Schema
-- Version: Step 7

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. PROFILES TABLE
--------------------------------------------------------------------------------
-- Holds user fitness details, goals, preferences, and onboarding state.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT DEFAULT 'Champ',
  gender TEXT,
  age INT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  goal_kg NUMERIC,
  level TEXT,
  main_goal TEXT,
  body_focus TEXT[],
  onboarding_completed BOOLEAN DEFAULT false,
  weekly_goal INT DEFAULT 4,
  units TEXT DEFAULT 'metric',
  language TEXT DEFAULT 'en',
  is_premium BOOLEAN DEFAULT false,
  ads_removed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 2. EXERCISES TABLE
--------------------------------------------------------------------------------
-- Global exercise library categorized by muscle group. Read-only for users.
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  level TEXT NOT NULL,
  duration_or_reps TEXT NOT NULL,
  kcal INT DEFAULT 0 NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  steps TEXT[],
  is_premium BOOLEAN DEFAULT false NOT NULL
);

--------------------------------------------------------------------------------
-- 3. CHALLENGES TABLE
--------------------------------------------------------------------------------
-- Featured workout challenges. Read-only for users.
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  days INT DEFAULT 7 NOT NULL,
  target TEXT,
  description TEXT,
  banner_color TEXT
);

--------------------------------------------------------------------------------
-- 4. USER CHALLENGES TABLE
--------------------------------------------------------------------------------
-- Tracks a user's active progress through structured challenges.
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_day INT DEFAULT 1 NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, challenge_id)
);

--------------------------------------------------------------------------------
-- 5. WORKOUTS TABLE (CUSTOM WORKOUTS)
--------------------------------------------------------------------------------
-- Custom workout routines created by the user.
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 6. WORKOUT EXERCISES TABLE
--------------------------------------------------------------------------------
-- Join table connecting custom workouts with exercises, sets, reps, and order.
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INT DEFAULT 3 NOT NULL,
  reps TEXT DEFAULT '10 reps' NOT NULL,
  position INT DEFAULT 0 NOT NULL
);

--------------------------------------------------------------------------------
-- 7. SESSIONS TABLE (COMPLETED WORKOUT LOGS)
--------------------------------------------------------------------------------
-- Records each completed workout session, timestamp, and calories burned.
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_name TEXT NOT NULL,
  done_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  kcal INT DEFAULT 0 NOT NULL
);

--------------------------------------------------------------------------------
-- 8. WEEKLY GOALS TABLE
--------------------------------------------------------------------------------
-- Tracks weekly workout completion goals per week start date.
CREATE TABLE IF NOT EXISTS public.weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  target_workouts INT DEFAULT 4 NOT NULL,
  completed INT DEFAULT 0 NOT NULL,
  UNIQUE(user_id, week_start)
);

--------------------------------------------------------------------------------
-- 9. FEEDBACK TABLE
--------------------------------------------------------------------------------
-- User feedback submissions and star ratings.
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
--------------------------------------------------------------------------------

-- Trigger 1: Automatically create a profile row whenever a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Champ')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Prevent client apps from altering is_premium or ads_removed
-- Users cannot elevate their subscription privileges via direct client update.
CREATE OR REPLACE FUNCTION public.protect_premium_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.is_premium IS DISTINCT FROM NEW.is_premium) OR (OLD.ads_removed IS DISTINCT FROM NEW.ads_removed) THEN
    NEW.is_premium := OLD.is_premium;
    NEW.ads_removed := OLD.ads_removed;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_protect_premium ON public.profiles;
CREATE TRIGGER on_profile_update_protect_premium
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_premium_columns();

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Users can view only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (in case client trigger fallback)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 2. Exercises Policies
-- Authenticated users can read all exercises (read-only; no insert/update/delete)
CREATE POLICY "Exercises are readable by authenticated users"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (true);

-- 3. Challenges Policies
-- Authenticated users can read all challenges (read-only; no insert/update/delete)
CREATE POLICY "Challenges are readable by authenticated users"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

-- 4. User Challenges Policies
-- Users can only read and manage their own challenge progress
CREATE POLICY "Users can manage own user_challenges"
  ON public.user_challenges FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Workouts Policies
-- Users can only read, create, update, and delete their own custom workouts
CREATE POLICY "Users can manage own workouts"
  ON public.workouts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Workout Exercises Policies
-- Ownership is verified through the parent workout row matching auth.uid()
CREATE POLICY "Users can view exercises in own workouts"
  ON public.workout_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert exercises to own workouts"
  ON public.workout_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises in own workouts"
  ON public.workout_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises from own workouts"
  ON public.workout_exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- 7. Sessions Policies
-- Users can only view, insert, update, or delete their own completed sessions
CREATE POLICY "Users can manage own sessions"
  ON public.sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Weekly Goals Policies
-- Users can only view and modify their own weekly goals
CREATE POLICY "Users can manage own weekly_goals"
  ON public.weekly_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Feedback Policies
-- Users can submit feedback and view feedback they created
CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
