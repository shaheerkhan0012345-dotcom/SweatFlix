import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fileUriToArrayBuffer } from '../lib/storageUpload';

export type ChallengeMetric = 'reps' | 'seconds';
export type ChallengeStatus = 'pending' | 'active' | 'declined' | 'cancelled' | 'completed';
export type ChallengeDuration = 24 | 72 | 168;

export interface ChallengeParticipant {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
}

export interface FriendChallenge {
  id: string;
  creator_id: string;
  opponent_id: string;
  exercise_id: string | null;
  exercise_name: string;
  metric: ChallengeMetric;
  target: number;
  duration_hours: ChallengeDuration;
  message: string | null;
  status: ChallengeStatus;
  starts_at: string | null;
  ends_at: string | null;
  winner_id: string | null;
  is_draw: boolean;
  created_at: string;
  // Augmented UI fields
  creator?: ChallengeParticipant;
  opponent?: ChallengeParticipant;
  creator_score?: number;
  opponent_score?: number;
}

export interface FriendChallengeEntry {
  id: string;
  challenge_id: string;
  user_id: string;
  amount: number;
  proof_path: string | null;
  proof_url?: string | null;
  disputed: boolean;
  created_at: string;
  user?: ChallengeParticipant;
  can_delete?: boolean;
}

export interface CreateChallengeParams {
  creatorId: string;
  opponentId: string;
  exerciseId: string;
  exerciseName: string;
  metric: ChallengeMetric;
  target: number;
  durationHours: ChallengeDuration;
  message?: string;
}

// In-memory cache for signed URLs for proof videos
const proofSignedUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Supports both 'proof' and 'proofs' bucket names seamlessly
let activeProofBucket: 'proof' | 'proofs' = 'proof';

function toggleProofBucket(): 'proof' | 'proofs' {
  activeProofBucket = activeProofBucket === 'proof' ? 'proofs' : 'proof';
  return activeProofBucket;
}

// In-memory / AsyncStorage mock store for offline testing
const DEMO_CHALLENGES: FriendChallenge[] = [
  {
    id: 'demo-challenge-1',
    creator_id: 'current-user',
    opponent_id: 'athlete-sarah-02',
    exercise_id: 'chest-pushups',
    exercise_name: 'Standard Push-ups',
    metric: 'reps',
    target: 50,
    duration_hours: 24,
    message: 'Let’s see who hits 50 first! 💪',
    status: 'active',
    starts_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    winner_id: null,
    is_draw: false,
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    creator: {
      id: 'current-user',
      name: 'You',
      username: 'you_fit',
      avatar_url: null,
    },
    opponent: {
      id: 'athlete-sarah-02',
      name: 'Sarah Connor',
      username: 'sarah_fit',
      avatar_url: null,
    },
    creator_score: 30,
    opponent_score: 25,
  },
];

export const challengeService = {
  /**
   * Resolve a signed URL for a private proof video
   */
  async getProofSignedUrl(proofPath: string): Promise<string | null> {
    if (!proofPath) return null;
    if (proofPath.startsWith('http://') || proofPath.startsWith('https://') || proofPath.startsWith('file://')) {
      return proofPath;
    }

    const now = Date.now();
    const cached = proofSignedUrlCache.get(proofPath);
    if (cached && cached.expiresAt > now + 60 * 1000) {
      return cached.url;
    }

    if (!isSupabaseConfigured) return null;

    try {
      let { data, error } = await supabase.storage
        .from(activeProofBucket)
        .createSignedUrl(proofPath, 3600); // 1 hour

      if (error && error.message?.toLowerCase().includes('not found')) {
        toggleProofBucket();
        const retry = await supabase.storage
          .from(activeProofBucket)
          .createSignedUrl(proofPath, 3600);
        data = retry.data;
        error = retry.error;
      }

      if (error || !data?.signedUrl) {
        console.warn('Error signing proof video URL:', error?.message);
        return null;
      }

      proofSignedUrlCache.set(proofPath, {
        url: data.signedUrl,
        expiresAt: now + 3600 * 1000,
      });

      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Batch resolve signed URLs for an array of proof paths
   */
  async resolveProofSignedUrls(paths: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const pathsToFetch: string[] = [];
    const now = Date.now();

    paths.forEach((p) => {
      if (!p) return;
      if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('file://')) {
        result[p] = p;
        return;
      }
      const cached = proofSignedUrlCache.get(p);
      if (cached && cached.expiresAt > now + 60 * 1000) {
        result[p] = cached.url;
      } else {
        pathsToFetch.push(p);
      }
    });

    if (pathsToFetch.length > 0 && isSupabaseConfigured) {
      try {
        let { data, error } = await supabase.storage
          .from(activeProofBucket)
          .createSignedUrls(pathsToFetch, 3600);

        if (error && error.message?.toLowerCase().includes('not found')) {
          toggleProofBucket();
          const retry = await supabase.storage
            .from(activeProofBucket)
            .createSignedUrls(pathsToFetch, 3600);
          data = retry.data;
          error = retry.error;
        }

        if (!error && data) {
          data.forEach((item) => {
            if (item.signedUrl && item.path) {
              proofSignedUrlCache.set(item.path, {
                url: item.signedUrl,
                expiresAt: now + 3600 * 1000,
              });
              result[item.path] = item.signedUrl;
            }
          });
        }
      } catch (err) {
        console.warn('Failed to batch resolve proof URLs:', err);
      }
    }

    return result;
  },

  /**
   * Trigger backend auto-finalization of expired challenges
   */
  async finalizeExpiredChallenges(): Promise<number> {
    if (!isSupabaseConfigured) return 0;
    try {
      const { data, error } = await supabase.rpc('finalize_expired_challenges');
      if (error) {
        console.warn('finalize_expired_challenges RPC error:', error.message);
        return 0;
      }
      return typeof data === 'number' ? data : 0;
    } catch {
      return 0;
    }
  },

  /**
   * Fetch all challenges for a user split into requests, active, and completed
   */
  async getChallenges(userId: string): Promise<{
    requests: FriendChallenge[];
    active: FriendChallenge[];
    completed: FriendChallenge[];
    all: FriendChallenge[];
  }> {
    if (!userId) {
      return { requests: [], active: [], completed: [], all: [] };
    }

    if (!isSupabaseConfigured) {
      const active = DEMO_CHALLENGES.filter((c) => c.status === 'active');
      const completed = DEMO_CHALLENGES.filter((c) => ['completed', 'declined', 'cancelled'].includes(c.status));
      const requests = DEMO_CHALLENGES.filter((c) => c.status === 'pending' && c.opponent_id === userId);
      return { requests, active, completed, all: DEMO_CHALLENGES };
    }

    try {
      // 1. Auto-finalize expired challenges first
      await this.finalizeExpiredChallenges();

      // 2. Fetch challenges with creator & opponent profiles
      const { data, error } = await supabase
        .from('friend_challenges')
        .select(`
          *,
          creator:creator_id (id, name, username, avatar_url),
          opponent:opponent_id (id, name, username, avatar_url)
        `)
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Error fetching friend challenges:', error?.message);
        return { requests: [], active: [], completed: [], all: [] };
      }

      const challengeIds = data.map((c) => c.id);

      // 3. Fetch non-disputed entries for score totals
      let scoresMap: Record<string, { creator: number; opponent: number }> = {};
      if (challengeIds.length > 0) {
        const { data: entriesData } = await supabase
          .from('friend_challenge_entries')
          .select('challenge_id, user_id, amount, disputed')
          .in('challenge_id', challengeIds)
          .eq('disputed', false);

        if (entriesData) {
          entriesData.forEach((entry) => {
            if (!scoresMap[entry.challenge_id]) {
              scoresMap[entry.challenge_id] = { creator: 0, opponent: 0 };
            }
            const ch = data.find((c) => c.id === entry.challenge_id);
            if (ch) {
              if (entry.user_id === ch.creator_id) {
                scoresMap[entry.challenge_id].creator += entry.amount;
              } else if (entry.user_id === ch.opponent_id) {
                scoresMap[entry.challenge_id].opponent += entry.amount;
              }
            }
          });
        }
      }

      const challenges: FriendChallenge[] = data.map((item: any) => ({
        id: item.id,
        creator_id: item.creator_id,
        opponent_id: item.opponent_id,
        exercise_id: item.exercise_id,
        exercise_name: item.exercise_name,
        metric: item.metric as ChallengeMetric,
        target: item.target,
        duration_hours: item.duration_hours as ChallengeDuration,
        message: item.message,
        status: item.status as ChallengeStatus,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
        winner_id: item.winner_id,
        is_draw: Boolean(item.is_draw),
        created_at: item.created_at,
        creator: item.creator
          ? {
              id: item.creator.id,
              name: item.creator.name || 'Athlete',
              username: item.creator.username || null,
              avatar_url: item.creator.avatar_url || null,
            }
          : undefined,
        opponent: item.opponent
          ? {
              id: item.opponent.id,
              name: item.opponent.name || 'Athlete',
              username: item.opponent.username || null,
              avatar_url: item.opponent.avatar_url || null,
            }
          : undefined,
        creator_score: scoresMap[item.id]?.creator || 0,
        opponent_score: scoresMap[item.id]?.opponent || 0,
      }));

      const requests = challenges.filter(
        (c) => c.status === 'pending' && c.opponent_id === userId
      );
      const active = challenges.filter((c) => c.status === 'active');
      const completed = challenges.filter((c) =>
        ['completed', 'declined', 'cancelled'].includes(c.status)
      );

      return { requests, active, completed, all: challenges };
    } catch (e: any) {
      console.warn('Error in getChallenges:', e?.message);
      return { requests: [], active: [], completed: [], all: [] };
    }
  },

  /**
   * Fetch full details for a single challenge including entries and disputes
   */
  async getChallengeDetail(
    challengeId: string,
    currentUserId: string
  ): Promise<{
    challenge: FriendChallenge;
    entries: FriendChallengeEntry[];
    myDisputesCount: number;
  } | null> {
    if (!challengeId) return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId);

    if (!isSupabaseConfigured || !isUuid) {
      const demo = DEMO_CHALLENGES.find((c) => c.id === challengeId) || DEMO_CHALLENGES[0];
      return {
        challenge: demo,
        entries: [
          {
            id: 'demo-entry-1',
            challenge_id: demo.id,
            user_id: currentUserId,
            amount: 20,
            proof_path: null,
            disputed: false,
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            can_delete: true,
            user: demo.creator,
          },
          {
            id: 'demo-entry-2',
            challenge_id: demo.id,
            user_id: demo.opponent_id,
            amount: 25,
            proof_path: null,
            disputed: false,
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            can_delete: false,
            user: demo.opponent,
          },
        ],
        myDisputesCount: 0,
      };
    }

    try {
      await this.finalizeExpiredChallenges();

      // 1. Fetch challenge row
      const { data: chData, error: chError } = await supabase
        .from('friend_challenges')
        .select(`
          *,
          creator:creator_id (id, name, username, avatar_url),
          opponent:opponent_id (id, name, username, avatar_url)
        `)
        .eq('id', challengeId)
        .maybeSingle();

      if (chError || !chData) {
        console.warn('Challenge not found in DB, falling back to demo:', chError?.message);
        const demo = DEMO_CHALLENGES.find((c) => c.id === challengeId) || DEMO_CHALLENGES[0];
        return {
          challenge: demo,
          entries: [
            {
              id: 'demo-entry-1',
              challenge_id: demo.id,
              user_id: currentUserId,
              amount: 20,
              proof_path: null,
              disputed: false,
              created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              can_delete: true,
              user: demo.creator,
            },
            {
              id: 'demo-entry-2',
              challenge_id: demo.id,
              user_id: demo.opponent_id,
              amount: 25,
              proof_path: null,
              disputed: false,
              created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              can_delete: false,
              user: demo.opponent,
            },
          ],
          myDisputesCount: 0,
        };
      }

      // 2. Fetch all entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('friend_challenge_entries')
        .select(`
          *,
          user:user_id (id, name, username, avatar_url)
        `)
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: false });

      if (entriesError) {
        console.warn('Error fetching challenge entries:', entriesError.message);
      }

      // 3. Fetch disputes by current user
      const { data: disputesData } = await supabase
        .from('friend_challenge_disputes')
        .select('entry_id')
        .eq('challenge_id', challengeId)
        .eq('disputer_id', currentUserId);

      const myDisputesCount = disputesData ? disputesData.length : 0;

      // 4. Resolve proof signed URLs
      const rawEntries = entriesData || [];
      const proofPaths = rawEntries.map((e) => e.proof_path).filter(Boolean) as string[];
      const signedUrls = await this.resolveProofSignedUrls(proofPaths);

      const now = Date.now();
      const tenMinutesMs = 10 * 60 * 1000;

      let creatorScore = 0;
      let opponentScore = 0;

      const entries: FriendChallengeEntry[] = rawEntries.map((e: any) => {
        const isMine = e.user_id === currentUserId;
        const entryTime = new Date(e.created_at).getTime();
        const canDelete = isMine && now - entryTime <= tenMinutesMs;

        if (!e.disputed) {
          if (e.user_id === chData.creator_id) {
            creatorScore += e.amount;
          } else if (e.user_id === chData.opponent_id) {
            opponentScore += e.amount;
          }
        }

        return {
          id: e.id,
          challenge_id: e.challenge_id,
          user_id: e.user_id,
          amount: e.amount,
          proof_path: e.proof_path,
          proof_url: e.proof_path ? signedUrls[e.proof_path] || null : null,
          disputed: Boolean(e.disputed),
          created_at: e.created_at,
          can_delete: canDelete,
          user: e.user
            ? {
                id: e.user.id,
                name: e.user.name || 'Athlete',
                username: e.user.username || null,
                avatar_url: e.user.avatar_url || null,
              }
            : undefined,
        };
      });

      const challenge: FriendChallenge = {
        id: chData.id,
        creator_id: chData.creator_id,
        opponent_id: chData.opponent_id,
        exercise_id: chData.exercise_id,
        exercise_name: chData.exercise_name,
        metric: chData.metric as ChallengeMetric,
        target: chData.target,
        duration_hours: chData.duration_hours as ChallengeDuration,
        message: chData.message,
        status: chData.status as ChallengeStatus,
        starts_at: chData.starts_at,
        ends_at: chData.ends_at,
        winner_id: chData.winner_id,
        is_draw: Boolean(chData.is_draw),
        created_at: chData.created_at,
        creator: chData.creator
          ? {
              id: chData.creator.id,
              name: chData.creator.name || 'Athlete',
              username: chData.creator.username || null,
              avatar_url: chData.creator.avatar_url || null,
            }
          : undefined,
        opponent: chData.opponent
          ? {
              id: chData.opponent.id,
              name: chData.opponent.name || 'Athlete',
              username: chData.opponent.username || null,
              avatar_url: chData.opponent.avatar_url || null,
            }
          : undefined,
        creator_score: creatorScore,
        opponent_score: opponentScore,
      };

      return { challenge, entries, myDisputesCount };
    } catch (e: any) {
      console.warn('Error in getChallengeDetail:', e?.message);
      return null;
    }
  },

  /**
   * Create a new challenge against an accepted friend
   */
  async createChallenge(params: CreateChallengeParams): Promise<FriendChallenge> {
    if (!isSupabaseConfigured) {
      const newMock: FriendChallenge = {
        id: `mock-${Date.now()}`,
        creator_id: params.creatorId,
        opponent_id: params.opponentId,
        exercise_id: params.exerciseId,
        exercise_name: params.exerciseName,
        metric: params.metric,
        target: params.target,
        duration_hours: params.durationHours,
        message: params.message?.trim() || null,
        status: 'pending',
        starts_at: null,
        ends_at: null,
        winner_id: null,
        is_draw: false,
        created_at: new Date().toISOString(),
      };
      DEMO_CHALLENGES.unshift(newMock);
      return newMock;
    }

    const isValidUuid = (val?: string | null) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    if (!isValidUuid(params.opponentId)) {
      throw new Error('Please select a valid accepted friend from your friends list.');
    }
    if (!isValidUuid(params.creatorId)) {
      throw new Error('Please log in with a valid account.');
    }

    try {
      const insertPayload: any = {
        creator_id: params.creatorId,
        opponent_id: params.opponentId,
        exercise_id: params.exerciseId,
        exercise_name: params.exerciseName,
        metric: params.metric,
        target: params.target,
        duration_hours: params.durationHours,
        message: params.message?.trim() ? params.message.trim().slice(0, 100) : null,
        status: 'pending',
      };

      let { data, error } = await supabase
        .from('friend_challenges')
        .insert(insertPayload)
        .select(`
          *,
          creator:creator_id (id, name, username, avatar_url),
          opponent:opponent_id (id, name, username, avatar_url)
        `)
        .single();

      // If the database column exercise_id is typed as UUID, retry with null exercise_id
      if (
        error &&
        error.message?.includes('invalid input syntax for type uuid') &&
        params.exerciseId &&
        !isValidUuid(params.exerciseId)
      ) {
        insertPayload.exercise_id = null;
        const retry = await supabase
          .from('friend_challenges')
          .insert(insertPayload)
          .select(`
            *,
            creator:creator_id (id, name, username, avatar_url),
            opponent:opponent_id (id, name, username, avatar_url)
          `)
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        // Intercept free challenge limit error code
        if (
          error.message?.includes('FREE_CHALLENGE_LIMIT_REACHED') ||
          error.details?.includes('FREE_CHALLENGE_LIMIT_REACHED')
        ) {
          const err = new Error('Free users can have at most 3 active challenges at once.');
          (err as any).code = 'FREE_CHALLENGE_LIMIT_REACHED';
          throw err;
        }
        if (error.message?.includes('FRIEND_REQUIRED')) {
          const err = new Error('You can only challenge users who are accepted friends.');
          (err as any).code = 'FRIEND_REQUIRED';
          throw err;
        }
        if (error.message?.includes('USER_BLOCKED')) {
          const err = new Error('Cannot send a challenge to this user.');
          (err as any).code = 'USER_BLOCKED';
          throw err;
        }
        throw new Error(`Failed to send challenge: ${error.message}`);
      }

      return {
        id: data.id,
        creator_id: data.creator_id,
        opponent_id: data.opponent_id,
        exercise_id: data.exercise_id,
        exercise_name: data.exercise_name,
        metric: data.metric,
        target: data.target,
        duration_hours: data.duration_hours,
        message: data.message,
        status: data.status,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        winner_id: data.winner_id,
        is_draw: Boolean(data.is_draw),
        created_at: data.created_at,
        creator: data.creator,
        opponent: data.opponent,
        creator_score: 0,
        opponent_score: 0,
      };
    } catch (e: any) {
      throw e;
    }
  },

  /**
   * Accept an incoming challenge (starts countdown and sets active)
   */
  async acceptChallenge(challengeId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const ch = DEMO_CHALLENGES.find((c) => c.id === challengeId);
      if (ch) {
        ch.status = 'active';
        ch.starts_at = new Date().toISOString();
        ch.ends_at = new Date(Date.now() + ch.duration_hours * 3600 * 1000).toISOString();
      }
      return;
    }

    const { error } = await supabase
      .from('friend_challenges')
      .update({ status: 'active' })
      .eq('id', challengeId);

    if (error) {
      throw new Error(`Failed to accept challenge: ${error.message}`);
    }
  },

  /**
   * Decline an incoming challenge
   */
  async declineChallenge(challengeId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const ch = DEMO_CHALLENGES.find((c) => c.id === challengeId);
      if (ch) ch.status = 'declined';
      return;
    }

    const { error } = await supabase
      .from('friend_challenges')
      .update({ status: 'declined' })
      .eq('id', challengeId);

    if (error) {
      throw new Error(`Failed to decline challenge: ${error.message}`);
    }
  },

  /**
   * Cancel a pending challenge (creator only)
   */
  async cancelChallenge(challengeId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const ch = DEMO_CHALLENGES.find((c) => c.id === challengeId);
      if (ch) ch.status = 'cancelled';
      return;
    }

    const { error } = await supabase
      .from('friend_challenges')
      .update({ status: 'cancelled' })
      .eq('id', challengeId);

    if (error) {
      throw new Error(`Failed to cancel challenge: ${error.message}`);
    }
  },

  /**
   * Upload proof video to private proofs bucket
   * File path: {userId}/{challengeId}-{timestamp}.mp4
   */
  async uploadProofVideo({
    userId,
    challengeId,
    videoUri,
  }: {
    userId: string;
    challengeId: string;
    videoUri: string;
  }): Promise<string> {
    if (!isSupabaseConfigured) {
      return videoUri;
    }

    try {
      const fileId = `${challengeId}-${Date.now()}`;
      const ext = videoUri.toLowerCase().endsWith('.mov') ? 'mov' : 'mp4';
      const storageFilePath = `${userId}/${fileId}.${ext}`;
      const contentType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';

      const arrayBuffer = await fileUriToArrayBuffer(videoUri);

      // Enforce 20 MB max size
      const maxBytes = 20 * 1024 * 1024;
      if (arrayBuffer.byteLength > maxBytes) {
        throw new Error('Video exceeds maximum size limit of 20 MB.');
      }

      let { error: uploadError } = await supabase.storage
        .from(activeProofBucket)
        .upload(storageFilePath, arrayBuffer, {
          contentType,
          upsert: false,
        });

      if (uploadError && uploadError.message?.toLowerCase().includes('not found')) {
        toggleProofBucket();
        const retry = await supabase.storage
          .from(activeProofBucket)
          .upload(storageFilePath, arrayBuffer, {
            contentType,
            upsert: false,
          });
        uploadError = retry.error;
      }

      if (uploadError) {
        throw new Error(`Proof upload failed: ${uploadError.message}`);
      }

      return storageFilePath;
    } catch (e: any) {
      throw new Error(e?.message || 'Failed to upload proof video');
    }
  },

  /**
   * Log reps or seconds entry for an active challenge
   */
  async logEntry({
    challengeId,
    userId,
    amount,
    videoUri,
  }: {
    challengeId: string;
    userId: string;
    amount: number;
    videoUri?: string;
  }): Promise<FriendChallengeEntry> {
    if (amount < 1 || amount > 500) {
      throw new Error('Amount must be between 1 and 500.');
    }

    let proofPath: string | null = null;
    if (videoUri) {
      proofPath = await this.uploadProofVideo({ userId, challengeId, videoUri });
    }

    if (!isSupabaseConfigured) {
      const newEntry: FriendChallengeEntry = {
        id: `mock-entry-${Date.now()}`,
        challenge_id: challengeId,
        user_id: userId,
        amount,
        proof_path: proofPath,
        proof_url: videoUri || null,
        disputed: false,
        created_at: new Date().toISOString(),
        can_delete: true,
      };
      return newEntry;
    }

    try {
      const { data, error } = await supabase
        .from('friend_challenge_entries')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          amount,
          proof_path: proofPath,
        })
        .select(`
          *,
          user:user_id (id, name, username, avatar_url)
        `)
        .single();

      if (error) {
        if (proofPath) {
          // Cleanup uploaded video if insert failed
          await supabase.storage.from(activeProofBucket).remove([proofPath]).catch(() => {});
        }
        throw new Error(`Failed to log entry: ${error.message}`);
      }

      return {
        id: data.id,
        challenge_id: data.challenge_id,
        user_id: data.user_id,
        amount: data.amount,
        proof_path: data.proof_path,
        proof_url: videoUri || null,
        disputed: Boolean(data.disputed),
        created_at: data.created_at,
        can_delete: true,
        user: data.user,
      };
    } catch (e: any) {
      throw e;
    }
  },

  /**
   * Delete user's own entry within 10 minutes of creation
   */
  async deleteEntry(entryId: string, proofPath?: string | null): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('friend_challenge_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        throw new Error(`Failed to delete entry: ${error.message}`);
      }

      if (proofPath) {
        await supabase.storage.from(activeProofBucket).remove([proofPath]).catch(() => {});
      }
    } catch (e: any) {
      throw e;
    }
  },

  /**
   * Dispute other participant's entry (max 3 disputes per challenge)
   */
  async disputeEntry({
    challengeId,
    entryId,
    disputerId,
  }: {
    challengeId: string;
    entryId: string;
    disputerId: string;
  }): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Record dispute in friend_challenge_disputes (trigger validates max 3)
      const { error: disputeError } = await supabase
        .from('friend_challenge_disputes')
        .insert({
          challenge_id: challengeId,
          entry_id: entryId,
          disputer_id: disputerId,
        });

      if (disputeError) {
        if (
          disputeError.message?.includes('MAX_DISPUTES_REACHED') ||
          disputeError.details?.includes('MAX_DISPUTES_REACHED')
        ) {
          throw new Error('You have reached the maximum limit of 3 disputes for this challenge.');
        }
        throw new Error(`Failed to dispute entry: ${disputeError.message}`);
      }

      // 2. Mark entry as disputed
      const { error: entryError } = await supabase
        .from('friend_challenge_entries')
        .update({ disputed: true })
        .eq('id', entryId);

      if (entryError) {
        throw new Error(`Failed to update entry dispute status: ${entryError.message}`);
      }
    } catch (e: any) {
      throw e;
    }
  },

  /**
   * Attach proof video to a disputed entry to make it count again
   */
  async attachProofToDisputedEntry({
    challengeId,
    entryId,
    userId,
    videoUri,
  }: {
    challengeId: string;
    entryId: string;
    userId: string;
    videoUri: string;
  }): Promise<string> {
    const proofPath = await this.uploadProofVideo({ userId, challengeId, videoUri });

    if (!isSupabaseConfigured) return proofPath;

    try {
      const { error } = await supabase
        .from('friend_challenge_entries')
        .update({
          proof_path: proofPath,
          disputed: false,
        })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        await supabase.storage.from(activeProofBucket).remove([proofPath]).catch(() => {});
        throw new Error(`Failed to attach proof: ${error.message}`);
      }

      return proofPath;
    } catch (e: any) {
      throw e;
    }
  },
};
