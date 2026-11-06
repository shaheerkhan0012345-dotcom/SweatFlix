import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  challengeService,
  FriendChallenge,
} from '../../services/challengeService';
import { getAvatarColor } from '../../services/communityService';

type TabType = 'active' | 'requests' | 'completed';

function formatCountdown(endsAt: string | null): string {
  if (!endsAt) return 'Pending start';
  const diffMs = new Date(endsAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Ended';
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  return `${hours}h ${minutes}m left`;
}

export default function ChallengesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [requests, setRequests] = useState<FriendChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<FriendChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<FriendChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadChallenges = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;
      if (isRefresh) setRefreshing(true);

      try {
        const result = await challengeService.getChallenges(user.id);
        setRequests(result.requests);
        setActiveChallenges(result.active);
        setCompletedChallenges(result.completed);
      } catch (err: any) {
        console.warn('Error loading challenges:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [loadChallenges])
  );

  const handleAcceptRequest = async (challengeId: string) => {
    setActionLoadingId(challengeId);
    try {
      await challengeService.acceptChallenge(challengeId);
      await loadChallenges();
      router.push({
        pathname: '/community/challenge-detail',
        params: { id: challengeId },
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to accept challenge');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = async (challengeId: string) => {
    setActionLoadingId(challengeId);
    try {
      await challengeService.declineChallenge(challengeId);
      await loadChallenges();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to decline challenge');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderActiveCard = ({ item }: { item: FriendChallenge }) => {
    const isCreator = item.creator_id === user?.id;
    const opponent = isCreator ? item.opponent : item.creator;
    const myScore = isCreator ? item.creator_score || 0 : item.opponent_score || 0;
    const opponentScore = isCreator ? item.opponent_score || 0 : item.creator_score || 0;

    const myProgress = Math.min(1, myScore / (item.target || 1));
    const oppProgress = Math.min(1, opponentScore / (item.target || 1));
    const timeLeft = formatCountdown(item.ends_at);

    return (
      <TouchableOpacity
        style={[styles.challengeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.88}
        onPress={() =>
          router.push({
            pathname: '/community/challenge-detail',
            params: { id: item.id },
          })
        }
      >
        {/* Top Header */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.exerciseBadge}>
            <Ionicons name="flame" size={14} color="#E5252A" />
            <Text style={styles.exerciseBadgeText} numberOfLines={1}>
              {item.exercise_name}
            </Text>
          </View>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={13} color="#FF8A1F" />
            <Text style={styles.timeBadgeText}>{timeLeft}</Text>
          </View>
        </View>

        {/* Versus Row */}
        <View style={styles.versusRow}>
          {/* User Side */}
          <View style={styles.participantCol}>
            {user?.user_metadata?.avatar_url ? (
              <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatarSmall} />
            ) : (
              <View
                style={[
                  styles.avatarInitialSmall,
                  { backgroundColor: getAvatarColor(user?.id || 'me') },
                ]}
              >
                <Text style={styles.avatarInitialText}>You</Text>
              </View>
            )}
            <Text style={[styles.participantName, { color: colors.text }]} numberOfLines={1}>
              You
            </Text>
            <Text style={styles.scoreText}>
              {myScore} / {item.target} {item.metric}
            </Text>
          </View>

          {/* VS Badge */}
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Opponent Side */}
          <View style={styles.participantCol}>
            {opponent?.avatar_url ? (
              <Image source={{ uri: opponent.avatar_url }} style={styles.avatarSmall} />
            ) : (
              <View
                style={[
                  styles.avatarInitialSmall,
                  { backgroundColor: getAvatarColor(opponent?.id || 'opp') },
                ]}
              >
                <Text style={styles.avatarInitialText}>
                  {(opponent?.name || 'F').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.participantName, { color: colors.text }]} numberOfLines={1}>
              {opponent?.username ? `@${opponent.username}` : opponent?.name || 'Friend'}
            </Text>
            <Text style={styles.scoreText}>
              {opponentScore} / {item.target} {item.metric}
            </Text>
          </View>
        </View>

        {/* Dual Progress Bars */}
        <View style={styles.progressContainer}>
          {/* My Progress (Red) */}
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={[styles.progressPercent, { color: '#E5252A' }]}>
                {Math.round(myProgress * 100)}%
              </Text>
            </View>
            <View style={[styles.barBackground, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.max(4, myProgress * 100)}%`, backgroundColor: '#E5252A' },
                ]}
              />
            </View>
          </View>

          {/* Opponent Progress (Orange) */}
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                {opponent?.name?.split(' ')[0] || 'Friend'}’s Progress
              </Text>
              <Text style={[styles.progressPercent, { color: '#FF8A1F' }]}>
                {Math.round(oppProgress * 100)}%
              </Text>
            </View>
            <View style={[styles.barBackground, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.max(4, oppProgress * 100)}%`, backgroundColor: '#FF8A1F' },
                ]}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequestCard = ({ item }: { item: FriendChallenge }) => {
    const creator = item.creator;
    const isWorking = actionLoadingId === item.id;

    return (
      <View style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.requestTopRow}>
          {creator?.avatar_url ? (
            <Image source={{ uri: creator.avatar_url }} style={styles.avatarMedium} />
          ) : (
            <View
              style={[
                styles.avatarInitialMedium,
                { backgroundColor: getAvatarColor(creator?.id || 'def') },
              ]}
            >
              <Text style={styles.avatarInitialMediumText}>
                {(creator?.name || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.requestInfo}>
            <Text style={[styles.requestTitle, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>{creator?.name || 'Friend'}</Text> challenged you!
            </Text>
            <Text style={styles.requestDetail}>
              {item.target} {item.metric} • {item.exercise_name}
            </Text>
            <Text style={styles.requestDuration}>Duration: {item.duration_hours} hours</Text>
          </View>
        </View>

        {item.message ? (
          <View style={[styles.messageBubble, { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' }]}>
            <Text style={[styles.messageText, { color: colors.text }]}>{"\"" + item.message + "\""}</Text>
          </View>
        ) : null}

        <View style={styles.requestActionsRow}>
          <TouchableOpacity
            style={[styles.requestActionBtn, styles.acceptBtn]}
            onPress={() => handleAcceptRequest(item.id)}
            disabled={isWorking}
            activeOpacity={0.8}
          >
            {isWorking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.acceptBtnText}>Accept Challenge</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.requestActionBtn, styles.declineBtn, { borderColor: colors.border }]}
            onPress={() => handleDeclineRequest(item.id)}
            disabled={isWorking}
            activeOpacity={0.8}
          >
            <Text style={[styles.declineBtnText, { color: colors.textSecondary }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCompletedCard = ({ item }: { item: FriendChallenge }) => {
    const isCreator = item.creator_id === user?.id;
    const opponent = isCreator ? item.opponent : item.creator;
    const myScore = isCreator ? item.creator_score || 0 : item.opponent_score || 0;
    const opponentScore = isCreator ? item.opponent_score || 0 : item.creator_score || 0;

    let badgeText = 'Draw';
    let badgeColor = '#64748B';
    let badgeIcon: any = 'pause-circle';

    if (item.status === 'declined') {
      badgeText = 'Declined';
      badgeColor = '#94A3B8';
      badgeIcon = 'close-circle';
    } else if (item.status === 'cancelled') {
      badgeText = 'Cancelled';
      badgeColor = '#94A3B8';
      badgeIcon = 'close-circle';
    } else if (item.is_draw) {
      badgeText = 'Draw';
      badgeColor = '#F59E0B';
      badgeIcon = 'git-commit';
    } else if (item.winner_id === user?.id) {
      badgeText = 'You Won! 🏆';
      badgeColor = '#10B981';
      badgeIcon = 'trophy';
    } else if (item.winner_id) {
      badgeText = `${opponent?.name?.split(' ')[0] || 'Opponent'} Won`;
      badgeColor = '#EF4444';
      badgeIcon = 'medal';
    }

    return (
      <TouchableOpacity
        style={[styles.completedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.88}
        onPress={() =>
          router.push({
            pathname: '/community/challenge-detail',
            params: { id: item.id },
          })
        }
      >
        <View style={styles.completedHeader}>
          <View style={[styles.resultBadge, { backgroundColor: badgeColor + '20' }]}>
            <Ionicons name={badgeIcon} size={13} color={badgeColor} />
            <Text style={[styles.resultBadgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
          <Text style={styles.completedDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={[styles.completedExercise, { color: colors.text }]}>
          {item.target} {item.metric} {item.exercise_name}
        </Text>

        <View style={styles.completedScoresRow}>
          <Text style={[styles.completedScoreText, { color: colors.text }]}>
            You: <Text style={{ fontWeight: '700' }}>{myScore}</Text>
          </Text>
          <Text style={styles.completedDivider}>•</Text>
          <Text style={[styles.completedScoreText, { color: colors.text }]}>
            {opponent?.name?.split(' ')[0] || 'Friend'}:{' '}
            <Text style={{ fontWeight: '700' }}>{opponentScore}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const currentList =
    activeTab === 'requests'
      ? requests
      : activeTab === 'active'
      ? activeChallenges
      : completedChallenges;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.text }]}>Friend Challenges</Text>

        <TouchableOpacity
          onPress={() => router.push('/community/new-challenge' as any)}
          style={[styles.newBtn, { backgroundColor: Colors.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'active' && styles.tabItemActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'active' ? Colors.primary : colors.textSecondary },
            ]}
          >
            Active ({activeChallenges.length})
          </Text>
          {activeTab === 'active' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'requests' && styles.tabItemActive]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'requests' ? Colors.primary : colors.textSecondary },
              ]}
            >
              Requests
            </Text>
            {requests.length > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{requests.length}</Text>
              </View>
            )}
          </View>
          {activeTab === 'requests' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'completed' && styles.tabItemActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'completed' ? Colors.primary : colors.textSecondary },
            ]}
          >
            Completed ({completedChallenges.length})
          </Text>
          {activeTab === 'completed' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading challenges...</Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id}
          renderItem={
            activeTab === 'requests'
              ? renderRequestCard
              : activeTab === 'active'
              ? renderActiveCard
              : renderCompletedCard
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadChallenges(true)}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' }]}>
                <Ionicons
                  name={
                    activeTab === 'requests'
                      ? 'mail-open-outline'
                      : activeTab === 'active'
                      ? 'flame-outline'
                      : 'trophy-outline'
                  }
                  size={42}
                  color={Colors.primary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeTab === 'requests'
                  ? 'No incoming requests'
                  : activeTab === 'active'
                  ? 'No active challenges'
                  : 'No completed challenges yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'requests'
                  ? 'When friends challenge you, they will appear right here.'
                  : activeTab === 'active'
                  ? 'Ready to test your limits? Challenge an accepted friend!'
                  : 'Your past challenge victories and results will be recorded here.'}
              </Text>

              {activeTab === 'active' && (
                <TouchableOpacity
                  style={[styles.emptyActionBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => router.push('/community/new-challenge' as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="flame" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyActionBtnText}>Start a Challenge</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  navBtn: {
    padding: Spacing.xs,
  },
  navTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700',
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 3,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 3,
    width: '80%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  badgeCount: {
    backgroundColor: '#E5252A',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  // Active Challenge Card
  challengeCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5252A15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    maxWidth: '65%',
  },
  exerciseBadgeText: {
    color: '#E5252A',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8A1F15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  timeBadgeText: {
    color: '#FF8A1F',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  versusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  participantCol: {
    flex: 1,
    alignItems: 'center',
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
  },
  avatarInitialSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarInitialText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  participantName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: '500',
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5252A',
  },
  vsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  progressContainer: {
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F020',
  },
  progressBarWrapper: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Request Card
  requestCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMedium: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.sm,
  },
  avatarInitialMedium: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarInitialMediumText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  requestDetail: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  requestDuration: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  messageBubble: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  messageText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  requestActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  requestActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  acceptBtn: {
    backgroundColor: '#E5252A',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  declineBtn: {
    borderWidth: 1,
  },
  declineBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  // Completed Card
  completedCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  completedDate: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  completedExercise: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  completedScoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  completedScoreText: {
    fontSize: 12,
  },
  completedDivider: {
    marginHorizontal: 6,
    color: Colors.textGrey,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
