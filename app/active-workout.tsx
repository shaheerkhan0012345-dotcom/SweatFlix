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
import Svg, { Circle, G } from 'react-native-svg';
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
import { getExercise3DAsset } from '../constants/exerciseImages';

interface LoggedSet {
  setNumber: number;
  weight: string;
  reps: string;
  isCompleted: boolean;
}

const REST_OPTIONS = [
  { label: '15 sec', value: 15 },
  { label: '30 sec', value: 30 },
  { label: '45 sec (RECOMMENDED)', value: 45 },
  { label: '1 min', value: 60 },
  { label: '2 mins', value: 120 },
  { label: '3 mins', value: 180 },
];

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
  const [restDuration, setRestDuration] = useState<number>(45);
  const [showRestModal, setShowRestModal] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(45);
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

  const startRestTimer = (seconds = restDuration) => {
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
        startRestTimer(restDuration);
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
      'Are you sure you want to end your active session? Uncompleted sets will not be recorded.',
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
  const active3DImage = getExercise3DAsset(activeEx.bodyPart, activeEx.thumbnail);

  // Circular timer calculations
  const timerRadius = 70;
  const timerStrokeWidth = 10;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerPercent = restDuration > 0 ? restSecondsRemaining / restDuration : 0;
  const timerStrokeDashoffset = timerCircumference - timerCircumference * timerPercent;

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
        {/* 2. Exercise Indicator & Rest Interval Setting Button */}
        <View style={styles.exerciseNavRow}>
          <Text style={styles.exerciseCountText}>
            EXERCISE {currentExerciseIndex + 1} OF {exercisesList.length}
          </Text>

          <TouchableOpacity
            style={styles.restConfigPill}
            onPress={() => setShowRestModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="hourglass-outline" size={13} color={Colors.primary} />
            <Text style={styles.restConfigText}>Rest: {restDuration}s</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 3. 3D Athletic Movement Showcase Card (Gym Faction Style with SweatFlix Theme) */}
        <Card style={styles.exerciseHeroCard}>
          <View style={styles.image3DWrap}>
            <Image
              source={active3DImage}
              style={styles.image3D}
              resizeMode="cover"
            />
            <View style={styles.modelTagOverlay}>
              <View style={styles.pulseDot} />
              <Text style={styles.modelTagText}>3D ANATOMICAL ACTIVE</Text>
            </View>
          </View>

          <View style={styles.exerciseInfoArea}>
            <View style={styles.exerciseTitleRow}>
              <Text style={styles.activeExerciseTitle}>{activeEx.name}</Text>
              <View style={styles.bodyPartPill}>
                <Text style={styles.bodyPartPillText}>{activeEx.bodyPart}</Text>
              </View>
            </View>

            {/* 3 Stat Boxes matching reference video */}
            <View style={styles.statBoxesRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>REPS</Text>
                <Text style={styles.statBoxVal}>{activeEx.reps}</Text>
              </View>
              <View style={styles.statBoxDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>WEIGHT</Text>
                <Text style={styles.statBoxVal}>20 LBS</Text>
              </View>
              <View style={styles.statBoxDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>STEP</Text>
                <Text style={styles.statBoxVal}>
                  {completedSetsCount + 1}/{currentSets.length}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 4. Circular Rest Countdown Overlay / Card (When Resting) */}
        {isResting && (
          <Card style={styles.circularRestCard}>
            <Text style={styles.restTitle}>REST INTERVAL COUNTDOWN</Text>

            <View style={styles.circularTimerWrap}>
              <Svg width={160} height={160}>
                <G rotation="-90" origin="80, 80">
                  <Circle
                    cx={80}
                    cy={80}
                    r={timerRadius}
                    stroke="#F1F5F9"
                    strokeWidth={timerStrokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={80}
                    cy={80}
                    r={timerRadius}
                    stroke={Colors.primary}
                    strokeWidth={timerStrokeWidth}
                    strokeDasharray={`${timerCircumference} ${timerCircumference}`}
                    strokeDashoffset={timerStrokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </G>
              </Svg>

              <View style={styles.circularTimerCenter}>
                <Text style={styles.circularTimerNum}>{restSecondsRemaining}</Text>
                <Text style={styles.circularTimerUnit}>SECONDS</Text>
              </View>
            </View>

            {/* Quick Adjustment Controls */}
            <View style={styles.restControlsRow}>
              <TouchableOpacity
                style={styles.restAdjBtn}
                onPress={() => setRestSecondsRemaining((prev) => Math.max(5, prev - 15))}
                activeOpacity={0.7}
              >
                <Text style={styles.restAdjBtnText}>-15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipRestBtn}
                onPress={() => setIsResting(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-skip-forward" size={16} color="#FFFFFF" />
                <Text style={styles.skipRestBtnText}>Skip Rest</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restAdjBtn}
                onPress={() => setRestSecondsRemaining((prev) => prev + 15)}
                activeOpacity={0.7}
              >
                <Text style={styles.restAdjBtnText}>+15s</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* 5. Interactive Set Logger Table */}
        <Card style={styles.setTableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { width: 44 }]}>SET</Text>
            <Text style={[styles.colHeader, { flex: 1 }]}>WEIGHT (LBS)</Text>
            <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
            <Text style={[styles.colHeader, { width: 48, textAlign: 'center' }]}>DONE</Text>
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
                  placeholder="20"
                  placeholderTextColor={Colors.textGrey}
                />
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.inputBox, s.isCompleted && styles.inputCompleted]}
                  value={s.reps}
                  keyboardType="numeric"
                  onChangeText={(txt) => handleUpdateReps(idx, txt)}
                  placeholder="12"
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
                  name={s.isCompleted ? 'checkmark' : 'ellipse-outline'}
                  size={20}
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
              title="Finish Workout ✓"
              variant="primary"
              style={styles.navBtn}
              onPress={handleFinishWorkout}
            />
          )}
        </View>
      </ScrollView>

      {/* Rest Interval Selection Modal (From Video) */}
      <Modal visible={showRestModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.restModalCard}>
            <View style={styles.restModalHeader}>
              <Text style={styles.restModalTitle}>Set Rest Duration</Text>
              <TouchableOpacity
                onPress={() => setShowRestModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.restModalSubtitle}>
              Choose how long you pause between sets to maximize hypertrophy and endurance.
            </Text>

            <View style={styles.restOptionsList}>
              {REST_OPTIONS.map((opt) => {
                const isSelected = restDuration === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.restOptionItem,
                      isSelected && styles.restOptionItemActive,
                    ]}
                    onPress={() => {
                      setRestDuration(opt.value);
                      setShowRestModal(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.restOptionText,
                        isSelected && styles.restOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Workout Complete Summary Modal */}
      <Modal visible={showSummaryModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.summaryModalCard}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={40} color="#FFD700" />
            </View>

            <Text style={styles.summaryModalTitle}>Workout Crushed! 🔥</Text>
            <Text style={styles.summaryModalSub}>
              Tremendous discipline. Your progress has been logged to your daily streak and Supabase records.
            </Text>

            <View style={styles.summaryStatsGrid}>
              <View style={styles.summaryStatBox}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.durationStr}</Text>
                <Text style={styles.summaryStatLabel}>Duration</Text>
              </View>

              <View style={styles.summaryStatBox}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.totalSets}</Text>
                <Text style={styles.summaryStatLabel}>Sets Done</Text>
              </View>

              <View style={styles.summaryStatBox}>
                <Ionicons name="barbell-outline" size={20} color={Colors.accent} />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.totalVolumeKg} LBS</Text>
                <Text style={styles.summaryStatLabel}>Volume</Text>
              </View>

              <View style={styles.summaryStatBox}>
                <Ionicons name="flame-outline" size={20} color="#EF4444" />
                <Text style={styles.summaryStatVal}>{workoutSummaryStats.kcalBurned} kcal</Text>
                <Text style={styles.summaryStatLabel}>Burned</Text>
              </View>
            </View>

            <Button
              title="Return to Home"
              variant="primary"
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
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  workoutNameText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
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
    color: Colors.primary,
    fontWeight: Typography.weights.heavy,
  },
  finishHeaderBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  finishHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 20,
  },
  exerciseNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  exerciseCountText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.5,
  },
  restConfigPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  restConfigText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  exerciseHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  image3DWrap: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  image3D: {
    width: '100%',
    height: '100%',
  },
  modelTagOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  modelTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  exerciseInfoArea: {
    padding: Spacing.md,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activeExerciseTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    flex: 1,
  },
  bodyPartPill: {
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bodyPartPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  statBoxesRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.button,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.bold,
  },
  statBoxVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: 2,
  },
  statBoxDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  circularRestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFEAEA',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  circularTimerWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    marginVertical: 4,
  },
  circularTimerCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTimerNum: {
    fontSize: 38,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  circularTimerUnit: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
    letterSpacing: 1,
  },
  restControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.md,
  },
  restAdjBtn: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restAdjBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  skipRestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  skipRestBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  setTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: Colors.textGrey,
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  setRowCompleted: {
    opacity: 0.85,
  },
  setNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  inputWrap: {
    flex: 1,
  },
  inputBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
    fontWeight: Typography.weights.semiBold,
  },
  inputCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnPending: {
    backgroundColor: '#F8F9FA',
  },
  checkBtnDone: {
    backgroundColor: '#10B981',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  addSetBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  anatomySection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  anatomyTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  bottomNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.sm,
  },
  navBtn: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  restModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
  },
  restModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restModalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  restModalSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginBottom: Spacing.lg,
  },
  restOptionsList: {
    gap: 10,
  },
  restOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: BorderRadius.button,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restOptionItemActive: {
    backgroundColor: '#FFEAEA',
    borderColor: Colors.primary,
  },
  restOptionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  restOptionTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  summaryModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  summaryModalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginBottom: 6,
  },
  summaryModalSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  summaryStatBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  summaryStatVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: Colors.textGrey,
  },
});
