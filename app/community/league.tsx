import React, { useState, useCallback, useMemo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  leagueService,
  LeagueGroupOverview,
  LeagueMember,
  LeagueTier,
} from '../../services/leagueService';
import { leaderboardService } from '../../services/leaderboardService';
import { getAvatarColor } from '../../services/communityService';
import { LeagueRulesModal } from '../../components/LeagueRulesModal';
import { LeagueResultModal } from '../../components/LeagueResultModal';

export default function LeagueScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [leagueData, setLeagueData] = useState<LeagueGroupOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  const currentTier: LeagueTier = (profile?.league_tier || 'Bronze') as LeagueTier;
  const tierMeta = useMemo(() => leagueService.getTierMeta(currentTier), [currentTier]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      let pts = 0;
      if (user?.id) {
        pts = await leaderboardService.getUserPointsThisWeek(user.id);
      }
      const data = await leagueService.getMyLeague(user?.id, currentTier, pts);
      setLeagueData(data);
    } catch (err: any) {
      console.warn('LeagueScreen load error:', err?.message);
      setError('Could not load league rankings. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, currentTier]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleTestReset = async (type: 'promoted' | 'champion' | 'demoted') => {
    try {
      const seeded = await leagueService.seedTestResult(type);
      setTestResult(seeded);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not trigger test reset');
    }
  };

  const renderMemberRow = ({ item, index }: { item: LeagueMember; index: number }) => {
    const isTop5 = item.rank <= 5;
    const isBottom5 = item.rank > 25 && item.points > 0;

    let zoneColor = 'transparent';
    let zoneBorder = colors.border;

    if (isTop5) {
      zoneColor = isDarkMode ? 'rgba(234, 88, 12, 0.12)' : '#FFF7ED';
      zoneBorder = '#FB923C';
    } else if (isBottom5) {
      zoneColor = isDarkMode ? 'rgba(220, 38, 38, 0.10)' : '#FEF2F2';
      zoneBorder = '#F87171';
    }

    const isYou = item.is_current_user;
    const medalColor =
      item.rank === 1
        ? '#EAB308'
        : item.rank === 2
        ? '#94A3B8'
        : item.rank === 3
        ? '#B45309'
        : colors.textSecondary;

    return (
      <View>
        {/* Section Header Divider for Zones */}
        {item.rank === 1 && (
          <View style={styles.zoneDivider}>
            <View style={[styles.zonePill, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="arrow-up" size={11} color="#EA580C" />
              <Text style={[styles.zonePillText, { color: '#EA580C' }]}>
                Promotion Zone • Top 5 Move Up
              </Text>
            </View>
          </View>
        )}
        {item.rank === 6 && (
          <View style={styles.zoneDivider}>
            <View style={[styles.zonePill, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
              <Text style={[styles.zonePillText, { color: colors.textSecondary }]}>
                Safe Zone • Maintains Division
              </Text>
            </View>
          </View>
        )}
        {item.rank === 26 && (
          <View style={styles.zoneDivider}>
            <View style={[styles.zonePill, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="arrow-down" size={11} color="#DC2626" />
              <Text style={[styles.zonePillText, { color: '#DC2626' }]}>
                Demotion Zone • Bottom 5 Move Down
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.memberRow,
            {
              backgroundColor: isYou
                ? isDarkMode
                  ? '#1E293B'
                  : '#FFF2E5'
                : zoneColor !== 'transparent'
                ? zoneColor
                : isDarkMode
                ? '#0F172A'
                : '#FFFFFF',
              borderColor: isYou ? Colors.primary : zoneBorder,
              borderWidth: isYou ? 2 : 1,
            },
          ]}
          onPress={() => {
            if (!item.is_private && !item.is_current_user && item.user_id && !item.user_id.startsWith('sim-')) {
              router.push(`/user/${item.user_id}` as any);
            }
          }}
          activeOpacity={item.is_private ? 1 : 0.75}
        >
          {/* Rank Number / Medal */}
          <View style={styles.rankCol}>
            {item.rank <= 3 ? (
              <Ionicons name="trophy" size={16} color={medalColor} />
            ) : (
              <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>
                {item.rank}
              </Text>
            )}
          </View>

          {/* Avatar / Initial circle */}
          <View style={styles.avatarWrap}>
            {item.avatar_url && !item.is_private ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={styles.avatarImg}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: getAvatarColor(item.name || 'Player') },
                ]}
              >
                <Text style={styles.avatarInitial}>
                  {(item.name || 'P').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {item.is_weekly_champion && (
              <View style={styles.championCrownBubble}>
                <Ionicons name="trophy" size={9} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Name & username */}
          <View style={styles.memberInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  styles.memberName,
                  { color: isYou ? Colors.primary : colors.text },
                ]}
                numberOfLines={1}
              >
                {item.is_private ? 'Player' : item.name}
              </Text>
              {isYou && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>YOU</Text>
                </View>
              )}
            </View>
            <Text style={[styles.memberUser, { color: colors.textSecondary }]}>
              {item.is_private ? 'Private account' : `@${item.username || 'athlete'}`}
            </Text>
          </View>

          {/* Points */}
          <View style={styles.pointsCol}>
            <Text
              style={[
                styles.pointsValue,
                { color: isYou ? Colors.primary : isTop5 ? '#EA580C' : colors.text },
              ]}
            >
              {item.points}
            </Text>
            <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>pts</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Weekly League</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {tierMeta.tier} Division • Ends in {leagueData?.countdown || 'calculating...'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowRulesModal(true)}
          style={styles.headerInfoBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading league cohort...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={44} color="#EF4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={leagueData?.members || []}
          keyExtractor={(item) => item.user_id}
          renderItem={renderMemberRow}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* Metallic Tier Overview Card */}
              <View
                style={[
                  styles.tierCard,
                  {
                    backgroundColor: isDarkMode ? tierMeta.darkBg : tierMeta.lightBg,
                    borderColor: tierMeta.borderColor,
                  },
                ]}
              >
                <View style={styles.tierCardTop}>
                  <View style={styles.tierCardLeft}>
                    <View style={[styles.tierCardBadge, { backgroundColor: tierMeta.color }]}>
                      <Ionicons name={tierMeta.icon as any} size={22} color="#FFFFFF" />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.tierCardTitle, { color: tierMeta.color }]}>
                          {tierMeta.tier} League
                        </Text>
                        {profile?.is_weekly_champion && (
                          <View style={styles.championPill}>
                            <Ionicons name="trophy" size={11} color="#EAB308" />
                            <Text style={styles.championPillText}>CHAMPION</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.tierCardDesc, { color: colors.textSecondary }]}>
                        {tierMeta.description}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Status Stats Row */}
                <View
                  style={[
                    styles.statsRow,
                    {
                      backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                    },
                  ]}
                >
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {leagueData?.user_rank ? `#${leagueData.user_rank}` : '--'}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Your Rank
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: Colors.primary }]}>
                      {leagueData?.user_points ?? 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Week Pts
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {leagueData?.members.length ?? 0} / 30
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Athletes
                    </Text>
                  </View>
                </View>

                {/* Countdown ribbon */}
                <View style={styles.countdownRibbon}>
                  <Ionicons name="timer-outline" size={13} color={tierMeta.color} />
                  <Text style={[styles.countdownRibbonText, { color: tierMeta.color }]}>
                    Reset in {leagueData?.countdown || '6 days'} • Top 5 advance
                  </Text>
                </View>
              </View>

              {/* Not Joined Yet / 0 points Banner */}
              {!leagueData?.is_joined && (
                <View
                  style={[
                    styles.unrankedBanner,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7',
                      borderColor: '#F59E0B',
                    },
                  ]}
                >
                  <Ionicons name="flame" size={24} color="#D97706" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.unrankedBannerTitle}>
                      Earn your first points to join this week&apos;s league!
                    </Text>
                    <Text style={styles.unrankedBannerSub}>
                      Complete any workout or win a challenge today to enter the 30-player competition.
                    </Text>
                    <TouchableOpacity
                      style={styles.startWorkoutBtn}
                      onPress={() => router.push('/(tabs)' as any)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.startWorkoutBtnText}>Start Workout 🔥</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Section Header */}
              <View style={styles.listSectionHeader}>
                <Text style={[styles.listSectionTitle, { color: colors.text }]}>
                  Division Standings (30 Athletes)
                </Text>
                <TouchableOpacity
                  onPress={() => setShowRulesModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.howItWorksLink}>Rules & Rewards</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footerWrap}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Rankings refresh in real time as workouts and challenges are completed.
              </Text>

              {/* Developer / Demo Testing Tools */}
              {__DEV__ && (
                <View style={styles.devTools}>
                  <Text style={[styles.devToolsTitle, { color: colors.textSecondary }]}>
                    🧪 Developer Test Tools
                  </Text>
                  <View style={styles.devButtonsRow}>
                    <TouchableOpacity
                      style={[styles.devBtn, { backgroundColor: '#EA580C' }]}
                      onPress={() => handleTestReset('promoted')}
                    >
                      <Text style={styles.devBtnText}>Test Promotion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.devBtn, { backgroundColor: '#D97706' }]}
                      onPress={() => handleTestReset('champion')}
                    >
                      <Text style={styles.devBtnText}>Test Champion (#1)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.devBtn, { backgroundColor: '#DC2626' }]}
                      onPress={() => handleTestReset('demoted')}
                    >
                      <Text style={styles.devBtnText}>Test Demotion</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          }
        />
      )}

      {/* Rules Explainer Sheet */}
      <LeagueRulesModal
        visible={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Result Popup for Monday Reset / Testing */}
      <LeagueResultModal
        forcedResult={testResult}
        onDismiss={() => setTestResult(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBackBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  headerInfoBtn: {
    padding: 6,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  tierCard: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
  },
  tierCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tierCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tierCardBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tierCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  tierCardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
  championPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  championPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  countdownRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  countdownRibbonText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  unrankedBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unrankedBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  unrankedBannerSub: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
    marginBottom: 10,
  },
  startWorkoutBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  startWorkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  listSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  howItWorksLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  zoneDivider: {
    alignItems: 'center',
    marginVertical: 6,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  zonePillText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
  },
  rankCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  avatarWrap: {
    position: 'relative',
    marginLeft: 6,
    marginRight: 10,
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  championCrownBubble: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberUser: {
    fontSize: 11,
    marginTop: 2,
  },
  youBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  pointsCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  pointsValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  pointsLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  footerWrap: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  devTools: {
    marginTop: 20,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    alignItems: 'center',
  },
  devToolsTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },
  devButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  devBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
