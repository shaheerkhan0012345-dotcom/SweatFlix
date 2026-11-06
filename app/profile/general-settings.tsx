import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { communityService, BlockedUser } from '../../services/communityService';
import { profileService, AccountVisibility } from '../../services/profileService';
import { notificationService, NotificationSettings } from '../../services/notificationService';

const REMINDER_TIMES = ['07:00 AM', '08:00 AM', '12:00 PM', '06:00 PM', '08:00 PM'];

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { settings, updateGeneralSettings, clearCache } = useSettings();
  const gs = settings.generalSettings;

  const [showClearModal, setShowClearModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification preferences state (Step 9f)
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    user_id: user?.id || '',
    friend_requests: true,
    challenges: true,
    likes: true,
    reminders: true,
  });

  useEffect(() => {
    if (user?.id) {
      notificationService.getNotificationSettings(user.id).then((s) => {
        setNotifSettings(s);
      });
    }
  }, [user?.id]);

  const handleToggleNotifSetting = async (
    key: 'friend_requests' | 'challenges' | 'likes' | 'reminders',
    val: boolean
  ) => {
    setNotifSettings((prev) => ({ ...prev, [key]: val }));
    if (user?.id) {
      await notificationService.updateNotificationSettings(user.id, { [key]: val });
    }
    if (key === 'reminders') {
      updateGeneralSettings({ workoutReminders: val });
    }
  };

  // Privacy visibility update state
  const [updatingVis, setUpdatingVis] = useState(false);
  const [updatingLeaderboard, setUpdatingLeaderboard] = useState(false);

  const handleUpdateVisibility = async (newVis: AccountVisibility) => {
    if (!user?.id || updatingVis) return;
    setUpdatingVis(true);
    try {
      await profileService.updateAccountVisibility(user.id, newVis);
      // If user sets visibility away from public, leaderboard participation is turned off
      if (newVis !== 'public' && profile?.show_on_leaderboard) {
        await profileService.updateShowOnLeaderboard(user.id, false);
      }
      await refreshProfile();
      setToastMessage('Privacy updated! Stricter rule applies to all posts.');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update privacy');
    } finally {
      setUpdatingVis(false);
    }
  };

  const handleToggleLeaderboard = async (newVal: boolean) => {
    if (!user?.id || updatingLeaderboard) return;

    if (newVal && profile?.account_visibility !== 'public') {
      Alert.alert(
        'Public Account Required',
        'Global leaderboard ranking requires your account to be visible to Everyone (Public). Change your Account Visibility above to enable this.'
      );
      return;
    }

    setUpdatingLeaderboard(true);
    try {
      await profileService.updateShowOnLeaderboard(user.id, newVal);
      await refreshProfile();
      setToastMessage(`Global leaderboard ${newVal ? 'enabled' : 'disabled'}`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update leaderboard preference');
    } finally {
      setUpdatingLeaderboard(false);
    }
  };

  // Blocked users management state
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const list = await communityService.getBlockedUsers(user?.id || '');
      setBlockedUsers(list);
    } catch (e) {
      console.warn('Error loading blocked users:', e);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleOpenBlocked = () => {
    setShowBlockedModal(true);
    fetchBlockedUsers();
  };

  const handleUnblock = (blockedId: string, name: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${name}? Their posts will appear in your feed again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setUnblockingId(blockedId);
            try {
              await communityService.unblockUser({
                blockerId: user?.id || '',
                blockedId,
              });
              setBlockedUsers((prev) => prev.filter((u) => u.blocked_id !== blockedId));
              setToastMessage(`${name} unblocked`);
              setTimeout(() => setToastMessage(null), 2500);
            } catch {
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            } finally {
              setUnblockingId(null);
            }
          },
        },
      ]
    );
  };

  const handleClearCacheConfirm = async () => {
    setShowClearModal(false);
    await clearCache();
    setToastMessage('App cache cleared! 🧹');
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>General Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastCard}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Notifications Settings Card (Step 9f) */}
      <Card style={styles.card}>
        <View style={styles.privacyHeaderRow}>
          <Ionicons name="notifications" size={20} color={Colors.primary} />
          <Text style={styles.settingTitle}>Notifications</Text>
        </View>
        <Text style={styles.privacyNotice}>
          Choose which notifications you receive on this device and in your activity feed.
        </Text>

        {/* 1. Friend Requests */}
        <View style={styles.switchRow}>
          <View style={styles.flexOne}>
            <Text style={styles.subSettingTitle}>Friend Requests</Text>
            <Text style={styles.settingDesc}>
              When athletes send or accept friend requests.
            </Text>
          </View>
          <Switch
            value={notifSettings.friend_requests}
            onValueChange={(val) => handleToggleNotifSetting('friend_requests', val)}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>

        {/* 2. 1v1 Challenges */}
        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14, marginTop: 4 }]}>
          <View style={styles.flexOne}>
            <Text style={styles.subSettingTitle}>Challenges & Results</Text>
            <Text style={styles.settingDesc}>
              Invites, acceptances, opponent reps and winner results.
            </Text>
          </View>
          <Switch
            value={notifSettings.challenges}
            onValueChange={(val) => handleToggleNotifSetting('challenges', val)}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>

        {/* 3. Likes */}
        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14, marginTop: 4 }]}>
          <View style={styles.flexOne}>
            <Text style={styles.subSettingTitle}>Workout Post Likes</Text>
            <Text style={styles.settingDesc}>
              When someone likes your workout photos (max 1/hour).
            </Text>
          </View>
          <Switch
            value={notifSettings.likes}
            onValueChange={(val) => handleToggleNotifSetting('likes', val)}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>

        {/* 4. Workout Reminders */}
        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14, marginTop: 4 }]}>
          <View style={styles.flexOne}>
            <Text style={styles.subSettingTitle}>Daily Workout Reminders</Text>
            <Text style={styles.settingDesc}>
              Daily local reminder: &quot;Time to sweat! Your workout is ready.&quot;
            </Text>
          </View>
          <Switch
            value={notifSettings.reminders && gs.workoutReminders}
            onValueChange={(val) => handleToggleNotifSetting('reminders', val)}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>

        {notifSettings.reminders && gs.workoutReminders && (
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>Reminder Time</Text>
            <View style={styles.timeChipsRow}>
              {REMINDER_TIMES.map((time) => {
                const isSelected = gs.reminderTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    onPress={() => updateGeneralSettings({ reminderTime: time })}
                    style={[
                      styles.timeChip,
                      isSelected ? styles.timeChipSelected : styles.timeChipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        isSelected && styles.timeTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </Card>

      {/* Privacy Settings Card (Step 9b) */}
      <Card style={styles.card}>
        <View style={styles.privacyHeaderRow}>
          <Ionicons name="shield-outline" size={20} color={Colors.primary} />
          <Text style={styles.settingTitle}>Who can see my profile and posts</Text>
        </View>
        <Text style={styles.privacyNotice}>
          Changing this applies to all your posts immediately. The stricter rule between your account and post setting always wins.
        </Text>

        {/* Option 1: Everyone */}
        <TouchableOpacity
          style={[
            styles.privacyOption,
            (profile?.account_visibility || 'public') === 'public' && styles.privacyOptionActive,
          ]}
          onPress={() => handleUpdateVisibility('public')}
          activeOpacity={0.8}
        >
          <View style={styles.radioCircle}>
            {(profile?.account_visibility || 'public') === 'public' && (
              <View style={styles.radioDot} />
            )}
          </View>
          <View style={styles.privacyOptionTextCol}>
            <Text style={styles.privacyOptionTitle}>Everyone</Text>
            <Text style={styles.privacyOptionDesc}>
              Anyone can see your profile and posts.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Friends only */}
        <TouchableOpacity
          style={[
            styles.privacyOption,
            profile?.account_visibility === 'friends' && styles.privacyOptionActive,
          ]}
          onPress={() => handleUpdateVisibility('friends')}
          activeOpacity={0.8}
        >
          <View style={styles.radioCircle}>
            {profile?.account_visibility === 'friends' && (
              <View style={styles.radioDot} />
            )}
          </View>
          <View style={styles.privacyOptionTextCol}>
            <Text style={styles.privacyOptionTitle}>Friends only</Text>
            <Text style={styles.privacyOptionDesc}>
              Only accepted friends can see your profile and posts, even if a post is public.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 3: Only me */}
        <TouchableOpacity
          style={[
            styles.privacyOption,
            profile?.account_visibility === 'private' && styles.privacyOptionActive,
          ]}
          onPress={() => handleUpdateVisibility('private')}
          activeOpacity={0.8}
        >
          <View style={styles.radioCircle}>
            {profile?.account_visibility === 'private' && (
              <View style={styles.radioDot} />
            )}
          </View>
          <View style={styles.privacyOptionTextCol}>
            <Text style={styles.privacyOptionTitle}>Only me (Private)</Text>
            <Text style={styles.privacyOptionDesc}>
              Nobody else can see your profile or posts. Account is private.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Step 9d: Show me on the global leaderboard toggle */}
        <View style={styles.leaderboardToggleSection}>
          <View style={styles.leaderboardToggleRow}>
            <View style={styles.leaderboardTextCol}>
              <View style={styles.leaderboardTitleRow}>
                <Ionicons
                  name="earth"
                  size={18}
                  color={profile?.account_visibility === 'public' ? Colors.primary : Colors.textGrey}
                />
                <Text style={styles.leaderboardTitle}>Show me on the global leaderboard</Text>
              </View>
              <Text style={styles.leaderboardDesc}>
                Compete against athletes worldwide on the weekly Global leaderboard.
              </Text>
            </View>

            <Switch
              value={Boolean(profile?.show_on_leaderboard) && profile?.account_visibility === 'public'}
              onValueChange={handleToggleLeaderboard}
              disabled={profile?.account_visibility !== 'public' || updatingLeaderboard}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {profile?.account_visibility !== 'public' && (
            <View style={styles.leaderboardDisabledNote}>
              <Ionicons name="information-circle" size={15} color="#D97706" />
              <Text style={styles.leaderboardDisabledText}>
                Disabled because your account is set to {profile?.account_visibility === 'friends' ? 'Friends only' : 'Only me'}. Set Account Visibility to &quot;Everyone (Public)&quot; above to compete on the global leaderboard.
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Community & Safety - Blocked Users */}
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Blocked Users</Text>
            <Text style={styles.settingDesc}>
              Accounts you have blocked from your Community feed.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenBlocked}
            style={styles.manageBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.manageBtnText}>Manage</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Storage & Cache */}
      <Card style={styles.card}>
        <Text style={styles.settingTitle}>Storage & Memory</Text>
        <Text style={styles.settingDesc}>
          Free up temporary video thumbnail and asset storage.
        </Text>
        <TouchableOpacity
          onPress={() => setShowClearModal(true)}
          style={styles.clearCacheBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.primary} />
          <Text style={styles.clearCacheBtnText}>Clear Cached Files</Text>
        </TouchableOpacity>
      </Card>

      {/* Blocked Users Modal */}
      <Modal visible={showBlockedModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.blockedModalCard]}>
            <View style={styles.blockedModalHeader}>
              <Text style={styles.modalTitle}>Blocked Users</Text>
              <TouchableOpacity
                onPress={() => setShowBlockedModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            {loadingBlocked ? (
              <View style={styles.blockedLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.blockedEmptyText}>Loading blocked users...</Text>
              </View>
            ) : blockedUsers.length === 0 ? (
              <View style={styles.blockedEmptyContainer}>
                <Ionicons name="shield-checkmark-outline" size={44} color="#AAAAAA" />
                <Text style={styles.blockedEmptyTitle}>No Blocked Users</Text>
                <Text style={styles.blockedEmptySub}>
                  You have not blocked any users. When you block an account from the Community feed, they will appear here.
                </Text>
              </View>
            ) : (
              <FlatList
                data={blockedUsers}
                keyExtractor={(item) => item.blocked_id}
                style={{ width: '100%', maxHeight: 360 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.blockedItem}>
                    <View style={styles.blockedAvatar}>
                      <Text style={styles.blockedAvatarInitial}>
                        {(item.name || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.blockedInfo}>
                      <Text style={styles.blockedName} numberOfLines={1}>
                        {item.name || 'Blocked User'}
                      </Text>
                      <Text style={styles.blockedDate}>Blocked</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleUnblock(item.blocked_id, item.name || 'User')}
                      disabled={unblockingId === item.blocked_id}
                      style={styles.unblockBtn}
                      activeOpacity={0.7}
                    >
                      {unblockingId === item.blocked_id ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Text style={styles.unblockBtnText}>Unblock</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Clear Cache Modal */}
      <Modal visible={showClearModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Clear Temporary Cache?</Text>
            <Text style={styles.modalSub}>
              This will remove temporary cache files. Your workouts and settings will NOT be lost.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowClearModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearCacheConfirm}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmBtnText}>Clear Cache</Text>
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
    paddingBottom: Spacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  subSettingTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  settingDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  flexOne: {
    flex: 1,
    marginRight: Spacing.md,
  },
  timeSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  timeLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  timeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  timeChipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  timeChipSelected: {
    backgroundColor: Colors.primary,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFEAEA',
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    marginTop: Spacing.md,
  },
  clearCacheBtnText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.button,
    backgroundColor: '#FFEAEA',
  },
  manageBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  blockedModalCard: {
    maxHeight: '80%',
    padding: Spacing.lg,
  },
  blockedModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  closeBtn: {
    padding: 4,
  },
  blockedLoadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  blockedEmptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  blockedEmptyTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  blockedEmptySub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
  },
  blockedEmptyText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  blockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  blockedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#757575',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  blockedAvatarInitial: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  blockedInfo: {
    flex: 1,
    marginRight: 8,
  },
  blockedName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  blockedDate: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#FFF4F4',
  },
  unblockBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  privacyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  privacyNotice: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#FAFAFA',
  },
  privacyOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F5',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  privacyOptionTextCol: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  privacyOptionDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    lineHeight: 16,
  },
  leaderboardToggleSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  leaderboardToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leaderboardTextCol: {
    flex: 1,
  },
  leaderboardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  leaderboardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.textDark,
  },
  leaderboardDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    lineHeight: 16,
  },
  leaderboardDisabledNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  leaderboardDisabledText: {
    flex: 1,
    fontSize: 11,
    color: '#B45309',
    lineHeight: 15,
    fontWeight: '500',
  },
});
