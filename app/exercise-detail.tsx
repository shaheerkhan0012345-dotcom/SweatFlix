import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventListener } from 'expo';
import { ScreenContainer } from '../components/ScreenContainer';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AnatomyBodyMap } from '../components/AnatomyBodyMap';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useCustomWorkouts } from '../context/CustomWorkoutsContext';
import { FAKE_EXERCISES, ExerciseDetail } from '../data/fakeData';
import { workoutService, resolveExerciseDetail } from '../services/workoutService';
import {
  getMuscleThumbnailsForBodyPart,
  getExerciseLocalVideoAsset,
  getExerciseThumbnailAsset,
} from '../constants/exerciseImages';

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
    breathing: 'Inhale deeply as you lower the weight (eccentric phase). Exhale forcefully as you press up.',
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
    breathing: 'Inhale as your arms extend into full lat stretch. Exhale completely as you drive elbows back.',
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
    breathing: 'Take a deep breath and brace your core at bottom. Exhale through the sticking point overhead.',
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
    breathing: 'Exhale every ounce of air out of your lungs at peak crunch. Inhale as you extend.',
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
    breathing: 'Big breath before descent; brace core hard; exhale forcefully driving back through mid-foot.',
    tempo: '3-1-1 (3s descent, 1s pause in the hole, 1s explosive rise)',
    mechanics: 'Compound Kinetic Chain',
    equipment: 'Bodyweight / Barbell',
  },
};

interface SetRecord {
  setNumber: number;
  reps: number;
  weight: number;
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { customWorkouts, addExerciseToWorkout } = useCustomWorkouts();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddToWorkoutModal, setShowAddToWorkoutModal] = useState(false);
  const [showEditSetsModal, setShowEditSetsModal] = useState(false);
  const [isHowToPerformOpen, setIsHowToPerformOpen] = useState(true);

  const [prevParamId, setPrevParamId] = useState(params.id);
  const [exercise, setExercise] = useState<ExerciseDetail>(() => {
    return resolveExerciseDetail(params.id);
  });

  // Dynamic Sets state (defaults matching screen recording: 10 Reps, 20 LBS)
  const [setsData, setSetsData] = useState<SetRecord[]>(() => {
    const initialDetail = resolveExerciseDetail(params.id);
    const repsNum = parseInt(String(initialDetail.reps || '10').replace(/\D/g, ''), 10) || 10;
    return [
      { setNumber: 1, reps: repsNum, weight: 20 },
      { setNumber: 2, reps: repsNum, weight: 20 },
      { setNumber: 3, reps: repsNum, weight: 20 },
    ];
  });

  // Adjust state during render when route param changes (Official React pattern)
  if (params.id !== prevParamId) {
    setPrevParamId(params.id);
    const synchronousDetail = resolveExerciseDetail(params.id);
    setExercise(synchronousDetail);
    const repsNum = parseInt(String(synchronousDetail.reps || '10').replace(/\D/g, ''), 10) || 10;
    setSetsData([
      { setNumber: 1, reps: repsNum, weight: 20 },
      { setNumber: 2, reps: repsNum, weight: 20 },
      { setNumber: 3, reps: repsNum, weight: 20 },
    ]);
  }

  useEffect(() => {
    if (params.id) {
      let isMounted = true;
      workoutService.getExerciseById(params.id).then((found) => {
        if (isMounted && found) {
          setExercise(found);
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [params.id]);

  const guideData = EXERCISE_PRO_GUIDES[exercise.bodyPart] || EXERCISE_PRO_GUIDES.Chest;

  const muscleRailItems = useMemo(() => {
    return getMuscleThumbnailsForBodyPart(exercise.bodyPart);
  }, [exercise.bodyPart]);

  // Video source resolution: prioritize canonical exercise ID and local bundled asset for 0ms playback and 0% failure
  const rawVideoIdentifier = useMemo(() => {
    if (exercise.id) return exercise.id;
    if (exercise.videoUrl && !exercise.videoUrl.startsWith('http')) return exercise.videoUrl;
    return exercise.name;
  }, [exercise.id, exercise.videoUrl, exercise.name]);

  const currentVideoSource = useMemo(
    () => getExerciseLocalVideoAsset(rawVideoIdentifier, exercise.bodyPart),
    [rawVideoIdentifier, exercise.bodyPart]
  );
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const controlsTimeoutRef = useRef<any>(null);

  const posterThumb = useMemo(() => {
    return getExerciseThumbnailAsset(rawVideoIdentifier, exercise.thumbnail, exercise.bodyPart);
  }, [rawVideoIdentifier, exercise.thumbnail, exercise.bodyPart]);

  const videoPlayer = useVideoPlayer(currentVideoSource, (p) => {
    p.loop = true;
    p.muted = isMuted;
    try {
      p.play();
    } catch (e) {
      console.warn('Exercise detail video play err:', e);
    }
  });

  useEventListener(videoPlayer, 'playingChange', ({ isPlaying: playing }) => {
    setIsPlaying(playing);
  });

  const togglePlay = () => {
    if (!videoPlayer) return;
    try {
      if (isPlaying) {
        videoPlayer.pause();
        setIsPlaying(false);
        setShowControlsOverlay(true);
      } else {
        videoPlayer.play();
        setIsPlaying(true);
        setShowControlsOverlay(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControlsOverlay(false);
        }, 2500);
      }
    } catch (e) {
      console.warn('togglePlay error:', e);
    }
  };

  const toggleControls = () => {
    setShowControlsOverlay((prev) => !prev);
  };

  const toggleMute = () => {
    if (!videoPlayer) return;
    try {
      const nextMuted = !isMuted;
      // eslint-disable-next-line react-hooks/immutability
      videoPlayer.muted = nextMuted;
      setIsMuted(nextMuted);
    } catch {}
  };

  // Screen Focus Lifecycle: Play when focused, pause when navigated away to free native decoder
  useFocusEffect(
    useCallback(() => {
      try {
        if (videoPlayer) {
          videoPlayer.play();
        }
      } catch {}

      return () => {
        try {
          videoPlayer?.pause();
        } catch {}
      };
    }, [videoPlayer])
  );

  const lastVideoSourceRef = useRef(currentVideoSource);
  // Keep videoPlayer in sync when currentVideoSource changes (e.g. state updates or next/prev navigation)
  useEffect(() => {
    if (videoPlayer && currentVideoSource && lastVideoSourceRef.current !== currentVideoSource) {
      lastVideoSourceRef.current = currentVideoSource;
      try {
        if (typeof (videoPlayer as any).replaceAsync === 'function') {
          (videoPlayer as any)
            .replaceAsync(currentVideoSource)
            .then(() => {
              (videoPlayer as any).play();
            })
            .catch(() => {});
        } else if (typeof (videoPlayer as any).replace === 'function') {
          (videoPlayer as any).replace(currentVideoSource);
          (videoPlayer as any).play();
        }
      } catch (err) {
        console.warn('Video replace error in exercise-detail:', err);
      }
    }
  }, [currentVideoSource, videoPlayer]);

  useEventListener(videoPlayer, 'statusChange', ({ status, error }) => {
    if (status === 'readyToPlay') {
      try {
        videoPlayer.play();
      } catch {}
    } else if (status === 'error') {
      console.warn('Video error on source:', error);
      const safeAsset = getExerciseLocalVideoAsset(rawVideoIdentifier);
      if (videoPlayer && safeAsset) {
        try {
          if (typeof (videoPlayer as any).replaceAsync === 'function') {
            (videoPlayer as any)
              .replaceAsync(safeAsset)
              .then(() => {
                (videoPlayer as any).play();
              })
              .catch(() => {});
          } else if (typeof (videoPlayer as any).replace === 'function') {
            (videoPlayer as any).replace(safeAsset);
            (videoPlayer as any).play();
          }
        } catch (e) {
          console.warn('Video recovery failed:', e);
          setLoadError(true);
        }
      } else {
        setLoadError(true);
      }
    }
  });

  // Exercises list for previous / next navigation
  const currentExIndex = useMemo(() => {
    const idx = FAKE_EXERCISES.findIndex((e) => e.id === exercise.id);
    return idx >= 0 ? idx : 0;
  }, [exercise.id]);

  const totalExercisesCount = FAKE_EXERCISES.length || 8;

  const handlePrevExercise = () => {
    if (currentExIndex > 0) {
      const prevEx = FAKE_EXERCISES[currentExIndex - 1];
      setExercise(prevEx);
    }
  };

  const handleNextExercise = () => {
    if (currentExIndex < FAKE_EXERCISES.length - 1) {
      const nextEx = FAKE_EXERCISES[currentExIndex + 1];
      setExercise(nextEx);
    }
  };

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
    try {
      videoPlayer?.pause();
    } catch {}
    router.push({
      pathname: '/active-workout' as any,
      params: { exerciseId: exercise.id },
    });
  };

  const handleMarkComplete = () => {
    setToastMessage(`Set completed! Great form 💪`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <View style={styles.rootScreen}>
      <ScreenContainer
        scrollable
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 16) + 120 },
        ]}
      >
        {/* 1. Top Header Bar matching recording screenshot media_1791375069225.jpg */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {exercise.name}
            </Text>
            <Text style={styles.headerCategorySubtitle}>
              {exercise.bodyPart.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowAddToWorkoutModal(true)}
            style={styles.infoCircleBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={20} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        {/* 2. Top Media Section: Real 3D Motion Video + Vertical Muscle Rail */}
        <View style={styles.showcaseSplitRow}>
          <View style={styles.showcaseMain}>
            <View style={styles.videoPlayerContainer}>
              {/* Layer 1: Instant Still Poster Underlay */}
              <Image
                source={posterThumb}
                style={styles.detailVideo}
                contentFit="contain"
                cachePolicy="memory-disk"
              />

              {/* Layer 2: Real Motion Video */}
              {!loadError && (
                <VideoView
                  style={[styles.detailVideo, StyleSheet.absoluteFill]}
                  player={videoPlayer}
                  surfaceType="textureView"
                  nativeControls={false}
                  contentFit="contain"
                />
              )}

              {/* Layer 3: Invisible Tap-to-Toggle Overlay */}
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={toggleControls}
              />

              {/* Layer 4: YouTube-Style Play/Pause Center Indicator */}
              {(!isPlaying || showControlsOverlay) && (
                <View style={styles.youtubeCenterOverlay} pointerEvents="box-none">
                  <TouchableOpacity
                    style={styles.youtubePlayCircle}
                    onPress={togglePlay}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={36}
                      color="#FFFFFF"
                      style={!isPlaying ? { marginLeft: 4 } : undefined}
                    />
                  </TouchableOpacity>
                  {!isPlaying && (
                    <Text style={styles.youtubeStatusText}>Tap to Play</Text>
                  )}
                </View>
              )}

              {/* Layer 5: Bottom Quick Control Pills */}
              <View style={styles.videoControlsBottomBar}>
                <TouchableOpacity
                  style={styles.videoControlPill}
                  onPress={togglePlay}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={14} color="#FFFFFF" />
                  <Text style={styles.videoControlPillText}>
                    {isPlaying ? 'Pause' : 'Play'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.videoControlPill}
                  onPress={toggleMute}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.videoControlPillText}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Layer 6: Tap to retry if video fails */}
              {loadError && (
                <TouchableOpacity
                  style={styles.reloadOverlay}
                  onPress={() => {
                    setLoadError(false);
                    try {
                      videoPlayer.replay();
                    } catch {}
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play-circle" size={44} color="#FFFFFF" />
                  <Text style={styles.reloadText}>Tap to Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Right Vertical Muscle Thumbnails Rail (responsive to active body part) */}
          <View style={styles.muscleThumbRail}>
            {muscleRailItems.map((item, idx) => (
              <View key={`${item.name}-${idx}`} style={styles.muscleThumbCard}>
                <Image
                  source={item.image}
                  style={styles.muscleThumbImg}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
                <Text style={styles.muscleThumbText} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Toast Notification */}
        {toastMessage && (
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* 3. Sets Section (Directly underneath Media player, matching Frame 30) */}
        <View style={styles.setsSectionCard}>
          <View style={styles.setsSectionHeader}>
            <Text style={styles.setsSectionTitle}>Sets</Text>
            <TouchableOpacity
              onPress={() => setShowEditSetsModal(true)}
              style={styles.setsEditBtnPill}
              activeOpacity={0.7}
            >
              <Text style={styles.setsEditBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {setsData.map((s) => (
            <View key={s.setNumber} style={styles.setRowCard}>
              <View style={styles.setCircleBadge}>
                <Text style={styles.setCircleBadgeText}>{s.setNumber}</Text>
              </View>

              <View style={styles.setColumn}>
                <Text style={styles.setColVal}>{s.reps}</Text>
                <Text style={styles.setColLabel}>Reps</Text>
              </View>

              <View style={styles.setColDivider} />

              <View style={styles.setColumn}>
                <Text style={styles.setColVal}>{s.weight}</Text>
                <Text style={styles.setColLabel}>LBS</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 4. "How to perform" Collapsible Accordion (matching recording screen) */}
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setIsHowToPerformOpen(!isHowToPerformOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionTitle}>How to perform</Text>
            <Ionicons
              name={isHowToPerformOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>

          {isHowToPerformOpen && (
            <View style={styles.accordionBody}>
              {/* Step by step list */}
              <Text style={styles.accordionSubHeading}>Step-by-Step Execution</Text>
              {exercise.steps.map((step, idx) => (
                <View key={idx} style={styles.stepItemRow}>
                  <View style={styles.stepIndexCircle}>
                    <Text style={styles.stepIndexText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepDescText}>{step}</Text>
                </View>
              ))}

              {/* Form mistakes */}
              <Text style={[styles.accordionSubHeading, { marginTop: Spacing.md }]}>
                Common Form Mistakes
              </Text>
              {guideData.mistakes.map((mistake, idx) => (
                <View key={idx} style={styles.mistakeItemRow}>
                  <Ionicons name="close-circle" size={16} color={Colors.primary} style={{ marginTop: 2 }} />
                  <Text style={styles.mistakeDescText}>{mistake}</Text>
                </View>
              ))}

              {/* Breathing & Tempo */}
              <View style={styles.breathingCard}>
                <View style={styles.breathingRow}>
                  <Ionicons name="leaf-outline" size={18} color="#10B981" />
                  <Text style={styles.breathingTitle}>Breathing Rhythm</Text>
                </View>
                <Text style={styles.breathingText}>{guideData.breathing}</Text>

                <View style={[styles.breathingRow, { marginTop: Spacing.sm }]}>
                  <Ionicons name="speedometer-outline" size={18} color={Colors.accent} />
                  <Text style={styles.breathingTitle}>Tempo Cadence</Text>
                </View>
                <Text style={styles.breathingText}>{guideData.tempo}</Text>
              </View>
            </View>
          )}
        </View>

        {/* 4.5. 3D Anatomy Body & Muscle Engagement */}
        <View style={styles.anatomySectionCard}>
          <View style={styles.anatomySectionHeader}>
            <Ionicons name="body" size={18} color={Colors.primary} />
            <Text style={styles.anatomySectionTitle}>3D Muscle Engagement</Text>
          </View>
          <Text style={styles.anatomySectionSubtitle}>
            Musculoskeletal regions activated during {exercise.name}
          </Text>
          <AnatomyBodyMap
            bodyPart={exercise.bodyPart}
            height={260}
            showToggle={true}
          />
        </View>
      </ScreenContainer>

      {/* 5. Fixed Sticky Bottom Bar (Above phone navigation, matching Frame 30) */}
      <View
        style={[
          styles.fixedBottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
        ]}
      >
        {/* Row 1: < Previous Exercise • 1 of 8 • Next Exercise > */}
        <View style={styles.navStepRow}>
          <TouchableOpacity
            style={styles.navStepBtn}
            onPress={handlePrevExercise}
            disabled={currentExIndex === 0}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navStepText,
                currentExIndex === 0 && { color: '#CBD5E1' },
              ]}
            >
              &lt; Previous Exercise
            </Text>
          </TouchableOpacity>

          <Text style={styles.navStepCounter}>
            {currentExIndex + 1} of {totalExercisesCount}
          </Text>

          <TouchableOpacity
            style={styles.navStepBtn}
            onPress={handleNextExercise}
            disabled={currentExIndex === totalExercisesCount - 1}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navStepText,
                { color: Colors.primary },
                currentExIndex === totalExercisesCount - 1 && { color: '#CBD5E1' },
              ]}
            >
              Next Exercise &gt;
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Dual Pill Buttons: Complete & Start Exercise */}
        <View style={styles.dualBottomRow}>
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleMarkComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startExerciseMainBtn}
            onPress={handleStartExerciseNow}
            activeOpacity={0.85}
          >
            <Text style={styles.startExerciseMainText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Sets Modal */}
      <Modal
        visible={showEditSetsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditSetsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Sets</Text>
              <TouchableOpacity onPress={() => setShowEditSetsModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {setsData.map((s, idx) => (
                <View key={s.setNumber} style={styles.editSetItemRow}>
                  <View style={styles.editSetBadge}>
                    <Text style={styles.editSetBadgeText}>Set {s.setNumber}</Text>
                  </View>
                  <View style={styles.editFieldWrap}>
                    <Text style={styles.editFieldLabel}>Reps:</Text>
                    <TextInput
                      style={styles.editInput}
                      keyboardType="numeric"
                      value={String(s.reps)}
                      onChangeText={(val) => {
                        const num = parseInt(val, 10) || 0;
                        setSetsData((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, reps: num } : item))
                        );
                      }}
                    />
                  </View>
                  <View style={styles.editFieldWrap}>
                    <Text style={styles.editFieldLabel}>LBS:</Text>
                    <TextInput
                      style={styles.editInput}
                      keyboardType="numeric"
                      value={String(s.weight)}
                      onChangeText={(val) => {
                        const num = parseInt(val, 10) || 0;
                        setSetsData((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, weight: num } : item))
                        );
                      }}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.saveEditSetsBtn}
              onPress={() => setShowEditSetsModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.saveEditSetsBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  headerCategorySubtitle: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  infoCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseSplitRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
    marginVertical: Spacing.xs,
    height: 224,
  },
  showcaseMain: {
    flex: 1,
    minWidth: 0,
    height: 224,
    borderRadius: BorderRadius.card,
    backgroundColor: '#0F172A',
  },
  videoPlayerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.card,
    position: 'relative',
    overflow: 'hidden',
  },
  youtubeCenterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 10,
  },
  youtubePlayCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  youtubeStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  videoControlsBottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 12,
  },
  videoControlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoControlPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  detailVideo: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.card,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  reloadOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 6,
  },
  reloadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  muscleThumbRail: {
    width: 76,
    height: 224,
    justifyContent: 'space-between',
  },
  muscleThumbCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    height: 68,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  muscleThumbImg: {
    width: 48,
    height: 38,
  },
  muscleThumbText: {
    fontSize: 9,
    color: Colors.textGrey,
    fontWeight: Typography.weights.semiBold,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 11,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    gap: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  setsSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  setsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  setsSectionTitle: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  setsEditBtnPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
  },
  setsEditBtnText: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
  },
  setRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  setCircleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCircleBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: Typography.weights.bold,
  },
  setColumn: {
    alignItems: 'center',
    flex: 1,
  },
  setColVal: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  setColLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
  setColDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  accordionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  accordionBody: {
    paddingTop: Spacing.xs,
  },
  accordionSubHeading: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  stepIndexCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  stepIndexText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  stepDescText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textDark,
    lineHeight: 18,
    flex: 1,
  },
  mistakeItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  mistakeDescText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textDark,
    lineHeight: 18,
    flex: 1,
  },
  breathingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  breathingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breathingTitle: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  breathingText: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 16,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navStepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navStepBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navStepText: {
    fontSize: 13,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textGrey,
  },
  navStepCounter: {
    fontSize: 12,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  dualBottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  completeBtn: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  startExerciseMainBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startExerciseMainText: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
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
    marginBottom: Spacing.sm,
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
  editSetItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  editSetBadge: {
    width: 60,
  },
  editSetBadgeText: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  editFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editFieldLabel: {
    fontSize: 13,
    color: Colors.textGrey,
  },
  editInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  saveEditSetsBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveEditSetsBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: 15,
  },
  anatomySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  anatomySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  anatomySectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  anatomySectionSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginBottom: Spacing.sm,
  },
});
