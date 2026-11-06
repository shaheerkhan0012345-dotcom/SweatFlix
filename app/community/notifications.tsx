import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  notificationService,
  AppNotification,
  NotificationType,
} from '../../services/notificationService';
import { getAvatarColor } from '../../services/communityService';

// Format relative time (e.g. 5m ago, 2h ago, Oct 16)
const formatTimeAgo = (dateStr: string) => {
  try {
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    const diffSecs = Math.floor((now - past) / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 172800) return 'Yesterday';

    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // Load notifications
  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      const targetUserId = user?.id || 'guest';
      if (isRefresh) setRefreshing(true);

      try {
        const data = await notificationService.getNotifications(targetUserId);
        setNotifications(data);
      } catch (err: any) {
        console.warn('Load notifications error:', err?.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    let isCurrent = true;
    const targetUserId = user?.id || 'guest';

    notificationService.getNotifications(targetUserId)
      .then((data) => {
        if (isCurrent) {
          setNotifications(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        console.warn('Load notifications error:', err?.message);
        if (isCurrent) setLoading(false);
      });

    // Subscribe to real-time & local notification inserts
    const sub = notificationService.subscribeToNotifications(targetUserId, (newNotif) => {
      if (!isCurrent) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    });

    return () => {
      isCurrent = false;
      sub.unsubscribe();
    };
  }, [user?.id]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead(user?.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch (err: any) {
      console.warn('Mark all read error:', err?.message);
    } finally {
      setMarkingAll(false);
    }
  };

  // Create a test notification for immediate UI verification
  const handleCreateTestNotification = async (type: NotificationType = 'challenge_invite') => {
    const targetUserId = user?.id || 'guest';
    const testNotif = await notificationService.createTestNotification(targetUserId, type);
    setNotifications((prev) => {
      if (prev.some((n) => n.id === testNotif.id)) return prev;
      return [testNotif, ...prev];
    });
  };

  // Tap notification: mark read and route
  const handleTapNotification = async (item: AppNotification) => {
    // Mark as read locally and in backend
    if (!item.read_at) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      notificationService.markAsRead(item.id, user?.id);
    }

    // Route according to type
    switch (item.type) {
      case 'friend_request':
      case 'friend_accepted':
        router.push('/community/friends' as any);
        break;

      case 'challenge_invite':
      case 'challenge_accepted':
      case 'challenge_entry':
      case 'challenge_result':
        if (item.ref_id) {
          router.push({
            pathname: '/community/challenge-detail',
            params: { id: item.ref_id },
          });
        } else {
          router.push('/community/challenges' as any);
        }
        break;

      case 'post_like':
        if (item.ref_id) {
          router.push({
            pathname: '/community/post-detail',
            params: { id: item.ref_id },
          });
        } else {
          router.push('/(tabs)/community' as any);
        }
        break;

      default:
        break;
    }
  };

  // Group notifications into Today and Earlier
  const { todayNotifs, earlierNotifs } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayItems: AppNotification[] = [];
    const earlierItems: AppNotification[] = [];

    notifications.forEach((item) => {
      const itemDate = new Date(item.created_at);
      if (itemDate >= today) {
        todayItems.push(item);
      } else {
        earlierItems.push(item);
      }
    });

    return { todayNotifs: todayItems, earlierNotifs: earlierItems };
  }, [notifications]);

  const hasUnread = useMemo(
    () => notifications.some((n) => !n.read_at),
    [notifications]
  );



  // Format notification message text
  const renderMessageContent = (item: AppNotification) => {
    const actorName = item.data?.actor_name || 'An athlete';

    switch (item.type) {
      case 'friend_request':
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            <Text style={styles.actorNameBold}>{actorName}</Text> sent you a friend request.
          </Text>
        );

      case 'friend_accepted':
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            <Text style={styles.actorNameBold}>{actorName}</Text> accepted your friend request!
          </Text>
        );

      case 'challenge_invite':
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            <Text style={styles.actorNameBold}>{actorName}</Text> challenged you to{' '}
            <Text style={styles.highlightText}>
              {item.data?.target || ''} {item.data?.metric || ''} of {item.data?.exercise_name || 'a workout'}
            </Text>
            !
          </Text>
        );

      case 'challenge_accepted':
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            <Text style={styles.actorNameBold}>{actorName}</Text> accepted your{' '}
            <Text style={styles.highlightText}>{item.data?.exercise_name || 'workout'}</Text> challenge!
          </Text>
        );

      case 'challenge_entry':
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            <Text style={styles.actorNameBold}>{actorName}</Text> logged{' '}
            <Text style={styles.highlightText}>{item.data?.amount || ''} reps</Text> in{' '}
            {item.data?.exercise_name || 'the challenge'}!
          </Text>
        );

      case 'challenge_result':
        if (item.data?.is_winner) {
          return (
            <Text style={[styles.messageText, { color: colors.text }]}>
              🏆 <Text style={styles.actorNameBold}>You won</Text> the {item.data?.exercise_name || ''} challenge! Great work!
            </Text>
          );
        } else if (item.data?.is_draw) {
          return (
            <Text style={[styles.messageText, { color: colors.text }]}>
              🤝 <Text style={styles.actorNameBold}>It&apos;s a draw</Text> in the {item.data?.exercise_name || ''} challenge!
            </Text>
          );
        }
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            The <Text style={styles.actorNameBold}>{item.data?.exercise_name || ''}</Text> challenge has ended. Tap to view final scores.
          </Text>
        );

      case 'post_like':
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            <Text style={styles.actorNameBold}>{actorName}</Text> liked your workout photo.
          </Text>
        );

      default:
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            New update from <Text style={styles.actorNameBold}>{actorName}</Text>.
          </Text>
        );
    }
  };

  // Notification Icon & Accent Badge
  const getBadgeIcon = (type: NotificationType) => {
    switch (type) {
      case 'friend_request':
        return { name: 'person-add', color: '#3B82F6', bg: '#EFF6FF' };
      case 'friend_accepted':
        return { name: 'checkmark-circle', color: '#10B981', bg: '#ECFDF5' };
      case 'challenge_invite':
        return { name: 'flame', color: '#E5252A', bg: '#FEF2F2' };
      case 'challenge_accepted':
        return { name: 'play', color: '#10B981', bg: '#ECFDF5' };
      case 'challenge_entry':
        return { name: 'trending-up', color: '#FF8A1F', bg: '#FFF7ED' };
      case 'challenge_result':
        return { name: 'trophy', color: '#EAB308', bg: '#FEFCE8' };
      case 'post_like':
        return { name: 'heart', color: '#EC4899', bg: '#FDF2F8' };
      default:
        return { name: 'notifications', color: Colors.primary, bg: '#FFF2E5' };
    }
  };

  // Render a single notification row
  const renderItem = ({ item }: { item: AppNotification }) => {
    const isUnread = !item.read_at;
    const actorAvatar = item.data?.actor_avatar_url;
    const actorName = item.data?.actor_name || 'A';
    const actorInitial = actorName.charAt(0).toUpperCase() || 'A';
    const badge = getBadgeIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notifRow,
          {
            backgroundColor: isUnread
              ? isDarkMode
                ? '#1E293B'
                : '#FFF5F5'
              : colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
        onPress={() => handleTapNotification(item)}
        activeOpacity={0.75}
      >
        {/* Avatar with Type Icon Badge */}
        <View style={styles.avatarWrap}>
          {actorAvatar ? (
            <Image source={{ uri: actorAvatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View
              style={[
                styles.avatarInitial,
                { backgroundColor: getAvatarColor(item.actor_id || 'default') },
              ]}
            >
              <Text style={styles.avatarInitialText}>{actorInitial}</Text>
            </View>
          )}

          <View style={[styles.typeIconBadge, { backgroundColor: badge.color }]}>
            <Ionicons name={badge.name as any} size={11} color="#FFFFFF" />
          </View>
        </View>

        {/* Message and Timestamp */}
        <View style={styles.contentCol}>
          {renderMessageContent(item)}
          <Text style={[styles.timeAgoText, { color: colors.textSecondary }]}>
            {formatTimeAgo(item.created_at)}
          </Text>
        </View>

        {/* Unread Red Dot */}
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>

        {hasUnread ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={markingAll}
            style={styles.markAllBtn}
            activeOpacity={0.7}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.markAllText}>Mark all read</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF2E5' }]}>
            <Ionicons name="notifications-outline" size={44} color={Colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            When friends send challenges, like your workout photos, or accept your requests, you&apos;ll see them here.
          </Text>

          <TouchableOpacity
            style={styles.testNotifBtn}
            onPress={() => handleCreateTestNotification('challenge_invite')}
            activeOpacity={0.8}
          >
            <Ionicons name="flame" size={16} color="#FFFFFF" />
            <Text style={styles.testNotifBtnText}>Send Test Challenge Alert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testNotifBtnSecondary, { borderColor: colors.border }]}
            onPress={() => handleCreateTestNotification('post_like')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={16} color="#EC4899" />
            <Text style={[styles.testNotifBtnSecText, { color: colors.text }]}>Send Test Like Alert</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[
            ...(todayNotifs.length > 0
              ? [{ isSectionHeader: true, title: 'Today', id: 'sec-today' }, ...todayNotifs]
              : []),
            ...(earlierNotifs.length > 0
              ? [{ isSectionHeader: true, title: 'Earlier', id: 'sec-earlier' }, ...earlierNotifs]
              : []),
          ]}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={
            !user?.id ? (
              <View
                style={[
                  styles.guestBanner,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFF5EB',
                    borderColor: isDarkMode ? '#334155' : '#FED7AA',
                  },
                ]}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.guestBannerTitle, { color: colors.text }]}>
                    Demo Notifications
                  </Text>
                  <Text style={[styles.guestBannerSub, { color: colors.textSecondary }]}>
                    Sign in to sync live push notifications with friends.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.guestBannerBtn}
                  onPress={() => router.push('/login' as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.guestBannerBtnText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : undefined
          }
          ListFooterComponent={
            <View style={styles.listFooter}>
              <TouchableOpacity
                style={styles.testNotifBtn}
                onPress={() => handleCreateTestNotification('challenge_invite')}
                activeOpacity={0.8}
              >
                <Ionicons name="flame" size={16} color="#FFFFFF" />
                <Text style={styles.testNotifBtnText}>Send Test Challenge Alert</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.testNotifBtnSecondary, { borderColor: colors.border }]}
                onPress={() => handleCreateTestNotification('post_like')}
                activeOpacity={0.8}
              >
                <Ionicons name="heart" size={16} color="#EC4899" />
                <Text style={[styles.testNotifBtnSecText, { color: colors.text }]}>
                  Send Test Like Alert
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }: any) => {
            if (item.isSectionHeader) {
              return (
                <View
                  style={[
                    styles.sectionHeader,
                    { backgroundColor: colors.background, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                    {item.title}
                  </Text>
                </View>
              );
            }
            return renderItem({ item });
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  headerSpacer: {
    width: 60,
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarInitial: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: 16,
  },
  typeIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
    gap: 4,
    paddingRight: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  actorNameBold: {
    fontWeight: Typography.weights.bold,
  },
  highlightText: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  timeAgoText: {
    fontSize: 12,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.primary,
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF2E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: Typography.weights.heavy,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  testNotifBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  testNotifBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: BorderRadius.full,
  },
  testNotifBtnSecText: {
    fontWeight: '700',
    fontSize: 13,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginHorizontal: Spacing.md,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  guestBannerTitle: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  guestBannerSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  guestBannerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  guestBannerBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: 12,
  },
  listFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
});
