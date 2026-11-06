-- =============================================================================
-- SWEATFLIX NOTIFICATIONS & PUSH ENGINE (STEP 9f)
-- =============================================================================
-- Generates in-app notifications and push notifications for:
-- 1. Friend requests sent and accepted
-- 2. 1v1 Challenges created, accepted, and completed
-- 3. Challenge entries logged by friends (max 1 notification per challenge per hour)
-- 4. Workout post likes (throttled to max 1 per post per hour)
-- 5. Push token registration & user notification preferences
--
-- Security:
-- - Row Level Security (RLS) is ENABLED on all tables.
-- - Notifications can ONLY be inserted via SECURITY DEFINER triggers (clients cannot insert).
-- - Users can only view, mark read, or delete their own notifications.
-- - Users can only view and edit their own push tokens and notification settings.
-- - Blocks and privacy rules are strictly enforced (never notify blocked users or own actions).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table: notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'friend_request',
    'friend_accepted',
    'challenge_invite',
    'challenge_accepted',
    'challenge_entry',
    'challenge_result',
    'post_like'
  )),
  ref_id TEXT, -- e.g. friendship_id, challenge_id, post_id
  data JSONB NOT NULL DEFAULT '{}'::jsonb, -- preview metadata (actor_name, exercise_name, amount, etc.)
  read_at TIMESTAMPTZ, -- NULL indicates unread
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimize notification list lookups and badge counts
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_throttle ON public.notifications(user_id, ref_id, type, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications SELECT policy: user reads only their own notifications
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Notifications UPDATE policy: user can mark only their own notifications as read
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Notifications DELETE policy: user can delete their own notifications
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
CREATE POLICY "notifications_delete_policy" ON public.notifications
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Notifications INSERT: Client cannot insert directly. Only DB triggers or service role insert.
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
CREATE POLICY "notifications_insert_policy" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (false);

-- -----------------------------------------------------------------------------
-- 2. Table: push_tokens
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'unknown', -- 'ios', 'android', 'web'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON public.push_tokens(token);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_tokens_select_policy" ON public.push_tokens;
CREATE POLICY "push_tokens_select_policy" ON public.push_tokens
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_tokens_insert_policy" ON public.push_tokens;
CREATE POLICY "push_tokens_insert_policy" ON public.push_tokens
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_tokens_update_policy" ON public.push_tokens;
CREATE POLICY "push_tokens_update_policy" ON public.push_tokens
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_tokens_delete_policy" ON public.push_tokens;
CREATE POLICY "push_tokens_delete_policy" ON public.push_tokens
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 3. Table: notification_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_requests BOOLEAN NOT NULL DEFAULT true,
  challenges BOOLEAN NOT NULL DEFAULT true,
  likes BOOLEAN NOT NULL DEFAULT true,
  reminders BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_settings_select_policy" ON public.notification_settings;
CREATE POLICY "notif_settings_select_policy" ON public.notification_settings
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_settings_insert_policy" ON public.notification_settings;
CREATE POLICY "notif_settings_insert_policy" ON public.notification_settings
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_settings_update_policy" ON public.notification_settings;
CREATE POLICY "notif_settings_update_policy" ON public.notification_settings
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. Helper Function: can_notify
-- Checks whether a notification should be generated:
-- - Rejects own actions (actor_id = recipient_id)
-- - Rejects if recipient has blocked actor or actor has blocked recipient
-- - Respects user notification settings (friend_requests, challenges, likes)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_notify(
  p_recipient_id UUID,
  p_actor_id UUID,
  p_category TEXT -- 'friend', 'challenge', 'like'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_settings RECORD;
BEGIN
  -- 1. Never notify null or own action
  IF p_recipient_id IS NULL OR p_recipient_id = p_actor_id THEN
    RETURN FALSE;
  END IF;

  -- 2. Never notify if there is an active block between the two users
  IF p_actor_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.user_blocks
      WHERE (blocker_id = p_recipient_id AND blocked_id = p_actor_id)
         OR (blocker_id = p_actor_id AND blocked_id = p_recipient_id)
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- 3. Check recipient's notification settings (defaults to true if row doesn't exist yet)
  SELECT * INTO v_settings FROM public.notification_settings WHERE user_id = p_recipient_id;
  IF FOUND THEN
    IF p_category = 'friend' AND NOT v_settings.friend_requests THEN
      RETURN FALSE;
    END IF;
    IF p_category = 'challenge' AND NOT v_settings.challenges THEN
      RETURN FALSE;
    END IF;
    IF p_category = 'like' AND NOT v_settings.likes THEN
      RETURN FALSE;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. Trigger: Friend Requests & Friend Acceptances
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_friendships()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_name TEXT;
  v_actor_username TEXT;
  v_actor_avatar TEXT;
BEGIN
  -- CASE A: New friend request sent (status = 'pending')
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    IF public.can_notify(NEW.addressee_id, NEW.requester_id, 'friend') THEN
      SELECT name, username, avatar_url INTO v_actor_name, v_actor_username, v_actor_avatar
      FROM public.profiles WHERE id = NEW.requester_id;

      INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
      VALUES (
        NEW.addressee_id,
        NEW.requester_id,
        'friend_request',
        NEW.id::text,
        jsonb_build_object(
          'actor_name', COALESCE(v_actor_name, 'An athlete'),
          'actor_username', v_actor_username,
          'actor_avatar_url', v_actor_avatar
        )
      );
    END IF;

  -- CASE B: Friend request accepted (status changed from pending -> accepted)
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    IF public.can_notify(NEW.requester_id, NEW.addressee_id, 'friend') THEN
      SELECT name, username, avatar_url INTO v_actor_name, v_actor_username, v_actor_avatar
      FROM public.profiles WHERE id = NEW.addressee_id;

      INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
      VALUES (
        NEW.requester_id,
        NEW.addressee_id,
        'friend_accepted',
        NEW.id::text,
        jsonb_build_object(
          'actor_name', COALESCE(v_actor_name, 'An athlete'),
          'actor_username', v_actor_username,
          'actor_avatar_url', v_actor_avatar
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_friendships_notifications ON public.friendships;
CREATE TRIGGER trg_friendships_notifications
AFTER INSERT OR UPDATE OF status ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_friendships();

-- -----------------------------------------------------------------------------
-- 6. Trigger: Friend Challenges (Created, Accepted, Completed)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_challenges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_name TEXT;
  v_actor_username TEXT;
  v_actor_avatar TEXT;
  v_winner_name TEXT;
BEGIN
  -- CASE A: New challenge invite created
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    IF public.can_notify(NEW.opponent_id, NEW.creator_id, 'challenge') THEN
      SELECT name, username, avatar_url INTO v_actor_name, v_actor_username, v_actor_avatar
      FROM public.profiles WHERE id = NEW.creator_id;

      INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
      VALUES (
        NEW.opponent_id,
        NEW.creator_id,
        'challenge_invite',
        NEW.id::text,
        jsonb_build_object(
          'actor_name', COALESCE(v_actor_name, 'An athlete'),
          'actor_username', v_actor_username,
          'actor_avatar_url', v_actor_avatar,
          'exercise_name', NEW.exercise_name,
          'target', NEW.target,
          'metric', NEW.metric,
          'duration_hours', NEW.duration_hours
        )
      );
    END IF;

  -- CASE B: Challenge accepted (pending -> active)
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'active' THEN
    IF public.can_notify(NEW.creator_id, NEW.opponent_id, 'challenge') THEN
      SELECT name, username, avatar_url INTO v_actor_name, v_actor_username, v_actor_avatar
      FROM public.profiles WHERE id = NEW.opponent_id;

      INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
      VALUES (
        NEW.creator_id,
        NEW.opponent_id,
        'challenge_accepted',
        NEW.id::text,
        jsonb_build_object(
          'actor_name', COALESCE(v_actor_name, 'An athlete'),
          'actor_username', v_actor_username,
          'actor_avatar_url', v_actor_avatar,
          'exercise_name', NEW.exercise_name
        )
      );
    END IF;

  -- CASE C: Challenge finished (active -> completed)
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'completed' THEN
    -- Notify Creator
    IF public.can_notify(NEW.creator_id, NEW.opponent_id, 'challenge') THEN
      INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
      VALUES (
        NEW.creator_id,
        NEW.opponent_id,
        'challenge_result',
        NEW.id::text,
        jsonb_build_object(
          'exercise_name', NEW.exercise_name,
          'is_draw', NEW.is_draw,
          'winner_id', NEW.winner_id,
          'is_winner', (NEW.winner_id = NEW.creator_id)
        )
      );
    END IF;

    -- Notify Opponent
    IF public.can_notify(NEW.opponent_id, NEW.creator_id, 'challenge') THEN
      INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
      VALUES (
        NEW.opponent_id,
        NEW.creator_id,
        'challenge_result',
        NEW.id::text,
        jsonb_build_object(
          'exercise_name', NEW.exercise_name,
          'is_draw', NEW.is_draw,
          'winner_id', NEW.winner_id,
          'is_winner', (NEW.winner_id = NEW.opponent_id)
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenges_notifications ON public.friend_challenges;
CREATE TRIGGER trg_challenges_notifications
AFTER INSERT OR UPDATE OF status ON public.friend_challenges
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_challenges();

-- -----------------------------------------------------------------------------
-- 7. Trigger: Challenge Entry (Throttled: max 1 per challenge per hour)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_challenge_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ch RECORD;
  v_recipient_id UUID;
  v_actor_name TEXT;
  v_actor_username TEXT;
  v_actor_avatar TEXT;
BEGIN
  -- Look up challenge details
  SELECT creator_id, opponent_id, exercise_name, status INTO v_ch
  FROM public.friend_challenges WHERE id = NEW.challenge_id;

  IF NOT FOUND OR v_ch.status <> 'active' THEN
    RETURN NEW;
  END IF;

  -- Recipient is the OTHER participant
  IF NEW.user_id = v_ch.creator_id THEN
    v_recipient_id := v_ch.opponent_id;
  ELSE
    v_recipient_id := v_ch.creator_id;
  END IF;

  -- Hourly throttling: check if notification was already sent for this challenge in the last hour
  IF EXISTS (
    SELECT 1 FROM public.notifications
    WHERE user_id = v_recipient_id
      AND ref_id = NEW.challenge_id::text
      AND type = 'challenge_entry'
      AND created_at > now() - INTERVAL '1 hour'
  ) THEN
    RETURN NEW; -- Throttled
  END IF;

  IF public.can_notify(v_recipient_id, NEW.user_id, 'challenge') THEN
    SELECT name, username, avatar_url INTO v_actor_name, v_actor_username, v_actor_avatar
    FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
    VALUES (
      v_recipient_id,
      NEW.user_id,
      'challenge_entry',
      NEW.challenge_id::text,
      jsonb_build_object(
        'actor_name', COALESCE(v_actor_name, 'Your opponent'),
        'actor_username', v_actor_username,
        'actor_avatar_url', v_actor_avatar,
        'exercise_name', v_ch.exercise_name,
        'amount', NEW.amount
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenge_entry_notifications ON public.friend_challenge_entries;
CREATE TRIGGER trg_challenge_entry_notifications
AFTER INSERT ON public.friend_challenge_entries
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_challenge_entry();

-- -----------------------------------------------------------------------------
-- 8. Trigger: Workout Post Likes (Throttled: max 1 per post per hour)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post RECORD;
  v_actor_name TEXT;
  v_actor_username TEXT;
  v_actor_avatar TEXT;
BEGIN
  -- Look up post owner and info
  SELECT user_id, workout_name, caption INTO v_post
  FROM public.posts WHERE id = NEW.post_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Never notify for own like
  IF v_post.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Hourly throttling: max 1 notification per post per hour
  IF EXISTS (
    SELECT 1 FROM public.notifications
    WHERE user_id = v_post.user_id
      AND ref_id = NEW.post_id::text
      AND type = 'post_like'
      AND created_at > now() - INTERVAL '1 hour'
  ) THEN
    RETURN NEW; -- Throttled
  END IF;

  IF public.can_notify(v_post.user_id, NEW.user_id, 'like') THEN
    SELECT name, username, avatar_url INTO v_actor_name, v_actor_username, v_actor_avatar
    FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.notifications (user_id, actor_id, type, ref_id, data)
    VALUES (
      v_post.user_id,
      NEW.user_id,
      'post_like',
      NEW.post_id::text,
      jsonb_build_object(
        'actor_name', COALESCE(v_actor_name, 'An athlete'),
        'actor_username', v_actor_username,
        'actor_avatar_url', v_actor_avatar,
        'workout_name', v_post.workout_name,
        'caption', v_post.caption
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_like_notifications ON public.post_likes;
CREATE TRIGGER trg_post_like_notifications
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_post_like();

-- -----------------------------------------------------------------------------
-- 9. RPC: Mark all user notifications as read
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET read_at = now()
  WHERE user_id = auth.uid() AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- -----------------------------------------------------------------------------
-- 10. Enable Supabase Realtime Publication for notifications
-- Allows immediate client badges and banner updates without polling
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
