import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FloatingAiDietCoach } from '../../components/FloatingAiDietCoach';
import { MealCard } from '../../components/MealCard';
import { MealReplacementModal } from '../../components/MealReplacementModal';
import { RecipeModal } from '../../components/RecipeModal';
import { ScreenContainer } from '../../components/ScreenContainer';
import { WeeklyGroceryModal } from '../../components/WeeklyGroceryModal';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import { useTheme } from '../../context/ThemeContext';
import {
  AmericanMeal,
  THIRTY_DAY_AMERICAN_PLAN,
} from '../../data/americanDietData';
import {
  AsianMeal,
  formatDietDate,
  getAsianMealCostUsd,
  getDayNumberFromDate,
  THIRTY_DAY_ASIAN_PLAN,
} from '../../data/asianDietData';
import { DietContextPayload } from '../../services/aiDietService';
import {
  BUDGET_PRESETS,
  DEFAULT_DAILY_BUDGET_USD,
  loadBudgetForDate,
  MIN_DAILY_BUDGET_USD,
  resolveMealsForSelectedBudget,
  saveBudgetForDate,
} from '../../services/dietBudgetService';

export type CuisineType = 'american' | 'indian' | 'pakistani' | 'chinese' | 'british';

export const CUISINE_OPTIONS: {
  id: CuisineType;
  label: string;
  sub: string;
  emoji: string;
  accentColor: string;
}[] = [
  { id: 'american', label: 'American', sub: 'Whole Foods', emoji: '🇺🇸', accentColor: '#3B82F6' },
  { id: 'indian', label: 'Indian', sub: 'High-Protein Desi', emoji: '🇮🇳', accentColor: '#F59E0B' },
  { id: 'pakistani', label: 'Pakistani', sub: 'Traditional Rich', emoji: '🇵🇰', accentColor: '#10B981' },
  { id: 'chinese', label: 'Chinese', sub: 'Wok & Dim Sum', emoji: '🇨🇳', accentColor: '#EF4444' },
  { id: 'british', label: 'British', sub: 'Pub & Comfort', emoji: '🇬🇧', accentColor: '#8B5CF6' },
];

export interface DayMealsStructure {
  breakfast: AsianMeal;
  lunch: AsianMeal;
  dinner: AsianMeal;
  snack: AsianMeal;
}

// Normalize American meal into AsianMeal structure
function normalizeAmericanMeal(m: AmericanMeal): AsianMeal {
  return {
    id: m.id,
    type: m.type,
    title: m.title,
    subtitle: m.subtitle,
    image: m.image,
    servingSize: m.servingSize,
    prepTime: m.prepTime,
    baseKcal: m.baseKcal,
    baseProtein: m.baseProtein,
    baseCarbs: m.baseCarbs,
    baseFat: m.baseFat,
    costUsd: m.costUsd,
    ingredients: m.ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      portion: i.portion,
      costUsd: i.costUsd,
    })),
    instructions: m.instructions,
    budgetTips: m.budgetTips,
  };
}

export default function DietScreen() {
  const { user } = useAuth();
  const { metrics, logMeal, updateNutritionGoals } = useHealthMetrics();
  const { colors, isDarkMode } = useTheme();

  const userId = user?.id || 'guest';

  // 1. Date State (Defaulting to user's local device date)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // 2. Cuisine State (5 Distinct Cuisines)
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('american');

  // 3. Daily Budget State (Selected per respective date, min $4.00)
  const [selectedBudget, setSelectedBudget] = useState<number>(DEFAULT_DAILY_BUDGET_USD);

  // 4. User Customization Overrides (Loaded per user + date + cuisine)
  const [customMealsMap, setCustomMealsMap] = useState<Record<string, DayMealsStructure>>({});

  // 5. Eaten and Saved Meals Trackers
  const [eatenMealIds, setEatenMealIds] = useState<Record<string, boolean>>({});
  const [savedMeals, setSavedMeals] = useState<AsianMeal[]>([]);
  const [summaryMode, setSummaryMode] = useState<'planned' | 'eaten'>('planned');
  const [isRefreshingSummary, setIsRefreshingSummary] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState<string | null>(null);

  // 6. Modals State
  const [selectedRecipeMeal, setSelectedRecipeMeal] = useState<AsianMeal | null>(null);
  const [mealToReplace, setMealToReplace] = useState<AsianMeal | null>(null);
  const [showReplacementModal, setShowReplacementModal] = useState<boolean>(false);
  const [showGroceryModal, setShowGroceryModal] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);

  // Goal Calibration Inputs
  const [targetKcalInput, setTargetKcalInput] = useState((metrics.caloriesTarget || 2000).toString());
  const [targetProteinInput, setTargetProteinInput] = useState((metrics.proteinTarget || 90).toString());

  // Formatted date details for UI and persistent storage keys
  const dateInfo = useMemo(() => formatDietDate(selectedDate), [selectedDate]);
  const dayNumber = useMemo(() => getDayNumberFromDate(selectedDate), [selectedDate]);
  const storageDateKey = dateInfo.fullDateString;

  // Storage key for custom replaced meals for this specific date and cuisine
  const customPlanStorageKey = `@sweatflix_custom_plan_${userId}_${storageDateKey}_${selectedCuisine}`;
  const eatenStorageKey = `@sweatflix_eaten_meals_${userId}_${storageDateKey}`;
  const savedStorageKey = `@sweatflix_saved_meals_${userId}`;
  const cuisinePrefStorageKey = `@sweatflix_cuisine_pref_${userId}`;

  // Load persistent user data on mount (cuisine preference & saved bookmarks)
  useEffect(() => {
    let isCurrent = true;
    const loadSavedData = async () => {
      try {
        const [savedCuisine, savedSaved] = await Promise.all([
          AsyncStorage.getItem(cuisinePrefStorageKey),
          AsyncStorage.getItem(savedStorageKey),
        ]);

        if (isCurrent) {
          if (
            savedCuisine === 'american' ||
            savedCuisine === 'indian' ||
            savedCuisine === 'pakistani' ||
            savedCuisine === 'chinese' ||
            savedCuisine === 'british'
          ) {
            setSelectedCuisine(savedCuisine as CuisineType);
          } else if (savedCuisine === 'asian') {
            setSelectedCuisine('chinese');
          }
          if (savedSaved) {
            setSavedMeals(JSON.parse(savedSaved));
          }
        }
      } catch (e) {
        console.warn('Error loading diet persistent state:', e);
      }
    };

    loadSavedData();
    return () => {
      isCurrent = false;
    };
  }, [cuisinePrefStorageKey, savedStorageKey]);

  // Load eaten meals state whenever the active date or user changes
  useEffect(() => {
    let isCurrent = true;
    const loadEatenData = async () => {
      try {
        const savedEaten = await AsyncStorage.getItem(eatenStorageKey);
        if (isCurrent) {
          setEatenMealIds(savedEaten ? JSON.parse(savedEaten) : {});
        }
      } catch (e) {
        console.warn('Error loading eaten meals for date:', e);
      }
    };

    loadEatenData();
    return () => {
      isCurrent = false;
    };
  }, [eatenStorageKey]);

  // Load persistent budget for this specific date (min $4.00, defaults to $8.00 if never set)
  useEffect(() => {
    let isCurrent = true;
    const loadDateBudget = async () => {
      try {
        const storedBudget = await loadBudgetForDate(userId, storageDateKey);
        if (isCurrent) {
          setSelectedBudget(storedBudget);
        }
      } catch (e) {
        console.warn('Error loading date budget:', e);
      }
    };

    loadDateBudget();
    return () => {
      isCurrent = false;
    };
  }, [userId, storageDateKey]);

  // Load custom meal replacements for the current date & cuisine
  useEffect(() => {
    let isCurrent = true;
    const loadDateCustomMeals = async () => {
      try {
        const stored = await AsyncStorage.getItem(customPlanStorageKey);
        if (stored && isCurrent) {
          const parsed: DayMealsStructure = JSON.parse(stored);
          setCustomMealsMap((prev) => ({
            ...prev,
            [`${storageDateKey}_${selectedCuisine}`]: parsed,
          }));
        }
      } catch (e) {
        console.warn('Error loading custom plan for date:', e);
      }
    };

    loadDateCustomMeals();
    return () => {
      isCurrent = false;
    };
  }, [customPlanStorageKey, storageDateKey, selectedCuisine]);

  // Persist selected cuisine preference
  const handleSelectCuisine = async (cuisine: CuisineType) => {
    setSelectedCuisine(cuisine);
    try {
      await AsyncStorage.setItem(cuisinePrefStorageKey, cuisine);
    } catch (e) {
      console.warn('Error saving cuisine preference:', e);
    }
  };

  // Update budget for the current date (enforcing strict $4.00 minimum)
  const handleUpdateBudget = async (newBudget: number) => {
    const safeBudget = Math.max(MIN_DAILY_BUDGET_USD, Number(newBudget.toFixed(2)));
    setSelectedBudget(safeBudget);

    // If there is an active custom replacement override, clear it so the newly selected budget tier displays immediately
    const customKey = `${storageDateKey}_${selectedCuisine}`;
    if (customMealsMap[customKey]) {
      setCustomMealsMap((prev) => {
        const next = { ...prev };
        delete next[customKey];
        return next;
      });
      try {
        await AsyncStorage.removeItem(customPlanStorageKey);
      } catch (e) {
        console.warn('Error clearing custom plan on budget update:', e);
      }
    }

    await saveBudgetForDate(userId, storageDateKey, safeBudget);
  };

  // Quick action: Fit meals to active budget
  const handleFitMealsToBudget = async () => {
    const customKey = `${storageDateKey}_${selectedCuisine}`;
    setCustomMealsMap((prev) => {
      const next = { ...prev };
      delete next[customKey];
      return next;
    });
    try {
      await AsyncStorage.removeItem(customPlanStorageKey);
      Alert.alert(
        'Plan Calibrated! 💡',
        `Meals for ${dateInfo.displayTitle} have been calibrated to fit your $${selectedBudget.toFixed(2)} daily budget.`
      );
    } catch (e) {
      console.warn('Error resetting to budget plan:', e);
    }
  };

  // Date Navigation Handlers
  const handlePrevDay = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
  };

  const handleJumpToToday = () => {
    setSelectedDate(new Date());
  };

  // Resolve active meals for the selected date, cuisine, AND budget
  const currentDayMeals: DayMealsStructure = useMemo(() => {
    const customKey = `${storageDateKey}_${selectedCuisine}`;
    const customOverride = customMealsMap[customKey];
    if (customOverride) {
      return customOverride;
    }

    let basePlan: DayMealsStructure;
    if (selectedCuisine === 'american') {
      const amPlan = THIRTY_DAY_AMERICAN_PLAN[dayNumber - 1] || THIRTY_DAY_AMERICAN_PLAN[0];
      basePlan = {
        breakfast: normalizeAmericanMeal(amPlan.breakfast),
        lunch: normalizeAmericanMeal(amPlan.lunch),
        dinner: normalizeAmericanMeal(amPlan.dinner),
        snack: normalizeAmericanMeal(amPlan.snack),
      };
    } else {
      // Asian Plan (Pan-Asian: Chinese, Japanese, Korean, Thai, Indian, Vietnamese)
      const asPlan = THIRTY_DAY_ASIAN_PLAN[dayNumber - 1] || THIRTY_DAY_ASIAN_PLAN[0];
      basePlan = {
        breakfast: asPlan.breakfast,
        lunch: asPlan.lunch,
        dinner: asPlan.dinner,
        snack: asPlan.snack,
      };
    }

    // Adapt / deliver meals matching the user's selected budget for this day (min $4.00)
    return resolveMealsForSelectedBudget(basePlan, selectedBudget, selectedCuisine, dayNumber);
  }, [selectedCuisine, storageDateKey, customMealsMap, dayNumber, selectedBudget]);

  // Calculate actual total daily cost in USD from the 4 meals
  const dailyCostUsd = useMemo(() => {
    const b = currentDayMeals.breakfast.costUsd || getAsianMealCostUsd(currentDayMeals.breakfast);
    const l = currentDayMeals.lunch.costUsd || getAsianMealCostUsd(currentDayMeals.lunch);
    const d = currentDayMeals.dinner.costUsd || getAsianMealCostUsd(currentDayMeals.dinner);
    const s = currentDayMeals.snack.costUsd || getAsianMealCostUsd(currentDayMeals.snack);
    return Number((b + l + d + s).toFixed(2));
  }, [currentDayMeals]);

  // Calculate total planned daily macros (rounded integers)
  const dailyNutrition = useMemo(() => {
    const m = currentDayMeals;
    const calories = Math.round(
      Number(m.breakfast.baseKcal || 0) +
      Number(m.lunch.baseKcal || 0) +
      Number(m.dinner.baseKcal || 0) +
      Number(m.snack.baseKcal || 0)
    );
    const protein = Math.round(
      Number(m.breakfast.baseProtein || 0) +
      Number(m.lunch.baseProtein || 0) +
      Number(m.dinner.baseProtein || 0) +
      Number(m.snack.baseProtein || 0)
    );
    const carbs = Math.round(
      Number(m.breakfast.baseCarbs || 0) +
      Number(m.lunch.baseCarbs || 0) +
      Number(m.dinner.baseCarbs || 0) +
      Number(m.snack.baseCarbs || 0)
    );
    const fat = Math.round(
      Number(m.breakfast.baseFat || 0) +
      Number(m.lunch.baseFat || 0) +
      Number(m.dinner.baseFat || 0) +
      Number(m.snack.baseFat || 0)
    );
    return { calories, protein, carbs, fat };
  }, [currentDayMeals]);

  // Calculate consumed daily macros based on meals marked eaten
  const consumedNutrition = useMemo(() => {
    const m = currentDayMeals;
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let eatenCount = 0;

    [m.breakfast, m.lunch, m.dinner, m.snack].forEach((meal) => {
      if (meal && eatenMealIds[meal.id]) {
        eatenCount += 1;
        calories += Number(meal.baseKcal || 0);
        protein += Number(meal.baseProtein || 0);
        carbs += Number(meal.baseCarbs || 0);
        fat += Number(meal.baseFat || 0);
      }
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      eatenCount,
    };
  }, [currentDayMeals, eatenMealIds]);

  // Refresh summary handler to immediately sync eaten status & macros
  const handleRefreshSummary = async () => {
    setIsRefreshingSummary(true);
    try {
      const savedEaten = await AsyncStorage.getItem(eatenStorageKey);
      setEatenMealIds(savedEaten ? JSON.parse(savedEaten) : {});
      setRefreshFeedback('Synced ✓');
      setTimeout(() => setRefreshFeedback(null), 2000);
    } catch (e) {
      console.warn('Error refreshing summary:', e);
      setRefreshFeedback('Error');
      setTimeout(() => setRefreshFeedback(null), 2000);
    } finally {
      setIsRefreshingSummary(false);
    }
  };

  // Target goals
  const targetCalories = metrics.caloriesTarget || 2000;
  const targetProtein = metrics.proteinTarget || 90;
  const calPercent = Math.min(100, Math.round((dailyNutrition.calories / targetCalories) * 100));
  const consumedCalPercent = Math.min(100, Math.round((consumedNutrition.calories / targetCalories) * 100));
  const consumedProteinPercent = Math.min(100, Math.round((consumedNutrition.protein / targetProtein) * 100));

  // Toggle meal eaten status
  const handleToggleEaten = async (meal: AsianMeal) => {
    const currentStatus = !!eatenMealIds[meal.id];
    const newStatus = !currentStatus;

    const updated = { ...eatenMealIds, [meal.id]: newStatus };
    setEatenMealIds(updated);

    try {
      await AsyncStorage.setItem(eatenStorageKey, JSON.stringify(updated));
      if (newStatus) {
        await logMeal(
          Number(meal.baseKcal || 0),
          Number(meal.baseProtein || 0),
          Number(meal.baseCarbs || 0),
          Number(meal.baseFat || 0)
        );
      }
    } catch (e) {
      console.warn('Error saving eaten meal:', e);
    }
  };

  // Toggle meal save / bookmark
  const handleToggleSave = async (meal: AsianMeal) => {
    const isAlreadySaved = savedMeals.some((m) => m.id === meal.id || m.title === meal.title);
    let updated: AsianMeal[];
    if (isAlreadySaved) {
      updated = savedMeals.filter((m) => m.id !== meal.id && m.title !== meal.title);
    } else {
      updated = [...savedMeals, meal];
    }

    setSavedMeals(updated);
    try {
      await AsyncStorage.setItem(savedStorageKey, JSON.stringify(updated));
      Alert.alert(
        isAlreadySaved ? 'Removed from Saved' : 'Meal Saved ⭐',
        isAlreadySaved
          ? `Removed "${meal.title}" from your saved meals.`
          : `Saved "${meal.title}" to your favorites.`
      );
    } catch (e) {
      console.warn('Error saving meal bookmark:', e);
    }
  };

  // Open Replace Modal
  const handleOpenReplace = (meal: AsianMeal) => {
    setMealToReplace(meal);
    setShowReplacementModal(true);
  };

  // Select an alternative to replace current slot in this date's plan
  const handleSelectReplacement = async (replacement: AsianMeal) => {
    if (!mealToReplace) return;

    const slot = mealToReplace.type;
    const updatedDayPlan: DayMealsStructure = {
      ...currentDayMeals,
      [slot]: {
        ...replacement,
        costUsd: replacement.costUsd || getAsianMealCostUsd(replacement),
      },
    };

    const customKey = `${storageDateKey}_${selectedCuisine}`;
    setCustomMealsMap((prev) => ({
      ...prev,
      [customKey]: updatedDayPlan,
    }));

    try {
      await AsyncStorage.setItem(customPlanStorageKey, JSON.stringify(updatedDayPlan));
      Alert.alert('Meal Replaced! 🔄', `Successfully replaced ${slot} with "${replacement.title}".`);
    } catch (e) {
      console.warn('Error saving custom replacement:', e);
    }

    setShowReplacementModal(false);
    setMealToReplace(null);
  };

  // Replace meal from AI Diet Coach proposal
  const handleAiReplaceMealInPlan = async (proposed: AsianMeal) => {
    const slot = proposed.type || 'lunch';
    const updatedDayPlan: DayMealsStructure = {
      ...currentDayMeals,
      [slot]: {
        ...proposed,
        costUsd: proposed.costUsd || getAsianMealCostUsd(proposed),
      },
    };

    const customKey = `${storageDateKey}_${selectedCuisine}`;
    setCustomMealsMap((prev) => ({
      ...prev,
      [customKey]: updatedDayPlan,
    }));

    try {
      await AsyncStorage.setItem(customPlanStorageKey, JSON.stringify(updatedDayPlan));
      Alert.alert('Plan Updated! 🌟', `AI recommendation "${proposed.title}" has been set for ${slot}.`);
    } catch (e) {
      console.warn('Error saving AI replacement:', e);
    }
  };

  // Save updated calorie/protein targets
  const handleSaveGoalTargets = async () => {
    const k = parseInt(targetKcalInput, 10);
    const p = parseInt(targetProteinInput, 10);
    if (k > 800 && p > 30) {
      await updateNutritionGoals(k, p, Math.round((k * 0.45) / 4), Math.round((k * 0.25) / 9));
      setShowGoalModal(false);
      Alert.alert('Goals Updated', `Daily targets set to ${k} kcal and ${p}g protein.`);
    }
  };

  // Context payload injected into the Floating AI Diet Coach
  const aiDietContext: DietContextPayload = useMemo(() => {
    return {
      country:
        selectedCuisine === 'american'
          ? 'United States'
          : selectedCuisine === 'indian'
          ? 'India'
          : selectedCuisine === 'pakistani'
          ? 'Pakistan'
          : selectedCuisine === 'chinese'
          ? 'China'
          : 'United Kingdom',
      currency: 'USD ($)',
      dailyBudget: dailyCostUsd,
      goal: 'Fitness & Health',
      preference:
        selectedCuisine === 'american'
          ? 'American Athletic Whole Foods'
          : selectedCuisine === 'indian'
          ? 'Indian High-Protein Desi Nutrition'
          : selectedCuisine === 'pakistani'
          ? 'Pakistani Traditional Rich Nutrition'
          : selectedCuisine === 'chinese'
          ? 'Chinese Wok & Dim Sum Nutrition'
          : 'British Traditional Pub & Comfort Nutrition',
      allergies: [],
      activeDayNumber: dayNumber,
      activeDayTitle: `${dateInfo.displayTitle} (${selectedCuisine.toUpperCase()} Plan)`,
      currentMeals: {
        breakfast: currentDayMeals.breakfast.title,
        lunch: currentDayMeals.lunch.title,
        dinner: currentDayMeals.dinner.title,
        snack: currentDayMeals.snack.title,
      },
      totalKcal: dailyNutrition.calories,
      totalProtein: dailyNutrition.protein,
      targetKcal: targetCalories,
      targetProtein: targetProtein,
    };
  }, [
    selectedCuisine,
    dailyCostUsd,
    dayNumber,
    dateInfo.displayTitle,
    currentDayMeals,
    dailyNutrition,
    targetCalories,
    targetProtein,
  ]);

  return (
    <View style={[styles.outerScreen, { backgroundColor: colors.background }]}>
      <ScreenContainer
        scrollable
        edges={['left', 'right']}
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* ========================================================================= */}
        {/* 1. SCREEN HEADER */}
        {/* ========================================================================= */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Daily Meal Plan</Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              {selectedCuisine === 'american' ? 'American Athletic Nutrition' : 'Pan-Asian Diverse Nutrition'} • All prices in USD ($)
            </Text>
          </View>

          <View style={styles.headerRightBtns}>
            {/* Quick Grocery Button */}
            <TouchableOpacity
              style={[styles.headerPillBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={() => setShowGroceryModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={16} color={colors.text} />
              <Text style={[styles.headerPillText, { color: colors.text }]}>Grocery</Text>
            </TouchableOpacity>

            {/* Quick Goals Calibrate Button */}
            <TouchableOpacity
              style={[styles.headerPillBtn, { backgroundColor: isDarkMode ? '#3B1824' : '#FFE4E6' }]}
              onPress={() => setShowGoalModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={15} color={Colors.primary} />
              <Text style={[styles.headerPillText, { color: Colors.primary }]}>Goals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 2. DATE SELECTOR (Shows only the selected date with < > navigation) */}
        {/* ========================================================================= */}
        <View
          style={[
            styles.dateNavCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Previous Day Button */}
          <TouchableOpacity
            style={[styles.dateNavBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={handlePrevDay}
            activeOpacity={0.7}
            accessibilityLabel="Previous Day"
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Current Date Display */}
          <View style={styles.dateCenterCol}>
            <View style={styles.calendarIconRow}>
              <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
              <Text style={[styles.dateTextPrimary, { color: colors.text }]}>
                {dateInfo.displayTitle}
              </Text>
            </View>
            <Text style={[styles.dateSubText, { color: colors.textSecondary }]}>
              Cycle Day {dayNumber} of 30 • Local Device Date
            </Text>
          </View>

          {/* Next Day Button */}
          <TouchableOpacity
            style={[styles.dateNavBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={handleNextDay}
            activeOpacity={0.7}
            accessibilityLabel="Next Day"
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick "Today" Jump Pill if viewing past/future dates */}
        {!dateInfo.isToday && (
          <TouchableOpacity
            style={[styles.jumpTodayPill, { backgroundColor: isDarkMode ? '#1E293B' : '#ECFDF5' }]}
            onPress={handleJumpToToday}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={13} color="#10B981" />
            <Text style={styles.jumpTodayText}>Jump Back to Today&apos;s Plan</Text>
          </TouchableOpacity>
        )}

        {/* ========================================================================= */}
        {/* 3. 5 DISTINCT CUISINES: American 🇺🇸 | Indian 🇮🇳 | Pakistani 🇵🇰 | Chinese 🇨🇳 | British 🇬🇧 */}
        {/* ========================================================================= */}
        <View style={styles.cuisineSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cuisineScrollContainer}
            style={styles.cuisineScrollView}
          >
            {CUISINE_OPTIONS.map((c) => {
              const isActive = selectedCuisine === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.cuisineTab,
                    {
                      backgroundColor: isActive
                        ? isDarkMode ? '#0F172A' : '#FFFFFF'
                        : isDarkMode ? '#1E293B' : '#F8FAFC',
                      borderColor: isActive ? c.accentColor : colors.border,
                    },
                    isActive && styles.cuisineTabActive,
                  ]}
                  onPress={() => handleSelectCuisine(c.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cuisineEmoji}>{c.emoji}</Text>
                  <View style={styles.cuisineTextCol}>
                    <Text
                      style={[
                        styles.cuisineTabText,
                        { color: isActive ? (isDarkMode ? '#FFFFFF' : '#0F172A') : colors.textSecondary },
                        isActive && styles.cuisineTabTextActive,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {c.label}
                    </Text>
                    <Text
                      style={[styles.cuisineTabSub, { color: colors.textSecondary }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {c.sub}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* 4. DAILY BUDGET TARGET SELECTOR (Per-Date • Min $4.00 USD) */}
        {/* ========================================================================= */}
        <View
          style={[
            styles.budgetCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Header Row: Title & Stepper */}
          <View style={styles.budgetHeaderRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.budgetBadgeRow}>
                <View style={styles.usdBadgePill}>
                  <Text style={styles.usdBadgePillText}>DAILY BUDGET</Text>
                </View>
                <View style={[styles.minBadgePill, { backgroundColor: selectedBudget <= 4 ? '#ECFDF5' : (isDarkMode ? '#1E293B' : '#F1F5F9') }]}>
                  <Text style={[styles.minBadgeText, { color: selectedBudget <= 4 ? '#059669' : colors.textSecondary }]}>
                    MIN $4.00
                  </Text>
                </View>
              </View>

              <Text style={[styles.budgetCardTitle, { color: colors.text }]} numberOfLines={1}>
                Budget for {dateInfo.displayTitle}
              </Text>
            </View>

            {/* Stepper Controls */}
            <View style={[styles.stepperContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
              <TouchableOpacity
                style={[
                  styles.stepperBtn,
                  selectedBudget <= MIN_DAILY_BUDGET_USD && styles.stepperBtnDisabled,
                ]}
                onPress={() => handleUpdateBudget(selectedBudget - 0.5)}
                disabled={selectedBudget <= MIN_DAILY_BUDGET_USD}
                activeOpacity={0.7}
                accessibilityLabel="Decrease Daily Budget by $0.50"
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={selectedBudget <= MIN_DAILY_BUDGET_USD ? colors.border : colors.text}
                />
              </TouchableOpacity>

              <View style={styles.stepperValBox}>
                <Text style={[styles.stepperValText, { color: colors.text }]}>
                  ${selectedBudget.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleUpdateBudget(selectedBudget + 0.5)}
                activeOpacity={0.7}
                accessibilityLabel="Increase Daily Budget by $0.50"
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Preset Chips Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.budgetPresetsScroll}
          >
            {BUDGET_PRESETS.map((preset) => {
              const isSelected = Math.abs(selectedBudget - preset.value) < 0.1;
              return (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    styles.budgetPresetChip,
                    {
                      backgroundColor: isSelected
                        ? Colors.primary
                        : isDarkMode
                          ? '#1E293B'
                          : '#F1F5F9',
                      borderColor: isSelected ? Colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleUpdateBudget(preset.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.budgetPresetChipText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Budget vs Actual Comparison Strip */}
          <View style={[styles.budgetStatusStrip, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.budgetStatusLabel, { color: colors.textSecondary }]}>
                Planned Day Total:{' '}
                <Text style={[styles.budgetStatusBold, { color: colors.text }]}>
                  ${dailyCostUsd.toFixed(2)}
                </Text>{' '}
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                  (Target: ${selectedBudget.toFixed(2)})
                </Text>
              </Text>
              <Text
                style={[
                  styles.budgetStatusSub,
                  { color: dailyCostUsd <= selectedBudget ? '#10B981' : '#F59E0B' },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {dailyCostUsd <= selectedBudget
                  ? `✓ Within Budget (${selectedBudget === 4 ? 'Strict $4 Economy' : `Saves $${(selectedBudget - dailyCostUsd).toFixed(2)}`})`
                  : `⚠️ Exceeds by $${(dailyCostUsd - selectedBudget).toFixed(2)}`}
              </Text>
            </View>

            {dailyCostUsd > selectedBudget ? (
              <TouchableOpacity
                style={[styles.fitBudgetBtn, { backgroundColor: '#10B981' }]}
                onPress={handleFitMealsToBudget}
                activeOpacity={0.85}
              >
                <Ionicons name="flash" size={13} color="#FFFFFF" />
                <Text style={styles.fitBudgetBtnText}>Fit to ${selectedBudget.toFixed(0)}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.fitBudgetBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}
                onPress={() => setShowGroceryModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={13} color={colors.text} />
                <Text style={[styles.fitBudgetBtnText, { color: colors.text }]}>Grocery</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 5. DAILY NUTRITION SUMMARY CARD */}
        {/* ========================================================================= */}
        <View
          style={[
            styles.nutritionCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Header Row */}
          <View style={styles.nutritionHeaderRow}>
            <View style={{ flex: 1, minWidth: 0, marginRight: Spacing.xs }}>
              <Text style={[styles.nutritionCardTitle, { color: colors.text }]} numberOfLines={1}>
                Daily Nutrition Summary

              </Text>
              <Text style={[styles.nutritionCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {summaryMode === 'planned'
                  ? `Planned targets (${calPercent}% kcal goal)`
                  : `${consumedNutrition.eatenCount} of 4 meals logged (${consumedCalPercent}% kcal)`}
              </Text>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity
              style={[
                styles.refreshSummaryBtn,
                {
                  backgroundColor: refreshFeedback
                    ? '#10B981'
                    : isDarkMode
                      ? '#1E293B'
                      : '#F1F5F9',
                  borderColor: refreshFeedback ? '#10B981' : colors.border,
                },
              ]}
              onPress={handleRefreshSummary}
              disabled={isRefreshingSummary}
              activeOpacity={0.7}
              accessibilityLabel="Refresh daily nutrition summary"
            >
              {isRefreshingSummary ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : refreshFeedback ? (
                <Text style={styles.refreshSuccessText}>{refreshFeedback}</Text>
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={13} color={colors.text} />
                  <Text style={[styles.refreshSummaryBtnText, { color: colors.text }]}>
                    Refresh
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Strip: Planned vs Eaten */}
          <View style={[styles.nutritionTabStrip, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[
                styles.nutritionTabPill,
                summaryMode === 'planned' && {
                  backgroundColor: Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => setSummaryMode('planned')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar-outline"
                size={12}
                color={summaryMode === 'planned' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.nutritionTabPillText,
                  { color: summaryMode === 'planned' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Planned Day Plan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nutritionTabPill,
                summaryMode === 'eaten' && {
                  backgroundColor: '#10B981',
                  shadowColor: '#10B981',
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => setSummaryMode('eaten')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="restaurant-outline"
                size={12}
                color={summaryMode === 'eaten' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.nutritionTabPillText,
                  { color: summaryMode === 'eaten' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Logged ({consumedNutrition.eatenCount}/4)
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4-Stat Macro Grid */}
          <View style={styles.macroStatGrid}>
            {/* Calories */}
            <View style={[styles.macroStatBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <Text style={[styles.macroStatVal, { color: colors.text }]}>
                {summaryMode === 'planned' ? dailyNutrition.calories : consumedNutrition.calories}
              </Text>
              <Text style={[styles.macroStatTarget, { color: colors.textSecondary }]}>
                / {targetCalories} kcal
              </Text>
              <Text style={[styles.macroStatLabel, { color: colors.textSecondary }]}>CALORIES</Text>
            </View>

            {/* Protein */}
            <View style={[styles.macroStatBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <Text style={[styles.macroStatVal, { color: Colors.primary }]}>
                {summaryMode === 'planned' ? dailyNutrition.protein : consumedNutrition.protein}g
              </Text>
              <Text style={[styles.macroStatTarget, { color: colors.textSecondary }]}>
                / {targetProtein}g
              </Text>
              <Text style={[styles.macroStatLabel, { color: colors.textSecondary }]}>PROTEIN</Text>
            </View>

            {/* Carbs */}
            <View style={[styles.macroStatBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <Text style={[styles.macroStatVal, { color: '#F59E0B' }]}>
                {summaryMode === 'planned' ? dailyNutrition.carbs : consumedNutrition.carbs}g
              </Text>
              <Text style={[styles.macroStatTarget, { color: colors.textSecondary }]}>
                Staples
              </Text>
              <Text style={[styles.macroStatLabel, { color: colors.textSecondary }]}>CARBS</Text>
            </View>

            {/* Fats */}
            <View style={[styles.macroStatBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
              <Text style={[styles.macroStatVal, { color: '#10B981' }]}>
                {summaryMode === 'planned' ? dailyNutrition.fat : consumedNutrition.fat}g
              </Text>
              <Text style={[styles.macroStatTarget, { color: colors.textSecondary }]}>
                Healthy
              </Text>
              <Text style={[styles.macroStatLabel, { color: colors.textSecondary }]}>FATS</Text>
            </View>
          </View>

          {/* Interactive Progress Indicators */}
          <View style={styles.nutritionProgressContainer}>
            <View style={styles.nutritionProgressRow}>
              <View style={styles.nutritionProgressLabelRow}>
                <Text style={[styles.nutritionProgressName, { color: colors.textSecondary }]}>
                  Calories Target Progress:
                </Text>
                <Text style={[styles.nutritionProgressPercent, { color: colors.text }]}>
                  {summaryMode === 'planned' ? `${dailyNutrition.calories} kcal (${calPercent}%)` : `${consumedNutrition.calories} kcal (${consumedCalPercent}%)`}
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#0F172A' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${summaryMode === 'planned' ? calPercent : consumedCalPercent}%`,
                      backgroundColor: summaryMode === 'planned' ? Colors.primary : '#10B981',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.nutritionProgressRow, { marginTop: 6 }]}>
              <View style={styles.nutritionProgressLabelRow}>
                <Text style={[styles.nutritionProgressName, { color: colors.textSecondary }]}>
                  Protein Target Progress:
                </Text>
                <Text style={[styles.nutritionProgressPercent, { color: colors.text }]}>
                  {summaryMode === 'planned' ? `${dailyNutrition.protein}g / ${targetProtein}g` : `${consumedNutrition.protein}g / ${targetProtein}g (${consumedProteinPercent}%)`}
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#0F172A' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${summaryMode === 'planned' ? Math.min(100, Math.round((dailyNutrition.protein / targetProtein) * 100)) : consumedProteinPercent}%`,
                      backgroundColor: '#3B82F6',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 6. TODAY'S 4 MEAL CARDS (Breakfast, Lunch, Dinner, Snack) */}
        {/* ========================================================================= */}
        <View style={styles.mealsSectionHeader}>
          <Text style={[styles.mealsSectionTitle, { color: colors.text }]}>
            {selectedCuisine === 'american' ? 'American Meals 🇺🇸' : 'Asian Meals 🌏'} for {dateInfo.displayTitle}
          </Text>
          <Text style={[styles.mealsSectionSub, { color: colors.textSecondary }]}>
            4 high-protein whole-food meals tailored to your goals
          </Text>
        </View>

        <View style={styles.mealsVerticalList}>
          {[
            {
              slot: 'breakfast' as const,
              label: 'Breakfast',
              badgeColor: '#F59E0B',
              meal: currentDayMeals.breakfast,
            },
            {
              slot: 'lunch' as const,
              label: 'Lunch',
              badgeColor: '#10B981',
              meal: currentDayMeals.lunch,
            },
            {
              slot: 'dinner' as const,
              label: 'Dinner',
              badgeColor: '#6366F1',
              meal: currentDayMeals.dinner,
            },
            {
              slot: 'snack' as const,
              label: 'Snack',
              badgeColor: '#EC4899',
              meal: currentDayMeals.snack,
            },
          ].map(({ slot, label, badgeColor, meal }) => {
            const isEaten = !!eatenMealIds[meal.id];
            const isSaved = savedMeals.some((m) => m.id === meal.id || m.title === meal.title);
            const costUsd = meal.costUsd || getAsianMealCostUsd(meal);

            return (
              <MealCard
                key={`${meal.id}-${storageDateKey}-${selectedCuisine}`}
                meal={meal}
                typeLabel={label}
                badgeColor={badgeColor}
                kcal={meal.baseKcal}
                protein={meal.baseProtein}
                carbs={meal.baseCarbs}
                fat={meal.baseFat}
                cost={costUsd}
                currencySymbol="$"
                isEaten={isEaten}
                isSaved={isSaved}
                onViewRecipe={(m) => setSelectedRecipeMeal(m)}
                onReplace={(m) => handleOpenReplace(m)}
                onToggleEaten={() => handleToggleEaten(meal)}
                onToggleSave={() => handleToggleSave(meal)}
                onAskAi={() => { }}
              />
            );
          })}
        </View>

        {/* Bottom Padding for Floating Button */}
        <View style={{ height: 100 }} />
      </ScreenContainer>

      {/* ========================================================================= */}
      {/* 7. MODALS & FLOATING AI DIET COACH */}
      {/* ========================================================================= */}

      {/* Recipe Detail Modal */}
      <RecipeModal
        visible={!!selectedRecipeMeal}
        meal={selectedRecipeMeal}
        cost={selectedRecipeMeal?.costUsd}
        currencySymbol="$"
        isEaten={selectedRecipeMeal ? !!eatenMealIds[selectedRecipeMeal.id] : false}
        onClose={() => setSelectedRecipeMeal(null)}
        onToggleEaten={(mealId) => {
          if (selectedRecipeMeal) {
            handleToggleEaten(selectedRecipeMeal);
          }
        }}
        onReplace={(m) => {
          setSelectedRecipeMeal(null);
          handleOpenReplace(m);
        }}
        onAskAi={() => { }}
      />

      {/* Meal Replacement Modal (Displays alternatives for the active cuisine in USD) */}
      <MealReplacementModal
        visible={showReplacementModal}
        originalMeal={mealToReplace}
        cuisine={selectedCuisine}
        currencySymbol="$"
        onClose={() => {
          setShowReplacementModal(false);
          setMealToReplace(null);
        }}
        onSelectAlternative={handleSelectReplacement}
      />

      {/* Weekly Grocery Modal (USD pricing for active cuisine) */}
      <WeeklyGroceryModal
        visible={showGroceryModal}
        cuisine={selectedCuisine}
        currencySymbol="$"
        initialWeek={Math.min(4, Math.ceil(dayNumber / 7))}
        onClose={() => setShowGroceryModal(false)}
      />

      {/* Calibrate Nutrition Goals Modal */}
      <Modal visible={showGoalModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.goalModalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Calibrate Nutrition Goals</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Daily Calorie Target (kcal)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', color: colors.text, borderColor: colors.border },
                ]}
                keyboardType="numeric"
                value={targetKcalInput}
                onChangeText={setTargetKcalInput}
                placeholder="2000"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Daily Protein Target (grams)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', color: colors.text, borderColor: colors.border },
                ]}
                keyboardType="numeric"
                value={targetProteinInput}
                onChangeText={setTargetProteinInput}
                placeholder="90"
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={[styles.saveGoalBtn, { backgroundColor: Colors.primary }]}
                onPress={handleSaveGoalTargets}
                activeOpacity={0.85}
              >
                <Text style={styles.saveGoalBtnText}>Save Targets</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Persistent Floating AI Diet Coach Button at Bottom-Left */}
      <FloatingAiDietCoach
        contextPayload={aiDietContext}
        onReplaceMeal={handleAiReplaceMealInPlan}
        onViewRecipe={(meal) => setSelectedRecipeMeal(meal)}
        onSaveMeal={(meal) => handleToggleSave(meal)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerScreen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  screenSubtitle: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  headerRightBtns: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  headerPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },

  /* 2. Date Navigation Card */
  dateNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  dateNavBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenterCol: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  calendarIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTextPrimary: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
  },
  dateSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  jumpTodayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 5,
    marginBottom: Spacing.sm,
  },
  jumpTodayText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#10B981',
  },

  /* 3. 5-Cuisine Selector Styles */
  cuisineSection: {
    marginVertical: Spacing.sm,
  },
  cuisineScrollView: {
    flexGrow: 0,
  },
  cuisineScrollContainer: {
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  cuisineTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 4,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 8,
    minWidth: 135,
  },
  cuisineTabActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2.5,
  },
  cuisineTextCol: {
    flex: 1,
    minWidth: 0,
  },
  cuisineEmoji: {
    fontSize: 22,
  },
  cuisineTabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  cuisineTabTextActive: {
    fontWeight: Typography.weights.heavy,
  },
  cuisineTabSub: {
    fontSize: 10,
    marginTop: 1,
  },

  /* 4. Daily Budget Target Card */
  budgetCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xs,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  budgetBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  usdBadgePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  usdBadgePillText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    color: '#059669',
  },
  minBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  minBadgeText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
  },
  budgetCardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperValBox: {
    paddingHorizontal: 8,
    minWidth: 62,
    alignItems: 'center',
  },
  stepperValText: {
    fontSize: 14,
    fontWeight: Typography.weights.heavy,
  },
  budgetPresetsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  budgetPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  budgetPresetChipText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  budgetStatusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  budgetStatusLabel: {
    fontSize: 11,
  },
  budgetStatusBold: {
    fontSize: 13,
    fontWeight: Typography.weights.heavy,
  },
  budgetStatusSub: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  fitBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  fitBudgetBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },

  /* 5. Daily Nutrition Card */
  nutritionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  nutritionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  nutritionCardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
  },
  nutritionCardSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  refreshSummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  refreshSummaryBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  refreshSuccessText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  nutritionTabStrip: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 3,
    marginVertical: Spacing.xs,
    gap: 4,
  },
  nutritionTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  nutritionTabPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  macroStatGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  macroStatBox: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  macroStatVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
  },
  macroStatTarget: {
    fontSize: 10,
    marginTop: 1,
  },
  macroStatLabel: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    marginTop: 3,
  },
  nutritionProgressContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  nutritionProgressRow: {
    width: '100%',
  },
  nutritionProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  nutritionProgressName: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
  },
  nutritionProgressPercent: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
  },
  progressBarTrack: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* 6. Meals Section Header & List */
  mealsSectionHeader: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  mealsSectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
  },
  mealsSectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  mealsVerticalList: {
    gap: Spacing.md,
  },

  /* Modal Backdrop */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  goalModalCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
  },
  saveGoalBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveGoalBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
