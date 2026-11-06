import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  leaderboardService,
  LeaderboardEntry,
  ChallengeLeaderboardEntry,
  MyRankResult,
  getCountdownToWeekEnd,
} from '../../services/leaderboardService';
import { getAvatarColor } from '../../services/communityService';

type TabType = 'friends' | 'global' | 'challenges';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [countdown, setCountdown] = useState<string>(getCountdownToWeekEnd());

  // Data states
  const [friendsList, setFriendsList] = useState<LeaderboardEntry[]>([]);
  const [globalList, setGlobalList] = useState<LeaderboardEntry[]>([]);
  const [challengesList, setChallengesList] = useState<ChallengeLeaderboardEntry[]>([]);
  const [myRankInfo, setMyRankInfo] = useState<MyRankResult | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingGlobal, setTogglingGlobal] = useState<boolean>(false);

  // Live countdown timer updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownToWeekEnd());
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        if (activeTab === 'friends') {
          const [fData, rData] = await Promise.all([
            leaderboardService.getFriendsLeaderboard(),
            leaderboardService.getMyRank('friends'),
          ]);
          setFriendsList(fData);
          setMyRankInfo(rData);
        } else if (activeTab === 'global') {
          const [gData, rData] = await Promise.all([
            leaderboardService.getGlobalLeaderboard(undefined, 50),
            leaderboardService.getMyRank('global'),
          ]);
          setGlobalList(gData);
          setMyRankInfo(rData);
        } else {
          const cData = await leaderboardService.getChallengesLeaderboard();
          setChallengesList(cData);
          // For challenges tab, compute gap from the list
          const meIndex = cData.findIndex((c) => c.user_id === user?.id);
          if (meIndex > 0) {
            const me = cData[meIndex];
            const above = cData[meIndex - 1];
            setMyRankInfo({
              my_rank: me.rank,
              my_points: me.weekly_wins,
              points_gap: Math.max(0, above.weekly_wins - me.weekly_wins),
              next_rank_username: above.username,
            });
          } else if (meIndex === 0) {
            setMyRankInfo({
              my_rank: 1,
              my_points: cData[0].weekly_wins,
              points_gap: 0,
              next_rank_username: null,
            });
          } else {
            setMyRankInfo(null);
          }
        }
      } catch (e: any) {
        console.warn('Leaderboard fetch error:', e?.message);
        setError('Failed to load leaderboard. Tap below to retry.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, user?.id]
  );

  // Screen focus & tab change reload
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleToggleGlobal = async (value: boolean) => {
    if (!user?.id || togglingGlobal) return;

    if (value && profile?.account_visibility !== 'public') {
      Alert.alert(
        'Account Visibility Required',
        'To appear on the Global Leaderboard, your account must be visible to Everyone (Public). Please update your privacy setting in General Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Settings',
            onPress: () => router.push('/profile/general-settings' as any),
          },
        ]
      );
      return;
    }

    setTogglingGlobal(true);
    try {
      await leaderboardService.toggleShowOnLeaderboard(user.id, value);
      await refreshProfile();
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update setting');
    } finally {
      setTogglingGlobal(false);
    }
  };

  // Helper for Top 3 vs remaining
  const currentList =
    activeTab === 'friends'
      ? friendsList
      : activeTab === 'global'
      ? globalList
      : challengesList;

  const topThree = currentList.slice(0, 3);
  const remainingList = currentList.slice(3);

  // Check if current user is in top 3
  const isUserInTopThree = topThree.some((item) => item.user_id === user?.id);
  const userEntry = currentList.find((item) => item.user_id === user?.id);

  // Render Podium for ranks 1, 2, 3
  const renderPodium = () => {
    if (topThree.length === 0) return null;

    const rank1 = topThree[0];
    const rank2 = topThree.length > 1 ? topThree[1] : null;
    const rank3 = topThree.length > 2 ? topThree[2] : null;

    const renderPodiumItem = (
      item: LeaderboardEntry | ChallengeLeaderboardEntry | null,
      rank: 1 | 2 | 3
    ) => {
      if (!item) {
        return (
          <View style={[styles.podiumCol, { opacity: 0.3 }]}>
            <View style={styles.podiumAvatarWrapEmpty}>
              <Ionicons name="person-outline" size={26} color={colors.textSecondary} />
            </View>
            <Text style={[styles.podiumUsername, { color: colors.textSecondary }]}>-</Text>
            <View
              style={[
                styles.podiumBase,
                rank === 1
                  ? styles.podiumBaseFirst
                  : rank === 2
                  ? styles.podiumBaseSecond
                  : styles.podiumBaseThird,
                { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' },
              ]}
            >
              <Text style={styles.podiumRankNum}>#{rank}</Text>
            </View>
          </View>
        );
      }

      const isMe = item.user_id === user?.id;
      const initial = (item.name || item.username || 'A').charAt(0).toUpperCase();
      const pointsDisplay =
        'weekly_wins' in item ? `${item.weekly_wins} wins` : `${item.points} pts`;

      const badgeColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';
      const medalIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

      return (
        <TouchableOpacity
          style={styles.podiumCol}
          activeOpacity={0.8}
          onPress={() => {
            if (item.user_id !== user?.id) {
              router.push(`/user/${item.user_id}` as any);
            }
          }}
        >
          {rank === 1 && (
            <View style={styles.crownContainer}>
              <Text style={styles.crownEmoji}>👑</Text>
            </View>
          )}

          <View
            style={[
              styles.podiumAvatarWrap,
              { borderColor: badgeColor },
              isMe && styles.podiumAvatarWrapMe,
            ]}
          >
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.podiumAvatarImg} />
            ) : (
              <View
                style={[
                  styles.podiumAvatarInitial,
                  { backgroundColor: getAvatarColor(item.user_id) },
                ]}
              >
                <Text style={styles.podiumAvatarInitialText}>{initial}</Text>
              </View>
            )}
            <View style={[styles.podiumBadgeTag, { backgroundColor: badgeColor }]}>
              <Text style={styles.podiumBadgeTagText}>{medalIcon}</Text>
            </View>
          </View>

          <Text
            style={[
              styles.podiumUsername,
              { color: isMe ? '#E5252A' : colors.text },
              isMe && { fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {isMe ? 'You' : `@${item.username}`}
          </Text>

          <Text style={[styles.podiumPoints, { color: Colors.primary }]}>
            {pointsDisplay}
          </Text>

          {/* Stepped Pedestal Base */}
          <View
            style={[
              styles.podiumBase,
              rank === 1
                ? styles.podiumBaseFirst
                : rank === 2
                ? styles.podiumBaseSecond
                : styles.podiumBaseThird,
              {
                backgroundColor: isMe
                  ? '#DC2626'
                  : isDarkMode
                  ? rank === 1
                    ? '#334155'
                    : '#1E293B'
                  : rank === 1
                  ? '#FEF08A'
                  : '#F1F5F9',
              },
            ]}
          >
            <Text
              style={[
                styles.podiumRankNum,
                { color: isMe ? '#FFFFFF' : colors.text },
              ]}
            >
              #{rank}
            </Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.podiumRow}>
        {renderPodiumItem(rank2, 2)}
        {renderPodiumItem(rank1, 1)}
        {renderPodiumItem(rank3, 3)}
      </View>
    );
  };

  // Render Row Item (for Ranks 4+)
  const renderRow = (
    item: LeaderboardEntry | ChallengeLeaderboardEntry,
    index: number
  ) => {
    const isMe = item.user_id === user?.id;
    const initial = (item.name || item.username || 'A').charAt(0).toUpperCase();
    const rankNum = item.rank || index + 4;
    const isChallenge = 'weekly_wins' in item;

    return (
      <TouchableOpacity
        key={item.user_id}
        style={[
          styles.rowItem,
          {
            backgroundColor: isMe
              ? isDarkMode
                ? '#450A0A'
                : '#FEF2F2'
              : colors.surface,
            borderColor: isMe ? '#DC2626' : colors.border,
          },
          isMe && styles.rowItemMe,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          if (!isMe) {
            router.push(`/user/${item.user_id}` as any);
          }
        }}
      >
        <Text
          style={[
            styles.rowRank,
            { color: isMe ? '#DC2626' : colors.textSecondary },
            isMe && { fontWeight: '800' },
          ]}
        >
          #{rankNum}
        </Text>

        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.rowAvatar} />
        ) : (
          <View
            style={[
              styles.rowAvatarInitial,
              { backgroundColor: getAvatarColor(item.user_id) },
            ]}
          >
            <Text style={styles.rowAvatarInitialText}>{initial}</Text>
          </View>
        )}

        <View style={styles.rowInfo}>
          <View style={styles.rowNameRow}>
            <Text
              style={[
                styles.rowUsername,
                { color: isMe ? '#DC2626' : colors.text },
                isMe && { fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {isMe ? 'You' : item.name || item.username}
            </Text>
            {isMe && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
            {isChallenge
              ? `${(item as ChallengeLeaderboardEntry).all_time_wins} all-time wins`
              : `@${item.username} • ${(item as LeaderboardEntry).workouts_count || 0} workouts`}
          </Text>
        </View>

        <View style={styles.rowPointsCol}>
          <Text
            style={[
              styles.rowPoints,
              { color: isMe ? '#DC2626' : Colors.primary },
            ]}
          >
            {isChallenge
              ? `${(item as ChallengeLeaderboardEntry).weekly_wins}`
              : `${(item as LeaderboardEntry).points}`}
          </Text>
          <Text style={[styles.rowPointsLabel, { color: colors.textSecondary }]}>
            {isChallenge ? 'wins' : 'pts'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render Empty State
  const renderEmptyState = () => {
    let icon = 'people-outline';
    let title = 'No friends on the board yet';
    let sub = 'Invite friends to SweatFlix or crush a workout today to earn points and climb!';
    let btnText = 'Find Friends';
    let btnAction = () => router.push('/community/search-users' as any);

    if (activeTab === 'global') {
      icon = 'globe-outline';
      title = 'Global leaderboard updating';
      sub = 'Turn on global ranking in your privacy settings to showcase your points!';
      btnText = 'Join Global';
      btnAction = () => handleToggleGlobal(true);
    } else if (activeTab === 'challenges') {
      icon = 'flame-outline';
      title = 'No challenge wins this week';
      sub = 'Compete in head-to-head friend challenges (push-ups, plank, squats) to earn wins and points!';
      btnText = 'Challenge a Friend';
      btnAction = () => router.push('/community/new-challenge' as any);
    }

    return (
      <View style={[styles.emptyStateCard, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name={icon as any} size={36} color={Colors.primary} />
        </View>
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.emptyStateSub, { color: colors.textSecondary }]}>{sub}</Text>
        <TouchableOpacity
          style={[styles.emptyActionBtn, { backgroundColor: Colors.primary }]}
          onPress={btnAction}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyActionBtnText}>{btnText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Sticky bottom bar for "My Rank" if not in top 3
  const renderStickyMyRank = () => {
    if (!userEntry && !myRankInfo) return null;
    if (isUserInTopThree) return null;

    const rank = myRankInfo?.my_rank || userEntry?.rank || 4;
    const points =
      activeTab === 'challenges'
        ? (userEntry as ChallengeLeaderboardEntry)?.weekly_wins || myRankInfo?.my_points || 0
        : (userEntry as LeaderboardEntry)?.points || myRankInfo?.my_points || 0;

    const gap = myRankInfo?.points_gap || 0;
    const nextUser = myRankInfo?.next_rank_username;
    const nextRank = Math.max(1, rank - 1);

    let gapMessage = `You are #${rank}`;
    if (gap > 0 && nextUser) {
      gapMessage = `You are #${rank}, ${gap} ${activeTab === 'challenges' ? 'win' : 'pts'} behind #${nextRank} (@${nextUser})`;
    } else if (gap > 0) {
      gapMessage = `You are #${rank}, ${gap} ${activeTab === 'challenges' ? 'win' : 'pts'} behind #${nextRank}`;
    }

    return (
      <View
        style={[
          styles.stickyBottomBar,
          {
            backgroundColor: isDarkMode ? '#1E1B1B' : '#FFFFFF',
            borderTopColor: '#DC2626',
          },
        ]}
      >
        <View style={styles.stickyLeft}>
          <View style={styles.stickyRankBadge}>
            <Text style={styles.stickyRankText}>#{rank}</Text>
          </View>
          <View style={styles.stickyTextWrap}>
            <Text style={styles.stickyTitle} numberOfLines={1}>
              Your Standing
            </Text>
            <Text style={styles.stickySubtitle} numberOfLines={1}>
              {gapMessage}
            </Text>
          </View>
        </View>

        <View style={styles.stickyRight}>
          <Text style={styles.stickyPointsVal}>{points}</Text>
          <Text style={styles.stickyPointsUnit}>
            {activeTab === 'challenges' ? 'wins' : 'pts'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.root, { backgroundColor: colors.background }]}>
      {/* 1. Header Bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Leaderboard</Text>
          <View style={styles.countdownPill}>
            <Ionicons name="time-outline" size={12} color="#DC2626" />
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/community/league' as any)}
          style={[
            styles.rightActionBtn,
            {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#F59E0B',
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="shield" size={13} color="#D97706" />
          <Text style={{ fontSize: 11, fontWeight: '800', color: isDarkMode ? '#FDE68A' : '#92400E', marginLeft: 4 }}>
            League
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Three Tabs: Friends | Global | Challenges */}
      <View style={[styles.tabsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'friends' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('friends')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeTab === 'friends' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends'
                ? styles.tabTextActive
                : { color: colors.textSecondary },
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'global' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('global')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="globe"
            size={16}
            color={activeTab === 'global' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'global'
                ? styles.tabTextActive
                : { color: colors.textSecondary },
            ]}
          >
            Global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'challenges' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('challenges')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="flame"
            size={16}
            color={activeTab === 'challenges' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'challenges'
                ? styles.tabTextActive
                : { color: colors.textSecondary },
            ]}
          >
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Main Content List */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          !isUserInTopThree && userEntry ? { paddingBottom: 110 } : null,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Global Tab Participation Banner Card */}
        {activeTab === 'global' && !profile?.show_on_leaderboard && (
          <View style={[styles.joinCard, { backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF', borderColor: '#3B82F6' }]}>
            <View style={styles.joinCardHeader}>
              <View style={styles.joinIconWrap}>
                <Ionicons name="earth" size={24} color="#3B82F6" />
              </View>
              <View style={styles.joinTextCol}>
                <Text style={[styles.joinTitle, { color: colors.text }]}>
                  Join the Global Leaderboard
                </Text>
                <Text style={[styles.joinSub, { color: colors.textSecondary }]}>
                  Compete with athletes worldwide and show off your weekly grind.
                </Text>
              </View>
              <Switch
                value={Boolean(profile?.show_on_leaderboard)}
                onValueChange={handleToggleGlobal}
                trackColor={{ false: '#94A3B8', true: Colors.primary }}
                thumbColor="#FFFFFF"
                disabled={togglingGlobal}
              />
            </View>

            {profile?.account_visibility !== 'public' && (
              <View style={styles.joinWarningRow}>
                <Ionicons name="information-circle" size={16} color="#D97706" />
                <Text style={styles.joinWarningText}>
                  Your account is not Public. To join, set Account Visibility to &quot;Everyone (Public)&quot; in Settings.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Loading Skeleton */}
        {loading && !refreshing ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
              Calculating rankings...
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: Colors.primary }]}
              onPress={() => fetchData()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : currentList.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Podium for Ranks 1 to 3 */}
            {renderPodium()}

            {/* List for Ranks 4+ */}
            {remainingList.length > 0 && (
              <View style={styles.remainingSection}>
                <Text style={[styles.remainingTitle, { color: colors.textSecondary }]}>
                  Ranks 4 - {currentList.length}
                </Text>
                {remainingList.map((item, idx) => renderRow(item, idx))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 4. Sticky Bottom Bar for Current User Standing */}
      {renderStickyMyRank()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  rightActionBtn: {
    padding: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  loaderWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
  },
  errorCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginVertical: 40,
    gap: 10,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  // Global tab join card
  joinCard: {
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  joinCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  joinIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTextCol: {
    flex: 1,
  },
  joinTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  joinSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  joinWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  joinWarningText: {
    fontSize: 11,
    color: '#B45309',
    flex: 1,
    fontWeight: '500',
  },
  // Podium Styles
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: -4,
  },
  crownEmoji: {
    fontSize: 24,
  },
  podiumAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    padding: 2,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  podiumAvatarWrapMe: {
    borderColor: '#DC2626',
  },
  podiumAvatarWrapEmpty: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  podiumAvatarInitial: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarInitialText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  podiumBadgeTag: {
    position: 'absolute',
    bottom: -6,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  podiumBadgeTagText: {
    fontSize: 11,
  },
  podiumUsername: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 90,
  },
  podiumPoints: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 8,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumBaseFirst: {
    height: 95,
  },
  podiumBaseSecond: {
    height: 72,
  },
  podiumBaseThird: {
    height: 54,
  },
  podiumRankNum: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
  },
  // Remaining rows section
  remainingSection: {
    marginTop: 8,
  },
  remainingTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowItemMe: {
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  rowRank: {
    width: 32,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  rowAvatarInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowAvatarInitialText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  rowInfo: {
    flex: 1,
  },
  rowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowUsername: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  youBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  rowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  rowPointsCol: {
    alignItems: 'flex-end',
  },
  rowPoints: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
  },
  rowPointsLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Empty State
  emptyStateCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginVertical: 30,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyStateSub: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptyActionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  // Sticky Bottom Bar for User's Rank
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderTopWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  stickyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stickyRankBadge: {
    backgroundColor: '#DC2626',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyRankText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  stickyTextWrap: {
    flex: 1,
  },
  stickyTitle: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  stickySubtitle: {
    color: '#DC2626',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  stickyRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  stickyPointsVal: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 18,
  },
  stickyPointsUnit: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
});
