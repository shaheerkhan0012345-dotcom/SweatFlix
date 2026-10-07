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

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  const userName = profile?.name || settings.name || 'Champ';
  const todayIndex = getTodayDayIndex();

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

  const handleSaveWeight = async () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 20 && w < 300) {
      await logWeight(w);
    }
    setShowWeightModal(false);
  };

  // Water calculations (8 cups target = 2500ml)
  const cupsCount = 8;
  const cupsFilled = Math.min(cupsCount, Math.floor((metrics.waterIntakeMl / metrics.waterTargetMl) * cupsCount));

  // Calories & Macros calculations
  const caloriesRemaining = Math.max(0, metrics.caloriesTarget - metrics.caloriesConsumed);
  const proteinPercent = Math.min(100, Math.round((metrics.proteinGrams / metrics.proteinTarget) * 100));
  const carbsPercent = Math.min(100, Math.round((metrics.carbsGrams / metrics.carbsTarget) * 100));
  const fatPercent = Math.min(100, Math.round((metrics.fatGrams / metrics.fatTarget) * 100));

  return (
    <ScreenContainer scrollable edges={['left', 'right']} contentContainerStyle={styles.container}>
      {/* 1. Header with greeting and streak badge */}
      <View style={styles.headerRow}>
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingTitle}>Hey, {userName} 👋</Text>
          <Text style={styles.greetingSub}>
            Every rep counts. Let&apos;s build strength and discipline today.
          </Text>
        </View>

        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={20} color="#FF5A00" />
          <Text style={styles.streakText}>
            {progress.streak} {progress.streak === 1 ? 'day' : 'days'}
          </Text>
        </View>
      </View>

      {/* Celebration Banner */}
      {showCelebration && (
        <View style={styles.celebrationCard}>
          <Ionicons name="trophy" size={24} color="#FFD700" style={styles.celebrationIcon} />
          <View style={styles.celebrationTextWrap}>
            <Text style={styles.celebrationTitle}>Workout Crushed! 🔥</Text>
            <Text style={styles.celebrationSub}>
              Today&apos;s routine recorded! Your consistency streak and weekly goal are updated.
            </Text>
          </View>
        </View>
      )}

      {/* 2. Quick Actions Hub */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={handleStartLiveWorkout}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="play" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.quickActionLabel}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => addWater(250)}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="water" size={20} color="#0284C7" />
          </View>
          <Text style={styles.quickActionLabel}>+250ml Water</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => setShowFoodModal(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="nutrition" size={20} color="#D97706" />
          </View>
          <Text style={styles.quickActionLabel}>Log Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => {
            setWeightInput(metrics.currentWeightKg.toString());
            setShowWeightModal(true);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="speedometer" size={20} color="#9333EA" />
          </View>
          <Text style={styles.quickActionLabel}>Log Weight</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Today's Workout Hero Section (Video / Set Tracker launch) */}
      <View style={styles.todayWorkoutSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Today&apos;s Workout</Text>
          <View style={styles.recommendedPill}>
            <Ionicons name="sparkles" size={12} color={Colors.primary} />
            <Text style={styles.recommendedPillText}>PERSONALIZED</Text>
          </View>
        </View>

        {/* Video Player / Preview */}
        <WorkoutVideoPlayer
          videoUrl={activeWorkout.videoUrl}
          thumbnail={activeWorkout.thumbnail}
          workoutName={activeWorkout.name}
          duration={activeWorkout.duration}
          kcal={activeWorkout.kcal}
          level={activeWorkout.level}
        />

        {/* Live Workout Primary Action Bar */}
        <View style={styles.liveActionBar}>
          <Button
            title={isTodayDone ? '✓ Session Done (Repeat)' : '▶ Start Live Workout'}
            variant="primary"
            style={styles.startLiveBtn}
            icon={<Ionicons name="play-circle" size={22} color="#FFFFFF" />}
            onPress={handleStartLiveWorkout}
          />

          {!isTodayDone && (
            <TouchableOpacity
              onPress={handleMarkAsDoneOffline}
              style={styles.offlineDoneBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={18} color={Colors.textGrey} />
              <Text style={styles.offlineDoneText}>Quick Mark Done</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Exercise Routine Card */}
        <Card style={styles.exerciseCard}>
          <Text style={styles.exerciseCardHeader}>
            Exercise Routine ({activeWorkout.exercises.length} Movements)
          </Text>
          <View style={styles.exerciseList}>
            {activeWorkout.exercises.map((ex, idx) => (
              <View key={ex.id} style={styles.exerciseItem}>
                <View style={styles.exerciseIndexCircle}>
                  <Text style={styles.exerciseIndexText}>{idx + 1}</Text>
                </View>
                <View style={styles.exerciseDetailWrap}>
                  <Text style={styles.exerciseNameText}>{ex.name}</Text>
                  <Text style={styles.exerciseRepsText}>
                    {ex.sets} sets × {ex.reps}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* 4. Daily Nutrition & Macronutrient Hub Card */}
      <Card style={styles.nutritionCard}>
        <View style={styles.nutritionCardTop}>
          <View>
            <Text style={styles.nutritionCardTitle}>Daily Nutrition & Macros</Text>
            <Text style={styles.nutritionCardSub}>
              {caloriesRemaining > 0
                ? `${caloriesRemaining} kcal remaining today`
                : 'Daily calorie goal reached!'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addFoodPill}
            onPress={() => setShowFoodModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={styles.addFoodPillText}>+ Log Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Calorie Progress Ring / Stat Row */}
        <View style={styles.calorieRow}>
          <View style={styles.calorieMainBox}>
            <Text style={styles.calorieCurrentNum}>
              {metrics.caloriesConsumed}
            </Text>
            <Text style={styles.calorieTargetLabel}>
              / {metrics.caloriesTarget} kcal
            </Text>
          </View>

          <View style={styles.macroTrackWrap}>
            {/* Protein */}
            <View style={styles.macroItem}>
              <View style={styles.macroLabelRow}>
                <Text style={styles.macroName}>🥩 Protein</Text>
                <Text style={styles.macroVal}>
                  {metrics.proteinGrams} / {metrics.proteinTarget}g
                </Text>
              </View>
              <View style={styles.macroProgressBarTrack}>
                <View
                  style={[
                    styles.macroProgressBarFill,
                    { width: `${proteinPercent}%`, backgroundColor: Colors.primary },
                  ]}
                />
              </View>
            </View>

            {/* Carbs */}
            <View style={styles.macroItem}>
              <View style={styles.macroLabelRow}>
                <Text style={styles.macroName}>🍞 Carbs</Text>
                <Text style={styles.macroVal}>
                  {metrics.carbsGrams} / {metrics.carbsTarget}g
                </Text>
              </View>
              <View style={styles.macroProgressBarTrack}>
                <View
                  style={[
                    styles.macroProgressBarFill,
                    { width: `${carbsPercent}%`, backgroundColor: Colors.accent },
                  ]}
                />
              </View>
            </View>

            {/* Fat */}
            <View style={styles.macroItem}>
              <View style={styles.macroLabelRow}>
                <Text style={styles.macroName}>🥑 Fats</Text>
                <Text style={styles.macroVal}>
                  {metrics.fatGrams} / {metrics.fatTarget}g
                </Text>
              </View>
              <View style={styles.macroProgressBarTrack}>
                <View
                  style={[
                    styles.macroProgressBarFill,
                    { width: `${fatPercent}%`, backgroundColor: '#10B981' },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* 5. Hydration & Water Tracker Card */}
      <Card style={styles.waterCard}>
        <View style={styles.waterCardTop}>
          <View>
            <Text style={styles.waterCardTitle}>Daily Hydration</Text>
            <Text style={styles.waterCardSub}>
              {metrics.waterIntakeMl} ml of {metrics.waterTargetMl} ml goal
            </Text>
          </View>
          <View style={styles.waterActionsRight}>
            <TouchableOpacity
              onPress={() => addWater(250)}
              style={styles.addWaterBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="water" size={16} color="#FFFFFF" />
              <Text style={styles.addWaterBtnText}>+250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetWater}
              style={styles.resetWaterIconBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.textGrey} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cups Indicator Row */}
        <View style={styles.cupsRow}>
          {Array.from({ length: cupsCount }).map((_, i) => {
            const isFilled = i < cupsFilled;
            return (
              <View
                key={i}
                style={[
                  styles.cupItem,
                  isFilled ? styles.cupItemFilled : styles.cupItemEmpty,
                ]}
              >
                <Ionicons
                  name={isFilled ? 'water' : 'water-outline'}
                  size={16}
                  color={isFilled ? '#0284C7' : '#94A3B8'}
                />
              </View>
            );
          })}
        </View>
      </Card>

      {/* 6. Body Weight & BMI Snapshot Card */}
      <Card style={styles.bodyWeightCard}>
        <View style={styles.bodyWeightTop}>
          <View>
            <Text style={styles.bodyWeightTitle}>Body Weight & BMI</Text>
            <Text style={styles.bodyWeightSub}>
              Goal: {metrics.targetWeightKg} kg • Height: {metrics.heightCm} cm
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setWeightInput(metrics.currentWeightKg.toString());
              setShowWeightModal(true);
            }}
            style={styles.logWeightPill}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={12} color={Colors.primary} />
            <Text style={styles.logWeightPillText}>Update</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bodyMetricsRow}>
          <View style={styles.weightCol}>
            <Text style={styles.weightNum}>{metrics.currentWeightKg} kg</Text>
            <Text style={styles.weightDiffText}>
              {metrics.currentWeightKg > metrics.targetWeightKg
                ? `${(metrics.currentWeightKg - metrics.targetWeightKg).toFixed(1)} kg to goal`
                : 'Goal weight achieved!'}
            </Text>
          </View>

          <View style={styles.metricsDivider} />

          <View style={styles.bmiCol}>
            <Text style={styles.bmiNum}>BMI {bmi}</Text>
            <View style={styles.bmiCategoryBadge}>
              <Text style={styles.bmiCategoryText}>{bmiCategory}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* 7. Weekly Consistency Target Card */}
      <Card style={styles.weeklyGoalCard}>
        <View style={styles.weeklyGoalTop}>
          <CircularProgress
            size={72}
            strokeWidth={7}
            completed={progress.completedCount}
            target={weeklyTarget}
          />
          <View style={styles.weeklyGoalTextWrap}>
            <Text style={styles.weeklyGoalTitle}>Weekly Target</Text>
            <Text style={styles.weeklyGoalHighlight}>
              {progress.completedCount} of {weeklyTarget} workouts
            </Text>
            <Text style={styles.weeklyGoalSub}>
              {progress.completedCount === 0
                ? 'No workouts yet this week. Complete today!'
                : progress.completedCount >= weeklyTarget
                ? 'Weekly target reached! Incredible discipline!'
                : `${weeklyTarget - progress.completedCount} more sessions to reach your weekly milestone.`}
            </Text>
          </View>
        </View>

        {/* 7 Day Dots Row */}
        <View style={styles.daysContainer}>
          {DAYS_OF_WEEK.map((dayName, index) => {
            const isDone = progress.completedDays.includes(index);
            const isToday = index === todayIndex;

            return (
              <View key={dayName} style={styles.dayCol}>
                <View
                  style={[
                    styles.dayDot,
                    isDone && styles.dayDotDone,
                    isToday && styles.dayDotToday,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  ) : (
                    <View
                      style={[
                        styles.innerDot,
                        isToday && styles.innerDotToday,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelToday,
                    isDone && styles.dayLabelDone,
                  ]}
                >
                  {dayName}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* 8. Active Challenge Card */}
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
              <Text style={styles.challengeBadgeText}>ACTIVE CHALLENGE</Text>
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

      {/* 9. My Custom Routines Carousel */}
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

      {/* Testing Reset Button */}
      <View style={styles.testingRow}>
        <TouchableOpacity
          onPress={resetProgress}
          style={styles.resetProgressButton}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={14} color={Colors.textGrey} />
          <Text style={styles.resetProgressText}>Reset Progress (Testing Mode)</Text>
        </TouchableOpacity>
      </View>

      {/* Log Food / Macro Modal */}
      <Modal
        visible={showFoodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFoodModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalHeading}>Log Meal & Macros</Text>
              <TouchableOpacity onPress={() => setShowFoodModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputFieldWrap}>
              <Text style={styles.inputFieldLabel}>Calories (kcal)</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 450"
                keyboardType="numeric"
                value={foodCaloriesInput}
                onChangeText={setFoodCaloriesInput}
              />
            </View>

            <View style={styles.macrosInputRow}>
              <View style={styles.macroInputField}>
                <Text style={styles.inputFieldLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="30"
                  keyboardType="numeric"
                  value={foodProteinInput}
                  onChangeText={setFoodProteinInput}
                />
              </View>

              <View style={styles.macroInputField}>
                <Text style={styles.inputFieldLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="45"
                  keyboardType="numeric"
                  value={foodCarbsInput}
                  onChangeText={setFoodCarbsInput}
                />
              </View>

              <View style={styles.macroInputField}>
                <Text style={styles.inputFieldLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="12"
                  keyboardType="numeric"
                  value={foodFatInput}
                  onChangeText={setFoodFatInput}
                />
              </View>
            </View>

            <Button
              title="Save to Daily Budget"
              variant="primary"
              style={styles.modalSaveBtn}
              onPress={handleSaveFood}
            />
          </View>
        </View>
      </Modal>

      {/* Log Weight Modal */}
      <Modal
        visible={showWeightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalHeading}>Update Body Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputFieldWrap}>
              <Text style={styles.inputFieldLabel}>Current Weight (kg)</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 72.5"
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
              />
            </View>

            <Button
              title="Save Weight"
              variant="primary"
              style={styles.modalSaveBtn}
              onPress={handleSaveWeight}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 64,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  greetingWrap: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  greetingTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 18,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FFD3B3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#FF5A00',
  },
  celebrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  celebrationIcon: {
    marginRight: Spacing.md,
  },
  celebrationTextWrap: {
    flex: 1,
  },
  celebrationTitle: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.md,
  },
  celebrationSub: {
    color: '#CCCCCC',
    fontSize: Typography.sizes.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  quickActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  todayWorkoutSection: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitleText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  recommendedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  recommendedPillText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  liveActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  startLiveBtn: {
    flex: 1,
  },
  offlineDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.button,
  },
  offlineDoneText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  exerciseCard: {
    padding: Spacing.md,
  },
  exerciseCardHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIndexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  exerciseIndexText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  exerciseDetailWrap: {
    flex: 1,
  },
  exerciseNameText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  exerciseRepsText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  nutritionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  nutritionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nutritionCardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  nutritionCardSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  addFoodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 2,
  },
  addFoodPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  calorieMainBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    minWidth: 90,
  },
  calorieCurrentNum: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  calorieTargetLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.semiBold,
  },
  macroTrackWrap: {
    flex: 1,
    gap: 8,
  },
  macroItem: {},
  macroLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  macroName: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  macroVal: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  macroProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  macroProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  waterCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  waterCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  waterCardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  waterCardSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  waterActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addWaterBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  resetWaterIconBtn: {
    padding: 4,
  },
  cupsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cupItem: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cupItemFilled: {
    backgroundColor: '#E0F2FE',
  },
  cupItemEmpty: {
    backgroundColor: '#F1F5F9',
  },
  bodyWeightCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bodyWeightTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bodyWeightTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  bodyWeightSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  logWeightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  logWeightPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  bodyMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  weightCol: {
    flex: 1,
    alignItems: 'center',
  },
  weightNum: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  weightDiffText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: Typography.weights.semiBold,
    marginTop: 2,
  },
  metricsDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  bmiCol: {
    flex: 1,
    alignItems: 'center',
  },
  bmiNum: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  bmiCategoryBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  bmiCategoryText: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: '#15803D',
  },
  weeklyGoalCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  weeklyGoalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  weeklyGoalTextWrap: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  weeklyGoalTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weeklyGoalHighlight: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 2,
  },
  weeklyGoalSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 15,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayDotToday: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  innerDotToday: {
    backgroundColor: Colors.accent,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  dayLabelToday: {
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  dayLabelDone: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  challengeCard: {
    backgroundColor: '#FFF5EB',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFE0C2',
    marginBottom: Spacing.md,
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  challengeBadge: {
    backgroundColor: '#FFE8D1',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  challengeBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  challengeTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  challengeDayCount: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  challengeDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  challengeProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD7B0',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengePercentText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  challengeContinueButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  challengeContinueText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: 11,
  },
  myWorkoutsSection: {
    marginBottom: Spacing.md,
  },
  sectionSubText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  horizontalScrollContent: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  workoutCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutThumbnail: {
    width: '100%',
    height: 110,
    backgroundColor: '#EAEAEA',
  },
  workoutCardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  workoutCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
  },
  workoutCardBody: {
    padding: Spacing.sm,
  },
  workoutCardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 4,
  },
  workoutCardMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  workoutCardMetaText: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  createCard: {
    width: 140,
    backgroundColor: '#FFF0F0',
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
    borderColor: '#FFD1D3',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  createPlusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  createTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  createSub: {
    fontSize: 10,
    color: Colors.textGrey,
    textAlign: 'center',
    marginTop: 2,
  },
  testingRow: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  resetProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  resetProgressText: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  inputFieldWrap: {
    marginBottom: Spacing.sm,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 4,
  },
  modalTextInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  macrosInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  macroInputField: {
    flex: 1,
  },
  modalSaveBtn: {
    marginTop: Spacing.xs,
  },
});
