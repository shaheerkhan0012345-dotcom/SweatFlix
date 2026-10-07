import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CircularProgress } from '../../components/CircularProgress';
import { WorkoutVideoPlayer } from '../../components/WorkoutVideoPlayer';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  useHomeProgress,
  getTodayDayIndex,
} from '../../context/HomeProgressContext';
import { useCustomWorkouts } from '../../context/CustomWorkoutsContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import {
  FAKE_WORKOUTS,
  FAKE_CHALLENGES,
  WorkoutItem,
} from '../../data/fakeData';
import { EXERCISE_3D_ASSETS } from '../../constants/exerciseImages';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BODY_PARTS_LIST = [
  { id: 'Chest', name: 'CHEST', image: EXERCISE_3D_ASSETS.Chest, exercisesCount: 6 },
  { id: 'Back', name: 'BACK', image: EXERCISE_3D_ASSETS.Back, exercisesCount: 6 },
  { id: 'Shoulders', name: 'SHOULDERS', image: EXERCISE_3D_ASSETS.Shoulders, exercisesCount: 6 },
  { id: 'Arms', name: 'ARMS', image: EXERCISE_3D_ASSETS.Arms, exercisesCount: 6 },
  { id: 'Legs', name: 'LEGS', image: EXERCISE_3D_ASSETS.Legs, exercisesCount: 6 },
  { id: 'Abs', name: 'ABS', image: EXERCISE_3D_ASSETS.Abs, exercisesCount: 6 },
];

const HEALTHY_MEALS = [
  {
    id: 'meal-1',
    name: 'Protein Berry Oats',
    kcal: 340,
    protein: 30,
    carbs: 45,
    fat: 4,
    desc: 'Oats with whey protein & fresh blueberries',
  },
  {
    id: 'meal-2',
    name: 'Grilled Salmon Bowl',
    kcal: 480,
    protein: 42,
    carbs: 32,
    fat: 16,
    desc: 'Wild salmon, quinoa, sweet potato & greens',
  },
  {
    id: 'meal-3',
    name: 'Avocado Egg Toast',
    kcal: 310,
    protein: 18,
    carbs: 26,
    fat: 14,
    desc: '2 poached eggs, smashed avocado & sourdough',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { state: onboardingState } = useOnboarding();
  const { progress, isTodayDone, markTodayAsDone, resetProgress } = useHomeProgress();
  const { customWorkouts } = useCustomWorkouts();
  const { settings } = useSettings();
  const { profile } = useAuth();
  const {
    metrics,
    addWater,
    resetWater,
    logMeal,
    logWeight,
    bmi,
    bmiCategory,
  } = useHealthMetrics();

  const weeklyTarget = settings.workoutSettings.weeklyGoal || progress.weeklyTarget;
  const userName = profile?.name || settings.name || 'Athlete';
  const todayIndex = getTodayDayIndex();

  // Mode Switch (Gym vs Home)
  const [trainingMode, setTrainingMode] = useState<'gym' | 'home'>('gym');
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Modals for Quick Logging
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foodCaloriesInput, setFoodCaloriesInput] = useState('');
  const [foodProteinInput, setFoodProteinInput] = useState('');
  const [foodCarbsInput, setFoodCarbsInput] = useState('');
  const [foodFatInput, setFoodFatInput] = useState('');

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState(metrics.currentWeightKg.toString());

  // Pick workout based on saved onboarding body focus
  const recommendedWorkout = useMemo<WorkoutItem>(() => {
    const focusList = onboardingState.bodyFocus || [];
    if (focusList.includes('Chest')) {
      return FAKE_WORKOUTS.find((w) => w.id === 'chest-blast') || FAKE_WORKOUTS[0];
    }
    if (focusList.includes('Abs')) {
      return FAKE_WORKOUTS.find((w) => w.id === 'core-crusher') || FAKE_WORKOUTS[0];
    }
    if (focusList.includes('Legs')) {
      return FAKE_WORKOUTS.find((w) => w.id === 'leg-day') || FAKE_WORKOUTS[0];
    }
    if (focusList.includes('Arms') || focusList.includes('Shoulders')) {
      return FAKE_WORKOUTS.find((w) => w.id === 'arm-pump') || FAKE_WORKOUTS[0];
    }
    return FAKE_WORKOUTS.find((w) => w.id === 'full-body-burn') || FAKE_WORKOUTS[0];
  }, [onboardingState.bodyFocus]);

  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutItem>(recommendedWorkout);
  const activeWorkout = selectedWorkout || recommendedWorkout;

  const activeChallenge = FAKE_CHALLENGES[0];
  const challengePercent = Math.min(
    (progress.challengeDay / progress.challengeTotalDays) * 100,
    100
  );

  const handleStartLiveWorkout = () => {
    router.push({
      pathname: '/active-workout' as any,
      params: { workoutId: activeWorkout.id },
    });
  };

  const handleOpenWorkoutDetail = (id: string) => {
    router.push({
      pathname: '/workout-detail',
      params: { id },
    });
  };

  const handleMarkAsDoneOffline = async () => {
    const success = await markTodayAsDone(activeWorkout.name, activeWorkout.kcal);
    if (success) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    }
  };

  const handleSaveFood = async () => {
    const cal = parseInt(foodCaloriesInput, 10) || 0;
    const p = parseInt(foodProteinInput, 10) || 0;
    const c = parseInt(foodCarbsInput, 10) || 0;
    const f = parseInt(foodFatInput, 10) || 0;

    if (cal > 0 || p > 0 || c > 0 || f > 0) {
      await logMeal(cal, p, c, f);
    }

    setFoodCaloriesInput('');
    setFoodProteinInput('');
    setFoodCarbsInput('');
    setFoodFatInput('');
    setShowFoodModal(false);
  };

  const handleQuickLogHealthyMeal = async (meal: typeof HEALTHY_MEALS[0]) => {
    await logMeal(meal.kcal, meal.protein, meal.carbs, meal.fat);
  };

  const handleSaveWeight = async () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 20 && w < 300) {
      await logWeight(w);
    }
    setShowWeightModal(false);
  };

  // Water calculations
  const cupsCount = 8;
  const cupsFilled = Math.min(cupsCount, Math.floor((metrics.waterIntakeMl / metrics.waterTargetMl) * cupsCount));

  // Calories & Macros calculations
  const caloriesRemaining = Math.max(0, metrics.caloriesTarget - metrics.caloriesConsumed);
  const proteinPercent = Math.min(100, Math.round((metrics.proteinGrams / metrics.proteinTarget) * 100));
  const carbsPercent = Math.min(100, Math.round((metrics.carbsGrams / metrics.carbsTarget) * 100));
  const fatPercent = Math.min(100, Math.round((metrics.fatGrams / metrics.fatTarget) * 100));

  return (
    <ScreenContainer scrollable edges={['left', 'right']} contentContainerStyle={styles.container}>
      {/* 1. Header with Mode Toggle & Streak Badge (From Video) */}
      <View style={styles.topHeaderRow}>
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingTitle}>Hey, {userName} 👋</Text>
          <Text style={styles.greetingSub}>Ready to transform today?</Text>
        </View>

        {/* Gym / Home Mode Switch */}
        <View style={styles.modeSwitchWrap}>
          <TouchableOpacity
            style={[styles.modeBtn, trainingMode === 'gym' && styles.modeBtnActive]}
            onPress={() => setTrainingMode('gym')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, trainingMode === 'gym' && styles.modeBtnTextActive]}>
              🏋️ Gym
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, trainingMode === 'home' && styles.modeBtnActive]}
            onPress={() => setTrainingMode('home')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, trainingMode === 'home' && styles.modeBtnTextActive]}>
              🏠 Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Strip (Mon–Sun) with Today Highlight */}
      <View style={styles.dateStrip}>
        {DAYS_OF_WEEK.map((dayName, index) => {
          const isDone = progress.completedDays.includes(index);
          const isToday = index === todayIndex;
          const dayNumber = 12 + index;

          return (
            <View
              key={dayName}
              style={[
                styles.dateStripItem,
                isToday && styles.dateStripItemToday,
                isDone && styles.dateStripItemDone,
              ]}
            >
              <Text
                style={[
                  styles.dateStripDay,
                  isToday && styles.dateStripDayToday,
                  isDone && styles.dateStripDayDone,
                ]}
              >
                {dayName}
              </Text>
              <Text
                style={[
                  styles.dateStripNum,
                  isToday && styles.dateStripNumToday,
                  isDone && styles.dateStripNumDone,
                ]}
              >
                {dayNumber}
              </Text>
              {isDone && (
                <View style={styles.dateDoneCheck}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Celebration Banner */}
      {showCelebration && (
        <View style={styles.celebrationCard}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <View style={styles.celebrationTextWrap}>
            <Text style={styles.celebrationTitle}>Workout Crushed! 🔥</Text>
            <Text style={styles.celebrationSub}>
              Today&apos;s routine recorded! Consistency streak updated.
            </Text>
          </View>
        </View>
      )}

      {/* 2. Hero 3D Workout Card "Ready to train!" (From Video) */}
      <Card style={styles.heroCard}>
        <View style={styles.heroImageWrap}>
          <Image
            source={EXERCISE_3D_ASSETS.hero}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroProBadge}>
              <Text style={styles.heroProBadgeText}>TODAY&apos;S WORKOUT</Text>
            </View>
            <View style={styles.heroModeBadge}>
              <Text style={styles.heroModeBadgeText}>
                {trainingMode.toUpperCase()} EDITION
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroTitleRow}>
            <View>
              <Text style={styles.heroMainTitle}>Ready to train!</Text>
              <Text style={styles.heroWorkoutName}>{activeWorkout.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.overviewBtn}
              onPress={() => setShowOverviewModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={16} color={Colors.primary} />
              <Text style={styles.overviewBtnText}>Overview</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics */}
          <View style={styles.heroMetricsRow}>
            <View style={styles.heroMetricItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textGrey} />
              <Text style={styles.heroMetricText}>{activeWorkout.duration} mins</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Ionicons name="flame-outline" size={14} color={Colors.primary} />
              <Text style={styles.heroMetricText}>{activeWorkout.kcal} kcal</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Ionicons name="barbell-outline" size={14} color={Colors.accent} />
              <Text style={styles.heroMetricText}>{activeWorkout.exercises.length} Exercises</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.heroActionRow}>
            <Button
              title="Start Live Workout ▶"
              variant="primary"
              style={styles.heroStartBtn}
              onPress={handleStartLiveWorkout}
            />
            <TouchableOpacity
              style={styles.heroRoutineBtn}
              onPress={() => handleOpenWorkoutDetail(activeWorkout.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroRoutineBtnText}>View Routine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* 3. Body Parts Anatomy Carousel (From Video) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Body Parts Anatomy</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/explore')}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bodyPartsScroll}
      >
        {BODY_PARTS_LIST.map((part) => (
          <TouchableOpacity
            key={part.id}
            style={styles.bodyPartCard}
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.85}
          >
            <Image
              source={part.image}
              style={styles.bodyPartImage}
              resizeMode="cover"
            />
            <View style={styles.bodyPartCardOverlay}>
              <Text style={styles.bodyPartNameText}>{part.name}</Text>
              <Text style={styles.bodyPartSubText}>{part.exercisesCount} Exercises</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 4. Today Activity Carousel (Workout, Water, Steps, Diet, Fasting, Breathing, Meditation) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Today Activity</Text>
        <Text style={styles.sectionSubBadge}>7 Metrics</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activityScroll}
      >
        {/* Workout Activity Card */}
        <Card style={styles.activityCard}>
          <View style={[styles.activityIconCircle, { backgroundColor: '#FFEAEA' }]}>
            <Ionicons name="barbell" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.activityLabel}>Workout</Text>
          <Text style={styles.activityValue}>
            {isTodayDone ? 'Completed' : `${activeWorkout.duration} min`}
          </Text>
          <Text style={styles.activitySub}>
            {isTodayDone ? 'Great job!' : 'Pending session'}
          </Text>
        </Card>

        {/* Water Activity Card */}
        <Card style={styles.activityCard}>
          <View style={[styles.activityIconCircle, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="water" size={20} color="#0284C7" />
          </View>
          <Text style={styles.activityLabel}>Hydration</Text>
          <Text style={styles.activityValue}>{metrics.waterIntakeMl} ml</Text>
          <TouchableOpacity
            onPress={() => addWater(250)}
            style={styles.activityActionBtn}
          >
            <Text style={styles.activityActionText}>+250ml</Text>
          </TouchableOpacity>
        </Card>

        {/* Steps Activity Card */}
        <Card style={styles.activityCard}>
          <View style={[styles.activityIconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="walk" size={20} color="#16A34A" />
          </View>
          <Text style={styles.activityLabel}>Daily Steps</Text>
          <Text style={styles.activityValue}>6,420</Text>
          <Text style={styles.activitySub}>Goal: 10,000</Text>
        </Card>

        {/* Diet Plan Activity Card */}
        <Card style={styles.activityCard}>
          <View style={[styles.activityIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="restaurant" size={20} color="#D97706" />
          </View>
          <Text style={styles.activityLabel}>Diet Plan</Text>
          <Text style={styles.activityValue}>{metrics.caloriesConsumed} kcal</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/diet')}
            style={styles.activityActionBtn}
          >
            <Text style={styles.activityActionText}>View Diet</Text>
          </TouchableOpacity>
        </Card>

        {/* Fasting Activity Card */}
        <Card style={styles.activityCard}>
          <View style={[styles.activityIconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="time" size={20} color="#9333EA" />
          </View>
          <Text style={styles.activityLabel}>Fasting</Text>
          <Text style={styles.activityValue}>14h 20m</Text>
          <Text style={styles.activitySub}>16:8 Protocol</Text>
        </Card>

        {/* Breathing Card */}
        <Card style={styles.activityCard}>
          <View style={[styles.activityIconCircle, { backgroundColor: '#FFE4E6' }]}>
            <Ionicons name="leaf" size={20} color="#E11D48" />
          </View>
          <Text style={styles.activityLabel}>Breathing</Text>
          <Text style={styles.activityValue}>4-7-8 Drill</Text>
          <Text style={styles.activitySub}>Relaxation</Text>
        </Card>
      </ScrollView>

      {/* 5. Instant Healthy Meals Carousel (From Video) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Instant Healthy Meals</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/diet')}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Diet Tab →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealsScroll}
      >
        {HEALTHY_MEALS.map((meal) => (
          <Card key={meal.id} style={styles.healthyMealCard}>
            <View style={styles.mealCardTopRow}>
              <View style={styles.mealIconCircleSmall}>
                <Ionicons name="nutrition" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.mealKcalTag}>{meal.kcal} Kcal</Text>
            </View>

            <Text style={styles.healthyMealTitle}>{meal.name}</Text>
            <Text style={styles.healthyMealDesc}>{meal.desc}</Text>

            <View style={styles.healthyMealMacrosRow}>
              <Text style={styles.healthyMacroText}>P: {meal.protein}g</Text>
              <Text style={styles.healthyMacroText}>C: {meal.carbs}g</Text>
              <Text style={styles.healthyMacroText}>F: {meal.fat}g</Text>
            </View>

            <TouchableOpacity
              style={styles.quickAddMealBtn}
              onPress={() => handleQuickLogHealthyMeal(meal)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
              <Text style={styles.quickAddMealText}>+ Quick Log</Text>
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>

      {/* 6. Active Challenges Carousel */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        <Text style={styles.sectionSubBadge}>Discipline</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.challengeCard}
        onPress={() => {
          const absWorkout = FAKE_WORKOUTS.find((w) => w.id === 'core-crusher');
          if (absWorkout) setSelectedWorkout(absWorkout);
        }}
      >
        <View style={styles.challengeTop}>
          <View>
            <View style={styles.challengeBadge}>
              <Text style={styles.challengeBadgeText}>30-DAY FAT BURN</Text>
            </View>
            <Text style={styles.challengeTitle}>{activeChallenge.title}</Text>
          </View>
          <Text style={styles.challengeDayCount}>
            Day {progress.challengeDay} of {progress.challengeTotalDays}
          </Text>
        </View>

        <Text style={styles.challengeDesc}>{activeChallenge.description}</Text>

        <View style={styles.challengeProgressTrack}>
          <View
            style={[styles.challengeProgressFill, { width: `${challengePercent}%` }]}
          />
        </View>

        <View style={styles.challengeFooter}>
          <Text style={styles.challengePercentText}>
            {Math.round(challengePercent)}% Complete
          </Text>
          <View style={styles.challengeContinueButton}>
            <Text style={styles.challengeContinueText}>Continue Challenge →</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 7. My Custom Routines Carousel */}
      <View style={styles.myWorkoutsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>My Workout Routines</Text>
          <Text style={styles.sectionSubText}>
            {customWorkouts.length > 0
              ? `${customWorkouts.length} custom routine${customWorkouts.length > 1 ? 's' : ''}`
              : 'Create custom routine'}
          </Text>
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {customWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/workout-detail',
                  params: { id: workout.id },
                })
              }
              style={styles.workoutCard}
            >
              <Image
                source={{
                  uri:
                    workout.exercises[0]?.thumbnail ||
                    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
                }}
                style={styles.workoutThumbnail}
                resizeMode="cover"
              />
              <View style={styles.workoutCardBadge}>
                <Text style={styles.workoutCardBadgeText}>
                  {workout.exercises.length} EXERCISES
                </Text>
              </View>

              <View style={styles.workoutCardBody}>
                <Text style={styles.workoutCardTitle} numberOfLines={1}>
                  {workout.name}
                </Text>
                <View style={styles.workoutCardMeta}>
                  <Text style={styles.workoutCardMetaText}>
                    ⏱ ~{workout.estimatedDuration}m
                  </Text>
                  <Text style={styles.workoutCardMetaText}>
                    🔥 ~{workout.estimatedKcal} kcal
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* + Create Workout Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/create-workout')}
            style={styles.createCard}
          >
            <View style={styles.createPlusCircle}>
              <Ionicons name="add" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.createTitle}>+ Create</Text>
            <Text style={styles.createSub}>Build custom routine</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* "Ready to Train!" Overview Modal (From Video) */}
      <Modal visible={showOverviewModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalHeading}>Daily Routine Overview</Text>
              <TouchableOpacity onPress={() => setShowOverviewModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.overviewRoutineTitle}>{activeWorkout.name}</Text>
              <Text style={styles.overviewRoutineSub}>
                Estimated: {activeWorkout.duration} mins • ~{activeWorkout.kcal} kcal • {activeWorkout.exercises.length} movements
              </Text>

              <View style={styles.overviewExerciseList}>
                {activeWorkout.exercises.map((ex, idx) => (
                  <View key={ex.id} style={styles.overviewExerciseItem}>
                    <View style={styles.overviewIndexCircle}>
                      <Text style={styles.overviewIndexText}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.overviewExName}>{ex.name}</Text>
                      <Text style={styles.overviewExMeta}>{ex.sets} sets × {ex.reps}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Button
                title="Start This Workout Now ▶"
                variant="primary"
                style={{ marginTop: Spacing.md }}
                onPress={() => {
                  setShowOverviewModal(false);
                  handleStartLiveWorkout();
                }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 30,
    backgroundColor: '#FFFFFF',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  greetingWrap: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  greetingSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },
  modeSwitchWrap: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  dateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dateStripItem: {
    width: 44,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  dateStripItemToday: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  dateStripItemDone: {
    borderColor: '#10B981',
  },
  dateStripDay: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
    color: Colors.textGrey,
  },
  dateStripDayToday: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
  },
  dateStripDayDone: {
    color: '#10B981',
  },
  dateStripNum: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 2,
  },
  dateStripNumToday: {
    color: '#FFFFFF',
  },
  dateStripNumDone: {
    color: '#10B981',
  },
  dateDoneCheck: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
    borderWidth: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    gap: 12,
    marginBottom: Spacing.md,
  },
  celebrationTextWrap: {
    flex: 1,
  },
  celebrationTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  celebrationSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  heroProBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroProBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  heroModeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroModeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: Typography.weights.bold,
  },
  heroContent: {
    padding: Spacing.md,
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroMainTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  heroWorkoutName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  overviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  overviewBtnText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
    marginBottom: Spacing.sm,
  },
  heroMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetricText: {
    fontSize: 11,
    color: Colors.textDark,
    fontWeight: Typography.weights.semiBold,
  },
  heroMetricDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroStartBtn: {
    flex: 1,
  },
  heroRoutineBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.button,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroRoutineBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  seeAllText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  sectionSubBadge: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bodyPartsScroll: {
    gap: 10,
    paddingBottom: Spacing.lg,
  },
  bodyPartCard: {
    width: 130,
    height: 160,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bodyPartImage: {
    width: '100%',
    height: '100%',
  },
  bodyPartCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  bodyPartNameText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  bodyPartSubText: {
    color: '#E2E8F0',
    fontSize: 9,
    marginTop: 1,
  },
  activityScroll: {
    gap: 10,
    paddingBottom: Spacing.lg,
  },
  activityCard: {
    width: 125,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.bold,
  },
  activityValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 2,
  },
  activitySub: {
    fontSize: 9,
    color: Colors.textGrey,
    marginTop: 2,
  },
  activityActionBtn: {
    marginTop: 6,
    backgroundColor: '#F8F9FA',
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  activityActionText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  mealsScroll: {
    gap: 10,
    paddingBottom: Spacing.lg,
  },
  healthyMealCard: {
    width: 200,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mealCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealIconCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealKcalTag: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
  },
  healthyMealTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  healthyMealDesc: {
    fontSize: 10,
    color: Colors.textGrey,
    marginTop: 2,
    marginBottom: 6,
  },
  healthyMealMacrosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  healthyMacroText: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  quickAddMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickAddMealText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.lg,
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  challengeBadge: {
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  challengeBadgeText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    color: Colors.accent,
  },
  challengeTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  challengeDayCount: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  challengeDesc: {
    fontSize: 11,
    color: Colors.textGrey,
    marginBottom: 8,
  },
  challengeProgressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengePercentText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  challengeContinueButton: {
    paddingVertical: 2,
  },
  challengeContinueText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  myWorkoutsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitleText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  sectionSubText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  horizontalScrollContent: {
    gap: 12,
    paddingVertical: 6,
  },
  workoutCard: {
    width: 170,
    borderRadius: BorderRadius.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  workoutThumbnail: {
    width: '100%',
    height: 100,
  },
  workoutCardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  workoutCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: Typography.weights.bold,
  },
  workoutCardBody: {
    padding: 8,
  },
  workoutCardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  workoutCardMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  workoutCardMetaText: {
    fontSize: 9,
    color: Colors.textGrey,
  },
  createCard: {
    width: 130,
    height: 155,
    borderRadius: BorderRadius.card,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFEAEA',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  createPlusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  createTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  createSub: {
    fontSize: 9,
    color: Colors.textGrey,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalHeading: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  overviewRoutineTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  overviewRoutineSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  overviewExerciseList: {
    gap: 8,
  },
  overviewExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  overviewIndexCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewIndexText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  overviewExName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  overviewExMeta: {
    fontSize: 10,
    color: Colors.textGrey,
  },
});
