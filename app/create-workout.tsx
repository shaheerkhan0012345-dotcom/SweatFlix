import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { usePremium } from '../context/PremiumContext';
import {
  useCustomWorkouts,
  CustomWorkoutExercise,
  FREE_WORKOUT_LIMIT,
} from '../context/CustomWorkoutsContext';
import { FAKE_EXERCISES, ExerciseDetail } from '../data/fakeData';
import { workoutService } from '../services/workoutService';

const BODY_PART_CHIPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Abs', 'Legs'] as const;

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string; initialExerciseId?: string }>();
  const { isPremium } = usePremium();
  const {
    customWorkouts,
    createWorkout,
    updateWorkout,
    getWorkoutById,
  } = useCustomWorkouts();

  const isEditing = Boolean(params.editId);
  const existingWorkout = params.editId ? getWorkoutById(params.editId) : undefined;

  const [workoutName, setWorkoutName] = useState(existingWorkout?.name || '');
  const [selectedExercises, setSelectedExercises] = useState<CustomWorkoutExercise[]>(() => {
    if (existingWorkout?.exercises) return existingWorkout.exercises;
    if (params.initialExerciseId && !isEditing) {
      const ex = FAKE_EXERCISES.find((e) => e.id === params.initialExerciseId);
      if (ex) {
        return [
          {
            exerciseId: ex.id,
            name: ex.name,
            bodyPart: ex.bodyPart,
            thumbnail: ex.thumbnail,
            sets: 3,
            reps: 12,
            kcalPerSet: Math.round(ex.kcal / 3) || 15,
          },
        ];
      }
    }
    return [];
  });

  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>('All');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  const [allExercises, setAllExercises] = useState<ExerciseDetail[]>(FAKE_EXERCISES);

  useEffect(() => {
    workoutService.getExercises().then((list) => {
      if (list && list.length > 0) {
        setAllExercises(list);
      }
    });
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Check if limit is reached for creating a new workout
  const isLimitReached = !isEditing && !isPremium && customWorkouts.length >= FREE_WORKOUT_LIMIT;

  // Live Summary Calculations
  const totalExercises = selectedExercises.length;
  const totalSets = selectedExercises.reduce((acc, ex) => acc + ex.sets, 0);
  const estimatedDuration = Math.max(totalSets * 2, totalExercises > 0 ? 5 : 0);
  const estimatedKcal = selectedExercises.reduce((acc, ex) => acc + ex.sets * ex.kcalPerSet, 0);

  // Stepper handlers
  const updateSets = (index: number, delta: number) => {
    setSelectedExercises((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const newSets = Math.min(Math.max(item.sets + delta, 1), 10);
        return { ...item, sets: newSets };
      })
    );
  };

  const updateReps = (index: number, delta: number) => {
    setSelectedExercises((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const newReps = Math.min(Math.max(item.reps + delta, 1), 50);
        return { ...item, reps: newReps };
      })
    );
  };

  const removeExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedExercises.length) return;

    setSelectedExercises((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[targetIdx];
      list[targetIdx] = temp;
      return list;
    });
  };

  // Open Exercise Picker
  const handleOpenPicker = () => {
    setTempSelectedIds(selectedExercises.map((e) => e.exerciseId));
    setPickerSearch('');
    setPickerCategory('All');
    setShowPicker(true);
  };

  const togglePickerSelection = (exercise: ExerciseDetail) => {
    if (exercise.isPremium && !isPremium) {
      setShowPicker(false);
      router.push('/premium');
      return;
    }

    if (tempSelectedIds.includes(exercise.id)) {
      setTempSelectedIds((prev) => prev.filter((id) => id !== exercise.id));
    } else {
      setTempSelectedIds((prev) => [...prev, exercise.id]);
    }
  };

  const handleDonePicker = () => {
    // Preserve existing sets and reps for already selected exercises, add new ones with defaults
    const updated: CustomWorkoutExercise[] = tempSelectedIds.map((id) => {
      const existing = selectedExercises.find((e) => e.exerciseId === id);
      if (existing) return existing;

      const exercise = allExercises.find((e) => e.id === id)! || FAKE_EXERCISES[0];
      return {
        exerciseId: exercise.id,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        thumbnail: exercise.thumbnail,
        sets: 3,
        reps: 12,
        kcalPerSet: Math.round(exercise.kcal / 3) || 15,
      };
    });

    setSelectedExercises(updated);
    setShowPicker(false);
  };

  // Filtered exercises for picker modal
  const filteredPickerExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesCategory =
        pickerCategory === 'All' || ex.bodyPart === pickerCategory;
      const matchesSearch =
        ex.name.toLowerCase().includes(pickerSearch.trim().toLowerCase()) ||
        ex.bodyPart.toLowerCase().includes(pickerSearch.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allExercises, pickerCategory, pickerSearch]);

  const handleSave = async () => {
    if (!workoutName.trim()) {
      setNameError('Please enter a workout name');
      return;
    }
    if (selectedExercises.length === 0) {
      setNameError('Please add at least 1 exercise');
      return;
    }

    if (isLimitReached) {
      return;
    }

    if (isEditing && params.editId) {
      await updateWorkout(params.editId, workoutName, selectedExercises);
      setToastMessage('Workout updated! 💪');
    } else {
      const res = await createWorkout(workoutName, selectedExercises);
      if (!res.success) {
        if (res.error === 'LIMIT_REACHED') {
          router.push('/premium');
        }
        return;
      }
      setToastMessage('Workout saved! 💪');
    }

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardWrap}
    >
      <ScreenContainer scrollable contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit workout' : 'Create workout'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Success Toast */}
        {toastMessage && (
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Limit Warning for Free Users */}
        {isLimitReached && (
          <Card style={styles.limitCard}>
            <View style={styles.limitHeader}>
              <Ionicons name="lock-closed" size={20} color={Colors.primary} />
              <Text style={styles.limitTitle}>Free Workout Limit Reached</Text>
            </View>
            <Text style={styles.limitSub}>
              Free members can create up to 3 custom workouts. Upgrade to Premium for unlimited routines!
            </Text>
            <Button
              title="Go Premium"
              variant="primary"
              style={styles.limitButton}
              onPress={() => router.push('/premium')}
            />
          </Card>
        )}

        {/* Workout Name Input */}
        <View style={styles.inputSection}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Workout Name</Text>
            <Text style={styles.charCount}>{workoutName.length}/30</Text>
          </View>

          <TextInput
            style={[styles.nameInput, nameError && styles.nameInputError]}
            placeholder="e.g., Morning Shred, Leg Hypertrophy"
            placeholderTextColor="#A0A0A0"
            value={workoutName}
            onChangeText={(text) => {
              setWorkoutName(text.slice(0, 30));
              if (nameError) setNameError(null);
            }}
            maxLength={30}
          />
          {nameError && <Text style={styles.errorText}>{nameError}</Text>}
        </View>

        {/* Selected Exercises Section */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Exercises ({selectedExercises.length})</Text>
            <TouchableOpacity
              onPress={handleOpenPicker}
              style={styles.addExerciseBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={Colors.primary} />
              <Text style={styles.addExerciseBtnText}>Add Exercises</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenPicker}
              style={styles.emptyExercisesCard}
            >
              <Ionicons name="barbell-outline" size={36} color={Colors.textGrey} />
              <Text style={styles.emptyExerciseTitle}>No exercises added yet</Text>
              <Text style={styles.emptyExerciseSub}>
                Tap &quot;Add Exercises&quot; to pick movements from the library
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.exerciseList}>
              {selectedExercises.map((item, index) => (
                <Card key={item.exerciseId} style={styles.exerciseRowCard}>
                  <View style={styles.exerciseRowTop}>
                    <Image source={{ uri: item.thumbnail }} style={styles.rowThumbnail} />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.rowBodyPart}>{item.bodyPart}</Text>
                    </View>

                    {/* Reorder and Delete controls */}
                    <View style={styles.reorderControls}>
                      <TouchableOpacity
                        onPress={() => moveExercise(index, 'up')}
                        disabled={index === 0}
                        style={[styles.arrowBtn, index === 0 && styles.disabledArrow]}
                      >
                        <Ionicons name="chevron-up" size={16} color={Colors.textDark} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveExercise(index, 'down')}
                        disabled={index === selectedExercises.length - 1}
                        style={[
                          styles.arrowBtn,
                          index === selectedExercises.length - 1 && styles.disabledArrow,
                        ]}
                      >
                        <Ionicons name="chevron-down" size={16} color={Colors.textDark} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeExercise(index)}
                        style={styles.removeBtn}
                      >
                        <Ionicons name="close" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Steppers */}
                  <View style={styles.steppersRow}>
                    {/* Sets */}
                    <View style={styles.stepperGroup}>
                      <Text style={styles.stepperLabel}>Sets</Text>
                      <View style={styles.stepperWrap}>
                        <TouchableOpacity
                          onPress={() => updateSets(index, -1)}
                          disabled={item.sets <= 1}
                          style={styles.stepperBtn}
                        >
                          <Ionicons name="remove" size={16} color={Colors.textDark} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{item.sets}</Text>
                        <TouchableOpacity
                          onPress={() => updateSets(index, 1)}
                          disabled={item.sets >= 10}
                          style={styles.stepperBtn}
                        >
                          <Ionicons name="add" size={16} color={Colors.textDark} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Reps */}
                    <View style={styles.stepperGroup}>
                      <Text style={styles.stepperLabel}>Reps / Duration</Text>
                      <View style={styles.stepperWrap}>
                        <TouchableOpacity
                          onPress={() => updateReps(index, -1)}
                          disabled={item.reps <= 1}
                          style={styles.stepperBtn}
                        >
                          <Ionicons name="remove" size={16} color={Colors.textDark} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{item.reps}</Text>
                        <TouchableOpacity
                          onPress={() => updateReps(index, 1)}
                          disabled={item.reps >= 50}
                          style={styles.stepperBtn}
                        >
                          <Ionicons name="add" size={16} color={Colors.textDark} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Live Summary Bar */}
        <Card style={styles.summaryBar}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>{totalExercises}</Text>
            <Text style={styles.summaryLabel}>EXERCISES</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>~{estimatedDuration}m</Text>
            <Text style={styles.summaryLabel}>EST. TIME</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>~{estimatedKcal}</Text>
            <Text style={styles.summaryLabel}>EST. KCAL</Text>
          </View>
        </Card>

        {/* Save Workout Button */}
        <View style={styles.saveSection}>
          <Button
            title={isEditing ? 'Save Changes' : 'Save Workout'}
            variant="primary"
            disabled={!workoutName.trim() || selectedExercises.length === 0 || isLimitReached}
            onPress={handleSave}
          />
        </View>
      </ScreenContainer>

      {/* EXERCISE PICKER MODAL */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Select Exercises</Text>
              <Text style={styles.modalSub}>{tempSelectedIds.length} exercises selected</Text>
            </View>
            <TouchableOpacity
              onPress={handleDonePicker}
              style={styles.doneBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>Done ({tempSelectedIds.length})</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar inside modal */}
          <View style={styles.modalSearchWrap}>
            <Ionicons name="search" size={18} color={Colors.textGrey} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search by exercise name..."
              placeholderTextColor="#999999"
              value={pickerSearch}
              onChangeText={setPickerSearch}
            />
          </View>

          {/* Category Chips inside modal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modalChipsRow}
          >
            {BODY_PART_CHIPS.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setPickerCategory(cat)}
                style={[
                  styles.modalChip,
                  pickerCategory === cat && styles.modalChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.modalChipText,
                    pickerCategory === cat && styles.modalChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercises FlatList */}
          <FlatList
            data={filteredPickerExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.pickerListContent}
            renderItem={({ item }) => {
              const isSelected = tempSelectedIds.includes(item.id);
              const isLocked = item.isPremium && !isPremium;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => togglePickerSelection(item)}
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemSelected,
                  ]}
                >
                  <Image source={{ uri: item.thumbnail }} style={styles.pickerThumbnail} />
                  <View style={styles.pickerItemInfo}>
                    <Text style={styles.pickerItemName}>{item.name}</Text>
                    <Text style={styles.pickerItemMeta}>
                      {item.bodyPart} • {item.level}
                    </Text>
                  </View>

                  {isLocked ? (
                    <View style={styles.lockedPill}>
                      <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
                      <Text style={styles.lockedPillText}>PRO</Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.pickerCheckCircle,
                        isSelected && styles.pickerCheckCircleActive,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingBottom: Spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    gap: 8,
    marginBottom: Spacing.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  limitCard: {
    backgroundColor: '#FFF2F2',
    borderColor: '#FFC7C7',
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  limitTitle: {
    color: Colors.primary,
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.sm,
  },
  limitSub: {
    color: Colors.textDark,
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  limitButton: {
    height: 42,
  },
  inputSection: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    textTransform: 'uppercase',
  },
  charCount: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  nameInput: {
    height: 50,
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  nameInputError: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: Typography.weights.semiBold,
    marginTop: 4,
  },
  exercisesSection: {
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addExerciseBtnText: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  emptyExercisesCard: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyExerciseTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginTop: Spacing.sm,
  },
  emptyExerciseSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    marginTop: 2,
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  exerciseRowCard: {
    padding: Spacing.sm,
    marginVertical: 0,
  },
  exerciseRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rowThumbnail: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  rowBodyPart: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.semiBold,
    marginTop: 2,
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledArrow: {
    opacity: 0.3,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  steppersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  stepperGroup: {
    alignItems: 'center',
    flex: 1,
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    width: 32,
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: Spacing.md,
    marginVertical: Spacing.sm,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
  },
  summaryLabel: {
    color: '#999999',
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#333333',
  },
  saveSection: {
    marginTop: Spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  modalSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  },
  modalSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardLight,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
  },
  modalChipsRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  modalChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalChipText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  modalChipTextSelected: {
    color: '#FFFFFF',
  },
  pickerListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  pickerItemSelected: {
    backgroundColor: '#FFF2F2',
    borderColor: Colors.primary,
  },
  pickerThumbnail: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  pickerItemMeta: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  pickerCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCheckCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  lockedPill: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
  },
});
