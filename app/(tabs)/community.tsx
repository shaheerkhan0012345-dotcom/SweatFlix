import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  communityService,
  CommunityPost,
  PostVisibility,
  getAvatarColor,
} from '../../services/communityService';
import { friendsService } from '../../services/friendsService';
import { challengeService, FriendChallenge } from '../../services/challengeService';
import { storyService, UserStoryGroup } from '../../services/storyService';
import { StoriesRow } from '../../components/StoriesRow';
import { notificationService } from '../../services/notificationService';
import { EXERCISE_3D_ASSETS } from '../../constants/exerciseImages';
import { LeagueTierBadge } from '../../components/LeagueTierBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatChallengeTimeLeft(endsAt: string | null): string {
  if (!endsAt) return 'Pending';
  const diffMs = new Date(endsAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Ended';
  const hours = Math.floor(diffMs / (3600 * 1000));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m left`;
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(isoString).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

// Resilient Post Photo with inline loading indicator and instant local 3D fallback
function PostPhoto({
  item,
  onDoubleTap,
}: {
  item: CommunityPost;
  onDoubleTap: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Derive local fallback image based on post or category
  const localFallback = useMemo(() => {
    if (item.id === 'demo-post-1') return EXERCISE_3D_ASSETS.Chest;
    if (item.id === 'demo-post-2') return EXERCISE_3D_ASSETS.Abs;
    if (item.id === 'demo-post-3') return EXERCISE_3D_ASSETS.Back;
    const name = (item.workout_name || '').toLowerCase();
    if (name.includes('chest')) return EXERCISE_3D_ASSETS.Chest;
    if (name.includes('core') || name.includes('abs')) return EXERCISE_3D_ASSETS.Abs;
    if (name.includes('back')) return EXERCISE_3D_ASSETS.Back;
    if (name.includes('arm')) return EXERCISE_3D_ASSETS.Arms;
    if (name.includes('leg')) return EXERCISE_3D_ASSETS.Legs;
    return EXERCISE_3D_ASSETS.hero;
  }, [item.id, item.workout_name]);

  const imageSource = hasError
    ? localFallback
    : item.image_url && (item.image_url.startsWith('http') || item.image_url.startsWith('file:'))
    ? { uri: item.image_url }
    : localFallback;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onDoubleTap}
      style={styles.imageContainer}
    >
      {loading && !hasError && (
        <View style={styles.imageLoadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
      <Image
        source={imageSource}
        style={styles.postImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
      />
    </TouchableOpacity>
  );
}

// Resilient Author Avatar with fallback to colored initials
function AuthorAvatar({
  avatarUrl,
  initial,
  color,
}: {
  avatarUrl?: string | null;
  initial: string;
  color: string;
}) {
  const [avatarErr, setAvatarErr] = useState(false);

  if (avatarUrl && !avatarErr) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={styles.authorAvatarImg}
        contentFit="cover"
        cachePolicy="memory-disk"
        onError={() => setAvatarErr(true)}
      />
    );
  }

  return (
    <View style={[styles.avatarCircle, { backgroundColor: color }]}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 9b: Filter chips & incoming requests badge
  const [feedFilter, setFeedFilter] = useState<'all' | 'friends'>('all');
  const [incomingCount, setIncomingCount] = useState<number>(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  // Step 9c: Friend challenges strip & create action modal
  const [activeChallenges, setActiveChallenges] = useState<FriendChallenge[]>([]);
  const [showCreateActionModal, setShowCreateActionModal] = useState(false);

  // Step 9e: Stories state
  const [storyGroups, setStoryGroups] = useState<UserStoryGroup[]>([]);

  // Modals
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Double tap detection
  const lastTapRef = useRef<number>(0);

  // Fetch posts helper
  const fetchPosts = useCallback(
    async (isRefresh = false, overrideFilter?: 'all' | 'friends') => {
      const activeFilter = overrideFilter !== undefined ? overrideFilter : feedFilter;
      try {
        if (isRefresh) {
          setRefreshing(true);
        }
        setError(null);

        const fetched = await communityService.getPosts({
          limit: 10,
          offset: 0,
          currentUserId: user?.id ?? null,
          filter: activeFilter,
        });

        setPosts(fetched);
        setHasMore(fetched.length >= 10);

        if (user?.id) {
          challengeService.getChallenges(user.id).then((res) => {
            setActiveChallenges(res.active);
          });
          storyService.getActiveStories(user.id).then((stories) => {
            setStoryGroups(stories);
          });
        }
      } catch (err: any) {
        console.warn('Community load error:', err?.message);
        setError('Unable to load feed. Please check your internet connection.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, feedFilter]
  );

  // Refresh incoming requests count, challenges, stories, and notification count whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      notificationService.getUnreadCount(user?.id).then((count) => {
        setUnreadNotifCount(count);
      });
      if (user?.id) {
        friendsService.getIncomingRequestsCount(user.id).then((count) => {
          setIncomingCount(count);
        });
        challengeService.getChallenges(user.id).then((res) => {
          setActiveChallenges(res.active);
        });
        storyService.getActiveStories(user.id).then((stories) => {
          setStoryGroups(stories);
        });
      }
    }, [user])
  );

  // Subscribe to real-time notification inserts for live badge update
  useEffect(() => {
    notificationService.getUnreadCount(user?.id).then(setUnreadNotifCount);
    const effectiveUserId = user?.id || 'guest';
    const sub = notificationService.subscribeToNotifications(effectiveUserId, () => {
      setUnreadNotifCount((prev) => prev + 1);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    let isCurrent = true;
    communityService
      .getPosts({
        limit: 10,
        offset: 0,
        currentUserId: user?.id ?? null,
        filter: feedFilter,
      })
      .then((fetched) => {
        if (isCurrent) {
          setPosts(fetched);
          setHasMore(fetched.length >= 10);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isCurrent) {
          console.warn('Community load error:', err?.message);
          setError('Unable to load feed. Please check your internet connection.');
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [user, feedFilter]);

  // Infinite scroll: load next 10 posts
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || loading) return;

    try {
      setLoadingMore(true);
      const nextBatch = await communityService.getPosts({
        limit: 10,
        offset: posts.length,
        currentUserId: user?.id ?? null,
        filter: feedFilter,
      });

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...nextBatch]);
        if (nextBatch.length < 10) setHasMore(false);
      }
    } catch {
      // Graceful fail on background pagination
    } finally {
      setLoadingMore(false);
    }
  };

  // Optimistic Like Toggle
  const handleToggleLike = async (post: CommunityPost) => {
    const prevLiked = post.is_liked;
    const prevCount = post.likes_count;

    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    // 1. Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, is_liked: nextLiked, likes_count: nextCount } : p
      )
    );

    // 2. Persist to service layer
    try {
      await communityService.toggleLike({
        postId: post.id,
        userId: user?.id || 'guest',
        currentlyLiked: prevLiked,
      });
    } catch {
      // Rollback on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, is_liked: prevLiked, likes_count: prevCount } : p
        )
      );
    }
  };

  // Double-tap photo to like
  const handleDoubleTapPhoto = (post: CommunityPost) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.is_liked) {
        handleToggleLike(post);
      }
    }
    lastTapRef.current = now;
  };

  // Handle "+" button tap: check rules first
  const handlePressCreatePost = async () => {
    const accepted = await communityService.hasAcceptedRules();
    if (!accepted) {
      setShowRulesModal(true);
    } else {
      router.push('/community/new-post' as any);
    }
  };

  const handleAcceptRulesAndProceed = async () => {
    await communityService.acceptRules();
    setShowRulesModal(false);
    router.push('/community/new-post' as any);
  };

  // Menu Actions
  const handleOpenMenu = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowMenuModal(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    setShowMenuModal(false);

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this workout post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const targetId = selectedPost.id;
            const targetPath = selectedPost.image_path;
            // Optimistic removal
            setPosts((prev) => prev.filter((p) => p.id !== targetId));
            try {
              await communityService.deletePost({
                postId: targetId,
                userId: user?.id || '',
                imagePath: targetPath,
              });
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete post.');
              fetchPosts(true);
            }
          },
        },
      ]
    );
  };

  const handleChangeVisibility = async (newVis: PostVisibility) => {
    setShowVisibilityModal(false);
    if (!selectedPost || !user?.id) return;

    try {
      await communityService.updatePostVisibility(selectedPost.id, user.id, newVis);
      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPost.id ? { ...p, visibility: newVis } : p))
      );
      Alert.alert('Updated', 'Post visibility has been updated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update visibility');
    }
  };

  const handleStartReport = () => {
    setShowMenuModal(false);
    setShowReportModal(true);
  };

  const handleConfirmReport = async (reason: string) => {
    if (!selectedPost) return;
    const postId = selectedPost.id;
    setShowReportModal(false);

    // Optimistically remove from feed
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    await communityService.reportPost({
      postId,
      reporterId: user?.id || 'guest',
      reason,
    });

    Alert.alert('Report Submitted', "Thanks for keeping our community safe. We'll review this post.");
  };

  const handleBlockUser = () => {
    if (!selectedPost) return;
    const authorId = selectedPost.user_id;
    const authorName = selectedPost.author_name;
    setShowMenuModal(false);

    Alert.alert(
      `Block ${authorName}?`,
      'You will no longer see posts from this athlete. You can unblock them anytime in Profile > General Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: async () => {
            // Optimistically remove all posts from this user
            setPosts((prev) => prev.filter((p) => p.user_id !== authorId));
            await communityService.blockUser({
              blockerId: user?.id || 'guest',
              blockedId: authorId,
            });
            Alert.alert('User Blocked', `${authorName} has been blocked.`);
          },
        },
      ]
    );
  };

  // Render Post Card
  const renderPostCard = ({ item }: { item: CommunityPost }) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Header: Author Info */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => router.push(`/user/${item.user_id}` as any)}
            activeOpacity={0.7}
          >
            <AuthorAvatar
              avatarUrl={item.author_avatar_url}
              initial={item.author_initial}
              color={item.author_color}
            />
            <View style={styles.authorMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.authorName, { color: colors.text }]}>{item.author_name}</Text>
                {item.author_tier ? (
                  <LeagueTierBadge
                    tier={item.author_tier}
                    size="small"
                    showCrown={Boolean(item.author_champion)}
                    style={{ marginLeft: 6 }}
                  />
                ) : null}
              </View>
              <View style={styles.authorSubRow}>
                {item.author_username ? (
                  <Text style={styles.authorUsernameText}>@{item.author_username} • </Text>
                ) : null}
                <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
                  {formatTimeAgo(item.created_at)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleOpenMenu(item)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Workout Chip Tag (if tagged) */}
        {item.workout_name && (
          <View style={styles.workoutTagRow}>
            <View style={[styles.workoutPill, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF2E5' }]}>
              <Ionicons name="barbell-outline" size={13} color={Colors.primary} />
              <Text style={styles.workoutPillText}>{item.workout_name}</Text>
            </View>
          </View>
        )}

        {/* 4:5 Full Width Photo with instant loading & fallback */}
        <PostPhoto
          item={item}
          onDoubleTap={() => handleDoubleTapPhoto(item)}
        />

        {/* Likes Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleToggleLike(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.is_liked ? 'heart' : 'heart-outline'}
              size={24}
              color={item.is_liked ? Colors.primary : colors.text}
            />
            <Text
              style={[
                styles.likesCountText,
                { color: item.is_liked ? Colors.primary : colors.text },
              ]}
            >
              {item.likes_count}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {item.caption && (
          <View style={styles.captionRow}>
            <Text style={[styles.captionText, { color: colors.text }]}>
              <Text style={styles.captionAuthor}>{item.author_name} </Text>
              {item.caption}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render Skeletons
  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2].map((k) => (
        <View
          key={k}
          style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.skeletonHeader}>
            <View style={[styles.skeletonAvatar, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]} />
            <View style={{ marginLeft: 12 }}>
              <View style={[styles.skeletonLineShort, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]} />
              <View style={[styles.skeletonLineTiny, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0', marginTop: 6 }]} />
            </View>
          </View>
          <View style={[styles.skeletonImage, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]} />
        </View>
      ))}
    </View>
  );

  // Step 9c: Active Challenges Strip component
  const renderChallengesStrip = () => {
    return (
      <View style={styles.challengesStripWrapper}>
        <View style={styles.challengesStripHeader}>
          <View style={styles.stripTitleRow}>
            <Ionicons name="flame" size={18} color="#E5252A" />
            <Text style={[styles.stripTitle, { color: colors.text }]}>Challenges</Text>
            {activeChallenges.length > 0 && (
              <View style={styles.stripCountBadge}>
                <Text style={styles.stripCountBadgeText}>{activeChallenges.length}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/community/challenges' as any)}
            style={styles.seeAllBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {activeChallenges.length === 0 ? (
          <TouchableOpacity
            style={[
              styles.emptyStripBanner,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push('/community/new-challenge' as any)}
            activeOpacity={0.85}
          >
            <View style={styles.emptyStripLeft}>
              <View style={styles.emptyFlameCircle}>
                <Ionicons name="flame" size={20} color="#E5252A" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.emptyStripTitle, { color: colors.text }]}>
                  Challenge a Friend
                </Text>
                <Text style={styles.emptyStripSub}>Compete in 50 push-ups or plank hold!</Text>
              </View>
            </View>
            <View style={[styles.startChallengeChip, { backgroundColor: Colors.primary }]}>
              <Text style={styles.startChallengeChipText}>Start</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.challengesStripScroll}
          >
            {activeChallenges.map((ch) => {
              const isCreator = ch.creator_id === user?.id;
              const opp = isCreator ? ch.opponent : ch.creator;
              const myScore = isCreator ? ch.creator_score || 0 : ch.opponent_score || 0;
              const oppScore = isCreator ? ch.opponent_score || 0 : ch.creator_score || 0;
              const myProg = Math.min(1, myScore / (ch.target || 1));
              const oppProg = Math.min(1, oppScore / (ch.target || 1));
              const timeLeft = formatChallengeTimeLeft(ch.ends_at);

              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[
                    styles.stripCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/community/challenge-detail',
                      params: { id: ch.id },
                    })
                  }
                  activeOpacity={0.88}
                >
                  <View style={styles.stripCardHeader}>
                    <Text style={styles.stripExerciseName} numberOfLines={1}>
                      {ch.exercise_name}
                    </Text>
                    <View style={styles.stripTimePill}>
                      <Ionicons name="time-outline" size={11} color="#FF8A1F" />
                      <Text style={styles.stripTimeLeft}>{timeLeft}</Text>
                    </View>
                  </View>

                  <View style={styles.stripVersusRow}>
                    {user?.user_metadata?.avatar_url ? (
                      <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.stripAvatar} />
                    ) : (
                      <View
                        style={[
                          styles.stripAvatarInitial,
                          { backgroundColor: getAvatarColor(user?.id || 'me') },
                        ]}
                      >
                        <Text style={styles.stripAvatarInitialText}>Y</Text>
                      </View>
                    )}

                    <View style={styles.stripVsBadge}>
                      <Text style={styles.stripVsText}>VS</Text>
                    </View>

                    {opp?.avatar_url ? (
                      <Image source={{ uri: opp.avatar_url }} style={styles.stripAvatar} />
                    ) : (
                      <View
                        style={[
                          styles.stripAvatarInitial,
                          { backgroundColor: getAvatarColor(opp?.id || 'opp') },
                        ]}
                      >
                        <Text style={styles.stripAvatarInitialText}>
                          {(opp?.name || 'F').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.stripBarsContainer}>
                    <View style={styles.stripBarRow}>
                      <Text style={styles.stripBarName}>You</Text>
                      <View style={[styles.stripBarTrack, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}>
                        <View
                          style={[
                            styles.stripBarFill,
                            { width: `${Math.max(4, myProg * 100)}%`, backgroundColor: '#E5252A' },
                          ]}
                        />
                      </View>
                      <Text style={[styles.stripBarNum, { color: '#E5252A' }]}>
                        {myScore}/{ch.target}
                      </Text>
                    </View>

                    <View style={styles.stripBarRow}>
                      <Text style={styles.stripBarName} numberOfLines={1}>
                        {opp?.name?.split(' ')[0] || 'Friend'}
                      </Text>
                      <View style={[styles.stripBarTrack, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}>
                        <View
                          style={[
                            styles.stripBarFill,
                            { width: `${Math.max(4, oppProg * 100)}%`, backgroundColor: '#FF8A1F' },
                          ]}
                        />
                      </View>
                      <Text style={[styles.stripBarNum, { color: '#FF8A1F' }]}>
                        {oppScore}/{ch.target}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  // Step 9e: List Header containing Stories Row above Challenges Strip
  const renderListHeader = () => {
    return (
      <View>
        <StoriesRow
          groups={storyGroups}
          loading={loading}
          onRefresh={() => {
            if (user?.id) storyService.getActiveStories(user.id).then(setStoryGroups);
          }}
        />
        {renderChallengesStrip()}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Step 9b: Top Header with Search, Friends, and Filter Chips */}
      <View style={[styles.communityHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.communityTitle, { color: colors.text }]}>Community</Text>
          <View style={styles.headerIconsRow}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/community/league' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="trophy" size={22} color="#EAB308" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/community/search-users' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={22} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/community/notifications' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications" size={22} color={colors.text} />
              {unreadNotifCount > 0 && (
                <View style={styles.incomingBadge}>
                  <Text style={styles.incomingBadgeText}>
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/community/friends' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="people" size={23} color={colors.text} />
              {incomingCount > 0 && (
                <View style={styles.incomingBadge}>
                  <Text style={styles.incomingBadgeText}>
                    {incomingCount > 9 ? '9+' : incomingCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips: Everyone | Friends */}
        <View style={styles.filterChipsRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              feedFilter === 'all'
                ? styles.filterChipActive
                : [styles.filterChipInactive, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }],
            ]}
            onPress={() => {
              if (feedFilter !== 'all') {
                setFeedFilter('all');
                fetchPosts(false, 'all');
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="globe-outline"
              size={14}
              color={feedFilter === 'all' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.filterChipText,
                feedFilter === 'all' ? styles.filterChipTextActive : { color: colors.text },
              ]}
            >
              Everyone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              feedFilter === 'friends'
                ? styles.filterChipActive
                : [styles.filterChipInactive, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }],
            ]}
            onPress={() => {
              if (feedFilter !== 'friends') {
                setFeedFilter('friends');
                fetchPosts(false, 'friends');
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people-outline"
              size={14}
              color={feedFilter === 'friends' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.filterChipText,
                feedFilter === 'friends' ? styles.filterChipTextActive : { color: colors.text },
              ]}
            >
              Friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed List */}
      {loading ? (
        renderSkeletons()
      ) : error && posts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.primary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Connection Issue</Text>
          <Text style={[styles.errorSub, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPosts(true)}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostCard}
          ListHeaderComponent={renderListHeader()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPosts(true)}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="camera-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No posts yet</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Be the first to share your workout and inspire the community!
              </Text>
              <TouchableOpacity
                style={styles.shareFirstBtn}
                onPress={() => setShowCreateActionModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.shareFirstBtnText}>Share a Workout</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Floating Red "+" Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateActionModal(true)}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ========================================================================= */}
      {/* MODAL 1: POST OPTIONS MENU (...) */}
      {/* ========================================================================= */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={[styles.menuSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.menuDragHandle} />

            {selectedPost && user?.id === selectedPost.user_id ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    setShowVisibilityModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={20} color={colors.text} />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>
                    Change Who Can See This
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
                  onPress={handleDeletePost}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete Post</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleStartReport}
                  activeOpacity={0.7}
                >
                  <Ionicons name="flag-outline" size={20} color="#F59E0B" />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>Report Post</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
                  onPress={handleBlockUser}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Block User</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Visibility Modal */}
      <Modal visible={showVisibilityModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVisibilityModal(false)}
        >
          <View style={[styles.menuSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Who can see this post?</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleChangeVisibility('public')}
            >
              <Ionicons name="globe-outline" size={20} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Everyone</Text>
                <Text style={styles.subtext}>Any athlete can view this post</Text>
              </View>
              {selectedPost?.visibility === 'public' && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
              onPress={() => handleChangeVisibility('friends')}
            >
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Friends Only</Text>
                <Text style={styles.subtext}>Only accepted friends can view this post</Text>
              </View>
              {selectedPost?.visibility === 'friends' && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
              onPress={() => handleChangeVisibility('private')}
            >
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Only Me</Text>
                <Text style={styles.subtext}>Visible only to you</Text>
              </View>
              {selectedPost?.visibility === 'private' && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={() => setShowVisibilityModal(false)}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: REPORT REASON PICKER */}
      {/* ========================================================================= */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.reportCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.reportTitle, { color: colors.text }]}>Report this post</Text>
            <Text style={[styles.reportSub, { color: colors.textSecondary }]}>
              Why are you reporting this post? It will be immediately removed from your feed.
            </Text>

            {['Spam', 'Inappropriate content', 'Harassment or hate', 'Other'].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[styles.reportReasonRow, { borderColor: colors.border }]}
                onPress={() => handleConfirmReport(reason)}
                activeOpacity={0.7}
              >
                <Text style={[styles.reportReasonText, { color: colors.text }]}>{reason}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.cancelBtn, { marginTop: 12, backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: COMMUNITY GUIDELINES ACCEPTANCE (Shown once before 1st post) */}
      {/* ========================================================================= */}
      <Modal visible={showRulesModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.rulesCard, { backgroundColor: colors.surface }]}>
            <View style={styles.rulesIconCircle}>
              <Ionicons name="shield-checkmark" size={36} color={Colors.primary} />
            </View>
            <Text style={[styles.rulesTitle, { color: colors.text }]}>Community Guidelines</Text>
            <Text style={[styles.rulesSub, { color: colors.textSecondary }]}>
              SweatFlix is a supportive space to share fitness milestones. Before posting, please agree to our community standards:
            </Text>

            <View style={styles.rulesList}>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={[styles.ruleText, { color: colors.text }]}>Be respectful and motivate fellow athletes.</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="close-circle" size={18} color="#EF4444" />
                <Text style={[styles.ruleText, { color: colors.text }]}>No nudity, hate speech, spam or harassment.</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="lock-closed" size={18} color="#0284C7" />
                <Text style={[styles.ruleText, { color: colors.text }]}>Only post photos you have the right to share.</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.agreeBtn}
              onPress={handleAcceptRulesAndProceed}
              activeOpacity={0.88}
            >
              <Text style={styles.agreeBtnText}>I Agree &amp; Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: "+" CREATE ACTION MENU (Challenge vs Post) */}
      {/* ========================================================================= */}
      <Modal visible={showCreateActionModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCreateActionModal(false)}
        >
          <View style={[styles.createMenuSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.menuDragHandle} />

            <Text style={[styles.createMenuTitle, { color: colors.text }]}>What would you like to do?</Text>

            {/* Option 1: Challenge a Friend */}
            <TouchableOpacity
              style={[
                styles.createOptionBtn,
                { backgroundColor: isDarkMode ? '#1E293B' : '#FFF1F2', borderColor: '#E5252A40' },
              ]}
              onPress={() => {
                setShowCreateActionModal(false);
                router.push('/community/new-challenge' as any);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.createOptionIcon, { backgroundColor: '#E5252A' }]}>
                <Ionicons name="flame" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.createOptionTextCol}>
                <Text style={[styles.createOptionTitle, { color: colors.text }]}>
                  Challenge a Friend
                </Text>
                <Text style={styles.createOptionSub}>
                  Compete head-to-head with live timer &amp; reps
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>

            {/* Option 2: Share Workout Post */}
            <TouchableOpacity
              style={[
                styles.createOptionBtn,
                { backgroundColor: isDarkMode ? '#1E293B' : '#F0FDF4', borderColor: '#10B98140' },
              ]}
              onPress={() => {
                setShowCreateActionModal(false);
                handlePressCreatePost();
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.createOptionIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.createOptionTextCol}>
                <Text style={[styles.createOptionTitle, { color: colors.text }]}>
                  Share a Workout
                </Text>
                <Text style={styles.createOptionSub}>
                  Post photo milestone to community feed
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#10B981" />
            </TouchableOpacity>

            {/* Option 3: Share a Story */}
            <TouchableOpacity
              style={[
                styles.createOptionBtn,
                { backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7', borderColor: '#F59E0B40' },
              ]}
              onPress={() => {
                setShowCreateActionModal(false);
                router.push('/community/new-story' as any);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.createOptionIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.createOptionTextCol}>
                <Text style={[styles.createOptionTitle, { color: colors.text }]}>
                  Share a Story
                </Text>
                <Text style={styles.createOptionSub}>
                  24-hour photo or short video (max 15s)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' }]}
              onPress={() => setShowCreateActionModal(false)}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90,
  },
  card: {
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  authorMeta: {
    marginLeft: 10,
  },
  authorName: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  moreButton: {
    padding: 6,
  },
  workoutTagRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 10,
  },
  workoutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  workoutPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.25, // 4:5 vertical athletic aspect ratio
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    zIndex: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likesCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  captionRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 14,
  },
  captionText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  captionAuthor: {
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  errorSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF2E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  shareFirstBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shareFirstBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  skeletonContainer: {
    padding: Spacing.md,
  },
  skeletonCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: Spacing.md,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  skeletonLineShort: {
    width: 110,
    height: 12,
    borderRadius: 6,
  },
  skeletonLineTiny: {
    width: 60,
    height: 10,
    borderRadius: 5,
  },
  skeletonImage: {
    width: '100%',
    height: 240,
    borderRadius: BorderRadius.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
  },
  menuDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  reportCard: {
    margin: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  reportSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  reportReasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  reportReasonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rulesCard: {
    margin: Spacing.lg,
    borderRadius: 24,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: 40,
  },
  rulesIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  rulesSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  rulesList: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  agreeBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  agreeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  communityHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  communityTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    position: 'relative',
    padding: 6,
  },
  incomingBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E5252A',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipInactive: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  authorAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
  },
  authorSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  authorUsernameText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Step 9c: Challenges Strip Styles
  challengesStripWrapper: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F015',
    marginBottom: Spacing.xs,
  },
  challengesStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  stripTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  stripCountBadge: {
    backgroundColor: '#E5252A',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  stripCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyStripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: 4,
  },
  emptyStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyFlameCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5252A15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStripTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyStripSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  startChallengeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  startChallengeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  challengesStripScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  stripCard: {
    width: 260,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    borderWidth: 1,
  },
  stripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stripExerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    marginRight: 4,
  },
  stripTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8A1F15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  stripTimeLeft: {
    color: '#FF8A1F',
    fontSize: 10,
    fontWeight: '700',
  },
  stripVersusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  stripAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  stripAvatarInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripAvatarInitialText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  stripVsBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#E5252A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripVsText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  stripBarsContainer: {
    marginTop: 6,
    gap: 4,
  },
  stripBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripBarName: {
    fontSize: 10,
    color: Colors.textGrey,
    width: 34,
  },
  stripBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stripBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stripBarNum: {
    fontSize: 10,
    fontWeight: '700',
    width: 48,
    textAlign: 'right',
  },
  // Create Action Sheet Styles
  createMenuSheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  createMenuTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  createOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  createOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  createOptionTextCol: {
    flex: 1,
  },
  createOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  createOptionSub: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
  },
});
