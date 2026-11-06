import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fileUriToArrayBuffer } from '../lib/storageUpload';

export type StoryMediaType = 'image' | 'video';
export type StoryVisibility = 'friends' | 'public';

export interface StoryViewerUser {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  viewed_at: string;
}

export interface StoryItem {
  id: string;
  user_id: string;
  media_path: string;
  media_url: string;
  media_type: StoryMediaType;
  visibility: StoryVisibility;
  created_at: string;
  expires_at: string;
  is_viewed: boolean;
  views_count?: number;
  viewers?: StoryViewerUser[];
}

export interface UserStoryGroup {
  user_id: string;
  user_name: string;
  username: string | null;
  avatar_url: string | null;
  stories: StoryItem[];
  has_unwatched: boolean;
  is_own: boolean;
  latest_created_at: string;
}

// In-memory cache for signed URLs to minimize Supabase network requests
const storySignedUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Demo offline mock stories
const DEMO_STORIES: UserStoryGroup[] = [
  {
    user_id: 'athlete-sarah-02',
    user_name: 'Sarah Connor',
    username: 'sarah_fit',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=70',
    has_unwatched: true,
    is_own: false,
    latest_created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    stories: [
      {
        id: 'demo-story-1',
        user_id: 'athlete-sarah-02',
        media_path: 'demo/sarah1.jpg',
        media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=70',
        media_type: 'image',
        visibility: 'friends',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
        is_viewed: false,
      },
      {
        id: 'demo-story-2',
        user_id: 'athlete-sarah-02',
        media_path: 'demo/sarah2.jpg',
        media_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=70',
        media_type: 'image',
        visibility: 'friends',
        created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
        is_viewed: false,
      },
    ],
  },
  {
    user_id: 'athlete-alex-03',
    user_name: 'Alex Rivera',
    username: 'alex_lifts',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=70',
    has_unwatched: true,
    is_own: false,
    latest_created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    stories: [
      {
        id: 'demo-story-3',
        user_id: 'athlete-alex-03',
        media_path: 'demo/alex1.jpg',
        media_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=70',
        media_type: 'image',
        visibility: 'public',
        created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
        is_viewed: false,
      },
    ],
  },
  {
    user_id: 'athlete-marcus-04',
    user_name: 'Marcus Vance',
    username: 'marcus_v',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=70',
    has_unwatched: false,
    is_own: false,
    latest_created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    stories: [
      {
        id: 'demo-story-4',
        user_id: 'athlete-marcus-04',
        media_path: 'demo/marcus1.jpg',
        media_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=70',
        media_type: 'image',
        visibility: 'public',
        created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
        is_viewed: true,
      },
    ],
  },
];

export const storyService = {
  /**
   * Batch resolves signed URLs for a list of storage paths
   */
  async getSignedUrls(paths: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const now = Date.now();
    const pathsToFetch: string[] = [];

    paths.forEach((p) => {
      const cached = storySignedUrlCache.get(p);
      if (cached && cached.expiresAt > now + 60 * 1000) {
        result[p] = cached.url;
      } else {
        pathsToFetch.push(p);
      }
    });

    if (pathsToFetch.length > 0 && isSupabaseConfigured) {
      await Promise.all(
        pathsToFetch.map(async (path) => {
          try {
            const { data, error } = await supabase.storage
              .from('stories')
              .createSignedUrl(path, 3600);

            const resolvedUrl = data?.signedUrl || (data as any)?.signedURL;
            if (!error && resolvedUrl) {
              storySignedUrlCache.set(path, {
                url: resolvedUrl,
                expiresAt: now + 3600 * 1000,
              });
              result[path] = resolvedUrl;
            } else {
              // Fallback to public URL
              const { data: pubData } = supabase.storage
                .from('stories')
                .getPublicUrl(path);
              if (pubData?.publicUrl) {
                result[path] = pubData.publicUrl;
              }
            }
          } catch (err) {
            console.warn('Failed to generate signed URL for path:', path, err);
            const { data: pubData } = supabase.storage.from('stories').getPublicUrl(path);
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
   * Fetch all active (unexpired) stories grouped by user.
   * "Your Story" is placed first.
   * Other users are sorted: Unwatched stories first, then watched stories.
   */
  async getActiveStories(currentUserId: string): Promise<UserStoryGroup[]> {
    if (!isSupabaseConfigured || !currentUserId) {
      return DEMO_STORIES;
    }

    try {
      const nowIso = new Date().toISOString();

      // 1. Fetch stories that have not expired (RLS filters out blocked/private/ineligible rows)
      const { data: storyRows, error: storyError } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          media_path,
          media_type,
          visibility,
          created_at,
          expires_at,
          profiles:user_id (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: true });

      if (storyError) {
        console.warn('Active stories fetch error:', storyError.message);
        return DEMO_STORIES;
      }

      if (!storyRows || storyRows.length === 0) {
        return [];
      }

      // 2. Fetch current user's viewed story IDs
      const storyIds = storyRows.map((s) => s.id);
      const { data: viewRows } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', currentUserId)
        .in('story_id', storyIds);

      const viewedStoryIds = new Set<string>((viewRows || []).map((v) => v.story_id));

      // 3. Batch resolve signed URLs for all active media paths
      const mediaPaths = storyRows.map((s) => s.media_path);
      const signedUrls = await this.getSignedUrls(mediaPaths);

      // 4. Group stories by user
      const userGroupMap = new Map<string, UserStoryGroup>();

      storyRows.forEach((row: any) => {
        const uId = row.user_id;
        const profile = row.profiles;
        const isOwn = uId === currentUserId;
        const isViewed = isOwn || viewedStoryIds.has(row.id);
        const signedUrl = signedUrls[row.media_path] || '';

        const storyItem: StoryItem = {
          id: row.id,
          user_id: uId,
          media_path: row.media_path,
          media_url: signedUrl,
          media_type: row.media_type as StoryMediaType,
          visibility: row.visibility as StoryVisibility,
          created_at: row.created_at,
          expires_at: row.expires_at,
          is_viewed: isViewed,
        };

        if (!userGroupMap.has(uId)) {
          userGroupMap.set(uId, {
            user_id: uId,
            user_name: isOwn ? 'Your story' : profile?.name || 'Athlete',
            username: profile?.username || null,
            avatar_url: profile?.avatar_url || null,
            stories: [storyItem],
            has_unwatched: !isViewed,
            is_own: isOwn,
            latest_created_at: row.created_at,
          });
        } else {
          const group = userGroupMap.get(uId)!;
          group.stories.push(storyItem);
          if (!isViewed) {
            group.has_unwatched = true;
          }
          if (new Date(row.created_at) > new Date(group.latest_created_at)) {
            group.latest_created_at = row.created_at;
          }
        }
      });

      // 5. Partition and sort:
      // - "Your Story" first
      // - Unwatched stories next
      // - Watched stories last
      let ownGroup: UserStoryGroup | null = null;
      const unwatchedGroups: UserStoryGroup[] = [];
      const watchedGroups: UserStoryGroup[] = [];

      userGroupMap.forEach((group) => {
        if (group.is_own) {
          ownGroup = group;
        } else if (group.has_unwatched) {
          unwatchedGroups.push(group);
        } else {
          watchedGroups.push(group);
        }
      });

      // Sort unwatched groups by newest story first
      unwatchedGroups.sort(
        (a, b) => new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime()
      );

      // Sort watched groups by newest story first
      watchedGroups.sort(
        (a, b) => new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime()
      );

      const finalResult: UserStoryGroup[] = [];
      if (ownGroup) {
        finalResult.push(ownGroup);
      }
      finalResult.push(...unwatchedGroups);
      finalResult.push(...watchedGroups);

      return finalResult;
    } catch (err: any) {
      console.warn('getActiveStories catch error:', err?.message);
      return DEMO_STORIES;
    }
  },

  /**
   * Upload a new story (photo or video up to 15s)
   */
  async createStory({
    userId,
    localUri,
    base64Data,
    mediaType,
    visibility = 'friends',
  }: {
    userId: string;
    localUri: string;
    base64Data?: string;
    mediaType: StoryMediaType;
    visibility?: StoryVisibility;
  }): Promise<StoryItem> {
    if (!isSupabaseConfigured) {
      // Mock offline creation
      const mockStory: StoryItem = {
        id: `mock-story-${Date.now()}`,
        user_id: userId,
        media_path: `offline/${Date.now()}`,
        media_url: localUri,
        media_type: mediaType,
        visibility,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        is_viewed: true,
      };
      return mockStory;
    }

    // 0. Ensure authenticated user
    const { data: authData } = await supabase.auth.getUser();
    let effectiveUserId = authData?.user?.id;
    if (!effectiveUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      effectiveUserId = sessionData?.session?.user?.id;
    }
    if (!effectiveUserId && userId && userId !== 'me') {
      effectiveUserId = userId;
    }

    if (!effectiveUserId) {
      throw new Error('Authentication required: Please log in before sharing a story.');
    }

    // 1. Read media as ArrayBuffer (avoid 0-byte React Native fetch bug)
    const arrayBuffer = await fileUriToArrayBuffer(localUri, base64Data);

    // Check size limit (Images: 5MB, Videos: 15MB)
    const maxBytes = mediaType === 'video' ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (arrayBuffer.byteLength > maxBytes) {
      const maxMb = mediaType === 'video' ? 15 : 5;
      throw new Error(`File is too large (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)} MB). Maximum allowed is ${maxMb} MB.`);
    }

    // 2. Generate file path: {user_id}/{uuid}.{ext}
    const ext = mediaType === 'video' ? 'mp4' : 'jpg';
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const storageFilePath = `${effectiveUserId}/${fileId}.${ext}`;
    const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

    // 3. Upload to private 'stories' bucket
    const { error: uploadError } = await supabase.storage
      .from('stories')
      .upload(storageFilePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message.includes('security policy') || uploadError.message.includes('row-level security')) {
        throw new Error('Storage permission error: Please ensure supabase/stories.sql has been executed in your Supabase SQL editor.');
      }
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 4. Insert row into public.stories
    const { data: storyRow, error: insertError } = await supabase
      .from('stories')
      .insert({
        user_id: effectiveUserId,
        media_path: storageFilePath,
        media_type: mediaType,
        visibility,
      })
      .select('id, user_id, media_path, media_type, visibility, created_at, expires_at')
      .single();

    if (insertError) {
      // Cleanup uploaded file on DB insert failure
      await supabase.storage.from('stories').remove([storageFilePath]).catch(() => {});
      if (insertError.message.includes('Daily story limit reached')) {
        throw new Error('Daily limit reached: You can share up to 10 stories per 24 hours. Please try again tomorrow.');
      }
      if (insertError.message.includes('more open than your account setting')) {
        throw new Error('Privacy restriction: A story cannot be more open than your account visibility.');
      }
      throw new Error(`Failed to create story: ${insertError.message}`);
    }

    // 5. Generate signed URL for immediate preview
    const { data: signedData } = await supabase.storage
      .from('stories')
      .createSignedUrl(storageFilePath, 3600);

    const signedUrl = signedData?.signedUrl || localUri;
    storySignedUrlCache.set(storageFilePath, {
      url: signedUrl,
      expiresAt: Date.now() + 3600 * 1000,
    });

    return {
      id: storyRow.id,
      user_id: storyRow.user_id,
      media_path: storyRow.media_path,
      media_url: signedUrl,
      media_type: storyRow.media_type as StoryMediaType,
      visibility: storyRow.visibility as StoryVisibility,
      created_at: storyRow.created_at,
      expires_at: storyRow.expires_at,
      is_viewed: true,
      views_count: 0,
      viewers: [],
    };
  },

  /**
   * Record that a user has viewed a story (once per viewer)
   */
  async recordView(storyId: string, viewerId: string): Promise<void> {
    if (!isSupabaseConfigured || !storyId || !viewerId) return;

    try {
      await supabase
        .from('story_views')
        .upsert(
          {
            story_id: storyId,
            viewer_id: viewerId,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: 'story_id,viewer_id', ignoreDuplicates: true }
        );
    } catch (err: any) {
      console.warn('Record story view error:', err?.message);
    }
  },

  /**
   * Fetch the list of viewers for my own story
   */
  async getStoryViewers(storyId: string): Promise<StoryViewerUser[]> {
    if (!isSupabaseConfigured || !storyId) {
      return [
        {
          id: 'athlete-sarah-02',
          name: 'Sarah Connor',
          username: 'sarah_fit',
          avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          viewed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 'athlete-alex-03',
          name: 'Alex Rivera',
          username: 'alex_lifts',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          viewed_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('story_views')
        .select(`
          viewed_at,
          profiles:viewer_id (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false });

      if (error) {
        console.warn('Fetch story viewers error:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.profiles?.id || '',
        name: row.profiles?.name || 'Athlete',
        username: row.profiles?.username || null,
        avatar_url: row.profiles?.avatar_url || null,
        viewed_at: row.viewed_at,
      }));
    } catch (err: any) {
      console.warn('getStoryViewers catch error:', err?.message);
      return [];
    }
  },

  /**
   * Delete my own story
   */
  async deleteStory({
    storyId,
    userId,
    mediaPath,
  }: {
    storyId: string;
    userId: string;
    mediaPath: string;
  }): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Delete row from public.stories
      const { error: dbError } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', userId);

      if (dbError) {
        throw new Error(`Failed to delete story: ${dbError.message}`);
      }

      // 2. Remove file from private stories bucket
      if (mediaPath) {
        await supabase.storage.from('stories').remove([mediaPath]).catch(() => {});
      }
    } catch (err: any) {
      console.warn('deleteStory catch error:', err?.message);
      throw err;
    }
  },

  /**
   * Report an inappropriate story
   */
  async reportStory({
    storyId,
    reporterId,
    reason,
  }: {
    storyId: string;
    reporterId: string;
    reason: string;
  }): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('story_reports').insert({
        story_id: storyId,
        reporter_id: reporterId,
        reason,
      });
    } catch (err: any) {
      console.warn('reportStory error:', err?.message);
    }
  },

  /**
   * Block a user from stories (and feed)
   */
  async blockUser({
    blockerId,
    blockedId,
  }: {
    blockerId: string;
    blockedId: string;
  }): Promise<void> {
    if (!isSupabaseConfigured || blockerId === blockedId) return;

    try {
      await supabase.from('user_blocks').insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });
    } catch (err: any) {
      console.warn('blockUser error:', err?.message);
    }
  },
};
