import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useCustomWorkouts } from '../context/CustomWorkoutsContext';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { getWorkoutById, deleteWorkout } = useCustomWorkouts();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const workout = params.id ? getWorkoutById(params.id) : undefined;

  if (!workout) {
    return (
      <ScreenContainer style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textGrey} />
        <Text style={styles.notFoundTitle}>Workout Not Found</Text>
        <Text style={styles.notFoundSub}>
          This custom workout may have been removed.
        </Text>
        <Button
          title="Back to Home"
          variant="primary"
          onPress={() => router.replace('/(tabs)')}
        />
      </ScreenContainer>
    );
  }

  const handleStartWorkout = () => {
    router.push({
      pathname: '/active-workout' as any,
      params: { workoutId: workout.id },
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

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Workout Details
        </Text>

        <TouchableOpacity
          onPress={handleEdit}
          style={styles.editHeaderBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastCard}>
          <Ionicons name="information-circle" size={20} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Workout Title & Overview */}
      <View style={styles.titleArea}>
        <View style={styles.customBadge}>
          <Text style={styles.customBadgeText}>CUSTOM ROUTINE</Text>
        </View>
        <Text style={styles.workoutName}>{workout.name}</Text>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryVal}>{workout.exercises.length}</Text>
          <Text style={styles.summaryLabel}>EXERCISES</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryVal}>~{workout.estimatedDuration}m</Text>
          <Text style={styles.summaryLabel}>DURATION</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryVal}>~{workout.estimatedKcal}</Text>
          <Text style={styles.summaryLabel}>EST. KCAL</Text>
        </View>
      </Card>

      {/* Exercise List */}
      <View style={styles.exerciseListSection}>
        <Text style={styles.sectionHeading}>
          Exercises ({workout.exercises.length})
        </Text>

        <View style={styles.exerciseList}>
          {workout.exercises.map((ex, index) => (
            <Card key={ex.exerciseId} style={styles.exerciseCard}>
              <View style={styles.exerciseRow}>
                <View style={styles.indexCircle}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <Image source={{ uri: ex.thumbnail }} style={styles.thumbnail} />
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {ex.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.bodyPart} • {ex.sets} sets × {ex.reps} reps
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Start workout"
          variant="primary"
          icon={<Ionicons name="play" size={20} color="#FFFFFF" />}
          onPress={handleStartWorkout}
        />
        <Button
          title="Edit Workout"
          variant="secondary"
          icon={<Ionicons name="pencil-outline" size={18} color={Colors.accent} />}
          onPress={handleEdit}
        />
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          style={styles.deleteButton}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete Workout</Text>
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
    paddingBottom: Spacing.xxl,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  notFoundSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGrey,
    marginBottom: Spacing.xl,
  },
  topHeader: {
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
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
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
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    gap: 8,
    marginBottom: Spacing.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  titleArea: {
    marginBottom: Spacing.md,
  },
  customBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  customBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  workoutName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
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
  exerciseListSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  exerciseCard: {
    padding: Spacing.sm,
    marginVertical: 0,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  indexText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  exerciseMeta: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  actions: {
    gap: Spacing.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 6,
    marginTop: Spacing.xs,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  deleteModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFEBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  deleteModalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  deleteModalSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalBtnText: {
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    fontSize: Typography.sizes.sm,
  },
  confirmDeleteModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteModalBtnText: {
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
  },
});
