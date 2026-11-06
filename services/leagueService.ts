import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getCountdownToWeekEnd } from './leaderboardService';

export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface TierMeta {
  tier: LeagueTier;
  color: string;
  gradient: [string, string];
  darkBg: string;
  lightBg: string;
  borderColor: string;
  icon: string;
  description: string;
  nextTier: LeagueTier | null;
  prevTier: LeagueTier | null;
}

export const LEAGUE_TIER_ORDER: LeagueTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

export const TIER_CONFIGS: Record<LeagueTier, TierMeta> = {
  Bronze: {
    tier: 'Bronze',
    color: '#CD7F32',
    gradient: ['#D97706', '#92400E'],
    darkBg: '#291807',
    lightBg: '#FEF3C7',
    borderColor: '#B45309',
    icon: 'shield-outline',
    description: 'Starting league. Complete workouts to rise into the Silver division.',
    nextTier: 'Silver',
    prevTier: null,
  },
  Silver: {
    tier: 'Silver',
    color: '#94A3B8',
    gradient: ['#94A3B8', '#475569'],
    darkBg: '#1E293B',
    lightBg: '#F1F5F9',
    borderColor: '#64748B',
    icon: 'shield-half',
    description: 'Competitive athletes. Keep your momentum to reach the Gold tier.',
    nextTier: 'Gold',
    prevTier: 'Bronze',
  },
  Gold: {
    tier: 'Gold',
    color: '#F59E0B',
    gradient: ['#FBBF24', '#D97706'],
    darkBg: '#2E1E05',
    lightBg: '#FFFBEB',
    borderColor: '#F59E0B',
    icon: 'shield',
    description: 'Elite training division. High consistency and heavy daily scores.',
    nextTier: 'Platinum',
    prevTier: 'Silver',
  },
  Platinum: {
    tier: 'Platinum',
    color: '#06B6D4',
    gradient: ['#22D3EE', '#0891B2'],
    darkBg: '#082F49',
    lightBg: '#ECFEFF',
    borderColor: '#06B6D4',
    icon: 'sparkles',
    description: 'Masters of fitness. Only the most dedicated athletes make it here.',
    nextTier: 'Diamond',
    prevTier: 'Gold',
  },
  Diamond: {
    tier: 'Diamond',
    color: '#A855F7',
    gradient: ['#C084FC', '#7E22CE'],
    darkBg: '#2E1065',
    lightBg: '#FAF5FF',
    borderColor: '#9333EA',
    icon: 'diamond',
    description: 'The pinnacle of SweatFlix. The very best athletes in the world.',
    nextTier: null,
    prevTier: 'Platinum',
  },
};

export interface LeagueMember {
  user_id: string;
  rank: number;
  points: number;
  is_current_user: boolean;
  tier: LeagueTier;
  is_weekly_champion: boolean;
  username: string | null;
  name: string;
  avatar_url: string | null;
  is_private: boolean;
}

export interface LeagueGroupOverview {
  is_joined: boolean;
  group_id: string | null;
  week_start: string;
  tier: LeagueTier;
  user_points: number;
  user_rank: number;
  members: LeagueMember[];
  countdown: string;
  promotion_count: number;
  demotion_count: number;
  min_active_count: number;
}

export interface LeagueResult {
  id: string;
  week_start: string;
  old_tier: LeagueTier;
  new_tier: LeagueTier;
  rank: number;
  reward_text: string | null;
  seen: boolean;
}

const STORAGE_KEY_SEEN_RESULTS = '@sweatflix_seen_league_results';

export const leagueService = {
  /**
   * Return metadata for a given league tier
   */
  getTierMeta(tier: string = 'Bronze'): TierMeta {
    const validTier = (LEAGUE_TIER_ORDER.includes(tier as LeagueTier) ? tier : 'Bronze') as LeagueTier;
    return TIER_CONFIGS[validTier];
  },

  /**
   * Fetch current user's active league group for this week
   */
  async getMyLeague(
    userId?: string,
    currentTier: LeagueTier = 'Bronze',
    userWeeklyPoints: number = 0
  ): Promise<LeagueGroupOverview> {
    const countdown = getCountdownToWeekEnd();
    const now = new Date();
    // Monday of current week
    const dayOfWeek = (now.getUTCDay() + 6) % 7; // 0 for Monday, 6 for Sunday
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - dayOfWeek);
    const weekStartStr = monday.toISOString().split('T')[0];

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { data, error } = await supabase.rpc('get_my_league_group');
        if (!error && data && !data.error) {
          const members: LeagueMember[] = (data.members || []).map((m: any) => ({
            user_id: m.user_id,
            rank: m.rank,
            points: m.points,
            is_current_user: m.is_current_user,
            tier: (m.tier || currentTier) as LeagueTier,
            is_weekly_champion: Boolean(m.is_weekly_champion),
            username: m.username,
            name: m.name || 'Player',
            avatar_url: m.avatar_url,
            is_private: Boolean(m.is_private),
          }));

          return {
            is_joined: Boolean(data.is_joined),
            group_id: data.group_id,
            week_start: data.week_start || weekStartStr,
            tier: (data.tier || currentTier) as LeagueTier,
            user_points: data.user_points ?? userWeeklyPoints,
            user_rank: data.user_rank ?? 0,
            members,
            countdown,
            promotion_count: 5,
            demotion_count: 5,
            min_active_count: 10,
          };
        }
      } catch (err: any) {
        console.warn('get_my_league_group error, falling back to local simulation:', err?.message);
      }
    }

    // Fallback: local simulated 30-player league group
    return this.generateSimulatedLeague(userId, currentTier, userWeeklyPoints, countdown, weekStartStr);
  },

  /**
   * Generate realistic 30-player simulated league group for demo/guest and offline mode
   */
  generateSimulatedLeague(
    userId?: string,
    tier: LeagueTier = 'Bronze',
    userPoints: number = 0,
    countdown: string = getCountdownToWeekEnd(),
    weekStart: string = new Date().toISOString().split('T')[0]
  ): LeagueGroupOverview {
    const isJoined = userPoints > 0;
    const effectiveUserId = userId || 'demo-user-id';

    // Base point distribution according to tier
    const tierMultiplier: Record<LeagueTier, number> = {
      Bronze: 1,
      Silver: 1.5,
      Gold: 2.2,
      Platinum: 3.2,
      Diamond: 4.5,
    };
    const mult = tierMultiplier[tier] || 1;

    // 29 simulated competitors
    const names = [
      { name: 'Elena Rostova', user: 'elena_lift', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=70', champ: true },
      { name: 'Marcus Brody', user: 'brody_power', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=70' },
      { name: 'Sarah Connor', user: 'sarah_fit', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=70' },
      { name: 'Alex Vance', user: 'vance_runner', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=70' },
      { name: 'David Kim', user: 'kim_beast', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=70' },
      { name: 'Zack Morris', user: 'zack_fit', is_private: true },
      { name: 'Sophia Chen', user: 'sophia_c', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=70' },
      { name: 'Jordan Hayes', user: 'jhayes_iron', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=70' },
      { name: 'Emma Watson', user: 'emma_wod', is_private: true },
      { name: 'Liam Davies', user: 'liam_reps', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=70' },
      { name: 'Chloe Becker', user: 'chloe_shred', is_private: true },
      { name: 'Ryan Scott', user: 'rscott_power', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=70' },
      { name: 'Maya Lin', user: 'maya_fit', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=70' },
      { name: 'Lucas Rivera', user: 'rivera_gains', is_private: true },
      { name: 'Grace Hopper', user: 'grace_lift', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=120&auto=format&fit=crop&q=70' },
      { name: 'Noah Miller', user: 'noah_runs', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=70' },
      { name: 'Ava Mitchell', user: 'ava_m', is_private: true },
      { name: 'Oliver King', user: 'oliver_k', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=70' },
      { name: 'Mia Robinson', user: 'mia_active', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=70' },
      { name: 'William Clark', user: 'will_crossfit', is_private: true },
      { name: 'Charlotte Lewis', user: 'charlotte_l', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=70' },
      { name: 'James Walker', user: 'jwalker_beast', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=70' },
      { name: 'Amelia Hall', user: 'amelia_fit', is_private: true },
      { name: 'Benjamin Allen', user: 'ben_lift', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=70' },
      { name: 'Harper Young', user: 'harper_active', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=70' },
      { name: 'Elijah Wright', user: 'elijah_w', is_private: true },
      { name: 'Evelyn King', user: 'evelyn_k', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=70' },
      { name: 'Daniel Lopez', user: 'dlopez_iron', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=70' },
      { name: 'Abigail Hill', user: 'abby_moves', is_private: true },
    ];

    // Seed realistic point curve from 280 pts down to 15 pts
    const rawMembers: {
      user_id: string;
      points: number;
      is_current_user: boolean;
      name: string;
      username: string | null;
      avatar_url: string | null;
      is_private: boolean;
      is_weekly_champion: boolean;
    }[] = names.map((item, index) => {
      // Exponential curve
      const pts = Math.max(10, Math.round((280 - index * 9.5) * mult));
      return {
        user_id: `sim-player-${index + 1}`,
        points: pts,
        is_current_user: false,
        name: item.is_private ? 'Player' : item.name,
        username: item.is_private ? 'Player' : item.user,
        avatar_url: item.is_private ? null : (item.img || null),
        is_private: Boolean(item.is_private),
        is_weekly_champion: Boolean(item.champ),
      };
    });

    if (isJoined) {
      rawMembers.push({
        user_id: effectiveUserId,
        points: userPoints,
        is_current_user: true,
        name: 'You',
        username: 'you',
        avatar_url: null,
        is_private: false,
        is_weekly_champion: false,
      });
    }

    // Sort descending by points
    rawMembers.sort((a, b) => b.points - a.points);

    // Limit to 30
    const sliced = rawMembers.slice(0, 30);

    let userRank = 0;
    const finalMembers: LeagueMember[] = sliced.map((m, idx) => {
      const rank = idx + 1;
      if (m.is_current_user) {
        userRank = rank;
      }
      return {
        user_id: m.user_id,
        rank,
        points: m.points,
        is_current_user: m.is_current_user,
        tier,
        is_weekly_champion: m.is_weekly_champion,
        username: m.username,
        name: m.name,
        avatar_url: m.avatar_url,
        is_private: m.is_private,
      };
    });

    return {
      is_joined: isJoined,
      group_id: 'simulated-group-01',
      week_start: weekStart,
      tier,
      user_points: userPoints,
      user_rank: userRank,
      members: finalMembers,
      countdown,
      promotion_count: 5,
      demotion_count: 5,
      min_active_count: 10,
    };
  },

  /**
   * Check for an unseen weekly result to trigger the Monday Result Popup
   */
  async getUnseenResult(userId?: string): Promise<LeagueResult | null> {
    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { data, error } = await supabase.rpc('get_unseen_league_result');
        if (!error && data && data.id) {
          // Check local seen cache
          const seenList = await this.getLocalSeenResults();
          if (seenList.includes(data.id)) {
            return null;
          }
          return {
            id: data.id,
            week_start: data.week_start,
            old_tier: data.old_tier,
            new_tier: data.new_tier,
            rank: data.rank,
            reward_text: data.reward_text,
            seen: false,
          };
        }
      } catch (err: any) {
        console.warn('getUnseenResult error:', err?.message);
      }
    }

    // Check if there is a local simulated result pending demo preview
    try {
      const localPending = await AsyncStorage.getItem('@sweatflix_pending_league_result');
      if (localPending) {
        return JSON.parse(localPending);
      }
    } catch {}

    return null;
  },

  /**
   * Mark result as seen so it never shows again
   */
  async markResultSeen(resultId: string): Promise<void> {
    // Save to local seen list
    try {
      const seen = await this.getLocalSeenResults();
      if (!seen.includes(resultId)) {
        await AsyncStorage.setItem(STORAGE_KEY_SEEN_RESULTS, JSON.stringify([...seen, resultId]));
      }
      await AsyncStorage.removeItem('@sweatflix_pending_league_result');
    } catch {}

    // Update in Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('mark_league_result_seen', { p_result_id: resultId });
      } catch (err: any) {
        console.warn('mark_league_result_seen error:', err?.message);
      }
    }
  },

  async getLocalSeenResults(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_SEEN_RESULTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Helper to set a simulated pending result for quick testing
   */
  async seedTestResult(
    type: 'promoted' | 'champion' | 'demoted' | 'stayed' = 'promoted'
  ): Promise<LeagueResult> {
    const testId = `test-result-${Date.now()}`;
    let result: LeagueResult;

    if (type === 'champion') {
      result = {
        id: testId,
        week_start: '2026-10-12',
        old_tier: 'Gold',
        new_tier: 'Platinum',
        rank: 1,
        reward_text: '7 Days of Free Premium + Weekly Champion Crown 👑',
        seen: false,
      };
    } else if (type === 'promoted') {
      result = {
        id: testId,
        week_start: '2026-10-12',
        old_tier: 'Bronze',
        new_tier: 'Silver',
        rank: 3,
        reward_text: null,
        seen: false,
      };
    } else if (type === 'demoted') {
      result = {
        id: testId,
        week_start: '2026-10-12',
        old_tier: 'Silver',
        new_tier: 'Bronze',
        rank: 22,
        reward_text: null,
        seen: false,
      };
    } else {
      result = {
        id: testId,
        week_start: '2026-10-12',
        old_tier: 'Silver',
        new_tier: 'Silver',
        rank: 12,
        reward_text: null,
        seen: false,
      };
    }

    await AsyncStorage.setItem('@sweatflix_pending_league_result', JSON.stringify(result));
    return result;
  },

  /**
   * Developer / Tester trigger: run the weekly reset job right now
   */
  async testTriggerWeeklyReset(): Promise<any> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('test_run_weekly_league_reset');
        if (error) throw error;
        return data;
      } catch (err: any) {
        console.warn('test_run_weekly_league_reset error:', err?.message);
        throw err;
      }
    }
    return { mock_reset: true, timestamp: new Date().toISOString() };
  },
};
