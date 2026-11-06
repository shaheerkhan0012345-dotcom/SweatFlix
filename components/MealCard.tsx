import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { PakistaniMeal } from '../data/pakistaniDietData';
import { AsianMeal } from '../data/asianDietData';
import { getVerifiedMealImage, resolveSafeImageSource } from '../constants/mealImages';

interface MealCardProps {
  meal: AsianMeal | PakistaniMeal | any;
  typeLabel: string;
  badgeColor: string;
  kcal: number;
  protein: number;
  carbs?: number;
  fat?: number;
  cost: number;
  currencySymbol?: string;
  isEaten: boolean;
  isSaved?: boolean;
  onViewRecipe: (meal: any) => void;
  onReplace: (meal: any) => void;
  onToggleEaten: (mealId: string) => void;
  onToggleSave?: (meal: any) => void;
  onAskAi?: (meal: any) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  typeLabel,
  badgeColor,
  kcal,
  protein,
  carbs,
  fat,
  cost,
  currencySymbol = '$',
  isEaten,
  isSaved = false,
  onViewRecipe,
  onReplace,
  onToggleEaten,
  onToggleSave,
  onAskAi,
}) => {
  const { colors, isDarkMode } = useTheme();

  // Resolve genuine authentic food photo with cuisine awareness
  const cuisine =
    meal.cuisine ||
    (meal.id && String(meal.id).startsWith('pk-')
      ? 'pakistani'
      : meal.id && String(meal.id).startsWith('uk-')
      ? 'british'
      : meal.id && String(meal.id).startsWith('us-')
      ? 'american'
      : 'asian');
  const verified = getVerifiedMealImage(meal.title, meal.type, cuisine);
  const rawImage = verified || meal.image;
  const resolvedImage = resolveSafeImageSource(rawImage);

  const formattedCost =
    currencySymbol === '$' ? `$${Number(cost || 0).toFixed(2)}` : `${currencySymbol} ${cost}`;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderColor: isEaten ? '#10B981' : colors.border,
        },
        isEaten && styles.cardContainerEaten,
      ]}
    >
      {/* Top Main Section: Image + Info */}
      <View style={styles.topRow}>
        {/* Consistent Rounded Image Thumbnail */}
        <View style={styles.imageWrapper}>
          <Image
            source={resolvedImage}
            style={styles.thumbnailImage}
            contentFit="cover"
            transition={200}
            cachePolicy="disk"
            accessibilityLabel={meal.title}
          />
          {isEaten && (
            <View style={styles.eatenBadgeOverlay}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
          )}
        </View>

        {/* Meal Details */}
        <View style={styles.infoCol}>
          {/* Header Strip: Slot Pill + Cost Badge */}
          <View style={styles.slotAndCostRow}>
            <View style={[styles.slotBadge, { backgroundColor: `${badgeColor}18` }]}>
              <Text style={[styles.slotBadgeText, { color: badgeColor }]} numberOfLines={1}>
                {typeLabel.toUpperCase()}
              </Text>
            </View>

            <View style={styles.costBadge}>
              <Text style={styles.costBadgeText} numberOfLines={1}>
                {formattedCost}
              </Text>
            </View>
          </View>

          {/* Dish Title */}
          <Text
            style={[styles.mealTitle, { color: colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {meal.title}
          </Text>

          {/* Portion Information */}
          <View style={styles.portionRow}>
            <Ionicons name="restaurant-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.portionText, { color: colors.textSecondary }]} numberOfLines={1}>
              {meal.servingSize || '1 Standard Serving'}
            </Text>
          </View>

          {/* Nutrition Summary: Calories & Protein */}
          <View style={styles.nutritionRow}>
            <View style={[styles.nutChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
              <Text style={[styles.nutChipText, { color: colors.text }]}>🔥 {kcal} kcal</Text>
            </View>
            <View style={[styles.nutChip, { backgroundColor: isDarkMode ? '#3B1824' : '#FFEAEA' }]}>
              <Text style={[styles.nutChipText, { color: Colors.primary }]}>💪 {protein}g</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons Strip - Compact, robustly responsive, no text spill */}
      <View style={[styles.actionStrip, { borderTopColor: colors.border }]}>
        {/* 1. View Recipe Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.recipeButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}
          onPress={() => onViewRecipe(meal)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`View Recipe for ${meal.title}`}
        >
          <Ionicons name="book-outline" size={14} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            Recipe
          </Text>
        </TouchableOpacity>

        {/* 2. Replace Meal Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.replaceButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}
          onPress={() => onReplace(meal)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Replace ${meal.title}`}
        >
          <Ionicons name="swap-horizontal-outline" size={14} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            Replace
          </Text>
        </TouchableOpacity>

        {/* 3. Mark as Eaten Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.eatenButton,
            { backgroundColor: isEaten ? '#10B981' : isDarkMode ? '#064E3B28' : '#ECFDF5' },
          ]}
          onPress={() => onToggleEaten(meal.id)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={isEaten ? 'Mark as Not Eaten' : 'Mark as Eaten'}
        >
          <Ionicons
            name={isEaten ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={14}
            color={isEaten ? '#FFFFFF' : '#10B981'}
          />
          <Text
            style={[
              styles.actionButtonText,
              styles.eatenButtonText,
              { color: isEaten ? '#FFFFFF' : '#10B981' },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isEaten ? 'Eaten ✓' : 'Mark Eaten'}
          </Text>
        </TouchableOpacity>

        {/* Optional Star / Save */}
        {onToggleSave && (
          <TouchableOpacity
            style={[styles.iconOnlyBtn, { backgroundColor: isSaved ? '#FEF3C7' : isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => onToggleSave(meal)}
            activeOpacity={0.7}
            accessibilityLabel={isSaved ? 'Unsave meal' : 'Save meal'}
          >
            <Ionicons
              name={isSaved ? 'star' : 'star-outline'}
              size={14}
              color={isSaved ? '#D97706' : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Optional Ask AI on this meal */}
        {onAskAi && (
          <TouchableOpacity
            style={[styles.iconOnlyBtn, { backgroundColor: isDarkMode ? '#3B1824' : '#FFE4E6' }]}
            onPress={() => onAskAi(meal)}
            activeOpacity={0.7}
            accessibilityLabel="Ask AI about this meal"
          >
            <Ionicons name="sparkles" size={13} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      },
    }),
  },
  cardContainerEaten: {
    borderColor: '#10B981',
  },
  topRow: {
    flexDirection: 'row',
    padding: Spacing.sm + 2,
    gap: Spacing.sm + 2,
  },
  imageWrapper: {
    width: 86,
    height: 86,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#0F172A15',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  eatenBadgeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  slotAndCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  slotBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  slotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  costBadge: {
    backgroundColor: '#10B98118',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  costBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 3,
    flexShrink: 1,
  },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  portionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  nutChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  nutChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 4,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.md,
    gap: 3,
  },
  recipeButton: {
    flex: 1,
  },
  replaceButton: {
    flex: 1,
  },
  eatenButton: {
    flex: 1.15,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eatenButtonText: {
    fontWeight: '700',
  },
  iconOnlyBtn: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
