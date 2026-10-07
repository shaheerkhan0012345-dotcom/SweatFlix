import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useCustomWorkouts } from '../context/CustomWorkoutsContext';
import { FAKE_WORKOUTS, FAKE_EXERCISES } from '../data/fakeData';
import { getExercise3DAsset } from '../constants/exerciseImages';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { getWorkoutById, deleteWorkout } = useCustomWorkouts();

  const [selectedDay, setSelectedDay] = useState(2); // Wednesday / middle day
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
          exercises: builtIn.exercises.map((e, idx) => {
            const detail = FAKE_EXERCISES.find((d) => d.id === e.id || d.name === e.name);
            return {
              exerciseId: e.id,
              name: e.name,
              sets: e.sets || 3,
              reps: parseInt(String(e.reps).replace(/\D/g, ''), 10) || 12,
              bodyPart: detail?.bodyPart || builtIn.category || 'Chest',
              thumbnail: detail?.thumbnail || builtIn.thumbnail,
            };
          }),
        };
      }
    }

    // Default fallback
    const fallback = FAKE_WORKOUTS[0];
    return {
      id: fallback.id,
      name: fallback.name,
      estimatedDuration: fallback.duration,
      estimatedKcal: fallback.kcal,
      isCustom: false,
      category: fallback.category,
      exercises: fallback.exercises.map((e) => {
        const detail = FAKE_EXERCISES.find((d) => d.id === e.id || d.name === e.name);
        return {
          exerciseId: e.id,
          name: e.name,
          sets: e.sets || 3,
          reps: 12,
          bodyPart: detail?.bodyPart || fallback.category || 'Chest',
          thumbnail: detail?.thumbnail || fallback.thumbnail,
        };
      }),
    };
  }, [params.id, getWorkoutById]);

  const handleStartWorkout = (exerciseId?: string) => {
    router.push({
      pathname: '/active-workout' as any,
      params: {
        workoutId: workout.id,
        ...(exerciseId ? { exerciseId } : {}),
      },
    });
  };

  const handleOpenExerciseDetail = (exerciseId: string) => {
    router.push({
      pathname: '/exercise-detail',
      params: { id: exerciseId },
    });
  };

  const handleEdit = () => {
    router.push({
      pathname: '/create-workout',
      params: { editId: workout.id },
    });
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    await deleteWorkout(workout.id);
    router.replace('/(tabs)');
  };

  // Filter exercises
  const filteredExercises = useMemo(() => {
    if (selectedMuscleFilter === 'ALL') return workout.exercises;
    return workout.exercises.filter((e) =>
      e.bodyPart.toUpperCase().includes(selectedMuscleFilter)
    );
  }, [workout.exercises, selectedMuscleFilter]);

  // Unique muscle groups in workout
  const muscleGroups = useMemo(() => {
    const set = new Set(workout.exercises.map((e) => e.bodyPart.toUpperCase()));
    return ['ALL', ...Array.from(set)];
  }, [workout.exercises]);

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* 1. Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {workout.name}
        </Text>

        {workout.isCustom ? (
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editHeaderBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={18} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* 2. Date Selector Strip (Gym Faction Style with SweatFlix Theme) */}
      <View style={styles.dateStripWrap}>
        <View style={styles.dateStripHeader}>
          <Text style={styles.dateMonthText}>OCTOBER 2026</Text>
          <View style={styles.progressPill}>
            <Ionicons name="flash" size={12} color={Colors.primary} />
            <Text style={styles.progressPillText}>Progress: 0 / {workout.exercises.length}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {DAYS.map((day, idx) => {
            const isSelected = selectedDay === idx;
            const dayNum = 12 + idx;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dateItem, isSelected && styles.dateItemActive]}
                onPress={() => setSelectedDay(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateDayText, isSelected && styles.dateDayTextActive]}>
                  {day}
                </Text>
                <Text style={[styles.dateNumText, isSelected && styles.dateNumTextActive]}>
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Warm-Up Banner */}
      <Card style={styles.warmupBanner}>
        <View style={styles.warmupLeft}>
          <View style={styles.warmupIconWrap}>
            <Ionicons name="flame" size={22} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.warmupTitle}>Warm-Up Routine</Text>
            <Text style={styles.warmupSub}>5 mins • 4 Dynamic Drills</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.warmupPlayBtn}
          onPress={() => handleStartWorkout()}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.warmupPlayText}>Start</Text>
        </TouchableOpacity>
      </Card>

      {/* 4. Muscle Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
      >
        {muscleGroups.map((group) => {
          const isSelected = selectedMuscleFilter === group;
          return (
            <TouchableOpacity
              key={group}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedMuscleFilter(group)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                {group}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 5. Connected Vertical Timeline Section */}
      <View style={styles.timelineSection}>
        <View style={styles.timelineSectionHeader}>
          <Text style={styles.timelineHeading}>Routine Exercises</Text>
          <Text style={styles.timelineBadge}>{filteredExercises.length} Movements</Text>
        </View>

        <View style={styles.timelineContainer}>
          {/* Vertical spine line */}
          <View style={styles.verticalSpineLine} />

          {filteredExercises.map((ex, index) => {
            const exercise3D = getExercise3DAsset(ex.bodyPart, ex.thumbnail);
            const setsCount = ex.sets || 3;
            const repsVal = ex.reps || 12;

            return (
              <View key={`${ex.exerciseId}-${index}`} style={styles.timelineNode}>
                {/* Step circle on the spine */}
                <View style={styles.stepCircle}>
                  <Text style={styles.stepCircleText}>{index + 1}</Text>
                </View>

                {/* Exercise Timeline Card */}
                <Card style={styles.timelineCard}>
                  {/* Top: Muscle Pill & Exercise Name */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.bodyPartBadge}>
                        <Text style={styles.bodyPartBadgeText}>{ex.bodyPart.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.exerciseCardName} numberOfLines={1}>
                        {ex.name}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                      style={styles.infoIconBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="information-circle-outline" size={22} color={Colors.textGrey} />
                    </TouchableOpacity>
                  </View>

                  {/* Visual Row: 3D Athletic Movement + Muscle Callouts */}
                  <View style={styles.visualRow}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                      style={styles.image3DWrap}
                    >
                      <Image
                        source={exercise3D}
                        style={styles.image3D}
                        resizeMode="cover"
                      />
                      <View style={styles.glowOverlay}>
                        <Ionicons name="scan-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.glowOverlayText}>3D ANATOMY</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Muscle Target Tags */}
                    <View style={styles.muscleTagsCol}>
                      <Text style={styles.targetHeading}>TARGET MUSCLES</Text>
                      <View style={styles.targetTagActive}>
                        <View style={styles.activeDot} />
                        <Text style={styles.targetTagTextActive}>{ex.bodyPart}</Text>
                      </View>
                      <View style={styles.targetTagSecondary}>
                        <Text style={styles.targetTagTextSecondary}>Stabilizers</Text>
                      </View>
                      <View style={styles.targetTagSecondary}>
                        <Text style={styles.targetTagTextSecondary}>Core Synergy</Text>
                      </View>
                    </View>
                  </View>

                  {/* Pre-filled Sets Table (Like Reference Video) */}
                  <View style={styles.setsTable}>
                    {Array.from({ length: setsCount }).map((_, sIdx) => (
                      <View key={sIdx} style={styles.setRow}>
                        <View style={styles.setNumPill}>
                          <Text style={styles.setNumPillText}>Set {sIdx + 1}</Text>
                        </View>
                        <Text style={styles.setDetailText}>
                          {repsVal} Reps • 20 LBS
                        </Text>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#CBD5E1" />
                      </View>
                    ))}
                  </View>

                  {/* Card Bottom: Start Button */}
                  <TouchableOpacity
                    style={styles.startExerciseBtn}
                    onPress={() => handleStartWorkout(ex.exerciseId)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="play" size={16} color="#FFFFFF" />
                    <Text style={styles.startExerciseBtnText}>Start Now</Text>
                  </TouchableOpacity>
                </Card>
              </View>
            );
          })}
        </View>
      </View>

      {/* 6. Primary Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Start Full Routine"
          variant="primary"
          icon={<Ionicons name="play" size={20} color="#FFFFFF" />}
          onPress={() => handleStartWorkout()}
        />

        {workout.isCustom && (
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={styles.deleteButton}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Delete Routine</Text>
          </TouchableOpacity>
        )}
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
              Are you sure you want to delete &quot;{workout.name}&quot;? This action cannot be undone.
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 30,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
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
  editHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStripWrap: {
    marginBottom: Spacing.md,
  },
  dateStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateMonthText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 1,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  progressPillText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  dateRow: {
    gap: 8,
    paddingVertical: 4,
  },
  dateItem: {
    width: 52,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dateItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dateDayText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
    color: Colors.textGrey,
  },
  dateDayTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
  },
  dateNumText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 2,
  },
  dateNumTextActive: {
    color: '#FFFFFF',
  },
  warmupBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFF8F0',
    borderColor: '#FFE3C2',
    borderWidth: 1,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  warmupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warmupIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEAD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warmupTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  warmupSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  warmupPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  warmupPlayText: {
    fontSize: Typography.sizes.xs,
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
  },
  filterChipsRow: {
    gap: 8,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  timelineSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  timelineSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  timelineHeading: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  timelineBadge: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 34,
  },
  verticalSpineLine: {
    position: 'absolute',
    left: 14,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  timelineNode: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  stepCircle: {
    position: 'absolute',
    left: -34,
    top: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  bodyPartBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  bodyPartBadgeText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  exerciseCardName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  infoIconBtn: {
    padding: 4,
  },
  visualRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  image3DWrap: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.button,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image3D: {
    width: '100%',
    height: '100%',
  },
  glowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 3,
  },
  glowOverlayText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  muscleTagsCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  targetHeading: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.5,
  },
  targetTagActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  targetTagTextActive: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  targetTagSecondary: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  targetTagTextSecondary: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  setsTable: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.button,
    padding: Spacing.sm,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  setNumPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  setNumPillText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  setDetailText: {
    fontSize: 12,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  startExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.button,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  startExerciseBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  actions: {
    gap: 12,
    marginTop: Spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
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
});
