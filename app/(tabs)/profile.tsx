import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  Share,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as StoreReview from 'expo-store-review';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { WeeklyActivityChart } from '../../components/WeeklyActivityChart';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import { useHomeProgress, getTodayDayIndex } from '../../context/HomeProgressContext';
import { usePremium } from '../../context/PremiumContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import { isTestToolsEnabled } from '../../lib/config';
import { communityService, CommunityPost, getAvatarColor } from '../../services/communityService';
import { friendsService } from '../../services/friendsService';
import { leaderboardService, getLevelInfo } from '../../services/leaderboardService';
import { LeagueTierBadge } from '../../components/LeagueTierBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const POST_COLUMNS = 3;
const THUMB_SIZE = Math.floor((SCREEN_WIDTH - 32 - (POST_COLUMNS - 1) * GRID_GAP) / POST_COLUMNS);

// Instagram Story Highlights Mock Data
const STORY_HIGHLIGHTS = [
  { id: '1', title: 'PRs 🏆', icon: 'trophy', color: '#F59E0B' },
  { id: '2', title: 'Workouts 🎥', icon: 'barbell', color: '#EF4444' },
  { id: '3', title: 'Meal Prep 🥗', icon: 'restaurant', color: '#10B981' },
  { id: '4', title: 'Gains 💪', icon: 'fitness', color: '#3B82F6' },
  { id: '5', title: 'Hydration ⚡', icon: 'water', color: '#06B6D4' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state: onboardingState } = useOnboarding();
  const { progress } = useHomeProgress();
  const { isPremium } = usePremium();
  const { settings, resetAllData } = useSettings();
  const { profile, signOut, deleteAccount } = useAuth();
  const { metrics, bmi, bmiCategory } = useHealthMetrics();

  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Instagram-style active tab: 'posts' | 'stats' | 'settings'
  const [activeTab, setActiveTab] = useState<'posts' | 'stats' | 'settings'>('posts');

  // Instagram-style Follower interactive state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerDelta, setFollowerDelta] = useState(0);

  // User posts and friends count
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [weeklyPoints, setWeeklyPoints] = useState<number>(0);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      if (profile?.id) {
        Promise.all([
          communityService.getUserPosts({ targetUserId: profile.id, viewerId: profile.id, limit: 12 }),
          friendsService.getFriendsList(profile.id),
          leaderboardService.getUserPointsThisWeek(profile.id),
        ])
          .then(([posts, friends, weekPts]) => {
            if (isMounted) {
              setMyPosts(posts);
              setFriendsCount(friends.length);
              setWeeklyPoints(weekPts);
              setLoadingPosts(false);
            }
          })
          .catch(() => {
            if (isMounted) setLoadingPosts(false);
          });
      } else {
        setLoadingPosts(false);
      }
      return () => {
        isMounted = false;
      };
    }, [profile])
  );

  const displayName = profile?.name || settings.name || 'SweatFlix Athlete';
  const username = profile?.username || 'athlete';
  const isImperial = settings.workoutSettings.units === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Format weights
  const rawCurrentWeight = metrics.currentWeightKg || profile?.weight_kg || parseFloat(onboardingState.weight) || 72;
  const rawGoalWeight = metrics.targetWeightKg || profile?.goal_kg || parseFloat(onboardingState.goalWeight) || 70;
  const displayCurrentWeight = isImperial
    ? `${Math.round(rawCurrentWeight * 2.20462)} ${weightUnit}`
    : `${rawCurrentWeight} ${weightUnit}`;
  const displayGoalWeight = isImperial
    ? `${Math.round(rawGoalWeight * 2.20462)} ${weightUnit}`
    : `${rawGoalWeight} ${weightUnit}`;

  const totalCalories = progress.totalKcal || progress.completedCount * 280;
  const totalWorkouts = progress.totalWorkouts || progress.completedCount;
  const todayIndex = getTodayDayIndex();
  const userInitial = displayName.charAt(0).toUpperCase();
  const totalLifetimePoints = profile?.total_points || 0;
  const levelInfo = getLevelInfo(totalLifetimePoints);

  // Dynamic calculated followers & following
  const baseFollowers = 1240 + friendsCount * 8;
  const totalFollowers = baseFollowers + followerDelta;
  const totalFollowing = 184 + friendsCount;

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerDelta((prev) => prev - 1);
    } else {
      setIsFollowing(true);
      setFollowerDelta((prev) => prev + 1);
      Alert.alert('Following! 🎉', `You are now following @${username}. Their workout updates will appear in your feed.`);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out @${username}'s fitness profile and workout journey on SweatFlix! 💪\nhttps://sweatflix.app/@${username}`,
      });
    } catch {
      // Fallback
    }
  };

  const handleRateUs = async () => {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        Alert.alert(
          'Rate SweatFlix ⭐',
          'Thank you for using SweatFlix! In-app rating dialogs are active in app store production builds.'
        );
      }
    } catch {
      Alert.alert('Rate SweatFlix', 'Thank you for your rating and feedback!');
    }
  };

  const handleConfirmReset = async () => {
    setShowResetModal(false);
    await resetAllData();
    router.replace('/');
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login' as any);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    await deleteAccount();
    await resetAllData();
    router.replace('/login' as any);
  };

  return (
    <ScreenContainer scrollable edges={['left', 'right']} contentContainerStyle={styles.container}>
      {/* 1. Instagram Top Bar: Username, Verified Check, League Badge, Actions */}
      <View style={styles.igTopBar}>
        <View style={styles.igTopBarLeft}>
          <Text style={styles.igUsernameText} numberOfLines={1}>
            @{username}
          </Text>
          <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verifiedIcon} />
          <LeagueTierBadge
            tier={profile?.league_tier || 'Bronze'}
            size="small"
            showCrown={Boolean(profile?.is_weekly_champion)}
            onPress={() => router.push('/community/league' as any)}
            style={{ marginLeft: 6 }}
          />
        </View>

        <View style={styles.igTopBarActions}>
          <TouchableOpacity onPress={handleShareProfile} style={styles.igTopIconBtn} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={20} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('settings')} style={styles.igTopIconBtn} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={20} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Instagram Profile Header: Avatar with Flame Ring + 4-Column Stats */}
      <View style={styles.igProfileHeader}>
        <View style={styles.igAvatarAndStatsRow}>
          {/* Avatar with Gradient Story Ring */}
          <View style={styles.igAvatarContainer}>
            <LinearGradient
              colors={['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.igStoryRing}
            >
              <View style={styles.igAvatarInnerBorder}>
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.igAvatarImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View
                    style={[
                      styles.igAvatarCircle,
                      { backgroundColor: getAvatarColor(profile?.id || 'self') },
                    ]}
                  >
                    <Text style={styles.igAvatarInitial}>{userInitial}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>

            {/* Streak Flame Pill Overlay */}
            <View style={styles.igFlameBadge}>
              <Ionicons name="flame" size={11} color="#FFFFFF" />
            </View>
          </View>

          {/* 4-Column Instagram Stats */}
          <View style={styles.igStatsRow}>
            <View style={styles.igStatColumn}>
              <Text style={styles.igStatNumber}>{myPosts.length}</Text>
              <Text style={styles.igStatLabel}>Posts</Text>
            </View>

            <TouchableOpacity
              style={styles.igStatColumn}
              onPress={() => router.push('/community/friends' as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.igStatNumber}>{totalFollowers.toLocaleString()}</Text>
              <Text style={styles.igStatLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.igStatColumn}
              onPress={() => router.push('/community/friends' as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.igStatNumber}>{totalFollowing}</Text>
              <Text style={styles.igStatLabel}>Following</Text>
            </TouchableOpacity>

            <View style={styles.igStatColumn}>
              <Text style={[styles.igStatNumber, { color: '#FF5A00' }]}>{progress.streak}</Text>
              <Text style={styles.igStatLabel}>Streak 🔥</Text>
            </View>
          </View>
        </View>

        {/* Bio & Details Section */}
        <View style={styles.igBioSection}>
          <View style={styles.igNameRow}>
            <Text style={styles.igDisplayName}>{displayName}</Text>
            {isPremium ? (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>👑 PRO</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.igCategoryLabel}>Fitness Athlete & Creator ⚡</Text>

          <Text style={styles.igBioText}>
            {profile?.bio || 'Chasing progress, not perfection 🏋️‍♂️ • Training daily with SweatFlix'}
          </Text>

          <TouchableOpacity style={styles.igLinkRow} onPress={handleShareProfile} activeOpacity={0.7}>
            <Ionicons name="link-outline" size={13} color="#2563EB" />
            <Text style={styles.igLinkText}>sweatflix.app/@{username}</Text>
          </TouchableOpacity>
        </View>

        {/* Instagram Action Buttons: Follow / Edit / Share */}
        <View style={styles.igActionButtonsRow}>
          <TouchableOpacity
            style={[styles.igFollowBtn, isFollowing ? styles.igFollowingBtn : styles.igPrimaryFollowBtn]}
            onPress={handleToggleFollow}
            activeOpacity={0.8}
          >
            {isFollowing ? (
              <View style={styles.igBtnInner}>
                <Ionicons name="checkmark" size={15} color={Colors.textDark} />
                <Text style={styles.igFollowingBtnText}>Following</Text>
              </View>
            ) : (
              <View style={styles.igBtnInner}>
                <Ionicons name="person-add" size={14} color="#FFFFFF" />
                <Text style={styles.igFollowBtnText}>Follow</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.igEditBtn}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={13} color={Colors.textDark} />
            <Text style={styles.igEditBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.igIconSquareBtn}
            onPress={handleShareProfile}
            activeOpacity={0.8}
          >
            <Ionicons name="paper-plane-outline" size={16} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Instagram Story Highlights Strip */}
      <View style={styles.igHighlightsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.igHighlightsScroll}
        >
          {/* Add Highlight */}
          <TouchableOpacity
            style={styles.igHighlightItem}
            onPress={() => router.push('/community/new-story' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.igAddHighlightRing}>
              <Ionicons name="add" size={24} color={Colors.textDark} />
            </View>
            <Text style={styles.igHighlightTitle}>New</Text>
          </TouchableOpacity>

          {/* Highlights Circles */}
          {STORY_HIGHLIGHTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.igHighlightItem}
              onPress={() => router.push('/community/challenges' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.igHighlightRing, { borderColor: item.color }]}>
                <View style={[styles.igHighlightIconCircle, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
              </View>
              <Text style={styles.igHighlightTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. Instagram 3-Tab Selector: ⊞ Grid | 📊 Stats | ⚙️ Settings */}
      <View style={styles.igTabBar}>
        <TouchableOpacity
          style={[styles.igTabItem, activeTab === 'posts' && styles.igTabItemActive]}
          onPress={() => setActiveTab('posts')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="grid-outline"
            size={22}
            color={activeTab === 'posts' ? Colors.primary : Colors.textGrey}
          />
          <Text style={[styles.igTabLabel, activeTab === 'posts' && styles.igTabLabelActive]}>
            Workouts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.igTabItem, activeTab === 'stats' && styles.igTabItemActive]}
          onPress={() => setActiveTab('stats')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="bar-chart-outline"
            size={22}
            color={activeTab === 'stats' ? Colors.primary : Colors.textGrey}
          />
          <Text style={[styles.igTabLabel, activeTab === 'stats' && styles.igTabLabelActive]}>
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.igTabItem, activeTab === 'settings' && styles.igTabItemActive]}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={activeTab === 'settings' ? Colors.primary : Colors.textGrey}
          />
          <Text style={[styles.igTabLabel, activeTab === 'settings' && styles.igTabLabelActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. TAB 1: Instagram Post Grid */}
      {activeTab === 'posts' && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.tabContentContainer}>
          <View style={styles.postsHeaderBar}>
            <Text style={styles.postsSectionTitle}>Workout Feed ({myPosts.length})</Text>
            <TouchableOpacity
              style={styles.shareNewPostBtn}
              onPress={() => router.push('/community/new-post' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
              <Text style={styles.shareNewPostText}>Share Post</Text>
            </TouchableOpacity>
          </View>

          {loadingPosts ? (
            <View style={styles.postsLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : myPosts.length === 0 ? (
            <View style={styles.postsEmptyState}>
              <View style={styles.postsEmptyIconWrap}>
                <Ionicons name="camera-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.postsEmptyTitle}>No Workout Posts Yet</Text>
              <Text style={styles.postsEmptySub}>
                Capture your workout, celebrate personal records, and inspire the SweatFlix community.
              </Text>
              <TouchableOpacity
                style={styles.postsShareBtn}
                onPress={() => router.push('/community/new-post' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.postsShareBtnText}>Share First Workout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.postsGrid}>
              {myPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postThumbWrapper}
                  onPress={() => router.push(`/community/post-detail?id=${post.id}` as any)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: post.image_url }}
                    style={styles.postThumbImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                  />
                  <View style={styles.thumbVisibilityBadge}>
                    <Ionicons
                      name={
                        post.visibility === 'public'
                          ? 'globe-outline'
                          : post.visibility === 'friends'
                          ? 'people-outline'
                          : 'lock-closed-outline'
                      }
                      size={10}
                      color="#FFFFFF"
                    />
                  </View>
                  {post.likes_count > 0 && (
                    <View style={styles.thumbLikesBadge}>
                      <Ionicons name="heart" size={10} color="#EF4444" />
                      <Text style={styles.thumbLikesText}>{post.likes_count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {/* 6. TAB 2: Fitness Stats & Metrics */}
      {activeTab === 'stats' && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.tabContentContainer}>
          {/* Level Progress Banner */}
          <Card style={styles.levelCard}>
            <View style={styles.levelCardHeader}>
              <View style={styles.levelBadgeWrap}>
                <View style={[styles.levelBadge, { backgroundColor: levelInfo.badgeColor }]}>
                  <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                  <Text style={styles.levelBadgeText}>{levelInfo.currentLevel}</Text>
                </View>
                <Text style={styles.levelPointsSubtitle}>
                  {totalLifetimePoints.toLocaleString()} lifetime points
                </Text>
              </View>

              <TouchableOpacity
                style={styles.viewLeaderboardBtn}
                onPress={() => router.push('/community/leaderboard' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewLeaderboardText}>Leaderboard</Text>
                <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.levelProgressSection}>
              <View style={styles.levelProgressHeader}>
                <Text style={styles.levelProgressLabel}>
                  {levelInfo.nextLevel ? `Next Tier: ${levelInfo.nextLevel}` : 'Top Tier Unlocked 👑'}
                </Text>
                <Text style={styles.levelProgressRatio}>
                  {levelInfo.nextLevel ? `${totalLifetimePoints} / ${levelInfo.nextPoints} pts` : `${totalLifetimePoints} pts`}
                </Text>
              </View>

              <View style={styles.levelProgressTrack}>
                <View
                  style={[
                    styles.levelProgressFill,
                    {
                      width: `${Math.max(4, levelInfo.progressPercent)}%`,
                      backgroundColor: levelInfo.badgeColor,
                    },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.weekPointsBanner}
              onPress={() => router.push('/community/league' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.weekPointsLeft}>
                <Ionicons name="trophy" size={20} color="#EAB308" />
                <View>
                  <Text style={styles.weekPointsTitle}>
                    {profile?.league_tier || 'Bronze'} League Score
                  </Text>
                  <Text style={styles.weekPointsSub}>Mon - Sun UTC • Weekly reset</Text>
                </View>
              </View>
              <View style={styles.weekPointsRight}>
                <Text style={styles.weekPointsVal}>{weeklyPoints}</Text>
                <Text style={styles.weekPointsLabel}>pts</Text>
              </View>
            </TouchableOpacity>
          </Card>

          {/* 6 Metric Tiles */}
          <View style={styles.statsGrid}>
            <Card style={styles.statTile}>
              <Ionicons name="speedometer-outline" size={20} color={Colors.primary} />
              <Text style={styles.statVal}>{displayCurrentWeight}</Text>
              <Text style={styles.statLabel}>{t('profile.stats.currentWeight')}</Text>
            </Card>

            <Card style={styles.statTile}>
              <Ionicons name="flag-outline" size={20} color={Colors.accent} />
              <Text style={styles.statVal}>{displayGoalWeight}</Text>
              <Text style={styles.statLabel}>{t('profile.stats.goalWeight')}</Text>
            </Card>

            <Card style={styles.statTile}>
              <Ionicons name="flame-outline" size={20} color="#FF5A00" />
              <Text style={styles.statVal}>{totalCalories} kcal</Text>
              <Text style={styles.statLabel}>{t('profile.stats.caloriesBurned')}</Text>
            </Card>

            <Card style={styles.statTile}>
              <Ionicons name="barbell-outline" size={20} color={Colors.primary} />
              <Text style={styles.statVal}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>{t('profile.stats.workoutsDone')}</Text>
            </Card>

            <Card style={styles.statTile}>
              <Ionicons name="fitness-outline" size={20} color="#10B981" />
              <Text style={styles.statVal}>{bmi}</Text>
              <Text style={styles.statLabel}>{bmiCategory}</Text>
            </Card>

            <Card style={styles.statTile}>
              <Ionicons name="water-outline" size={20} color="#0284C7" />
              <Text style={styles.statVal}>{metrics.waterIntakeMl} ml</Text>
              <Text style={styles.statLabel}>Water Today</Text>
            </Card>
          </View>

          {/* Streak Card */}
          <Card style={styles.streakTile}>
            <View style={styles.streakLeft}>
              <View style={styles.streakIconCircle}>
                <Ionicons name="flame" size={24} color="#FF5A00" />
              </View>
              <View>
                <Text style={styles.streakVal}>{progress.streak} Days</Text>
                <Text style={styles.streakLabel}>{t('profile.stats.currentStreak')}</Text>
              </View>
            </View>
            <Text style={styles.streakEncourage}>
              {progress.streak > 0 ? 'Consistency is key! 🔥' : 'Start your streak today!'}
            </Text>
          </Card>

          {/* Weekly Progress Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{t('profile.chart.title')}</Text>
              <Text style={styles.chartSub}>{t('profile.chart.sub')}</Text>
            </View>
            <WeeklyActivityChart
              completedDays={progress.completedDays}
              todayIndex={todayIndex}
            />
          </Card>
        </Animated.View>
      )}

      {/* 7. TAB 3: Settings & Preferences */}
      {activeTab === 'settings' && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.tabContentContainer}>
          {/* Premium Card */}
          {isPremium ? (
            <Card style={styles.premiumActiveCard}>
              <View style={styles.premiumTop}>
                <Ionicons name="diamond" size={22} color="#FF6B00" />
                <Text style={styles.premiumActiveTitle}>{t('profile.premium.activeTitle')}</Text>
              </View>
              <Text style={styles.premiumActiveSub}>{t('profile.premium.activeSub')}</Text>
            </Card>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/premium')}
              style={styles.premiumBannerCard}
            >
              <View style={styles.premiumBannerTop}>
                <View style={styles.crownCircle}>
                  <Ionicons name="diamond" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.premiumBannerTextWrap}>
                  <Text style={styles.premiumBannerTitle}>{t('profile.premium.bannerTitle')}</Text>
                  <Text style={styles.premiumBannerSub}>{t('profile.premium.bannerSub')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* Workout & App Preferences */}
          <View style={styles.settingsGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/profile/workout-settings')}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#FFEAEA' }]}>
                  <Ionicons name="fitness-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.workoutSettings')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/profile/general-settings')}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#EBF3FF' }]}>
                  <Ionicons name="options-outline" size={18} color="#208AEF" />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.generalSettings')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/profile/language')}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#FFF5E5' }]}>
                  <Ionicons name="globe-outline" size={18} color="#FF8A1F" />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.language')}</Text>
              </View>
              <View style={styles.rowRightBadge}>
                <Text style={styles.rowRightText}>English</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Support & Ratings */}
          <View style={styles.settingsGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/profile/feedback')}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#F0EBF9' }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#7B42BC" />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.feedback')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleRateUs}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#FFFBE6' }]}>
                  <Ionicons name="star-outline" size={18} color="#F5A623" />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.rateUs')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/profile/remove-ads')}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="ban-outline" size={18} color="#2E7D32" />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.removeAds')}</Text>
              </View>
              <View style={styles.rowRightBadge}>
                {settings.adsRemoved || isPremium ? (
                  <Text style={styles.activeTag}>REMOVED</Text>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Legal & Version */}
          <View style={styles.settingsGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/profile/privacy')}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textDark} />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.privacy')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/profile/terms')}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="document-text-outline" size={18} color={Colors.textDark} />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.terms')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
            </TouchableOpacity>

            <View style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="information-circle-outline" size={18} color={Colors.textDark} />
                </View>
                <Text style={styles.settingsRowLabel}>{t('profile.sections.version')}</Text>
              </View>
              <Text style={styles.versionText}>v1.0.0 (Build 58)</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDeleteModal(true)}
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconWrap, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                </View>
                <Text style={[styles.settingsRowLabel, { color: '#D32F2F', fontWeight: '600' }]}>
                  Delete my account and data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
            </TouchableOpacity>
          </View>

          {/* Logout & Reset Buttons */}
          <View style={styles.actionsSection}>
            <Button
              title={t('profile.actions.logout')}
              variant="secondary"
              onPress={handleLogout}
              style={styles.logoutButton}
            />

            {isTestToolsEnabled() && (
              <TouchableOpacity
                onPress={() => setShowResetModal(true)}
                style={styles.resetLink}
                activeOpacity={0.7}
              >
                <Text style={styles.resetLinkText}>{t('profile.actions.resetData')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {/* Reset Confirmation Modal */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="warning" size={28} color="#FF3B30" />
            </View>
            <Text style={styles.modalTitle}>{t('profile.actions.resetConfirmTitle')}</Text>
            <Text style={styles.modalSub}>{t('profile.actions.resetConfirmSub')}</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowResetModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>{t('profile.actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmReset}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmBtnText}>{t('profile.actions.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconCircle, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="trash" size={28} color="#D32F2F" />
            </View>
            <Text style={styles.modalTitle}>Delete Account & Data?</Text>
            <Text style={styles.modalSub}>
              This will permanently delete your cloud profile, workout records, challenge history, and sign you out. This action cannot be undone.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.modalConfirmBtn, { backgroundColor: '#D32F2F' }]}
              >
                <Text style={styles.modalConfirmBtnText}>Delete Permanently</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 96,
  },
  // Instagram Top Bar
  igTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  igTopBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  igUsernameText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.3,
    maxWidth: 180,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  igTopBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  igTopIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Instagram Profile Header Card
  igProfileHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  igAvatarAndStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  igAvatarContainer: {
    position: 'relative',
  },
  igStoryRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatarInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
  },
  igAvatarCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatarInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  igFlameBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FF5A00',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  igStatsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: Spacing.sm,
  },
  igStatColumn: {
    alignItems: 'center',
    minWidth: 50,
  },
  igStatNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  igStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textGrey,
    marginTop: 2,
  },

  // Bio Section
  igBioSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  igNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  igDisplayName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  proBadge: {
    backgroundColor: '#FFF2E5',
    borderWidth: 1,
    borderColor: '#FF8A1F',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#FF6B00',
    fontSize: 9,
    fontWeight: '800',
  },
  igCategoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  igBioText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
    marginTop: 4,
  },
  igLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  igLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  // Action Buttons: Follow / Edit / Share
  igActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  igFollowBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igPrimaryFollowBtn: {
    backgroundColor: Colors.primary,
  },
  igFollowingBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  igBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  igFollowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  igFollowingBtnText: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
  igEditBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  igEditBtnText: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
  igIconSquareBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Story Highlights
  igHighlightsSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  igHighlightsScroll: {
    paddingHorizontal: Spacing.md,
    gap: 16,
  },
  igHighlightItem: {
    alignItems: 'center',
    width: 60,
  },
  igAddHighlightRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 4,
  },
  igHighlightRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  igHighlightIconCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igHighlightTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
  },

  // 3-Tab Bar
  igTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  igTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  igTabItemActive: {
    borderBottomColor: Colors.primary,
  },
  igTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textGrey,
  },
  igTabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  tabContentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // Tab 1: Posts Grid
  postsHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  postsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  shareNewPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  shareNewPostText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  postsLoader: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  postsEmptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.card,
    marginVertical: Spacing.sm,
  },
  postsEmptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  postsEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: Spacing.xs,
  },
  postsEmptySub: {
    fontSize: 12,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 240,
  },
  postsShareBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  postsShareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  postThumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  postThumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbVisibilityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    padding: 3,
  },
  thumbLikesBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  thumbLikesText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },

  // Tab 2: Stats
  levelCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  levelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelBadgeWrap: {
    gap: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  levelPointsSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    fontWeight: '500',
  },
  viewLeaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFEAEA',
    borderRadius: 8,
  },
  viewLeaderboardText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  levelProgressSection: {
    marginVertical: 4,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelProgressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  levelProgressRatio: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: '600',
  },
  levelProgressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  weekPointsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  weekPointsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekPointsTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textDark,
  },
  weekPointsSub: {
    fontSize: 10,
    color: Colors.textGrey,
  },
  weekPointsRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  weekPointsVal: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  weekPointsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textGrey,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statTile: {
    width: '48%',
    padding: Spacing.md,
    alignItems: 'flex-start',
    marginVertical: 0,
  },
  statVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  streakTile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFF9F5',
    borderColor: '#FFE0CC',
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEAD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: '#FF5A00',
  },
  streakLabel: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  streakEncourage: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  chartCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  chartHeader: {
    marginBottom: Spacing.sm,
  },
  chartTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  chartSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },

  // Tab 3: Settings
  premiumActiveCard: {
    backgroundColor: '#FFFBF7',
    borderColor: '#FFD9B3',
    borderWidth: 1.5,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  premiumTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  premiumActiveTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: '#FF6B00',
  },
  premiumActiveSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  premiumBannerCard: {
    backgroundColor: '#FF7A00',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  premiumBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  premiumBannerTextWrap: {
    flex: 1,
  },
  premiumBannerTitle: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.sm,
  },
  premiumBannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 2,
  },
  settingsGroup: {
    backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.card,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  rowRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowRightText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  activeTag: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  versionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  actionsSection: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
  },
  resetLink: {
    paddingVertical: Spacing.md,
  },
  resetLinkText: {
    fontSize: Typography.sizes.xs,
    color: '#FF3B30',
    fontWeight: Typography.weights.semiBold,
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  modalSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    fontSize: Typography.sizes.sm,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
  },
});
