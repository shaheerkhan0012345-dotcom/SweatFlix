import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../components/ScreenContainer';
import { AnatomyBodyMap } from '../components/AnatomyBodyMap';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useCustomWorkouts } from '../context/CustomWorkoutsContext';
import { FAKE_WORKOUTS } from '../data/fakeData';
import { getExercise3DAsset } from '../constants/exerciseImages';
import { resolveExerciseDetail } from '../services/workoutService';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { getWorkoutById, deleteWorkout } = useCustomWorkouts();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [legsExpanded, setLegsExpanded] = useState(true);
  const [abdomenExpanded, setAbdomenExpanded] = useState(true);

  // Find workout (supports both custom workouts and built-in workouts)
  const workout = useMemo(() => {
    if (params.id) {
      const custom = getWorkoutById(params.id);
      if (custom) return { ...custom, isCustom: true };

      const builtIn = FAKE_WORKOUTS.find((w) => w.id === params.id);
      if (builtIn) {
        return {
          id: builtIn.id,
          name: builtIn.name,
          estimatedDuration: builtIn.duration,
          estimatedKcal: builtIn.kcal,
          isCustom: false,
          category: builtIn.category,
          exercises: builtIn.exercises.map((e) => {
            const detail = resolveExerciseDetail(e.id || e.name);
            return {
              exerciseId: detail.id || e.id,
              name: e.name || detail.name,
              sets: e.sets || 3,
              reps: parseInt(String(e.reps).replace(/\D/g, ''), 10) || 10,
              bodyPart: detail?.bodyPart || builtIn.category || 'Shoulders',
              thumbnail: detail?.thumbnail || builtIn.thumbnail,
            };
          }),
        };
      }
    }

    // Default: Today's Workout matching screen recording media_1791375057919.jpg
    return {
      id: 'todays-workout',
      name: "Today's Workout",
      estimatedDuration: 40,
      estimatedKcal: 103,
      isCustom: false,
      category: 'Shoulders',
      exercises: [
        {
          exerciseId: 'shoulders-overhead-press',
          name: 'Press',
          sets: 3,
          reps: 10,
          weight: '20 LBS',
          bodyPart: 'SHOULDER',
          subMuscles: 'Shoulders, Triceps',
        },
        {
          exerciseId: 'shoulders-lateral-raise',
          name: 'Dumbbell seated bent arm lateral',
          sets: 3,
          reps: 10,
          weight: '5 LBS',
          bodyPart: 'SHOULDER',
          subMuscles: 'Shoulders, Side Delts',
        },
        {
          exerciseId: 'shoulders-rear-delt-fly',
          name: 'Lever seated reverse fly',
          sets: 3,
          reps: 10,
          weight: '20 LBS',
          bodyPart: 'SHOULDER',
          subMuscles: 'Rear Delts, Upper Back',
        },
      ],
    };
  }, [params.id, getWorkoutById]);

  // Legs exercises for LEGS divider
  const legExercises = useMemo(() => [
    {
      exerciseId: 'legs-bulgarian-split',
      name: 'Barbell High Bar Squat',
      sets: 3,
      reps: 10,
      weight: '45 LBS',
      bodyPart: 'LEGS',
      subMuscles: 'Quadriceps, Glutes',
    },
    {
      exerciseId: 'legs-romanian-deadlift',
      name: 'Dumbbell Romanian Deadlift',
      sets: 3,
      reps: 10,
      weight: '30 LBS',
      bodyPart: 'LEGS',
      subMuscles: 'Hamstrings, Glutes',
    },
  ], []);

  // Abdomen exercises for ABDOMEN divider
  const abdomenExercises = useMemo(() => [
    {
      exerciseId: 'abs-bicycle-crunches',
      name: 'Standard Abdominal Crunch',
      sets: 3,
      reps: 15,
      weight: 'Bodyweight',
      bodyPart: 'ABDOMEN',
      subMuscles: 'Rectus Abdominis',
    },
    {
      exerciseId: 'abs-plank',
      name: 'Forearm Core Plank Hold',
      sets: 3,
      reps: 30,
      weight: 'Secs',
      bodyPart: 'ABDOMEN',
      subMuscles: 'Transverse Abdominis',
    },
  ], []);

  const handleOpenExerciseDetail = (exerciseId: string) => {
    router.push({
      pathname: '/exercise-detail',
      params: { id: exerciseId },
    });
  };

  const handleStartFullWorkout = () => {
    router.push({
      pathname: '/active-workout' as any,
      params: { workoutId: workout.id },
    });
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    await deleteWorkout(workout.id);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.rootScreen}>
      <ScreenContainer
        scrollable
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 16) + 90 },
        ]}
      >
        {/* 1. Top Header Bar matching recording screenshot media_1791375057919.jpg */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {workout.name}
          </Text>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/(tabs)/explore')}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => workout.isCustom && setShowDeleteModal(true)}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1.5. 3D Anatomy Muscles Overview */}
        <View style={styles.anatomyOverviewCard}>
          <View style={styles.anatomyHeaderRow}>
            <Ionicons name="body" size={18} color={Colors.primary} />
            <Text style={styles.anatomyHeaderTitle}>Target Anatomy & Muscles</Text>
          </View>
          <Text style={styles.anatomyHeaderSubtitle}>
            Musculoskeletal regions activated during {workout.name}
          </Text>
          <AnatomyBodyMap
            bodyPart={workout.category || (workout.exercises[0]?.bodyPart) || 'Shoulders'}
            height={260}
            showToggle={true}
          />
        </View>

        {/* 2. Connected Vertical Timeline Section matching media_1791375057919.jpg */}
        <View style={styles.timelineSection}>
          <View style={styles.timelineContainer}>
            {/* Continuous vertical grey spine line */}
            <View style={styles.verticalSpineLine} />

            {workout.exercises.map((ex, index) => {
              const exercise3D = getExercise3DAsset(ex.bodyPart, ex.name);
              const setsCount = ex.sets || 3;
              const repsVal = ex.reps || 10;
              const weightVal = (ex as any).weight || '20 LBS';

              return (
                <View key={`${ex.exerciseId}-${index}`} style={styles.timelineNode}>
                  {/* Timeline node dot */}
                  <View style={styles.timelineDot} />

                  {/* Workout Card matching media_1791375098489.jpg */}
                  <View style={styles.referenceCard}>
                    <TouchableOpacity
                      style={styles.cardUpperSection}
                      onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                      activeOpacity={0.88}
                    >
                      {/* Left: 3D Athletic Movement on clean white canvas */}
                      <View style={styles.characterContainer}>
                        <Image
                          source={exercise3D}
                          style={styles.characterImg}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                      </View>

                      {/* Right: Info + Sets Table */}
                      <View style={styles.cardContentRight}>
                        {/* Name + Ellipsis Menu */}
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

                        {/* Muscle Tag Pill + Sub-Muscle Text */}
                        <View style={styles.muscleBadgeRow}>
                          <View style={styles.muscleTagPill}>
                            <Text style={styles.muscleTagPillText}>
                              {ex.bodyPart.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.subMuscleLabel} numberOfLines={1}>
                            {(ex as any).subMuscles || `${ex.bodyPart}, Synergy`}
                          </Text>
                        </View>

                        {/* 3-Column Table: Set | Reps | Weight */}
                        <View style={styles.tableExact}>
                          <View style={styles.tableExactHead}>
                            <Text style={styles.tableExactHeadCell}>Set</Text>
                            <Text style={styles.tableExactHeadCell}>Reps</Text>
                            <Text style={styles.tableExactHeadCell}>Weight</Text>
                          </View>
                          {Array.from({ length: setsCount }).map((_, sIdx) => (
                            <View key={sIdx} style={styles.tableExactRow}>
                              <Text style={styles.tableExactDataCell}>{sIdx + 1}</Text>
                              <Text style={styles.tableExactDataCell}>{repsVal}</Text>
                              <Text style={styles.tableExactDataCell}>{weightVal}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Full-Width Start Now Button in brand athletic red */}
                    <TouchableOpacity
                      style={styles.fullWidthStartBtn}
                      onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.fullWidthStartText}>Start Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Category Section Divider matching recording: LEGS + Add */}
          <TouchableOpacity
            style={styles.categoryDividerRow}
            onPress={() => setLegsExpanded(!legsExpanded)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.categoryDividerTitle}>LEGS</Text>
              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={() => router.push('/(tabs)/explore')}
                activeOpacity={0.7}
              >
                <Text style={styles.addCategoryBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <Ionicons
              name={legsExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {/* Collapsible Legs Exercises */}
          {legsExpanded && (
            <View style={styles.timelineContainer}>
              <View style={styles.verticalSpineLine} />
              {legExercises.map((ex, index) => {
                const exercise3D = getExercise3DAsset(ex.bodyPart, ex.name);
                return (
                  <View key={`${ex.exerciseId}-${index}`} style={styles.timelineNode}>
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
                        <Text style={styles.fullWidthStartText}>Start Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Category Section Divider matching recording: ABDOMEN + Add */}
          <TouchableOpacity
            style={styles.categoryDividerRow}
            onPress={() => setAbdomenExpanded(!abdomenExpanded)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.categoryDividerTitle}>ABDOMEN</Text>
              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={() => router.push('/(tabs)/explore')}
                activeOpacity={0.7}
              >
                <Text style={styles.addCategoryBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <Ionicons
              name={abdomenExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {/* Collapsible Abdomen Exercises */}
          {abdomenExpanded && (
            <View style={styles.timelineContainer}>
              <View style={styles.verticalSpineLine} />
              {abdomenExercises.map((ex, index) => {
                const exercise3D = getExercise3DAsset(ex.bodyPart, ex.name);
                return (
                  <View key={`${ex.exerciseId}-${index}`} style={styles.timelineNode}>
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
                        <Text style={styles.fullWidthStartText}>Start Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>


      </ScreenContainer>

      {/* Floating Bottom Action Bar: Start Full Workout */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={styles.startFullWorkoutBtn}
          onPress={handleStartFullWorkout}
          activeOpacity={0.88}
        >
          <Ionicons name="play" size={18} color="#FFFFFF" />
          <Text style={styles.startFullWorkoutText}>Start Full Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="trash" size={26} color="#FF3B30" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Custom Workout?</Text>
            <Text style={styles.deleteModalSub}>
              Are you sure you want to delete &ldquo;{workout.name}&rdquo;?
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.cancelModalBtn}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={styles.confirmDeleteModalBtn}
              >
                <Text style={styles.confirmDeleteModalBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineSection: {
    marginTop: Spacing.sm,
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
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    color: Colors.textDark,
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
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exactOfferSubText: {
    color: Colors.textGrey,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  deleteModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  deleteModalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginBottom: 6,
  },
  deleteModalSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGrey,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  confirmDeleteModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  confirmDeleteModalBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  startFullWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.button,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startFullWorkoutText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  anatomyOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  anatomyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  anatomyHeaderTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  anatomyHeaderSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginBottom: Spacing.sm,
  },
});
