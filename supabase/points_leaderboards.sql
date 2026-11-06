-- =============================================================================
-- SWEATFLIX STEP 9d: POINTS AND LEADERBOARDS
-- =============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- -----------------------------------------------------------------------------
-- 1. Schema Extensions
-- -----------------------------------------------------------------------------

-- Add started_at to sessions (recorded when workout screen opens, validated on Mark as done)
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Extend profiles with leaderboard visibility, total lifetime points, and level tier
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Beginner';

-- -----------------------------------------------------------------------------
-- 2. Create point_events table
-- Records every point transaction. UNIQUE(user_id, type, ref_id) ensures
-- that no event (workout session, daily streak, challenge win, post share) is rewarded twice.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'challenge_win', 'challenge_draw', 'weekly_goal', 'streak', 'share_post')),
  points INTEGER NOT NULL CHECK (points > 0),
  ref_id TEXT NOT NULL,
  day DATE NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT point_events_user_type_ref_key UNIQUE (user_id, type, ref_id)
);

CREATE INDEX IF NOT EXISTS idx_point_events_user_week ON public.point_events(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_point_events_user_day ON public.point_events(user_id, day);
CREATE INDEX IF NOT EXISTS idx_point_events_week_points ON public.point_events(week_start, points);

-- -----------------------------------------------------------------------------
-- 3. Create anomaly_log table (No client access; internal security audit)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anomaly_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. Helper Function: week_start_of(date)
-- A week runs Monday 00:00 to Sunday 23:59 UTC.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.week_start_of(d DATE)
RETURNS DATE AS $$
BEGIN
  -- In PostgreSQL, date_trunc('week', ...) always truncates to Monday 00:00:00 UTC
  RETURN (date_trunc('week', d AT TIME ZONE 'UTC'))::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -----------------------------------------------------------------------------
-- 5. Helper Function: calculate_user_streak(user_id, today_date)
-- Computes consecutive days with at least 1 recorded session ending today.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id UUID, p_today DATE)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE;
  v_has_session BOOLEAN;
BEGIN
  v_check_date := p_today;
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.sessions
      WHERE user_id = p_user_id
        AND (done_at AT TIME ZONE 'UTC')::date = v_check_date
    ) INTO v_has_session;

    IF v_has_session THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - 1;
    ELSE
      EXIT;
    END IF;

    -- Safety boundary
    IF v_streak >= 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 6. Core Function: award_points(user, type, points, ref)
-- Enforces a DAILY CAP of 50 points (UTC day).
-- Inserts only what is left under the cap, skips if already reached, and
-- updates profiles.total_points and profiles.level automatically.
-- Levels: Beginner (0), Athlete (500), Elite (2000), Legend (5000).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_type TEXT,
  p_points INTEGER,
  p_ref_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  today_date DATE;
  week_start_date DATE;
  current_daily_points INTEGER;
  points_to_award INTEGER;
  new_total_points INTEGER;
  new_level TEXT;
  existing_event_id UUID;
BEGIN
  IF p_user_id IS NULL OR p_points <= 0 THEN
    RETURN 0;
  END IF;

  today_date := (now() AT TIME ZONE 'UTC')::date;
  week_start_date := public.week_start_of(today_date);

  -- 1. Ensure idempotency: never award twice for the exact same ref
  SELECT id INTO existing_event_id
  FROM public.point_events
  WHERE user_id = p_user_id AND type = p_type AND ref_id = p_ref_id;

  IF FOUND THEN
    RETURN 0;
  END IF;

  -- 2. Check total points already accumulated today
  SELECT COALESCE(SUM(points), 0) INTO current_daily_points
  FROM public.point_events
  WHERE user_id = p_user_id AND day = today_date;

  -- Daily cap is 50 points
  IF current_daily_points >= 50 THEN
    RETURN 0;
  END IF;

  points_to_award := LEAST(p_points, 50 - current_daily_points);

  IF points_to_award <= 0 THEN
    RETURN 0;
  END IF;

  -- 3. Record point transaction
  INSERT INTO public.point_events (user_id, type, points, ref_id, day, week_start, created_at)
  VALUES (p_user_id, p_type, points_to_award, p_ref_id, today_date, week_start_date, now())
  ON CONFLICT (user_id, type, ref_id) DO NOTHING;

  -- 4. Update profile lifetime points and determine new tier level
  SELECT total_points INTO new_total_points
  FROM public.profiles
  WHERE id = p_user_id;

  new_total_points := COALESCE(new_total_points, 0) + points_to_award;

  IF new_total_points >= 5000 THEN
    new_level := 'Legend';
  ELSIF new_total_points >= 2000 THEN
    new_level := 'Elite';
  ELSIF new_total_points >= 500 THEN
    new_level := 'Athlete';
  ELSE
    new_level := 'Beginner';
  END IF;

  UPDATE public.profiles
  SET total_points = new_total_points,
      level = new_level
  WHERE id = p_user_id;

  RETURN points_to_award;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 7. Triggers for Automated Point Rules
-- -----------------------------------------------------------------------------

-- A. Workout completed (sessions insert)
-- - Workout done: +10 pts (duration >= 60s, max 5 workouts/day)
-- - Streak: +2 per consecutive day up to +14 pts once/day
-- - Weekly goal: +30 pts once/week when reaching weekly_goal
-- - Anomaly detection: > 10 workouts/day or negative duration
CREATE OR REPLACE FUNCTION public.on_session_completed_points()
RETURNS TRIGGER AS $$
DECLARE
  v_today DATE;
  v_week_start DATE;
  v_today_workouts INTEGER;
  v_week_workouts INTEGER;
  v_user_goal INTEGER;
  v_streak INTEGER;
  v_streak_pts INTEGER;
BEGIN
  v_today := (NEW.done_at AT TIME ZONE 'UTC')::date;
  v_week_start := public.week_start_of(v_today);

  -- Count total workouts completed today (including this new one)
  SELECT COUNT(*) INTO v_today_workouts
  FROM public.sessions
  WHERE user_id = NEW.user_id
    AND (done_at AT TIME ZONE 'UTC')::date = v_today;

  -- Anti-cheat: duration check (at least 60 seconds) and daily max 5 rewarded workouts
  IF NEW.started_at IS NOT NULL AND NEW.done_at >= (NEW.started_at + interval '60 seconds') THEN
    IF v_today_workouts <= 5 THEN
      PERFORM public.award_points(NEW.user_id, 'workout', 10, NEW.id::text);
    END IF;
  ELSIF NEW.started_at IS NOT NULL AND NEW.done_at < NEW.started_at THEN
    -- Suspicious: done_at occurs before started_at
    INSERT INTO public.anomaly_log (user_id, reason, details)
    VALUES (NEW.user_id, 'NEGATIVE_SESSION_DURATION', jsonb_build_object(
      'session_id', NEW.id,
      'started_at', NEW.started_at,
      'done_at', NEW.done_at
    ));
  END IF;

  -- Anomaly detection: More than 10 workouts logged in one single day
  IF v_today_workouts > 10 THEN
    INSERT INTO public.anomaly_log (user_id, reason, details)
    VALUES (NEW.user_id, 'EXCESSIVE_DAILY_WORKOUTS', jsonb_build_object(
      'count', v_today_workouts,
      'session_id', NEW.id,
      'day', v_today
    ));
  END IF;

  -- Streak bonus: +2 per day of streak up to +14 once per day
  v_streak := public.calculate_user_streak(NEW.user_id, v_today);
  IF v_streak > 0 THEN
    v_streak_pts := LEAST(v_streak * 2, 14);
    PERFORM public.award_points(NEW.user_id, 'streak', v_streak_pts, 'streak_' || v_today::text);
  END IF;

  -- Weekly goal bonus: +30 pts once per week when goal is met
  SELECT COUNT(*) INTO v_week_workouts
  FROM public.sessions
  WHERE user_id = NEW.user_id
    AND (done_at AT TIME ZONE 'UTC')::date >= v_week_start
    AND (done_at AT TIME ZONE 'UTC')::date < v_week_start + 7;

  SELECT COALESCE(weekly_goal, 4) INTO v_user_goal
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF v_week_workouts >= v_user_goal THEN
    PERFORM public.award_points(NEW.user_id, 'weekly_goal', 30, 'weekly_goal_' || v_week_start::text);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_session_completed_points ON public.sessions;
CREATE TRIGGER trg_on_session_completed_points
AFTER INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.on_session_completed_points();


-- B. Friend challenge win & draw points
-- - Win: +25 to winner
-- - Draw: +10 to each participant
CREATE OR REPLACE FUNCTION public.on_friend_challenge_finalized_points()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'completed' AND NEW.status = 'completed' THEN
    IF NEW.winner_id IS NOT NULL AND NOT NEW.is_draw THEN
      PERFORM public.award_points(NEW.winner_id, 'challenge_win', 25, NEW.id::text);
    ELSIF NEW.is_draw THEN
      PERFORM public.award_points(NEW.creator_id, 'challenge_draw', 10, NEW.id::text || '_draw_creator');
      PERFORM public.award_points(NEW.opponent_id, 'challenge_draw', 10, NEW.id::text || '_draw_opponent');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_friend_challenge_finalized_points ON public.friend_challenges;
CREATE TRIGGER trg_on_friend_challenge_finalized_points
AFTER UPDATE ON public.friend_challenges
FOR EACH ROW
EXECUTE FUNCTION public.on_friend_challenge_finalized_points();


-- C. Share photo post points
-- - +2 once per day for photo post with visibility 'public' or 'friends'
CREATE OR REPLACE FUNCTION public.on_post_shared_points()
RETURNS TRIGGER AS $$
DECLARE
  v_today DATE;
BEGIN
  IF NEW.visibility IN ('public', 'friends') 
     AND NEW.image_path IS NOT NULL 
     AND length(trim(NEW.image_path)) > 0 THEN
    v_today := (NEW.created_at AT TIME ZONE 'UTC')::date;
    PERFORM public.award_points(NEW.user_id, 'share_post', 2, 'post_' || v_today::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_post_shared_points ON public.posts;
CREATE TRIGGER trg_on_post_shared_points
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.on_post_shared_points();

-- -----------------------------------------------------------------------------
-- 8. Row Level Security (RLS) Policies
-- The app can NEVER insert, update or delete point_events, total_points or level.
-- -----------------------------------------------------------------------------
ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_log ENABLE ROW LEVEL SECURITY;

-- point_events: authenticated users can only view their own transactions
DROP POLICY IF EXISTS "point_events_select_policy" ON public.point_events;
CREATE POLICY "point_events_select_policy" ON public.point_events
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Protect total_points and level on profiles from direct client alterations
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND total_points = (SELECT total_points FROM public.profiles WHERE id = auth.uid())
  AND level = (SELECT level FROM public.profiles WHERE id = auth.uid())
  AND is_premium = (SELECT is_premium FROM public.profiles WHERE id = auth.uid())
  AND ads_removed = (SELECT ads_removed FROM public.profiles WHERE id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- 9. Leaderboard RPC Functions (SECURITY DEFINER)
-- Returns ONLY public display fields (user_id, username, name, avatar_url, points, rank).
-- Tie-break: more workouts first, then earliest time reaching the points.
-- -----------------------------------------------------------------------------

-- A. Friends Leaderboard: Me + accepted friends ranked by this week's points
CREATE OR REPLACE FUNCTION public.leaderboard_friends(p_week_start DATE)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  name TEXT,
  avatar_url TEXT,
  points BIGINT,
  workouts_count BIGINT,
  rank BIGINT
) AS $$
DECLARE
  v_week DATE;
  v_week_end DATE;
  v_current_user UUID;
BEGIN
  v_current_user := auth.uid();
  v_week := COALESCE(p_week_start, public.week_start_of((now() AT TIME ZONE 'UTC')::date));
  v_week_end := v_week + 7;

  RETURN QUERY
  WITH participant_pool AS (
    -- Me
    SELECT id, profiles.username, profiles.name, profiles.avatar_url
    FROM public.profiles
    WHERE id = v_current_user
    UNION
    -- Accepted friends
    SELECT p.id, p.username, p.name, p.avatar_url
    FROM public.profiles p
    WHERE public.are_friends(v_current_user, p.id)
  ),
  weekly_stats AS (
    SELECT
      pp.id AS p_id,
      pp.username AS p_username,
      pp.name AS p_name,
      pp.avatar_url AS p_avatar_url,
      COALESCE(SUM(pe.points), 0)::BIGINT AS total_pts,
      COALESCE((
        SELECT COUNT(*)
        FROM public.sessions s
        WHERE s.user_id = pp.id
          AND (s.done_at AT TIME ZONE 'UTC')::date >= v_week
          AND (s.done_at AT TIME ZONE 'UTC')::date < v_week_end
      ), 0)::BIGINT AS total_workouts,
      COALESCE(MAX(pe.created_at), '1970-01-01'::timestamptz) AS last_point_time
    FROM participant_pool pp
    LEFT JOIN public.point_events pe
      ON pe.user_id = pp.id
     AND pe.week_start = v_week
    GROUP BY pp.id, pp.username, pp.name, pp.avatar_url
  )
  SELECT
    ws.p_id AS user_id,
    ws.p_username AS username,
    ws.p_name AS name,
    ws.p_avatar_url AS avatar_url,
    ws.total_pts AS points,
    ws.total_workouts AS workouts_count,
    ROW_NUMBER() OVER (
      ORDER BY ws.total_pts DESC, ws.total_workouts DESC, ws.last_point_time ASC, ws.p_username ASC
    )::BIGINT AS rank
  FROM weekly_stats ws;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- B. Global Leaderboard: Users with show_on_leaderboard = true AND account_visibility = 'public'
CREATE OR REPLACE FUNCTION public.leaderboard_global(p_week_start DATE, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  name TEXT,
  avatar_url TEXT,
  points BIGINT,
  workouts_count BIGINT,
  rank BIGINT
) AS $$
DECLARE
  v_week DATE;
  v_week_end DATE;
  v_lim INTEGER;
BEGIN
  v_week := COALESCE(p_week_start, public.week_start_of((now() AT TIME ZONE 'UTC')::date));
  v_week_end := v_week + 7;
  v_lim := GREATEST(1, LEAST(COALESCE(p_limit, 50), 100));

  RETURN QUERY
  WITH eligible_users AS (
    SELECT p.id, p.username, p.name, p.avatar_url
    FROM public.profiles p
    WHERE p.show_on_leaderboard = true
      AND p.account_visibility = 'public'
  ),
  weekly_stats AS (
    SELECT
      eu.id AS p_id,
      eu.username AS p_username,
      eu.name AS p_name,
      eu.avatar_url AS p_avatar_url,
      COALESCE(SUM(pe.points), 0)::BIGINT AS total_pts,
      COALESCE((
        SELECT COUNT(*)
        FROM public.sessions s
        WHERE s.user_id = eu.id
          AND (s.done_at AT TIME ZONE 'UTC')::date >= v_week
          AND (s.done_at AT TIME ZONE 'UTC')::date < v_week_end
      ), 0)::BIGINT AS total_workouts,
      COALESCE(MAX(pe.created_at), '1970-01-01'::timestamptz) AS last_point_time
    FROM eligible_users eu
    LEFT JOIN public.point_events pe
      ON pe.user_id = eu.id
     AND pe.week_start = v_week
    GROUP BY eu.id, eu.username, eu.name, eu.avatar_url
  )
  SELECT
    ws.p_id AS user_id,
    ws.p_username AS username,
    ws.p_name AS name,
    ws.p_avatar_url AS avatar_url,
    ws.total_pts AS points,
    ws.total_workouts AS workouts_count,
    ROW_NUMBER() OVER (
      ORDER BY ws.total_pts DESC, ws.total_workouts DESC, ws.last_point_time ASC, ws.p_username ASC
    )::BIGINT AS rank
  FROM weekly_stats ws
  LIMIT v_lim;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- C. Challenges Leaderboard: Me + friends ranked by challenges won this week
CREATE OR REPLACE FUNCTION public.leaderboard_challenges(p_week_start DATE)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  name TEXT,
  avatar_url TEXT,
  weekly_wins BIGINT,
  all_time_wins BIGINT,
  rank BIGINT
) AS $$
DECLARE
  v_week DATE;
  v_week_end DATE;
  v_current_user UUID;
BEGIN
  v_current_user := auth.uid();
  v_week := COALESCE(p_week_start, public.week_start_of((now() AT TIME ZONE 'UTC')::date));
  v_week_end := v_week + 7;

  RETURN QUERY
  WITH participant_pool AS (
    SELECT id, profiles.username, profiles.name, profiles.avatar_url
    FROM public.profiles
    WHERE id = v_current_user
    UNION
    SELECT p.id, p.username, p.name, p.avatar_url
    FROM public.profiles p
    WHERE public.are_friends(v_current_user, p.id)
  ),
  challenge_stats AS (
    SELECT
      pp.id AS p_id,
      pp.username AS p_username,
      pp.name AS p_name,
      pp.avatar_url AS p_avatar_url,
      COALESCE((
        SELECT COUNT(*)
        FROM public.friend_challenges fc
        WHERE fc.winner_id = pp.id
          AND fc.status = 'completed'
          AND (fc.ends_at AT TIME ZONE 'UTC')::date >= v_week
          AND (fc.ends_at AT TIME ZONE 'UTC')::date < v_week_end
      ), 0)::BIGINT AS w_wins,
      COALESCE((
        SELECT COUNT(*)
        FROM public.friend_challenges fc
        WHERE fc.winner_id = pp.id
          AND fc.status = 'completed'
      ), 0)::BIGINT AS at_wins
    FROM participant_pool pp
  )
  SELECT
    cs.p_id AS user_id,
    cs.p_username AS username,
    cs.p_name AS name,
    cs.p_avatar_url AS avatar_url,
    cs.w_wins AS weekly_wins,
    cs.at_wins AS all_time_wins,
    ROW_NUMBER() OVER (
      ORDER BY cs.w_wins DESC, cs.at_wins DESC, cs.p_username ASC
    )::BIGINT AS rank
  FROM challenge_stats cs;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- D. My Rank: returns my rank and points gap to next rank up in scope ('friends' | 'global')
CREATE OR REPLACE FUNCTION public.my_rank(p_week_start DATE, p_scope TEXT DEFAULT 'friends')
RETURNS TABLE (
  my_rank BIGINT,
  my_points BIGINT,
  points_gap BIGINT,
  next_rank_username TEXT
) AS $$
DECLARE
  v_current_user UUID;
BEGIN
  v_current_user := auth.uid();

  IF p_scope = 'global' THEN
    RETURN QUERY
    WITH ranked AS (
      SELECT * FROM public.leaderboard_global(p_week_start, 100)
    ),
    me AS (
      SELECT r.rank, r.points FROM ranked r WHERE r.user_id = v_current_user
    ),
    above AS (
      SELECT r.points, r.username
      FROM ranked r, me
      WHERE r.rank = me.rank - 1
    )
    SELECT
      me.rank AS my_rank,
      me.points AS my_points,
      COALESCE(above.points - me.points, 0)::BIGINT AS points_gap,
      above.username AS next_rank_username
    FROM me
    LEFT JOIN above ON true;
  ELSE
    RETURN QUERY
    WITH ranked AS (
      SELECT * FROM public.leaderboard_friends(p_week_start)
    ),
    me AS (
      SELECT r.rank, r.points FROM ranked r WHERE r.user_id = v_current_user
    ),
    above AS (
      SELECT r.points, r.username
      FROM ranked r, me
      WHERE r.rank = me.rank - 1
    )
    SELECT
      me.rank AS my_rank,
      me.points AS my_points,
      COALESCE(above.points - me.points, 0)::BIGINT AS points_gap,
      above.username AS next_rank_username
    FROM me
    LEFT JOIN above ON true;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- E. Helper Function: get_user_points_this_week(user_id, week_start)
CREATE OR REPLACE FUNCTION public.get_user_points_this_week(p_user_id UUID, p_week_start DATE DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_week DATE;
  v_points INTEGER;
BEGIN
  v_week := COALESCE(p_week_start, public.week_start_of((now() AT TIME ZONE 'UTC')::date));

  SELECT COALESCE(SUM(points), 0) INTO v_points
  FROM public.point_events
  WHERE user_id = p_user_id
    AND week_start = v_week;

  RETURN v_points;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 10. Explicit Grants for Authenticated Users
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.week_start_of(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_friends(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_global(DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_challenges(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_rank(DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_points_this_week(UUID, DATE) TO authenticated;
GRANT SELECT ON public.point_events TO authenticated;

