import React, { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { friendsService, FriendListItem } from '../../services/friendsService';
import { workoutService } from '../../services/workoutService';
import { ExerciseDetail, FAKE_EXERCISES } from '../../data/fakeData';
import {
  challengeService,
  ChallengeMetric,
  ChallengeDuration,
} from '../../services/challengeService';
import { getAvatarColor } from '../../services/communityService';
import { getExerciseThumbnailAsset } from '../../constants/exerciseImages';
import { pushNotificationService } from '../../services/pushNotificationService';
import { NotificationPermissionModal } from '../../components/NotificationPermissionModal';

const BODY_PARTS = ['All', 'Chest', 'Back', 'Arms', 'Abs', 'Legs', 'Shoulders'] as const;

export default function NewChallengeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const params = useLocalSearchParams<{
    friendId?: string;
    friendName?: string;
    friendUsername?: string;
    friendAvatar?: string;
    exerciseId?: string;
    exerciseName?: string;
    metric?: ChallengeMetric;
    target?: string;
    durationHours?: string;
  }>();

  // Wizard Step: 1 = Friend, 2 = Exercise, 3 = Settings, 4 = Review
  const [step, setStep] = useState<number>(params.friendId ? 2 : 1);

  // Friend selection
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendListItem | null>(
    params.friendId
      ? {
          id: params.friendId,
          name: params.friendName || 'Friend',
          username: params.friendUsername || null,
          avatar_url: params.friendAvatar || null,
          bio: null,
          since: '',
        }
      : null
  );

  // Exercise selection
  const [exercises, setExercises] = useState<ExerciseDetail[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('All');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<{
    id: string;
    name: string;
    metric: ChallengeMetric;
    bodyPart?: string;
    thumbnail?: any;
  } | null>(
    params.exerciseId && params.exerciseName
      ? {
          id: params.exerciseId,
          name: params.exerciseName,
          metric: (params.metric as ChallengeMetric) || 'reps',
        }
      : null
  );

  // Target & Duration
  const initialTarget = params.target ? parseInt(params.target, 10) : 50;
  const [target, setTarget] = useState<number>(initialTarget || 50);
  const initialDuration = params.durationHours
    ? (parseInt(params.durationHours, 10) as ChallengeDuration)
    : 24;
  const [durationHours, setDurationHours] = useState<ChallengeDuration>(initialDuration || 24);
  const [message, setMessage] = useState<string>('');

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);

  // Load Friends
  useEffect(() => {
    let isCurrent = true;
    if (user?.id) {
      friendsService
        .getFriendsList(user.id)
        .then((data) => {
          if (isCurrent) {
            setFriends(data);
            setLoadingFriends(false);
          }
        })
        .catch(() => {
          if (isCurrent) setLoadingFriends(false);
        });
    }
    return () => {
      isCurrent = false;
    };
  }, [user]);

  // Load Exercises
  useEffect(() => {
    let isCurrent = true;
    workoutService
      .getExercises()
      .then((data) => {
        if (isCurrent) {
          setExercises(data);
          setLoadingExercises(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setExercises(FAKE_EXERCISES);
          setLoadingExercises(false);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  // Filtered friends
  const filteredFriends = useMemo(() => {
    const q = friendSearch.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.username && f.username.toLowerCase().includes(q))
    );
  }, [friends, friendSearch]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    const q = exerciseSearch.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchCategory =
        selectedBodyPart === 'All' ||
        ex.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase();
      const matchQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.bodyPart.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [exercises, selectedBodyPart, exerciseSearch]);

  // Quick chips for target
  const isSeconds = selectedExercise?.metric === 'seconds';
  const quickTargetChips = isSeconds ? [30, 60, 120, 300] : [20, 50, 100, 200, 500];

  const handleSelectExercise = (ex: ExerciseDetail) => {
    const isPlank =
      ex.id === 'abs-plank' ||
      ex.name.toLowerCase().includes('plank') ||
      ex.name.toLowerCase().includes('hold');
    const metric: ChallengeMetric = isPlank ? 'seconds' : 'reps';
    setSelectedExercise({
      id: ex.id,
      name: ex.name,
      metric,
      bodyPart: ex.bodyPart,
      thumbnail: ex.thumbnail,
    });
    // Default appropriate target
    setTarget(isPlank ? 60 : 50);
    setStep(3);
  };

  const adjustTarget = (delta: number) => {
    setTarget((prev) => Math.max(1, Math.min(5000, prev + delta)));
  };

  const handleSendChallenge = async () => {
    if (!user?.id || !selectedFriend || !selectedExercise) {
      Alert.alert('Error', 'Please complete all challenge selections.');
      return;
    }

    if (!selectedFriend.id || selectedFriend.id.trim() === '') {
      Alert.alert('Error', 'Invalid friend selection. Please select an accepted friend from your list.');
      return;
    }

    setSubmitting(true);
    try {
      await challengeService.createChallenge({
        creatorId: user.id,
        opponentId: selectedFriend.id,
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        metric: selectedExercise.metric,
        target,
        durationHours,
        message: message.trim() || undefined,
      });

      const hasPerm = await pushNotificationService.checkPermissions();
      if (!hasPerm) {
        setShowPermModal(true);
      } else {
        Alert.alert(
          'Challenge Sent! 🔥',
          `Your challenge was sent to ${selectedFriend.name}. They have 48 hours to accept!`,
          [
            {
              text: 'View Challenges',
              onPress: () => router.replace('/community/challenges' as any),
            },
          ]
        );
      }
    } catch (err: any) {
      if (
        err?.code === 'FREE_CHALLENGE_LIMIT_REACHED' ||
        err?.message?.includes('FREE_CHALLENGE_LIMIT_REACHED')
      ) {
        setShowPremiumModal(true);
      } else {
        Alert.alert('Could Not Send Challenge', err?.message || 'Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => {
            if (step > 1) {
              setStep((s) => s - 1);
            } else {
              router.back();
            }
          }}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.text }]}>
          {step === 1
            ? 'Pick a Friend'
            : step === 2
            ? 'Pick an Exercise'
            : step === 3
            ? 'Set Target & Duration'
            : 'Review Challenge'}
        </Text>

        <View style={styles.stepIndicator}>
          <Text style={styles.stepIndicatorText}>{step}/4</Text>
        </View>
      </View>

      {/* STEP 1: PICK A FRIEND */}
      {step === 1 && (
        <View style={{ flex: 1 }}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={Colors.textGrey} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search accepted friends..."
              placeholderTextColor={Colors.textGrey}
              value={friendSearch}
              onChangeText={setFriendSearch}
              autoCapitalize="none"
            />
            {friendSearch ? (
              <TouchableOpacity onPress={() => setFriendSearch('')}>
                <Ionicons name="close-circle" size={16} color={Colors.textGrey} />
              </TouchableOpacity>
            ) : null}
          </View>

          {loadingFriends ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : filteredFriends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={Colors.textGrey} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No friends found</Text>
              <Text style={styles.emptySubtitle}>
                You can only challenge athletes who are accepted friends. Add friends from the
                community tab first!
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: Colors.primary }]}
                onPress={() => router.push('/community/search-users' as any)}
              >
                <Text style={styles.emptyBtnText}>Find Athletes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollList}>
              {filteredFriends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendRow,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    selectedFriend?.id === friend.id && styles.friendRowSelected,
                  ]}
                  onPress={() => {
                    setSelectedFriend(friend);
                    setStep(2);
                  }}
                  activeOpacity={0.8}
                >
                  {friend.avatar_url ? (
                    <Image source={{ uri: friend.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View
                      style={[
                        styles.avatarInitial,
                        { backgroundColor: getAvatarColor(friend.id) },
                      ]}
                    >
                      <Text style={styles.avatarInitialText}>
                        {(friend.name || 'A').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: colors.text }]}>{friend.name}</Text>
                    <Text style={styles.friendUsername}>
                      {friend.username ? `@${friend.username}` : 'Athlete'}
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      selectedFriend?.id === friend.id
                        ? 'radio-button-on'
                        : 'chevron-forward'
                    }
                    size={20}
                    color={selectedFriend?.id === friend.id ? Colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* STEP 2: PICK AN EXERCISE */}
      {step === 2 && (
        <View style={{ flex: 1 }}>
          {/* Selected Friend Pill */}
          {selectedFriend && (
            <View style={[styles.contextPill, { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' }]}>
              <Text style={[styles.contextPillText, { color: colors.text }]}>
                Challenging <Text style={{ fontWeight: '700' }}>{selectedFriend.name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Body Part Filter Chips */}
          <View style={styles.chipsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {BODY_PARTS.map((bp) => {
                const isSelected = selectedBodyPart === bp;
                return (
                  <TouchableOpacity
                    key={bp}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? Colors.primary
                          : isDarkMode
                          ? '#27272A'
                          : '#F1F5F9',
                        borderColor: isSelected ? Colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedBodyPart(bp)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {bp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={Colors.textGrey} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search exercise..."
              placeholderTextColor={Colors.textGrey}
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
            />
          </View>

          {loadingExercises ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollList}>
              {filteredExercises.map((ex) => {
                const isSelected = selectedExercise?.id === ex.id;
                const isPlank =
                  ex.id === 'abs-plank' ||
                  ex.name.toLowerCase().includes('plank') ||
                  ex.name.toLowerCase().includes('hold');
                const metricText = isPlank ? 'seconds' : 'reps';

                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[
                      styles.exerciseRow,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isSelected && styles.exerciseRowSelected,
                    ]}
                    onPress={() => handleSelectExercise(ex)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={getExerciseThumbnailAsset(ex.id, ex.thumbnail)}
                      style={styles.exerciseThumb}
                      contentFit="cover"
                    />

                    <View style={styles.exerciseInfo}>
                      <Text style={[styles.exerciseTitle, { color: colors.text }]} numberOfLines={1}>
                        {ex.name}
                      </Text>
                      <View style={styles.exerciseMetaRow}>
                        <Text style={styles.exerciseBodyPart}>{ex.bodyPart}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <View style={styles.metricPill}>
                          <Text style={styles.metricPillText}>{metricText}</Text>
                        </View>
                      </View>
                    </View>

                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'chevron-forward'}
                      size={20}
                      color={isSelected ? Colors.primary : colors.textSecondary}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* STEP 3: TARGET & DURATION */}
      {step === 3 && (
        <ScrollView contentContainerStyle={styles.stepContent}>
          {/* Target Stepper */}
          <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Target Goal</Text>
            <Text style={styles.cardSubtitle}>
              Total {selectedExercise?.metric || 'reps'} to reach during the challenge:
            </Text>

            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}
                onPress={() => adjustTarget(-10)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.targetDisplay}>
                <TextInput
                  style={[styles.targetInput, { color: Colors.primary }]}
                  value={target.toString()}
                  onChangeText={(val) => {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) {
                      setTarget(Math.min(5000, Math.max(1, parsed)));
                    } else if (val === '') {
                      setTarget(1);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <Text style={styles.targetUnit}>{selectedExercise?.metric}</Text>
              </View>

              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0' }]}
                onPress={() => adjustTarget(10)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Quick target chips */}
            <View style={styles.quickChipsRow}>
              {quickTargetChips.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickChip,
                    target === val
                      ? { backgroundColor: Colors.primary }
                      : { backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9' },
                  ]}
                  onPress={() => setTarget(val)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      { color: target === val ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {val} {isSeconds ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration Selector */}
          <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Challenge Duration</Text>
            <Text style={styles.cardSubtitle}>
              Countdown starts as soon as your friend accepts:
            </Text>

            <View style={styles.durationRow}>
              {[
                { label: '24 Hours', sub: '1 Day', hours: 24 },
                { label: '72 Hours', sub: '3 Days', hours: 72 },
                { label: '168 Hours', sub: '7 Days', hours: 168 },
              ].map((opt) => {
                const isSelected = durationHours === opt.hours;
                return (
                  <TouchableOpacity
                    key={opt.hours}
                    style={[
                      styles.durationBox,
                      {
                        backgroundColor: isSelected
                          ? '#E5252A15'
                          : isDarkMode
                          ? '#27272A'
                          : '#F1F5F9',
                        borderColor: isSelected ? Colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDurationHours(opt.hours as ChallengeDuration)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'time' : 'time-outline'}
                      size={20}
                      color={isSelected ? Colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.durationBoxTitle,
                        { color: isSelected ? Colors.primary : colors.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.durationBoxSub}>{opt.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Trash Talk / Friendly Message */}
          <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.messageHeaderRow}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Friendly Challenge Message
              </Text>
              <Text style={styles.charCount}>{message.length}/100</Text>
            </View>
            <TextInput
              style={[
                styles.messageInput,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Winner gets bragging rights! 💪"
              placeholderTextColor={Colors.textGrey}
              value={message}
              onChangeText={(text) => setMessage(text.slice(0, 100))}
              maxLength={100}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: Colors.primary }]}
            onPress={() => setStep(4)}
            activeOpacity={0.88}
          >
            <Text style={styles.nextBtnText}>Continue to Review</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* STEP 4: REVIEW & SEND */}
      {step === 4 && (
        <ScrollView contentContainerStyle={styles.stepContent}>
          <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* VS Header */}
            <View style={styles.reviewVersusRow}>
              <View style={styles.reviewUserCol}>
                {user?.user_metadata?.avatar_url ? (
                  <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.reviewAvatar} />
                ) : (
                  <View
                    style={[
                      styles.reviewAvatarInitial,
                      { backgroundColor: getAvatarColor(user?.id || 'me') },
                    ]}
                  >
                    <Text style={styles.reviewAvatarInitialText}>You</Text>
                  </View>
                )}
                <Text style={[styles.reviewUserName, { color: colors.text }]}>You</Text>
              </View>

              <View style={styles.reviewVsBadge}>
                <Text style={styles.reviewVsText}>VS</Text>
              </View>

              <View style={styles.reviewUserCol}>
                {selectedFriend?.avatar_url ? (
                  <Image source={{ uri: selectedFriend.avatar_url }} style={styles.reviewAvatar} />
                ) : (
                  <View
                    style={[
                      styles.reviewAvatarInitial,
                      { backgroundColor: getAvatarColor(selectedFriend?.id || 'opp') },
                    ]}
                  >
                    <Text style={styles.reviewAvatarInitialText}>
                      {(selectedFriend?.name || 'F').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={[styles.reviewUserName, { color: colors.text }]}>
                  {selectedFriend?.name}
                </Text>
              </View>
            </View>

            {/* Exercise & Target Details */}
            <View style={styles.reviewDivider} />

            <View style={styles.reviewDetailRow}>
              <Ionicons name="barbell-outline" size={20} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.reviewDetailLabel}>Exercise</Text>
                <Text style={[styles.reviewDetailVal, { color: colors.text }]}>
                  {selectedExercise?.name}
                </Text>
              </View>
            </View>

            <View style={styles.reviewDetailRow}>
              <Ionicons name="trophy-outline" size={20} color="#FF8A1F" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.reviewDetailLabel}>Target</Text>
                <Text style={[styles.reviewDetailVal, { color: colors.text }]}>
                  {target} {selectedExercise?.metric}
                </Text>
              </View>
            </View>

            <View style={styles.reviewDetailRow}>
              <Ionicons name="time-outline" size={20} color="#10B981" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.reviewDetailLabel}>Duration</Text>
                <Text style={[styles.reviewDetailVal, { color: colors.text }]}>
                  {durationHours === 24
                    ? '24 Hours (1 Day)'
                    : durationHours === 72
                    ? '72 Hours (3 Days)'
                    : '168 Hours (7 Days)'}
                </Text>
              </View>
            </View>

            {message.trim() ? (
              <View style={styles.reviewDetailRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6366F1" />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.reviewDetailLabel}>Note</Text>
                  <Text style={[styles.reviewDetailVal, { color: colors.text }]}>{"\"" + message.trim() + "\""}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Send Challenge Button */}
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: Colors.primary }]}
            onPress={handleSendChallenge}
            disabled={submitting}
            activeOpacity={0.88}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="flame" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.sendBtnText}>Send Challenge</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* PREMIUM UPGRADE MODAL (Free Limit Reached) */}
      {/* ========================================================================= */}
      <Modal visible={showPremiumModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.premiumSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.crownCircle}>
              <Ionicons name="trophy" size={36} color="#FFD700" />
            </View>

            <Text style={[styles.premiumTitle, { color: colors.text }]}>
              Challenge Limit Reached
            </Text>

            <Text style={styles.premiumSubtitle}>
              Free athletes can be in at most 3 active challenges at once.
              Upgrade to <Text style={{ color: '#FF8A1F', fontWeight: '700' }}>SweatFlix PRO</Text>{' '}
              for unlimited concurrent challenges, HD videos, and exclusive programs!
            </Text>

            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => {
                setShowPremiumModal(false);
                router.push('/premium' as any);
              }}
              activeOpacity={0.88}
            >
              <Ionicons name="star" size={18} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.maybeLaterBtn}
              onPress={() => setShowPremiumModal(false)}
            >
              <Text style={[styles.maybeLaterText, { color: colors.textSecondary }]}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Natural Moment Push Permission Modal */}
      <NotificationPermissionModal
        visible={showPermModal}
        contextReason="challenge"
        onDismiss={() => {
          setShowPermModal(false);
          router.replace('/community/challenges' as any);
        }}
        onGranted={() => {
          setShowPermModal(false);
          router.replace('/community/challenges' as any);
        }}
      />
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
    fontSize: 17,
    fontWeight: '700',
  },
  stepIndicator: {
    backgroundColor: '#E5252A20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  stepIndicatorText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.xs,
    fontSize: 14,
  },
  chipsWrapper: {
    height: 48,
    marginVertical: Spacing.xs,
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contextPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  contextPillText: {
    fontSize: 13,
  },
  changeLink: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  scrollList: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  friendRowSelected: {
    borderColor: Colors.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Spacing.sm,
  },
  avatarInitial: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarInitialText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendUsername: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exerciseRowSelected: {
    borderColor: Colors.primary,
  },
  exerciseThumb: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  exerciseBodyPart: {
    fontSize: 12,
    color: Colors.textGrey,
  },
  metaDot: {
    marginHorizontal: 6,
    color: Colors.textGrey,
  },
  metricPill: {
    backgroundColor: '#E5252A15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  metricPillText: {
    color: '#E5252A',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  // Step 3 & 4 Layout
  stepContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textGrey,
    marginBottom: Spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    minWidth: 120,
  },
  targetInput: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  targetUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textGrey,
    marginLeft: 4,
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  quickChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  durationBox: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  durationBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  durationBoxSub: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  messageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 13,
    height: 60,
    marginTop: Spacing.sm,
    textAlignVertical: 'top',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  // Step 4 Review
  reviewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  reviewVersusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  reviewUserCol: {
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  reviewAvatarInitial: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  reviewAvatarInitialText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewVsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#E5252A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewVsText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    fontStyle: 'italic',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E2E8F020',
    marginVertical: Spacing.md,
  },
  reviewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  reviewDetailLabel: {
    fontSize: 11,
    color: Colors.textGrey,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  reviewDetailVal: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  emptyBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  // Premium Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  premiumSheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  crownCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFD70020',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  upgradeBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 15,
  },
  maybeLaterBtn: {
    padding: Spacing.sm,
  },
  maybeLaterText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
