import React, { useState, useEffect, useMemo } from 'react';
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
import { WorkoutVideoPlayer } from '../components/WorkoutVideoPlayer';
import { AnatomyBodyMap } from '../components/AnatomyBodyMap';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { usePremium } from '../context/PremiumContext';
import { useCustomWorkouts } from '../context/CustomWorkoutsContext';
import { FAKE_EXERCISES, ExerciseDetail } from '../data/fakeData';
import { workoutService } from '../services/workoutService';

const EXERCISE_PRO_GUIDES: Record<
  string,
  {
    mistakes: string[];
    breathing: string;
    tempo: string;
    mechanics: string;
    equipment: string;
  }
> = {
  Chest: {
    mistakes: [
      'Flaring elbows out at 90° (places high shear stress on rotator cuff; keep elbows angled at 45°-60°).',
      'Bouncing or rushing the bottom position without chest stretch.',
      'Lifting glutes or excessively arching lower back off the pad.',
    ],
    breathing: 'Inhale deeply through your nose as you lower the weight (eccentric phase). Exhale forcefully through pursed lips as you press up.',
    tempo: '3-1-1 (3s lowering, 1s pause at bottom, 1s explosive drive)',
    mechanics: 'Compound Movement',
    equipment: 'Bodyweight / Free Weights',
  },
  Back: {
    mistakes: [
      'Pulling with your forearms/hands rather than driving back through your elbows.',
      'Using torso momentum or swinging backwards to heave the load.',
      'Shrugging shoulders into ears instead of depressing shoulder blades downward.',
    ],
    breathing: 'Inhale as your arms extend into full lat stretch. Exhale completely as you drive your elbows back and squeeze your lats.',
    tempo: '2-1-2 (2s pull, 1s peak contraction hold, 2s slow release)',
    mechanics: 'Compound Movement',
    equipment: 'Cable / Dumbbell / Barbell',
  },
  Shoulders: {
    mistakes: [
      'Leaning torso backward to turn an overhead press into an incline chest press.',
      'Dropping weights too fast without resisting the eccentric phase.',
      'Allowing wrists to bend backward under the dumbbell handles.',
    ],
    breathing: 'Take a deep breath and brace your core at bottom. Exhale through the sticking point to full overhead extension.',
    tempo: '3-0-1 (3s lowering, 0s pause, 1s upward drive)',
    mechanics: 'Compound / Isolation',
    equipment: 'Dumbbells / Bodyweight',
  },
  Arms: {
    mistakes: [
      'Swinging hips or letting elbows drift forward to complete curls.',
      'Flaring elbows outward during tricep dips or extensions.',
      'Partial range of motion skipping the bottom stretch.',
    ],
    breathing: 'Exhale smoothly during peak squeeze/contraction. Inhale as you return arm to full stretch.',
    tempo: '2-1-2 (2s concentric, 1s squeeze, 2s eccentric)',
    mechanics: 'Isolation Movement',
    equipment: 'Dumbbells / Cable',
  },
  Abs: {
    mistakes: [
      'Pulling forward on head/neck with hands instead of flexing the torso.',
      'Letting lower back arch off floor, transferring load to hip flexors.',
      'Holding breath instead of expelling air on crunch contraction.',
    ],
    breathing: 'Exhale every ounce of air out of your lungs at peak crunch for maximum deep core contraction. Inhale as you extend.',
    tempo: '2-2-2 (2s lift, 2s hard contraction hold, 2s return)',
    mechanics: 'Core Stabilization',
    equipment: 'Mat / Bodyweight',
  },
  Legs: {
    mistakes: [
      'Knees caving inward (valgus collapse); always drive knees outward over pinky toes.',
      'Heels lifting off the floor during squats or lunges.',
      'Rounding the lower back when descending into deep hip flexion.',
    ],
    breathing: 'Big intra-abdominal breath before descent; brace core hard; exhale forcefully driving back through mid-foot and heels.',
    tempo: '3-1-1 (3s descent, 1s pause in the hole, 1s explosive rise)',
    mechanics: 'Compound Kinetic Chain',
    equipment: 'Bodyweight / Barbell',
  },
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { isPremium } = usePremium();
  const { customWorkouts, addExerciseToWorkout } = useCustomWorkouts();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddToWorkoutModal, setShowAddToWorkoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'mistakes' | 'breathing'>('steps');

  const [exercise, setExercise] = useState<ExerciseDetail>(() => {
    return FAKE_EXERCISES.find((e) => e.id === params.id) || FAKE_EXERCISES[0];
  });

  useEffect(() => {
    if (params.id) {
      workoutService.getExerciseById(params.id).then((found) => {
        if (found) setExercise(found);
      });
    }
  }, [params.id]);

  const isLocked = exercise.isPremium && !isPremium;
  const guideData = EXERCISE_PRO_GUIDES[exercise.bodyPart] || EXERCISE_PRO_GUIDES.Chest;

  const handleSelectWorkout = async (workoutId: string, workoutName: string) => {
    setShowAddToWorkoutModal(false);
    await addExerciseToWorkout(workoutId, exercise);
    setToastMessage(`Added to ${workoutName}! 💪`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCreateNewWorkout = () => {
    setShowAddToWorkoutModal(false);
    router.push({
      pathname: '/create-workout',
      params: { initialExerciseId: exercise.id },
    });
  };

  const handleStartExerciseNow = () => {
    router.push({
      pathname: '/active-workout' as any,
      params: { exerciseId: exercise.id },
    });
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Header Bar with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddToWorkoutModal(true)}
          style={styles.bookmarkHeaderBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Media Section: Video or Locked Preview */}
      {isLocked ? (
        <View style={styles.lockedMediaContainer}>
          <Image
            source={{ uri: exercise.thumbnail }}
            style={styles.lockedThumbnail}
            resizeMode="cover"
          />
          <View style={styles.lockedOverlay}>
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.lockedTitle}>Premium Exercise</Text>
            <Text style={styles.lockedSub}>
              Unlock this HD video guide and all 36+ exercises with SweatFlix PRO.
            </Text>
            <Button
              title="Unlock with Premium"
              variant="primary"
              style={styles.unlockButton}
              onPress={() => router.push('/premium')}
            />
          </View>
        </View>
      ) : (
        <WorkoutVideoPlayer
          videoUrl={exercise.videoUrl}
          thumbnail={exercise.thumbnail}
          workoutName={exercise.name}
          duration={3}
          kcal={exercise.kcal}
          level={exercise.level}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastCard}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Title & Muscle Badges */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.exerciseNameText}>{exercise.name}</Text>
          {exercise.isPremium && (
            <View style={styles.proPill}>
              <Text style={styles.proPillText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Quick Specs Tags */}
        <View style={styles.specsRow}>
          <View style={styles.specTag}>
            <Ionicons name="fitness-outline" size={13} color={Colors.primary} />
            <Text style={styles.specTagText}>{exercise.bodyPart}</Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons name="speedometer-outline" size={13} color={Colors.accent} />
            <Text style={styles.specTagText}>{exercise.level}</Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons name="flame-outline" size={13} color="#FF5A00" />
            <Text style={styles.specTagText}>~{exercise.kcal} kcal</Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons name="repeat-outline" size={13} color={Colors.textGrey} />
            <Text style={styles.specTagText}>{exercise.reps}</Text>
          </View>
        </View>
      </View>

      {/* 2. Interactive Anatomical Muscle Map Section */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>MUSCLE ENGAGEMENT MAP</Text>
            <Text style={styles.sectionSubtitle}>
              Targeted muscle groups highlighted in high definition
            </Text>
          </View>
          <View style={styles.anatomyBadge}>
            <Ionicons name="body" size={14} color={Colors.primary} />
            <Text style={styles.anatomyBadgeText}>3D Anatomy</Text>
          </View>
        </View>

        <AnatomyBodyMap
          bodyPart={exercise.bodyPart}
          height={240}
          width={160}
          showToggle={true}
        />
      </View>

      {/* 3. Mechanics & Equipment Specifications Card */}
      <Card style={styles.mechanicsCard}>
        <View style={styles.mechanicItem}>
          <Text style={styles.mechanicLabel}>Mechanics</Text>
          <Text style={styles.mechanicValue}>{guideData.mechanics}</Text>
        </View>
        <View style={styles.mechanicDivider} />
        <View style={styles.mechanicItem}>
          <Text style={styles.mechanicLabel}>Equipment</Text>
          <Text style={styles.mechanicValue}>{guideData.equipment}</Text>
        </View>
        <View style={styles.mechanicDivider} />
        <View style={styles.mechanicItem}>
          <Text style={styles.mechanicLabel}>Tempo</Text>
          <Text style={styles.mechanicValue}>{guideData.tempo.split(' ')[0]}</Text>
        </View>
      </Card>

      {/* 4. Segmented Tabs: Steps | Form Tips | Breathing */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.guideTab, activeTab === 'steps' && styles.guideTabActive]}
          onPress={() => setActiveTab('steps')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.guideTabText,
              activeTab === 'steps' && styles.guideTabTextActive,
            ]}
          >
            How To Perform
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.guideTab, activeTab === 'mistakes' && styles.guideTabActive]}
          onPress={() => setActiveTab('mistakes')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.guideTabText,
              activeTab === 'mistakes' && styles.guideTabTextActive,
            ]}
          >
            Form & Mistakes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.guideTab, activeTab === 'breathing' && styles.guideTabActive]}
          onPress={() => setActiveTab('breathing')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.guideTabText,
              activeTab === 'breathing' && styles.guideTabTextActive,
            ]}
          >
            Breathing & Tempo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content Display */}
      {activeTab === 'steps' && (
        <Card style={styles.tabContentCard}>
          <Text style={styles.tabContentHeading}>Step-by-Step Instructions</Text>
          {exercise.steps.map((step, idx) => (
            <View key={idx} style={styles.stepItemRow}>
              <View style={styles.stepIndexCircle}>
                <Text style={styles.stepIndexText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepDescText}>{step}</Text>
            </View>
          ))}
        </Card>
      )}

      {activeTab === 'mistakes' && (
        <Card style={styles.tabContentCard}>
          <Text style={styles.tabContentHeading}>Common Form Mistakes To Avoid</Text>
          {guideData.mistakes.map((mistake, idx) => (
            <View key={idx} style={styles.mistakeItemRow}>
              <Ionicons name="close-circle" size={18} color={Colors.primary} style={styles.mistakeIcon} />
              <Text style={styles.mistakeDescText}>{mistake}</Text>
            </View>
          ))}
        </Card>
      )}

      {activeTab === 'breathing' && (
        <Card style={styles.tabContentCard}>
          <Text style={styles.tabContentHeading}>Breathing Rhythm & Tempo</Text>
          <View style={styles.breathingBox}>
            <Ionicons name="leaf-outline" size={24} color="#10B981" />
            <View style={styles.breathingTextWrap}>
              <Text style={styles.breathingSubHeading}>Respiration Cadence</Text>
              <Text style={styles.breathingDescText}>{guideData.breathing}</Text>
            </View>
          </View>

          <View style={[styles.breathingBox, { marginTop: Spacing.sm }]}>
            <Ionicons name="speedometer-outline" size={24} color={Colors.accent} />
            <View style={styles.breathingTextWrap}>
              <Text style={styles.breathingSubHeading}>Eccentric / Concentric Tempo</Text>
              <Text style={styles.breathingDescText}>{guideData.tempo}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* 5. Bottom Interactive Action Row */}
      <View style={styles.bottomActionsRow}>
        <Button
          title="Start Live Sets"
          variant="primary"
          style={styles.startNowBtn}
          icon={<Ionicons name="play" size={18} color="#FFFFFF" />}
          onPress={handleStartExerciseNow}
        />

        <Button
          title="+ Add to Workout"
          variant="secondary"
          style={styles.addRoutineBtn}
          onPress={() => setShowAddToWorkoutModal(true)}
        />
      </View>

      {/* Add To Workout Modal */}
      <Modal
        visible={showAddToWorkoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddToWorkoutModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Custom Routine</Text>
              <TouchableOpacity
                onPress={() => setShowAddToWorkoutModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select a routine to add &ldquo;{exercise.name}&rdquo;
            </Text>

            <ScrollView style={styles.modalScroll}>
              {customWorkouts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.workoutOption}
                  onPress={() => handleSelectWorkout(w.id, w.name)}
                >
                  <View style={styles.workoutOptionLeft}>
                    <Ionicons name="barbell" size={20} color={Colors.primary} />
                    <View>
                      <Text style={styles.workoutOptionTitle}>{w.name}</Text>
                      <Text style={styles.workoutOptionSub}>
                        {w.exercises.length} exercises • ~{w.estimatedDuration} min
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="add" size={20} color={Colors.primary} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.createNewBtn}
                onPress={handleCreateNewWorkout}
              >
                <Ionicons name="add-circle" size={20} color={Colors.primary} />
                <Text style={styles.createNewText}>Create New Workout Routine</Text>
              </TouchableOpacity>
            </ScrollView>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  bookmarkHeaderBtn: {
    padding: 8,
  },
  lockedMediaContainer: {
    width: '100%',
    height: 240,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    marginBottom: Spacing.md,
  },
  lockedThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  lockedTitle: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
  },
  lockedSub: {
    color: '#CCCCCC',
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  unlockButton: {
    minWidth: 200,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    gap: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  titleSection: {
    marginVertical: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  exerciseNameText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    flex: 1,
    letterSpacing: -0.5,
  },
  proPill: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proPillText: {
    color: '#1A1A1A',
    fontWeight: Typography.weights.heavy,
    fontSize: 11,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  specTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  specTagText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  sectionWrap: {
    marginVertical: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  anatomyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  anatomyBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  mechanicsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: '#F8F9FA',
  },
  mechanicItem: {
    flex: 1,
    alignItems: 'center',
  },
  mechanicLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.semiBold,
    textTransform: 'uppercase',
  },
  mechanicValue: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginTop: 2,
    textAlign: 'center',
  },
  mechanicDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: Spacing.md,
  },
  guideTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  guideTabActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  guideTabText: {
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textGrey,
  },
  guideTabTextActive: {
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
  },
  tabContentCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tabContentHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  stepIndexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepIndexText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  stepDescText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textDark,
    lineHeight: 19,
    flex: 1,
  },
  mistakeItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  mistakeIcon: {
    marginTop: 2,
  },
  mistakeDescText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textDark,
    lineHeight: 19,
    flex: 1,
  },
  breathingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  breathingTextWrap: {
    flex: 1,
  },
  breathingSubHeading: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 2,
  },
  breathingDescText: {
    fontSize: 11,
    color: Colors.textGrey,
    lineHeight: 16,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  startNowBtn: {
    flex: 1.2,
  },
  addRoutineBtn: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.card,
    borderTopRightRadius: BorderRadius.card,
    padding: Spacing.lg,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginBottom: Spacing.md,
  },
  modalScroll: {
    maxHeight: 320,
  },
  workoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  workoutOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  workoutOptionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  workoutOptionSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  createNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 8,
    marginTop: Spacing.sm,
  },
  createNewText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
});
