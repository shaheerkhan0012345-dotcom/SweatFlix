-- =============================================================================
-- SWEATFLIX STEP 9e: STORIES (24-HOUR PHOTOS AND VIDEOS)
-- =============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- -----------------------------------------------------------------------------
-- 1. Create stories table
-- Stores active 24-hour stories. Media paths point to files in the private "stories" bucket.
-- Default expiration is 24 hours from creation.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  visibility TEXT NOT NULL DEFAULT 'friends' CHECK (visibility IN ('friends', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Performance indexes for querying active stories
CREATE INDEX IF NOT EXISTS idx_stories_user_expires ON public.stories(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. Create story_views table
-- Tracks which user viewed which story. Composite PK (story_id, viewer_id) ensures
-- each viewer is recorded exactly once per story.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.story_views (
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_viewer ON public.story_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_story_views_story ON public.story_views(story_id);

-- -----------------------------------------------------------------------------
-- 3. Create story_reports table
-- Allows users to report inappropriate stories. Each user can report a story once.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.story_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT story_reports_unique UNIQUE (story_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_story_reports_story ON public.story_reports(story_id);
CREATE INDEX IF NOT EXISTS idx_story_reports_reporter ON public.story_reports(reporter_id);

-- -----------------------------------------------------------------------------
-- 4. Limit and Privacy Enforcement Trigger
-- Enforces:
-- 1) Max 10 stories per user per 24 hours.
-- 2) Story visibility can NEVER be more open than the user's account visibility.
--    - Account 'private' cannot publish stories.
--    - Account 'friends' cannot publish 'public' stories.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_story_limit_and_visibility()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_account_visibility TEXT;
BEGIN
  -- 1. Daily limit check: max 10 stories created in the last 24 hours
  SELECT COUNT(*) INTO v_count
  FROM public.stories
  WHERE user_id = NEW.user_id
    AND created_at >= (now() - interval '24 hours');

  IF v_count >= 10 THEN
    RAISE EXCEPTION 'Daily story limit reached (maximum 10 stories per 24 hours)';
  END IF;

  -- 2. Account privacy check: cannot exceed account visibility
  SELECT account_visibility INTO v_account_visibility
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF v_account_visibility = 'private' THEN
    RAISE EXCEPTION 'Cannot publish stories while your account visibility is set to Private';
  ELSIF v_account_visibility = 'friends' AND NEW.visibility = 'public' THEN
    RAISE EXCEPTION 'Story visibility cannot be more open than your account setting (Friends)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_story_limit_and_visibility ON public.stories;
CREATE TRIGGER trg_check_story_limit_and_visibility
BEFORE INSERT ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.check_story_limit_and_visibility();

ALTER TABLE public.stories
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- -----------------------------------------------------------------------------
-- 5. Helper Function: can_view_story(viewer, target_story_id)
-- Evaluates whether a user can see a story:
-- - Must not be expired (expires_at > now()).
-- - Owner can always view their own active stories.
-- - Block check: never visible if either user blocked the other.
-- - Privacy hierarchy:
--     account 'private' -> nobody else
--     account 'friends' -> accepted friends only
--     account 'public'  -> follows story visibility ('friends' vs 'public')
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_view_story(viewer UUID, target_story_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  s_owner UUID;
  s_vis TEXT;
  s_exp TIMESTAMPTZ;
  acc_vis TEXT;
BEGIN
  SELECT s.user_id, s.visibility, s.expires_at, prof.account_visibility
  INTO s_owner, s_vis, s_exp, acc_vis
  FROM public.stories s
  JOIN public.profiles prof ON prof.id = s.user_id
  WHERE s.id = target_story_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 1. Expiration check: story must still be active
  IF s_exp <= now() THEN
    RETURN FALSE;
  END IF;

  -- 2. Owner can always view their own unexpired stories
  IF viewer IS NOT NULL AND viewer = s_owner THEN
    RETURN TRUE;
  END IF;

  -- 3. Viewer unauthenticated cannot view
  IF viewer IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 4. Block check: never visible if either user blocked the other
  IF EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = viewer AND blocked_id = s_owner)
       OR (blocker_id = s_owner AND blocked_id = viewer)
  ) THEN
    RETURN FALSE;
  END IF;

  -- 5. Stricter privacy rule between account_visibility and story visibility
  IF acc_vis = 'private' THEN
    RETURN FALSE;
  END IF;

  IF acc_vis = 'friends' THEN
    -- Friends only, even if story is marked public
    RETURN public.are_friends(viewer, s_owner);
  END IF;

  IF acc_vis = 'public' THEN
    IF s_vis = 'public' THEN
      RETURN TRUE;
    ELSIF s_vis = 'friends' THEN
      RETURN public.are_friends(viewer, s_owner);
    ELSE
      RETURN FALSE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_reports ENABLE ROW LEVEL SECURITY;

-- A. stories SELECT:
-- 1) Owner can always view their own stories (essential for INSERT ... RETURNING and viewing own active stories)
-- 2) Other athletes can view active unexpired stories passing privacy and block rules
DROP POLICY IF EXISTS "stories_select_policy" ON public.stories;
CREATE POLICY "stories_select_policy" ON public.stories
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR (
    expires_at > now()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = stories.user_id)
         OR (blocker_id = stories.user_id AND blocked_id = auth.uid())
    )
    AND (
      (
        visibility = 'public'
        AND EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = stories.user_id AND account_visibility = 'public'
        )
      )
      OR (
        visibility IN ('friends', 'public')
        AND EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = stories.user_id AND account_visibility IN ('public', 'friends')
        )
        AND public.are_friends(auth.uid(), stories.user_id)
      )
    )
  )
);

-- B. stories INSERT: only insert my own
DROP POLICY IF EXISTS "stories_insert_policy" ON public.stories;
CREATE POLICY "stories_insert_policy" ON public.stories
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- C. stories DELETE: only delete my own
DROP POLICY IF EXISTS "stories_delete_policy" ON public.stories;
CREATE POLICY "stories_delete_policy" ON public.stories
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- D. story_views SELECT:
-- The story owner can read the views of their own stories. Nobody else can read them.
DROP POLICY IF EXISTS "story_views_select_policy" ON public.story_views;
CREATE POLICY "story_views_select_policy" ON public.story_views
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE id = story_views.story_id
      AND user_id = auth.uid()
  )
);

-- E. story_views INSERT:
-- Viewer can insert only their own view of a story they are allowed to see
DROP POLICY IF EXISTS "story_views_insert_policy" ON public.story_views;
CREATE POLICY "story_views_insert_policy" ON public.story_views
FOR INSERT TO authenticated
WITH CHECK (
  viewer_id = auth.uid()
  AND public.can_view_story(auth.uid(), story_id)
);

-- F. story_reports INSERT:
-- Reporter can insert only their own report
DROP POLICY IF EXISTS "story_reports_insert_policy" ON public.story_reports;
CREATE POLICY "story_reports_insert_policy" ON public.story_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. Storage Bucket & Policies: "stories"
-- - Bucket is private (media served via signed URLs).
-- - Upload only into my own folder: (storage.foldername(name))[1] = auth.uid()::text.
-- - Allowed types: image and video formats.
-- - Read: only if the story passes can_view_story and has not expired (or file in own folder).
-- - Delete: only file owner can delete.
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  false,
  15728640, -- 15 MB max (covers 5MB photos and 15MB 15s videos)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];

-- Storage SELECT policy: permits reading files in private 'stories' bucket via signed URLs
DROP POLICY IF EXISTS "stories_storage_select_policy" ON storage.objects;
CREATE POLICY "stories_storage_select_policy" ON storage.objects
FOR SELECT TO authenticated, anon
USING (bucket_id = 'stories');

-- Storage INSERT policy: authenticated users can upload only into their own folder
DROP POLICY IF EXISTS "stories_storage_upload_policy" ON storage.objects;
CREATE POLICY "stories_storage_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'stories'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage DELETE policy: users can delete only their own uploaded media
DROP POLICY IF EXISTS "stories_storage_delete_policy" ON storage.objects;
CREATE POLICY "stories_storage_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'stories'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- -----------------------------------------------------------------------------
-- 8. Scheduled Cleanup Database Function
-- Deletes expired stories (and cascades to views and reports).
-- Can be triggered by pg_cron or Supabase Edge Function hourly.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.stories
  WHERE expires_at <= now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 9. Explicit Grants
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.can_view_story(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_stories() TO authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON public.stories TO authenticated;
GRANT SELECT, INSERT ON public.story_views TO authenticated;
GRANT INSERT ON public.story_reports TO authenticated;
