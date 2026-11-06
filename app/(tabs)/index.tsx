import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  Dimensions,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { HomeTodayWorkoutCard } from '../../components/home/HomeTodayWorkoutCard';
import { HomeAnalyticsHub } from '../../components/home/HomeAnalyticsHub';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { usePremium } from '../../context/PremiumContext';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import { useTheme } from '../../context/ThemeContext';
import { useHomeProgress, getTodayDayIndex } from '../../context/HomeProgressContext';
import { challengeService, FriendChallenge } from '../../services/challengeService';
import { friendsService, FriendRequestItem } from '../../services/friendsService';
import { leaderboardService } from '../../services/leaderboardService';
import { getAvatarColor } from '../../services/communityService';
import { FAKE_WORKOUTS, WorkoutItem } from '../../data/fakeData';
import {
  EXERCISE_3D_ASSETS,
  ANATOMY_3D_ASSETS,
  CHALLENGE_ASSETS,
} from '../../constants/exerciseImages';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  formatDietDate,
  getDayNumberFromDate,
  getAsianMealCostUsd,
} from '../../data/asianDietData';
import {
  CuisineType,
  loadBudgetForDate,
  resolveMealsForBudgetAndDay,
  DEFAULT_DAILY_BUDGET_USD,
} from '../../services/dietBudgetService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHALLENGES_DATA = [
  {
    id: 'c-1',
    duration: '30Days',
    title: '30-DAY FAT BURN ACCELERATOR',
    daysLeft: 30,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.fatburn,
    workoutId: 'full-body-burn',
    bgColor: '#0284C7',
    btnTextColor: '#0284C7',
  },
  {
    id: 'c-2',
    duration: '45Days',
    title: '45-DAY LOWER BODY POWER SURGE',
    daysLeft: 45,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.purple,
    workoutId: 'leg-day',
    bgColor: '#7C3AED',
    btnTextColor: '#7C3AED',
  },
  {
    id: 'c-3',
    duration: '60Days',
    title: '60-DAY FULL BODY REBUILD',
    daysLeft: 60,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.runner,
    workoutId: 'full-body-burn',
    bgColor: '#DC2626',
    btnTextColor: '#DC2626',
  },
  {
    id: 'c-4',
    duration: '21Days',
    title: '21-DAY SIX-PACK CORE SHRED',
    daysLeft: 21,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.gold,
    workoutId: 'core-crusher',
    bgColor: '#D97706',
    btnTextColor: '#D97706',
  },
  {
    id: 'c-5',
    duration: '30Days',
    title: '30-DAY CHEST & DELTOID EXPLOSION',
    daysLeft: 30,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.green,
    workoutId: 'chest-blast',
    bgColor: '#059669',
    btnTextColor: '#059669',
  },
  {
    id: 'c-6',
    duration: '28Days',
    title: '28-DAY TITAN ARMS & BICEP PEAK',
    daysLeft: 28,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.orange,
    workoutId: 'arm-pump',
    bgColor: '#EA580C',
    btnTextColor: '#EA580C',
  },
  {
    id: 'c-7',
    duration: '90Days',
    title: '90-DAY ULTIMATE METAMORPHOSIS',
    daysLeft: 90,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.indigo,
    workoutId: 'full-body-burn',
    bgColor: '#4F46E5',
    btnTextColor: '#4F46E5',
  },
  {
    id: 'c-8',
    duration: '14Days',
    title: '14-DAY GLUTE & HAMSTRING SCULPT',
    daysLeft: 14,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.pink,
    workoutId: 'leg-day',
    bgColor: '#DB2777',
    btnTextColor: '#DB2777',
  },
  {
    id: 'c-9',
    duration: '30Days',
    title: '30-DAY OLYMPIC ENDURANCE & HIIT',
    daysLeft: 30,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.cyan,
    workoutId: 'full-body-burn',
    bgColor: '#0891B2',
    btnTextColor: '#0891B2',
  },
  {
    id: 'c-10',
    duration: '75Days',
    title: '75-DAY V-TAPER BACK & SHOULDER FORGE',
    daysLeft: 75,
    progress: '0.00%',
    image: CHALLENGE_ASSETS.teal,
    workoutId: 'shoulder-abs-legs',
    bgColor: '#0D9488',
    btnTextColor: '#0D9488',
  },
];

const BODY_PARTS_DATA = [
  { id: 'Shoulders', name: 'SHOULDER', workoutId: 'shoulder-abs-legs', image: ANATOMY_3D_ASSETS.shoulder },
  { id: 'Triceps', name: 'TRICEPS', workoutId: 'arm-pump', image: ANATOMY_3D_ASSETS.triceps },
  { id: 'Forearms', name: 'FOREARMS', workoutId: 'arm-pump', image: ANATOMY_3D_ASSETS.forearms },
  { id: 'Chest', name: 'CHEST', workoutId: 'chest-blast', image: ANATOMY_3D_ASSETS.chest },
  { id: 'Back', name: 'BACK', workoutId: 'full-body-burn', image: ANATOMY_3D_ASSETS.back },
  { id: 'Biceps', name: 'BICEPS', workoutId: 'arm-pump', image: ANATOMY_3D_ASSETS.biceps },
  { id: 'Legs', name: 'LEGS', workoutId: 'leg-day', image: EXERCISE_3D_ASSETS.Legs },
  { id: 'Abs', name: 'ABS', workoutId: 'core-crusher', image: EXERCISE_3D_ASSETS.Abs },
];

const HOME_CUISINES: { id: CuisineType; label: string; emoji: string }[] = [
  { id: 'american', label: 'American', emoji: '🇺🇸' },
  { id: 'indian', label: 'Indian', emoji: '🇮🇳' },
  { id: 'pakistani', label: 'Pakistani', emoji: '🇵🇰' },
  { id: 'chinese', label: 'Chinese', emoji: '🇨🇳' },
  { id: 'british', label: 'British', emoji: '🇬🇧' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { settings, updateGeneralSettings } = useSettings();
  const { user, profile } = useAuth();
  const { metrics, addWater, logMeal, logWeight } = useHealthMetrics();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const homeProgress = useHomeProgress();
  const { isPremium } = usePremium();

  const userName = profile?.name || settings?.name || 'Shaheer';
  const [trainingMode, setTrainingMode] = useState<'Gym' | 'Home'>('Gym');
  const todayIdx = useMemo(() => getTodayDayIndex(), []);
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIdx);

  const weekDays = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const fullDayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    return dayNames.map((shortName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const num = String(d.getDate()).padStart(2, '0');
      const dateString = d.toISOString().split('T')[0];
      const isToday = idx === todayIdx;
      const isPast = idx < todayIdx;
      const isCompleted = homeProgress.progress.completedDays.includes(idx);

      return {
        idx,
        day: shortName,
        fullDay: fullDayNames[idx],
        num,
        dateString,
        d,
        isToday,
        isPast,
        isCompleted,
      };
    });
  }, [homeProgress.progress.completedDays, todayIdx]);

  const selectedDay = weekDays[selectedDayIdx] || weekDays[todayIdx];
  const [activityPage, setActivityPage] = useState(0);

  // Notification State & Test Alert
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const notificationsAllowed = settings.generalSettings.notifications;
  const [reminderTime, setReminderTime] = useState(
    settings.generalSettings.reminderTime || '08:00 AM'
  );
  const [testNotificationToast, setTestNotificationToast] = useState<string | null>(null);

  // Step 9d: Weekly points & notifications inbox state
  const [weeklyPoints, setWeeklyPoints] = useState<number>(35);
  const [pendingChallenges, setPendingChallenges] = useState<FriendChallenge[]>([]);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<FriendRequestItem[]>([]);
  const [showNotificationSettings, setShowNotificationSettings] = useState<boolean>(false);
  const [actingChallengeId, setActingChallengeId] = useState<string | null>(null);
  const [actingFriendReqId, setActingFriendReqId] = useState<string | null>(null);

  // Active Daily Diet Plan State (Synchronized with Diet Planner)
  const [todayBudget, setTodayBudget] = useState<number>(DEFAULT_DAILY_BUDGET_USD);
  const [todayCuisine, setTodayCuisine] = useState<CuisineType | 'asian'>('american');

  const todayMeals = useMemo(() => {
    const dayNumber = getDayNumberFromDate(new Date());
    return resolveMealsForBudgetAndDay(dayNumber, todayBudget, todayCuisine);
  }, [todayBudget, todayCuisine]);

  const todayDietNutrition = useMemo(() => {
    const calories = Math.round(
      Number(todayMeals.breakfast.baseKcal || 0) +
      Number(todayMeals.lunch.baseKcal || 0) +
      Number(todayMeals.dinner.baseKcal || 0) +
      Number(todayMeals.snack.baseKcal || 0)
    );
    const protein = Math.round(
      Number(todayMeals.breakfast.baseProtein || 0) +
      Number(todayMeals.lunch.baseProtein || 0) +
      Number(todayMeals.dinner.baseProtein || 0) +
      Number(todayMeals.snack.baseProtein || 0)
    );
    const cost = Number(
      (
        (todayMeals.breakfast.costUsd || getAsianMealCostUsd(todayMeals.breakfast)) +
        (todayMeals.lunch.costUsd || getAsianMealCostUsd(todayMeals.lunch)) +
        (todayMeals.dinner.costUsd || getAsianMealCostUsd(todayMeals.dinner)) +
        (todayMeals.snack.costUsd || getAsianMealCostUsd(todayMeals.snack))
      ).toFixed(2)
    );
    return { calories, protein, cost };
  }, [todayMeals]);

  const handleSelectHomeCuisine = async (c: CuisineType) => {
    setTodayCuisine(c);
    const uid = user?.id || 'guest';
    try {
      await AsyncStorage.setItem(`@sweatflix_cuisine_pref_${uid}`, c);
    } catch (e) {
      console.warn('Error saving home cuisine pref:', e);
    }
  };

  const dailyMealCards = useMemo(() => {
    return [
      {
        ...todayMeals.breakfast,
        mealSlot: 'BREAKFAST',
        slotEmoji: '🌅',
        slotColor: '#F59E0B',
      },
      {
        ...todayMeals.lunch,
        mealSlot: 'LUNCH',
        slotEmoji: '☀️',
        slotColor: '#10B981',
      },
      {
        ...todayMeals.dinner,
        mealSlot: 'DINNER',
        slotEmoji: '🌙',
        slotColor: '#6366F1',
      },
      {
        ...todayMeals.snack,
        mealSlot: 'SNACK',
        slotEmoji: '⚡',
        slotColor: '#EC4899',
      },
    ];
  }, [todayMeals]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      if (user?.id) {
        Promise.all([
          leaderboardService.getUserPointsThisWeek(user.id),
          challengeService.getChallenges(user.id),
          friendsService.getIncomingRequests(user.id),
        ])
          .then(([pts, challengeData, requests]) => {
            if (isMounted) {
              setWeeklyPoints(pts);
              setPendingChallenges(challengeData.requests || []);
              setIncomingFriendRequests(requests || []);
            }
          })
          .catch((e) => console.warn('Home focus load error:', e));
      }

      // Sync active diet plan budget and cuisine preference
      const todayDateInfo = formatDietDate(new Date());
      const storageDateKey = todayDateInfo.fullDateString;
      const uid = user?.id || 'guest';
      Promise.all([
        loadBudgetForDate(uid, storageDateKey),
        AsyncStorage.getItem(`@sweatflix_cuisine_pref_${uid}`),
      ])
        .then(([savedBudget, savedCuisine]) => {
          if (isMounted) {
            if (savedBudget) setTodayBudget(savedBudget);
            if (
              savedCuisine === 'american' ||
              savedCuisine === 'indian' ||
              savedCuisine === 'pakistani' ||
              savedCuisine === 'chinese' ||
              savedCuisine === 'british' ||
              savedCuisine === 'asian'
            ) {
              setTodayCuisine(savedCuisine as CuisineType | 'asian');
            }
          }
        })
        .catch((e) => console.warn('Home diet load error:', e));

      return () => {
        isMounted = false;
      };
    }, [user])
  );

  const unreadNotificationsCount = pendingChallenges.length + incomingFriendRequests.length;

  const handleAcceptChallenge = async (ch: FriendChallenge) => {
    setActingChallengeId(ch.id);
    try {
      await challengeService.acceptChallenge(ch.id);
      setPendingChallenges((prev) => prev.filter((c) => c.id !== ch.id));
      setTestNotificationToast(`🔥 Challenge Accepted! Competing in ${ch.exercise_name}`);
      setTimeout(() => setTestNotificationToast(null), 3000);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to accept challenge');
    } finally {
      setActingChallengeId(null);
    }
  };

  const handleDeclineChallenge = async (ch: FriendChallenge) => {
    setActingChallengeId(ch.id);
    try {
      await challengeService.declineChallenge(ch.id);
      setPendingChallenges((prev) => prev.filter((c) => c.id !== ch.id));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to decline challenge');
    } finally {
      setActingChallengeId(null);
    }
  };

  const handleAcceptFriendRequest = async (req: FriendRequestItem) => {
    setActingFriendReqId(req.id);
    try {
      await friendsService.acceptFriendRequest(req.id);
      setIncomingFriendRequests((prev) => prev.filter((r) => r.id !== req.id));
      setTestNotificationToast(`👋 Friend request accepted from ${req.user?.name || 'user'}!`);
      setTimeout(() => setTestNotificationToast(null), 3000);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to accept friend request');
    } finally {
      setActingFriendReqId(null);
    }
  };

  const handleDeclineFriendRequest = async (req: FriendRequestItem) => {
    setActingFriendReqId(req.id);
    try {
      await friendsService.declineOrCancelRequest(req.id);
      setIncomingFriendRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to decline friend request');
    } finally {
      setActingFriendReqId(null);
    }
  };

  // Question Mark Help Modal
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Modals for Weight & Mode
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState(metrics.currentWeightKg.toString());
  const [targetWeightInput, setTargetWeightInput] = useState('68.00');

  const [showModeModal, setShowModeModal] = useState(false);
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<any>(null);

  // Instant healthy meals search & filtering
  const mealSearchInputRef = useRef<any>(null);
  const [mealSearchQuery, setMealSearchQuery] = useState('');

  const filteredDailyMeals = useMemo(() => {
    const q = mealSearchQuery.trim().toLowerCase();
    if (!q) return dailyMealCards;
    return dailyMealCards.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.subtitle?.toLowerCase().includes(q) ||
        m.mealSlot.toLowerCase().includes(q)
    );
  }, [dailyMealCards, mealSearchQuery]);

  const activeWorkout = useMemo<WorkoutItem>(() => {
    return FAKE_WORKOUTS.find((w) => w.id === 'shoulder-abs-legs') || FAKE_WORKOUTS[0];
  }, []);

  const handleStartWorkout = () => {
    router.push({
      pathname: '/workout-detail',
      params: { id: activeWorkout.id },
    });
  };

  const handleSaveWeight = async () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 20 && val < 300) {
      await logWeight(val);
    }
    setShowWeightModal(false);
  };

  // Notification settings save
  const handleToggleNotifications = async (val: boolean) => {
    await updateGeneralSettings({
      notifications: val,
      workoutReminders: val,
      reminderTime,
    });
  };

  const handleSelectReminderTime = async (time: string) => {
    setReminderTime(time);
    if (notificationsAllowed) {
      await updateGeneralSettings({ reminderTime: time });
    }
  };

  const handleSendTestNotification = () => {
    setTestNotificationToast(
      `🔔 SweatFlix: Hey ${userName}, time to train Shoulder, Abdomen & Legs! 8 exercises queued for today.`
    );
    setTimeout(() => {
      setTestNotificationToast(null);
    }, 4500);
  };

  const waterConsumedLiters = (metrics.waterIntakeMl / 1000).toFixed(2);
  const waterTargetLiters = (metrics.waterTargetMl / 1000).toFixed(1);
  const waterPercent = Math.min(
    100,
    Math.round((metrics.waterIntakeMl / metrics.waterTargetMl) * 100)
  );

  return (
    <View style={[styles.rootScreen, { backgroundColor: colors.background }]}>
      {/* Test Notification Banner Toast */}
      {testNotificationToast && (
        <View style={styles.testNotificationBanner}>
          <Ionicons name="notifications-circle" size={24} color="#FFFFFF" />
          <Text style={styles.testNotificationBannerText}>{testNotificationToast}</Text>
        </View>
      )}

      <ScreenContainer
        scrollable
        edges={['left', 'right']}
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* 1. Header (Video Frame 015) */}
        <View style={styles.headerRow}>
          <View style={styles.greetingCol}>
            <Text style={[styles.greetingText, { color: colors.text }]}>Hey,{userName} 👋</Text>

            {/* Step 9g: Weekly League Chip that opens /community/league */}
            <TouchableOpacity
              style={[
                styles.weeklyPointsChip,
                { backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7', borderColor: '#F59E0B' },
              ]}
              onPress={() => router.push('/community/league' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="trophy" size={13} color="#D97706" />
              <Text style={[styles.weeklyPointsChipText, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
                {profile?.league_tier || 'Bronze'} League • {weeklyPoints} pts
              </Text>
              <Ionicons name="chevron-forward" size={11} color="#D97706" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.workoutModeBtn}
              onPress={() => setShowModeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.workoutModeText, { color: colors.textSecondary }]}>
                Workout Mode: {trainingMode}{' '}
                <Text style={styles.pencilIcon}>✏️</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerRightIcons}>
            {/* Notification Bell Button with normal app badge */}
            <TouchableOpacity
              style={[styles.iconCircle, { backgroundColor: colors.surface }]}
              onPress={() => {
                setShowNotificationSettings(false);
                setShowNotificationModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={unreadNotificationsCount > 0 ? 'notifications' : 'notifications-outline'}
                size={20}
                color={unreadNotificationsCount > 0 ? Colors.primary : colors.text}
              />
              {unreadNotificationsCount > 0 ? (
                <View style={styles.notificationCountBadge}>
                  <Text style={styles.notificationCountBadgeText}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              ) : (
                notificationsAllowed && <View style={styles.notificationActiveDot} />
              )}
            </TouchableOpacity>

            {/* Dark / Light Toggle Pill */}
            <TouchableOpacity
              style={[
                styles.themeTogglePill,
                isDarkMode && styles.themeTogglePillDark,
              ]}
              onPress={toggleDarkMode}
              activeOpacity={0.8}
            >
              <Ionicons
                name="moon"
                size={14}
                color={isDarkMode ? '#F59E0B' : '#94A3B8'}
              />
              <View
                style={[
                  styles.toggleKnob,
                  isDarkMode && styles.toggleKnobActive,
                ]}
              />
            </TouchableOpacity>

            {/* Question Mark Help Button */}
            <TouchableOpacity
              style={[styles.iconCircle, { backgroundColor: colors.surface }]}
              onPress={() => setShowHelpModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Weight Journey Bar (media_1791375047560.jpg) */}
        <TouchableOpacity
          style={[
            styles.weightRowBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setShowWeightModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.weightItem}>
            <View style={[styles.weightDot, { backgroundColor: Colors.primary }]} />
            <Text style={[styles.weightLabel, { color: colors.textSecondary }]}>
              Current weight{' '}
              <Text style={[styles.weightValue, { color: colors.text }]}>
                ({metrics.currentWeightKg.toFixed(1)} kg)
              </Text>
            </Text>
          </View>
          <View style={[styles.weightDivider, { backgroundColor: colors.border }]} />
          <View style={styles.weightItem}>
            <View style={[styles.weightDot, { backgroundColor: '#0284C7' }]} />
            <Text style={[styles.weightLabel, { color: colors.textSecondary }]}>
              target weight{' '}
              <Text style={[styles.weightValue, { color: colors.text }]}>
                ({targetWeightInput} lbs)
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        {/* 3. Challenges Section (3D Pop-Out Athletes) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Challenges</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.challengesScroll}
        >
          {CHALLENGES_DATA.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.92}
              onPress={() => {
                if (!isPremium) {
                  router.push('/premium');
                } else {
                  router.push({
                    pathname: '/workout-detail',
                    params: { id: item.workoutId },
                  });
                }
              }}
              style={[
                styles.challengeCard,
                { backgroundColor: item.bgColor },
              ]}
            >
              <View style={styles.challengeCardContent}>
                {/* Top Duration & PRO pill */}
                <View style={styles.challengeTopBadgeRow}>
                  <View style={styles.challengeDurationPill}>
                    <Text style={styles.challengeDurationText}>{item.duration}</Text>
                  </View>
                  <View style={styles.proPillBadge}>
                    <Text style={[styles.proPillText, { color: item.btnTextColor }]}>PRO</Text>
                  </View>
                </View>

                {/* Challenge Title */}
                <Text style={styles.challengeMainTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Days Left & Progress */}
                <View style={styles.challengeMetaRow}>
                  <Text style={styles.challengeDaysLeftText}>
                    {item.daysLeft} Days Left
                  </Text>
                  <Text style={styles.challengePercentText}>{item.progress}</Text>
                </View>

                {/* Progress Bar Track */}
                <View style={styles.challengeTrack}>
                  <View style={[styles.challengeFill, { width: '4%' }]} />
                </View>

                {/* Start Button */}
                <TouchableOpacity
                  style={styles.challengeStartPillBtn}
                  onPress={() => {
                    if (!isPremium) {
                      router.push('/premium');
                    } else {
                      router.push({
                        pathname: '/workout-detail',
                        params: { id: item.workoutId },
                      });
                    }
                  }}
                  activeOpacity={0.88}
                >
                  <Ionicons name="play" size={13} color={item.btnTextColor} />
                  <Text style={[styles.challengeStartPillText, { color: item.btnTextColor }]}>START</Text>
                </TouchableOpacity>
              </View>

              {/* 3D Pop-Out Athlete Model (Pops out above card) */}
              <Image
                source={item.image}
                style={styles.challengeAthletePopout}
                contentFit="contain"
                cachePolicy="memory-disk"
                priority="high"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Analytics Hub (Water Intake, Workout Consistency, Weight Journey & Macros) */}
        <HomeAnalyticsHub />

        {/* 4. Daily Fitness Report Calendar (Dynamic Real-Time) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Fitness Report</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarStrip}>
          {weekDays.map((item) => {
            const isSelected = item.idx === selectedDayIdx;
            return (
              <TouchableOpacity
                key={item.day}
                onPress={() => setSelectedDayIdx(item.idx)}
                activeOpacity={0.75}
                style={[
                  styles.calendarPill,
                  { backgroundColor: isDarkMode ? colors.surface : '#FFFFFF' },
                  isSelected && styles.calendarPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    { color: colors.textSecondary },
                    isSelected && styles.calendarDayTextActive,
                  ]}
                >
                  {item.day}
                </Text>

                {item.isCompleted ? (
                  <View style={styles.calendarCircleRed}>
                    <Text style={styles.calendarCircleRedText}>{item.num}</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.calendarCirclePlain,
                      { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' },
                      isSelected && styles.calendarCirclePlainActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarCirclePlainText,
                        { color: colors.textSecondary },
                        isSelected && styles.calendarCirclePlainTextActive,
                      ]}
                    >
                      {item.num}
                    </Text>
                  </View>
                )}
                {item.isToday && (
                  <View style={[styles.todayIndicatorDot, isSelected && { backgroundColor: Colors.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic Daily Fitness Report Card */}
        <View style={[styles.dailyReportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.dailyReportHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dailyReportTitle, { color: colors.text }]}>
                {selectedDay.isToday ? "Today's Fitness Report" : `${selectedDay.fullDay}'s Fitness Report`}
              </Text>
              <Text style={[styles.dailyReportSub, { color: colors.textSecondary }]}>
                {selectedDay.d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View
              style={[
                styles.reportStatusBadge,
                selectedDay.isCompleted
                  ? styles.statusCompletedBadge
                  : selectedDay.isToday
                  ? styles.statusActiveBadge
                  : selectedDay.isPast
                  ? styles.statusRestBadge
                  : styles.statusUpcomingBadge,
              ]}
            >
              <Ionicons
                name={
                  selectedDay.isCompleted
                    ? 'checkmark-circle'
                    : selectedDay.isToday
                    ? 'flash'
                    : selectedDay.isPast
                    ? 'pause-circle'
                    : 'calendar'
                }
                size={13}
                color={
                  selectedDay.isCompleted
                    ? '#15803D'
                    : selectedDay.isToday
                    ? '#0284C7'
                    : selectedDay.isPast
                    ? '#64748B'
                    : '#6366F1'
                }
              />
              <Text
                style={[
                  styles.reportStatusText,
                  {
                    color: selectedDay.isCompleted
                      ? '#15803D'
                      : selectedDay.isToday
                      ? '#0284C7'
                      : selectedDay.isPast
                      ? '#64748B'
                      : '#6366F1',
                  },
                ]}
              >
                {selectedDay.isCompleted
                  ? 'Completed'
                  : selectedDay.isToday
                  ? 'Active'
                  : selectedDay.isPast
                  ? 'Rest Day'
                  : 'Scheduled'}
              </Text>
            </View>
          </View>

          {/* Metrics Grid */}
          <View style={styles.dailyReportMetricsGrid}>
            {/* 1. Workout */}
            <View style={[styles.reportMetricCell, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <View style={[styles.reportMetricIconWrap, { backgroundColor: isDarkMode ? '#232946' : '#EEF2FF' }]}>
                <Ionicons name="barbell" size={16} color="#6366F1" />
              </View>
              <Text style={[styles.reportMetricVal, { color: colors.text }]}>
                {selectedDay.isCompleted ? '1 Done' : selectedDay.isToday ? '0 / 8' : 'Rest'}
              </Text>
              <Text style={[styles.reportMetricLabel, { color: colors.textMuted }]}>Workout</Text>
            </View>

            {/* 2. Calories */}
            <View style={[styles.reportMetricCell, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <View style={[styles.reportMetricIconWrap, { backgroundColor: isDarkMode ? '#3D1518' : '#FFEAEA' }]}>
                <Ionicons name="flame" size={16} color={Colors.primary} />
              </View>
              <Text style={[styles.reportMetricVal, { color: colors.text }]}>
                {selectedDay.isCompleted
                  ? '280 kcal'
                  : selectedDay.isToday
                  ? `${metrics.caloriesConsumed > 0 ? metrics.caloriesConsumed : 103} kcal`
                  : '0 kcal'}
              </Text>
              <Text style={[styles.reportMetricLabel, { color: colors.textMuted }]}>Calories</Text>
            </View>

            {/* 3. Water */}
            <View style={[styles.reportMetricCell, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <View style={[styles.reportMetricIconWrap, { backgroundColor: isDarkMode ? '#14314A' : '#E0F2FE' }]}>
                <Ionicons name="water" size={16} color="#0284C7" />
              </View>
              <Text style={[styles.reportMetricVal, { color: colors.text }]}>
                {selectedDay.isToday ? `${waterConsumedLiters} L` : '2.5 L'}
              </Text>
              <Text style={[styles.reportMetricLabel, { color: colors.textMuted }]}>Hydration</Text>
            </View>

            {/* 4. Streak */}
            <View style={[styles.reportMetricCell, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <View style={[styles.reportMetricIconWrap, { backgroundColor: isDarkMode ? '#3A2E12' : '#FEF3C7' }]}>
                <Ionicons name="trophy" size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.reportMetricVal, { color: colors.text }]}>
                {homeProgress.progress.streak} {homeProgress.progress.streak === 1 ? 'Day' : 'Days'}
              </Text>
              <Text style={[styles.reportMetricLabel, { color: colors.textMuted }]}>Streak</Text>
            </View>
          </View>

          {/* Action Row */}
          {selectedDay.isToday && !selectedDay.isCompleted && (
            <View style={styles.dailyReportActionRow}>
              <TouchableOpacity
                style={styles.dailyReportStartBtn}
                onPress={handleStartWorkout}
                activeOpacity={0.88}
              >
                <Ionicons name="play" size={15} color="#FFFFFF" />
                <Text style={styles.dailyReportStartBtnText}>Start Today&apos;s Workout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dailyReportMarkBtn, { borderColor: Colors.primary }]}
                onPress={async () => {
                  await homeProgress.markTodayAsDone('Daily Routine', 280);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
                <Text style={[styles.dailyReportMarkBtnText, { color: Colors.primary }]}>Mark Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedDay.isCompleted && (
            <View style={[styles.dailyReportCompletedBanner, { backgroundColor: isDarkMode ? '#133529' : '#ECFDF5' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#15803D" />
              <Text style={styles.dailyReportCompletedBannerText}>
                Workout logged &amp; goal achieved for this day! 🔥
              </Text>
            </View>
          )}
        </View>

        {/* 5. Today's Workout Card with Live Video Cutout for Respective Day */}
        <HomeTodayWorkoutCard />


        {/* 7. Today Activity Carousel (Video Frames 030, 035) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today Activity</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.todayActivityScroll}
          onScroll={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const page = Math.round(offsetX / 170);
            setActivityPage(page);
          }}
          scrollEventThrottle={16}
        >
          {/* Card 1: Today's Workout */}
          <View style={[styles.activityBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityBoxTop}>
              <Ionicons name="barbell-outline" size={14} color="#6366F1" />
              <Text style={[styles.activityBoxTopText, { color: colors.textSecondary }]}>Today&apos;s Workout</Text>
            </View>
            <View style={[styles.activityCircleIcon, { backgroundColor: isDarkMode ? '#232946' : '#EEF2FF' }]}>
              <Ionicons name="barbell" size={24} color="#6366F1" />
            </View>
            <Text style={[styles.activityBoxTitle, { color: colors.text }]}>Workout</Text>
            <Text style={[styles.activityBoxMainValue, { color: '#6366F1' }]}>
              0/8
            </Text>
            <Text style={[styles.activityBoxSub, { color: colors.textMuted }]}>Workout Completed</Text>
            <TouchableOpacity
              style={[styles.activityStartBtn, { backgroundColor: '#6366F1' }]}
              onPress={handleStartWorkout}
              activeOpacity={0.85}
            >
              <Text style={styles.activityStartBtnText}>Start Now</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Today's Hydration */}
          <View style={[styles.activityBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityBoxTop}>
              <Ionicons name="water-outline" size={14} color="#0284C7" />
              <Text style={[styles.activityBoxTopText, { color: colors.textSecondary }]}>Today&apos;s Hydration</Text>
            </View>
            <View style={[styles.activityCircleIcon, { backgroundColor: isDarkMode ? '#14314A' : '#E0F2FE' }]}>
              <Ionicons name="water" size={24} color="#0284C7" />
            </View>
            <Text style={[styles.activityBoxTitle, { color: colors.text }]}>Water Intake</Text>
            <Text style={[styles.activityBoxMainValue, { color: '#0284C7' }]}>
              {waterConsumedLiters} L / {waterTargetLiters} L
            </Text>
            <Text style={[styles.activityBoxSub, { color: colors.textMuted }]}>Water Consumed</Text>
            <TouchableOpacity
              style={[styles.activityStartBtn, { backgroundColor: '#0284C7' }]}
              onPress={() => addWater(250)}
              activeOpacity={0.85}
            >
              <Text style={styles.activityStartBtnText}>+250 ml</Text>
            </TouchableOpacity>
          </View>

          {/* Card 3: Daily Mindfulness */}
          <View style={[styles.activityBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityBoxTop}>
              <Ionicons name="leaf-outline" size={14} color="#10B981" />
              <Text style={[styles.activityBoxTopText, { color: colors.textSecondary }]}>Daily Mindfulness</Text>
            </View>
            <View style={[styles.activityCircleIcon, { backgroundColor: isDarkMode ? '#133529' : '#ECFDF5' }]}>
              <Ionicons name="leaf" size={24} color="#10B981" />
            </View>
            <Text style={[styles.activityBoxTitle, { color: colors.text }]}>Meditation</Text>
            <Text style={[styles.activityBoxMainValue, { color: '#10B981' }]}>
              5 Min
            </Text>
            <Text style={[styles.activityBoxSub, { color: colors.textMuted }]}>Try 5 minute session</Text>
            <TouchableOpacity
              style={[styles.activityStartBtn, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/(tabs)/diet')}
              activeOpacity={0.85}
            >
              <Text style={styles.activityStartBtnText}>Start Now</Text>
            </TouchableOpacity>
          </View>

          {/* Card 4: Reminders */}
          <View style={[styles.activityBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityBoxTop}>
              <Ionicons name="notifications-outline" size={14} color="#F59E0B" />
              <Text style={[styles.activityBoxTopText, { color: colors.textSecondary }]}>Reminders</Text>
            </View>
            <View style={[styles.activityCircleIcon, { backgroundColor: isDarkMode ? '#3A2E12' : '#FEF3C7' }]}>
              <Ionicons name="alarm" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.activityBoxTitle, { color: colors.text }]}>Reminders</Text>
            <Text style={[styles.activityBoxMainValue, { color: '#F59E0B' }]}>
              {notificationsAllowed ? reminderTime : 'Muted'}
            </Text>
            <Text style={[styles.activityBoxSub, { color: colors.textMuted }]}>Daily workout alert</Text>
            <TouchableOpacity
              style={[styles.activityStartBtn, { backgroundColor: '#F59E0B' }]}
              onPress={() => setShowNotificationModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.activityStartBtnText}>Configure</Text>
            </TouchableOpacity>
          </View>

          {/* Card 5: Diet Plan */}
          <View style={[styles.activityBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityBoxTop}>
              <Ionicons name="restaurant-outline" size={14} color={Colors.primary} />
              <Text style={[styles.activityBoxTopText, { color: colors.textSecondary }]}>
                {todayCuisine === 'indian'
                  ? 'Indian Diet'
                  : todayCuisine === 'pakistani'
                  ? 'Pakistani Diet'
                  : todayCuisine === 'chinese'
                  ? 'Chinese Diet'
                  : todayCuisine === 'british'
                  ? 'British Diet'
                  : 'American Diet'}
              </Text>
            </View>
            <View style={[styles.activityCircleIcon, { backgroundColor: isDarkMode ? '#3D1518' : '#FFEAEA' }]}>
              <Ionicons name="restaurant" size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.activityBoxTitle, { color: colors.text }]}>Today&apos;s Diet</Text>
            <Text style={[styles.activityBoxMainValue, { color: Colors.primary }]}>
              {todayDietNutrition.calories} kcal
            </Text>
            <Text style={[styles.activityBoxSub, { color: colors.textMuted }]}>
              ${todayDietNutrition.cost.toFixed(2)} / Day • {todayDietNutrition.protein}g Protein
            </Text>
            <TouchableOpacity
              style={[styles.activityStartBtn, { backgroundColor: Colors.primary }]}
              onPress={() => router.push('/(tabs)/diet')}
              activeOpacity={0.85}
            >
              <Text style={styles.activityStartBtnText}>View Diet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Activity Carousel Pagination Dots */}
        <View style={styles.dotsPaginationRow}>
          {[0, 1, 2, 3, 4].map((d) => (
            <View
              key={d}
              style={[
                styles.dotItem,
                { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' },
                activityPage === d && [styles.dotItemActive, { backgroundColor: colors.text }],
              ]}
            />
          ))}
        </View>

        {/* 8. Today's Diet Plan (Synchronized with Diet Tab) */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithBadge}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Diet Plan</Text>
            <View style={[styles.instantSpeedBadge, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
              <Ionicons name="shield-checkmark" size={11} color="#16A34A" />
              <Text style={[styles.instantSpeedBadgeText, { color: '#16A34A' }]}>100% Halal</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/diet')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.mealSectionSubtitle, { color: colors.textSecondary }]}>
          Day {getDayNumberFromDate(new Date())} • ${todayBudget.toFixed(2)}/Day Target • {todayDietNutrition.calories} kcal • {todayDietNutrition.protein}g Protein
        </Text>

        {/* 5 Cuisines Selector Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mealCategoriesScroll}
          nestedScrollEnabled={true}
        >
          {HOME_CUISINES.map((c) => {
            const isSelected = todayCuisine === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.mealCategoryChip,
                  {
                    backgroundColor: isSelected
                      ? Colors.primary
                      : isDarkMode
                      ? '#1E293B'
                      : '#F1F5F9',
                    borderColor: isSelected ? Colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelectHomeCuisine(c.id)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13 }}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.mealCategoryChipText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search Bar for Meals */}
        <Pressable
          style={[
            styles.mealSearchBar,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
              borderColor: colors.border,
            },
          ]}
          onPress={() => mealSearchInputRef.current?.focus()}
        >
          <Ionicons name="search" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          <TextInput
            ref={mealSearchInputRef}
            style={[styles.mealSearchInput, { color: colors.text }]}
            placeholder={`Search ${todayCuisine} meals (e.g. eggs, chicken, biryani)...`}
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={mealSearchQuery}
            onChangeText={(text) => setMealSearchQuery(text)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {mealSearchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setMealSearchQuery('');
                mealSearchInputRef.current?.blur();
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.mealSearchClearBtn}
              delayPressIn={0}
            >
              <Ionicons name="close-circle" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          )}
        </Pressable>

        {/* Meal Cards Scroll */}
        {filteredDailyMeals.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealsScroll}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {filteredDailyMeals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[
                  styles.instantMealCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() =>
                  setSelectedMealForDetail({
                    id: meal.id,
                    name: meal.title,
                    desc:
                      meal.subtitle +
                      (meal.instructions?.length
                        ? '\n\nInstructions:\n• ' + meal.instructions.join('\n• ')
                        : '') +
                      (meal.budgetTips ? '\n\n💡 Tip: ' + meal.budgetTips : ''),
                    image: meal.image,
                    priceLabel: `$${(meal.costUsd || getAsianMealCostUsd(meal)).toFixed(2)}`,
                    time: meal.prepTime || '10 Mins',
                    tier: meal.mealSlot,
                    kcal: meal.baseKcal,
                    protein: meal.baseProtein,
                    carbs: meal.baseCarbs,
                    fat: meal.baseFat,
                  })
                }
                activeOpacity={0.88}
                delayPressIn={0}
              >
                <View style={styles.instantMealImgWrap}>
                  <Image
                    source={meal.image}
                    style={styles.instantMealImg}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="high"
                  />
                  <View style={styles.mealPriceBadge}>
                    <Text style={styles.mealPriceText}>
                      ${(meal.costUsd || getAsianMealCostUsd(meal)).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.mealTimeBadge}>
                    <Ionicons name="time-outline" size={10} color="#FFFFFF" />
                    <Text style={styles.mealTimeText}>{meal.prepTime || '10 Mins'}</Text>
                  </View>
                  <View style={styles.mealKcalBadge}>
                    <Ionicons name="flame" size={10} color="#EF4444" />
                    <Text style={styles.mealKcalText}>{meal.baseKcal} kcal</Text>
                  </View>
                </View>

                <View style={styles.instantMealBody}>
                  <View style={styles.mealTierRow}>
                    <View
                      style={[
                        styles.mealTierBadge,
                        { backgroundColor: meal.slotColor + '20' },
                      ]}
                    >
                      <Text style={[styles.mealTierText, { color: meal.slotColor }]}>
                        {meal.slotEmoji} {meal.mealSlot}
                      </Text>
                    </View>
                    <View style={styles.mealSpeedMicroBadge}>
                      <Text style={styles.mealSpeedMicroBadgeText}>100% Halal</Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.instantMealName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {meal.title}
                  </Text>

                  {/* 3 Macro Pills */}
                  <View
                    style={[
                      styles.macrosTripleRow,
                      { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' },
                    ]}
                  >
                    <View style={styles.macroPillBox}>
                      <Text style={styles.macroPillHeader}>Protein</Text>
                      <Text style={[styles.macroPillVal, { color: '#6366F1' }]}>
                        {meal.baseProtein}g
                      </Text>
                    </View>
                    <View style={styles.macroPillBox}>
                      <Text style={styles.macroPillHeader}>Carbs</Text>
                      <Text style={[styles.macroPillVal, { color: '#F59E0B' }]}>
                        {meal.baseCarbs}g
                      </Text>
                    </View>
                    <View style={styles.macroPillBox}>
                      <Text style={styles.macroPillHeader}>Fat</Text>
                      <Text style={[styles.macroPillVal, { color: '#10B981' }]}>
                        {meal.baseFat}g
                      </Text>
                    </View>
                  </View>

                  {/* Action Button on Card */}
                  <TouchableOpacity
                    style={[styles.mealCardActionBtn, { backgroundColor: Colors.primary }]}
                    onPress={() =>
                      setSelectedMealForDetail({
                        id: meal.id,
                        name: meal.title,
                        desc:
                          meal.subtitle +
                          (meal.instructions?.length
                            ? '\n\nInstructions:\n• ' + meal.instructions.join('\n• ')
                            : '') +
                          (meal.budgetTips ? '\n\n💡 Tip: ' + meal.budgetTips : ''),
                        image: meal.image,
                        priceLabel: `$${(meal.costUsd || getAsianMealCostUsd(meal)).toFixed(2)}`,
                        time: meal.prepTime || '10 Mins',
                        tier: meal.mealSlot,
                        kcal: meal.baseKcal,
                        protein: meal.baseProtein,
                        carbs: meal.baseCarbs,
                        fat: meal.baseFat,
                      })
                    }
                    activeOpacity={0.8}
                    delayPressIn={0}
                  >
                    <Ionicons name="restaurant-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.mealCardActionBtnText}>View Recipe &amp; Log</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.noMealsContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="restaurant-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.noMealsTitle, { color: colors.text }]}>No Meals Found</Text>
            <Text style={[styles.noMealsSub, { color: colors.textSecondary }]}>
              No meals match &quot;{mealSearchQuery}&quot;. Tap reset to show today&apos;s full menu.
            </Text>
            <TouchableOpacity
              style={styles.resetMealFilterBtn}
              onPress={() => setMealSearchQuery('')}
              activeOpacity={0.8}
              delayPressIn={0}
            >
              <Ionicons name="refresh" size={13} color="#FFFFFF" />
              <Text style={styles.resetMealFilterBtnText}>Reset Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 9. Body Parts Exercises Carousel (Video Frame 040) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Parts Exercises</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bodyPartsScroll}
        >
          {BODY_PARTS_DATA.map((bp) => (
            <TouchableOpacity
              key={bp.id}
              style={[
                styles.bodyPartCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/workout-detail',
                  params: { id: bp.workoutId },
                })
              }
              activeOpacity={0.88}
            >
              <View style={styles.bodyPartImgWrap}>
                <Image
                  source={bp.image}
                  style={styles.bodyPartAnatomyImg}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  priority="high"
                />
              </View>
              <Text style={[styles.bodyPartNameLabel, { color: colors.text }]}>{bp.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 10. Water Intake Section (Video Frame 040) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Water Intake</Text>
          <TouchableOpacity
            style={[styles.enterWaterBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => addWater(250)}
            activeOpacity={0.85}
          >
            <Text style={[styles.enterWaterBtnText, { color: colors.text }]}>Enter Water</Text>
            <Ionicons name="time-outline" size={14} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.waterIntakeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Left: Bar scale visual */}
          <View style={styles.waterBarsCol}>
            {[6, 4, 2, 0].map((num) => (
              <View key={num} style={styles.barScaleRow}>
                <Text style={styles.barScaleNum}>{num}</Text>
                <View style={[styles.barScaleDash, { backgroundColor: colors.border }]} />
              </View>
            ))}
          </View>

          {/* Right: Circular Gauge */}
          <View style={styles.waterGaugeCol}>
            <View
              style={[
                styles.waterCircularRing,
                { backgroundColor: isDarkMode ? '#14314A' : '#F0F9FF' },
              ]}
            >
              <Text style={styles.waterPercentText}>{waterPercent}.00%</Text>
              <Text style={[styles.waterGoalSub, { color: colors.textSecondary }]}>Goal</Text>
            </View>

            <View style={styles.waterStatsCol}>
              <Text style={[styles.waterConsumedStat, { color: colors.textSecondary }]}>
                Water Consumed{' '}
                <Text style={[styles.waterBoldVal, { color: colors.text }]}>
                  {waterConsumedLiters} Liter
                </Text>
              </Text>
              <Text style={[styles.waterGoalStat, { color: colors.textSecondary }]}>
                Goal{' '}
                <Text style={[styles.waterBoldVal, { color: colors.text }]}>
                  {waterTargetLiters} Liter
                </Text>
              </Text>

              <View style={styles.waterQuickAddRow}>
                <TouchableOpacity
                  style={styles.waterAddChip}
                  onPress={() => addWater(250)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.waterAddChipText}>+250ml</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.waterAddChip}
                  onPress={() => addWater(500)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.waterAddChipText}>+500ml</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Extra Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScreenContainer>

      {/* ============================================================ */}
      {/* 12. NOTIFICATION MANAGEMENT MODAL (ALLOW / DISALLOW DAILY NOTIFS) */}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* 12. INTERACTIVE NOTIFICATION CENTER (FRIEND CHALLENGES & ALERTS) */}
      {/* ============================================================ */}
      <Modal visible={showNotificationModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.notifInboxCard, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={[styles.notifInboxHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.notifHeaderLeft}>
                <Ionicons name="notifications" size={22} color={Colors.primary} />
                <Text style={[styles.notifInboxTitle, { color: colors.text }]}>
                  {showNotificationSettings ? 'Notification Settings' : 'Notifications'}
                </Text>
                {!showNotificationSettings && unreadNotificationsCount > 0 && (
                  <View style={styles.notifInboxBadge}>
                    <Text style={styles.notifInboxBadgeText}>{unreadNotificationsCount}</Text>
                  </View>
                )}
              </View>

              <View style={styles.notifHeaderRight}>
                <TouchableOpacity
                  onPress={() => setShowNotificationSettings((prev) => !prev)}
                  style={styles.notifHeaderIconBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showNotificationSettings ? 'mail-outline' : 'settings-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowNotificationModal(false)}
                  style={styles.notifHeaderIconBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Body */}
            {showNotificationSettings ? (
              <ScrollView style={styles.notifInboxScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.notifSettingsNotice, { color: colors.textSecondary }]}>
                  Customize how SweatFlix notifies you about workouts, friend challenges, and streak reminders.
                </Text>

                {/* Master Switch */}
                <View
                  style={[
                    styles.notificationToggleCard,
                    { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.notificationToggleLabel, { color: colors.text }]}>
                      Daily Workout Reminders
                    </Text>
                    <Text style={[styles.notificationToggleSub, { color: colors.textSecondary }]}>
                      {notificationsAllowed
                        ? 'Active: Receive scheduled alerts to complete your daily routine.'
                        : 'Muted: You will not receive daily reminders.'}
                    </Text>
                  </View>
                  <Switch
                    value={notificationsAllowed}
                    onValueChange={handleToggleNotifications}
                    trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Time Picker Chips */}
                {notificationsAllowed && (
                  <View style={styles.timeSectionWrap}>
                    <Text style={[styles.timeSectionTitle, { color: colors.text }]}>
                      Preferred Reminder Time:
                    </Text>
                    <View style={styles.timeChipsRow}>
                      {['07:00 AM', '08:00 AM', '12:00 PM', '06:00 PM'].map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.timeChip,
                            reminderTime === t && styles.timeChipActive,
                          ]}
                          onPress={() => handleSelectReminderTime(t)}
                        >
                          <Text
                            style={[
                              styles.timeChipText,
                              reminderTime === t && styles.timeChipTextActive,
                            ]}
                          >
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Test Notification Button */}
                <TouchableOpacity
                  style={[
                    styles.testNotificationBtn,
                    { borderColor: colors.border, backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' },
                  ]}
                  onPress={handleSendTestNotification}
                  activeOpacity={0.8}
                >
                  <Ionicons name="paper-plane-outline" size={16} color={Colors.primary} />
                  <Text style={styles.testNotificationBtnText}>Send Test Notification 🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.notifBackBtn}
                  onPress={() => setShowNotificationSettings(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.notifBackBtnText}>‹ Back to Notifications Inbox</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView style={styles.notifInboxScroll} showsVerticalScrollIndicator={false}>
                {/* 1. Pending Friend Challenges */}
                {pendingChallenges.length > 0 && (
                  <View style={styles.notifSection}>
                    <View style={styles.notifSectionTitleRow}>
                      <Ionicons name="flame" size={16} color="#DC2626" />
                      <Text style={[styles.notifSectionTitle, { color: colors.text }]}>
                        Friend Challenges ({pendingChallenges.length})
                      </Text>
                    </View>

                    {pendingChallenges.map((ch) => {
                      const challengerName = ch.creator?.name || 'A Friend';
                      const challengerInitial = challengerName.charAt(0).toUpperCase();
                      const targetUnit = ch.metric === 'reps' ? 'reps' : 'seconds';
                      const isActing = actingChallengeId === ch.id;

                      return (
                        <View
                          key={ch.id}
                          style={[
                            styles.notifItemCard,
                            { backgroundColor: isDarkMode ? '#1E293B' : '#FEF2F2', borderColor: '#FCA5A5' },
                          ]}
                        >
                          <View style={styles.notifItemTop}>
                            {ch.creator?.avatar_url ? (
                              <Image source={{ uri: ch.creator.avatar_url }} style={styles.notifAvatar} />
                            ) : (
                              <View
                                style={[
                                  styles.notifAvatarInitial,
                                  { backgroundColor: getAvatarColor(ch.creator_id) },
                                ]}
                              >
                                <Text style={styles.notifAvatarText}>{challengerInitial}</Text>
                              </View>
                            )}

                            <View style={styles.notifItemContent}>
                              <Text style={[styles.notifItemHeadline, { color: colors.text }]}>
                                <Text style={{ fontWeight: '800' }}>{challengerName}</Text> challenged you to{' '}
                                <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                                  {ch.target} {targetUnit}
                                </Text>{' '}
                                of {ch.exercise_name}!
                              </Text>
                              {ch.message ? (
                                <Text style={styles.notifQuoteText}>&quot;{ch.message}&quot;</Text>
                              ) : null}
                              <Text style={styles.notifMetaText}>⏱ {ch.duration_hours}h duration • 25 pts for winning</Text>
                            </View>
                          </View>

                          <View style={styles.notifActionRow}>
                            <TouchableOpacity
                              style={[styles.notifDeclineBtn, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
                              onPress={() => handleDeclineChallenge(ch)}
                              disabled={isActing}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.notifDeclineBtnText, { color: colors.text }]}>Decline</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.notifAcceptBtn, { backgroundColor: Colors.primary }]}
                              onPress={() => handleAcceptChallenge(ch)}
                              disabled={isActing}
                              activeOpacity={0.8}
                            >
                              {isActing ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <Text style={styles.notifAcceptBtnText}>Accept Challenge 🔥</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* 2. Incoming Friend Requests */}
                {incomingFriendRequests.length > 0 && (
                  <View style={styles.notifSection}>
                    <View style={styles.notifSectionTitleRow}>
                      <Ionicons name="people" size={16} color="#3B82F6" />
                      <Text style={[styles.notifSectionTitle, { color: colors.text }]}>
                        Friend Requests ({incomingFriendRequests.length})
                      </Text>
                    </View>

                    {incomingFriendRequests.map((req) => {
                      const friendName = req.user?.name || 'Athlete';
                      const friendInitial = friendName.charAt(0).toUpperCase();
                      const isActing = actingFriendReqId === req.id;

                      return (
                        <View
                          key={req.id}
                          style={[
                            styles.notifItemCard,
                            { backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF', borderColor: '#93C5FD' },
                          ]}
                        >
                          <View style={styles.notifItemTop}>
                            {req.user?.avatar_url ? (
                              <Image source={{ uri: req.user.avatar_url }} style={styles.notifAvatar} />
                            ) : (
                              <View
                                style={[
                                  styles.notifAvatarInitial,
                                  { backgroundColor: getAvatarColor(req.user?.id || req.id) },
                                ]}
                              >
                                <Text style={styles.notifAvatarText}>{friendInitial}</Text>
                              </View>
                            )}

                            <View style={styles.notifItemContent}>
                              <Text style={[styles.notifItemHeadline, { color: colors.text }]}>
                                <Text style={{ fontWeight: '800' }}>{friendName}</Text> wants to be your fitness friend!
                              </Text>
                              {req.user?.username ? (
                                <Text style={styles.notifMetaText}>@{req.user.username}</Text>
                              ) : null}
                            </View>
                          </View>

                          <View style={styles.notifActionRow}>
                            <TouchableOpacity
                              style={[styles.notifDeclineBtn, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
                              onPress={() => handleDeclineFriendRequest(req)}
                              disabled={isActing}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.notifDeclineBtnText, { color: colors.text }]}>Ignore</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.notifAcceptBtn, { backgroundColor: '#3B82F6' }]}
                              onPress={() => handleAcceptFriendRequest(req)}
                              disabled={isActing}
                              activeOpacity={0.8}
                            >
                              {isActing ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <Text style={styles.notifAcceptBtnText}>Accept Friend</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* 3. Leaderboard & Milestones Activity Card */}
                <TouchableOpacity
                  style={[
                    styles.notifLeaderboardCard,
                    { backgroundColor: isDarkMode ? '#1E293B' : '#FEF9C3', borderColor: '#EAB308' },
                  ]}
                  onPress={() => {
                    setShowNotificationModal(false);
                    router.push('/community/leaderboard' as any);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.notifLbIconBox}>
                    <Ionicons name="trophy" size={24} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifLbTitle, { color: colors.text }]}>
                      Weekly Leaderboard Active
                    </Text>
                    <Text style={styles.notifLbSub}>
                      You earned <Text style={{ fontWeight: '800', color: Colors.primary }}>{weeklyPoints} points</Text> this week. Keep logging workouts before the Sunday UTC reset!
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>

                {/* Empty State when no pending challenges or requests */}
                {pendingChallenges.length === 0 && incomingFriendRequests.length === 0 && (
                  <View style={styles.notifEmptyWrap}>
                    <View style={styles.notifEmptyIcon}>
                      <Ionicons name="checkmark-done-circle" size={44} color="#10B981" />
                    </View>
                    <Text style={[styles.notifEmptyTitle, { color: colors.text }]}>
                      You&apos;re All Caught Up! 🎉
                    </Text>
                    <Text style={[styles.notifEmptySub, { color: colors.textSecondary }]}>
                      No pending friend challenges or connection requests right now.
                    </Text>
                    <TouchableOpacity
                      style={styles.notifStartChallengeBtn}
                      onPress={() => {
                        setShowNotificationModal(false);
                        router.push('/community/new-challenge' as any);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="flame" size={16} color="#FFFFFF" />
                      <Text style={styles.notifStartChallengeBtnText}>Challenge a Friend ⚔️</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Settings link footer */}
                <TouchableOpacity
                  style={styles.notifFooterSettingsBtn}
                  onPress={() => setShowNotificationSettings(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="options-outline" size={14} color={Colors.primary} />
                  <Text style={styles.notifFooterSettingsText}>Reminder Settings & Alarm Sound</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 13. QUESTION MARK HELP & APP GUIDE MODAL */}
      {/* ============================================================ */}
      <Modal visible={showHelpModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.helpModalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.helpHeaderRow}>
              <View style={[styles.helpIconBox, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="help-buoy" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helpModalTitle, { color: colors.text }]}>
                  How SweatFlix Works 💡
                </Text>
                <Text style={[styles.helpModalSub, { color: colors.textSecondary }]}>
                  Your complete bodybuilding and body recomp companion
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHelpModal(false)}
                style={[styles.helpCloseBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.helpScroll}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.helpItemCard,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <Text style={styles.helpItemEmoji}>🏋️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    3D Anatomical Muscle Targeting
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    Every exercise highlights target and stabilizer muscles directly on our 3D model
                    so you know exactly which muscle fibers to contract.
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.helpItemCard,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <Text style={styles.helpItemEmoji}>🔄</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    Continuous Video Loops
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    HD movement demonstration videos play continuously without stopping so you can
                    keep perfect tempo during your heavy lifting sets.
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.helpItemCard,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <Text style={styles.helpItemEmoji}>🥗</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    Personalized Nutrition Engine
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    Calculates your exact daily calories and grams of protein, carbs, and fat based
                    on your target weight journey.
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.helpItemCard,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <Text style={styles.helpItemEmoji}>✏️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    Gym vs Home Mode
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    Switch between full gym barbells and bodyweight home routines instantly by
                    tapping the pencil icon next to &ldquo;Workout Mode&rdquo;.
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.helpItemCard,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <Text style={styles.helpItemEmoji}>👑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    SweatFlix PRO Pass
                  </Text>
                  <Text style={[styles.helpItemDesc, { color: colors.textSecondary }]}>
                    Unlock full access to all 3D anatomical guides, advanced overload charts, and
                    ad-free focus for only $0.02 / Day.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.helpContactBtn}
              onPress={() => {
                setShowHelpModal(false);
                router.push('/profile/feedback');
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
              <Text style={styles.helpContactBtnText}>Need More Help? Contact Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpDismissBtn}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.helpDismissBtnText}>Got it, Let&apos;s Train! 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Weight Modal */}
      <Modal visible={showWeightModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconBox}>
              <Ionicons name="scale-outline" size={26} color={Colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Update Your Weight</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Track your journey toward your target physique.
            </Text>

            <View style={styles.modalInputWrap}>
              <Text style={[styles.modalInputLabel, { color: colors.text }]}>Current Weight (kg):</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', color: colors.text, borderColor: colors.border },
                ]}
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="e.g. 60.0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.modalInputWrap}>
              <Text style={[styles.modalInputLabel, { color: colors.text }]}>Target Weight (lbs):</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', color: colors.text, borderColor: colors.border },
                ]}
                keyboardType="numeric"
                value={targetWeightInput}
                onChangeText={setTargetWeightInput}
                placeholder="e.g. 68.0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                onPress={() => setShowWeightModal(false)}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveWeight}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mode Switch Modal */}
      <Modal visible={showModeModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Workout Mode</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Switch equipment environment</Text>

            <View style={styles.modeOptionsRow}>
              <TouchableOpacity
                style={[
                  styles.modeOptionCard,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  trainingMode === 'Gym' && styles.modeOptionCardActive,
                ]}
                onPress={() => {
                  setTrainingMode('Gym');
                  setShowModeModal(false);
                }}
              >
                <Text style={styles.modeOptionEmoji}>🏋️</Text>
                <Text style={[styles.modeOptionTitle, { color: colors.text }]}>Gym Mode</Text>
                <Text style={[styles.modeOptionSub, { color: colors.textSecondary }]}>
                  Full Barbells &amp; Machines
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeOptionCard,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  trainingMode === 'Home' && styles.modeOptionCardActive,
                ]}
                onPress={() => {
                  setTrainingMode('Home');
                  setShowModeModal(false);
                }}
              >
                <Text style={styles.modeOptionEmoji}>🏠</Text>
                <Text style={[styles.modeOptionTitle, { color: colors.text }]}>Home Mode</Text>
                <Text style={[styles.modeOptionSub, { color: colors.textSecondary }]}>
                  Bodyweight &amp; Dumbbells
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseSmallBtn}
              onPress={() => setShowModeModal(false)}
            >
              <Text style={styles.modalCloseSmallBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Meal Detail Modal */}
      {selectedMealForDetail && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={[styles.mealModalCard, { backgroundColor: colors.surface }]}>
              <Image
                source={selectedMealForDetail.image}
                style={styles.mealModalImg}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <TouchableOpacity
                style={styles.mealModalClose}
                onPress={() => setSelectedMealForDetail(null)}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.mealModalBody}>
                <View style={styles.modalPillsRow}>
                  <View style={styles.modalPricePill}>
                    <Text style={styles.modalPricePillText}>{selectedMealForDetail.priceLabel} / Serving</Text>
                  </View>
                  <View style={styles.modalTierPill}>
                    <Text style={styles.modalTierPillText}>{selectedMealForDetail.tier}</Text>
                  </View>
                  <View style={styles.modalTimePill}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.modalTimePillText, { color: colors.textSecondary }]}>
                      {selectedMealForDetail.time}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.mealModalTitle, { color: colors.text }]}>
                  {selectedMealForDetail.name}
                </Text>
                <Text style={[styles.mealModalDesc, { color: colors.textSecondary }]}>
                  {selectedMealForDetail.desc}
                </Text>

                <View
                  style={[
                    styles.macrosTripleRowModal,
                    { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' },
                  ]}
                >
                  <View style={styles.macroBoxModal}>
                    <Text style={[styles.macroBoxModalVal, { color: '#6366F1' }]}>
                      {selectedMealForDetail.protein}g
                    </Text>
                    <Text style={[styles.macroBoxModalLabel, { color: colors.textSecondary }]}>Protein</Text>
                  </View>
                  <View style={styles.macroBoxModal}>
                    <Text style={[styles.macroBoxModalVal, { color: '#F59E0B' }]}>
                      {selectedMealForDetail.carbs}g
                    </Text>
                    <Text style={[styles.macroBoxModalLabel, { color: colors.textSecondary }]}>Carbs</Text>
                  </View>
                  <View style={styles.macroBoxModal}>
                    <Text style={[styles.macroBoxModalVal, { color: '#10B981' }]}>
                      {selectedMealForDetail.fat}g
                    </Text>
                    <Text style={[styles.macroBoxModalLabel, { color: colors.textSecondary }]}>Fat</Text>
                  </View>
                  <View style={styles.macroBoxModal}>
                    <Text style={[styles.macroBoxModalVal, { color: Colors.primary }]}>
                      {selectedMealForDetail.kcal}
                    </Text>
                    <Text style={[styles.macroBoxModalLabel, { color: colors.textSecondary }]}>Kcal</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.logMealBtn}
                  onPress={async () => {
                    const mealName = selectedMealForDetail.name;
                    const mealKcal = selectedMealForDetail.kcal;
                    const mealP = selectedMealForDetail.protein;
                    await logMeal(
                      selectedMealForDetail.kcal,
                      selectedMealForDetail.protein,
                      selectedMealForDetail.carbs,
                      selectedMealForDetail.fat
                    );
                    setSelectedMealForDetail(null);
                    setTestNotificationToast(`✅ Logged ${mealName} (+${mealKcal} kcal, ${mealP}g Protein)!`);
                    setTimeout(() => {
                      setTestNotificationToast(null);
                    }, 4000);
                  }}
                  activeOpacity={0.88}
                  delayPressIn={0}
                >
                  <Ionicons name="add-circle" size={17} color="#FFFFFF" />
                  <Text style={styles.logMealBtnText}>Log This Meal (+{selectedMealForDetail.kcal} Kcal)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootScreen: {
    flex: 1,
  },
  testNotificationBanner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  testNotificationBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.semiBold,
    flex: 1,
    lineHeight: 16,
  },
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  greetingCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: Typography.weights.heavy,
  },
  workoutModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  workoutModeText: {
    fontSize: 12,
    fontWeight: Typography.weights.medium,
  },
  pencilIcon: {
    fontSize: 11,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proHeaderBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  proHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
    letterSpacing: 0.5,
  },
  proBadgeHeaderBtn: {
    backgroundColor: '#FFF2E5',
    borderColor: '#FF8A1F',
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeHeaderBtnText: {
    color: '#FF6B00',
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.xs,
    letterSpacing: 0.5,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  themeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    width: 48,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  themeTogglePillDark: {
    backgroundColor: '#1E293B',
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    backgroundColor: '#F59E0B',
  },
  weightRowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: Spacing.xs,
    borderWidth: 1,
  },
  weightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weightLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
  },
  weightValue: {
    fontWeight: Typography.weights.bold,
  },
  weightDivider: {
    width: 1,
    height: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: Typography.weights.heavy,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: '#0284C7',
  },
  challengesScroll: {
    paddingTop: 36,
    paddingBottom: 10,
    gap: 14,
    overflow: 'visible',
  },
  challengeCard: {
    width: SCREEN_WIDTH * 0.78,
    height: 168,
    borderRadius: 24,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'visible',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  challengeCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
    maxWidth: '58%',
  },
  challengeTopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeDurationPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  challengeDurationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  proPillBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proPillText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
  },
  challengeMainTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Typography.weights.heavy,
    lineHeight: 18,
    marginVertical: 4,
  },
  challengeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  challengeDaysLeftText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: Typography.weights.medium,
  },
  challengePercentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  challengeTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 8,
  },
  challengeFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  challengeStartPillBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeStartPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
  },
  challengeAthletePopout: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    width: 154,
    height: 202,
    zIndex: 4,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
  },
  calendarPill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    position: 'relative',
    minWidth: 40,
  },
  calendarPillActive: {
    backgroundColor: '#0F172A',
  },
  calendarDayText: {
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
    marginBottom: 4,
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
  },
  calendarCircleRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  calendarCircleRedText: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
  },
  calendarCirclePlain: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCirclePlainActive: {
    backgroundColor: '#FFFFFF',
  },
  calendarCirclePlainText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  calendarCirclePlainTextActive: {
    color: '#0F172A',
  },
  todayIndicatorDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  dailyReportCard: {
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dailyReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyReportTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.heavy,
  },
  dailyReportSub: {
    fontSize: 12,
    marginTop: 2,
  },
  reportStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusCompletedBadge: {
    backgroundColor: '#DCFCE7',
  },
  statusActiveBadge: {
    backgroundColor: '#E0F2FE',
  },
  statusRestBadge: {
    backgroundColor: '#F1F5F9',
  },
  statusUpcomingBadge: {
    backgroundColor: '#EEF2FF',
  },
  reportStatusText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  dailyReportMetricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  reportMetricCell: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  reportMetricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  reportMetricVal: {
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
    marginBottom: 2,
    textAlign: 'center',
  },
  reportMetricLabel: {
    fontSize: 9,
    fontWeight: Typography.weights.medium,
  },
  dailyReportActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dailyReportStartBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 14,
  },
  dailyReportStartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
  },
  dailyReportMarkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  dailyReportMarkBtnText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  dailyReportCompletedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  dailyReportCompletedBannerText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
    flex: 1,
  },
  todayWorkoutCard: {
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    marginVertical: Spacing.xs,
  },
  todayWorkoutContent: {
    flex: 1,
    zIndex: 2,
    maxWidth: '65%',
  },
  todayWorkoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayWorkoutTag: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  progressCounterPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  progressCounterText: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
  },
  todayWorkoutTitle: {
    fontSize: 17,
    fontWeight: Typography.weights.heavy,
    lineHeight: 22,
    marginBottom: 4,
  },
  advancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  advancedBadgeText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: Typography.weights.bold,
  },
  todayWorkoutSub: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  workoutMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  workoutMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  workoutMetricText: {
    fontSize: 10,
    fontWeight: Typography.weights.semiBold,
  },
  startWorkoutPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  startWorkoutPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
  },
  todayWorkoutIllustrationBox: {
    position: 'absolute',
    right: -15,
    bottom: -15,
    top: 10,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  todayWorkoutIllustration: {
    width: '100%',
    height: '100%',
  },
  todayActivityScroll: {
    paddingVertical: Spacing.xs,
    gap: 12,
  },
  activityBox: {
    width: 156,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activityBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  activityBoxTopText: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
  },
  activityCircleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  activityBoxTitle: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
  },
  activityBoxMainValue: {
    fontSize: 13,
    fontWeight: Typography.weights.heavy,
    marginTop: 2,
  },
  activityBoxSub: {
    fontSize: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  activityStartBtn: {
    width: '100%',
    paddingVertical: 7,
    borderRadius: 14,
    alignItems: 'center',
  },
  activityStartBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
  },
  dotsPaginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },
  dotItem: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotItemActive: {
    width: 16,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instantSpeedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  instantSpeedBadgeText: {
    color: '#CA8A04',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  mealSectionSubtitle: {
    fontSize: 12,
    marginBottom: 10,
    marginTop: -4,
    lineHeight: 16,
  },
  mealSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 10,
  },
  mealSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  mealSearchClearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealResultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: -2,
    paddingHorizontal: 2,
  },
  mealResultsCountText: {
    fontSize: 11,
  },
  clearFiltersText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  mealCardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 8,
  },
  mealCardActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  mealCategoriesScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  mealCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  mealCategoryChipText: {
    fontSize: 12,
    fontWeight: Typography.weights.semiBold,
  },
  mealTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mealSpeedMicroBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  mealSpeedMicroBadgeText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: Typography.weights.bold,
  },
  noMealsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
  },
  noMealsTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    marginTop: 8,
    marginBottom: 4,
  },
  noMealsSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 17,
  },
  resetMealFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetMealFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  mealsScroll: {
    paddingVertical: Spacing.xs,
    gap: 12,
  },
  planCuisineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  planCuisineBadgeText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  planSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: Spacing.sm,
  },
  planSummaryItem: {
    alignItems: 'center',
  },
  planSummaryLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  planSummaryValue: {
    fontSize: 13,
    fontWeight: Typography.weights.heavy,
  },
  planSummaryDivider: {
    width: 1,
    height: 24,
  },
  planMealsScroll: {
    paddingVertical: Spacing.xs,
    gap: 12,
  },
  planMealCard: {
    width: 230,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  planMealImgWrap: {
    width: '100%',
    height: 135,
    position: 'relative',
  },
  planMealImg: {
    width: '100%',
    height: '100%',
  },
  planMealSlotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planMealSlotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.3,
  },
  planMealPriceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planMealPriceText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
  },
  planMealEatenBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planMealEatenText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  planMealBody: {
    padding: 12,
    gap: 8,
  },
  planMealTitle: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    lineHeight: 18,
    minHeight: 36,
  },
  planMealActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  planMealRecipeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 7,
  },
  planMealRecipeBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  planMealLogBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    paddingVertical: 7,
  },
  planMealLogBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  instantMealCard: {
    width: 210,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  instantMealImgWrap: {
    width: '100%',
    height: 125,
    position: 'relative',
  },
  instantMealImg: {
    width: '100%',
    height: '100%',
  },
  mealPriceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mealPriceText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
  },
  mealTimeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mealTimeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.semiBold,
  },
  mealKcalBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mealKcalText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
  },
  instantMealBody: {
    padding: 10,
  },
  mealTierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    marginBottom: 4,
  },
  mealTierText: {
    color: '#6366F1',
    fontSize: 9,
    fontWeight: Typography.weights.bold,
  },
  instantMealName: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    marginBottom: 6,
  },
  macrosTripleRow: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 4,
    justifyContent: 'space-around',
  },
  macroPillBox: {
    alignItems: 'center',
  },
  macroPillHeader: {
    fontSize: 9,
    color: '#94A3B8',
  },
  macroPillVal: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
  },
  bodyPartsScroll: {
    paddingVertical: Spacing.xs,
    gap: 10,
  },
  bodyPartCard: {
    width: 100,
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  bodyPartImgWrap: {
    width: 70,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bodyPartAnatomyImg: {
    width: '100%',
    height: '100%',
  },
  bodyPartNameLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  enterWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  enterWaterBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  waterIntakeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  waterBarsCol: {
    width: 30,
    gap: 12,
  },
  barScaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barScaleNum: {
    fontSize: 10,
    color: '#94A3B8',
    width: 10,
  },
  barScaleDash: {
    width: 10,
    height: 1,
  },
  waterGaugeCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  waterCircularRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 6,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterPercentText: {
    fontSize: 13,
    fontWeight: Typography.weights.heavy,
    color: '#0284C7',
  },
  waterGoalSub: {
    fontSize: 9,
  },
  waterStatsCol: {
    justifyContent: 'center',
  },
  waterConsumedStat: {
    fontSize: 11,
    marginBottom: 2,
  },
  waterGoalStat: {
    fontSize: 11,
    marginBottom: 8,
  },
  waterBoldVal: {
    fontWeight: Typography.weights.bold,
  },
  waterQuickAddRow: {
    flexDirection: 'row',
    gap: 6,
  },
  waterAddChip: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  waterAddChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.heavy,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 17,
  },
  notificationToggleCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationToggleLabel: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  notificationToggleSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  timeSectionWrap: {
    width: '100%',
    marginBottom: 12,
  },
  timeSectionTitle: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    marginBottom: 6,
  },
  timeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  timeChipTextActive: {
    color: '#FFFFFF',
  },
  testNotificationBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginBottom: 12,
  },
  testNotificationBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
  },
  helpModalCard: {
    width: '100%',
    maxHeight: '82%',
    borderRadius: 24,
    padding: Spacing.md,
  },
  helpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  helpIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpModalTitle: {
    fontSize: 17,
    fontWeight: Typography.weights.heavy,
  },
  helpModalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  helpCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpScroll: {
    marginBottom: 12,
  },
  helpItemCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
  },
  helpItemEmoji: {
    fontSize: 22,
  },
  helpItemTitle: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  helpItemDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  helpContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    marginBottom: 8,
  },
  helpContactBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  helpDismissBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  helpDismissBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Typography.weights.heavy,
  },
  modalInputWrap: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modeOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: Spacing.md,
    width: '100%',
  },
  modeOptionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  modeOptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF0F0',
  },
  modeOptionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  modeOptionTitle: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
  },
  modeOptionSub: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  modalCloseSmallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  modalCloseSmallBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.heavy,
    fontSize: 13,
  },
  mealModalCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  mealModalImg: {
    width: '100%',
    height: 180,
  },
  mealModalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealModalBody: {
    padding: Spacing.md,
  },
  modalPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalPricePill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modalPricePillText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  modalTierPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modalTierPillText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
  },
  modalTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  modalTimePillText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
  },
  mealModalTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.heavy,
    marginBottom: 4,
  },
  mealModalDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  macrosTripleRowModal: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  macroBoxModal: {
    alignItems: 'center',
  },
  macroBoxModalVal: {
    fontSize: 15,
    fontWeight: Typography.weights.heavy,
  },
  macroBoxModalLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  logMealBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  logMealBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Typography.weights.heavy,
  },
  // Step 9d Weekly Points Chip
  weeklyPointsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  weeklyPointsChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notificationCountBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#DC2626',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  // Interactive Notification Center Styles
  notifInboxCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    padding: Spacing.lg,
  },
  notifInboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  notifHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifInboxTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
  },
  notifInboxBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  notifInboxBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  notifHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifHeaderIconBtn: {
    padding: 6,
  },
  notifInboxScroll: {
    marginTop: 6,
  },
  notifSettingsNotice: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 18,
  },
  notifBackBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  notifBackBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  notifSection: {
    marginBottom: 16,
  },
  notifSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  notifSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notifItemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  notifItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  notifAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  notifAvatarInitial: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  notifItemContent: {
    flex: 1,
  },
  notifItemHeadline: {
    fontSize: 13,
    lineHeight: 18,
  },
  notifQuoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#B91C1C',
    marginTop: 3,
  },
  notifMetaText: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 4,
    fontWeight: '500',
  },
  notifActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  notifDeclineBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDeclineBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifAcceptBtn: {
    flex: 1.6,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifAcceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  notifLeaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  notifLbIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifLbTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  notifLbSub: {
    fontSize: 11,
    color: '#854D0E',
    lineHeight: 16,
  },
  notifEmptyWrap: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  notifEmptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  notifEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  notifEmptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  notifStartChallengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  notifStartChallengeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  notifFooterSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 6,
  },
  notifFooterSettingsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
