import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type RelationshipStatus =
  | 'self'
  | 'friends'
  | 'pending_sent'
  | 'pending_received'
  | 'none';

export interface UserSearchResult {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  relationship: RelationshipStatus;
  requestId?: string;
}

export interface FriendRequestItem {
  id: string; // friendship id
  user: {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
  };
  created_at: string;
}

export interface FriendListItem {
  id: string; // user id
  name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  since: string;
}

export const friendsService = {
  /**
   * Search users by username prefix (debounced up to 20 results)
   */
  async searchUsers(
    query: string,
    currentUserId: string
  ): Promise<UserSearchResult[]> {
    const clean = query.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return [];

    if (!isSupabaseConfigured) {
      // Mock search results for offline mode
      return ([
        {
          id: 'athlete-sarah-02',
          name: 'Sarah Connor',
          username: 'sarah_fit',
          avatar_url: null,
          bio: 'Consistency is key 💪',
          relationship: 'none' as RelationshipStatus,
        },
        {
          id: 'athlete-marcus-03',
          name: 'Marcus Brody',
          username: 'marcus_gains',
          avatar_url: null,
          bio: 'Heavy back day finished!',
          relationship: 'friends' as RelationshipStatus,
        },
      ] as UserSearchResult[]).filter(
        (u) =>
          u.username?.includes(clean) ||
          u.name.toLowerCase().includes(clean)
      );
    }

    try {
      // 1. Search profiles matching username or name prefix
      const { data: users, error } = await supabase
        .from('public_profiles')
        .select('id, name, username, avatar_url, bio')
        .or(`username.ilike.%${clean}%,name.ilike.%${clean}%`)
        .neq('id', currentUserId)
        .limit(20);

      if (error) {
        console.warn('Search users query error:', error.message);
        return [];
      }
      if (!users) return [];

      // 2. Query relationships for these users
      const targetIds = users.map((u) => u.id);
      if (targetIds.length === 0) return [];

      const { data: friendships } = await supabase
        .from('friendships')
        .select('id, requester_id, addressee_id, status')
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.in.(${targetIds.join(',')})),and(addressee_id.eq.${currentUserId},requester_id.in.(${targetIds.join(',')}))`
        );

      const relationshipMap = new Map<
        string,
        { status: RelationshipStatus; requestId?: string }
      >();

      if (friendships) {
        friendships.forEach((f) => {
          const otherId = f.requester_id === currentUserId ? f.addressee_id : f.requester_id;
          if (f.status === 'accepted') {
            relationshipMap.set(otherId, { status: 'friends', requestId: f.id });
          } else if (f.requester_id === currentUserId) {
            relationshipMap.set(otherId, { status: 'pending_sent', requestId: f.id });
          } else {
            relationshipMap.set(otherId, { status: 'pending_received', requestId: f.id });
          }
        });
      }

      return users.map((u) => {
        const rel = relationshipMap.get(u.id);
        return {
          id: u.id,
          name: u.name || 'Athlete',
          username: u.username || null,
          avatar_url: u.avatar_url || null,
          bio: u.bio || null,
          relationship: rel?.status || 'none',
          requestId: rel?.requestId,
        };
      });
    } catch (e: any) {
      console.warn('Error searching users:', e?.message);
      return [];
    }
  },

  /**
   * Get relationship status between current user and a target user
   */
  async getRelationship(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ status: RelationshipStatus; requestId?: string }> {
    if (!currentUserId || !targetUserId) return { status: 'none' };
    if (currentUserId === targetUserId) return { status: 'self' };

    if (!isSupabaseConfigured) {
      return { status: 'none' };
    }

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id, requester_id, addressee_id, status')
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`
        )
        .maybeSingle();

      if (error || !data) return { status: 'none' };

      if (data.status === 'accepted') {
        return { status: 'friends', requestId: data.id };
      }
      if (data.requester_id === currentUserId) {
        return { status: 'pending_sent', requestId: data.id };
      }
      return { status: 'pending_received', requestId: data.id };
    } catch {
      return { status: 'none' };
    }
  },

  /**
   * Send a friend request
   */
  async sendFriendRequest(
    requesterId: string,
    addresseeId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending',
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to send friend request' };
    }
  },

  /**
   * Accept an incoming friend request
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      throw new Error(`Failed to accept request: ${error.message}`);
    }
  },

  /**
   * Decline or cancel a friend request (deletes the row)
   */
  async declineOrCancelRequest(requestId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) {
      throw new Error(`Failed to cancel request: ${error.message}`);
    }
  },

  /**
   * Unfriend (deletes the row between pair)
   */
  async unfriend(currentUserId: string, targetUserId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`
      );

    if (error) {
      throw new Error(`Failed to unfriend: ${error.message}`);
    }
  },

  /**
   * Get incoming pending friend requests (with requester profile)
   */
  async getIncomingRequests(userId: string): Promise<FriendRequestItem[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          profiles:requester_id (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        user: {
          id: item.profiles?.id,
          name: item.profiles?.name || 'Athlete',
          username: item.profiles?.username || null,
          avatar_url: item.profiles?.avatar_url || null,
        },
      }));
    } catch {
      return [];
    }
  },

  /**
   * Get count of incoming pending friend requests (for badge display)
   */
  async getIncomingRequestsCount(userId: string): Promise<number> {
    if (!isSupabaseConfigured || !userId) return 0;

    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('addressee_id', userId)
        .eq('status', 'pending');

      if (error || count == null) return 0;
      return count;
    } catch {
      return 0;
    }
  },

  /**
   * Get outgoing pending friend requests
   */
  async getOutgoingRequests(userId: string): Promise<FriendRequestItem[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          profiles:addressee_id (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        user: {
          id: item.profiles?.id,
          name: item.profiles?.name || 'Athlete',
          username: item.profiles?.username || null,
          avatar_url: item.profiles?.avatar_url || null,
        },
      }));
    } catch {
      return [];
    }
  },

  /**
   * Get accepted friends list
   */
  async getFriendsList(userId: string): Promise<FriendListItem[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          addressee_id,
          created_at,
          requester:requester_id (
            id,
            name,
            username,
            avatar_url,
            bio
          ),
          addressee:addressee_id (
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (error || !data) return [];

      return data.map((item: any) => {
        const isRequester = item.requester_id === userId;
        const friend = isRequester ? item.addressee : item.requester;
        const friendId = isRequester ? item.addressee_id : item.requester_id;
        return {
          id: friendId || friend?.id || '',
          name: friend?.name || 'Athlete',
          username: friend?.username || null,
          avatar_url: friend?.avatar_url || null,
          bio: friend?.bio || null,
          since: item.created_at,
        };
      });
    } catch {
      return [];
    }
  },
};
