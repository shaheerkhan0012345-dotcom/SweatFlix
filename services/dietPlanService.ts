import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  THIRTY_DAY_PAKISTANI_PLAN,
  DayDietPlan,
  PakistaniMeal,
  UserDietPreferences,
  calculateGoalNutrition,
  DEFAULT_PKR_PRICES,
} from '../data/pakistaniDietData';

export interface PlanProgressState {
  completedDays: number[]; // e.g. [1, 2, 4]
  eatenMealIds: Record<string, boolean>; // e.g. { 'd1-b': true, 'd1-l': true }
  savedMeals: PakistaniMeal[];
  replacedMeals: Record<string, PakistaniMeal>; // keyed by meal id e.g. 'd4-d'
  lastActiveDay: number;
}

export const DEFAULT_PREFERENCES: UserDietPreferences = {
  budgetPkr: 450, // Rs. 450 / day (~Rs. 13,500 / month)
  budgetPeriod: 'daily',
  goal: 'general_health',
  preference: 'all',
  allergies: [],
  activityLevel: 'moderate',
};

const PLAN_PREFS_KEY = '@sweatflix_pakistan_diet_prefs';
const PLAN_PROGRESS_KEY = '@sweatflix_pakistan_diet_progress';

export const dietPlanService = {
  // Load preferences
  async loadPreferences(userId?: string): Promise<UserDietPreferences> {
    try {
      const key = userId ? `${PLAN_PREFS_KEY}_${userId}` : PLAN_PREFS_KEY;
      const json = await AsyncStorage.getItem(key);
      if (json) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(json) };
      }
    } catch (e) {
      console.warn('Failed to load diet preferences:', e);
    }
    return DEFAULT_PREFERENCES;
  },

  // Save preferences
  async savePreferences(prefs: UserDietPreferences, userId?: string): Promise<void> {
    try {
      const key = userId ? `${PLAN_PREFS_KEY}_${userId}` : PLAN_PREFS_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save diet preferences:', e);
    }
  },

  // Load progress
  async loadProgress(userId?: string): Promise<PlanProgressState> {
    try {
      const key = userId ? `${PLAN_PROGRESS_KEY}_${userId}` : PLAN_PROGRESS_KEY;
      const json = await AsyncStorage.getItem(key);
      if (json) {
        return JSON.parse(json);
      }
    } catch (e) {
      console.warn('Failed to load plan progress:', e);
    }
    return {
      completedDays: [],
      eatenMealIds: {},
      savedMeals: [],
      replacedMeals: {},
      lastActiveDay: 1,
    };
  },

  // Save progress
  async saveProgress(progress: PlanProgressState, userId?: string): Promise<void> {
    try {
      const key = userId ? `${PLAN_PROGRESS_KEY}_${userId}` : PLAN_PROGRESS_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save plan progress:', e);
    }
  },

  // Mark meal as eaten
  async toggleMealEaten(
    mealId: string,
    dayNumber: number,
    progress: PlanProgressState,
    userId?: string
  ): Promise<PlanProgressState> {
    const isEaten = !progress.eatenMealIds[mealId];
    const updatedEaten = { ...progress.eatenMealIds, [mealId]: isEaten };

    // Check if all 3 main meals for dayNumber are eaten
    const dayPrefix = `d${dayNumber}`;
    const allMainEaten =
      updatedEaten[`${dayPrefix}-b`] &&
      updatedEaten[`${dayPrefix}-l`] &&
      updatedEaten[`${dayPrefix}-d`];

    let updatedCompletedDays = [...progress.completedDays];
    if (allMainEaten && !updatedCompletedDays.includes(dayNumber)) {
      updatedCompletedDays.push(dayNumber);
    } else if (!allMainEaten && updatedCompletedDays.includes(dayNumber)) {
      updatedCompletedDays = updatedCompletedDays.filter((d) => d !== dayNumber);
    }

    const newProgress: PlanProgressState = {
      ...progress,
      eatenMealIds: updatedEaten,
      completedDays: updatedCompletedDays,
      lastActiveDay: dayNumber,
    };

    await this.saveProgress(newProgress, userId);
    return newProgress;
  },

  // Save/Bookmark meal
  async toggleSaveMeal(
    meal: PakistaniMeal,
    progress: PlanProgressState,
    userId?: string
  ): Promise<PlanProgressState> {
    const exists = progress.savedMeals.some((m) => m.id === meal.id || m.title === meal.title);
    let updatedSaved: PakistaniMeal[];
    if (exists) {
      updatedSaved = progress.savedMeals.filter((m) => m.id !== meal.id && m.title !== meal.title);
    } else {
      updatedSaved = [...progress.savedMeals, meal];
    }

    const newProgress: PlanProgressState = {
      ...progress,
      savedMeals: updatedSaved,
    };
    await this.saveProgress(newProgress, userId);
    return newProgress;
  },

  // Replace meal
  async replaceMeal(
    originalMealId: string,
    newMeal: PakistaniMeal,
    progress: PlanProgressState,
    userId?: string
  ): Promise<PlanProgressState> {
    const newProgress: PlanProgressState = {
      ...progress,
      replacedMeals: {
        ...progress.replacedMeals,
        [originalMealId]: newMeal,
      },
    };
    await this.saveProgress(newProgress, userId);
    return newProgress;
  },

  // Calculate day total stats
  calculateDayStats(dayPlan: DayDietPlan, prefs: UserDietPreferences, progress: PlanProgressState) {
    const bMeal = progress.replacedMeals[dayPlan.breakfast.id] || dayPlan.breakfast;
    const lMeal = progress.replacedMeals[dayPlan.lunch.id] || dayPlan.lunch;
    const dMeal = progress.replacedMeals[dayPlan.dinner.id] || dayPlan.dinner;
    const sMeal = progress.replacedMeals[dayPlan.snack.id] || dayPlan.snack;

    const bNut = calculateGoalNutrition(bMeal, prefs.goal, prefs.preference);
    const lNut = calculateGoalNutrition(lMeal, prefs.goal, prefs.preference);
    const dNut = calculateGoalNutrition(dMeal, prefs.goal, prefs.preference);
    const sNut = calculateGoalNutrition(sMeal, prefs.goal, prefs.preference);

    const totalKcal = bNut.kcal + lNut.kcal + dNut.kcal + sNut.kcal;
    const totalProtein = bNut.protein + lNut.protein + dNut.protein + sNut.protein;
    const totalCarbs = bNut.carbs + lNut.carbs + dNut.carbs + sNut.carbs;
    const totalFat = bNut.fat + lNut.fat + dNut.fat + sNut.fat;
    const totalCostPkr = bNut.costPkr + lNut.costPkr + dNut.costPkr + sNut.costPkr;

    return {
      totalKcal,
      totalProtein,
      totalCarbs,
      totalFat,
      totalCostPkr,
      meals: {
        breakfast: { meal: bMeal, nutrition: bNut },
        lunch: { meal: lMeal, nutrition: lNut },
        dinner: { meal: dMeal, nutrition: dNut },
        snack: { meal: sMeal, nutrition: sNut },
      },
    };
  },
};
