-- =============================================================================
-- SWEATFLIX STEP 9g: LEAGUES AND WEEKLY REWARDS
-- =============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Fully commented policies, triggers, functions, and lazy group placement.

-- -----------------------------------------------------------------------------
-- 1. Extend profiles Table
-- -----------------------------------------------------------------------------
-- - league_tier: Current league division (Bronze, Silver, Gold, Platinum, Diamond)
-- - reward_premium_until: Expiration timestamp for earned Free Premium days
-- - is_weekly_champion: Flag indicating user won 1st place in their league last week
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS league_tier TEXT NOT NULL DEFAULT 'Bronze'
  CHECK (league_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
ADD COLUMN IF NOT EXISTS reward_premium_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_weekly_champion BOOLEAN NOT NULL DEFAULT false;

-- -----------------------------------------------------------------------------
-- 2. Update is_user_premium(uid)
-- -----------------------------------------------------------------------------
-- Returns true if profiles.is_premium IS TRUE OR reward_premium_until is in the future.
-- Used for every Premium check (feature locks, exercise videos, challenge limit).
CREATE OR REPLACE FUNCTION public.is_user_premium(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_premium BOOLEAN;
  v_reward_until TIMESTAMPTZ;
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT is_premium, reward_premium_until
  INTO v_is_premium, v_reward_until
  FROM public.profiles
  WHERE id = uid;

  IF v_is_premium IS TRUE THEN
    RETURN TRUE;
  END IF;

  IF v_reward_until IS NOT NULL AND v_reward_until > now() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 3. Security Trigger: Prevent Clients from Altering Protected League Columns
-- -----------------------------------------------------------------------------
-- The app can never update league_tier, reward_premium_until, or is_weekly_champion directly.
CREATE OR REPLACE FUNCTION public.protect_league_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow service_role / security definer internal functions to alter these columns
  IF auth.role() = 'authenticated' THEN
    IF (OLD.league_tier IS DISTINCT FROM NEW.league_tier) THEN
      NEW.league_tier := OLD.league_tier;
    END IF;
    IF (OLD.reward_premium_until IS DISTINCT FROM NEW.reward_premium_until) THEN
      NEW.reward_premium_until := OLD.reward_premium_until;
    END IF;
    IF (OLD.is_weekly_champion IS DISTINCT FROM NEW.is_weekly_champion) THEN
      NEW.is_weekly_champion := OLD.is_weekly_champion;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_league_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_league_profile_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_league_profile_columns();

-- -----------------------------------------------------------------------------
-- 4. Create league_groups Table
-- -----------------------------------------------------------------------------
-- Groups about 30 users of the same tier for a specific week (starts Monday 00:00 UTC).
CREATE TABLE IF NOT EXISTS public.league_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_league_groups_week_tier ON public.league_groups(week_start, tier);

-- -----------------------------------------------------------------------------
-- 5. Create league_members Table
-- -----------------------------------------------------------------------------
-- Connects users to a league group. UNIQUE(week_start, user_id) ensures a user is
-- in at most ONE group per week.
CREATE TABLE IF NOT EXISTS public.league_members (
  group_id UUID NOT NULL REFERENCES public.league_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  points_cache INTEGER NOT NULL DEFAULT 0,
  final_rank INTEGER,
  result TEXT CHECK (result IN ('promoted', 'demoted', 'stayed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id),
  CONSTRAINT league_members_week_user_unique UNIQUE (week_start, user_id)
);

CREATE INDEX IF NOT EXISTS idx_league_members_group_points ON public.league_members(group_id, points_cache DESC);
CREATE INDEX IF NOT EXISTS idx_league_members_user_week ON public.league_members(user_id, week_start);

-- -----------------------------------------------------------------------------
-- 6. Create league_results Table
-- -----------------------------------------------------------------------------
-- Stores end-of-week outcome (rank, promotion/demotion, reward).
-- 'seen' flag controls the result popup shown on Monday reset.
CREATE TABLE IF NOT EXISTS public.league_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  old_tier TEXT NOT NULL,
  new_tier TEXT NOT NULL,
  rank INTEGER NOT NULL,
  reward_text TEXT,
  seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT league_results_user_week_unique UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_league_results_user_seen ON public.league_results(user_id, seen);

-- -----------------------------------------------------------------------------
-- 7. Lazy Group Placement Function: place_user_in_league_group()
-- -----------------------------------------------------------------------------
-- When a user earns their first points of a week:
-- 1. Look for an existing group for this week_start & tier that has < 30 members.
-- 2. If none exists, create a new group.
-- 3. Insert or update member record with the points.
CREATE OR REPLACE FUNCTION public.place_user_in_league_group(
  p_user_id UUID,
  p_week_start DATE,
  p_points INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_tier TEXT;
  v_group_id UUID;
  c_max_group_size CONSTANT INTEGER := 30;
BEGIN
  IF p_user_id IS NULL OR p_points <= 0 THEN
    RETURN NULL;
  END IF;

  -- 1. Check if user is already in a group for this week
  SELECT group_id INTO v_group_id
  FROM public.league_members
  WHERE user_id = p_user_id AND week_start = p_week_start;

  IF FOUND THEN
    -- Update cached points
    UPDATE public.league_members
    SET points_cache = points_cache + p_points
    WHERE group_id = v_group_id AND user_id = p_user_id;

    RETURN v_group_id;
  END IF;

  -- 2. Fetch user's current league tier (default 'Bronze')
  SELECT COALESCE(league_tier, 'Bronze') INTO v_tier
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_tier IS NULL THEN
    v_tier := 'Bronze';
  END IF;

  -- 3. Find an existing group for this week & tier with fewer than 30 members
  SELECT g.id INTO v_group_id
  FROM public.league_groups g
  WHERE g.week_start = p_week_start
    AND g.tier = v_tier
    AND (
      SELECT COUNT(*)
      FROM public.league_members m
      WHERE m.group_id = g.id
    ) < c_max_group_size
  ORDER BY g.created_at ASC
  LIMIT 1
  FOR UPDATE;

  -- 4. If no open group exists, create a new one
  IF v_group_id IS NULL THEN
    INSERT INTO public.league_groups (week_start, tier)
    VALUES (p_week_start, v_tier)
    RETURNING id INTO v_group_id;
  END IF;

  -- 5. Insert member into the chosen group
  INSERT INTO public.league_members (group_id, user_id, week_start, points_cache)
  VALUES (v_group_id, p_user_id, p_week_start, p_points)
  ON CONFLICT (week_start, user_id) DO UPDATE
  SET points_cache = public.league_members.points_cache + EXCLUDED.points_cache;

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 8. Trigger on point_events: Automatic League Sync
-- -----------------------------------------------------------------------------
-- Whenever a point_event is recorded (workout, streak, challenge, etc.),
-- automatically place the user into this week's league group if not already there,
-- and increment their points_cache.
CREATE OR REPLACE FUNCTION public.on_point_event_league_sync()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.place_user_in_league_group(NEW.user_id, NEW.week_start, NEW.points);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_point_events_league_sync ON public.point_events;
CREATE TRIGGER trg_point_events_league_sync
AFTER INSERT ON public.point_events
FOR EACH ROW EXECUTE FUNCTION public.on_point_event_league_sync();

-- -----------------------------------------------------------------------------
-- 9. Weekly Reset & Ranking Engine: execute_weekly_league_reset()
-- -----------------------------------------------------------------------------
-- Runs every Monday shortly after 00:00 UTC (via pg_cron or Edge Function).
-- Constants:
--   - MIN_ACTIVE_MEMBERS: 10
--   - PROMOTED_COUNT: 5 (Top 5 move up one tier)
--   - DEMOTED_COUNT: 5 (Bottom 5 active move down one tier)
--   - REWARD_PREMIUM_DAYS: 7 (First place in 10+ active group gets 7 days Free Premium)
CREATE OR REPLACE FUNCTION public.execute_weekly_league_reset(
  p_target_week_start DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  -- Adjustable League Constants in one central location
  c_min_active_members CONSTANT INTEGER := 10;
  c_promoted_count CONSTANT INTEGER := 5;
  c_demoted_count CONSTANT INTEGER := 5;
  c_reward_premium_days CONSTANT INTEGER := 7;

  v_target_week DATE;
  v_group RECORD;
  v_member RECORD;
  v_active_count INTEGER;
  v_current_rank INTEGER;
  v_old_tier TEXT;
  v_new_tier TEXT;
  v_result TEXT;
  v_reward_text TEXT;
  v_tier_order TEXT[] := ARRAY['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  v_tier_idx INTEGER;
  v_total_groups INTEGER := 0;
  v_total_promoted INTEGER := 0;
  v_total_demoted INTEGER := 0;
  v_total_champions INTEGER := 0;
BEGIN
  -- If not supplied, target the week that just finished (Monday of previous week)
  IF p_target_week_start IS NOT NULL THEN
    v_target_week := p_target_week_start;
  ELSE
    v_target_week := (date_trunc('week', now() AT TIME ZONE 'UTC') - interval '7 days')::date;
  END IF;

  -- 1. Reset champion crown from past weeks (will be assigned to fresh winners below)
  UPDATE public.profiles
  SET is_weekly_champion = false
  WHERE is_weekly_champion = true;

  -- 2. Process each group belonging to the finished week
  FOR v_group IN
    SELECT g.id, g.tier, g.week_start
    FROM public.league_groups g
    WHERE g.week_start = v_target_week
  LOOP
    v_total_groups := v_total_groups + 1;
    v_old_tier := v_group.tier;

    -- Count active players (points > 0). Players with 0 pts are inactive and never demoted.
    SELECT COUNT(*) INTO v_active_count
    FROM public.league_members
    WHERE group_id = v_group.id AND points_cache > 0;

    -- Calculate current tier index (1 to 5)
    SELECT array_position(v_tier_order, v_old_tier) INTO v_tier_idx;

    v_current_rank := 0;

    -- Iterate active members ordered by points descending
    FOR v_member IN
      SELECT m.user_id, m.points_cache
      FROM public.league_members m
      WHERE m.group_id = v_group.id AND m.points_cache > 0
      ORDER BY m.points_cache DESC, m.created_at ASC
    LOOP
      v_current_rank := v_current_rank + 1;
      v_new_tier := v_old_tier;
      v_result := 'stayed';
      v_reward_text := NULL;

      -- Check if group meets the 10 active members threshold
      IF v_active_count >= c_min_active_members THEN

        -- Reward 1st place champion
        IF v_current_rank = 1 THEN
          -- 7 days of Premium reward
          UPDATE public.profiles
          SET reward_premium_until = GREATEST(COALESCE(reward_premium_until, now()), now()) + (c_reward_premium_days || ' days')::interval,
              is_weekly_champion = true
          WHERE id = v_member.user_id;

          v_reward_text := '7 Days of Free Premium + Weekly Champion Crown 👑';
          v_total_champions := v_total_champions + 1;
        END IF;

        -- Top 5: Promotion Zone (unless already Diamond)
        IF v_current_rank <= c_promoted_count THEN
          IF v_tier_idx < 5 THEN
            v_new_tier := v_tier_order[v_tier_idx + 1];
            v_result := 'promoted';
            v_total_promoted := v_total_promoted + 1;
          ELSE
            v_result := 'stayed'; -- Diamond stays Diamond
          END IF;

        -- Bottom 5 active: Demotion Zone (unless already Bronze or also in top 5)
        ELSIF v_current_rank > (v_active_count - c_demoted_count) AND v_current_rank > c_promoted_count THEN
          IF v_tier_idx > 1 THEN
            v_new_tier := v_tier_order[v_tier_idx - 1];
            v_result := 'demoted';
            v_total_demoted := v_total_demoted + 1;
          ELSE
            v_result := 'stayed'; -- Bronze stays Bronze
          END IF;
        ELSE
          v_result := 'stayed';
        END IF;

      ELSE
        -- Under 10 active players: everyone stays, no promotion/demotion/reward
        v_result := 'stayed';
        v_new_tier := v_old_tier;
      END IF;

      -- Save member final rank & result
      UPDATE public.league_members
      SET final_rank = v_current_rank,
          result = v_result
      WHERE group_id = v_group.id AND user_id = v_member.user_id;

      -- Update user profile tier
      UPDATE public.profiles
      SET league_tier = v_new_tier
      WHERE id = v_member.user_id;

      -- Record result for popup
      INSERT INTO public.league_results (
        user_id, week_start, old_tier, new_tier, rank, reward_text, seen
      )
      VALUES (
        v_member.user_id, v_target_week, v_old_tier, v_new_tier, v_current_rank, v_reward_text, false
      )
      ON CONFLICT (user_id, week_start) DO UPDATE
      SET old_tier = EXCLUDED.old_tier,
          new_tier = EXCLUDED.new_tier,
          rank = EXCLUDED.rank,
          reward_text = EXCLUDED.reward_text,
          seen = false;
    END LOOP;

    -- For members with 0 points: they stayed, final_rank null, NOT demoted
    FOR v_member IN
      SELECT m.user_id
      FROM public.league_members m
      WHERE m.group_id = v_group.id AND m.points_cache = 0
    LOOP
      UPDATE public.league_members
      SET final_rank = NULL,
          result = 'stayed'
      WHERE group_id = v_group.id AND user_id = v_member.user_id;

      INSERT INTO public.league_results (
        user_id, week_start, old_tier, new_tier, rank, reward_text, seen
      )
      VALUES (
        v_member.user_id, v_target_week, v_old_tier, v_old_tier, 0, NULL, false
      )
      ON CONFLICT (user_id, week_start) DO NOTHING;
    END LOOP;

  END LOOP;

  RETURN jsonb_build_object(
    'week_start', v_target_week,
    'groups_processed', v_total_groups,
    'promotions', v_total_promoted,
    'demotions', v_total_demoted,
    'champions', v_total_champions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 10. RPC for App: get_my_league_group()
-- -----------------------------------------------------------------------------
-- Returns the user's active league group for the week, ranked members, user rank,
-- and privacy filtering: users with private/friends-only accounts appear as "Player".
CREATE OR REPLACE FUNCTION public.get_my_league_group(
  p_week_start DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_uid UUID;
  v_week DATE;
  v_group_id UUID;
  v_tier TEXT;
  v_user_points INTEGER := 0;
  v_user_rank INTEGER := 0;
  v_is_joined BOOLEAN := false;
  v_members JSONB;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'NOT_AUTHENTICATED');
  END IF;

  IF p_week_start IS NOT NULL THEN
    v_week := p_week_start;
  ELSE
    v_week := (date_trunc('week', now() AT TIME ZONE 'UTC'))::date;
  END IF;

  -- 1. Find user's group for this week
  SELECT m.group_id, m.points_cache
  INTO v_group_id, v_user_points
  FROM public.league_members m
  WHERE m.user_id = v_uid AND m.week_start = v_week;

  -- 2. Fetch user's current tier
  SELECT COALESCE(league_tier, 'Bronze') INTO v_tier
  FROM public.profiles
  WHERE id = v_uid;

  IF v_group_id IS NOT NULL THEN
    v_is_joined := true;

    -- Build ranked members list with privacy enforcement
    WITH ranked AS (
      SELECT
        m.user_id,
        m.points_cache,
        p.username,
        p.name,
        p.avatar_url,
        p.account_visibility,
        p.league_tier,
        p.is_weekly_champion,
        ROW_NUMBER() OVER (ORDER BY m.points_cache DESC, m.created_at ASC) as current_rank
      FROM public.league_members m
      JOIN public.profiles p ON p.id = m.user_id
      WHERE m.group_id = v_group_id
    )
    SELECT
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'user_id', r.user_id,
            'rank', r.current_rank,
            'points', r.points_cache,
            'is_current_user', (r.user_id = v_uid),
            'tier', r.league_tier,
            'is_weekly_champion', COALESCE(r.is_weekly_champion, false),
            -- Privacy filter: non-public accounts (except current user) appear as "Player"
            'username', CASE
              WHEN r.user_id = v_uid OR r.account_visibility = 'public' THEN r.username
              ELSE 'Player'
            END,
            'name', CASE
              WHEN r.user_id = v_uid OR r.account_visibility = 'public' THEN r.name
              ELSE 'Player'
            END,
            'avatar_url', CASE
              WHEN r.user_id = v_uid OR r.account_visibility = 'public' THEN r.avatar_url
              ELSE NULL
            END,
            'is_private', (r.user_id != v_uid AND r.account_visibility != 'public')
          )
          ORDER BY r.current_rank ASC
        ),
        '[]'::jsonb
      )
    INTO v_members
    FROM ranked r;

    -- Find current user's rank
    SELECT COALESCE(
      (SELECT current_rank FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY points_cache DESC, created_at ASC) as current_rank
        FROM public.league_members
        WHERE group_id = v_group_id
      ) sub WHERE sub.user_id = v_uid),
      0
    ) INTO v_user_rank;

  ELSE
    v_is_joined := false;
    v_members := '[]'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'is_joined', v_is_joined,
    'group_id', v_group_id,
    'week_start', v_week,
    'tier', v_tier,
    'user_points', v_user_points,
    'user_rank', v_user_rank,
    'members', v_members
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 11. RPC for App: get_unseen_league_result() & mark_league_result_seen()
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_unseen_league_result()
RETURNS JSONB AS $$
DECLARE
  v_uid UUID;
  v_result RECORD;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id, week_start, old_tier, new_tier, rank, reward_text
  INTO v_result
  FROM public.league_results
  WHERE user_id = v_uid AND seen = false
  ORDER BY week_start DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_result.id,
    'week_start', v_result.week_start,
    'old_tier', v_result.old_tier,
    'new_tier', v_result.new_tier,
    'rank', v_result.rank,
    'reward_text', v_result.reward_text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.mark_league_result_seen(p_result_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.league_results
  SET seen = true
  WHERE id = p_result_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 12. Testing RPC: test_run_weekly_league_reset()
-- -----------------------------------------------------------------------------
-- Lets developers and testers manually trigger the weekly reset right now
-- for testing promotion/demotion and rewards without waiting for Monday.
CREATE OR REPLACE FUNCTION public.test_run_weekly_league_reset(
  p_week_start DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_target_week DATE;
BEGIN
  -- If not passed, use current week's Monday for immediate instant test
  IF p_week_start IS NOT NULL THEN
    v_target_week := p_week_start;
  ELSE
    v_target_week := (date_trunc('week', now() AT TIME ZONE 'UTC'))::date;
  END IF;

  RETURN public.execute_weekly_league_reset(v_target_week);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 13. Row-Level Security (RLS)
-- -----------------------------------------------------------------------------

-- A. league_groups
ALTER TABLE public.league_groups ENABLE ROW LEVEL SECURITY;

-- Members and authenticated users can view league groups
DROP POLICY IF EXISTS "Authenticated users can view league groups" ON public.league_groups;
CREATE POLICY "Authenticated users can view league groups"
ON public.league_groups
FOR SELECT
TO authenticated
USING (true);

-- B. league_members
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- Members can read records of users in their own group
DROP POLICY IF EXISTS "Members can view their own group members" ON public.league_members;
CREATE POLICY "Members can view their own group members"
ON public.league_members
FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id FROM public.league_members WHERE user_id = auth.uid()
  )
);

-- C. league_results
ALTER TABLE public.league_results ENABLE ROW LEVEL SECURITY;

-- Users can read only their own league results
DROP POLICY IF EXISTS "Users can view own league results" ON public.league_results;
CREATE POLICY "Users can view own league results"
ON public.league_results
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can mark only their own league results as seen
DROP POLICY IF EXISTS "Users can update own league result seen status" ON public.league_results;
CREATE POLICY "Users can update own league result seen status"
ON public.league_results
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Prevent app client from directly inserting/deleting league tables
-- (All writes happen via security definer triggers and functions)

-- -----------------------------------------------------------------------------
-- 14. Weekly Automation & Scheduling Options
-- -----------------------------------------------------------------------------
-- Option A: Supabase pg_cron (Database > Extensions > Enable pg_cron)
-- Run this query once in your SQL Editor to schedule it automatically:
--
-- SELECT cron.schedule(
--   'weekly-league-reset',
--   '5 0 * * 1', -- Runs every Monday at 00:05 UTC
--   $$SELECT public.execute_weekly_league_reset()$$
-- );
--
-- Option B: Supabase Edge Function
-- Deploy the included Edge Function:
-- supabase functions deploy process-weekly-leagues
--
-- -----------------------------------------------------------------------------
-- 15. Quick Testing (Instant Run Right Now)
-- -----------------------------------------------------------------------------
-- To test the weekly reset engine immediately on your current database without
-- waiting for Monday:
--
-- SELECT public.test_run_weekly_league_reset();

