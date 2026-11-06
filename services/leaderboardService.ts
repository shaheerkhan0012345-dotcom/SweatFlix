import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  points: number;
  workouts_count: number;
  rank: number;
}

export interface ChallengeLeaderboardEntry {
  user_id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  weekly_wins: number;
  all_time_wins: number;
  rank: number;
}

export interface MyRankResult {
  my_rank: number;
  my_points: number;
  points_gap: number;
  next_rank_username: string | null;
}

export interface LevelTierInfo {
  currentLevel: 'Beginner' | 'Athlete' | 'Elite' | 'Legend';
  nextLevel: string | null;
  minPoints: number;
  nextPoints: number;
  progressPercent: number;
  pointsToNext: number;
  badgeColor: string;
  accentColor: string;
}

/**
 * Returns the Monday 00:00:00 UTC date string for a given date (defaults to today)
 */
export function getWeekStartUtc(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  // In JavaScript getUTCDay: 0 is Sunday, 1 is Monday...
  // Monday is 1, so offset from Monday:
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split('T')[0];
}

/**
 * Calculates human-readable countdown string to the end of the current week (Sunday 23:59:59 UTC)
 */
export function getCountdownToWeekEnd(): string {
  const now = new Date();
  const weekStartStr = getWeekStartUtc(now);
  const weekStart = new Date(weekStartStr + 'T00:00:00.000Z');
  // Sunday 23:59:59.999 UTC is weekStart + 7 days - 1 ms
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  const diffMs = weekEnd.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Resets soon';
  }

  const hoursTotal = Math.floor(diffMs / (3600 * 1000));
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `Resets in ${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `Resets in ${hours}h ${mins}m`;
  }
  return `Resets in ${mins}m`;
}

/**
 * Calculates Level Tier Info from lifetime total points
 * Tiers: Beginner 0, Athlete 500, Elite 2000, Legend 5000
 */
export function getLevelInfo(totalPoints: number): LevelTierInfo {
  const pts = Math.max(0, totalPoints || 0);

  if (pts >= 5000) {
    return {
      currentLevel: 'Legend',
      nextLevel: null,
      minPoints: 5000,
      nextPoints: 5000,
      progressPercent: 100,
      pointsToNext: 0,
      badgeColor: '#F59E0B',
      accentColor: '#D97706',
    };
  }

  if (pts >= 2000) {
    const range = 5000 - 2000;
    const earned = pts - 2000;
    return {
      currentLevel: 'Elite',
      nextLevel: 'Legend',
      minPoints: 2000,
      nextPoints: 5000,
      progressPercent: Math.min(100, Math.round((earned / range) * 100)),
      pointsToNext: 5000 - pts,
      badgeColor: '#8B5CF6',
      accentColor: '#7C3AED',
    };
  }

  if (pts >= 500) {
    const range = 2000 - 500;
    const earned = pts - 500;
    return {
      currentLevel: 'Athlete',
      nextLevel: 'Elite',
      minPoints: 500,
      nextPoints: 2000,
      progressPercent: Math.min(100, Math.round((earned / range) * 100)),
      pointsToNext: 2000 - pts,
      badgeColor: '#3B82F6',
      accentColor: '#2563EB',
    };
  }

  // Beginner: 0 to 499
  const range = 500;
  return {
    currentLevel: 'Beginner',
    nextLevel: 'Athlete',
    minPoints: 0,
    nextPoints: 500,
    progressPercent: Math.min(100, Math.round((pts / range) * 100)),
    pointsToNext: 500 - pts,
    badgeColor: '#10B981',
    accentColor: '#059669',
  };
}

// Fallback demo data for preview / offline mode
const DEMO_FRIENDS_LEADERBOARD: LeaderboardEntry[] = [
  {
    user_id: 'athlete-sarah-02',
    username: 'sarah_fit',
    name: 'Sarah Connor',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    points: 120,
    workouts_count: 5,
    rank: 1,
  },
  {
    user_id: 'athlete-alex-03',
    username: 'alex_lifts',
    name: 'Alex Hunter',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    points: 95,
    workouts_count: 4,
    rank: 2,
  },
  {
    user_id: 'athlete-maya-04',
    username: 'maya_shred',
    name: 'Maya Lin',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
    points: 75,
    workouts_count: 3,
    rank: 3,
  },
  {
    user_id: 'current-user',
    username: 'you_athlete',
    name: 'You',
    avatar_url: null,
    points: 45,
    workouts_count: 2,
    rank: 4,
  },
  {
    user_id: 'athlete-marcus-05',
    username: 'marcus_core',
    name: 'Marcus Vance',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    points: 30,
    workouts_count: 2,
    rank: 5,
  },
];

const DEMO_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    user_id: 'global-1',
    username: 'iron_titan',
    name: 'Dmitri V.',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80',
    points: 240,
    workouts_count: 7,
    rank: 1,
  },
  {
    user_id: 'global-2',
    username: 'valkyrie_lift',
    name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    points: 215,
    workouts_count: 6,
    rank: 2,
  },
  {
    user_id: 'global-3',
    username: 'zen_warrior',
    name: 'Kenji Sato',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80',
    points: 190,
    workouts_count: 5,
    rank: 3,
  },
  {
    user_id: 'athlete-sarah-02',
    username: 'sarah_fit',
    name: 'Sarah Connor',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    points: 120,
    workouts_count: 5,
    rank: 4,
  },
  {
    user_id: 'current-user',
    username: 'you_athlete',
    name: 'You',
    avatar_url: null,
    points: 45,
    workouts_count: 2,
    rank: 5,
  },
];

const DEMO_CHALLENGES_LEADERBOARD: ChallengeLeaderboardEntry[] = [
  {
    user_id: 'athlete-alex-03',
    username: 'alex_lifts',
    name: 'Alex Hunter',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    weekly_wins: 4,
    all_time_wins: 12,
    rank: 1,
  },
  {
    user_id: 'athlete-sarah-02',
    username: 'sarah_fit',
    name: 'Sarah Connor',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    weekly_wins: 3,
    all_time_wins: 9,
    rank: 2,
  },
  {
    user_id: 'athlete-maya-04',
    username: 'maya_shred',
    name: 'Maya Lin',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
    weekly_wins: 2,
    all_time_wins: 5,
    rank: 3,
  },
  {
    user_id: 'current-user',
    username: 'you_athlete',
    name: 'You',
    avatar_url: null,
    weekly_wins: 1,
    all_time_wins: 3,
    rank: 4,
  },
];

export const leaderboardService = {
  /**
   * Fetch Friends Leaderboard for the week (Me + accepted friends)
   */
  async getFriendsLeaderboard(weekStart?: string): Promise<LeaderboardEntry[]> {
    const ws = weekStart || getWeekStartUtc();
    if (!isSupabaseConfigured) {
      return DEMO_FRIENDS_LEADERBOARD;
    }

    try {
      const { data, error } = await supabase.rpc('leaderboard_friends', {
        p_week_start: ws,
      });

      if (error) {
        console.warn('RPC leaderboard_friends error:', error.message);
        return DEMO_FRIENDS_LEADERBOARD;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as any[]).map((row) => ({
        user_id: row.user_id,
        username: row.username || 'athlete',
        name: row.name || 'Athlete',
        avatar_url: row.avatar_url || null,
        points: Number(row.points || 0),
        workouts_count: Number(row.workouts_count || 0),
        rank: Number(row.rank || 0),
      }));
    } catch (e: any) {
      console.warn('getFriendsLeaderboard exception:', e?.message);
      return DEMO_FRIENDS_LEADERBOARD;
    }
  },

  /**
   * Fetch Global Leaderboard (Public users with show_on_leaderboard = true)
   */
  async getGlobalLeaderboard(weekStart?: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    const ws = weekStart || getWeekStartUtc();
    if (!isSupabaseConfigured) {
      return DEMO_GLOBAL_LEADERBOARD;
    }

    try {
      const { data, error } = await supabase.rpc('leaderboard_global', {
        p_week_start: ws,
        p_limit: limit,
      });

      if (error) {
        console.warn('RPC leaderboard_global error:', error.message);
        return DEMO_GLOBAL_LEADERBOARD;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as any[]).map((row) => ({
        user_id: row.user_id,
        username: row.username || 'athlete',
        name: row.name || 'Athlete',
        avatar_url: row.avatar_url || null,
        points: Number(row.points || 0),
        workouts_count: Number(row.workouts_count || 0),
        rank: Number(row.rank || 0),
      }));
    } catch (e: any) {
      console.warn('getGlobalLeaderboard exception:', e?.message);
      return DEMO_GLOBAL_LEADERBOARD;
    }
  },

  /**
   * Fetch Challenges Leaderboard (Me + friends ranked by weekly challenge wins)
   */
  async getChallengesLeaderboard(weekStart?: string): Promise<ChallengeLeaderboardEntry[]> {
    const ws = weekStart || getWeekStartUtc();
    if (!isSupabaseConfigured) {
      return DEMO_CHALLENGES_LEADERBOARD;
    }

    try {
      const { data, error } = await supabase.rpc('leaderboard_challenges', {
        p_week_start: ws,
      });

      if (error) {
        console.warn('RPC leaderboard_challenges error:', error.message);
        return DEMO_CHALLENGES_LEADERBOARD;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as any[]).map((row) => ({
        user_id: row.user_id,
        username: row.username || 'athlete',
        name: row.name || 'Athlete',
        avatar_url: row.avatar_url || null,
        weekly_wins: Number(row.weekly_wins || 0),
        all_time_wins: Number(row.all_time_wins || 0),
        rank: Number(row.rank || 0),
      }));
    } catch (e: any) {
      console.warn('getChallengesLeaderboard exception:', e?.message);
      return DEMO_CHALLENGES_LEADERBOARD;
    }
  },

  /**
   * Fetch my rank and gap to next rank
   */
  async getMyRank(
    scope: 'friends' | 'global' = 'friends',
    weekStart?: string
  ): Promise<MyRankResult | null> {
    const ws = weekStart || getWeekStartUtc();
    if (!isSupabaseConfigured) {
      return {
        my_rank: 4,
        my_points: 45,
        points_gap: 30,
        next_rank_username: 'maya_shred',
      };
    }

    try {
      const { data, error } = await supabase.rpc('my_rank', {
        p_week_start: ws,
        p_scope: scope,
      });

      if (error || !data || data.length === 0) {
        return null;
      }

      const row = data[0];
      return {
        my_rank: Number(row.my_rank || 0),
        my_points: Number(row.my_points || 0),
        points_gap: Number(row.points_gap || 0),
        next_rank_username: row.next_rank_username || null,
      };
    } catch (e: any) {
      console.warn('getMyRank exception:', e?.message);
      return null;
    }
  },

  /**
   * Fetch user's points earned this week
   */
  async getUserPointsThisWeek(userId: string, weekStart?: string): Promise<number> {
    if (!isSupabaseConfigured || !userId) {
      return 35;
    }

    try {
      const ws = weekStart || getWeekStartUtc();
      const { data, error } = await supabase.rpc('get_user_points_this_week', {
        p_user_id: userId,
        p_week_start: ws,
      });

      if (error) {
        return 0;
      }

      return Number(data || 0);
    } catch {
      return 0;
    }
  },

  /**
   * Fetch user's total points accumulated today in UTC (to check 50 pt daily cap)
   */
  async getTodayDailyPoints(userId: string): Promise<number> {
    if (!isSupabaseConfigured || !userId) {
      return 10;
    }

    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('point_events')
        .select('points')
        .eq('user_id', userId)
        .eq('day', todayDate);

      if (error || !data) {
        return 0;
      }

      return data.reduce((sum, item) => sum + (item.points || 0), 0);
    } catch {
      return 0;
    }
  },

  /**
   * Toggle user's participation in Global Leaderboard
   */
  async toggleShowOnLeaderboard(userId: string, show: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return true;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_on_leaderboard: show })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (e: any) {
      console.warn('toggleShowOnLeaderboard error:', e?.message);
      throw e;
    }
  },
};
