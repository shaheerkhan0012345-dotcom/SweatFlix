import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fileUriToArrayBuffer } from '../lib/storageUpload';

export type PostVisibility = 'public' | 'friends' | 'private';

export interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  author_username?: string | null;
  author_avatar_url?: string | null;
  author_initial: string;
  author_color: string;
  image_path: string;
  image_url: string;
  caption: string | null;
  workout_name: string | null;
  visibility: PostVisibility;
  likes_count: number;
  is_liked: boolean;
  author_tier?: string | null;
  author_champion?: boolean | null;
  created_at: string;
}

export interface BlockedUser {
  blocked_id: string;
  name: string;
  created_at: string;
}

// In-memory cache for signed URLs to minimize Supabase Storage API requests
// Format: Map<imagePath, { url: string, expiresAt: number }>
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

const STORAGE_KEYS = {
  CACHED_POSTS: '@sweatflix_community_cached_posts',
  REPORTED_POSTS: '@sweatflix_reported_posts_set',
  BLOCKED_USERS: '@sweatflix_blocked_users_set',
  RULES_ACCEPTED: '@sweatflix_community_rules_accepted',
};

// Author avatar colors for initials
const AVATAR_COLORS = [
  '#E5252A',
  '#FF8A1F',
  '#6366F1',
  '#10B981',
  '#8B5CF6',
  '#0EA5E9',
  '#F59E0B',
  '#EC4899',
];

export function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

// Seed / Initial community demo posts for offline testing or brand new database
const DEMO_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'demo-post-1',
    user_id: 'athlete-alex-01',
    author_name: 'Alex Vance',
    author_username: 'alex_vance',
    author_avatar_url: null,
    author_initial: 'A',
    author_color: '#E5252A',
    image_path: 'demo/chest_session.jpg',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=70',
    caption: 'Hit a new PR on incline dumbbell press today! Feeling stronger every week. 🔥💪',
    workout_name: 'Chest & Triceps Blast',
    visibility: 'public',
    likes_count: 24,
    is_liked: false,
    author_tier: 'Gold',
    author_champion: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-post-2',
    user_id: 'athlete-sarah-02',
    author_name: 'Sarah Connor',
    author_username: 'sarah_fit',
    author_avatar_url: null,
    author_initial: 'S',
    author_color: '#FF8A1F',
    image_path: 'demo/morning_run.jpg',
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=70',
    caption: '5:30 AM sunrise workout done! Consistency is the only secret that truly works.',
    workout_name: 'Core Crusher 3D',
    visibility: 'public',
    likes_count: 38,
    is_liked: true,
    author_tier: 'Diamond',
    author_champion: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-post-3',
    user_id: 'athlete-marcus-03',
    author_name: 'Marcus Brody',
    author_username: 'marcus_gains',
    author_avatar_url: null,
    author_initial: 'M',
    author_color: '#10B981',
    image_path: 'demo/back_session.jpg',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=70',
    caption: 'Heavy back day finished with strict cable face pulls. Form over weight always!',
    workout_name: 'Back & Bicep Power',
    visibility: 'public',
    likes_count: 19,
    is_liked: false,
    author_tier: 'Silver',
    author_champion: false,
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
];

export const communityService = {
  /**
   * Check whether user has accepted the community guidelines once
   */
  async hasAcceptedRules(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.RULES_ACCEPTED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Save acceptance of community rules
   */
  async acceptRules(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RULES_ACCEPTED, 'true');
    } catch {}
  },

  /**
   * Get reported post IDs for current user (local blacklist filter)
   */
  async getReportedPostIds(): Promise<Set<string>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.REPORTED_POSTS);
      if (!raw) return new Set<string>();
      return new Set<string>(JSON.parse(raw));
    } catch {
      return new Set<string>();
    }
  },

  /**
   * Get blocked user IDs for current user (local blacklist filter)
   */
  async getBlockedUserIds(): Promise<Set<string>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
      if (!raw) return new Set<string>();
      return new Set<string>(JSON.parse(raw));
    } catch {
      return new Set<string>();
    }
  },

  /**
   * Resolve signed URLs for a list of image paths
   * Uses in-memory caching (1 hour validity, refreshes within 5 minutes of expiry)
   */
  async resolveSignedUrls(imagePaths: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const pathsToFetch: string[] = [];
    const now = Date.now();

    for (const path of imagePaths) {
      if (!path) continue;
      // If path is already a full remote HTTP URL (e.g. demo posts), use directly
      if (path.startsWith('http://') || path.startsWith('https://')) {
        result[path] = path;
        continue;
      }

      const cached = signedUrlCache.get(path);
      // Valid if still has more than 5 minutes remaining
      if (cached && now < cached.expiresAt - 5 * 60 * 1000) {
        result[path] = cached.url;
      } else {
        pathsToFetch.push(path);
      }
    }

    if (pathsToFetch.length > 0 && isSupabaseConfigured) {
      await Promise.all(
        pathsToFetch.map(async (path) => {
          try {
            const { data, error } = await supabase.storage
              .from('posts')
              .createSignedUrl(path, 3600);

            const resolvedUrl = data?.signedUrl || (data as any)?.signedURL;
            if (!error && resolvedUrl) {
              signedUrlCache.set(path, {
                url: resolvedUrl,
                expiresAt: now + 3600 * 1000,
              });
              result[path] = resolvedUrl;
            } else {
              // Fallback to public URL
              const { data: pubData } = supabase.storage
                .from('posts')
                .getPublicUrl(path);
              if (pubData?.publicUrl) {
                result[path] = pubData.publicUrl;
              }
            }
          } catch (err) {
            console.warn('Failed to generate signed URL for post path:', path, err);
            const { data: pubData } = supabase.storage.from('posts').getPublicUrl(path);
            if (pubData?.publicUrl) {
              result[path] = pubData.publicUrl;
            }
          }
        })
      );
    }

    return result;
  },

  /**
   * Fetch newest community posts (10 at a time with pagination)
   */
  async getPosts({
    limit = 10,
    offset = 0,
    currentUserId,
    filter = 'all',
  }: {
    limit?: number;
    offset?: number;
    currentUserId?: string | null;
    filter?: 'all' | 'friends';
  }): Promise<CommunityPost[]> {
    const reportedIds = await this.getReportedPostIds();
    const blockedIds = await this.getBlockedUserIds();

    if (!isSupabaseConfigured) {
      // Offline / Local mock mode
      const filtered = DEMO_COMMUNITY_POSTS.filter(
        (p) => !reportedIds.has(p.id) && !blockedIds.has(p.user_id)
      );
      return filtered.slice(offset, offset + limit);
    }

    try {
      // Determine friend IDs if filter is 'friends'
      let friendUserIds: string[] | null = null;
      if (filter === 'friends' && currentUserId) {
        const { data: friendRows } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

        const set = new Set<string>();
        set.add(currentUserId);
        if (friendRows) {
          friendRows.forEach((r) => {
            set.add(r.requester_id === currentUserId ? r.addressee_id : r.requester_id);
          });
        }
        friendUserIds = Array.from(set);
      }

      // 1. Query posts table joining author name, username, avatar_url
      let query = supabase
        .from('posts')
        .select(`
          id,
          user_id,
          image_path,
          caption,
          workout_name,
          visibility,
          likes_count,
          created_at,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'friends' && friendUserIds) {
        query = query.in('user_id', friendUserIds);
      }

      const { data: postsData, error: postsError } = await query
        .range(offset, offset + limit - 1);

      if (postsError) {
        throw new Error(postsError.message);
      }

      if (!postsData || postsData.length === 0) {
        if (offset === 0 && filter === 'all') {
          // If fresh database has no user posts yet, provide the initial community posts
          const fallback = DEMO_COMMUNITY_POSTS.filter(
            (p) => !reportedIds.has(p.id) && !blockedIds.has(p.user_id)
          );
          return fallback;
        }
        return [];
      }

      // 2. Fetch current user's liked posts for this batch
      const postIds = postsData.map((p) => p.id);
      const userLikedSet = new Set<string>();

      if (currentUserId && postIds.length > 0) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', postIds);

        if (likesData) {
          likesData.forEach((l) => userLikedSet.add(l.post_id));
        }
      }

      // 3. Resolve signed URLs for private images
      const imagePaths = postsData.map((p) => p.image_path);
      const signedUrls = await this.resolveSignedUrls(imagePaths);

      // 4. Map to clean CommunityPost objects
      const mappedPosts: CommunityPost[] = postsData
        .filter((p) => !reportedIds.has(p.id) && !blockedIds.has(p.user_id))
        .map((p: any) => {
          const authorName = p.profiles?.name || 'Athlete';
          const authorInitial = authorName.charAt(0).toUpperCase() || 'A';
          const authorColor = getAvatarColor(p.user_id || 'default');
          const signedUrl = signedUrls[p.image_path] || p.image_path;

          return {
            id: p.id,
            user_id: p.user_id,
            author_name: authorName,
            author_username: p.profiles?.username || null,
            author_avatar_url: p.profiles?.avatar_url || null,
            author_initial: authorInitial,
            author_color: authorColor,
            image_path: p.image_path,
            image_url: signedUrl,
            caption: p.caption,
            workout_name: p.workout_name,
            visibility: p.visibility as PostVisibility,
            likes_count: p.likes_count || 0,
            is_liked: userLikedSet.has(p.id),
            author_tier: p.profiles?.league_tier || 'Bronze',
            author_champion: Boolean(p.profiles?.is_weekly_champion),
            created_at: p.created_at,
          };
        });

      // Cache the first page for offline viewing
      if (offset === 0 && filter === 'all') {
        AsyncStorage.setItem(STORAGE_KEYS.CACHED_POSTS, JSON.stringify(mappedPosts)).catch(() => {});
      }

      return mappedPosts;
    } catch (err: any) {
      console.warn('Error fetching community posts from Supabase:', err?.message);
      // Fallback to local cache if network/supabase fails
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_POSTS);
        if (cached) {
          const parsed = JSON.parse(cached) as CommunityPost[];
          return parsed.filter((p) => !reportedIds.has(p.id) && !blockedIds.has(p.user_id));
        }
      } catch {}
      return DEMO_COMMUNITY_POSTS.filter(
        (p) => !reportedIds.has(p.id) && !blockedIds.has(p.user_id)
      );
    }
  },

  /**
   * Fetch posts for a specific user profile (for 3-column square grid)
   */
  async getUserPosts({
    targetUserId,
    viewerId,
    limit = 21,
    offset = 0,
  }: {
    targetUserId: string;
    viewerId?: string | null;
    limit?: number;
    offset?: number;
  }): Promise<CommunityPost[]> {
    const reportedIds = await this.getReportedPostIds();
    const blockedIds = await this.getBlockedUserIds();

    if (!isSupabaseConfigured) {
      // Offline fallback: return demo posts matching targetUserId or default demo posts if viewer is self
      const matches = DEMO_COMMUNITY_POSTS.filter(
        (p) => (p.user_id === targetUserId || targetUserId === 'self') &&
               !reportedIds.has(p.id) && !blockedIds.has(p.user_id)
      );
      return matches.slice(offset, offset + limit);
    }

    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          image_path,
          caption,
          workout_name,
          visibility,
          likes_count,
          created_at,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postsError || !postsData) return [];

      const postIds = postsData.map((p) => p.id);
      const userLikedSet = new Set<string>();

      if (viewerId && postIds.length > 0) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', viewerId)
          .in('post_id', postIds);

        if (likesData) {
          likesData.forEach((l) => userLikedSet.add(l.post_id));
        }
      }

      const imagePaths = postsData.map((p) => p.image_path);
      const signedUrls = await this.resolveSignedUrls(imagePaths);

      return postsData
        .filter((p) => !reportedIds.has(p.id) && !blockedIds.has(p.user_id))
        .map((p: any) => {
          const authorName = p.profiles?.name || 'Athlete';
          const authorInitial = authorName.charAt(0).toUpperCase() || 'A';
          const authorColor = getAvatarColor(p.user_id || 'default');
          const signedUrl = signedUrls[p.image_path] || p.image_path;

          return {
            id: p.id,
            user_id: p.user_id,
            author_name: authorName,
            author_username: p.profiles?.username || null,
            author_avatar_url: p.profiles?.avatar_url || null,
            author_initial: authorInitial,
            author_color: authorColor,
            image_path: p.image_path,
            image_url: signedUrl,
            caption: p.caption,
            workout_name: p.workout_name,
            visibility: p.visibility as PostVisibility,
            likes_count: p.likes_count || 0,
            is_liked: userLikedSet.has(p.id),
            created_at: p.created_at,
          };
        });
    } catch (err: any) {
      console.warn('Error fetching user posts:', err?.message);
      return [];
    }
  },

  /**
   * Update visibility of an existing post
   */
  async updatePostVisibility(
    postId: string,
    userId: string,
    visibility: PostVisibility
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('posts')
      .update({ visibility })
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update post visibility: ${error.message}`);
    }
  },

  /**
   * Get single post detail by ID
   */
  async getPostDetail(
    postId: string,
    viewerId?: string | null
  ): Promise<CommunityPost | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);

    if (!isSupabaseConfigured || !isUuid) {
      const demo = DEMO_COMMUNITY_POSTS.find((p) => p.id === postId) || DEMO_COMMUNITY_POSTS[0];
      return demo || null;
    }

    try {
      const { data: p, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          image_path,
          caption,
          workout_name,
          visibility,
          likes_count,
          created_at,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .maybeSingle();

      if (error || !p) {
        const demo = DEMO_COMMUNITY_POSTS.find((dp) => dp.id === postId) || DEMO_COMMUNITY_POSTS[0];
        return demo || null;
      }

      let isLiked = false;
      if (viewerId) {
        const { data: likeRow } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', viewerId)
          .maybeSingle();
        isLiked = !!likeRow;
      }

      const signedUrls = await this.resolveSignedUrls([p.image_path]);
      const signedUrl = signedUrls[p.image_path] || p.image_path;
      const authorName = (p.profiles as any)?.name || 'Athlete';

      return {
        id: p.id,
        user_id: p.user_id,
        author_name: authorName,
        author_username: (p.profiles as any)?.username || null,
        author_avatar_url: (p.profiles as any)?.avatar_url || null,
        author_initial: authorName.charAt(0).toUpperCase() || 'A',
        author_color: getAvatarColor(p.user_id || 'default'),
        image_path: p.image_path,
        image_url: signedUrl,
        caption: p.caption,
        workout_name: p.workout_name,
        visibility: p.visibility as PostVisibility,
        likes_count: p.likes_count || 0,
        is_liked: isLiked,
        created_at: p.created_at,
      };
    } catch {
      return null;
    }
  },

  /**
   * Create a new workout post with photo upload
   */
  async createPost({
    userId,
    localImageUri,
    base64Data,
    caption,
    workoutName,
    visibility = 'public',
  }: {
    userId: string;
    localImageUri: string;
    base64Data?: string;
    caption?: string;
    workoutName?: string;
    visibility?: PostVisibility;
  }): Promise<CommunityPost> {
    if (!userId) {
      throw new Error('You must be signed in to share a workout post.');
    }

    if (!isSupabaseConfigured) {
      // Local fallback post creation
      const newPost: CommunityPost = {
        id: `local-${Date.now()}`,
        user_id: userId,
        author_name: 'You',
        author_initial: 'Y',
        author_color: '#E5252A',
        image_path: localImageUri,
        image_url: localImageUri,
        caption: caption?.trim() || null,
        workout_name: workoutName?.trim() || null,
        visibility,
        likes_count: 0,
        is_liked: false,
        created_at: new Date().toISOString(),
      };
      return newPost;
    }

    // 0. Ensure we use the active authenticated session's user ID
    const { data: authData } = await supabase.auth.getUser();
    const effectiveUserId = authData?.user?.id || userId;

    // 1. Generate unique file path: {user_id}/{uuid}.jpg
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const storageFilePath = `${effectiveUserId}/${fileId}.jpg`;

    // 2. Read local image as ArrayBuffer for binary upload (avoid 0-byte React Native fetch bug)
    const arrayBuffer = await fileUriToArrayBuffer(localImageUri, base64Data);

    // 3. Upload to private 'posts' bucket
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(storageFilePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message.includes('security policy') || uploadError.message.includes('row-level security')) {
        throw new Error('Storage permission error: Please ensure community.sql has been executed in your Supabase SQL editor.');
      }
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 4. Insert row into public.posts storing ONLY the file path
    const { data: postRow, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: effectiveUserId,
        image_path: storageFilePath,
        caption: caption?.trim() || null,
        workout_name: workoutName?.trim() || null,
        visibility,
      })
      .select('id, user_id, image_path, caption, workout_name, visibility, likes_count, created_at')
      .single();

    if (insertError) {
      // Cleanup uploaded image on DB insert failure
      await supabase.storage.from('posts').remove([storageFilePath]).catch(() => {});
      if (insertError.message.includes('Daily limit reached')) {
        throw new Error('Daily limit reached: You can share up to 10 workout posts per day. Please try again tomorrow.');
      }
      throw new Error(`Failed to create post: ${insertError.message}`);
    }

    // 5. Generate signed URL for immediate display
    const { data: signedData } = await supabase.storage
      .from('posts')
      .createSignedUrl(storageFilePath, 3600);

    const signedUrl = signedData?.signedUrl || localImageUri;
    signedUrlCache.set(storageFilePath, {
      url: signedUrl,
      expiresAt: Date.now() + 3600 * 1000,
    });

    return {
      id: postRow.id,
      user_id: postRow.user_id,
      author_name: 'You',
      author_initial: 'Y',
      author_color: '#E5252A',
      image_path: postRow.image_path,
      image_url: signedUrl,
      caption: postRow.caption,
      workout_name: postRow.workout_name,
      visibility: postRow.visibility as PostVisibility,
      likes_count: 0,
      is_liked: false,
      created_at: postRow.created_at,
    };
  },

  /**
   * Toggle like/unlike on a post
   * Optimistic update handled in UI; DB syncs likes_count via trigger
   */
  async toggleLike({
    postId,
    userId,
    currentlyLiked,
  }: {
    postId: string;
    userId: string;
    currentlyLiked: boolean;
  }): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;

    if (currentlyLiked) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });
      if (error) throw new Error(error.message);
    }
  },

  /**
   * Delete my own post and remove image from storage
   */
  async deletePost({
    postId,
    userId,
    imagePath,
  }: {
    postId: string;
    userId: string;
    imagePath: string;
  }): Promise<void> {
    if (!isSupabaseConfigured) return;

    // 1. Delete post row (triggers cascade delete of likes/reports)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Failed to delete post: ${deleteError.message}`);
    }

    // 2. Remove file from storage
    if (imagePath && !imagePath.startsWith('http')) {
      await supabase.storage.from('posts').remove([imagePath]).catch(() => {});
      signedUrlCache.delete(imagePath);
    }
  },

  /**
   * Report an inappropriate post
   * Hides the post immediately for the reporter
   */
  async reportPost({
    postId,
    reporterId,
    reason,
  }: {
    postId: string;
    reporterId: string;
    reason: string;
  }): Promise<void> {
    // 1. Save to local reported set immediately
    try {
      const current = await this.getReportedPostIds();
      current.add(postId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.REPORTED_POSTS,
        JSON.stringify(Array.from(current))
      );
    } catch {}

    // 2. Insert into post_reports in database if configured
    if (isSupabaseConfigured && reporterId) {
      try {
        await supabase
          .from('post_reports')
          .insert({
            post_id: postId,
            reporter_id: reporterId,
            reason,
          });
      } catch (e: any) {
        console.warn('Could not record report in DB:', e);
      }
    }
  },

  /**
   * Block a user
   * Immediately hides all their posts for the blocker
   */
  async blockUser({
    blockerId,
    blockedId,
  }: {
    blockerId: string;
    blockedId: string;
  }): Promise<void> {
    // 1. Save to local blocked set immediately
    try {
      const current = await this.getBlockedUserIds();
      current.add(blockedId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.BLOCKED_USERS,
        JSON.stringify(Array.from(current))
      );
    } catch {}

    // 2. Insert into user_blocks in database
    if (isSupabaseConfigured && blockerId) {
      try {
        await supabase
          .from('user_blocks')
          .insert({
            blocker_id: blockerId,
            blocked_id: blockedId,
          });
      } catch (e: any) {
        console.warn('Could not record block in DB:', e);
      }
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser({
    blockerId,
    blockedId,
  }: {
    blockerId: string;
    blockedId: string;
  }): Promise<void> {
    // 1. Remove from local blocked set
    try {
      const current = await this.getBlockedUserIds();
      current.delete(blockedId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.BLOCKED_USERS,
        JSON.stringify(Array.from(current))
      );
    } catch {}

    // 2. Remove from database
    if (isSupabaseConfigured && blockerId) {
      try {
        await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', blockerId)
          .eq('blocked_id', blockedId);
      } catch (e: any) {
        console.warn('Could not remove block from DB:', e);
      }
    }
  },

  /**
   * Get list of blocked users for settings management
   */
  async getBlockedUsers(blockerId: string): Promise<BlockedUser[]> {
    if (!isSupabaseConfigured || !blockerId) {
      const localIds = await this.getBlockedUserIds();
      return Array.from(localIds).map((id) => ({
        blocked_id: id,
        name: 'Blocked User',
        created_at: new Date().toISOString(),
      }));
    }

    try {
      const { data, error } = await supabase
        .from('user_blocks')
        .select(`
          blocked_id,
          created_at,
          profiles:blocked_id (
            name
          )
        `)
        .eq('blocker_id', blockerId);

      if (error || !data) return [];

      return data.map((item: any) => ({
        blocked_id: item.blocked_id,
        name: item.profiles?.name || 'Blocked User',
        created_at: item.created_at,
      }));
    } catch {
      return [];
    }
  },
};
