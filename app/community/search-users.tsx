import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { friendsService, UserSearchResult } from '../../services/friendsService';
import { getAvatarColor } from '../../services/communityService';
import { pushNotificationService } from '../../services/pushNotificationService';
import { NotificationPermissionModal } from '../../components/NotificationPermissionModal';

export default function SearchUsersScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showPermModal, setShowPermModal] = useState(false);

  const debounceRef = useRef<any>(null);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const clean = text.trim();
    if (!clean) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await friendsService.searchUsers(clean, user?.id || '');
        setResults(data);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleRelationshipAction = async (targetUser: UserSearchResult) => {
    if (!user?.id || actionLoadingId) return;

    setActionLoadingId(targetUser.id);

    try {
      if (targetUser.relationship === 'none') {
        const res = await friendsService.sendFriendRequest(user.id, targetUser.id);
        if (res.success) {
          setResults((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, relationship: 'pending_sent' } : u))
          );
          // Check if notification permission is granted, otherwise prompt at natural moment
          pushNotificationService.checkPermissions().then((granted) => {
            if (!granted) {
              setShowPermModal(true);
            }
          });
        } else {
          Alert.alert('Unable to Send', res.error || 'Failed to send friend request');
        }
      } else if (targetUser.relationship === 'pending_sent') {
        // Option to cancel sent request
        Alert.alert(
          'Cancel Request',
          `Cancel friend request sent to @${targetUser.username || targetUser.name}?`,
          [
            { text: 'Keep', style: 'cancel' },
            {
              text: 'Cancel Request',
              style: 'destructive',
              onPress: async () => {
                if (targetUser.requestId) {
                  await friendsService.declineOrCancelRequest(targetUser.requestId);
                } else {
                  // Fallback query if requestId is missing
                  const rel = await friendsService.getRelationship(user.id, targetUser.id);
                  if (rel.requestId) {
                    await friendsService.declineOrCancelRequest(rel.requestId);
                  }
                }
                setResults((prev) =>
                  prev.map((u) => (u.id === targetUser.id ? { ...u, relationship: 'none' } : u))
                );
              },
            },
          ]
        );
      } else if (targetUser.relationship === 'pending_received') {
        if (targetUser.requestId) {
          await friendsService.acceptFriendRequest(targetUser.requestId);
          setResults((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, relationship: 'friends' } : u))
          );
        }
      } else if (targetUser.relationship === 'friends') {
        // Open their profile
        router.push(`/user/${targetUser.id}` as any);
      }
    } catch (e: any) {
      Alert.alert('Action Failed', e?.message || 'Something went wrong');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderRelationshipButton = (item: UserSearchResult) => {
    const isLoading = actionLoadingId === item.id;

    if (isLoading) {
      return (
        <View style={[styles.relBtn, styles.relBtnLoading]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }

    switch (item.relationship) {
      case 'none':
        return (
          <TouchableOpacity
            style={[styles.relBtn, styles.relBtnAdd]}
            onPress={() => handleRelationshipAction(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={14} color="#FFFFFF" />
            <Text style={styles.relBtnAddText}>Add</Text>
          </TouchableOpacity>
        );

      case 'pending_sent':
        return (
          <TouchableOpacity
            style={[styles.relBtn, styles.relBtnSent]}
            onPress={() => handleRelationshipAction(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={14} color={Colors.textGrey} />
            <Text style={styles.relBtnSentText}>Sent</Text>
          </TouchableOpacity>
        );

      case 'pending_received':
        return (
          <TouchableOpacity
            style={[styles.relBtn, styles.relBtnAccept]}
            onPress={() => handleRelationshipAction(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            <Text style={styles.relBtnAcceptText}>Accept</Text>
          </TouchableOpacity>
        );

      case 'friends':
        return (
          <View style={[styles.relBtn, styles.relBtnFriends]}>
            <Ionicons name="people" size={14} color={Colors.primary} />
            <Text style={styles.relBtnFriendsText}>Friends</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Header Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textGrey} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search @username or name..."
            placeholderTextColor={Colors.textGrey}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleQueryChange('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={Colors.textGrey} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching athletes...</Text>
        </View>
      ) : query.trim().length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="people-outline" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Find Friends & Athletes</Text>
          <Text style={styles.emptySubtitle}>
            Search by @username to discover workout buddies, send friend requests, and share progress.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={Colors.textGrey} />
          <Text style={styles.emptyTitle}>No athletes found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn&apos;t find anyone matching &ldquo;@{query.trim()}&rdquo;. Try searching for another name or handle.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => router.push(`/user/${item.id}` as any)}
              activeOpacity={0.7}
            >
              {/* Avatar */}
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View
                  style={[
                    styles.avatarInitial,
                    { backgroundColor: getAvatarColor(item.id) },
                  ]}
                >
                  <Text style={styles.avatarInitialText}>
                    {(item.name || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.name || 'Athlete'}
                </Text>
                <Text style={styles.userUsername} numberOfLines={1}>
                  {item.username ? `@${item.username}` : 'No username yet'}
                </Text>
                {item.bio ? (
                  <Text style={styles.userBio} numberOfLines={1}>
                    {item.bio}
                  </Text>
                ) : null}
              </View>

              {/* Action Button */}
              {renderRelationshipButton(item)}
            </TouchableOpacity>
          )}
        />
      )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    paddingVertical: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
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
    maxWidth: 280,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  avatarInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  userBio: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
  },
  relBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    minWidth: 78,
    justifyContent: 'center',
  },
  relBtnLoading: {
    backgroundColor: '#F3F4F6',
  },
  relBtnAdd: {
    backgroundColor: Colors.primary,
    gap: 4,
  },
  relBtnAddText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  relBtnSent: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  relBtnSentText: {
    color: Colors.textGrey,
    fontSize: 13,
    fontWeight: '600',
  },
  relBtnAccept: {
    backgroundColor: '#10B981',
    gap: 4,
  },
  relBtnAcceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  relBtnFriends: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 4,
  },
  relBtnFriendsText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
