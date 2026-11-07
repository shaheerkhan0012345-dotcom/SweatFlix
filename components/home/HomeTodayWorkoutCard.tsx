import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

  // Current day schedule
  const dayIdx = new Date().getDay();
  const todaySchedule = SCHEDULE_BY_DAY[dayIdx] || SCHEDULE_BY_DAY[1];

  // Resolve video stream asset
  const videoSource = React.useMemo(() => {
    return getExerciseVideoAsset(todaySchedule.videoKey);
  }, [todaySchedule.videoKey]);

  // Clean, seamless autoloop player with zero sound/clutter
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
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

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.outerWrapper}>
      <TouchableOpacity
        style={[
          styles.cinemaCard,
          {
            backgroundColor: isDarkMode ? '#131A29' : '#0F172A',
            borderColor: isDarkMode ? '#233048' : '#1E293B',
          },
        ]}
        onPress={handleStartWorkout}
        activeOpacity={0.94}
        accessibilityRole="button"
        accessibilityLabel={`Start Today's Workout: ${todaySchedule.title}`}
      >
        {/* Full-bleed background exercise video (Pure athlete demonstration, zero icon clutter) */}
        <View style={styles.videoStage}>
          {videoSource ? (
            <VideoView
              player={player}
              style={styles.exerciseVideo}
              surfaceType="textureView"
              contentFit="cover"
              nativeControls={false}
            />
          ) : (
            <Image
              source={todaySchedule.muscleAsset}
              style={styles.fallbackPoster}
              contentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
          )}

          {/* Smooth cinematic gradient from transparent to deep slate at bottom */}
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.1)', 'rgba(15, 23, 42, 0.65)', 'rgba(15, 23, 42, 0.96)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Top Header Strip: Day Badge */}
        <View style={styles.topHeaderStrip}>
          <View style={styles.dayBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.dayBadgeText}>
              TODAY&apos;S WORKOUT • {todaySchedule.dayName.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          {/* Main Title */}
          <Text style={styles.workoutTitle} numberOfLines={2}>
            {todaySchedule.title}
          </Text>

          {/* Target Muscles & Meta Chips */}
          <View style={styles.chipsRow}>
            <View style={styles.focusChip}>
              <Text style={styles.focusChipText}>{todaySchedule.focus}</Text>
            </View>

            <View style={styles.levelChip}>
              <Ionicons name="bar-chart-outline" size={11} color="#A5B4FC" />
              <Text style={styles.levelChipText}>{todaySchedule.level}</Text>
            </View>

            <View style={styles.dotDivider} />

            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.metricItemText}>{todaySchedule.duration} min</Text>
            </View>

            <View style={styles.metricItem}>
              <Ionicons name="flame" size={12} color={Colors.primary} />
              <Text style={[styles.metricItemText, { color: Colors.primary }]}>
                {todaySchedule.kcal} kcal
              </Text>
            </View>
          </View>

          {/* Clean Action Button */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStartWorkout}
              activeOpacity={0.88}
            >
              <Ionicons name="play" size={15} color="#FFFFFF" />
              <Text style={styles.startBtnText}>Start Workout</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.exerciseCounter}>
              <Ionicons name="fitness-outline" size={14} color="#94A3B8" />
              <Text style={styles.exerciseCounterText}>
                {todaySchedule.exercisesCount} Exercises
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 20,
  },
  cinemaCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  videoStage: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },
  exerciseVideo: {
    width: '100%',
    height: '100%',
  },
  fallbackPoster: {
    width: '100%',
    height: '100%',
  },
  topHeaderStrip: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  dayBadgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 3,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  focusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  focusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C7D2FE',
  },
  dotDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  exerciseCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  exerciseCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
});
