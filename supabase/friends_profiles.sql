-- =============================================================================
-- SWEATFLIX STEP 9b: USERNAME, PROFILES, PRIVACY & FRIEND REQUESTS SCHEMA
-- =============================================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- 0. Ensure prerequisite community tables exist if run standalone
CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

DROP POLICY IF EXISTS "user_blocks_select_policy" ON public.user_blocks;
CREATE POLICY "user_blocks_select_policy" ON public.user_blocks
FOR SELECT TO authenticated
USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "user_blocks_insert_policy" ON public.user_blocks;
CREATE POLICY "user_blocks_insert_policy" ON public.user_blocks
FOR INSERT TO authenticated
WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "user_blocks_delete_policy" ON public.user_blocks;
CREATE POLICY "user_blocks_delete_policy" ON public.user_blocks
FOR DELETE TO authenticated
USING (blocker_id = auth.uid());

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
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 1. Extend profiles table with username, bio, avatar_url, account_visibility
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS account_visibility TEXT NOT NULL DEFAULT 'public';

-- Add constraints on profiles if they do not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_format_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_username_format_check
    CHECK (
      username IS NULL OR (
        char_length(username) >= 3 
        AND char_length(username) <= 20 
        AND username ~ '^[a-z0-9_.]+$'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_bio_length_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_bio_length_check
    CHECK (bio IS NULL OR char_length(bio) <= 150);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_visibility_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_account_visibility_check
    CHECK (account_visibility IN ('public', 'friends', 'private'));
  END IF;
END $$;

-- Case-insensitive lookup index for usernames
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(lower(username));

-- 2. Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT friendships_no_self_friend CHECK (requester_id <> addressee_id)
);

-- Ensure only one friendship row per pair of users, regardless of direction
CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_unique_pair
ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- 3. Rate limiting: max 30 pending sent requests per user
CREATE OR REPLACE FUNCTION public.check_max_pending_friend_requests()
RETURNS TRIGGER AS $$
DECLARE
  pending_count INT;
BEGIN
  SELECT COUNT(*) INTO pending_count
  FROM public.friendships
  WHERE requester_id = NEW.requester_id AND status = 'pending';

  IF pending_count >= 30 THEN
    RAISE EXCEPTION 'You have reached the maximum limit of 30 pending friend requests.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_max_pending_friend_requests ON public.friendships;
CREATE TRIGGER trg_check_max_pending_friend_requests
BEFORE INSERT ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.check_max_pending_friend_requests();

-- 4. Block check: A blocked user cannot send a friend request
CREATE OR REPLACE FUNCTION public.check_friendship_blocked()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = NEW.requester_id AND blocked_id = NEW.addressee_id)
       OR (blocker_id = NEW.addressee_id AND blocked_id = NEW.requester_id)
  ) THEN
    RAISE EXCEPTION 'Cannot send a friend request to this user.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_friendship_blocked ON public.friendships;
CREATE TRIGGER trg_check_friendship_blocked
BEFORE INSERT ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.check_friendship_blocked();

-- 5. Trigger: Blocking someone automatically removes any existing friendship or pending request
CREATE OR REPLACE FUNCTION public.on_user_block_delete_friendship()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.friendships
  WHERE (requester_id = NEW.blocker_id AND addressee_id = NEW.blocked_id)
     OR (requester_id = NEW.blocked_id AND addressee_id = NEW.blocker_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_user_block_delete_friendship ON public.user_blocks;
CREATE TRIGGER trg_on_user_block_delete_friendship
AFTER INSERT ON public.user_blocks
FOR EACH ROW
EXECUTE FUNCTION public.on_user_block_delete_friendship();

-- =============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================================================

-- Helper function: are_friends(a, b) returns true if an accepted friendship exists
CREATE OR REPLACE FUNCTION public.are_friends(a UUID, b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF a IS NULL OR b IS NULL OR a = b THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = a AND addressee_id = b)
        OR (requester_id = b AND addressee_id = a))
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function: can_view_post(viewer, post_id)
-- Owner always sees their own posts. Otherwise stricter rule between account and post visibility wins.
-- Never visible if either user has blocked the other.
CREATE OR REPLACE FUNCTION public.can_view_post(viewer UUID, target_post_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  p_owner UUID;
  p_vis TEXT;
  acc_vis TEXT;
BEGIN
  SELECT p.user_id, p.visibility, prof.account_visibility
  INTO p_owner, p_vis, acc_vis
  FROM public.posts p
  JOIN public.profiles prof ON prof.id = p.user_id
  WHERE p.id = target_post_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 1. Owner can always see their own posts
  IF viewer IS NOT NULL AND viewer = p_owner THEN
    RETURN TRUE;
  END IF;

  -- 2. If viewer is unauthenticated, cannot view non-public posts or accounts
  IF viewer IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 3. Block check: never visible if either user blocked the other
  IF EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = viewer AND blocked_id = p_owner)
       OR (blocker_id = p_owner AND blocked_id = viewer)
  ) THEN
    RETURN FALSE;
  END IF;

  -- 4. Stricter rule between account_visibility and post visibility wins:
  -- Account 'private' -> nobody else sees it
  IF acc_vis = 'private' THEN
    RETURN FALSE;
  END IF;

  -- Account 'friends' -> friends only, even if post is marked 'public'
  IF acc_vis = 'friends' THEN
    IF p_vis = 'private' THEN
      RETURN FALSE;
    END IF;
    RETURN public.are_friends(viewer, p_owner);
  END IF;

  -- Account 'public' -> follow post's own visibility
  IF acc_vis = 'public' THEN
    IF p_vis = 'public' THEN
      RETURN TRUE;
    ELSIF p_vis = 'friends' THEN
      RETURN public.are_friends(viewer, p_owner);
    ELSE
      RETURN FALSE; -- post is 'private' (only me)
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function: can_view_profile(viewer, profile_id)
-- Determines if viewer can see profile details & post grid
CREATE OR REPLACE FUNCTION public.can_view_profile(viewer UUID, target_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  acc_vis TEXT;
BEGIN
  IF viewer IS NOT NULL AND viewer = target_profile_id THEN
    RETURN TRUE;
  END IF;

  IF viewer IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Block check
  IF EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = viewer AND blocked_id = target_profile_id)
       OR (blocker_id = target_profile_id AND blocked_id = viewer)
  ) THEN
    RETURN FALSE;
  END IF;

  SELECT account_visibility INTO acc_vis
  FROM public.profiles
  WHERE id = target_profile_id;

  IF acc_vis = 'private' THEN
    RETURN FALSE;
  ELSIF acc_vis = 'friends' THEN
    RETURN public.are_friends(viewer, target_profile_id);
  ELSE
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Ensure a post's visibility can never be set more open than the account's visibility
CREATE OR REPLACE FUNCTION public.check_post_visibility_matches_account()
RETURNS TRIGGER AS $$
DECLARE
  acc_vis TEXT;
BEGIN
  SELECT account_visibility INTO acc_vis
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF acc_vis = 'private' AND NEW.visibility <> 'private' THEN
    NEW.visibility := 'private';
  ELSIF acc_vis = 'friends' AND NEW.visibility = 'public' THEN
    NEW.visibility := 'friends';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_post_visibility_matches_account ON public.posts;
CREATE TRIGGER trg_check_post_visibility_matches_account
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.check_post_visibility_matches_account();

-- =============================================================================
-- PUBLIC PROFILES VIEW (Safe, never exposes email, weight, age, height)
-- =============================================================================

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  p.id,
  p.name,
  p.username,
  p.avatar_url,
  p.bio,
  p.account_visibility,
  COALESCE(posts_count.cnt, 0)::BIGINT AS posts_count,
  COALESCE(friends_count.cnt, 0)::BIGINT AS friends_count
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) AS cnt
  FROM public.posts
  GROUP BY user_id
) posts_count ON posts_count.user_id = p.id
LEFT JOIN (
  SELECT uid, COUNT(*) AS cnt
  FROM (
    SELECT requester_id AS uid FROM public.friendships WHERE status = 'accepted'
    UNION ALL
    SELECT addressee_id AS uid FROM public.friendships WHERE status = 'accepted'
  ) all_friends
  GROUP BY uid
) friends_count ON friends_count.uid = p.id;

-- Grant select on public_profiles view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- posts RLS: replaced with can_view_post()
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "posts_select_policy" ON public.posts;
CREATE POLICY "posts_select_policy" ON public.posts
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.can_view_post(auth.uid(), id)
);

-- posts INSERT: users can insert only their own posts
DROP POLICY IF EXISTS "posts_insert_policy" ON public.posts;
CREATE POLICY "posts_insert_policy" ON public.posts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- posts UPDATE: users can update only their own posts
DROP POLICY IF EXISTS "posts_update_policy" ON public.posts;
CREATE POLICY "posts_update_policy" ON public.posts
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- posts DELETE: users can delete only their own posts
DROP POLICY IF EXISTS "posts_delete_policy" ON public.posts;
CREATE POLICY "posts_delete_policy" ON public.posts
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- post_likes RLS: only on posts the user can view
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "post_likes_select_policy" ON public.post_likes;
CREATE POLICY "post_likes_select_policy" ON public.post_likes
FOR SELECT TO authenticated
USING (public.can_view_post(auth.uid(), post_id));

DROP POLICY IF EXISTS "post_likes_insert_policy" ON public.post_likes;
CREATE POLICY "post_likes_insert_policy" ON public.post_likes
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND public.can_view_post(auth.uid(), post_id)
);

DROP POLICY IF EXISTS "post_likes_delete_policy" ON public.post_likes;
CREATE POLICY "post_likes_delete_policy" ON public.post_likes
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Likes count sync trigger
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

-- -----------------------------------------------------------------------------
-- friendships RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Read: user reads rows where they are requester or addressee
DROP POLICY IF EXISTS "friendships_select_policy" ON public.friendships;
CREATE POLICY "friendships_select_policy" ON public.friendships
FOR SELECT TO authenticated
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Insert: user inserts only as requester
DROP POLICY IF EXISTS "friendships_insert_policy" ON public.friendships;
CREATE POLICY "friendships_insert_policy" ON public.friendships
FOR INSERT TO authenticated
WITH CHECK (requester_id = auth.uid());

-- Update: only the addressee can accept a pending request
DROP POLICY IF EXISTS "friendships_update_policy" ON public.friendships;
CREATE POLICY "friendships_update_policy" ON public.friendships
FOR UPDATE TO authenticated
USING (addressee_id = auth.uid())
WITH CHECK (addressee_id = auth.uid() AND status = 'accepted');

-- Delete: either side can delete (decline, cancel, or unfriend)
DROP POLICY IF EXISTS "friendships_delete_policy" ON public.friendships;
CREATE POLICY "friendships_delete_policy" ON public.friendships
FOR DELETE TO authenticated
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- -----------------------------------------------------------------------------
-- profiles RLS: read profiles for discovery & username checks, update own row
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND is_premium = (SELECT is_premium FROM public.profiles WHERE id = auth.uid())
  AND ads_removed = (SELECT ads_removed FROM public.profiles WHERE id = auth.uid())
);

-- =============================================================================
-- STORAGE BUCKETS AND POLICIES
-- =============================================================================

-- 1. Ensure private "posts" bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  false,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Update private "posts" bucket read policy: permits reading files in private 'posts' bucket via signed URLs
DROP POLICY IF EXISTS "posts_storage_select_policy" ON storage.objects;
CREATE POLICY "posts_storage_select_policy" ON storage.objects
FOR SELECT TO authenticated, anon
USING (bucket_id = 'posts');

-- Posts storage upload policy: authenticated user can upload only into their own folder
DROP POLICY IF EXISTS "posts_storage_upload_policy" ON storage.objects;
CREATE POLICY "posts_storage_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Posts storage delete policy: users can delete only their own files
DROP POLICY IF EXISTS "posts_storage_delete_policy" ON storage.objects;
CREATE POLICY "posts_storage_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Avatars bucket: public read, upload only into own folder, images only, max 2 MB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Avatars public read policy
DROP POLICY IF EXISTS "avatars_storage_select_policy" ON storage.objects;
CREATE POLICY "avatars_storage_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Avatars insert policy: authenticated user can upload only into their own folder
DROP POLICY IF EXISTS "avatars_storage_insert_policy" ON storage.objects;
CREATE POLICY "avatars_storage_insert_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars delete policy: users can delete only their own avatar files
DROP POLICY IF EXISTS "avatars_storage_delete_policy" ON storage.objects;
CREATE POLICY "avatars_storage_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
