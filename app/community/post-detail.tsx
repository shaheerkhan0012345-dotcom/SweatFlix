import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  communityService,
  CommunityPost,
  PostVisibility,
  getAvatarColor,
} from '../../services/communityService';
import { EXERCISE_3D_ASSETS } from '../../constants/exerciseImages';
import { LeagueTierBadge } from '../../components/LeagueTierBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  const localFallback = useMemo(() => {
    if (!post) return EXERCISE_3D_ASSETS.hero;
    if (post.id === 'demo-post-1') return EXERCISE_3D_ASSETS.Chest;
    if (post.id === 'demo-post-2') return EXERCISE_3D_ASSETS.Abs;
    if (post.id === 'demo-post-3') return EXERCISE_3D_ASSETS.Back;
    const name = (post.workout_name || '').toLowerCase();
    if (name.includes('chest')) return EXERCISE_3D_ASSETS.Chest;
    if (name.includes('core') || name.includes('abs')) return EXERCISE_3D_ASSETS.Abs;
    if (name.includes('back')) return EXERCISE_3D_ASSETS.Back;
    if (name.includes('arm')) return EXERCISE_3D_ASSETS.Arms;
    if (name.includes('leg')) return EXERCISE_3D_ASSETS.Legs;
    return EXERCISE_3D_ASSETS.hero;
  }, [post]);

  // Double tap detection
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    if (!id) return;
    communityService
      .getPostDetail(id, user?.id ?? null)
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id, user?.id]);

  const isOwner = user?.id === post?.user_id;

  const handleToggleLike = async () => {
    if (!post || !user?.id) return;
    const prevLiked = post.is_liked;
    const prevCount = post.likes_count;

    setPost((prev) =>
      prev
        ? {
            ...prev,
            is_liked: !prevLiked,
            likes_count: prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
          }
        : null
    );

    try {
      await communityService.toggleLike({
        postId: post.id,
        userId: user.id,
        currentlyLiked: prevLiked,
      });
    } catch {
      setPost((prev) =>
        prev ? { ...prev, is_liked: prevLiked, likes_count: prevCount } : null
      );
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (post && !post.is_liked) {
        handleToggleLike();
      }
    }
    lastTapRef.current = now;
  };

  const handleDeletePost = () => {
    setShowMenuModal(false);
    if (!post || !user?.id) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this workout post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.deletePost({
                postId: post.id,
                userId: user.id,
                imagePath: post.image_path,
              });
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleChangeVisibility = async (newVis: PostVisibility) => {
    setShowVisibilityModal(false);
    if (!post || !user?.id) return;

    // Post visibility cannot be more open than account visibility
    const accountVis = profile?.account_visibility || 'public';
    if (accountVis === 'private' && newVis !== 'private') {
      Alert.alert(
        'Account is Private',
        'Your account visibility is set to Private. Posts on private accounts cannot be shared publicly or with friends only.'
      );
      return;
    }
    if (accountVis === 'friends' && newVis === 'public') {
      Alert.alert(
        'Account is Friends Only',
        'Your account visibility is set to Friends only. Posts cannot be set to Public.'
      );
      return;
    }

    try {
      await communityService.updatePostVisibility(post.id, user.id, newVis);
      setPost((prev) => (prev ? { ...prev, visibility: newVis } : null));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update visibility');
    }
  };

  const handleReportPost = () => {
    setShowMenuModal(false);
    if (!post || !user?.id) return;

    Alert.alert('Report Post', 'Why are you reporting this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Inappropriate Content',
        onPress: async () => {
          await communityService.reportPost({
            postId: post.id,
            reporterId: user.id,
            reason: 'Inappropriate Content',
          });
          Alert.alert('Post Reported', 'Thank you for reporting. This post is now hidden.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
      },
      {
        text: 'Spam or Scam',
        onPress: async () => {
          await communityService.reportPost({
            postId: post.id,
            reporterId: user.id,
            reason: 'Spam or Scam',
          });
          Alert.alert('Post Reported', 'Thank you for reporting. This post is now hidden.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
      },
    ]);
  };

  const handleBlockAuthor = () => {
    setShowMenuModal(false);
    if (!post || !user?.id) return;

    Alert.alert('Block User', `Block this athlete? You will no longer see each other's posts.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          await communityService.blockUser({
            blockerId: user.id,
            blockedId: post.user_id,
          });
          Alert.alert('User Blocked', 'This athlete has been blocked.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </ScreenContainer>
    );
  }

  if (!post) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textGrey} />
        <Text style={styles.errorTitle}>Post Not Found</Text>
        <Text style={styles.errorSub}>This post may have been deleted or is private.</Text>
        <TouchableOpacity style={styles.backBtnPill} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Workout Post</Text>
        <TouchableOpacity
          onPress={() => setShowMenuModal(true)}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Post Author Bar */}
      <View style={styles.authorBar}>
        <TouchableOpacity
          style={styles.authorLeft}
          onPress={() => router.push(`/user/${post.user_id}` as any)}
          activeOpacity={0.7}
        >
          {post.author_avatar_url ? (
            <Image source={{ uri: post.author_avatar_url }} style={styles.authorAvatar} />
          ) : (
            <View
              style={[
                styles.authorInitialCircle,
                { backgroundColor: post.author_color || getAvatarColor(post.user_id) },
              ]}
            >
              <Text style={styles.authorInitialText}>{post.author_initial}</Text>
            </View>
          )}

          <View style={styles.authorMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.authorName} numberOfLines={1}>
                {post.author_name}
              </Text>
              {post.author_tier ? (
                <LeagueTierBadge
                  tier={post.author_tier}
                  size="small"
                  showCrown={Boolean(post.author_champion)}
                  style={{ marginLeft: 6 }}
                />
              ) : null}
            </View>
            <View style={styles.timeVisibilityRow}>
              {post.author_username && (
                <Text style={styles.authorUsername}>@{post.author_username} • </Text>
              )}
              <Text style={styles.timeAgoText}>{formatTimeAgo(post.created_at)}</Text>
              <Ionicons
                name={
                  post.visibility === 'public'
                    ? 'globe-outline'
                    : post.visibility === 'friends'
                    ? 'people-outline'
                    : 'lock-closed-outline'
                }
                size={12}
                color={Colors.textGrey}
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Post Photo with Double-Tap to Like */}
      <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} style={styles.imageContainer}>
        {imageLoading && !imageError && (
          <View style={styles.imageLoadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        <Image
          source={
            imageError
              ? localFallback
              : post.image_url && (post.image_url.startsWith('http') || post.image_url.startsWith('file:'))
              ? { uri: post.image_url }
              : localFallback
          }
          style={styles.postImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
      </TouchableOpacity>

      {/* Actions and Content */}
      <View style={styles.contentSection}>
        {/* Like and Workout Tag */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={handleToggleLike}
            activeOpacity={0.8}
          >
            <Ionicons
              name={post.is_liked ? 'heart' : 'heart-outline'}
              size={26}
              color={post.is_liked ? '#E5252A' : Colors.textDark}
            />
            <Text
              style={[
                styles.likeCountText,
                post.is_liked && { color: '#E5252A', fontWeight: '700' },
              ]}
            >
              {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
            </Text>
          </TouchableOpacity>

          {post.workout_name && (
            <View style={styles.workoutTag}>
              <Ionicons name="barbell" size={13} color={Colors.primary} />
              <Text style={styles.workoutTagText} numberOfLines={1}>
                {post.workout_name}
              </Text>
            </View>
          )}
        </View>

        {/* Caption */}
        {post.caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.captionAuthor}>{post.author_name} </Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        ) : null}
      </View>

      {/* Post Menu Modal */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={styles.menuSheet}>
            {isOwner ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    setShowVisibilityModal(true);
                  }}
                >
                  <Ionicons name="eye-outline" size={20} color={Colors.textDark} />
                  <Text style={styles.menuItemText}>Change Who Can See This</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleDeletePost}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete Post</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleReportPost}>
                  <Ionicons name="flag-outline" size={20} color={Colors.textDark} />
                  <Text style={styles.menuItemText}>Report Post</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleBlockAuthor}>
                  <Ionicons name="ban-outline" size={20} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Block User</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelMenuItem]}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={styles.cancelMenuText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Visibility Change Modal */}
      <Modal visible={showVisibilityModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowVisibilityModal(false)}
        >
          <View style={styles.menuSheet}>
            <Text style={styles.sheetTitle}>Who can see this post?</Text>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                post.visibility === 'public' && styles.visibilityOptionSelected,
              ]}
              onPress={() => handleChangeVisibility('public')}
            >
              <Ionicons name="globe-outline" size={22} color={Colors.primary} />
              <View style={styles.visTextCol}>
                <Text style={styles.visTitle}>Everyone</Text>
                <Text style={styles.visDesc}>Any logged-in athlete can view this post</Text>
              </View>
              {post.visibility === 'public' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                post.visibility === 'friends' && styles.visibilityOptionSelected,
              ]}
              onPress={() => handleChangeVisibility('friends')}
            >
              <Ionicons name="people-outline" size={22} color={Colors.primary} />
              <View style={styles.visTextCol}>
                <Text style={styles.visTitle}>Friends Only</Text>
                <Text style={styles.visDesc}>Only accepted friends can view this post</Text>
              </View>
              {post.visibility === 'friends' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                post.visibility === 'private' && styles.visibilityOptionSelected,
              ]}
              onPress={() => handleChangeVisibility('private')}
            >
              <Ionicons name="lock-closed-outline" size={22} color={Colors.primary} />
              <View style={styles.visTextCol}>
                <Text style={styles.visTitle}>Only Me</Text>
                <Text style={styles.visDesc}>Visible only to you</Text>
              </View>
              {post.visibility === 'private' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelMenuItem]}
              onPress={() => setShowVisibilityModal(false)}
            >
              <Text style={styles.cancelMenuText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingBottom: Spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: Spacing.sm,
  },
  errorSub: {
    fontSize: 14,
    color: Colors.textGrey,
    marginTop: 4,
  },
  backBtnPill: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navBtn: {
    padding: Spacing.xs,
    width: 40,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
  },
  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  authorInitialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitialText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authorMeta: {
    marginLeft: Spacing.sm + 2,
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  timeVisibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  authorUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  timeAgoText: {
    fontSize: 12,
    color: Colors.textGrey,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#F1F5F9',
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
  contentSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  workoutTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  workoutTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    maxWidth: 160,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  captionAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  captionText: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl + 10,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  visibilityOptionSelected: {
    backgroundColor: '#FFF5F5',
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  visTextCol: {
    flex: 1,
  },
  visTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  visDesc: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  cancelMenuItem: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  cancelMenuText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textGrey,
    textAlign: 'center',
  },
});
