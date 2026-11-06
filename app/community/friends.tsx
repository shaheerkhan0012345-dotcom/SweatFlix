import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  friendsService,
  FriendRequestItem,
  FriendListItem,
} from '../../services/friendsService';
import { getAvatarColor } from '../../services/communityService';

type TabKey = 'requests' | 'sent' | 'friends';

export default function FriendsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('requests');
  const [loading, setLoading] = useState(Boolean(user?.id));
  const [refreshing, setRefreshing] = useState(false);

  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [friendsList, setFriendsList] = useState<FriendListItem[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadAll = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;

    if (isRefresh) setRefreshing(true);

    try {
      const [incoming, outgoing, friends] = await Promise.all([
        friendsService.getIncomingRequests(user.id),
        friendsService.getOutgoingRequests(user.id),
        friendsService.getFriendsList(user.id),
      ]);

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setFriendsList(friends);
    } catch (e) {
      console.warn('Failed to load friends data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    let isCurrent = true;
    if (!user?.id) return;

    Promise.all([
      friendsService.getIncomingRequests(user.id),
      friendsService.getOutgoingRequests(user.id),
      friendsService.getFriendsList(user.id),
    ])
      .then(([incoming, outgoing, friends]) => {
        if (isCurrent) {
          setIncomingRequests(incoming);
          setOutgoingRequests(outgoing);
          setFriendsList(friends);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.warn('Failed to load friends data:', e);
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user]);

  const handleAcceptRequest = async (item: FriendRequestItem) => {
    setActionLoadingId(item.id);
    try {
      await friendsService.acceptFriendRequest(item.id);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== item.id));
      // Reload friends list to show newly accepted friend
      if (user?.id) {
        const updated = await friendsService.getFriendsList(user.id);
        setFriendsList(updated);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to accept friend request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = async (item: FriendRequestItem) => {
    setActionLoadingId(item.id);
    try {
      await friendsService.declineOrCancelRequest(item.id);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== item.id));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to decline request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelOutgoing = async (item: FriendRequestItem) => {
    Alert.alert(
      'Cancel Friend Request',
      `Cancel your request to @${item.user.username || item.user.name}?`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(item.id);
            try {
              await friendsService.declineOrCancelRequest(item.id);
              setOutgoingRequests((prev) => prev.filter((r) => r.id !== item.id));
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to cancel request');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleUnfriend = async (friend: FriendListItem) => {
    Alert.alert(
      'Unfriend',
      `Are you sure you want to remove @${friend.username || friend.name} from your friends? They will no longer see your friends-only posts.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            setActionLoadingId(friend.id);
            try {
              await friendsService.unfriend(user.id, friend.id);
              setFriendsList((prev) => prev.filter((f) => f.id !== friend.id));
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to unfriend');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (activeTab === 'requests') {
      if (incomingRequests.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="mail-unread-outline" size={42} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Friend Requests</Text>
            <Text style={styles.emptySubtitle}>
              When someone sends you a friend request, it will appear here for you to accept or decline.
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          data={incomingRequests}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <TouchableOpacity
                style={styles.userInfoRow}
                onPress={() => router.push(`/user/${item.user.id}` as any)}
                activeOpacity={0.7}
              >
                {item.user.avatar_url ? (
                  <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View
                    style={[
                      styles.avatarInitial,
                      { backgroundColor: getAvatarColor(item.user.id || 'default') },
                    ]}
                  >
                    <Text style={styles.avatarInitialText}>
                      {(item.user.name || 'A').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.nameBlock}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {item.user.name || 'Athlete'}
                  </Text>
                  <Text style={styles.usernameText} numberOfLines={1}>
                    @{item.user.username || 'athlete'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.btnGroup}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => handleAcceptRequest(item)}
                  disabled={actionLoadingId === item.id}
                  activeOpacity={0.8}
                >
                  {actionLoadingId === item.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.declineBtn]}
                  onPress={() => handleDeclineRequest(item)}
                  disabled={actionLoadingId === item.id}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={14} color={Colors.textGrey} />
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      );
    }

    if (activeTab === 'sent') {
      if (outgoingRequests.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="paper-plane-outline" size={42} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Sent Requests</Text>
            <Text style={styles.emptySubtitle}>
              You don&apos;t have any pending friend requests sent. Search for athletes to connect!
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          data={outgoingRequests}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <TouchableOpacity
                style={styles.userInfoRow}
                onPress={() => router.push(`/user/${item.user.id}` as any)}
                activeOpacity={0.7}
              >
                {item.user.avatar_url ? (
                  <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View
                    style={[
                      styles.avatarInitial,
                      { backgroundColor: getAvatarColor(item.user.id || 'default') },
                    ]}
                  >
                    <Text style={styles.avatarInitialText}>
                      {(item.user.name || 'A').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.nameBlock}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {item.user.name || 'Athlete'}
                  </Text>
                  <Text style={styles.usernameText} numberOfLines={1}>
                    @{item.user.username || 'athlete'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleCancelOutgoing(item)}
                disabled={actionLoadingId === item.id}
                activeOpacity={0.8}
              >
                {actionLoadingId === item.id ? (
                  <ActivityIndicator size="small" color={Colors.textGrey} />
                ) : (
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      );
    }

    // activeTab === 'friends'
    if (friendsList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="people-outline" size={42} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Friends Yet</Text>
          <Text style={styles.emptySubtitle}>
            Connect with friends to see each other&apos;s workout posts and cheer each other on!
          </Text>
          <TouchableOpacity
            style={styles.findFriendsBtn}
            onPress={() => router.push('/community/search-users' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={16} color="#FFFFFF" />
            <Text style={styles.findFriendsBtnText}>Find Athletes</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={friendsList}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} tintColor={Colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() => router.push(`/user/${item.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.userInfoRow}>
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View
                  style={[
                    styles.avatarInitial,
                    { backgroundColor: getAvatarColor(item.id || 'default') },
                  ]}
                >
                  <Text style={styles.avatarInitialText}>
                    {(item.name || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.nameBlock}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {item.name || 'Athlete'}
                </Text>
                <Text style={styles.usernameText} numberOfLines={1}>
                  @{item.username || 'athlete'}
                </Text>
                {item.bio ? (
                  <Text style={styles.bioText} numberOfLines={1}>
                    {item.bio}
                  </Text>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              style={styles.unfriendIconBtn}
              onPress={() => handleUnfriend(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="person-remove-outline" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends & Requests</Text>
        <TouchableOpacity
          onPress={() => router.push('/community/search-users' as any)}
          style={styles.searchHeaderBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'requests' && styles.tabItemActive]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.8}
        >
          <View style={styles.tabLabelRow}>
            <Text style={[styles.tabLabel, activeTab === 'requests' && styles.tabLabelActive]}>
              Requests
            </Text>
            {incomingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{incomingRequests.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sent' && styles.tabItemActive]}
          onPress={() => setActiveTab('sent')}
          activeOpacity={0.8}
        >
          <View style={styles.tabLabelRow}>
            <Text style={[styles.tabLabel, activeTab === 'sent' && styles.tabLabelActive]}>
              Sent
            </Text>
            {outgoingRequests.length > 0 && (
              <View style={styles.sentBadge}>
                <Text style={styles.sentBadgeText}>{outgoingRequests.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'friends' && styles.tabItemActive]}
          onPress={() => setActiveTab('friends')}
          activeOpacity={0.8}
        >
          <View style={styles.tabLabelRow}>
            <Text style={[styles.tabLabel, activeTab === 'friends' && styles.tabLabelActive]}>
              Friends
            </Text>
            {friendsList.length > 0 && (
              <Text style={styles.countPill}>({friendsList.length})</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.flexOne}>{renderTabContent()}</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  searchHeaderBtn: {
    padding: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textGrey,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#E5252A',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sentBadge: {
    backgroundColor: '#9CA3AF',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  countPill: {
    fontSize: 12,
    color: Colors.textGrey,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  findFriendsBtn: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  findFriendsBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  userInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  avatarInitial: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameBlock: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    minWidth: 70,
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
    gap: 4,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  declineBtnText: {
    color: Colors.textGrey,
    fontSize: 13,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
  },
  cancelBtnText: {
    color: Colors.textGrey,
    fontSize: 13,
    fontWeight: '600',
  },
  unfriendIconBtn: {
    padding: Spacing.sm,
  },
});
