-- =============================================================================
-- SWEATFLIX STEP 9: COMMUNITY FEED SCHEMA & POLICIES
-- =============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- 1. Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_path TEXT NOT NULL,
  caption TEXT CHECK (char_length(caption) <= 300),
  workout_name TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for newest-first feed querying and author queries
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- 2. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Trigger: keep posts.likes_count in sync on like insert / delete
CREATE OR REPLACE FUNCTION public.sync_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_post_likes ON public.post_likes;
CREATE TRIGGER trg_sync_post_likes
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.sync_post_likes_count();

-- 3. Create post_reports table
CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_reports_reporter ON public.post_reports(reporter_id);

-- 4. Create user_blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

-- 5. Rate limiting: max 10 posts per user per day
CREATE OR REPLACE FUNCTION public.check_daily_post_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  daily_post_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO daily_post_count
  FROM public.posts
  WHERE user_id = NEW.user_id
    AND created_at >= (NOW() - INTERVAL '24 hours');

  IF daily_post_count >= 10 THEN
    RAISE EXCEPTION 'Daily limit reached: You can share up to 10 workout posts per day. Please try again tomorrow.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_post_rate_limit ON public.posts;
CREATE TRIGGER trg_check_post_rate_limit
BEFORE INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.check_daily_post_rate_limit();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- posts policies
-- -----------------------------------------------------------------------------

-- posts SELECT: my own posts, or posts with visibility 'public' from users who have not blocked me and whom I have not blocked
DROP POLICY IF EXISTS "posts_select_policy" ON public.posts;
CREATE POLICY "posts_select_policy" ON public.posts
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR (
    visibility = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = posts.user_id)
         OR (blocker_id = posts.user_id AND blocked_id = auth.uid())
    )
  )
);

-- posts INSERT: only on my own posts
DROP POLICY IF EXISTS "posts_insert_policy" ON public.posts;
CREATE POLICY "posts_insert_policy" ON public.posts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- posts UPDATE: only on my own posts
DROP POLICY IF EXISTS "posts_update_policy" ON public.posts;
CREATE POLICY "posts_update_policy" ON public.posts
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- posts DELETE: only on my own posts
DROP POLICY IF EXISTS "posts_delete_policy" ON public.posts;
CREATE POLICY "posts_delete_policy" ON public.posts
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- post_likes policies
-- -----------------------------------------------------------------------------

-- post_likes SELECT: visible on posts I can see
DROP POLICY IF EXISTS "post_likes_select_policy" ON public.post_likes;
CREATE POLICY "post_likes_select_policy" ON public.post_likes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts WHERE id = post_likes.post_id
  )
);

-- post_likes INSERT: insert only my own likes, and only on posts I can see
DROP POLICY IF EXISTS "post_likes_insert_policy" ON public.post_likes;
CREATE POLICY "post_likes_insert_policy" ON public.post_likes
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.posts WHERE id = post_likes.post_id
  )
);

-- post_likes DELETE: delete only my own likes
DROP POLICY IF EXISTS "post_likes_delete_policy" ON public.post_likes;
CREATE POLICY "post_likes_delete_policy" ON public.post_likes
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- post_reports policies
-- -----------------------------------------------------------------------------

-- post_reports INSERT: insert only, nobody can read them from the app
DROP POLICY IF EXISTS "post_reports_insert_policy" ON public.post_reports;
CREATE POLICY "post_reports_insert_policy" ON public.post_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- -----------------------------------------------------------------------------
-- user_blocks policies
-- -----------------------------------------------------------------------------

-- user_blocks SELECT: read only my own rows
DROP POLICY IF EXISTS "user_blocks_select_policy" ON public.user_blocks;
CREATE POLICY "user_blocks_select_policy" ON public.user_blocks
FOR SELECT TO authenticated
USING (blocker_id = auth.uid());

-- user_blocks INSERT: insert only my own rows
DROP POLICY IF EXISTS "user_blocks_insert_policy" ON public.user_blocks;
CREATE POLICY "user_blocks_insert_policy" ON public.user_blocks
FOR INSERT TO authenticated
WITH CHECK (blocker_id = auth.uid());

-- user_blocks DELETE: delete only my own rows
DROP POLICY IF EXISTS "user_blocks_delete_policy" ON public.user_blocks;
CREATE POLICY "user_blocks_delete_policy" ON public.user_blocks
FOR DELETE TO authenticated
USING (blocker_id = auth.uid());

-- =============================================================================
-- STORAGE BUCKET: posts (PRIVATE)
-- =============================================================================

-- Create the private 'posts' bucket if not already existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  false,
  5242880, -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage upload policy: logged-in users can upload only into their own folder, max 5MB
DROP POLICY IF EXISTS "posts_storage_upload_policy" ON storage.objects;
CREATE POLICY "posts_storage_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage delete policy: users can delete only their own files
DROP POLICY IF EXISTS "posts_storage_delete_policy" ON storage.objects;
CREATE POLICY "posts_storage_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage read policy: file can be read only if it is in my own folder or belongs to a post I am allowed to see
DROP POLICY IF EXISTS "posts_storage_select_policy" ON storage.objects;
CREATE POLICY "posts_storage_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'posts'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.posts WHERE image_path = name
    )
  )
);
