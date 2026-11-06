import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'challenge_invite'
  | 'challenge_accepted'
  | 'challenge_entry'
  | 'challenge_result'
  | 'post_like';

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  ref_id: string | null;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationSettings {
  user_id: string;
  friend_requests: boolean;
  challenges: boolean;
  likes: boolean;
  reminders: boolean;
}

const STORAGE_KEY_NOTIF_SETTINGS = '@sweatflix_notif_settings';
const STORAGE_KEY_CACHED_NOTIFS = '@sweatflix_cached_notifs';

const DEFAULT_SETTINGS: NotificationSettings = {
  user_id: '',
  friend_requests: true,
  challenges: true,
  likes: true,
  reminders: true,
};

const localListeners = new Set<(notif: AppNotification) => void>();

const INITIAL_COMMUNITY_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'initial-notif-challenge',
    user_id: '',
    actor_id: 'athlete-sarah-02',
    type: 'challenge_invite',
    ref_id: 'demo-challenge-1',
    data: {
      actor_name: 'Sarah Connor',
      actor_username: 'sarah_fit',
      actor_avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=70',
      exercise_name: 'Standard Push-ups',
      target: 50,
      metric: 'reps',
      duration_hours: 24,
    },
    read_at: null,
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'initial-notif-like',
    user_id: '',
    actor_id: 'athlete-alex-01',
    type: 'post_like',
    ref_id: 'demo-post-1',
    data: {
      actor_name: 'Alex Vance',
      actor_username: 'alex_vance',
      actor_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=70',
      workout_name: 'Chest & Triceps Blast',
      caption: 'Hit a new PR on incline dumbbell press today! Feeling stronger every week. 🔥💪',
    },
    read_at: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'initial-notif-friend',
    user_id: '',
    actor_id: 'athlete-marcus-03',
    type: 'friend_accepted',
    ref_id: 'demo-friend-1',
    data: {
      actor_name: 'Marcus Brody',
      actor_username: 'marcus_gains',
      actor_avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&auto=format&fit=crop&q=70',
    },
    read_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
];

export const notificationService = {
  /**
   * Fetch user notifications list (latest 50)
   */
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const effectiveUserId = userId || 'guest';

    if (!isSupabaseConfigured || !userId) {
      // Offline / guest fallback from storage
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      // Seed initial community notifications
      const seeded = INITIAL_COMMUNITY_NOTIFICATIONS.map((n) => ({ ...n, user_id: effectiveUserId }));
      await AsyncStorage.setItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`, JSON.stringify(seeded));
      return seeded;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifs: AppNotification[] = data || [];
      if (notifs.length > 0) {
        AsyncStorage.setItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`, JSON.stringify(notifs)).catch(() => {});
        return notifs;
      }

      // If DB has no notifications yet, check local storage (e.g. test notifications)
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Seed initial community notifications so user can experience live alerts immediately
      const seeded = INITIAL_COMMUNITY_NOTIFICATIONS.map((n) => ({ ...n, user_id: effectiveUserId }));
      await AsyncStorage.setItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`, JSON.stringify(seeded));
      return seeded;
    } catch (err: any) {
      console.warn('getNotifications error:', err?.message);
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      const seeded = INITIAL_COMMUNITY_NOTIFICATIONS.map((n) => ({ ...n, user_id: effectiveUserId }));
      await AsyncStorage.setItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`, JSON.stringify(seeded));
      return seeded;
    }
  },

  /**
   * Fetch count of unread notifications
   */
  async getUnreadCount(userId?: string): Promise<number> {
    const effectiveUserId = userId || 'guest';

    if (!isSupabaseConfigured || !userId) {
      const notifs = await this.getNotifications(effectiveUserId);
      return notifs.filter((n) => !n.read_at).length;
    }

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', effectiveUserId)
        .is('read_at', null);

      if (error) throw error;
      if (typeof count === 'number' && count > 0) return count;

      // Check local cache if DB returned 0
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      if (cached) {
        const parsed: AppNotification[] = JSON.parse(cached);
        return parsed.filter((n) => !n.read_at).length;
      }
      return INITIAL_COMMUNITY_NOTIFICATIONS.filter((n) => !n.read_at).length;
    } catch (err: any) {
      console.warn('getUnreadCount error:', err?.message);
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      if (cached) {
        const parsed: AppNotification[] = JSON.parse(cached);
        return parsed.filter((n) => !n.read_at).length;
      }
      return INITIAL_COMMUNITY_NOTIFICATIONS.filter((n) => !n.read_at).length;
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId?: string): Promise<void> {
    if (!notificationId) return;

    const effectiveUserId = userId || 'guest';
    try {
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      if (cached) {
        const list: AppNotification[] = JSON.parse(cached);
        const updated = list.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        );
        await AsyncStorage.setItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`, JSON.stringify(updated));
      }
    } catch {}

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (err: any) {
      console.warn('markAsRead error:', err?.message);
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(userId?: string): Promise<void> {
    const effectiveUserId = userId || 'guest';

    // Update local cache
    try {
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      if (cached) {
        const list: AppNotification[] = JSON.parse(cached);
        const updated = list.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        }));
        await AsyncStorage.setItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`, JSON.stringify(updated));
      }
    } catch {}

    if (!isSupabaseConfigured || !userId) return;

    try {
      // Try RPC first
      const { error: rpcError } = await supabase.rpc('mark_all_notifications_read');
      if (rpcError) {
        // Fallback to direct update
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('user_id', effectiveUserId)
          .is('read_at', null);
      }
    } catch (err: any) {
      console.warn('markAllAsRead error:', err?.message);
    }
  },

  /**
   * Create a test notification for real-time verification and UI demonstration
   */
  async createTestNotification(
    userId?: string,
    type: NotificationType = 'challenge_invite'
  ): Promise<AppNotification> {
    const effectiveUserId = userId || 'guest';
    const actorName = type === 'post_like' ? 'Alex Vance' : 'Sarah Connor';
    const refId = type === 'post_like' ? 'demo-post-1' : 'demo-challenge-1';

    const testNotif: AppNotification = {
      id: `test-notif-${Date.now()}`,
      user_id: effectiveUserId,
      actor_id: null,
      type,
      ref_id: refId,
      data: {
        actor_name: actorName,
        actor_username: type === 'post_like' ? 'alex_vance' : 'sarah_fit',
        actor_avatar_url:
          type === 'post_like'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=70'
            : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=70',
        exercise_name: 'Standard Push-ups',
        amount: 50,
        workout_name: 'Chest & Triceps Blast',
        caption: 'Crushed today workout with high energy!',
      },
      read_at: null,
      created_at: new Date().toISOString(),
    };

    try {
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`);
      const list: AppNotification[] = cached ? JSON.parse(cached) : [];
      const updated = [testNotif, ...list];
      await AsyncStorage.setItem(`${STORAGE_KEY_CACHED_NOTIFS}_${effectiveUserId}`, JSON.stringify(updated));
    } catch {}

    // Instantly notify local subscribers (UI badges, open notifications screen)
    localListeners.forEach((listener) => {
      try {
        listener(testNotif);
      } catch (e) {
        console.warn('Local notification listener error:', e);
      }
    });

    return testNotif;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    if (!notificationId || !isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (err: any) {
      console.warn('deleteNotification error:', err?.message);
    }
  },

  /**
   * Fetch notification settings for user
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    if (!userId) return { ...DEFAULT_SETTINGS, user_id: userId };

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (data && !error) {
          return {
            user_id: userId,
            friend_requests: data.friend_requests ?? true,
            challenges: data.challenges ?? true,
            likes: data.likes ?? true,
            reminders: data.reminders ?? true,
          };
        }
      }

      // Check local storage fallback
      const local = await AsyncStorage.getItem(`${STORAGE_KEY_NOTIF_SETTINGS}_${userId}`);
      if (local) {
        return JSON.parse(local);
      }
    } catch (err: any) {
      console.warn('getNotificationSettings error:', err?.message);
    }

    return { ...DEFAULT_SETTINGS, user_id: userId };
  },

  /**
   * Update notification settings for user
   */
  async updateNotificationSettings(
    userId: string,
    partial: Partial<Omit<NotificationSettings, 'user_id'>>
  ): Promise<NotificationSettings> {
    const current = await this.getNotificationSettings(userId);
    const updated: NotificationSettings = { ...current, ...partial, user_id: userId };

    // Save locally
    await AsyncStorage.setItem(`${STORAGE_KEY_NOTIF_SETTINGS}_${userId}`, JSON.stringify(updated));

    if (isSupabaseConfigured && userId) {
      try {
        await supabase
          .from('notification_settings')
          .upsert({
            user_id: userId,
            friend_requests: updated.friend_requests,
            challenges: updated.challenges,
            likes: updated.likes,
            reminders: updated.reminders,
            updated_at: new Date().toISOString(),
          });
      } catch (err: any) {
        console.warn('updateNotificationSettings supabase error:', err?.message);
      }
    }

    return updated;
  },

  /**
   * Register or refresh Expo push token in push_tokens
   */
  async registerPushToken(userId: string, token: string, platform: string): Promise<void> {
    if (!userId || !token || !isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: userId,
            token,
            platform,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'token' }
        );

      if (error) {
        console.warn('registerPushToken error:', error.message);
      }
    } catch (err: any) {
      console.warn('registerPushToken catch error:', err?.message);
    }
  },

  /**
   * Remove push token on user logout
   */
  async removePushToken(token: string): Promise<void> {
    if (!token || !isSupabaseConfigured) return;

    try {
      await supabase.from('push_tokens').delete().eq('token', token);
    } catch (err: any) {
      console.warn('removePushToken error:', err?.message);
    }
  },

  /**
   * Subscribe to real-time notification inserts for the current user.
   * Generates a unique channel name per subscriber to prevent Supabase
   * "cannot add postgres_changes callbacks after subscribe()" channel collisions.
   */
  subscribeToNotifications(
    userId: string,
    onNewNotification: (notification: AppNotification) => void
  ) {
    localListeners.add(onNewNotification);

    if (!userId || userId === 'guest' || !isSupabaseConfigured) {
      return {
        unsubscribe: () => {
          localListeners.delete(onNewNotification);
        },
      };
    }

    const uniqueChannelName = `user-notifs-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    let channel: any = null;

    try {
      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload?.new) {
              onNewNotification(payload.new as AppNotification);
            }
          }
        )
        .subscribe();
    } catch (err: any) {
      console.warn('Realtime notification subscribe error:', err?.message);
    }

    return {
      unsubscribe: () => {
        localListeners.delete(onNewNotification);
        if (channel) {
          try {
            supabase.removeChannel(channel).catch(() => {});
          } catch {}
        }
      },
    };
  },
};
