import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { ExerciseDetail, FAKE_EXERCISES } from '../../data/fakeData';
import { workoutService } from '../../services/workoutService';
import { getExercise3DAsset, getExerciseThumbnailAsset } from '../../constants/exerciseImages';

const BODY_PART_CHIPS = ['All', 'Shoulders', 'Chest', 'Back', 'Arms', 'Abs', 'Legs'] as const;

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTabMode, setActiveTabMode] = useState<'routine' | 'library'>('routine');
  const [exercises, setExercises] = useState<ExerciseDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('All');
  const [legsExpanded, setLegsExpanded] = useState(false);
  const [abdomenExpanded, setAbdomenExpanded] = useState(false);

  // Dynamic Day & Date Tracking: Default to today's real day of the week
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => new Date().getDay());

  // Calculate 7-day week calendar relative to current real date
  const weekCalendarDays = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon
    // Difference to reach Monday of current week
    const diffToMon = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMon);

    const days = [
      { label: 'Mon', dayIdx: 1 },
      { label: 'Tue', dayIdx: 2 },
      { label: 'Wed', dayIdx: 3 },
      { label: 'Thu', dayIdx: 4 },
      { label: 'Fri', dayIdx: 5 },
      { label: 'Sat', dayIdx: 6 },
      { label: 'Sun', dayIdx: 0 },
    ];

    return days.map((d, index) => {
      const dateObj = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
      const isToday = d.dayIdx === new Date().getDay();
      return {
        ...d,
        dateNum: dateObj.getDate(),
        isToday,
      };
    });
  }, []);

  // Canonical 7-Day Workout Routines
  const SCHEDULED_ROUTINES: Record<
    number,
    {
      dayName: string;
      title: string;
      focus: string;
      level: string;
      duration: number;
      kcal: number;
      workoutId: string;
      exercises: {
        exerciseId: string;
        name: string;
        sets: number;
        reps: number;
        weight: string;
        bodyPart: string;
        subMuscles: string;
      }[];
    }
  > = useMemo(
    () => ({
      1: {
        dayName: 'Monday',
        title: 'Chest & Triceps Power Blast',
        focus: 'Push Power',
        level: 'Advanced',
        duration: 38,
        kcal: 310,
        workoutId: 'chest-blast',
        exercises: [
          {
            exerciseId: 'chest-bench-press',
            name: 'Barbell Flat Bench Press',
            sets: 4,
            reps: 10,
            weight: '60 KG',
            bodyPart: 'Chest',
            subMuscles: 'Pectoralis Major, Triceps',
          },
          {
            exerciseId: 'chest-incline-dumbbell-press',
            name: 'Incline Dumbbell Press',
            sets: 3,
            reps: 12,
            weight: '24 KG',
            bodyPart: 'Chest',
            subMuscles: 'Upper Clavicular Head, Front Delts',
          },
          {
            exerciseId: 'arms-tricep-pushdown',
            name: 'Cable Tricep Rope Pushdown',
            sets: 3,
            reps: 12,
            weight: '25 KG',
            bodyPart: 'Arms',
            subMuscles: 'Triceps Lateral & Medial Head',
          },
          {
            exerciseId: 'chest-pushups',
            name: 'Standard Athletic Pushups',
            sets: 3,
            reps: 15,
            weight: 'Bodyweight',
            bodyPart: 'Chest',
            subMuscles: 'Chest, Anterior Deltoid, Core',
          },
        ],
      },
      2: {
        dayName: 'Tuesday',
        title: 'Back & Biceps Muscle Engine',
        focus: 'Pull Strength',
        level: 'Intermediate',
        duration: 40,
        kcal: 340,
        workoutId: 'full-body-burn',
        exercises: [
          {
            exerciseId: 'back-lat-pulldown',
            name: 'Wide-Grip Lat Pulldown',
            sets: 4,
            reps: 10,
            weight: '55 KG',
            bodyPart: 'Back',
            subMuscles: 'Latissimus Dorsi, Teres Major',
          },
          {
            exerciseId: 'back-bent-over-row',
            name: 'Barbell Bent-Over Row',
            sets: 4,
            reps: 10,
            weight: '50 KG',
            bodyPart: 'Back',
            subMuscles: 'Rhomboids, Middle Traps, Lats',
          },
          {
            exerciseId: 'arms-barbell-curl',
            name: 'Standing Barbell Bicep Curl',
            sets: 3,
            reps: 12,
            weight: '30 KG',
            bodyPart: 'Arms',
            subMuscles: 'Biceps Brachii, Brachialis',
          },
          {
            exerciseId: 'arms-hammer-curl',
            name: 'Dumbbell Hammer Curls',
            sets: 3,
            reps: 12,
            weight: '16 KG',
            bodyPart: 'Arms',
            subMuscles: 'Brachioradialis, Biceps Peak',
          },
        ],
      },
      3: {
        dayName: 'Wednesday',
        title: 'Leg Day & Quad Hypertrophy',
        focus: 'Lower Body',
        level: 'Advanced',
        duration: 45,
        kcal: 390,
        workoutId: 'leg-day',
        exercises: [
          {
            exerciseId: 'legs-squat',
            name: 'Barbell High Bar Squat',
            sets: 4,
            reps: 10,
            weight: '80 KG',
            bodyPart: 'Legs',
            subMuscles: 'Quadriceps, Glutes, Core',
          },
          {
            exerciseId: 'legs-romanian-deadlift',
            name: 'Dumbbell Romanian Deadlift',
            sets: 4,
            reps: 10,
            weight: '32 KG',
            bodyPart: 'Legs',
            subMuscles: 'Hamstrings, Posterior Chain',
          },
          {
            exerciseId: 'legs-bulgarian-split',
            name: 'Bulgarian Split Squats',
            sets: 3,
            reps: 12,
            weight: '20 KG',
            bodyPart: 'Legs',
            subMuscles: 'Gluteus Medius, Quads',
          },
          {
            exerciseId: 'legs-calf-raise',
            name: 'Standing Dumbbell Calf Raises',
            sets: 4,
            reps: 15,
            weight: '25 KG',
            bodyPart: 'Legs',
            subMuscles: 'Gastrocnemius, Soleus',
          },
        ],
      },
      4: {
        dayName: 'Thursday',
        title: 'Boulder Shoulders & Traps',
        focus: 'Deltoid Sculpt',
        level: 'Intermediate',
        duration: 35,
        kcal: 290,
        workoutId: 'arm-pump',
        exercises: [
          {
            exerciseId: 'shoulders-overhead-press',
            name: 'Overhead Dumbbell Press',
            sets: 4,
            reps: 10,
            weight: '22 KG',
            bodyPart: 'Shoulders',
            subMuscles: 'Anterior & Lateral Deltoids',
          },
          {
            exerciseId: 'shoulders-lateral-raise',
            name: 'Dumbbell Lateral Raises',
            sets: 4,
            reps: 12,
            weight: '10 KG',
            bodyPart: 'Shoulders',
            subMuscles: 'Side Deltoid Isolation',
          },
          {
            exerciseId: 'shoulders-rear-delt-fly',
            name: 'Rear Delt Dumbbell Flyes',
            sets: 3,
            reps: 12,
            weight: '12 KG',
            bodyPart: 'Shoulders',
            subMuscles: 'Posterior Deltoid, Rhomboids',
          },
        ],
      },
      5: {
        dayName: 'Friday',
        title: '6-Pack Abs & Core Crusher',
        focus: 'Core Inferno',
        level: 'Intermediate',
        duration: 32,
        kcal: 270,
        workoutId: 'core-crusher',
        exercises: [
          {
            exerciseId: 'abs-bicycle-crunches',
            name: 'Standard Abdominal Crunch',
            sets: 3,
            reps: 15,
            weight: 'Bodyweight',
            bodyPart: 'Abs',
            subMuscles: 'Rectus Abdominis, Upper Core',
          },
          {
            exerciseId: 'abs-plank',
            name: 'Forearm Core Plank Hold',
            sets: 3,
            reps: 45,
            weight: 'Secs',
            bodyPart: 'Abs',
            subMuscles: 'Transverse Abdominis, Deep Core',
          },
          {
            exerciseId: 'abs-bicycle-crunches',
            name: 'Bicycle Twist Crunches',
            sets: 3,
            reps: 20,
            weight: 'Bodyweight',
            bodyPart: 'Abs',
            subMuscles: 'Internal & External Obliques',
          },
        ],
      },
      6: {
        dayName: 'Saturday',
        title: 'Arm Pump & Bicep Peak',
        focus: 'Arms Hypertrophy',
        level: 'Advanced',
        duration: 36,
        kcal: 315,
        workoutId: 'arm-pump',
        exercises: [
          {
            exerciseId: 'arms-barbell-curl',
            name: 'Standing Barbell Bicep Curl',
            sets: 4,
            reps: 10,
            weight: '35 KG',
            bodyPart: 'Arms',
            subMuscles: 'Biceps Long & Short Head',
          },
          {
            exerciseId: 'arms-tricep-pushdown',
            name: 'Overhead Tricep Rope Extension',
            sets: 4,
            reps: 12,
            weight: '25 KG',
            bodyPart: 'Arms',
            subMuscles: 'Long Head Triceps',
          },
          {
            exerciseId: 'arms-hammer-curl',
            name: 'Cross-Body Hammer Curls',
            sets: 3,
            reps: 12,
            weight: '16 KG',
            bodyPart: 'Arms',
            subMuscles: 'Brachialis, Forearm Grip',
          },
        ],
      },
      0: {
        dayName: 'Sunday',
        title: 'Full Body Burn & Cardio HIIT',
        focus: 'Active Recovery',
        level: 'All Levels',
        duration: 30,
        kcal: 330,
        workoutId: 'full-body-burn',
        exercises: [
          {
            exerciseId: 'chest-pushups',
            name: 'Dynamic Pushups & Stretch',
            sets: 3,
            reps: 12,
            weight: 'Bodyweight',
            bodyPart: 'Chest',
            subMuscles: 'Chest, Shoulder Mobility',
          },
          {
            exerciseId: 'legs-squat',
            name: 'Bodyweight Air Squats',
            sets: 3,
            reps: 15,
            weight: 'Bodyweight',
            bodyPart: 'Legs',
            subMuscles: 'Hip Mobility, Quads',
          },
          {
            exerciseId: 'abs-plank',
            name: 'Cobra Stretch to Plank Flow',
            sets: 3,
            reps: 30,
            weight: 'Secs',
            bodyPart: 'Abs',
            subMuscles: 'Spine Decompression, Core',
          },
        ],
      },
    }),
    []
  );

  const activeRoutine = SCHEDULED_ROUTINES[selectedDayIndex] || SCHEDULED_ROUTINES[1];
  const isTodaySelected = selectedDayIndex === new Date().getDay();

  useEffect(() => {
    let isMounted = true;
    workoutService
      .getExercises()
      .then((data) => {
        if (isMounted) {
          setExercises(data);
          setIsLoading(false);
        }
      })
      .catch((e: any) => {
        console.warn('Error loading exercises:', e);
        if (isMounted) {
          setExercises(FAKE_EXERCISES);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter exercises for library tab
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesCategory =
        selectedBodyPart === 'All' || exercise.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase();
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        exercise.bodyPart.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [exercises, selectedBodyPart, searchQuery]);

  const handleOpenExerciseDetail = (exerciseId: string) => {
    router.push({
      pathname: '/exercise-detail',
      params: { id: exerciseId },
    });
  };

  return (
    <View style={styles.rootScreen}>
      <ScreenContainer
        scrollable
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 28) + 90 },
        ]}
      >
        {/* 1. Header Bar matching media_1791375057919.jpg */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Today&apos;s Workout</Text>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setActiveTabMode('library')}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/premium')}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Top View Switcher (Today's Routine vs All Movements) */}
        <View style={styles.viewModeSwitcher}>
          <TouchableOpacity
            style={[
              styles.viewModeBtn,
              activeTabMode === 'routine' && styles.viewModeBtnActive,
            ]}
            onPress={() => setActiveTabMode('routine')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.viewModeText,
                activeTabMode === 'routine' && styles.viewModeTextActive,
              ]}
            >
              Today&apos;s Routine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeBtn,
              activeTabMode === 'library' && styles.viewModeBtnActive,
            ]}
            onPress={() => setActiveTabMode('library')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.viewModeText,
                activeTabMode === 'library' && styles.viewModeTextActive,
              ]}
            >
              Exercise Library
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* VIEW 1: DYNAMIC DAILY WORKOUT ROUTINE BY REAL-TIME DATE */}
        {/* ========================================================= */}
        {activeTabMode === 'routine' ? (
          <View style={styles.timelineSection}>
            {/* 1. Horizontal 7-Day Interactive Week Calendar Strip */}
            <View style={styles.calendarStripWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.calendarStripScroll}
              >
                {weekCalendarDays.map((d) => {
                  const isSelected = d.dayIdx === selectedDayIndex;
                  return (
                    <TouchableOpacity
                      key={d.dayIdx}
                      style={[
                        styles.calendarDayChip,
                        isSelected && styles.calendarDayChipSelected,
                      ]}
                      onPress={() => setSelectedDayIndex(d.dayIdx)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`${d.label} day`}
                    >
                      <Text
                        style={[
                          styles.calendarDayName,
                          isSelected && styles.calendarDayNameSelected,
                        ]}
                      >
                        {d.label}
                      </Text>
                      <Text
                        style={[
                          styles.calendarDayDate,
                          isSelected && styles.calendarDayDateSelected,
                        ]}
                      >
                        {d.dateNum}
                      </Text>
                      {d.isToday && (
                        <View
                          style={[
                            styles.todayDot,
                            isSelected && styles.todayDotSelected,
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Selected Day Focus Summary Card */}
            <View
              style={[
                styles.dayFocusCard,
                isTodaySelected && styles.dayFocusCardToday,
              ]}
            >
              <View style={styles.dayFocusTopRow}>
                <View style={styles.dayFocusTagPill}>
                  <Text style={styles.dayFocusTagPillText}>
                    {activeRoutine.dayName.toUpperCase()} • {activeRoutine.focus.toUpperCase()}
                  </Text>
                </View>

                {isTodaySelected ? (
                  <View style={styles.todayLiveBadge}>
                    <View style={styles.todayLiveDot} />
                    <Text style={styles.todayLiveText}>TODAY&apos;S SCHEDULE</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setSelectedDayIndex(new Date().getDay())}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.jumpToTodayText}>Jump to Today</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.dayFocusTitle}>{activeRoutine.title}</Text>

              {/* Stats Bar */}
              <View style={styles.dayFocusStatsRow}>
                <View style={styles.dayFocusStatItem}>
                  <Ionicons name="time-outline" size={13} color="#64748B" />
                  <Text style={styles.dayFocusStatText}>{activeRoutine.duration} min</Text>
                </View>

                <View style={styles.dayFocusStatItem}>
                  <Ionicons name="flame" size={13} color={Colors.primary} />
                  <Text style={[styles.dayFocusStatText, { color: Colors.primary }]}>
                    {activeRoutine.kcal} kcal
                  </Text>
                </View>

                <View style={styles.dayFocusStatItem}>
                  <Ionicons name="barbell-outline" size={13} color="#64748B" />
                  <Text style={styles.dayFocusStatText}>
                    {activeRoutine.exercises.length} Exercises
                  </Text>
                </View>

                <View style={styles.dayFocusStatItem}>
                  <Ionicons name="shield-checkmark-outline" size={13} color="#6366F1" />
                  <Text style={[styles.dayFocusStatText, { color: '#6366F1' }]}>
                    {activeRoutine.level}
                  </Text>
                </View>
              </View>

              {/* Start Routine CTA */}
              <TouchableOpacity
                style={styles.startDayRoutineBtn}
                onPress={() =>
                  router.push({
                    pathname: '/workout-detail',
                    params: { id: activeRoutine.workoutId },
                  })
                }
                activeOpacity={0.88}
              >
                <Ionicons name="play" size={15} color="#FFFFFF" />
                <Text style={styles.startDayRoutineBtnText}>
                  Start {activeRoutine.dayName}&apos;s Workout
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 3. Dynamic Daily Routine Timeline Exercises */}
            <View style={styles.timelineContainer}>
              <View style={styles.verticalSpineLine} />

              {activeRoutine.exercises.map((ex, index) => {
                const exercise3D =
                  getExerciseThumbnailAsset(ex.exerciseId) ||
                  getExerciseThumbnailAsset(ex.name) ||
                  getExercise3DAsset(ex.bodyPart, ex.name);

                return (
                  <Animated.View
                    key={`${ex.exerciseId}-${index}`}
                    entering={FadeInDown.delay(index * 45).duration(300)}
                    style={styles.timelineNode}
                  >
                    <View style={styles.timelineDot} />

                    <View style={styles.referenceCard}>
                      <TouchableOpacity
                        style={styles.cardUpperSection}
                        onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                        activeOpacity={0.88}
                      >
                        {/* 3D Movement Figure */}
                        <View style={styles.characterContainer}>
                          <Image
                            source={exercise3D}
                            style={styles.characterImg}
                            contentFit="contain"
                            cachePolicy="memory-disk"
                            priority="high"
                          />
                        </View>

                        {/* Right Info + Sets Table */}
                        <View style={styles.cardContentRight}>
                          <View style={styles.cardTitleRow}>
                            <Text style={styles.referenceTitle} numberOfLines={2}>
                              {ex.name}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="ellipsis-vertical" size={16} color="#94A3B8" />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.muscleBadgeRow}>
                            <View style={styles.muscleTagPill}>
                              <Text style={styles.muscleTagPillText}>{ex.bodyPart}</Text>
                            </View>
                            <Text style={styles.subMuscleLabel} numberOfLines={1}>
                              {ex.subMuscles}
                            </Text>
                          </View>

                          <View style={styles.tableExact}>
                            <View style={styles.tableExactHead}>
                              <Text style={styles.tableExactHeadCell}>Set</Text>
                              <Text style={styles.tableExactHeadCell}>Reps</Text>
                              <Text style={styles.tableExactHeadCell}>Weight</Text>
                            </View>
                            {Array.from({ length: ex.sets }).map((_, sIdx) => (
                              <View key={sIdx} style={styles.tableExactRow}>
                                <Text style={styles.tableExactDataCell}>{sIdx + 1}</Text>
                                <Text style={styles.tableExactDataCell}>{ex.reps}</Text>
                                <Text style={styles.tableExactDataCell}>{ex.weight}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Full-Width Start Now Button */}
                      <TouchableOpacity
                        style={styles.fullWidthStartBtn}
                        onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.fullWidthStartText}>Start Exercise</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              })}
            </View>

            {/* 4. Optional Bonus Work: Add Core or Mobility Section */}
            <TouchableOpacity
              style={styles.categoryDividerRow}
              onPress={() => setAbdomenExpanded(!abdomenExpanded)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.categoryDividerTitle}>OPTIONAL BONUS CORE FINISHER</Text>
                <View style={styles.addCategoryBtn}>
                  <Text style={styles.addCategoryBtnText}>
                    {abdomenExpanded ? 'Hide' : '+ View Bonus'}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={abdomenExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>

            {abdomenExpanded && (
              <View style={styles.timelineContainer}>
                <View style={styles.verticalSpineLine} />
                {[
                  {
                    exerciseId: 'abs-bicycle-crunches',
                    name: 'Standard Abdominal Crunch',
                    sets: 3,
                    reps: 15,
                    weight: 'Bodyweight',
                    bodyPart: 'Abs',
                    subMuscles: 'Rectus Abdominis',
                  },
                  {
                    exerciseId: 'abs-plank',
                    name: 'Forearm Core Plank Hold',
                    sets: 3,
                    reps: 30,
                    weight: 'Secs',
                    bodyPart: 'Abs',
                    subMuscles: 'Transverse Abdominis',
                  },
                ].map((ex, index) => {
                  const exercise3D =
                    getExerciseThumbnailAsset(ex.exerciseId) ||
                    getExerciseThumbnailAsset(ex.name) ||
                    getExercise3DAsset(ex.bodyPart, ex.name);
                  return (
                    <Animated.View
                      key={`bonus-${ex.exerciseId}-${index}`}
                      entering={FadeInDown.delay(index * 40).duration(250)}
                      style={styles.timelineNode}
                    >
                      <View style={styles.timelineDot} />
                      <View style={styles.referenceCard}>
                        <TouchableOpacity
                          style={styles.cardUpperSection}
                          onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                          activeOpacity={0.88}
                        >
                          <View style={styles.characterContainer}>
                            <Image
                              source={exercise3D}
                              style={styles.characterImg}
                              contentFit="contain"
                              cachePolicy="memory-disk"
                              priority="high"
                            />
                          </View>
                          <View style={styles.cardContentRight}>
                            <View style={styles.cardTitleRow}>
                              <Text style={styles.referenceTitle} numberOfLines={2}>
                                {ex.name}
                              </Text>
                              <Ionicons name="ellipsis-vertical" size={16} color="#94A3B8" />
                            </View>
                            <View style={styles.muscleBadgeRow}>
                              <View style={styles.muscleTagPill}>
                                <Text style={styles.muscleTagPillText}>{ex.bodyPart}</Text>
                              </View>
                              <Text style={styles.subMuscleLabel} numberOfLines={1}>
                                {ex.subMuscles}
                              </Text>
                            </View>
                            <View style={styles.tableExact}>
                              <View style={styles.tableExactHead}>
                                <Text style={styles.tableExactHeadCell}>Set</Text>
                                <Text style={styles.tableExactHeadCell}>Reps</Text>
                                <Text style={styles.tableExactHeadCell}>Weight</Text>
                              </View>
                              {Array.from({ length: ex.sets }).map((_, sIdx) => (
                                <View key={sIdx} style={styles.tableExactRow}>
                                  <Text style={styles.tableExactDataCell}>{sIdx + 1}</Text>
                                  <Text style={styles.tableExactDataCell}>{ex.reps}</Text>
                                  <Text style={styles.tableExactDataCell}>{ex.weight}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.fullWidthStartBtn}
                          onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.fullWidthStartText}>Start Exercise</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          /* ========================================================= */
          /* VIEW 2: EXERCISE LIBRARY WITH SEARCH & MUSCLE CHIPS */
          /* ========================================================= */
          <View style={styles.librarySection}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.textGrey} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by movement or muscle..."
                placeholderTextColor={Colors.textGrey}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={18} color={Colors.textGrey} />
                </TouchableOpacity>
              )}
            </View>

            {/* Body Part Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {BODY_PART_CHIPS.map((chip) => {
                const isSelected = selectedBodyPart === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    activeOpacity={0.8}
                    onPress={() => setSelectedBodyPart(chip)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Exercises List in library */}
            {isLoading ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading 3D movements...</Text>
              </View>
            ) : (
              filteredExercises.map((item) => {
                const exerciseImg =
                  getExerciseThumbnailAsset(item.id) ||
                  getExercise3DAsset(item.bodyPart, item.name || item.thumbnail);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.libraryCard}
                    onPress={() => handleOpenExerciseDetail(item.id)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.libraryImgWrap}>
                      <Image
                        source={exerciseImg}
                        style={styles.libraryImg}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                        priority="high"
                      />
                    </View>

                    <View style={styles.libraryCardContent}>
                      <Text style={styles.libraryTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.libraryMetaRow}>
                        <View style={styles.muscleTagPill}>
                          <Text style={styles.muscleTagPillText}>{item.bodyPart}</Text>
                        </View>
                        <Text style={styles.libraryMetaText}>{item.level}</Text>
                        <Text style={styles.libraryMetaText}>~{item.kcal} kcal</Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  rootScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  viewModeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textGrey,
  },
  viewModeTextActive: {
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
  },
  timelineSection: {
    marginTop: Spacing.xs,
  },
  calendarStripWrapper: {
    marginBottom: 14,
  },
  calendarStripScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  calendarDayChip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  calendarDayChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  calendarDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  calendarDayNameSelected: {
    color: '#94A3B8',
  },
  calendarDayDate: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  calendarDayDateSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
  todayDotSelected: {
    backgroundColor: '#38BDF8',
  },
  dayFocusCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  dayFocusCardToday: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECDD3',
  },
  dayFocusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayFocusTagPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dayFocusTagPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  todayLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  todayLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  todayLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  jumpToTodayText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dayFocusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    lineHeight: 23,
  },
  dayFocusStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dayFocusStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayFocusStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  startDayRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  startDayRoutineBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 28,
  },
  verticalSpineLine: {
    position: 'absolute',
    left: 8,
    top: 15,
    bottom: 15,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  timelineNode: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  timelineDot: {
    position: 'absolute',
    left: -26,
    top: 36,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#94A3B8',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  referenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardUpperSection: {
    flexDirection: 'row',
    gap: 12,
  },
  characterContainer: {
    width: 95,
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImg: {
    width: '100%',
    height: '100%',
  },
  cardContentRight: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    flex: 1,
    lineHeight: 18,
  },
  muscleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  muscleTagPill: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  muscleTagPillText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  subMuscleLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    flex: 1,
  },
  tableExact: {
    marginTop: 2,
  },
  tableExactHead: {
    flexDirection: 'row',
    paddingBottom: 2,
  },
  tableExactHeadCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textGrey,
  },
  tableExactRow: {
    flexDirection: 'row',
    paddingVertical: 1.5,
  },
  tableExactDataCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  fullWidthStartBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidthStartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  categoryDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  categoryDividerTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  addCategoryBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  addCategoryBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  exactSpecialOfferBanner: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E5252A',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exactOfferTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  exactCrownBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FF8A1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exactOfferTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Typography.weights.heavy,
  },
  exactOfferPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  exactOfferPriceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: Typography.weights.bold,
  },
  exactOfferPriceStriked: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: Typography.weights.regular,
  },
  exactOfferArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exactOfferSubText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  librarySection: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  chipsScroll: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: '#F1F5F9',
  },
  chipText: {
    fontSize: 12,
    fontWeight: Typography.weights.semiBold,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
  },
  chipTextUnselected: {
    color: Colors.textGrey,
  },
  centerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    color: Colors.textGrey,
    fontSize: 13,
  },
  libraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  libraryImgWrap: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  libraryImg: {
    width: '90%',
    height: '90%',
  },
  libraryCardContent: {
    flex: 1,
  },
  libraryTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 4,
  },
  libraryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  libraryMetaText: {
    fontSize: 11,
    color: Colors.textGrey,
  },
});
