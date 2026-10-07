import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Image,
  Vibration,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AnatomyBodyMap } from '../components/AnatomyBodyMap';
import { useHomeProgress } from '../context/HomeProgressContext';
import { useCustomWorkouts } from '../context/CustomWorkoutsContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { workoutService } from '../services/workoutService';
import {
  FAKE_WORKOUTS,
  FAKE_EXERCISES,
  WorkoutItem,
  ExerciseDetail,
} from '../data/fakeData';

interface LoggedSet {
  setNumber: number;
  weight: string;
  reps: string;
  isCompleted: boolean;
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workoutId?: string; exerciseId?: string }>();
  const { markTodayAsDone } = useHomeProgress();
  const { getWorkoutById } = useCustomWorkouts();
  const { settings } = useSettings();
  const { user } = useAuth();

  // Find workout or single exercise
  const targetWorkout = useMemo<WorkoutItem | null>(() => {
    if (params.workoutId) {
      const custom = getWorkoutById(params.workoutId);
      if (custom) {
        return {
          id: custom.id,
          name: custom.name,
          duration: custom.estimatedDuration,
          kcal: custom.estimatedKcal,
          level: 'Intermediate',
          category: 'Full Body',
          thumbnail: custom.exercises[0]?.thumbnail || '',
          videoUrl: '',
          exercises: custom.exercises.map((e, idx) => ({
            id: e.exerciseId || `custom-ex-${idx}`,
            name: e.name,
            sets: e.sets || 3,
            reps: String(e.reps || '12 reps'),
          })),
        };
      }
      return FAKE_WORKOUTS.find((w) => w.id === params.workoutId) || FAKE_WORKOUTS[0];
    }
    return FAKE_WORKOUTS[0];
  }, [params.workoutId, getWorkoutById]);

  // Single exercise fallback
  const singleExercise = useMemo<ExerciseDetail | null>(() => {
    if (params.exerciseId) {
      return FAKE_EXERCISES.find((e) => e.id === params.exerciseId) || FAKE_EXERCISES[0];
    }
    return null;
  }, [params.exerciseId]);

  // Workout exercises list
  const exercisesList = useMemo(() => {
    if (singleExercise) {
      return [
        {
          id: singleExercise.id,
          name: singleExercise.name,
          sets: 3,
          reps: singleExercise.reps || '12 reps',
          bodyPart: singleExercise.bodyPart,
          thumbnail: singleExercise.thumbnail,
        },
      ];
    }
    return (targetWorkout?.exercises || []).map((ex) => {
      const foundDetail = FAKE_EXERCISES.find((d) => d.id === ex.id || d.name === ex.name);
      return {
        ...ex,
        bodyPart: foundDetail?.bodyPart || targetWorkout?.category || 'Chest',
        thumbnail:
          foundDetail?.thumbnail ||
          targetWorkout?.thumbnail ||
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
      };
    });
  }, [singleExercise, targetWorkout]);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const activeEx = exercisesList[currentExerciseIndex] || exercisesList[0];

  // Set logging state map: { [exerciseIndex]: LoggedSet[] }
  const [setsByExercise, setSetsByExercise] = useState<Record<number, LoggedSet[]>>(() => {
    const initial: Record<number, LoggedSet[]> = {};
    exercisesList.forEach((ex, idx) => {
      const count = ex.sets || 3;
      const initialSets: LoggedSet[] = [];
      for (let s = 1; s <= count; s++) {
        initialSets.push({
          setNumber: s,
          weight: '20',
          reps: '12',
          isCompleted: false,
        });
      }
      initial[idx] = initialSets;
    });
    return initial;
  });

  // Elapsed workout timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Rest Timer State
  const defaultRestDuration = Number(settings.workoutSettings.restTimer) || 45;
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(defaultRestDuration);
  const restTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isResting) {
      if (restSecondsRemaining <= 0) {
        setIsResting(false);
        if (settings.workoutSettings.vibration) {
          Vibration.vibrate([0, 200, 100, 200]);
        }
        return;
      }
      restTimerRef.current = setTimeout(() => {
        setRestSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [isResting, restSecondsRemaining, settings.workoutSettings.vibration]);

  const startRestTimer = (seconds = defaultRestDuration) => {
    setRestSecondsRemaining(seconds);
    setIsResting(true);
  };

  const handleToggleSetComplete = (setIndex: number) => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      const targetSet = currentSets[setIndex];
      if (!targetSet) return prev;

      const willBeCompleted = !targetSet.isCompleted;
      currentSets[setIndex] = {
        ...targetSet,
        isCompleted: willBeCompleted,
      };

      if (willBeCompleted) {
        if (settings.workoutSettings.vibration) {
          Vibration.vibrate(50);
        }
        startRestTimer(defaultRestDuration);
      }

      return {
        ...prev,
        [currentExerciseIndex]: currentSets,
      };
    });
  };

  const handleUpdateWeight = (setIndex: number, text: string) => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      if (!currentSets[setIndex]) return prev;
      currentSets[setIndex] = { ...currentSets[setIndex], weight: text };
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  const handleUpdateReps = (setIndex: number, text: string) => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      if (!currentSets[setIndex]) return prev;
      currentSets[setIndex] = { ...currentSets[setIndex], reps: text };
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  const handleAddSet = () => {
    setSetsByExercise((prev) => {
      const currentSets = prev[currentExerciseIndex] ? [...prev[currentExerciseIndex]] : [];
      const nextNum = currentSets.length + 1;
      const lastWeight = currentSets[currentSets.length - 1]?.weight || '20';
      const lastReps = currentSets[currentSets.length - 1]?.reps || '12';
      currentSets.push({
        setNumber: nextNum,
        weight: lastWeight,
        reps: lastReps,
        isCompleted: false,
      });
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  // Workout Summary Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [workoutSummaryStats, setWorkoutSummaryStats] = useState({
    durationStr: '00:00',
    totalSets: 0,
    totalVolumeKg: 0,
    kcalBurned: 0,
  });

  const handleFinishWorkout = async () => {
    // Calculate total stats
    let totalCompletedSets = 0;
    let volumeKg = 0;

    Object.values(setsByExercise).forEach((sets) => {
      sets.forEach((s) => {
        if (s.isCompleted) {
          totalCompletedSets++;
          const weightNum = parseFloat(s.weight) || 0;
          const repsNum = parseInt(s.reps, 10) || 0;
          volumeKg += weightNum * repsNum;
        }
      });
    });

    const calculatedKcal = Math.round(
      targetWorkout?.kcal || singleExercise?.kcal || Math.max(80, Math.round((elapsedSeconds / 60) * 8))
    );

    const stats = {
      durationStr: formatTime(elapsedSeconds),
      totalSets: totalCompletedSets,
      totalVolumeKg: Math.round(volumeKg),
      kcalBurned: calculatedKcal,
    };

    setWorkoutSummaryStats(stats);
    setShowSummaryModal(true);

    // Persist to HomeProgressContext and Supabase
    const workoutName = targetWorkout?.name || singleExercise?.name || 'Workout Session';
    await markTodayAsDone(workoutName, calculatedKcal);

    if (user?.id) {
      workoutService.saveSession(
        user.id,
        workoutName,
        calculatedKcal,
        targetWorkout?.id || singleExercise?.id || null
      ).catch(console.warn);
    }
  };

  const handleConfirmExit = () => {
    Alert.alert(
      'Exit Workout?',
      'Are you sure you want to end your current active session? Progress for uncompleted sets will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const currentSets = setsByExercise[currentExerciseIndex] || [];
  const completedSetsCount = currentSets.filter((s) => s.isCompleted).length;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={handleConfirmExit}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.workoutNameText} numberOfLines={1}>
            {targetWorkout?.name || singleExercise?.name || 'Active Session'}
          </Text>
          <View style={styles.timerBadge}>
            <Ionicons name="stopwatch-outline" size={14} color={Colors.primary} />
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleFinishWorkout}
          style={styles.finishHeaderBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.finishHeaderBtnText}>FINISH</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Exercise Indicator & Muscle Pill */}
        <View style={styles.exerciseNavRow}>
          <Text style={styles.exerciseCountText}>
            EXERCISE {currentExerciseIndex + 1} OF {exercisesList.length}
          </Text>
          <View style={styles.bodyPartPill}>
            <Ionicons name="fitness-outline" size={13} color={Colors.primary} />
            <Text style={styles.bodyPartPillText}>{activeEx.bodyPart}</Text>
          </View>
        </View>

        {/* 3. Active Exercise Showcase Card */}
        <Card style={styles.exerciseHeroCard}>
          <View style={styles.exerciseHeroTop}>
            <Image
              source={{ uri: activeEx.thumbnail }}
              style={styles.exerciseHeroImage}
              resizeMode="cover"
            />
            <View style={styles.exerciseHeroInfo}>
              <Text style={styles.activeExerciseTitle}>{activeEx.name}</Text>
              <Text style={styles.activeExerciseTarget}>
                Target: {activeEx.reps} • {activeEx.sets} sets
              </Text>
              <Text style={styles.completedCountNote}>
                {completedSetsCount} / {currentSets.length} sets completed
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. Rest Timer Bar (Visible when resting) */}
        {isResting && (
          <View style={styles.restTimerBanner}>
            <View style={styles.restTimerLeft}>
              <View style={styles.restPulseDot} />
              <Text style={styles.restTitle}>RESTING INTERVAL</Text>
              <Text style={styles.restSecondsText}>
                {restSecondsRemaining}s
              </Text>
            </View>

            <View style={styles.restTimerControls}>
              <TouchableOpacity
                style={styles.restAdjustBtn}
                onPress={() => setRestSecondsRemaining((prev) => Math.max(5, prev - 15))}
              >
                <Text style={styles.restAdjustText}>-15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restAdjustBtn}
                onPress={() => setRestSecondsRemaining((prev) => prev + 15)}
              >
                <Text style={styles.restAdjustText}>+15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipRestBtn}
                onPress={() => setIsResting(false)}
              >
                <Text style={styles.skipRestText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 5. Interactive Set Logger Table */}
        <Card style={styles.setTableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { width: 36 }]}>SET</Text>
            <Text style={[styles.colHeader, { flex: 1 }]}>WEIGHT (KG)</Text>
            <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
            <Text style={[styles.colHeader, { width: 44, textAlign: 'center' }]}>DONE</Text>
          </View>

          {currentSets.map((s, idx) => (
            <View
              key={s.setNumber}
              style={[
                styles.setRow,
                s.isCompleted && styles.setRowCompleted,
              ]}
            >
              <View style={styles.setNumberCircle}>
                <Text style={styles.setNumberText}>{s.setNumber}</Text>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.inputBox, s.isCompleted && styles.inputCompleted]}
                  value={s.weight}
                  keyboardType="numeric"
                  onChangeText={(txt) => handleUpdateWeight(idx, txt)}
                  placeholder="0"
                  placeholderTextColor={Colors.textGrey}
                />
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.inputBox, s.isCompleted && styles.inputCompleted]}
                  value={s.reps}
                  keyboardType="numeric"
                  onChangeText={(txt) => handleUpdateReps(idx, txt)}
                  placeholder="0"
                  placeholderTextColor={Colors.textGrey}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.checkBtn,
                  s.isCompleted ? styles.checkBtnDone : styles.checkBtnPending,
                ]}
                onPress={() => handleToggleSetComplete(idx)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={s.isCompleted ? 'checkmark' : 'checkmark-outline'}
                  size={18}
                  color={s.isCompleted ? '#FFFFFF' : Colors.textGrey}
                />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Set Button */}
          <TouchableOpacity
            style={styles.addSetBtn}
            onPress={handleAddSet}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.addSetBtnText}>+ Add Set</Text>
          </TouchableOpacity>
        </Card>

        {/* 6. Anatomy Muscles Visual Preview */}
        <View style={styles.anatomySection}>
          <Text style={styles.anatomyTitle}>Muscles Engaged This Movement</Text>
          <AnatomyBodyMap
            bodyPart={activeEx.bodyPart}
            height={200}
            width={140}
            showToggle={true}
          />
        </View>

        {/* 7. Bottom Navigation Between Exercises */}
        <View style={styles.bottomNavRow}>
          <Button
            title="‹ Previous"
            variant="secondary"
            disabled={currentExerciseIndex === 0}
            style={styles.navBtn}
            onPress={() => {
              if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex((prev) => prev - 1);
              }
            }}
          />

          {currentExerciseIndex < exercisesList.length - 1 ? (
            <Button
              title="Next Exercise ›"
              variant="primary"
              style={styles.navBtn}
              onPress={() => {
                setCurrentExerciseIndex((prev) => prev + 1);
              }}
            />
          ) : (
            <Button
              title="Complete Workout 🏆"
              variant="primary"
              style={styles.navBtn}
              onPress={handleFinishWorkout}
            />
          )}
        </View>
      </ScrollView>

      {/* 8. Victory Workout Summary Modal */}
      <Modal
        visible={showSummaryModal}
        transparent
        animationType="slide"
        onRequestClose={() => router.replace('/(tabs)')}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={44} color="#FFD700" />
            </View>

            <Text style={styles.modalTitle}>Workout Finished!</Text>
            <Text style={styles.modalSub}>
              Crushed another high-energy session. Consistency builds champions!
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.statBoxNum}>{workoutSummaryStats.durationStr}</Text>
                <Text style={styles.statBoxLabel}>Total Time</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="layers-outline" size={20} color={Colors.accent} />
                <Text style={styles.statBoxNum}>{workoutSummaryStats.totalSets}</Text>
                <Text style={styles.statBoxLabel}>Sets Finished</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="barbell-outline" size={20} color="#10B981" />
                <Text style={styles.statBoxNum}>{workoutSummaryStats.totalVolumeKg} kg</Text>
                <Text style={styles.statBoxLabel}>Total Volume</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="flame-outline" size={20} color="#FF5A00" />
                <Text style={styles.statBoxNum}>{workoutSummaryStats.kcalBurned} kcal</Text>
                <Text style={styles.statBoxLabel}>Burned</Text>
              </View>
            </View>

            <Button
              title="Done & Return Home"
              variant="primary"
              style={styles.returnHomeBtn}
              onPress={() => {
                setShowSummaryModal(false);
                router.replace('/(tabs)');
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: Colors.background,
  },
  closeBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  workoutNameText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timerText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  finishHeaderBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  finishHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 48,
  },
  exerciseNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  exerciseCountText: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.8,
  },
  bodyPartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  bodyPartPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  exerciseHeroCard: {
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  exerciseHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  exerciseHeroImage: {
    width: 74,
    height: 74,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EAEAEA',
  },
  exerciseHeroInfo: {
    flex: 1,
  },
  activeExerciseTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  activeExerciseTarget: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },
  completedCountNote: {
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
    color: Colors.accent,
    marginTop: 4,
  },
  restTimerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  restTimerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  restTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  restSecondsText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  restTimerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restAdjustBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  restAdjustText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  skipRestBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  skipRestText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  setTableCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: Spacing.xs,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6',
  },
  setRowCompleted: {
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
  },
  setNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  setNumberText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  inputWrap: {
    flex: 1,
    paddingHorizontal: 4,
  },
  inputBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  inputCompleted: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    color: '#15803D',
  },
  checkBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  checkBtnPending: {
    backgroundColor: '#F1F5F9',
  },
  checkBtnDone: {
    backgroundColor: '#10B981',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    gap: 6,
  },
  addSetBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  anatomySection: {
    marginBottom: Spacing.md,
  },
  anatomyTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  bottomNavRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  navBtn: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  modalSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  statBoxNum: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 4,
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
    color: Colors.textGrey,
    marginTop: 1,
  },
  returnHomeBtn: {
    width: '100%',
  },
});
