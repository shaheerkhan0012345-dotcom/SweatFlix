-- =============================================================================
-- SWEATFLIX STEP 9c: FRIEND CHALLENGES SCHEMA, TRIGGERS & RLS POLICIES
-- =============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- -----------------------------------------------------------------------------
-- 0. Helper Function: is_user_premium(uid)
-- Returns profiles.is_premium for that user. Used for every Premium check.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_user_premium(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  premium_status BOOLEAN;
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT is_premium INTO premium_status
  FROM public.profiles
  WHERE id = uid;

  RETURN COALESCE(premium_status, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 1. Extend exercises table with metric ('reps' | 'seconds')
-- -----------------------------------------------------------------------------
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS metric TEXT NOT NULL DEFAULT 'reps' CHECK (metric IN ('reps', 'seconds'));

-- Set 'seconds' for Forearm Plank Hold only
UPDATE public.exercises
SET metric = 'seconds'
WHERE name ILIKE '%Forearm Plank Hold%' OR id = 'abs-plank';

-- -----------------------------------------------------------------------------
-- 2. Create friend_challenges table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('reps', 'seconds')),
  target INTEGER NOT NULL CHECK (target >= 1 AND target <= 5000),
  duration_hours INTEGER NOT NULL CHECK (duration_hours IN (24, 72, 168)),
  message TEXT CHECK (char_length(message) <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'cancelled', 'completed')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_draw BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT friend_challenges_no_self CHECK (creator_id <> opponent_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_challenges_creator ON public.friend_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_friend_challenges_opponent ON public.friend_challenges(opponent_id);
CREATE INDEX IF NOT EXISTS idx_friend_challenges_status ON public.friend_challenges(status);

-- Ensure exercise_id is TEXT (if table was previously created with exercise_id UUID)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'friend_challenges' 
      AND column_name = 'exercise_id' 
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.friend_challenges DROP CONSTRAINT IF EXISTS friend_challenges_exercise_id_fkey;
    ALTER TABLE public.friend_challenges ALTER COLUMN exercise_id TYPE TEXT;
    ALTER TABLE public.friend_challenges ADD CONSTRAINT friend_challenges_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE SET NULL;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. Trigger: Validate Friend Status, Block Status & Free Challenge Limit
-- Free users can be in at most 3 challenges with status 'pending' or 'active' at once.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_friend_challenge_creation()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
  creator_premium BOOLEAN;
BEGIN
  -- 1. Ensure creator and opponent are accepted friends
  IF NOT public.are_friends(NEW.creator_id, NEW.opponent_id) THEN
    RAISE EXCEPTION 'FRIEND_REQUIRED: You can only challenge an accepted friend.';
  END IF;

  -- 2. Ensure neither user has blocked the other
  IF EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = NEW.creator_id AND blocked_id = NEW.opponent_id)
       OR (blocker_id = NEW.opponent_id AND blocked_id = NEW.creator_id)
  ) THEN
    RAISE EXCEPTION 'USER_BLOCKED: Cannot send challenge to this user.';
  END IF;

  -- 3. Check Free vs Premium active/pending challenge limit (Max 3 for free users)
  creator_premium := public.is_user_premium(NEW.creator_id);
  IF NOT creator_premium THEN
    SELECT COUNT(*) INTO active_count
    FROM public.friend_challenges
    WHERE (creator_id = NEW.creator_id OR opponent_id = NEW.creator_id)
      AND status IN ('pending', 'active');

    IF active_count >= 3 THEN
      RAISE EXCEPTION 'FREE_CHALLENGE_LIMIT_REACHED: Free users can have at most 3 active challenges at once.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_friend_challenge_creation ON public.friend_challenges;
CREATE TRIGGER trg_check_friend_challenge_creation
BEFORE INSERT ON public.friend_challenges
FOR EACH ROW
EXECUTE FUNCTION public.check_friend_challenge_creation();

-- -----------------------------------------------------------------------------
-- 4. Trigger: Set starts_at and ends_at when challenge transitions to active
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.on_friend_challenge_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'active' THEN
    NEW.starts_at := now();
    NEW.ends_at := now() + (NEW.duration_hours || ' hours')::interval;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_friend_challenge_status_change ON public.friend_challenges;
CREATE TRIGGER trg_on_friend_challenge_status_change
BEFORE UPDATE ON public.friend_challenges
FOR EACH ROW
EXECUTE FUNCTION public.on_friend_challenge_status_change();

-- -----------------------------------------------------------------------------
-- 5. Create friend_challenge_entries table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.friend_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 1 AND amount <= 500),
  proof_path TEXT,
  disputed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge_id ON public.friend_challenge_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_user_id ON public.friend_challenge_entries(user_id);

-- -----------------------------------------------------------------------------
-- 6. Trigger: Validate challenge entry rules
-- Entries allowed only while active and before ends_at, and amounts can never be edited.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_challenge_entry_insert()
RETURNS TRIGGER AS $$
DECLARE
  ch RECORD;
BEGIN
  SELECT * INTO ch
  FROM public.friend_challenges
  WHERE id = NEW.challenge_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge does not exist.';
  END IF;

  -- Only participants can log
  IF NEW.user_id <> ch.creator_id AND NEW.user_id <> ch.opponent_id THEN
    RAISE EXCEPTION 'Only participants can log reps for this challenge.';
  END IF;

  -- Status must be active
  IF ch.status <> 'active' THEN
    RAISE EXCEPTION 'Challenge is not active.';
  END IF;

  -- Time must not have expired
  IF ch.ends_at IS NOT NULL AND now() > ch.ends_at THEN
    RAISE EXCEPTION 'Challenge time has expired.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_challenge_entry_insert ON public.friend_challenge_entries;
CREATE TRIGGER trg_check_challenge_entry_insert
BEFORE INSERT ON public.friend_challenge_entries
FOR EACH ROW
EXECUTE FUNCTION public.check_challenge_entry_insert();

-- Amounts can never be edited
CREATE OR REPLACE FUNCTION public.prevent_entry_amount_edit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount <> OLD.amount THEN
    RAISE EXCEPTION 'Entry amount cannot be edited.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_entry_amount_edit ON public.friend_challenge_entries;
CREATE TRIGGER trg_prevent_entry_amount_edit
BEFORE UPDATE ON public.friend_challenge_entries
FOR EACH ROW
EXECUTE FUNCTION public.prevent_entry_amount_edit();

-- A user can delete their own entry only within 10 minutes of creating it
CREATE OR REPLACE FUNCTION public.check_entry_delete_time()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.created_at < (now() - interval '10 minutes') THEN
    RAISE EXCEPTION 'Entries can only be deleted within 10 minutes of creation.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_entry_delete_time ON public.friend_challenge_entries;
CREATE TRIGGER trg_check_entry_delete_time
BEFORE DELETE ON public.friend_challenge_entries
FOR EACH ROW
EXECUTE FUNCTION public.check_entry_delete_time();

-- -----------------------------------------------------------------------------
-- 7. Disputes Table & Trigger (Max 3 disputes per user per challenge)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_challenge_disputes (
  challenge_id UUID REFERENCES public.friend_challenges(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES public.friend_challenge_entries(id) ON DELETE CASCADE NOT NULL,
  disputer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (challenge_id, entry_id)
);
ALTER TABLE public.friend_challenge_disputes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_max_disputes()
RETURNS TRIGGER AS $$
DECLARE
  dispute_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dispute_count
  FROM public.friend_challenge_disputes
  WHERE challenge_id = NEW.challenge_id
    AND disputer_id = NEW.disputer_id;

  IF dispute_count >= 3 THEN
    RAISE EXCEPTION 'MAX_DISPUTES_REACHED: You can only dispute up to 3 entries per challenge.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_max_disputes ON public.friend_challenge_disputes;
CREATE TRIGGER trg_check_max_disputes
BEFORE INSERT ON public.friend_challenge_disputes
FOR EACH ROW
EXECUTE FUNCTION public.check_max_disputes();

-- -----------------------------------------------------------------------------
-- 8. Helper Functions: Progress, Finalize Challenge & Finalize Expired
-- -----------------------------------------------------------------------------

-- Progress: sum of amounts of non-disputed entries
CREATE OR REPLACE FUNCTION public.get_challenge_progress(c_id UUID, u_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM public.friend_challenge_entries
  WHERE challenge_id = c_id
    AND user_id = u_id
    AND disputed = false;

  RETURN total;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Finalize a challenge: decides winner or draw
CREATE OR REPLACE FUNCTION public.finalize_challenge(c_id UUID)
RETURNS VOID AS $$
DECLARE
  ch RECORD;
  c_score INTEGER;
  o_score INTEGER;
BEGIN
  SELECT * INTO ch
  FROM public.friend_challenges
  WHERE id = c_id;

  IF NOT FOUND OR ch.status = 'completed' THEN
    RETURN;
  END IF;

  c_score := public.get_challenge_progress(c_id, ch.creator_id);
  o_score := public.get_challenge_progress(c_id, ch.opponent_id);

  -- Target reached check: first to reach wins
  IF c_score >= ch.target AND o_score >= ch.target THEN
    -- Both reached target: whoever has higher total wins, or draw if equal
    IF c_score > o_score THEN
      UPDATE public.friend_challenges
      SET status = 'completed', winner_id = ch.creator_id, is_draw = false
      WHERE id = c_id;
    ELSIF o_score > c_score THEN
      UPDATE public.friend_challenges
      SET status = 'completed', winner_id = ch.opponent_id, is_draw = false
      WHERE id = c_id;
    ELSE
      UPDATE public.friend_challenges
      SET status = 'completed', winner_id = NULL, is_draw = true
      WHERE id = c_id;
    END IF;
  ELSIF c_score >= ch.target THEN
    UPDATE public.friend_challenges
    SET status = 'completed', winner_id = ch.creator_id, is_draw = false
    WHERE id = c_id;
  ELSIF o_score >= ch.target THEN
    UPDATE public.friend_challenges
    SET status = 'completed', winner_id = ch.opponent_id, is_draw = false
    WHERE id = c_id;
  ELSE
    -- Time expired: higher total wins; equal is draw
    IF c_score > o_score THEN
      UPDATE public.friend_challenges
      SET status = 'completed', winner_id = ch.creator_id, is_draw = false
      WHERE id = c_id;
    ELSIF o_score > c_score THEN
      UPDATE public.friend_challenges
      SET status = 'completed', winner_id = ch.opponent_id, is_draw = false
      WHERE id = c_id;
    ELSE
      UPDATE public.friend_challenges
      SET status = 'completed', winner_id = NULL, is_draw = true
      WHERE id = c_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: When an entry is inserted, check if target is reached immediately
CREATE OR REPLACE FUNCTION public.check_entry_target_reached()
RETURNS TRIGGER AS $$
DECLARE
  ch RECORD;
  user_score INTEGER;
BEGIN
  SELECT * INTO ch
  FROM public.friend_challenges
  WHERE id = NEW.challenge_id;

  IF ch.status = 'active' THEN
    user_score := public.get_challenge_progress(NEW.challenge_id, NEW.user_id);
    IF user_score >= ch.target THEN
      PERFORM public.finalize_challenge(NEW.challenge_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_entry_target_reached ON public.friend_challenge_entries;
CREATE TRIGGER trg_check_entry_target_reached
AFTER INSERT ON public.friend_challenge_entries
FOR EACH ROW
EXECUTE FUNCTION public.check_entry_target_reached();

-- Finalize expired challenges and cancel pending challenges older than 48 hours
CREATE OR REPLACE FUNCTION public.finalize_expired_challenges()
RETURNS INTEGER AS $$
DECLARE
  expired_row RECORD;
  cnt INTEGER := 0;
BEGIN
  -- 1. Expire unanswered pending challenges older than 48 hours
  UPDATE public.friend_challenges
  SET status = 'cancelled'
  WHERE status = 'pending'
    AND created_at < (now() - interval '48 hours');

  -- 2. Finalize active challenges where ends_at <= now()
  FOR expired_row IN
    SELECT id FROM public.friend_challenges
    WHERE status = 'active'
      AND ends_at <= now()
  LOOP
    PERFORM public.finalize_challenge(expired_row.id);
    cnt := cnt + 1;
  END LOOP;

  RETURN cnt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 9. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------
ALTER TABLE public.friend_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_challenge_entries ENABLE ROW LEVEL SECURITY;

-- friend_challenges SELECT: participants can read their own challenges
DROP POLICY IF EXISTS "friend_challenges_select_policy" ON public.friend_challenges;
CREATE POLICY "friend_challenges_select_policy" ON public.friend_challenges
FOR SELECT TO authenticated
USING (creator_id = auth.uid() OR opponent_id = auth.uid());

-- friend_challenges INSERT: creator can insert
DROP POLICY IF EXISTS "friend_challenges_insert_policy" ON public.friend_challenges;
CREATE POLICY "friend_challenges_insert_policy" ON public.friend_challenges
FOR INSERT TO authenticated
WITH CHECK (creator_id = auth.uid());

-- friend_challenges UPDATE:
-- 1. Opponent can accept or decline a pending challenge
-- 2. Creator can cancel a pending challenge
DROP POLICY IF EXISTS "friend_challenges_update_policy" ON public.friend_challenges;
CREATE POLICY "friend_challenges_update_policy" ON public.friend_challenges
FOR UPDATE TO authenticated
USING (creator_id = auth.uid() OR opponent_id = auth.uid())
WITH CHECK (
  (opponent_id = auth.uid() AND status IN ('active', 'declined'))
  OR (creator_id = auth.uid() AND status = 'cancelled')
  OR (status = 'completed')
);

-- friend_challenge_entries SELECT: participants can view entries of their challenge
DROP POLICY IF EXISTS "friend_challenge_entries_select_policy" ON public.friend_challenge_entries;
CREATE POLICY "friend_challenge_entries_select_policy" ON public.friend_challenge_entries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friend_challenges c
    WHERE c.id = friend_challenge_entries.challenge_id
      AND (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
  )
);

-- friend_challenge_entries INSERT: participant inserts own entry while active
DROP POLICY IF EXISTS "friend_challenge_entries_insert_policy" ON public.friend_challenge_entries;
CREATE POLICY "friend_challenge_entries_insert_policy" ON public.friend_challenge_entries
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.friend_challenges c
    WHERE c.id = challenge_id
      AND c.status = 'active'
      AND (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
      AND (c.ends_at IS NULL OR c.ends_at > now())
  )
);

-- friend_challenge_entries UPDATE:
-- 1. Other participant can dispute an entry
-- 2. Entry owner can attach proof to a disputed entry
DROP POLICY IF EXISTS "friend_challenge_entries_update_policy" ON public.friend_challenge_entries;
CREATE POLICY "friend_challenge_entries_update_policy" ON public.friend_challenge_entries
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friend_challenges c
    WHERE c.id = friend_challenge_entries.challenge_id
      AND (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
  )
)
WITH CHECK (
  -- Other participant disputing
  (user_id <> auth.uid() AND disputed = true)
  -- Owner resolving dispute by attaching proof
  OR (user_id = auth.uid() AND proof_path IS NOT NULL)
);

-- friend_challenge_entries DELETE: owner deletes within 10 minutes (trigger validates time)
DROP POLICY IF EXISTS "friend_challenge_entries_delete_policy" ON public.friend_challenge_entries;
CREATE POLICY "friend_challenge_entries_delete_policy" ON public.friend_challenge_entries
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Disputes table policies
DROP POLICY IF EXISTS "disputes_select_policy" ON public.friend_challenge_disputes;
CREATE POLICY "disputes_select_policy" ON public.friend_challenge_disputes
FOR SELECT TO authenticated
USING (
  disputer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.friend_challenges c
    WHERE c.id = challenge_id AND (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "disputes_insert_policy" ON public.friend_challenge_disputes;
CREATE POLICY "disputes_insert_policy" ON public.friend_challenge_disputes
FOR INSERT TO authenticated
WITH CHECK (disputer_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 10. Storage Bucket & Policies: "proof" / "proofs" (Private, max 20 MB, mp4/mov)
-- Supports both singular 'proof' and plural 'proofs' naming
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('proof', 'proof', false, 20971520, ARRAY['video/mp4', 'video/quicktime']),
  ('proofs', 'proofs', false, 20971520, ARRAY['video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime'];

-- Proofs upload policy: authenticated users can upload only into their own folder
DROP POLICY IF EXISTS "proofs_storage_upload_policy" ON storage.objects;
CREATE POLICY "proofs_storage_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('proof', 'proofs')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Proofs delete policy: users can delete only their own proof videos
DROP POLICY IF EXISTS "proofs_storage_delete_policy" ON storage.objects;
CREATE POLICY "proofs_storage_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('proof', 'proofs')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Proofs read policy: read only by the two participants of the challenge
DROP POLICY IF EXISTS "proofs_storage_select_policy" ON storage.objects;
CREATE POLICY "proofs_storage_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id IN ('proof', 'proofs')
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.friend_challenge_entries e
      JOIN public.friend_challenges c ON c.id = e.challenge_id
      WHERE e.proof_path = name
        AND (c.creator_id = auth.uid() OR c.opponent_id = auth.uid())
    )
  )
);

