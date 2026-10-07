import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AdBanner } from '../../components/AdBanner';
import { Button } from '../../components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { usePremium } from '../../context/PremiumContext';
import { ExerciseDetail } from '../../data/fakeData';
import { workoutService } from '../../services/workoutService';
import { getExercise3DAsset } from '../../constants/exerciseImages';

const BODY_PART_CHIPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Abs', 'Legs'] as const;

export default function ExploreScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();

  const [exercises, setExercises] = useState<ExerciseDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('All');

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workoutService.getExercises();
      setExercises(data);
    } catch (e: any) {
      console.warn('Error loading exercises:', e);
      setError('Unable to load exercises. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Filter exercises by body part and search query
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesCategory =
        selectedBodyPart === 'All' || exercise.bodyPart === selectedBodyPart;
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        exercise.bodyPart.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [exercises, selectedBodyPart, searchQuery]);

  const handleExercisePress = (exercise: ExerciseDetail) => {
    router.push({
      pathname: '/exercise-detail',
      params: { id: exercise.id },
    });
  };

  const renderExerciseCard = ({ item }: { item: ExerciseDetail }) => {
    const isLocked = item.isPremium && !isPremium;

    const exerciseImg = getExercise3DAsset(item.bodyPart, item.thumbnail);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleExercisePress(item)}
        style={styles.card}
      >
        <View style={styles.thumbnailWrap}>
          <Image
            source={exerciseImg}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          {/* 3D Badge */}
          <View style={styles.badge3D}>
            <Text style={styles.badge3DText}>3D</Text>
          </View>

          {/* Level Tag */}
          <View style={styles.levelTag}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>

          {/* Locked / PRO Badge */}
          {isLocked ? (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
              <Text style={styles.lockText}>PRO</Text>
            </View>
          ) : item.isPremium ? (
            <View style={styles.unlockedProBadge}>
              <Text style={styles.unlockedProText}>PRO</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.metaItem}>
              <Ionicons name="body-outline" size={14} color={Colors.textGrey} />
              <Text style={styles.metaText}>{item.bodyPart}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={14} color={Colors.primary} />
              <Text style={styles.kcalText}>{item.kcal} kcal</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer scrollable={false} edges={['left', 'right']} style={styles.screen}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Exercises</Text>
        <Text style={styles.subtitle}>
          Browse video-guided movements by muscle group
        </Text>
      </View>

      {/* 2. Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textGrey} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by exercise or muscle..."
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

      {/* 3. Horizontal Body Part Chips */}
      <View style={styles.chipsContainer}>
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
      </View>

      {/* 4. Exercise Grid or Loading/Error State */}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Loading exercise library...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.textGrey} />
          <Text style={styles.errorTitle}>Connection Problem</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Button
            title="Try again"
            onPress={fetchExercises}
            style={styles.tryAgainButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={48} color={Colors.textGrey} />
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or filter by another body part.
              </Text>
            </View>
          }
          ListFooterComponent={<AdBanner />}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGrey,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardLight,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 46,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
  },
  chipsContainer: {
    marginBottom: Spacing.sm,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: Colors.cardLight,
    borderColor: '#EAEAEA',
  },
  chipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: Colors.textDark,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl + 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  thumbnailWrap: {
    width: '100%',
    height: 110,
    backgroundColor: Colors.cardLight,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  levelTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  lockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  unlockedProBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  unlockedProText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardContent: {
    padding: Spacing.sm,
  },
  exerciseName: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  kcalText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  stateText: {
    fontSize: 13,
    color: Colors.textGrey,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  tryAgainButton: {
    marginTop: Spacing.lg,
    width: 140,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGrey,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  badge3D: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badge3DText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
