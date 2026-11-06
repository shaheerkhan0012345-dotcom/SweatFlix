import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/theme';
import {
  getExerciseVideoAsset,
  ANATOMY_3D_ASSETS,
  EXERCISE_3D_ASSETS,
} from '../../constants/exerciseImages';

interface DayWorkoutSchedule {
  dayName: string;
  focus: string;
  title: string;
  level: string;
  duration: number; // minutes
  exercisesCount: number;
  kcal: number;
  workoutId: string;
  videoKey: string;
  muscleAsset: any;
  targetMuscles: string[];
}

const SCHEDULE_BY_DAY: Record<number, DayWorkoutSchedule> = {
  1: {
    dayName: 'Monday',
    focus: 'Push Power',
    title: 'Chest & Triceps Power Blast',
    level: 'Advanced',
    duration: 38,
    exercisesCount: 8,
    kcal: 310,
    workoutId: 'chest-blast',
    videoKey: 'chest_incline_dumbbell_press',
    muscleAsset: ANATOMY_3D_ASSETS.chest,
    targetMuscles: ['Chest', 'Triceps', 'Front Delts'],
  },
  2: {
    dayName: 'Tuesday',
    focus: 'Pull Strength',
    title: 'Back & Biceps Muscle Engine',
    level: 'Intermediate',
    duration: 40,
    exercisesCount: 8,
    kcal: 340,
    workoutId: 'full-body-burn',
    videoKey: 'back_lat_pulldown',
    muscleAsset: ANATOMY_3D_ASSETS.back,
    targetMuscles: ['Lats', 'Biceps', 'Rhomboids'],
  },
  3: {
    dayName: 'Wednesday',
    focus: 'Lower Body',
    title: 'Leg Day & Quad Hypertrophy',
    level: 'Advanced',
    duration: 45,
    exercisesCount: 9,
    kcal: 390,
    workoutId: 'leg-day',
    videoKey: 'legs_bulgarian_split_squat',
    muscleAsset: ANATOMY_3D_ASSETS.legs,
    targetMuscles: ['Quads', 'Hamstrings', 'Glutes'],
  },
  4: {
    dayName: 'Thursday',
    focus: 'Deltoid Sculpt',
    title: 'Boulder Shoulders & Traps',
    level: 'Intermediate',
    duration: 35,
    exercisesCount: 7,
    kcal: 290,
    workoutId: 'arm-pump',
    videoKey: 'shoulders_military_press',
    muscleAsset: ANATOMY_3D_ASSETS.shoulder,
    targetMuscles: ['Deltoids', 'Trapezius', 'Core'],
  },
  5: {
    dayName: 'Friday',
    focus: 'Core Inferno',
    title: '6-Pack Abs & Core Crusher',
    level: 'Intermediate',
    duration: 32,
    exercisesCount: 8,
    kcal: 270,
    workoutId: 'core-crusher',
    videoKey: 'abs_bicycle_crunches',
    muscleAsset: ANATOMY_3D_ASSETS.abs,
    targetMuscles: ['Rectus Abs', 'Obliques', 'Serratus'],
  },
  6: {
    dayName: 'Saturday',
    focus: 'Arms Hypertrophy',
    title: 'Arm Pump & Bicep Peak',
    level: 'Advanced',
    duration: 36,
    exercisesCount: 8,
    kcal: 315,
    workoutId: 'arm-pump',
    videoKey: 'arms_barbell_bicep_curl',
    muscleAsset: ANATOMY_3D_ASSETS.biceps,
    targetMuscles: ['Biceps', 'Triceps', 'Forearms'],
  },
  0: {
    dayName: 'Sunday',
    focus: 'Metabolic HIIT',
    title: 'Full Body Burn & Cardio HIIT',
    level: 'All Levels',
    duration: 30,
    exercisesCount: 7,
    kcal: 330,
    workoutId: 'full-body-burn',
    videoKey: 'chest_pushups',
    muscleAsset: EXERCISE_3D_ASSETS.hero,
    targetMuscles: ['Full Body', 'Cardio', 'Core'],
  },
};

export const HomeTodayWorkoutCard: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const [showLiveVideo, setShowLiveVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Today's schedule
  const dayIdx = new Date().getDay();
  const todaySchedule = SCHEDULE_BY_DAY[dayIdx] || SCHEDULE_BY_DAY[1];

  // Resolve video stream URL
  const videoSource = React.useMemo(() => {
    return getExerciseVideoAsset(todaySchedule.videoKey);
  }, [todaySchedule.videoKey]);

  // Video player configuration
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = isMuted;
    try {
      p.play();
    } catch (e) {
      console.warn('Home today workout player autoplay error:', e);
    }
  });

  const handleStartWorkout = () => {
    router.push({
      pathname: '/workout-detail',
      params: { id: todaySchedule.workoutId },
    });
  };

  const toggleSound = () => {
    if (!player) return;
    const next = !isMuted;
    // eslint-disable-next-line react-hooks/immutability
    player.muted = next;
    setIsMuted(next);
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDarkMode ? '#161F30' : '#FFFFFF',
          borderColor: isDarkMode ? '#233048' : '#F1F5F9',
        },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>
            TODAY&apos;S WORKOUT • {todaySchedule.dayName.toUpperCase()}
          </Text>
        </View>

        {/* Live Demo Toggle */}
        <TouchableOpacity
          style={[
            styles.viewModeToggle,
            { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' },
          ]}
          onPress={() => setShowLiveVideo((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={showLiveVideo ? 'videocam' : 'image'}
            size={13}
            color={Colors.primary}
          />
          <Text style={[styles.viewModeToggleText, { color: colors.textSecondary }]}>
            {showLiveVideo ? 'Video' : '3D'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentAndMediaRow}>
        {/* Left Side: Workout Meta & Details */}
        <View style={styles.leftCol}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {todaySchedule.title}
          </Text>

          {/* Level Badge */}
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Ionicons name="bar-chart" size={12} color="#6366F1" />
              <Text style={styles.levelBadgeText}>{todaySchedule.level}</Text>
            </View>
            <View style={styles.focusBadge}>
              <Text style={styles.focusBadgeText}>{todaySchedule.focus}</Text>
            </View>
          </View>

          {/* Target Muscles Chips */}
          <View style={styles.muscleChipsRow}>
            {todaySchedule.targetMuscles.map((m) => (
              <View
                key={m}
                style={[
                  styles.muscleChip,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' },
                ]}
              >
                <Text style={[styles.muscleChipText, { color: colors.textSecondary }]}>
                  {m}
                </Text>
              </View>
            ))}
          </View>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                {todaySchedule.duration}m
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="barbell-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                {todaySchedule.exercisesCount} Ex
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="flame" size={13} color={Colors.primary} />
              <Text style={[styles.metricText, { color: Colors.primary }]}>
                {todaySchedule.kcal} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Right Side: High-Tech Video/3D Floating Cutout */}
        <View style={styles.rightCol}>
          <View
            style={[
              styles.mediaContainer,
              {
                backgroundColor: isDarkMode ? '#0B0F19' : '#0F172A',
                shadowColor: Colors.primary,
              },
            ]}
          >
            {showLiveVideo ? (
              <View style={styles.videoMask}>
                <VideoView
                  player={player}
                  style={styles.videoPlayer}
                  surfaceType="textureView"
                  contentFit="cover"
                  nativeControls={false}
                />
                {/* Live Badge Pill Overlay */}
                <View style={styles.liveIndicatorPill}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.liveIndicatorText}>LIVE</Text>
                </View>

                {/* Sound Toggle */}
                <TouchableOpacity
                  style={styles.soundToggleBtn}
                  onPress={toggleSound}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={13}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={todaySchedule.muscleAsset}
                style={styles.modelImage}
                contentFit="contain"
                cachePolicy="memory-disk"
                priority="high"
              />
            )}
          </View>
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startWorkoutBtn, { backgroundColor: Colors.primary }]}
        onPress={handleStartWorkout}
        activeOpacity={0.88}
      >
        <Ionicons name="play" size={16} color="#FFFFFF" />
        <Text style={styles.startWorkoutBtnText}>Start Today&apos;s Workout</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagPillText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  viewModeToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentAndMediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  leftCol: {
    flex: 1.15,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1',
  },
  focusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  focusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  muscleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  muscleChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  muscleChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rightCol: {
    flex: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaContainer: {
    width: 125,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 37, 42, 0.4)',
  },
  videoMask: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  liveIndicatorPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveIndicatorText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  soundToggleBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  startWorkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

