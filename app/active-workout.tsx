import { Ionicons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { AnatomyBodyMap } from '../components/AnatomyBodyMap';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
  getExerciseLocalVideoAsset,
  getExerciseThumbnailAsset,
} from '../constants/exerciseImages';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCustomWorkouts } from '../context/CustomWorkoutsContext';
import { useHomeProgress } from '../context/HomeProgressContext';
import { useSettings } from '../context/SettingsContext';
import {
  ExerciseDetail,
  FAKE_WORKOUTS,
  WorkoutItem,
} from '../data/fakeData';
import { leaderboardService } from '../services/leaderboardService';
import { resolveExerciseDetail, workoutService } from '../services/workoutService';

interface LoggedSet {
  setNumber: number;
  weight: string;
  reps: string;
  isCompleted: boolean;
}

const REST_OPTIONS = [
  { label: '15 sec', value: 15 },
  { label: '30 sec', value: 30 },
  { label: '45 sec (RECOMMENDED)', value: 45 },
  { label: '1 min', value: 60 },
  { label: '2 mins', value: 120 },
  { label: '3 mins', value: 180 },
];

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workoutId?: string; exerciseId?: string }>();
  const { markTodayAsDone } = useHomeProgress();
  const { getWorkoutById } = useCustomWorkouts();
  const { settings } = useSettings();
  const { user } = useAuth();

  // Find workout or single exercise
  const targetWorkout = useMemo<WorkoutItem | null>(() => {
    if (params.workoutId) {
      const custom = getWorkoutById(params.workoutId);
      if (custom) {
        return {
          id: custom.id,
          name: custom.name,
          duration: custom.estimatedDuration,
          kcal: custom.estimatedKcal,
          level: 'Intermediate',
          category: 'Full Body',
          thumbnail: custom.exercises[0]?.thumbnail || '',
          videoUrl: '',
          exercises: custom.exercises.map((e, idx) => ({
            id: e.exerciseId || `custom-ex-${idx}`,
            name: e.name,
            sets: e.sets || 3,
            reps: String(e.reps || '12 reps'),
          })),
        };
      }
      return FAKE_WORKOUTS.find((w) => w.id === params.workoutId) || FAKE_WORKOUTS[0];
    }
    return FAKE_WORKOUTS[0];
  }, [params.workoutId, getWorkoutById]);

  // Single exercise fallback
  const singleExercise = useMemo<ExerciseDetail | null>(() => {
    if (params.exerciseId) {
      return resolveExerciseDetail(params.exerciseId);
    }
    return null;
  }, [params.exerciseId]);

  // Workout exercises list
  const exercisesList = useMemo(() => {
    if (singleExercise) {
      return [
        {
          id: singleExercise.id,
          name: singleExercise.name,
          sets: 3,
          reps: singleExercise.reps || '12 reps',
          bodyPart: singleExercise.bodyPart,
          thumbnail: singleExercise.thumbnail,
          videoUrl: singleExercise.videoUrl,
        },
      ];
    }
    return (targetWorkout?.exercises || []).map((ex) => {
      const foundDetail = resolveExerciseDetail(ex.id || ex.name);
      return {
        ...ex,
        id: foundDetail.id || ex.id,
        name: ex.name || foundDetail.name,
        bodyPart: foundDetail.bodyPart || targetWorkout?.category || 'Chest',
        thumbnail:
          foundDetail.thumbnail ||
          targetWorkout?.thumbnail ||
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
        videoUrl: foundDetail.videoUrl,
      };
    });
  }, [singleExercise, targetWorkout]);

  const [activeLoadError, setActiveLoadError] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const activeEx = exercisesList[currentExerciseIndex] || exercisesList[0];

  // Set logging state map: { [exerciseIndex]: LoggedSet[] }
  const [setsByExercise, setSetsByExercise] = useState<Record<number, LoggedSet[]>>(() => {
    const initial: Record<number, LoggedSet[]> = {};
    exercisesList.forEach((ex, idx) => {
      const count = ex.sets || 3;
      const initialSets: LoggedSet[] = [];
      for (let s = 1; s <= count; s++) {
        initialSets.push({
          setNumber: s,
          weight: '20',
          reps: '12',
          isCompleted: false,
        });
      }
      initial[idx] = initialSets;
    });
    return initial;
  });

  // Adjust state during render when switching workouts or exercises (Official React pattern)
  const routeKey = params.exerciseId || params.workoutId || 'workout';
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    setCurrentExerciseIndex(0);
    setActiveLoadError(false);
    const refreshed: Record<number, LoggedSet[]> = {};
    exercisesList.forEach((ex, idx) => {
      const count = ex.sets || 3;
      const initialSets: LoggedSet[] = [];
      for (let s = 1; s <= count; s++) {
        initialSets.push({
          setNumber: s,
          weight: '20',
          reps: '12',
          isCompleted: false,
        });
      }
      refreshed[idx] = initialSets;
    });
    setSetsByExercise(refreshed);
  }

  // Elapsed workout timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Active Exercise 30s Countdown Timer (matching Video Frame 32 & 35)
  const [exerciseTimerSeconds, setExerciseTimerSeconds] = useState(30);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(true);

  useEffect(() => {
    if (!isExerciseTimerRunning) return;
    const interval = setInterval(() => {
      setExerciseTimerSeconds((prev) => {
        if (prev <= 1) {
          return 30; // loop countdown
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isExerciseTimerRunning]);

  const activeExId = activeEx?.id;
  const activeExVideoUrl = activeEx?.videoUrl;
  const activeExName = activeEx?.name;
  const activeExBodyPart = activeEx?.bodyPart;
  const activeExThumbnail = activeEx?.thumbnail;

  const rawActiveVideoId = useMemo(() => {
    if (activeExId) return activeExId;
    if (activeExVideoUrl && !activeExVideoUrl.startsWith('http')) return activeExVideoUrl;
    return activeExName || 'shoulders_overhead_press';
  }, [activeExId, activeExVideoUrl, activeExName]);

  const currentActiveSource = useMemo(
    () => getExerciseLocalVideoAsset(rawActiveVideoId, activeExBodyPart),
    [rawActiveVideoId, activeExBodyPart]
  );

  const activePosterThumb = useMemo(() => {
    return getExerciseThumbnailAsset(rawActiveVideoId, activeExThumbnail, activeExBodyPart);
  }, [rawActiveVideoId, activeExThumbnail, activeExBodyPart]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const controlsTimeoutRef = useRef<any>(null);

  const exerciseVideoPlayer = useVideoPlayer(currentActiveSource, (p) => {
    p.loop = true;
    p.muted = isMuted;
    try {
      p.play();
    } catch (e) {
      console.warn('Active workout video play err:', e);
    }
  });

  useEventListener(exerciseVideoPlayer, 'playingChange', ({ isPlaying: playing }) => {
    setIsPlaying(playing);
  });

  const togglePlay = () => {
    if (!exerciseVideoPlayer) return;
    try {
      if (isPlaying) {
        exerciseVideoPlayer.pause();
        setIsPlaying(false);
        setShowControlsOverlay(true);
      } else {
        exerciseVideoPlayer.play();
        setIsPlaying(true);
        setShowControlsOverlay(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControlsOverlay(false);
        }, 2500);
      }
    } catch (e) {
      console.warn('togglePlay error:', e);
    }
  };

  const toggleControls = () => {
    setShowControlsOverlay((prev) => !prev);
  };

  const toggleMute = () => {
    if (!exerciseVideoPlayer) return;
    try {
      const nextMuted = !isMuted;
      // eslint-disable-next-line react-hooks/immutability
      exerciseVideoPlayer.muted = nextMuted;
      setIsMuted(nextMuted);
    } catch {}
  };

  // Screen Focus Lifecycle: Play when focused, pause when screen loses focus to free native decoder
  useFocusEffect(
    useCallback(() => {
      try {
        if (exerciseVideoPlayer) {
          exerciseVideoPlayer.play();
        }
      } catch { }

      return () => {
        try {
          exerciseVideoPlayer?.pause();
        } catch { }
      };
    }, [exerciseVideoPlayer])
  );

  const lastActiveSourceRef = useRef(currentActiveSource);
  // Keep exerciseVideoPlayer in sync when currentActiveSource changes (e.g. next/prev exercise)
  useEffect(() => {
    if (exerciseVideoPlayer && currentActiveSource && lastActiveSourceRef.current !== currentActiveSource) {
      lastActiveSourceRef.current = currentActiveSource;
      try {
        if (typeof (exerciseVideoPlayer as any).replaceAsync === 'function') {
          (exerciseVideoPlayer as any)
            .replaceAsync(currentActiveSource)
            .then(() => {
              (exerciseVideoPlayer as any).play();
            })
            .catch(() => { });
        } else if (typeof (exerciseVideoPlayer as any).replace === 'function') {
          (exerciseVideoPlayer as any).replace(currentActiveSource);
          (exerciseVideoPlayer as any).play();
        }
      } catch (e) {
        console.warn('Active workout video source update error:', e);
      }
    }
  }, [currentActiveSource, exerciseVideoPlayer]);

  useEventListener(exerciseVideoPlayer, 'statusChange', ({ status, error }) => {
    if (status === 'readyToPlay') {
      try {
        exerciseVideoPlayer.play();
      } catch { }
    } else if (status === 'error') {
      console.warn('Active workout video error:', error);
      try {
        exerciseVideoPlayer.play();
      } catch { }
    }
  });

  // Rest Timer State
  const [restDuration, setRestDuration] = useState<number>(45);
  const [showRestModal, setShowRestModal] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(45);

  useEffect(() => {
    if (!isResting) return;
    const interval = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          if (settings.workoutSettings.vibration) {
            Vibration.vibrate([0, 200, 100, 200]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isResting, settings.workoutSettings.vibration]);

  const startRestTimer = (seconds = restDuration) => {
    setRestSecondsRemaining(seconds);
    setIsResting(true);
  };

  const handleToggleSetComplete = (setIndex: number) => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      const targetSet = currentSets[setIndex];
      if (!targetSet) return prev;

      const willBeCompleted = !targetSet.isCompleted;
      currentSets[setIndex] = {
        ...targetSet,
        isCompleted: willBeCompleted,
      };

      if (willBeCompleted) {
        if (settings.workoutSettings.vibration) {
          Vibration.vibrate(50);
        }
        startRestTimer(restDuration);
      }

      return {
        ...prev,
        [currentExerciseIndex]: currentSets,
      };
    });
  };

  const handleUpdateWeight = (setIndex: number, text: string) => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      if (!currentSets[setIndex]) return prev;
      currentSets[setIndex] = { ...currentSets[setIndex], weight: text };
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  const handleUpdateReps = (setIndex: number, text: string) => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      if (!currentSets[setIndex]) return prev;
      currentSets[setIndex] = { ...currentSets[setIndex], reps: text };
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  const handleAddSet = () => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      const nextNum = currentSets.length + 1;
      const lastWeight = currentSets[currentSets.length - 1]?.weight || '20';
      const lastReps = currentSets[currentSets.length - 1]?.reps || '12';
      currentSets.push({
        setNumber: nextNum,
        weight: lastWeight,
        reps: lastReps,
        isCompleted: false,
      });
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  // Workout Summary Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [workoutSummaryStats, setWorkoutSummaryStats] = useState({
    durationStr: '00:00',
    totalSets: 0,
    totalVolumeKg: 0,
    kcalBurned: 0,
  });

  // Step 9d: Track started_at when workout screen opens
  const workoutStartedAtRef = useRef<string>(new Date().toISOString());
  const [pointsNotice, setPointsNotice] = useState<{
    status: 'awarded' | 'capped';
    text: string;
    subtext: string;
  } | null>(null);
  const [pointsAnim] = useState(() => new Animated.Value(0));

  const handleFinishWorkout = async () => {
    // 3. Mark as done becomes available only 60 seconds after the workout was started
    if (elapsedSeconds < 60) {
      Alert.alert(
        'Workout In Progress',
        `Mark as done is available once you train for at least 60 seconds (${60 - elapsedSeconds}s remaining).`
      );
      return;
    }

    let totalCompletedSets = 0;
    let volumeKg = 0;

    Object.values(setsByExercise).forEach((sets) => {
      sets.forEach((s) => {
        if (s.isCompleted) {
          totalCompletedSets++;
          const weightNum = parseFloat(s.weight) || 0;
          const repsNum = parseInt(s.reps, 10) || 0;
          volumeKg += weightNum * repsNum;
        }
      });
    });

    const calculatedKcal = Math.round(
      targetWorkout?.kcal || singleExercise?.kcal || Math.max(80, Math.round((elapsedSeconds / 60) * 8))
    );

    const stats = {
      durationStr: formatTime(elapsedSeconds),
      totalSets: totalCompletedSets,
      totalVolumeKg: Math.round(volumeKg),
      kcalBurned: calculatedKcal,
    };

    setWorkoutSummaryStats(stats);

    // Determine points status popup: +10 points or Daily limit reached
    let isCapped = false;
    if (user?.id) {
      try {
        const todayPts = await leaderboardService.getTodayDailyPoints(user.id);
        if (todayPts >= 50) {
          isCapped = true;
        }
      } catch { }
    }

    if (isCapped) {
      setPointsNotice({
        status: 'capped',
        text: 'Daily limit reached',
        subtext: 'You reached the 50 pts daily cap today. Great dedication!',
      });
    } else {
      setPointsNotice({
        status: 'awarded',
        text: '+10 points',
        subtext: 'Added to your weekly leaderboard score! 🏆',
      });
    }

    setShowSummaryModal(true);
    pointsAnim.setValue(0);
    Animated.spring(pointsAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    const workoutName = targetWorkout?.name || singleExercise?.name || 'Workout Session';
    await markTodayAsDone(workoutName, calculatedKcal);

    if (user?.id) {
      workoutService.saveSession(
        user.id,
        workoutName,
        calculatedKcal,
        targetWorkout?.id || singleExercise?.id || null,
        workoutStartedAtRef.current
      ).catch(console.warn);
    }
  };

  const handleConfirmExit = () => {
    Alert.alert(
      'Exit Workout?',
      'Are you sure you want to end your active session? Uncompleted sets will not be recorded.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const currentSets = setsByExercise[currentExerciseIndex] || [];
  const completedSetsCount = currentSets.filter((s) => s.isCompleted).length;

  // Circular timer calculations
  const timerRadius = 70;
  const timerStrokeWidth = 10;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerPercent = restDuration > 0 ? restSecondsRemaining / restDuration : 0;
  const timerStrokeDashoffset = timerCircumference - timerCircumference * timerPercent;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={handleConfirmExit}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.workoutNameText} numberOfLines={1}>
            {targetWorkout?.name || singleExercise?.name || 'Active Session'}
          </Text>
          <View style={styles.timerBadge}>
            <Ionicons name="stopwatch-outline" size={14} color={Colors.primary} />
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleFinishWorkout}
          style={[
            styles.finishHeaderBtn,
            elapsedSeconds < 60 && { opacity: 0.6, borderColor: '#CBD5E1' },
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.finishHeaderBtnText}>
            {elapsedSeconds < 60 ? `${60 - elapsedSeconds}s` : 'FINISH'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Exercise Indicator & Rest Interval Setting Button */}
        <View style={styles.exerciseNavRow}>
          <Text style={styles.exerciseCountText}>
            EXERCISE {currentExerciseIndex + 1} OF {exercisesList.length}
          </Text>

          <TouchableOpacity
            style={styles.restConfigPill}
            onPress={() => setShowRestModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="hourglass-outline" size={13} color={Colors.primary} />
            <Text style={styles.restConfigText}>Rest: {restDuration}s</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 3. Real 3D / HD Video Movement Demonstration */}
        <Card style={styles.exerciseHeroCard}>
          <View style={styles.activeVideoContainer}>
            {/* Layer 1: Instant Still Poster Underlay */}
            <Image
              source={activePosterThumb}
              style={styles.activeVideo}
              contentFit="contain"
              cachePolicy="memory-disk"
            />

            {/* Layer 2: Real Motion Video */}
            {!activeLoadError && (
              <VideoView
                style={[styles.activeVideo, StyleSheet.absoluteFill]}
                player={exerciseVideoPlayer}
                surfaceType="textureView"
                contentFit="contain"
                nativeControls={false}
              />
            )}

            {/* Layer 3: Invisible Tap-to-Toggle Overlay */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={toggleControls}
            />

            {/* Layer 4: YouTube-Style Play/Pause Center Indicator */}
            {(!isPlaying || showControlsOverlay) && (
              <View style={styles.youtubeCenterOverlay} pointerEvents="box-none">
                <TouchableOpacity
                  style={styles.youtubePlayCircle}
                  onPress={togglePlay}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={36}
                    color="#FFFFFF"
                    style={!isPlaying ? { marginLeft: 4 } : undefined}
                  />
                </TouchableOpacity>
                {!isPlaying && (
                  <Text style={styles.youtubeStatusText}>Tap to Play</Text>
                )}
              </View>
            )}

            {/* Layer 5: Bottom Quick Control Pills */}
            <View style={styles.videoControlsBottomBar}>
              <TouchableOpacity
                style={styles.videoControlPill}
                onPress={togglePlay}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={14} color="#FFFFFF" />
                <Text style={styles.videoControlPillText}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.videoControlPill}
                onPress={toggleMute}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.videoControlPillText}>
                  {isMuted ? 'Unmute' : 'Mute'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Layer 6: Tap to retry if stream fails */}
            {activeLoadError && (
              <TouchableOpacity
                style={styles.reloadOverlay}
                onPress={() => {
                  setActiveLoadError(false);
                  try {
                    exerciseVideoPlayer.replay();
                  } catch { }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={44} color="#FFFFFF" />
                <Text style={styles.reloadText}>Tap to Retry</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Reps, Weight, Step Box (matching Video Frame 32 & 35) */}
          <View style={styles.statsTableRow}>
            <View style={styles.statsTableCol}>
              <Text style={styles.statsTableLabel}>Reps</Text>
              <Text style={styles.statsTableValue}>10x</Text>
            </View>
            <View style={styles.statsTableDivider} />
            <View style={styles.statsTableCol}>
              <Text style={styles.statsTableLabel}>Weight</Text>
              <Text style={styles.statsTableValue}>20 Kg</Text>
            </View>
            <View style={styles.statsTableDivider} />
            <View style={styles.statsTableCol}>
              <Text style={styles.statsTableLabel}>Step</Text>
              <Text style={styles.statsTableValue}>
                {completedSetsCount + 1}/{currentSets.length || 3}
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. Circular Countdown Timer Card (matching Video Frame 32 & 35) */}
        <Card style={styles.bigCircularCard}>
          <View style={styles.bigCircularTimerWrap}>
            <Svg width={180} height={180}>
              <G rotation="-90" origin="90, 90">
                <Circle
                  cx={90}
                  cy={90}
                  r={74}
                  stroke="#E2E8F0"
                  strokeWidth={14}
                  fill="#000000"
                />
                <Circle
                  cx={90}
                  cy={90}
                  r={74}
                  stroke="#DC2626"
                  strokeWidth={14}
                  strokeDasharray={`${2 * Math.PI * 74} ${2 * Math.PI * 74}`}
                  strokeDashoffset={2 * Math.PI * 74 * (1 - exerciseTimerSeconds / 30)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </G>
            </Svg>

            <View style={styles.bigTimerCenterText}>
              <Text style={styles.bigTimerDigits}>
                00:{exerciseTimerSeconds < 10 ? `0${exerciseTimerSeconds}` : exerciseTimerSeconds}
              </Text>
            </View>
          </View>

          {/* Pause & Stop Buttons (matching Video Frame 32 & 35) */}
          <View style={styles.timerControlRow}>
            <TouchableOpacity
              style={styles.pauseExerciseBtn}
              onPress={() => setIsExerciseTimerRunning(!isExerciseTimerRunning)}
              activeOpacity={0.8}
            >
              <Text style={styles.pauseExerciseBtnText}>
                {isExerciseTimerRunning ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stopExerciseBtn}
              onPress={handleConfirmExit}
              activeOpacity={0.8}
            >
              <Text style={styles.stopExerciseBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 4. Circular Rest Countdown Overlay / Card (When Resting) */}
        {isResting && (
          <Card style={styles.circularRestCard}>
            <Text style={styles.restTitle}>REST INTERVAL COUNTDOWN</Text>

            <View style={styles.circularTimerWrap}>
              <Svg width={160} height={160}>
                <G rotation="-90" origin="80, 80">
                  <Circle
                    cx={80}
                    cy={80}
                    r={timerRadius}
                    stroke="#F1F5F9"
                    strokeWidth={timerStrokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={80}
                    cy={80}
                    r={timerRadius}
                    stroke={Colors.primary}
                    strokeWidth={timerStrokeWidth}
                    strokeDasharray={`${timerCircumference} ${timerCircumference}`}
                    strokeDashoffset={timerStrokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </G>
              </Svg>

              <View style={styles.circularTimerCenter}>
                <Text style={styles.circularTimerNum}>{restSecondsRemaining}</Text>
                <Text style={styles.circularTimerUnit}>SECONDS</Text>
              </View>
            </View>

            {/* Quick Adjustment Controls */}
            <View style={styles.restControlsRow}>
              <TouchableOpacity
                style={styles.restAdjBtn}
                onPress={() => setRestSecondsRemaining((prev) => Math.max(5, prev - 15))}
                activeOpacity={0.7}
              >
                <Text style={styles.restAdjBtnText}>-15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipRestBtn}
                onPress={() => setIsResting(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-skip-forward" size={16} color="#FFFFFF" />
                <Text style={styles.skipRestBtnText}>Skip Rest</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restAdjBtn}
                onPress={() => setRestSecondsRemaining((prev) => prev + 15)}
                activeOpacity={0.7}
              >
                <Text style={styles.restAdjBtnText}>+15s</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* 5. Interactive Set Logger Table */}
        <Card style={styles.setTableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { width: 44 }]}>SET</Text>
            <Text style={[styles.colHeader, { flex: 1 }]}>WEIGHT (LBS)</Text>
            <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
            <Text style={[styles.colHeader, { width: 48, textAlign: 'center' }]}>DONE</Text>
          </View>

          {currentSets.map((s, idx) => (
            <View
              key={s.setNumber}
              style={[
                styles.setRow,
                s.isCompleted && styles.setRowCompleted,
              ]}
            >
              <View style={styles.setNumberCircle}>
                <Text style={styles.setNumberText}>{s.setNumber}</Text>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.inputBox, s.isCompleted && styles.inputCompleted]}
                  value={s.weight}
                  keyboardType="numeric"
                  onChangeText={(txt) => handleUpdateWeight(idx, txt)}
                  placeholder="20"
                  placeholderTextColor={Colors.textGrey}
                />
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.inputBox, s.isCompleted && styles.inputCompleted]}
                  value={s.reps}
                  keyboardType="numeric"
                  onChangeText={(txt) => handleUpdateReps(idx, txt)}
                  placeholder="12"
                  placeholderTextColor={Colors.textGrey}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.checkBtn,
                  s.isCompleted ? styles.checkBtnDone : styles.checkBtnPending,
                ]}
                onPress={() => handleToggleSetComplete(idx)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={s.isCompleted ? 'checkmark' : 'ellipse-outline'}
                  size={20}
                  color={s.isCompleted ? '#FFFFFF' : Colors.textGrey}
                />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Set Button */}
          <TouchableOpacity
            style={styles.addSetBtn}
            onPress={handleAddSet}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.addSetBtnText}>+ Add Set</Text>
          </TouchableOpacity>
        </Card>

        {/* 6. Anatomy Muscles Visual Preview */}
        <View style={styles.anatomySection}>
          <Text style={styles.anatomyTitle}>Muscles Engaged This Movement</Text>
          <AnatomyBodyMap
            bodyPart={activeEx.bodyPart}
            height={240}
            showToggle={true}
          />
        </View>

        {/* 7. Bottom Navigation Between Exercises */}
        <View style={styles.bottomNavRow}>
          <Button
            title="‹ Previous"
            variant="secondary"
            disabled={currentExerciseIndex === 0}
            style={styles.navBtn}
            onPress={() => {
              if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex((prev) => prev - 1);
              }
            }}
          />

          {currentExerciseIndex < exercisesList.length - 1 ? (
            <Button
              title="Next Exercise ›"
              variant="primary"
              style={styles.navBtn}
              onPress={() => {
                setCurrentExerciseIndex((prev) => prev + 1);
              }}
            />
          ) : (
            <Button
              title={elapsedSeconds < 60 ? `Available in ${60 - elapsedSeconds}s` : "Finish Workout ✓"}
              variant="primary"
              disabled={elapsedSeconds < 60}
              style={elapsedSeconds < 60 ? [styles.navBtn, { opacity: 0.6 }] as any : styles.navBtn}
              onPress={handleFinishWorkout}
            />
          )}
        </View>
      </ScrollView>

      {/* Rest Interval Selection Modal (From Video) */}
      <Modal visible={showRestModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.restModalCard}>
            <View style={styles.restModalHeader}>
              <Text style={styles.restModalTitle}>Set Rest Duration</Text>
              <TouchableOpacity
                onPress={() => setShowRestModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.restModalSubtitle}>
              Choose how long you pause between sets to maximize hypertrophy and endurance.
            </Text>

            <View style={styles.restOptionsList}>
              {REST_OPTIONS.map((opt) => {
                const isSelected = restDuration === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.restOptionItem,
                      isSelected && styles.restOptionItemActive,
                    ]}
                    onPress={() => {
                      setRestDuration(opt.value);
                      setShowRestModal(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.restOptionText,
                        isSelected && styles.restOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Workout Complete Summary Modal */}
      <Modal visible={showSummaryModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.summaryModalCard}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={40} color="#FFD700" />
            </View>

            <Text style={styles.summaryModalTitle}>Workout Crushed! 🔥</Text>

            {/* Step 9d: Points Popup with animation */}
            {pointsNotice && (
              <Animated.View
                style={[
                  styles.pointsPopupBadge,
                  pointsNotice.status === 'capped'
                    ? styles.pointsPopupCapped
                    : styles.pointsPopupAwarded,
                  {
                    transform: [
                      {
                        scale: pointsAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                    ],
                    opacity: pointsAnim,
                  },
                ]}
              >
                <View style={styles.pointsPopupRow}>
                  <Ionicons
                    name={pointsNotice.status === 'capped' ? 'shield-checkmark' : 'sparkles'}
                    size={18}
                    color={pointsNotice.status === 'capped' ? '#D97706' : '#EAB308'}
                  />
                  <Text
                    style={[
                      styles.pointsPopupTitle,
                      pointsNotice.status === 'capped'
                        ? styles.pointsPopupTitleCapped
                        : styles.pointsPopupTitleAwarded,
                    ]}
                  >
                    {pointsNotice.text}
                  </Text>
                </View>
                <Text style={styles.pointsPopupSub}>{pointsNotice.subtext}</Text>
              </Animated.View>
            )}

            <Text style={styles.summaryModalSub}>
              Tremendous discipline. Your progress has been logged to your daily streak and Supabase records.
            </Text>

            <View style={styles.summaryStatsGrid}>
              <View style={styles.summaryStatBox}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.durationStr}</Text>
                <Text style={styles.summaryStatLabel}>Duration</Text>
              </View>

              <View style={styles.summaryStatBox}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.totalSets}</Text>
                <Text style={styles.summaryStatLabel}>Sets Done</Text>
              </View>

              <View style={styles.summaryStatBox}>
                <Ionicons name="barbell-outline" size={20} color={Colors.accent} />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.totalVolumeKg} LBS</Text>
                <Text style={styles.summaryStatLabel}>Volume</Text>
              </View>

              <View style={styles.summaryStatBox}>
                <Ionicons name="flame-outline" size={20} color="#EF4444" />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.kcalBurned} kcal</Text>
                <Text style={styles.summaryStatLabel}>Burned</Text>
              </View>
            </View>

            <Button
              title="Return to Home"
              variant="primary"
              onPress={() => {
                setShowSummaryModal(false);
                router.replace('/(tabs)');
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  workoutNameText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.heavy,
  },
  finishHeaderBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  finishHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 20,
  },
  exerciseNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  exerciseCountText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.5,
  },
  restConfigPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  restConfigText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  exerciseHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 0,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activeVideoContainer: {
    width: '100%',
    height: 260,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: BorderRadius.card,
    borderTopRightRadius: BorderRadius.card,
    position: 'relative',
    overflow: 'hidden',
  },
  youtubeCenterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 10,
  },
  youtubePlayCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  youtubeStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  videoControlsBottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 12,
  },
  videoControlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoControlPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  activeVideo: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: BorderRadius.card,
    borderTopRightRadius: BorderRadius.card,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  reloadOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 6,
  },
  reloadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  statsTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsTableCol: {
    alignItems: 'center',
    flex: 1,
  },
  statsTableLabel: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  statsTableValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 2,
  },
  statsTableDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  bigCircularCard: {
    backgroundColor: '#0B0F17',
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bigCircularTimerWrap: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigTimerCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigTimerDigits: {
    fontSize: 34,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  timerControlRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 14,
    marginTop: Spacing.xl,
  },
  pauseExerciseBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pauseExerciseBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  stopExerciseBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopExerciseBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  image3DWrap: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  image3D: {
    width: '100%',
    height: '100%',
  },
  modelTagOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  modelTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  exerciseInfoArea: {
    padding: Spacing.md,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activeExerciseTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    flex: 1,
  },
  bodyPartPill: {
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bodyPartPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  statBoxesRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.button,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.bold,
  },
  statBoxVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 2,
  },
  statBoxDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  circularRestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFEAEA',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  circularTimerWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    marginVertical: 4,
  },
  circularTimerCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTimerNum: {
    fontSize: 38,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  circularTimerUnit: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
    letterSpacing: 1,
  },
  restControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.md,
  },
  restAdjBtn: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restAdjBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  skipRestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  skipRestBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  setTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  setRowCompleted: {
    opacity: 0.85,
  },
  setNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  inputWrap: {
    flex: 1,
  },
  inputBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
    fontWeight: Typography.weights.semiBold,
  },
  inputCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnPending: {
    backgroundColor: '#F8F9FA',
  },
  checkBtnDone: {
    backgroundColor: '#10B981',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  addSetBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  anatomySection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  anatomyTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  bottomNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.sm,
  },
  navBtn: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  restModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
  },
  restModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restModalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  restModalSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginBottom: Spacing.lg,
  },
  restOptionsList: {
    gap: 10,
  },
  restOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: BorderRadius.button,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restOptionItemActive: {
    backgroundColor: '#FFEAEA',
    borderColor: Colors.primary,
  },
  restOptionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  restOptionTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  summaryModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  summaryModalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginBottom: 6,
  },
  summaryModalSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  summaryStatBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  summaryStatVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: Colors.textGrey,
  },
  pointsPopupBadge: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1.5,
  },
  pointsPopupAwarded: {
    backgroundColor: '#FEF9C3',
    borderColor: '#EAB308',
  },
  pointsPopupCapped: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  pointsPopupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pointsPopupTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
  },
  pointsPopupTitleAwarded: {
    color: '#854D0E',
  },
  pointsPopupTitleCapped: {
    color: '#92400E',
  },
  pointsPopupSub: {
    fontSize: Typography.sizes.xs,
    color: '#78350F',
    textAlign: 'center',
    fontWeight: '500',
  },
});
