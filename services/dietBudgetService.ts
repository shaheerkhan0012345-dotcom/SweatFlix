import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsianMeal } from '../data/asianDietData';
import { LOCAL_MEAL_IMAGES, VERIFIED_DISH_IMAGES } from '../constants/mealImages';
import {
  CuisineType,
  DayMealsStructure,
  getTierIndexForBudget,
  getTierMealsForDay,
  resolveMealsForBudgetAndDay,
} from '../data/budgetTierPlans';

export {
  CuisineType,
  DayMealsStructure,
  getTierIndexForBudget,
  getTierMealsForDay,
  resolveMealsForBudgetAndDay,
};

export const MIN_DAILY_BUDGET_USD = 4.0;
export const DEFAULT_DAILY_BUDGET_USD = 8.0;

export interface BudgetPreset {
  value: number;
  label: string;
  badge: string;
  subtitle: string;
}

export const BUDGET_PRESETS: BudgetPreset[] = [
  {
    value: 4.0,
    label: '$4 Saver',
    badge: 'MIN BUDGET',
    subtitle: 'High-Protein Value Staples',
  },
  {
    value: 6.0,
    label: '$6 Lean',
    badge: 'POPULAR',
    subtitle: 'Chicken, Oats & Congee',
  },
  {
    value: 8.0,
    label: '$8 Balanced',
    badge: 'BALANCED',
    subtitle: 'Teriyaki, Pho & Bowls',
  },
  {
    value: 10.0,
    label: '$10 Pro',
    badge: 'PERFORMANCE',
    subtitle: 'Bibimbap & Turkey Chili',
  },
  {
    value: 12.0,
    label: '$12+ Feast',
    badge: 'PREMIUM',
    subtitle: 'Atlantic Salmon & Steak',
  },
];

// ---------------------------------------------------------------------------
// 1. $4.00 STRICT ECONOMY ASIAN PLAN
// ---------------------------------------------------------------------------
export const ASIAN_BUDGET_4_MEALS: {
  breakfast: AsianMeal;
  lunch: AsianMeal;
  dinner: AsianMeal;
  snack: AsianMeal;
} = {
  breakfast: {
    id: 'as-b4-b',
    type: 'breakfast',
    title: 'Warm Rice Congee with Soft-Boiled Egg & Scallions',
    subtitle: 'Velvety slow-simmered jasmine rice porridge with 2 soft eggs, sesame oil, and fresh scallions',
    image: { uri: VERIFIED_DISH_IMAGES.congee },
    servingSize: '1 Large Bowl Congee + 2 Eggs',
    prepTime: '10 Mins',
    baseKcal: 390,
    baseProtein: 20,
    baseCarbs: 54,
    baseFat: 8,
    costUsd: 0.95,
    ingredients: [
      { id: 'ab4-1', name: 'Jasmine Rice & Broth', portion: '1 cup', costUsd: 0.35 },
      { id: 'ab4-2', name: '2 Farm Eggs', portion: '2 pieces', costUsd: 0.45 },
      { id: 'ab4-3', name: 'Scallions & Sesame Drizzle', portion: '1 tbsp', costUsd: 0.15 },
    ],
    instructions: [
      'Simmer cooked jasmine rice in light stock until velvety and thick.',
      'Top with halved soft-boiled eggs, fresh scallions, and a dash of soy sauce.',
    ],
    budgetTips: 'Rice bought in bulk costs pennies per serving while eggs provide complete bioavailable protein.',
  },
  lunch: {
    id: 'as-b4-l',
    type: 'lunch',
    title: 'Wok-Tossed Golden Egg Fried Rice with Veggies',
    subtitle: 'Fragrant jasmine rice wok-fried with 2 scrambled eggs, sweet green peas, carrots, and light soy sauce',
    image: LOCAL_MEAL_IMAGES.fried_rice,
    servingSize: '1 Generous Plate (300g)',
    prepTime: '12 Mins',
    baseKcal: 520,
    baseProtein: 22,
    baseCarbs: 68,
    baseFat: 14,
    costUsd: 1.15,
    ingredients: [
      { id: 'ab4-4', name: 'Steamed Rice', portion: '1.5 cups', costUsd: 0.40 },
      { id: 'ab4-5', name: '2 Whisked Eggs', portion: '2 pieces', costUsd: 0.45 },
      { id: 'ab4-6', name: 'Green Peas & Diced Carrots', portion: '1/2 cup', costUsd: 0.30 },
    ],
    instructions: [
      'Scramble eggs in a hot wok, set aside.',
      'Toss chilled rice with peas and carrots over high heat, return eggs and season with soy sauce.',
    ],
    budgetTips: 'Day-old rice crisps up nicely in the wok and prevents food waste.',
  },
  dinner: {
    id: 'as-b4-d',
    type: 'dinner',
    title: 'Spiced Dal Tadka with Steamed Rice & Greens',
    subtitle: 'Golden yellow moong lentils tempered with cumin, garlic, and ripe tomatoes over basmati rice',
    image: { uri: VERIFIED_DISH_IMAGES.dal_tadka },
    servingSize: '1 Bowl Dal (250ml) + 1 Cup Rice',
    prepTime: '20 Mins',
    baseKcal: 480,
    baseProtein: 24,
    baseCarbs: 74,
    baseFat: 9,
    costUsd: 1.25,
    ingredients: [
      { id: 'ab4-7', name: 'Yellow Moong Dal Lentils', portion: '1/2 cup dry', costUsd: 0.50 },
      { id: 'ab4-8', name: 'Basmati Rice', portion: '1 cup cooked', costUsd: 0.45 },
      { id: 'ab4-9', name: 'Garlic, Cumin & Tomato Tadka', portion: 'Seasoning', costUsd: 0.30 },
    ],
    instructions: [
      'Boil lentils with turmeric until creamy.',
      'Temper cumin seeds, minced garlic, and diced tomatoes in a splash of oil, pour over dal and serve with rice.',
    ],
    budgetTips: 'Lentils provide gut-healthy fiber, iron, and cost less than $1 per meal.',
  },
  snack: {
    id: 'as-b4-s',
    type: 'snack',
    title: 'Steamed Green Edamame with Flaky Sea Salt',
    subtitle: 'Vibrant green edamame pods steamed fresh and sprinkled with coarse mineral sea salt',
    image: LOCAL_MEAL_IMAGES.edamame,
    servingSize: '1 Bowl (120g pods)',
    prepTime: '4 Mins',
    baseKcal: 170,
    baseProtein: 16,
    baseCarbs: 11,
    baseFat: 5,
    costUsd: 0.65,
    ingredients: [
      { id: 'ab4-10', name: 'Frozen Edamame Pods', portion: '120g', costUsd: 0.55 },
      { id: 'ab4-11', name: 'Coarse Sea Salt', portion: '1 pinch', costUsd: 0.10 },
    ],
    instructions: [
      'Steam or microwave frozen edamame pods for 3-4 minutes.',
      'Toss with flaky sea salt and pop beans directly into mouth.',
    ],
    budgetTips: 'Frozen edamame bags cost under $2 at supermarkets and provide 3 generous protein-packed snacks.',
  },
};

// ---------------------------------------------------------------------------
// 2. $4.00 STRICT ECONOMY AMERICAN PLAN
// ---------------------------------------------------------------------------
export const AMERICAN_BUDGET_4_MEALS: {
  breakfast: AsianMeal;
  lunch: AsianMeal;
  dinner: AsianMeal;
  snack: AsianMeal;
} = {
  breakfast: {
    id: 'us-b4-b',
    type: 'breakfast',
    title: 'Warm Rolled Oatmeal with Sliced Banana & Cinnamon',
    subtitle: 'Thick rolled whole oats simmered warm, naturally sweetened with banana coins and cinnamon',
    image: LOCAL_MEAL_IMAGES.oatmeal,
    servingSize: '1 Deep Bowl (250g)',
    prepTime: '6 Mins',
    baseKcal: 390,
    baseProtein: 16,
    baseCarbs: 64,
    baseFat: 7,
    costUsd: 0.95,
    ingredients: [
      { id: 'ub4-1', name: 'Rolled Oats', portion: '1 cup dry', costUsd: 0.40 },
      { id: 'ub4-2', name: 'Fresh Banana', portion: '1 medium', costUsd: 0.25 },
      { id: 'ub4-3', name: 'Low-Fat Milk / Water & Cinnamon', portion: '1 cup', costUsd: 0.30 },
    ],
    instructions: [
      'Simmer rolled oats in milk or water for 5 minutes until creamy.',
      'Top with sliced banana coins and dust with ground cinnamon.',
    ],
    budgetTips: 'Rolled oats purchased in family canister cost under 20 cents per cup.',
  },
  lunch: {
    id: 'us-b4-l',
    type: 'lunch',
    title: 'Solid Albacore Tuna & Chickpea Protein Salad',
    subtitle: 'Flaked white albacore tuna tossed with rinsed chickpeas, diced cucumber, and lemon pepper',
    image: { uri: VERIFIED_DISH_IMAGES.tuna_salad },
    servingSize: '1 Large Salad Bowl',
    prepTime: '5 Mins',
    baseKcal: 460,
    baseProtein: 40,
    baseCarbs: 36,
    baseFat: 10,
    costUsd: 1.25,
    ingredients: [
      { id: 'ub4-4', name: 'Canned Albacore Tuna', portion: '1 can (5 oz)', costUsd: 0.75 },
      { id: 'ub4-5', name: 'Canned Chickpeas (Garbanzo)', portion: '1/2 cup', costUsd: 0.30 },
      { id: 'ub4-6', name: 'Diced Cucumber & Lemon', portion: '1/2 cup', costUsd: 0.20 },
    ],
    instructions: [
      'Drain tuna and rinse chickpeas.',
      'Toss together with diced cucumber, a squeeze of fresh lemon, and black pepper.',
    ],
    budgetTips: 'Canned tuna is the gold standard of high-protein athletic nutrition under $1.50.',
  },
  dinner: {
    id: 'us-b4-d',
    type: 'dinner',
    title: 'Hearty Ground Turkey & Black Bean Chili',
    subtitle: 'Lean ground turkey simmered with black beans, crushed tomatoes, onions, and chili spices',
    image: { uri: VERIFIED_DISH_IMAGES.turkey_chili },
    servingSize: '1 Hearty Bowl (300g)',
    prepTime: '20 Mins',
    baseKcal: 510,
    baseProtein: 42,
    baseCarbs: 48,
    baseFat: 13,
    costUsd: 1.25,
    ingredients: [
      { id: 'ub4-7', name: 'Lean Ground Turkey', portion: '4 oz', costUsd: 0.65 },
      { id: 'ub4-8', name: 'Black Beans', portion: '1/2 cup', costUsd: 0.30 },
      { id: 'ub4-9', name: 'Crushed Tomatoes & Onion', portion: '1/2 cup', costUsd: 0.30 },
    ],
    instructions: [
      'Brown ground turkey with diced onion in a pot.',
      'Add black beans, crushed tomatoes, and cumin; simmer 15 minutes.',
    ],
    budgetTips: 'Batch cooking chili yields 4 hearty servings and freezes easily.',
  },
  snack: {
    id: 'us-b4-s',
    type: 'snack',
    title: 'Hard-Boiled Farm Eggs with Black Pepper',
    subtitle: 'Two farm-fresh hard-boiled eggs seasoned with coarse sea salt and cracked black pepper',
    image: { uri: VERIFIED_DISH_IMAGES.hard_boiled_eggs },
    servingSize: '2 Hard-Boiled Eggs',
    prepTime: '8 Mins',
    baseKcal: 150,
    baseProtein: 14,
    baseCarbs: 2,
    baseFat: 10,
    costUsd: 0.55,
    ingredients: [
      { id: 'ub4-10', name: 'Farm Eggs', portion: '2 eggs', costUsd: 0.50 },
      { id: 'ub4-11', name: 'Black Pepper & Salt', portion: 'Pinch', costUsd: 0.05 },
    ],
    instructions: [
      'Place eggs in boiling water for 8 minutes, then ice bath.',
      'Peel and slice with sea salt and black pepper.',
    ],
    budgetTips: 'Eggs are one of the most cost-efficient sources of leucine for muscle protein synthesis.',
  },
};

/**
 * Storage key helper for per-date daily budget target.
 */
export function getBudgetStorageKey(userId: string, dateKey: string): string {
  return `@sweatflix_daily_budget_${userId}_${dateKey}`;
}

/**
 * Load persistent budget for a specific date (defaults to $8.00 if never set).
 */
export async function loadBudgetForDate(userId: string, dateKey: string): Promise<number> {
  try {
    const key = getBudgetStorageKey(userId, dateKey);
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed >= MIN_DAILY_BUDGET_USD) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading budget for date:', e);
  }
  return DEFAULT_DAILY_BUDGET_USD;
}

/**
 * Save persistent budget target for a specific date.
 */
export async function saveBudgetForDate(
  userId: string,
  dateKey: string,
  budget: number
): Promise<void> {
  try {
    const safeBudget = Math.max(MIN_DAILY_BUDGET_USD, Number(budget.toFixed(2)));
    const key = getBudgetStorageKey(userId, dateKey);
    await AsyncStorage.setItem(key, safeBudget.toString());
  } catch (e) {
    console.warn('Error saving budget for date:', e);
  }
}

/**
 * Intelligently returns a complete 4-meal plan matching the user's selected budget and day.
 * When switching between budget chips ($4, $6, $8, $10, $12+), distinct budget-calibrated meals appear.
 * For intermediate stepper budgets, ingredient prices scale precisely to match the exact cents.
 */
export function resolveMealsForSelectedBudget(
  basePlan: { breakfast: AsianMeal; lunch: AsianMeal; dinner: AsianMeal; snack: AsianMeal },
  targetBudget: number,
  cuisine: CuisineType | 'asian',
  dayNumber: number = 1
): DayMealsStructure {
  return resolveMealsForBudgetAndDay(dayNumber, targetBudget, cuisine);
}
