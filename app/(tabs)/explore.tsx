import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { ExerciseDetail, FAKE_EXERCISES } from '../../data/fakeData';
import { workoutService } from '../../services/workoutService';
import { getExercise3DAsset, getExerciseThumbnailAsset } from '../../constants/exerciseImages';

const BODY_PART_CHIPS = ['All', 'Shoulders', 'Chest', 'Back', 'Arms', 'Abs', 'Legs'] as const;

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTabMode, setActiveTabMode] = useState<'routine' | 'library'>('routine');
  const [exercises, setExercises] = useState<ExerciseDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('All');
  const [legsExpanded, setLegsExpanded] = useState(true);
  const [abdomenExpanded, setAbdomenExpanded] = useState(true);

  useEffect(() => {
    let isMounted = true;
    workoutService
      .getExercises()
      .then((data) => {
        if (isMounted) {
          setExercises(data);
          setIsLoading(false);
        }
      })
      .catch((e: any) => {
        console.warn('Error loading exercises:', e);
        if (isMounted) {
          setExercises(FAKE_EXERCISES);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter exercises for library tab
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesCategory =
        selectedBodyPart === 'All' || exercise.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase();
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        exercise.bodyPart.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [exercises, selectedBodyPart, searchQuery]);

  const handleOpenExerciseDetail = (exerciseId: string) => {
    router.push({
      pathname: '/exercise-detail',
      params: { id: exerciseId },
    });
  };

  // Shoulder routine exercises matching canonical library IDs
  const shoulderRoutine = useMemo(
    () => [
      {
        exerciseId: 'shoulders-overhead-press',
        name: 'Overhead Dumbbell Press',
        sets: 3,
        reps: 10,
        weight: '20 LBS',
        bodyPart: 'Shoulders',
        subMuscles: 'Shoulders, Triceps',
      },
      {
        exerciseId: 'shoulders-lateral-raise',
        name: 'Dumbbell Lateral Raises',
        sets: 3,
        reps: 10,
        weight: '5 LBS',
        bodyPart: 'Shoulders',
        subMuscles: 'Shoulders, Side Delts',
      },
      {
        exerciseId: 'shoulders-rear-delt-fly',
        name: 'Rear Delt Flyes',
        sets: 3,
        reps: 10,
        weight: '20 LBS',
        bodyPart: 'Shoulders',
        subMuscles: 'Rear Delts, Upper Back',
      },
    ],
    []
  );

  // Legs routine exercises
  const legRoutine = useMemo(
    () => [
      {
        exerciseId: 'legs-bulgarian-split',
        name: 'Barbell High Bar Squat',
        sets: 3,
        reps: 10,
        weight: '45 LBS',
        bodyPart: 'Legs',
        subMuscles: 'Quadriceps, Glutes',
      },
      {
        exerciseId: 'legs-romanian-deadlift',
        name: 'Dumbbell Romanian Deadlift',
        sets: 3,
        reps: 10,
        weight: '30 LBS',
        bodyPart: 'Legs',
        subMuscles: 'Hamstrings, Glutes',
      },
    ],
    []
  );

  // Abdomen routine exercises
  const abdomenRoutine = useMemo(
    () => [
      {
        exerciseId: 'abs-bicycle-crunches',
        name: 'Standard Abdominal Crunch',
        sets: 3,
        reps: 15,
        weight: 'Bodyweight',
        bodyPart: 'Abs',
        subMuscles: 'Rectus Abdominis',
      },
      {
        exerciseId: 'abs-plank',
        name: 'Forearm Core Plank Hold',
        sets: 3,
        reps: 30,
        weight: 'Secs',
        bodyPart: 'Abs',
        subMuscles: 'Transverse Abdominis',
      },
    ],
    []
  );

  return (
    <View style={styles.rootScreen}>
      <ScreenContainer
        scrollable
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 28) + 90 },
        ]}
      >
        {/* 1. Header Bar matching media_1791375057919.jpg */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Today&apos;s Workout</Text>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setActiveTabMode('library')}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/premium')}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Top View Switcher (Today's Routine vs All Movements) */}
        <View style={styles.viewModeSwitcher}>
          <TouchableOpacity
            style={[
              styles.viewModeBtn,
              activeTabMode === 'routine' && styles.viewModeBtnActive,
            ]}
            onPress={() => setActiveTabMode('routine')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.viewModeText,
                activeTabMode === 'routine' && styles.viewModeTextActive,
              ]}
            >
              Today&apos;s Routine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeBtn,
              activeTabMode === 'library' && styles.viewModeBtnActive,
            ]}
            onPress={() => setActiveTabMode('library')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.viewModeText,
                activeTabMode === 'library' && styles.viewModeTextActive,
              ]}
            >
              Exercise Library
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* VIEW 1: TODAY'S ROUTINE TIMELINE (matching media_1791375057919.jpg) */}
        {/* ========================================================= */}
        {activeTabMode === 'routine' ? (
          <View style={styles.timelineSection}>
            <View style={styles.timelineContainer}>
              <View style={styles.verticalSpineLine} />

              {shoulderRoutine.map((ex, index) => {
                const exercise3D =
                  getExerciseThumbnailAsset(ex.exerciseId) ||
                  getExerciseThumbnailAsset(ex.name) ||
                  getExercise3DAsset(ex.bodyPart, ex.name);
                return (
                  <View key={`${ex.exerciseId}-${index}`} style={styles.timelineNode}>
                    <View style={styles.timelineDot} />

                    <View style={styles.referenceCard}>
                      <TouchableOpacity
                        style={styles.cardUpperSection}
                        onPress={() => handleOpenExerciseDetail(ex.exerciseId)}
                        activeOpacity={0.88}
                      >
                        {/* 3D Movement Figure on Clean White Canvas */}
                        <View style={styles.characterContainer}>
                          <Image
                            source={exercise3D}
                            style={styles.characterImg}
                            contentFit="contain"
                            cachePolicy="memory-disk"
                            priority="high"
                          />
                        </View>

                        {/* Right Info + Sets Table */}
                        <View style={styles.cardContentRight}>
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
                  onPress={() => {
                    setSelectedBodyPart('Legs');
                    setActiveTabMode('library');
                  }}
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
                {legRoutine.map((ex, index) => {
                  const exercise3D =
                    getExerciseThumbnailAsset(ex.exerciseId) ||
                    getExerciseThumbnailAsset(ex.name) ||
                    getExercise3DAsset(ex.bodyPart, ex.name);
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
                              priority="high"
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
                  onPress={() => {
                    setSelectedBodyPart('Abs');
                    setActiveTabMode('library');
                  }}
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
                {abdomenRoutine.map((ex, index) => {
                  const exercise3D =
                    getExerciseThumbnailAsset(ex.exerciseId) ||
                    getExerciseThumbnailAsset(ex.name) ||
                    getExercise3DAsset(ex.bodyPart, ex.name);
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
                              priority="high"
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
        ) : (
          /* ========================================================= */
          /* VIEW 2: EXERCISE LIBRARY WITH SEARCH & MUSCLE CHIPS */
          /* ========================================================= */
          <View style={styles.librarySection}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.textGrey} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by movement or muscle..."
                placeholderTextColor={Colors.textGrey}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={18} color={Colors.textGrey} />
                </TouchableOpacity>
              )}
            </View>

            {/* Body Part Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {BODY_PART_CHIPS.map((chip) => {
                const isSelected = selectedBodyPart === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    activeOpacity={0.8}
                    onPress={() => setSelectedBodyPart(chip)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Exercises List in library */}
            {isLoading ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading 3D movements...</Text>
              </View>
            ) : (
              filteredExercises.map((item) => {
                const exerciseImg =
                  getExerciseThumbnailAsset(item.id) ||
                  getExercise3DAsset(item.bodyPart, item.name || item.thumbnail);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.libraryCard}
                    onPress={() => handleOpenExerciseDetail(item.id)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.libraryImgWrap}>
                      <Image
                        source={exerciseImg}
                        style={styles.libraryImg}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                        priority="high"
                      />
                    </View>

                    <View style={styles.libraryCardContent}>
                      <Text style={styles.libraryTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.libraryMetaRow}>
                        <View style={styles.muscleTagPill}>
                          <Text style={styles.muscleTagPillText}>{item.bodyPart}</Text>
                        </View>
                        <Text style={styles.libraryMetaText}>{item.level}</Text>
                        <Text style={styles.libraryMetaText}>~{item.kcal} kcal</Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScreenContainer>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  viewModeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textGrey,
  },
  viewModeTextActive: {
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
  },
  timelineSection: {
    marginTop: Spacing.xs,
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
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E5252A',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exactOfferSubText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  librarySection: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  chipsScroll: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: '#F1F5F9',
  },
  chipText: {
    fontSize: 12,
    fontWeight: Typography.weights.semiBold,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
  },
  chipTextUnselected: {
    color: Colors.textGrey,
  },
  centerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    color: Colors.textGrey,
    fontSize: 13,
  },
  libraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  libraryImgWrap: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  libraryImg: {
    width: '90%',
    height: '90%',
  },
  libraryCardContent: {
    flex: 1,
  },
  libraryTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 4,
  },
  libraryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  libraryMetaText: {
    fontSize: 11,
    color: Colors.textGrey,
  },
});
