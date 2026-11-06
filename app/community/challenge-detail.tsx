import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  challengeService,
  FriendChallenge,
  FriendChallengeEntry,
} from '../../services/challengeService';
import { getAvatarColor } from '../../services/communityService';

function formatCountdown(endsAt: string | null): { text: string; isExpired: boolean } {
  if (!endsAt) return { text: 'Not started', isExpired: false };
  const diffMs = new Date(endsAt).getTime() - Date.now();
  if (diffMs <= 0) return { text: 'Time expired', isExpired: true };

  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return {
      text: `${days}d ${remainingHours}h ${pad(minutes)}m left`,
      isExpired: false,
    };
  }
  return {
    text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    isExpired: false,
  };
}

function formatEntryTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / (60 * 1000));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

// Sub-component for playing proof video inside a modal
function VideoModalPlayer({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.videoModalOverlay}>
        <View style={styles.videoPlayerContainer}>
          <TouchableOpacity style={styles.videoCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <VideoView
            player={player}
            style={styles.videoView}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [challenge, setChallenge] = useState<FriendChallenge | null>(null);
  const [entries, setEntries] = useState<FriendChallengeEntry[]>([]);
  const [myDisputesCount, setMyDisputesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live countdown timer state
  const [countdown, setCountdown] = useState<{ text: string; isExpired: boolean }>({
    text: 'Loading...',
    isExpired: false,
  });

  // Log Reps Sheet Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logAmount, setLogAmount] = useState<number>(20);
  const [proofVideoUri, setProofVideoUri] = useState<string | null>(null);
  const [loggingSubmitting, setLoggingSubmitting] = useState(false);

  // Video viewer modal
  const [viewingVideoUrl, setViewingVideoUrl] = useState<string | null>(null);

  const isCreator = challenge?.creator_id === user?.id;
  const isOpponent = challenge?.opponent_id === user?.id;
  const friend = isCreator ? challenge?.opponent : challenge?.creator;
  const isSeconds = challenge?.metric === 'seconds';

  const myScore = isCreator ? challenge?.creator_score || 0 : challenge?.opponent_score || 0;
  const friendScore = isCreator ? challenge?.opponent_score || 0 : challenge?.creator_score || 0;
  const target = challenge?.target || 1;

  const myProgress = Math.min(1, myScore / target);
  const friendProgress = Math.min(1, friendScore / target);

  // Fetch full detail
  const loadDetail = useCallback(
    async (isRefresh = false) => {
      if (!id || !user?.id) return;
      if (isRefresh) setRefreshing(true);

      try {
        const result = await challengeService.getChallengeDetail(id, user.id);
        if (result) {
          setChallenge(result.challenge);
          setEntries(result.entries);
          setMyDisputesCount(result.myDisputesCount);
          setCountdown(formatCountdown(result.challenge.ends_at));
        }
      } catch (err: any) {
        console.warn('Error loading challenge detail:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, user]
  );

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  // Live timer interval (every second)
  useEffect(() => {
    if (!challenge || challenge.status !== 'active' || !challenge.ends_at) return;

    const timer = setInterval(() => {
      const current = formatCountdown(challenge.ends_at);
      setCountdown(current);
      if (current.isExpired) {
        // Automatically refresh once time runs out
        clearInterval(timer);
        loadDetail();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge, loadDetail]);

  // Accept Challenge
  const handleAccept = async () => {
    if (!challenge) return;
    try {
      await challengeService.acceptChallenge(challenge.id);
      await loadDetail();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to accept challenge');
    }
  };

  // Decline Challenge
  const handleDecline = async () => {
    if (!challenge) return;
    try {
      await challengeService.declineChallenge(challenge.id);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to decline challenge');
    }
  };

  // Cancel Challenge (Creator while pending)
  const handleCancel = async () => {
    if (!challenge) return;
    Alert.alert(
      'Cancel Challenge',
      'Are you sure you want to cancel this pending challenge request?',
      [
        { text: 'Keep Challenge', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              await challengeService.cancelChallenge(challenge.id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to cancel challenge');
            }
          },
        },
      ]
    );
  };

  // Video Picker (Camera or Library)
  const handlePickVideo = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Camera Permission', 'Camera permission is required to record video proof.');
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ['videos'],
          videoMaxDuration: 20,
        });
        if (!res.canceled && res.assets?.[0]?.uri) {
          setProofVideoUri(res.assets[0].uri);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Gallery Permission', 'Gallery permission is required to choose video proof.');
          return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'],
          videoMaxDuration: 20,
        });
        if (!res.canceled && res.assets?.[0]?.uri) {
          setProofVideoUri(res.assets[0].uri);
        }
      }
    } catch (err: any) {
      Alert.alert('Video Error', 'Unable to select video: ' + (err?.message || ''));
    }
  };

  // Submit Log Entry
  const handleSubmitLog = async () => {
    if (!challenge || !user?.id) return;
    if (logAmount < 1 || logAmount > 500) {
      Alert.alert('Invalid Amount', 'Please log between 1 and 500 reps or seconds.');
      return;
    }

    setLoggingSubmitting(true);
    try {
      await challengeService.logEntry({
        challengeId: challenge.id,
        userId: user.id,
        amount: logAmount,
        videoUri: proofVideoUri || undefined,
      });

      setShowLogModal(false);
      setProofVideoUri(null);
      await loadDetail();
    } catch (e: any) {
      Alert.alert('Logging Failed', e?.message || 'Please try again.');
    } finally {
      setLoggingSubmitting(false);
    }
  };

  // Delete own entry within 10 minutes
  const handleDeleteEntry = async (entry: FriendChallengeEntry) => {
    Alert.alert(
      'Delete Entry',
      `Delete this entry of ${entry.amount} ${challenge?.metric}? (Can only delete within 10 minutes of creating)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await challengeService.deleteEntry(entry.id, entry.proof_path);
              await loadDetail();
            } catch (e: any) {
              Alert.alert('Cannot Delete', e?.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  // Dispute other participant's entry (max 3)
  const handleDisputeEntry = (entry: FriendChallengeEntry) => {
    if (myDisputesCount >= 3) {
      Alert.alert(
        'Dispute Limit Reached',
        'You can only dispute up to 3 entries per challenge.'
      );
      return;
    }

    Alert.alert(
      'Dispute Entry',
      `Dispute this entry of ${entry.amount} ${challenge?.metric}? Disputed entries will not count towards progress until your opponent attaches a video proof.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Dispute',
          style: 'destructive',
          onPress: async () => {
            if (!challenge || !user?.id) return;
            try {
              await challengeService.disputeEntry({
                challengeId: challenge.id,
                entryId: entry.id,
                disputerId: user.id,
              });
              await loadDetail();
            } catch (e: any) {
              Alert.alert('Dispute Failed', e?.message || 'Failed to dispute entry');
            }
          },
        },
      ]
    );
  };

  // Attach proof to a disputed entry
  const handleAttachProofToDisputed = async (entryId: string) => {
    Alert.alert(
      'Attach Proof Video',
      'Choose how to provide video proof for this disputed entry (max 20 seconds):',
      [
        {
          text: 'Record Video',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') return;
            const res = await ImagePicker.launchCameraAsync({
              mediaTypes: ['videos'],
              videoMaxDuration: 20,
            });
            if (!res.canceled && res.assets?.[0]?.uri && user?.id && challenge) {
              try {
                await challengeService.attachProofToDisputedEntry({
                  challengeId: challenge.id,
                  entryId,
                  userId: user.id,
                  videoUri: res.assets[0].uri,
                });
                await loadDetail();
              } catch (e: any) {
                Alert.alert('Upload Failed', e?.message);
              }
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['videos'],
              videoMaxDuration: 20,
            });
            if (!res.canceled && res.assets?.[0]?.uri && user?.id && challenge) {
              try {
                await challengeService.attachProofToDisputedEntry({
                  challengeId: challenge.id,
                  entryId,
                  userId: user.id,
                  videoUri: res.assets[0].uri,
                });
                await loadDetail();
              } catch (e: any) {
                Alert.alert('Upload Failed', e?.message);
              }
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Rematch action
  const handleRematch = () => {
    if (!challenge || !friend) return;
    router.push({
      pathname: '/community/new-challenge',
      params: {
        friendId: friend.id,
        friendName: friend.name,
        friendUsername: friend.username || undefined,
        friendAvatar: friend.avatar_url || undefined,
        exerciseId: challenge.exercise_id || undefined,
        exerciseName: challenge.exercise_name,
        metric: challenge.metric,
        target: challenge.target.toString(),
        durationHours: challenge.duration_hours.toString(),
      },
    });
  };

  // Share Result to Community Feed
  const handleShareResult = () => {
    if (!challenge) return;
    const isWin = challenge.winner_id === user?.id;
    const isDraw = challenge.is_draw;
    const opponentName = friend?.username ? `@${friend.username}` : friend?.name || 'my friend';

    let prefilled = '';
    if (isDraw) {
      prefilled = `Tied challenge with ${opponentName}! We both hit ${myScore} ${challenge.metric} of ${challenge.exercise_name}! 🤝🔥`;
    } else if (isWin) {
      prefilled = `I won ${challenge.target} ${challenge.metric} of ${challenge.exercise_name} vs ${opponentName} in SweatFlix! 🏆💪`;
    } else {
      prefilled = `Great battle with ${opponentName} on ${challenge.target} ${challenge.metric} of ${challenge.exercise_name}! Rematch coming soon! 🔥`;
    }

    router.push({
      pathname: '/community/new-post',
      params: {
        caption: prefilled,
        workoutName: `Challenge: ${challenge.exercise_name}`,
      },
    });
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading challenge...</Text>
      </ScreenContainer>
    );
  }

  if (!challenge) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Challenge Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const isCompleted = ['completed', 'declined', 'cancelled'].includes(challenge.status);
  const isWon = challenge.winner_id === user?.id;
  const isDraw = challenge.is_draw;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {challenge.exercise_name}
        </Text>

        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{challenge.status.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDetail(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* COMPLETED CELEBRATION CARD */}
        {isCompleted && (
          <View style={[styles.celebrationCard, isWon ? styles.winCard : isDraw ? styles.drawCard : styles.lossCard]}>
            <View style={styles.celebrationIconRow}>
              <Ionicons
                name={isWon ? 'trophy' : isDraw ? 'git-commit' : 'ribbon-outline'}
                size={38}
                color={isWon ? '#FFD700' : isDraw ? '#F59E0B' : '#94A3B8'}
              />
            </View>
            <Text style={styles.celebrationTitle}>
              {challenge.status === 'declined'
                ? 'Challenge Declined'
                : challenge.status === 'cancelled'
                ? 'Challenge Cancelled'
                : isWon
                ? 'VICTORY! 🏆'
                : isDraw
                ? 'IT’S A DRAW! 🤝'
                : `${friend?.name?.split(' ')[0] || 'Opponent'} Won`}
            </Text>
            <Text style={styles.celebrationScore}>
              Final: {myScore} vs {friendScore} {challenge.metric}
            </Text>

            {/* Rematch & Share Buttons */}
            {challenge.status === 'completed' && (
              <View style={styles.celebrationBtnRow}>
                <TouchableOpacity
                  style={[styles.celebrationBtn, styles.rematchBtn]}
                  onPress={handleRematch}
                  activeOpacity={0.85}
                >
                  <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.celebrationBtnText}>Rematch</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.celebrationBtn, styles.shareBtn]}
                  onPress={handleShareResult}
                  activeOpacity={0.85}
                >
                  <Ionicons name="share-social" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.celebrationBtnText}>Share Result</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* VERSUS & LIVE COUNTDOWN HEADER CARD */}
        <View style={[styles.versusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Live Countdown Banner */}
          {challenge.status === 'active' && (
            <View style={styles.countdownBanner}>
              <Ionicons name="stopwatch-outline" size={16} color="#FF8A1F" />
              <Text style={styles.countdownText}>
                Time Remaining: <Text style={{ fontWeight: '800' }}>{countdown.text}</Text>
              </Text>
            </View>
          )}

          {/* Versus Avatars & Target */}
          <View style={styles.versusRow}>
            {/* Me */}
            <View style={styles.avatarCol}>
              {user?.user_metadata?.avatar_url ? (
                <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.largeAvatar} />
              ) : (
                <View
                  style={[
                    styles.largeAvatarInitial,
                    { backgroundColor: getAvatarColor(user?.id || 'me') },
                  ]}
                >
                  <Text style={styles.largeAvatarText}>You</Text>
                </View>
              )}
              <Text style={[styles.avatarName, { color: colors.text }]} numberOfLines={1}>
                You
              </Text>
              <Text style={[styles.avatarScore, { color: '#E5252A' }]}>
                {myScore} {challenge.metric}
              </Text>
            </View>

            {/* VS Badge */}
            <View style={styles.vsBadgeLarge}>
              <Text style={styles.vsBadgeLargeText}>VS</Text>
            </View>

            {/* Friend */}
            <View style={styles.avatarCol}>
              {friend?.avatar_url ? (
                <Image source={{ uri: friend.avatar_url }} style={styles.largeAvatar} />
              ) : (
                <View
                  style={[
                    styles.largeAvatarInitial,
                    { backgroundColor: getAvatarColor(friend?.id || 'opp') },
                  ]}
                >
                  <Text style={styles.largeAvatarText}>
                    {(friend?.name || 'F').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={[styles.avatarName, { color: colors.text }]} numberOfLines={1}>
                {friend?.username ? `@${friend.username}` : friend?.name || 'Friend'}
              </Text>
              <Text style={[styles.avatarScore, { color: '#FF8A1F' }]}>
                {friendScore} {challenge.metric}
              </Text>
            </View>
          </View>

          {/* Target Goal Banner */}
          <View style={[styles.targetBanner, { backgroundColor: isDarkMode ? '#27272A' : '#F8FAFC' }]}>
            <Text style={[styles.targetBannerText, { color: colors.text }]}>
              First to reach <Text style={{ color: Colors.primary, fontWeight: '800' }}>{target} {challenge.metric}</Text> wins!
            </Text>
          </View>

          {/* Progress Bars */}
          <View style={styles.progressSection}>
            {/* My Bar (Red) */}
            <View style={styles.barItem}>
              <View style={styles.barHeader}>
                <Text style={styles.barTitle}>Your Progress</Text>
                <Text style={[styles.barNumber, { color: '#E5252A' }]}>
                  {myScore}/{target} ({Math.round(myProgress * 100)}%)
                </Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.max(4, myProgress * 100)}%`, backgroundColor: '#E5252A' },
                  ]}
                />
              </View>
            </View>

            {/* Opponent Bar (Orange) */}
            <View style={styles.barItem}>
              <View style={styles.barHeader}>
                <Text style={styles.barTitle}>
                  {friend?.name?.split(' ')[0] || 'Friend'}’s Progress
                </Text>
                <Text style={[styles.barNumber, { color: '#FF8A1F' }]}>
                  {friendScore}/{target} ({Math.round(friendProgress * 100)}%)
                </Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.max(4, friendProgress * 100)}%`, backgroundColor: '#FF8A1F' },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Pending Request Action Buttons */}
          {challenge.status === 'pending' && (
            <View style={styles.pendingActions}>
              {isOpponent ? (
                <View style={styles.acceptDeclineRow}>
                  <TouchableOpacity
                    style={[styles.bigActionBtn, styles.acceptBigBtn]}
                    onPress={handleAccept}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.bigActionBtnText}>Accept Challenge</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bigActionBtn, styles.declineBigBtn, { borderColor: colors.border }]}
                    onPress={handleDecline}
                    activeOpacity={0.88}
                  >
                    <Text style={[styles.declineBigBtnText, { color: colors.textSecondary }]}>Decline</Text>
                  </TouchableOpacity>
                </View>
              ) : isCreator ? (
                <TouchableOpacity
                  style={[styles.cancelChallengeBtn, { borderColor: colors.border }]}
                  onPress={handleCancel}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text style={styles.cancelChallengeBtnText}>Cancel Challenge Request</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* Active State: Log Reps Button */}
          {challenge.status === 'active' && (
            <TouchableOpacity
              style={[styles.logRepsBtn, { backgroundColor: '#E5252A' }]}
              onPress={() => setShowLogModal(true)}
              activeOpacity={0.88}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.logRepsBtnText}>
                Log {isSeconds ? 'Seconds' : 'Reps'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Optional Trash Talk Message */}
        {challenge.message ? (
          <View style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
            <Text style={[styles.messageCardText, { color: colors.text }]}>{"\"" + challenge.message + "\""}</Text>
          </View>
        ) : null}

        {/* ACTIVITY & LOG ENTRIES SECTION */}
        <View style={styles.activityHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Log</Text>
          <Text style={styles.entriesCount}>{entries.length} entries</Text>
        </View>

        {entries.length === 0 ? (
          <View style={[styles.emptyEntriesBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="barbell-outline" size={32} color={Colors.textGrey} />
            <Text style={[styles.emptyEntriesTitle, { color: colors.text }]}>No reps logged yet</Text>
            <Text style={styles.emptyEntriesSubtitle}>
              {challenge.status === 'active'
                ? 'Be the first to log and take the lead!'
                : 'Entries will appear once the challenge begins.'}
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {entries.map((item) => {
              const isMine = item.user_id === user?.id;
              const hasProof = !!(item.proof_path || item.proof_url);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.entryCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    item.disputed && styles.entryDisputed,
                  ]}
                >
                  {/* Avatar & User Details */}
                  <View style={styles.entryUserRow}>
                    {item.user?.avatar_url ? (
                      <Image source={{ uri: item.user.avatar_url }} style={styles.entryAvatar} />
                    ) : (
                      <View
                        style={[
                          styles.entryAvatarInitial,
                          { backgroundColor: getAvatarColor(item.user_id) },
                        ]}
                      >
                        <Text style={styles.entryAvatarInitialText}>
                          {(item.user?.name || (isMine ? 'Y' : 'F')).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.entryMeta}>
                      <Text style={[styles.entryUserName, { color: colors.text }]}>
                        {isMine ? 'You' : item.user?.name || 'Friend'}
                      </Text>
                      <Text style={styles.entryTimeText}>
                        {formatEntryTime(item.created_at)}
                      </Text>
                    </View>

                    {/* Amount Logged */}
                    <View style={styles.entryAmountBadge}>
                      <Text
                        style={[
                          styles.entryAmountText,
                          item.disputed && { textDecorationLine: 'line-through', color: Colors.textGrey },
                        ]}
                      >
                        +{item.amount} {challenge.metric}
                      </Text>
                    </View>
                  </View>

                  {/* Badges & Actions Row */}
                  <View style={styles.entryBottomRow}>
                    <View style={styles.entryBadges}>
                      {hasProof && (
                        <TouchableOpacity
                          style={styles.proofBadge}
                          onPress={async () => {
                            if (item.proof_url) {
                              setViewingVideoUrl(item.proof_url);
                            } else if (item.proof_path) {
                              const signed = await challengeService.getProofSignedUrl(item.proof_path);
                              if (signed) setViewingVideoUrl(signed);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam" size={12} color="#10B981" />
                          <Text style={styles.proofBadgeText}>Proof Attached</Text>
                        </TouchableOpacity>
                      )}

                      {item.disputed && (
                        <View style={styles.disputedBadge}>
                          <Ionicons name="alert-circle" size={12} color="#EF4444" />
                          <Text style={styles.disputedBadgeText}>Disputed (Doesn’t Count)</Text>
                        </View>
                      )}
                    </View>

                    {/* Action buttons */}
                    <View style={styles.entryActions}>
                      {/* Delete (if own entry and < 10 mins) */}
                      {item.can_delete && (
                        <TouchableOpacity
                          style={styles.deleteEntryBtn}
                          onPress={() => handleDeleteEntry(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={15} color="#EF4444" />
                          <Text style={styles.deleteEntryText}>Delete</Text>
                        </TouchableOpacity>
                      )}

                      {/* Attach proof if mine and disputed */}
                      {isMine && item.disputed && (
                        <TouchableOpacity
                          style={styles.attachProofBtn}
                          onPress={() => handleAttachProofToDisputed(item.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.attachProofBtnText}>Add Proof</Text>
                        </TouchableOpacity>
                      )}

                      {/* Dispute action if opponent's entry and not yet disputed */}
                      {!isMine && !item.disputed && challenge.status === 'active' && (
                        <TouchableOpacity
                          style={styles.disputeActionBtn}
                          onPress={() => handleDisputeEntry(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="flag-outline" size={14} color="#F59E0B" />
                          <Text style={styles.disputeActionText}>Dispute</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: LOG REPS / SECONDS SHEET */}
      {/* ========================================================================= */}
      <Modal visible={showLogModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.logSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Log {isSeconds ? 'Seconds' : 'Reps'}
              </Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Stepper / Input */}
            <View style={styles.sheetStepperRow}>
              <TouchableOpacity
                style={[styles.sheetStepBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}
                onPress={() => setLogAmount((prev) => Math.max(1, prev - 5))}
              >
                <Ionicons name="remove" size={22} color={colors.text} />
              </TouchableOpacity>

              <TextInput
                style={[styles.sheetNumberInput, { color: '#E5252A' }]}
                value={logAmount.toString()}
                onChangeText={(val) => {
                  const parsed = parseInt(val, 10);
                  if (!isNaN(parsed)) setLogAmount(Math.min(500, Math.max(1, parsed)));
                  else if (val === '') setLogAmount(1);
                }}
                keyboardType="number-pad"
                maxLength={3}
              />

              <TouchableOpacity
                style={[styles.sheetStepBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}
                onPress={() => setLogAmount((prev) => Math.min(500, prev + 5))}
              >
                <Ionicons name="add" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Quick add chips */}
            <View style={styles.quickAddRow}>
              {[5, 10, 20, 50].map((inc) => (
                <TouchableOpacity
                  key={inc}
                  style={[styles.quickAddChip, { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' }]}
                  onPress={() => setLogAmount(inc)}
                >
                  <Text style={[styles.quickAddText, { color: colors.text }]}>
                    {inc} {isSeconds ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Video Proof Section (Optional) */}
            <View style={styles.videoSection}>
              <Text style={[styles.videoSectionTitle, { color: colors.text }]}>
                Proof Video (Optional)
              </Text>
              <Text style={styles.videoSectionSub}>
                Max 20 seconds. Video proof prevents disputes and proves your reps!
              </Text>

              {proofVideoUri ? (
                <View style={styles.proofAttachedRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={styles.proofAttachedText}>Video attached (ready to upload)</Text>
                  <TouchableOpacity onPress={() => setProofVideoUri(null)}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.videoBtnRow}>
                  <TouchableOpacity
                    style={[styles.videoPickBtn, { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' }]}
                    onPress={() => handlePickVideo(true)}
                  >
                    <Ionicons name="camera" size={16} color={Colors.primary} />
                    <Text style={[styles.videoPickText, { color: colors.text }]}>Record Video</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.videoPickBtn, { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' }]}
                    onPress={() => handlePickVideo(false)}
                  >
                    <Ionicons name="images" size={16} color={Colors.primary} />
                    <Text style={[styles.videoPickText, { color: colors.text }]}>Choose Video</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitLogBtn, { backgroundColor: '#E5252A' }]}
              onPress={handleSubmitLog}
              disabled={loggingSubmitting}
              activeOpacity={0.88}
            >
              {loggingSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitLogBtnText}>
                  Confirm & Log +{logAmount} {challenge.metric}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: VIDEO VIEWER */}
      {/* ========================================================================= */}
      {viewingVideoUrl && (
        <VideoModalPlayer
          videoUrl={viewingVideoUrl}
          onClose={() => setViewingVideoUrl(null)}
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
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  statusPill: {
    backgroundColor: '#E5252A15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    color: '#E5252A',
    fontWeight: '800',
    fontSize: 10,
  },
  scrollContent: {
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  backBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Celebration Card
  celebrationCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  winCard: {
    backgroundColor: '#10B98120',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  drawCard: {
    backgroundColor: '#F59E0B20',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  lossCard: {
    backgroundColor: '#64748B20',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  celebrationIconRow: {
    marginBottom: 6,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  celebrationScore: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  celebrationBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  celebrationBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  rematchBtn: {
    backgroundColor: '#E5252A',
  },
  shareBtn: {
    backgroundColor: '#3B82F6',
  },
  celebrationBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  // Versus Card
  versusCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8A1F15',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    gap: 6,
  },
  countdownText: {
    color: '#FF8A1F',
    fontSize: 12,
  },
  versusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  avatarCol: {
    alignItems: 'center',
    flex: 1,
  },
  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 6,
  },
  largeAvatarInitial: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
  },
  avatarName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  avatarScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  vsBadgeLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#E5252A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsBadgeLargeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    fontStyle: 'italic',
  },
  targetBanner: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  targetBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  barItem: {},
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barTitle: {
    fontSize: 12,
    color: Colors.textGrey,
  },
  barNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  pendingActions: {
    marginTop: Spacing.xs,
  },
  acceptDeclineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bigActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBigBtn: {
    backgroundColor: '#E5252A',
  },
  bigActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  declineBigBtn: {
    borderWidth: 1,
  },
  declineBigBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  cancelChallengeBtn: {
    borderWidth: 1,
    height: 42,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelChallengeBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  logRepsBtn: {
    height: 48,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  logRepsBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  messageCardText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  entriesCount: {
    fontSize: 12,
    color: Colors.textGrey,
  },
  emptyEntriesBox: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEntriesTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  emptyEntriesSubtitle: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
    textAlign: 'center',
  },
  entriesList: {
    gap: Spacing.sm,
  },
  entryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  entryDisputed: {
    opacity: 0.65,
    borderStyle: 'dashed',
  },
  entryUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: Spacing.xs,
  },
  entryAvatarInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  entryAvatarInitialText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  entryMeta: {
    flex: 1,
  },
  entryUserName: {
    fontSize: 13,
    fontWeight: '600',
  },
  entryTimeText: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  entryAmountBadge: {
    backgroundColor: '#E5252A15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  entryAmountText: {
    color: '#E5252A',
    fontWeight: '800',
    fontSize: 13,
  },
  entryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  entryBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  proofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  proofBadgeText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 11,
  },
  disputedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444415',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  disputedBadgeText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 11,
  },
  entryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  deleteEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 3,
  },
  deleteEntryText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  attachProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  attachProofBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  disputeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 3,
  },
  disputeActionText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
  },
  // Modal 1: Log Reps Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  logSheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sheetStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  sheetStepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetNumberInput: {
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    minWidth: 100,
  },
  quickAddRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  quickAddChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  quickAddText: {
    fontSize: 13,
    fontWeight: '700',
  },
  videoSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F020',
  },
  videoSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  videoSectionSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  proofAttachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  proofAttachedText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 12,
    flex: 1,
  },
  videoBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  videoPickBtn: {
    flex: 1,
    height: 38,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  videoPickText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitLogBtn: {
    height: 50,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  submitLogBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  // Video Modal Player
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  videoPlayerContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: '80%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  videoCloseBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
});
