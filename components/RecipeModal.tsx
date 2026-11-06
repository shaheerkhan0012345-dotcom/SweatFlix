import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { PakistaniMeal } from '../data/pakistaniDietData';
import { AsianMeal } from '../data/asianDietData';
import { getVerifiedMealImage, resolveSafeImageSource } from '../constants/mealImages';

interface RecipeModalProps {
  visible: boolean;
  meal: AsianMeal | PakistaniMeal | any | null;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  cost?: number;
  currencySymbol?: string;
  isEaten?: boolean;
  onClose: () => void;
  onToggleEaten?: (mealId: string) => void;
  onReplace?: (meal: any) => void;
  onAskAi?: (meal: any) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  visible,
  meal,
  kcal,
  protein,
  carbs,
  fat,
  cost,
  currencySymbol = '$',
  isEaten = false,
  onClose,
  onToggleEaten,
  onReplace,
  onAskAi,
}) => {
  const { colors, isDarkMode } = useTheme();

  if (!meal) return null;

  const displayKcal = kcal !== undefined ? kcal : meal.baseKcal;
  const displayProtein = protein !== undefined ? protein : meal.baseProtein;
  const displayCarbs = carbs !== undefined ? carbs : meal.baseCarbs;
  const displayFat = fat !== undefined ? fat : meal.baseFat;
  const displayCost =
    cost !== undefined
      ? cost
      : (meal.costUsd || meal.ingredients.reduce((s: number, i: any) => s + (i.costUsd || i.costPkr || 0), 0));

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header Bar */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                {meal.type.toUpperCase()} RECIPE
              </Text>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                {meal.title}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close recipe"
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Hero Image */}
            <View style={styles.heroImageWrapper}>
              <Image
                source={resolvedImage}
                style={styles.heroImage}
                contentFit="cover"
                transition={250}
                cachePolicy="disk"
              />
              <View style={styles.imageOverlayStrip}>
                <View style={styles.timeBadge}>
                  <Ionicons name="stopwatch-outline" size={13} color="#FFFFFF" />
                  <Text style={styles.timeBadgeText}>{meal.prepTime}</Text>
                </View>
                <View style={styles.costBadge}>
                  <Text style={styles.costBadgeText}>
                    {currencySymbol === '$' ? `$${Number(displayCost).toFixed(2)}` : `${currencySymbol} ${displayCost}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Serving Size Info */}
            <View style={[styles.servingBanner, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <Ionicons name="restaurant-outline" size={16} color={Colors.primary} />
              <Text style={[styles.servingBannerText, { color: colors.text }]}>
                Recommended Portion: <Text style={{ fontWeight: '700' }}>{meal.servingSize || '1 Standard Serving'}</Text>
              </Text>
            </View>

            {/* Nutrition Grid */}
            <View style={[styles.nutritionGrid, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
              <View style={styles.nutCol}>
                <Text style={[styles.nutVal, { color: colors.text }]}>{displayKcal}</Text>
                <Text style={[styles.nutLabel, { color: colors.textSecondary }]}>CALORIES</Text>
              </View>
              <View style={[styles.nutDivider, { backgroundColor: colors.border }]} />
              <View style={styles.nutCol}>
                <Text style={[styles.nutVal, { color: Colors.primary }]}>{displayProtein}g</Text>
                <Text style={[styles.nutLabel, { color: colors.textSecondary }]}>PROTEIN</Text>
              </View>
              <View style={[styles.nutDivider, { backgroundColor: colors.border }]} />
              <View style={styles.nutCol}>
                <Text style={[styles.nutVal, { color: '#F59E0B' }]}>{displayCarbs}g</Text>
                <Text style={[styles.nutLabel, { color: colors.textSecondary }]}>CARBS</Text>
              </View>
              <View style={[styles.nutDivider, { backgroundColor: colors.border }]} />
              <View style={styles.nutCol}>
                <Text style={[styles.nutVal, { color: '#10B981' }]}>{displayFat}g</Text>
                <Text style={[styles.nutLabel, { color: colors.textSecondary }]}>FATS</Text>
              </View>
            </View>

            {/* Ingredients List */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Ingredients &amp; Portions
              </Text>
              <View style={[styles.ingredientsList, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
                {meal.ingredients.map((ing: any) => (
                  <View key={ing.id} style={[styles.ingredientItemRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.ingredientLeft}>
                      <View style={styles.greenDot} />
                      <Text style={[styles.ingredientName, { color: colors.text }]}>
                        {ing.name}{' '}
                        <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>({ing.portion})</Text>
                      </Text>
                    </View>
                    <Text style={styles.ingredientCost}>
                      {currencySymbol === '$'
                        ? `$${Number(ing.costUsd !== undefined ? ing.costUsd : (ing.costPkr ? ing.costPkr * 0.012 : 0.45)).toFixed(2)}`
                        : `${currencySymbol} ${ing.costPkr}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Preparation Instructions */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Step-by-Step Recipe Instructions
              </Text>
              <View style={styles.stepsContainer}>
                {meal.instructions.map((step: string, idx: number) => (
                  <View key={idx} style={styles.stepRow}>
                    <View style={[styles.stepNumberBadge, { backgroundColor: Colors.primary }]}>
                      <Text style={styles.stepNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.textSecondary }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Budget / Cooking Tip */}
            {meal.budgetTips ? (
              <View style={[styles.tipCard, { backgroundColor: isDarkMode ? '#1C2E2A' : '#ECFDF5', borderColor: '#10B981' }]}>
                <Ionicons name="bulb-outline" size={18} color="#10B981" />
                <Text style={styles.tipCardText}>{meal.budgetTips}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={[styles.footerBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            {onToggleEaten && (
              <TouchableOpacity
                style={[
                  styles.footerBtn,
                  styles.footerEatenBtn,
                  { backgroundColor: isEaten ? '#10B981' : isDarkMode ? '#064E3B40' : '#ECFDF5' },
                ]}
                onPress={() => onToggleEaten(meal.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isEaten ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={18}
                  color={isEaten ? '#FFFFFF' : '#10B981'}
                />
                <Text
                  style={[
                    styles.footerBtnText,
                    { color: isEaten ? '#FFFFFF' : '#10B981', fontWeight: '700' },
                  ]}
                >
                  {isEaten ? 'Eaten ✓' : 'Mark as Eaten'}
                </Text>
              </TouchableOpacity>
            )}

            {onReplace && (
              <TouchableOpacity
                style={[styles.footerBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                onPress={() => {
                  onClose();
                  onReplace(meal);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={17} color={colors.text} />
                <Text style={[styles.footerBtnText, { color: colors.text }]}>Replace</Text>
              </TouchableOpacity>
            )}

            {onAskAi && (
              <TouchableOpacity
                style={[styles.footerBtn, { backgroundColor: isDarkMode ? '#3B1824' : '#FFE4E6' }]}
                onPress={() => {
                  onClose();
                  onAskAi(meal);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={16} color={Colors.primary} />
                <Text style={[styles.footerBtnText, { color: Colors.primary }]}>Ask AI</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scrollBody: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroImageWrapper: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A15',
    marginBottom: Spacing.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayStrip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  costBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  costBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  servingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 8,
    marginBottom: Spacing.md,
  },
  servingBannerText: {
    fontSize: 13,
  },
  nutritionGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  nutCol: {
    flex: 1,
    alignItems: 'center',
  },
  nutVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  nutLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  nutDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  ingredientsList: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  ingredientItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: '600',
  },
  ingredientCost: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  stepsContainer: {
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 10,
    marginTop: Spacing.xs,
  },
  tipCardText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 18,
    fontWeight: '500',
  },
  footerBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  footerEatenBtn: {
    flex: 1.4,
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
