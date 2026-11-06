import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { profileService, PublicProfile } from '../../services/profileService';
import { friendsService, RelationshipStatus } from '../../services/friendsService';
import { communityService, CommunityPost, getAvatarColor } from '../../services/communityService';
import { pushNotificationService } from '../../services/pushNotificationService';
import { NotificationPermissionModal } from '../../components/NotificationPermissionModal';
import { LeagueTierBadge } from '../../components/LeagueTierBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 2) / 3;

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const isSelf = user?.id === id;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [relationship, setRelationship] = useState<{ status: RelationshipStatus; requestId?: string }>({
    status: 'none',
  });
  const [showPermModal, setShowPermModal] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Menu modal
  const [showMenuModal, setShowMenuModal] = useState(false);

  const loadProfileData = useCallback(
    async (isRefresh = false) => {
      if (!id) return;
      if (isRefresh) setRefreshing(true);

      try {
        const [profData, relData] = await Promise.all([
          profileService.getPublicProfile(id, user?.id ?? null),
          !isSelf && user?.id
            ? friendsService.getRelationship(user.id, id)
            : Promise.resolve({ status: 'self' as RelationshipStatus }),
        ]);

        setProfile(profData);
        setRelationship(relData);

        if (profData?.can_view_content) {
          const userPosts = await communityService.getUserPosts({
            targetUserId: id,
            viewerId: user?.id ?? null,
            limit: 21,
            offset: 0,
          });
          setPosts(userPosts);
          setHasMore(userPosts.length >= 21);
        } else {
          setPosts([]);
          setHasMore(false);
        }
      } catch (e) {
        console.warn('Error loading user profile:', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, user, isSelf]
  );

  useEffect(() => {
    let isCurrent = true;
    if (!id) return;

    Promise.all([
      profileService.getPublicProfile(id, user?.id ?? null),
      !isSelf && user?.id
        ? friendsService.getRelationship(user.id, id)
        : Promise.resolve({ status: 'self' as RelationshipStatus }),
    ])
      .then(async ([profData, relData]) => {
        let userPosts: CommunityPost[] = [];
        if (profData?.can_view_content) {
          userPosts = await communityService.getUserPosts({
            targetUserId: id,
            viewerId: user?.id ?? null,
            limit: 21,
            offset: 0,
          });
        }
        if (isCurrent) {
          setProfile(profData);
          setRelationship(relData);
          setPosts(userPosts);
          setHasMore(userPosts.length >= 21);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.warn('Error loading user profile:', e);
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id, user, isSelf]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !profile?.can_view_content || !id) return;

    try {
      setLoadingMore(true);
      const nextBatch = await communityService.getUserPosts({
        targetUserId: id,
        viewerId: user?.id ?? null,
        limit: 21,
        offset: posts.length,
      });

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...nextBatch]);
        if (nextBatch.length < 21) setHasMore(false);
      }
    } catch {
      // Graceful fail
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRelationshipAction = async () => {
    if (!user?.id || !id || actionLoading) return;
    setActionLoading(true);

    try {
      if (relationship.status === 'none') {
        const res = await friendsService.sendFriendRequest(user.id, id);
        if (res.success) {
          setRelationship({ status: 'pending_sent' });
          pushNotificationService.checkPermissions().then((granted) => {
            if (!granted) {
              setShowPermModal(true);
            }
          });
        } else {
          Alert.alert('Unable to Send', res.error || 'Failed to send friend request');
        }
      } else if (relationship.status === 'pending_sent') {
        Alert.alert('Cancel Request', 'Cancel this friend request?', [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Cancel Request',
            style: 'destructive',
            onPress: async () => {
              if (relationship.requestId) {
                await friendsService.declineOrCancelRequest(relationship.requestId);
              } else {
                const rel = await friendsService.getRelationship(user.id, id);
                if (rel.requestId) await friendsService.declineOrCancelRequest(rel.requestId);
              }
              setRelationship({ status: 'none' });
            },
          },
        ]);
      } else if (relationship.status === 'pending_received') {
        if (relationship.requestId) {
          await friendsService.acceptFriendRequest(relationship.requestId);
          setRelationship({ status: 'friends' });
          loadProfileData(true);
        }
      }
    } catch (e: any) {
      Alert.alert('Action Failed', e?.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriendConfirm = () => {
    setShowMenuModal(false);
    if (!user?.id || !id) return;

    Alert.alert(
      'Unfriend',
      `Remove @${profile?.username || 'user'} from friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendsService.unfriend(user.id, id);
              setRelationship({ status: 'none' });
              loadProfileData(true);
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to unfriend');
            }
          },
        },
      ]
    );
  };

  const handleBlockConfirm = () => {
    setShowMenuModal(false);
    if (!user?.id || !id) return;

    Alert.alert(
      'Block User',
      `Are you sure you want to block @${profile?.username || 'user'}? You will not see each other's posts and any friendship will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.blockUser({
                blockerId: user.id,
                blockedId: id,
              });
              Alert.alert('User Blocked', 'This user has been blocked.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleReportConfirm = () => {
    setShowMenuModal(false);
    Alert.alert(
      'Report Account',
      'Thank you for helping keep SweatFlix safe. Our community team will review this account.',
      [{ text: 'Done' }]
    );
  };

  const renderRelationshipButton = () => {
    if (isSelf) {
      return (
        <TouchableOpacity
          style={[styles.mainActionBtn, styles.editBtn]}
          onPress={() => router.push('/profile/edit' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={16} color={Colors.textDark} />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      );
    }

    if (actionLoading) {
      return (
        <View style={[styles.mainActionBtn, styles.loadingBtn]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }

    switch (relationship.status) {
      case 'none':
        return (
          <TouchableOpacity
            style={[styles.mainActionBtn, styles.primaryBtn]}
            onPress={handleRelationshipAction}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Add Friend</Text>
          </TouchableOpacity>
        );

      case 'pending_sent':
        return (
          <TouchableOpacity
            style={[styles.mainActionBtn, styles.sentBtn]}
            onPress={handleRelationshipAction}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={16} color={Colors.textGrey} />
            <Text style={styles.sentBtnText}>Request Sent</Text>
          </TouchableOpacity>
        );

      case 'pending_received':
        return (
          <View style={styles.receivedBtnRow}>
            <TouchableOpacity
              style={[styles.mainActionBtn, styles.acceptBtn]}
              onPress={handleRelationshipAction}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainActionBtn, styles.declineBtn]}
              onPress={async () => {
                if (relationship.requestId) {
                  await friendsService.declineOrCancelRequest(relationship.requestId);
                  setRelationship({ status: 'none' });
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        );

      case 'friends':
        return (
          <View style={styles.friendsActionRow}>
            <TouchableOpacity
              style={[styles.mainActionBtn, styles.challengeFriendBtn]}
              onPress={() =>
                router.push({
                  pathname: '/community/new-challenge',
                  params: {
                    friendId: id,
                    friendName: profile?.name,
                    friendUsername: profile?.username || undefined,
                    friendAvatar: profile?.avatar_url || undefined,
                  },
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="flame" size={16} color="#FFFFFF" />
              <Text style={styles.challengeFriendBtnText}>Challenge</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainActionBtn, styles.friendsBadgeBtn]}
              onPress={() => setShowMenuModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={16} color={Colors.primary} />
              <Text style={styles.friendsBadgeText}>Friends</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.primary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.profileHeader}>
        {/* Top Info Row */}
        <View style={styles.avatarRow}>
          {/* Avatar */}
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarLarge} />
          ) : (
            <View
              style={[
                styles.avatarInitialLarge,
                { backgroundColor: getAvatarColor(id || 'default') },
              ]}
            >
              <Text style={styles.avatarInitialLargeText}>
                {(profile?.name || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Counts */}
          <View style={styles.countsContainer}>
            <View style={styles.countBox}>
              <Text style={styles.countNumber}>
                {profile?.can_view_content ? profile?.posts_count ?? 0 : '—'}
              </Text>
              <Text style={styles.countLabel}>Posts</Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countNumber}>{profile?.friends_count ?? 0}</Text>
              <Text style={styles.countLabel}>Friends</Text>
            </View>
          </View>
        </View>

        {/* Name and Bio */}
        <View style={styles.bioSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.fullName}>{profile?.name || 'Athlete'}</Text>
            {profile?.league_tier ? (
              <LeagueTierBadge
                tier={profile.league_tier}
                size="small"
                showCrown={Boolean(profile?.is_weekly_champion)}
                style={{ marginLeft: 6 }}
              />
            ) : null}
          </View>
          <Text style={styles.usernameHandle}>
            {profile?.username ? `@${profile.username}` : ''}
          </Text>
          {profile?.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
        </View>

        {/* Relationship / Action Button */}
        <View style={styles.actionBtnContainer}>{renderRelationshipButton()}</View>

        {/* Section Divider */}
        <View style={styles.divider} />
      </View>
    );
  };

  const renderPrivateLockState = () => {
    const isPrivate = profile?.account_visibility === 'private';
    return (
      <View style={styles.privateStateContainer}>
        <View style={styles.lockCircle}>
          <Ionicons name="lock-closed" size={38} color={Colors.primary} />
        </View>
        <Text style={styles.privateTitle}>
          {isPrivate ? 'This Account is Private' : 'Only Friends Can See This Account'}
        </Text>
        <Text style={styles.privateSubtitle}>
          {isPrivate
            ? 'This athlete keeps their profile and workout posts private.'
            : 'Send a friend request to connect and view their workout photos.'}
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.navTitle} numberOfLines={1}>
          {profile?.username ? `@${profile.username}` : profile?.name || 'Profile'}
        </Text>

        {!isSelf ? (
          <TouchableOpacity
            onPress={() => setShowMenuModal(true)}
            style={styles.navBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Profile Content */}
      {!profile?.can_view_content ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderPrivateLockState()}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProfileData(true)}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          ListHeaderComponent={renderHeader()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProfileData(true)}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyGridContainer}>
              <Ionicons name="camera-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyGridTitle}>No posts yet</Text>
              <Text style={styles.emptyGridSub}>
                {isSelf
                  ? 'Share your daily workout photo with the community!'
                  : 'This athlete has not posted any workouts yet.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridThumbContainer}
              onPress={() => router.push(`/community/post-detail?id=${item.id}` as any)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.gridThumbImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
              {isSelf && (
                <View style={styles.visibilityBadge}>
                  <Ionicons
                    name={
                      item.visibility === 'public'
                        ? 'globe-outline'
                        : item.visibility === 'friends'
                        ? 'people-outline'
                        : 'lock-closed-outline'
                    }
                    size={11}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* Relationship / Options Modal */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={styles.menuSheet}>
            {relationship.status === 'friends' && (
              <TouchableOpacity style={styles.menuItem} onPress={handleUnfriendConfirm}>
                <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Unfriend</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={handleBlockConfirm}>
              <Ionicons name="ban-outline" size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Block User</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleReportConfirm}>
              <Ionicons name="flag-outline" size={20} color={Colors.textDark} />
              <Text style={styles.menuItemText}>Report Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelMenuItem]}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={styles.cancelMenuText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Natural Moment Push Permission Modal */}
      <NotificationPermissionModal
        visible={showPermModal}
        contextReason="friend_request"
        onDismiss={() => setShowPermModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textGrey,
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
    textAlign: 'center',
  },
  profileHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  avatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E5E7EB',
  },
  avatarInitialLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialLargeText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: Spacing.xl,
  },
  countBox: {
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  countLabel: {
    fontSize: 13,
    color: Colors.textGrey,
    fontWeight: '500',
    marginTop: 2,
  },
  bioSection: {
    marginBottom: Spacing.md,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  usernameHandle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
  },
  bioText: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  actionBtnContainer: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  loadingBtn: {
    backgroundColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editBtnText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  sentBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sentBtnText: {
    color: Colors.textGrey,
    fontSize: 14,
    fontWeight: '600',
  },
  receivedBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  declineBtnText: {
    color: Colors.textGrey,
    fontSize: 14,
    fontWeight: '600',
  },
  friendsActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  challengeFriendBtn: {
    flex: 1,
    backgroundColor: '#E5252A',
  },
  challengeFriendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  friendsBadgeBtn: {
    flex: 1,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  friendsBadgeText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginTop: Spacing.xs,
  },
  privateStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 80,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  privateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  privateSubtitle: {
    fontSize: 14,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  gridThumbContainer: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginRight: 1,
    marginBottom: 1,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  gridThumbImage: {
    width: '100%',
    height: '100%',
  },
  visibilityBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 10,
    padding: 3,
  },
  emptyGridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: Spacing.xl,
  },
  emptyGridTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  emptyGridSub: {
    fontSize: 13,
    color: Colors.textGrey,
    textAlign: 'center',
    maxWidth: 260,
  },
  footerLoader: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl + 10,
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
