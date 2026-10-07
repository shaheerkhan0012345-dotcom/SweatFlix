import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import Svg, { Circle, G } from 'react-native-svg';

interface MealSection {
  id: string;
  name: string;
  timeWindow: string;
  suggestedKcal: number;
  icon: keyof typeof Ionicons.glyphMap;
  foods: {
    id: string;
    name: string;
    portion: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    completed: boolean;
  }[];
}

const INITIAL_MEALS: MealSection[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    timeWindow: '8:00 - 8:30 AM',
    suggestedKcal: 480,
    icon: 'sunny-outline',
    foods: [
      {
        id: 'f-1',
        name: 'Rolled Oats with Whey Protein',
        portion: '60g oats + 1 scoop whey',
        kcal: 340,
        protein: 30,
        carbs: 45,
        fat: 4,
        completed: false,
      },
      {
        id: 'f-2',
        name: 'Blueberries & Chia Seeds',
        portion: '50g berries + 10g seeds',
        kcal: 140,
        protein: 3,
        carbs: 18,
        fat: 6,
        completed: false,
      },
    ],
  },
  {
    id: 'mid-meal',
    name: 'Mid-Meal Snack',
    timeWindow: '11:00 - 11:30 AM',
    suggestedKcal: 220,
    icon: 'cafe-outline',
    foods: [
      {
        id: 'f-3',
        name: 'Greek Yogurt with Crushed Almonds',
        portion: '150g yogurt + 12 almonds',
        kcal: 220,
        protein: 17,
        carbs: 10,
        fat: 12,
        completed: false,
      },
    ],
  },
  {
    id: 'lunch',
    name: 'Lunch',
    timeWindow: '12:30 - 2:30 PM',
    suggestedKcal: 620,
    icon: 'restaurant-outline',
    foods: [
      {
        id: 'f-4',
        name: 'Grilled Herb Chicken Breast',
        portion: '180g cooked chicken',
        kcal: 290,
        protein: 52,
        carbs: 0,
        fat: 6,
        completed: false,
      },
      {
        id: 'f-5',
        name: 'Steamed Brown Rice & Broccoli',
        portion: '150g rice + 100g broccoli',
        kcal: 330,
        protein: 8,
        carbs: 65,
        fat: 3,
        completed: false,
      },
    ],
  },
  {
    id: 'evening',
    name: 'Evening Pre-Workout',
    timeWindow: '4:00 - 5:30 PM',
    suggestedKcal: 260,
    icon: 'barbell-outline',
    foods: [
      {
        id: 'f-6',
        name: 'Ripe Banana with Natural Peanut Butter',
        portion: '1 banana + 1 tbsp peanut butter',
        kcal: 260,
        protein: 8,
        carbs: 34,
        fat: 9,
        completed: false,
      },
    ],
  },
  {
    id: 'dinner',
    name: 'Dinner',
    timeWindow: '8:00 - 9:30 PM',
    suggestedKcal: 480,
    icon: 'moon-outline',
    foods: [
      {
        id: 'f-7',
        name: 'Pan-Seared Atlantic Salmon / Cottage Cheese',
        portion: '160g fillet',
        kcal: 340,
        protein: 36,
        carbs: 0,
        fat: 18,
        completed: false,
      },
      {
        id: 'f-8',
        name: 'Roasted Sweet Potato & Asparagus',
        portion: '140g potato + greens',
        kcal: 140,
        protein: 3,
        carbs: 30,
        fat: 1,
        completed: false,
      },
    ],
  },
];

export default function DietScreen() {
  const { metrics, logMeal } = useHealthMetrics();

  const [meals, setMeals] = useState<MealSection[]>(INITIAL_MEALS);
  const [selectedMealTarget, setSelectedMealTarget] = useState<string>('breakfast');

  // Custom meal modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const toggleFoodComplete = async (mealId: string, foodId: string) => {
    let toggledItem: any = null;
    let willBeCompleted = false;

    setMeals((prevMeals) =>
      prevMeals.map((meal) => {
        if (meal.id !== mealId) return meal;
        return {
          ...meal,
          foods: meal.foods.map((food) => {
            if (food.id === foodId) {
              willBeCompleted = !food.completed;
              toggledItem = food;
              return { ...food, completed: willBeCompleted };
            }
            return food;
          }),
        };
      })
    );

    if (toggledItem) {
      const multiplier = willBeCompleted ? 1 : -1;
      await logMeal(
        multiplier * toggledItem.kcal,
        multiplier * toggledItem.protein,
        multiplier * toggledItem.carbs,
        multiplier * toggledItem.fat
      );
    }
  };

  const handleSaveCustomFood = async () => {
    const kcal = parseInt(customKcal, 10) || 0;
    const p = parseInt(customProtein, 10) || 0;
    const c = parseInt(customCarbs, 10) || 0;
    const f = parseInt(customFat, 10) || 0;
    const name = customFoodName.trim() || 'Custom Meal';

    if (kcal > 0 || p > 0 || c > 0 || f > 0) {
      const newFood = {
        id: `custom-${Date.now()}`,
        name,
        portion: '1 serving',
        kcal,
        protein: p,
        carbs: c,
        fat: f,
        completed: true,
      };

      setMeals((prevMeals) =>
        prevMeals.map((m) => {
          if (m.id === selectedMealTarget) {
            return {
              ...m,
              foods: [...m.foods, newFood],
            };
          }
          return m;
        })
      );

      await logMeal(kcal, p, c, f);
    }

    setCustomFoodName('');
    setCustomKcal('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setShowLogModal(false);
  };

  // Calorie & Donut calculations
  const targetKcal = metrics.caloriesTarget || 2000;
  const consumedKcal = metrics.caloriesConsumed || 0;
  const remainingKcal = Math.max(0, targetKcal - consumedKcal);
  const kcalPercent = Math.min(1, consumedKcal / targetKcal);

  // SVG Donut properties
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - circumference * kcalPercent;

  return (
    <ScreenContainer scrollable edges={['left', 'right']} contentContainerStyle={styles.container}>
      {/* 1. Header Banner */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>Diet & Nutrition</Text>
          <Text style={styles.screenSubtitle}>
            Personalized macros & daily scheduled meal timeline
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logPillBtn}
          onPress={() => setShowLogModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.logPillText}>+ Log Meal</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Macro & Calorie Ring Hero Card (Gym Faction Style with SweatFlix Theme) */}
      <Card style={styles.macroCard}>
        <View style={styles.macroTopRow}>
          {/* Circular Donut Ring */}
          <View style={styles.donutWrap}>
            <Svg width={size} height={size}>
              <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                {/* Background Ring */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Foreground Arc */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={Colors.primary}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            </Svg>

            {/* Inner Center Content */}
            <View style={styles.donutCenter}>
              <Text style={styles.donutNumber}>{consumedKcal}</Text>
              <Text style={styles.donutSub}>/ {targetKcal} Kcal</Text>
              <Text style={styles.donutStatus}>
                {remainingKcal > 0 ? `${remainingKcal} left` : 'Target reached!'}
              </Text>
            </View>
          </View>

          {/* Macro Pills Breakdown */}
          <View style={styles.macroPillsCol}>
            {/* Protein */}
            <View style={styles.macroPillRow}>
              <View style={[styles.macroDot, { backgroundColor: Colors.primary }]} />
              <View style={styles.macroPillTextCol}>
                <Text style={styles.macroPillLabel}>PROTEIN</Text>
                <Text style={styles.macroPillVal}>
                  {metrics.proteinGrams} / {metrics.proteinTarget}g
                </Text>
              </View>
            </View>

            {/* Carbs */}
            <View style={styles.macroPillRow}>
              <View style={[styles.macroDot, { backgroundColor: Colors.accent }]} />
              <View style={styles.macroPillTextCol}>
                <Text style={styles.macroPillLabel}>CARBS</Text>
                <Text style={styles.macroPillVal}>
                  {metrics.carbsGrams} / {metrics.carbsTarget}g
                </Text>
              </View>
            </View>

            {/* Fats */}
            <View style={styles.macroPillRow}>
              <View style={[styles.macroDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.macroPillTextCol}>
                <Text style={styles.macroPillLabel}>FATS</Text>
                <Text style={styles.macroPillVal}>
                  {metrics.fatGrams} / {metrics.fatTarget}g
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom target summary bar */}
        <View style={styles.macroSummaryBar}>
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatVal}>{Math.round((consumedKcal / targetKcal) * 100)}%</Text>
            <Text style={styles.summaryStatLabel}>Daily Energy</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatVal}>{metrics.waterIntakeMl} ml</Text>
            <Text style={styles.summaryStatLabel}>Hydration</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatVal}>{meals.reduce((sum, m) => sum + m.foods.filter((f) => f.completed).length, 0)} Items</Text>
            <Text style={styles.summaryStatLabel}>Logged</Text>
          </View>
        </View>
      </Card>

      {/* 3. Daily Scheduled Meals Timeline Header */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Daily Scheduled Meals</Text>
        <Text style={styles.sectionBadge}>{meals.length} Intervals</Text>
      </View>

      {/* 4. Scheduled Meal Cards */}
      <View style={styles.mealsList}>
        {meals.map((meal, index) => {
          const totalMealKcal = meal.foods.reduce((sum, f) => sum + f.kcal, 0);
          const completedCount = meal.foods.filter((f) => f.completed).length;

          return (
            <Card key={meal.id} style={styles.mealCard}>
              {/* Top Row: Icon + Title + Time Window + Calories */}
              <View style={styles.mealCardHeader}>
                <View style={styles.mealHeaderLeft}>
                  <View style={styles.mealIconCircle}>
                    <Ionicons name={meal.icon} size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={12} color={Colors.textGrey} />
                      <Text style={styles.timeBadgeText}>{meal.timeWindow}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.mealHeaderRight}>
                  <Text style={styles.mealKcalTotal}>{totalMealKcal} Kcal</Text>
                  <Text style={styles.mealCompletedSub}>
                    {completedCount}/{meal.foods.length} eaten
                  </Text>
                </View>
              </View>

              {/* Foods List */}
              <View style={styles.foodsContainer}>
                {meal.foods.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={[
                      styles.foodRow,
                      food.completed && styles.foodRowCompleted,
                    ]}
                    onPress={() => toggleFoodComplete(meal.id, food.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.foodCheckCircle}>
                      {food.completed ? (
                        <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                      ) : (
                        <Ionicons name="ellipse-outline" size={22} color="#CBD5E1" />
                      )}
                    </View>

                    <View style={styles.foodInfoCol}>
                      <Text
                        style={[
                          styles.foodName,
                          food.completed && styles.foodNameCompleted,
                        ]}
                        numberOfLines={1}
                      >
                        {food.name}
                      </Text>
                      <Text style={styles.foodPortion}>{food.portion}</Text>
                    </View>

                    <View style={styles.foodMacrosCol}>
                      <Text style={styles.foodKcal}>{food.kcal} kcal</Text>
                      <Text style={styles.foodMacroPills}>
                        P:{food.protein}g • C:{food.carbs}g • F:{food.fat}g
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Add Food Button */}
              <TouchableOpacity
                style={styles.addFoodToMealBtn}
                onPress={() => {
                  setSelectedMealTarget(meal.id);
                  setShowLogModal(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
                <Text style={styles.addFoodToMealText}>Add Food to {meal.name}</Text>
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>

      {/* 5. Custom Meal Logging Modal */}
      <Modal visible={showLogModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Meal or Food</Text>
              <TouchableOpacity
                onPress={() => setShowLogModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Food Name */}
              <Text style={styles.inputLabel}>Food or Dish Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Scrambled Eggs with Avocado"
                placeholderTextColor="#94A3B8"
                value={customFoodName}
                onChangeText={setCustomFoodName}
              />

              {/* Calories */}
              <Text style={styles.inputLabel}>Calories (Kcal) *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 350"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={customKcal}
                onChangeText={setCustomKcal}
              />

              {/* Macros Row */}
              <View style={styles.macroInputsRow}>
                <View style={styles.macroInputCol}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="25"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={customProtein}
                    onChangeText={setCustomProtein}
                  />
                </View>

                <View style={styles.macroInputCol}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="30"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                  />
                </View>

                <View style={styles.macroInputCol}>
                  <Text style={styles.inputLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="10"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={customFat}
                    onChangeText={setCustomFat}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title="Log & Add to Nutrition"
                  variant="primary"
                  onPress={handleSaveCustomFood}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 20,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  screenTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  screenSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },
  logPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  logPillText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  },
  macroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  macroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  donutWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutNumber: {
    fontSize: 24,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  donutSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  donutStatus: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  macroPillsCol: {
    flex: 1,
    paddingLeft: Spacing.lg,
    gap: 12,
  },
  macroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroPillTextCol: {
    flex: 1,
  },
  macroPillLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  macroPillVal: {
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
  },
  macroSummaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F1F5F9',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  sectionBadge: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mealsList: {
    gap: 14,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeBadgeText: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  mealHeaderRight: {
    alignItems: 'flex-end',
  },
  mealKcalTotal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
  },
  mealCompletedSub: {
    fontSize: 10,
    color: Colors.textGrey,
    marginTop: 2,
  },
  foodsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
    paddingTop: Spacing.xs,
    gap: 8,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.button,
    backgroundColor: '#F8F9FA',
  },
  foodRowCompleted: {
    backgroundColor: '#F0FDF4',
  },
  foodCheckCircle: {
    marginRight: 8,
  },
  foodInfoCol: {
    flex: 1,
  },
  foodName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  foodNameCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textGrey,
  },
  foodPortion: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 1,
  },
  foodMacrosCol: {
    alignItems: 'flex-end',
  },
  foodKcal: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  foodMacroPills: {
    fontSize: 9,
    color: Colors.textGrey,
    marginTop: 2,
  },
  addFoodToMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
  },
  addFoodToMealText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  inputField: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.button,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
  },
  macroInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroInputCol: {
    flex: 1,
  },
  modalActions: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
});
