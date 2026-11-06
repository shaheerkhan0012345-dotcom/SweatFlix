// =============================================================================
// AMERICAN BALANCED ATHLETIC & WHOLE-FOODS DIET PLAN DATA
// Realistic US Supermarket Prices (USD $) • 30 Unique Days • Comprehensive
// =============================================================================

import { getVerifiedMealImage } from '../constants/mealImages';

export interface AmericanIngredientItem {
  id: string;
  name: string;
  portion: string;
  costUsd: number;
}

export interface AmericanMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  subtitle: string;
  image: any;
  servingSize: string;
  prepTime: string;
  baseKcal: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  costUsd: number;
  ingredients: AmericanIngredientItem[];
  instructions: string[];
  budgetTips: string;
}

export interface DayAmericanPlan {
  dayNumber: number;
  dayTitle: string;
  theme: string;
  breakfast: AmericanMeal;
  lunch: AmericanMeal;
  dinner: AmericanMeal;
  snack: AmericanMeal;
}

import { VERIFIED_DISH_IMAGES } from '../constants/mealImages';

export const AMERICAN_FOOD_IMAGES = {
  scrambled_eggs_toast: VERIFIED_DISH_IMAGES.scrambled_eggs_toast,
  oatmeal_berries: VERIFIED_DISH_IMAGES.oatmeal_berries,
  avocado_toast: VERIFIED_DISH_IMAGES.avocado_toast,
  pancakes: VERIFIED_DISH_IMAGES.pancakes,
  breakfast_burrito: VERIFIED_DISH_IMAGES.breakfast_burrito,
  yogurt_parfait: VERIFIED_DISH_IMAGES.yogurt_parfait,
  french_toast: VERIFIED_DISH_IMAGES.french_toast,
  spinach_omelet: VERIFIED_DISH_IMAGES.spinach_omelet,
  bagel_salmon: VERIFIED_DISH_IMAGES.scrambled_eggs_toast,
  waffles_fruit: VERIFIED_DISH_IMAGES.pancakes,
  smoothie_bowl: VERIFIED_DISH_IMAGES.smoothie_bowl,
  shakshuka: VERIFIED_DISH_IMAGES.scrambled_eggs_toast,
  boiled_eggs_toast: VERIFIED_DISH_IMAGES.hard_boiled_eggs,
  egg_muffins: VERIFIED_DISH_IMAGES.scrambled_eggs_toast,
  cottage_cheese_fruit: VERIFIED_DISH_IMAGES.cottage_cheese_fruit,
  chia_pudding: VERIFIED_DISH_IMAGES.chia_pudding,
  grilled_chicken_bowl: VERIFIED_DISH_IMAGES.quinoa_bowl,
  turkey_club_sandwich: VERIFIED_DISH_IMAGES.turkey_club_sandwich,
  tuna_salad: VERIFIED_DISH_IMAGES.tuna_salad,
  chicken_caesar_wrap: VERIFIED_DISH_IMAGES.chicken_caesar_wrap,
  chicken_quinoa_bowl: VERIFIED_DISH_IMAGES.quinoa_bowl,
  grassfed_burger_bowl: VERIFIED_DISH_IMAGES.burger_bowl,
  southwest_burrito_bowl: VERIFIED_DISH_IMAGES.quinoa_bowl,
  caesar_salad: VERIFIED_DISH_IMAGES.caesar_salad,
  grilled_shrimp_salad: VERIFIED_DISH_IMAGES.shrimp_salad,
  mediterranean_bowl: VERIFIED_DISH_IMAGES.caesar_salad,
  salmon_salad: VERIFIED_DISH_IMAGES.grilled_salmon,
  lentil_soup: VERIFIED_DISH_IMAGES.turkey_chili,
  grilled_chicken_salad: VERIFIED_DISH_IMAGES.caesar_salad,
  salmon_asparagus: VERIFIED_DISH_IMAGES.grilled_salmon,
  steak_sweet_potato: VERIFIED_DISH_IMAGES.steak_sweet_potato,
  turkey_chili: VERIFIED_DISH_IMAGES.turkey_chili,
  turkey_meatballs_pasta: VERIFIED_DISH_IMAGES.turkey_meatballs_pasta,
  roasted_herb_chicken: VERIFIED_DISH_IMAGES.roasted_chicken,
  baked_cod_fish: VERIFIED_DISH_IMAGES.baked_cod_fish,
  beef_tenderloin: VERIFIED_DISH_IMAGES.filet_mignon,
  chicken_fajitas: VERIFIED_DISH_IMAGES.chicken_fajitas,
  beef_stir_fry: VERIFIED_DISH_IMAGES.steak_sweet_potato,
  pasta_chicken: VERIFIED_DISH_IMAGES.pasta_chicken,
  apple_almond_butter: VERIFIED_DISH_IMAGES.apple_almond_butter,
  greek_yogurt_snack: VERIFIED_DISH_IMAGES.yogurt_parfait,
  trail_mix: VERIFIED_DISH_IMAGES.trail_mix,
  protein_shake: VERIFIED_DISH_IMAGES.protein_shake,
  cottage_cheese: VERIFIED_DISH_IMAGES.cottage_cheese_fruit,
  hummus_carrots: VERIFIED_DISH_IMAGES.caesar_salad,
  hard_boiled_eggs: VERIFIED_DISH_IMAGES.hard_boiled_eggs,
  roasted_chana: VERIFIED_DISH_IMAGES.trail_mix,
  fallback: VERIFIED_DISH_IMAGES.quinoa_bowl,
};

export const THIRTY_DAY_AMERICAN_PLAN: DayAmericanPlan[] = [
  {
    "dayNumber": 1,
    "dayTitle": "Day 1: Balanced Athletic Nutrition",
    "theme": "Scrambled Farm Eggs & Pan-Seared Atlantic Salmon Fillet",
    "breakfast": {
      "id": "us-d1-b",
      "type": "breakfast",
      "title": "Scrambled Farm Eggs, Sliced Avocado & Sourdough Toast",
      "subtitle": "3 farm-fresh eggs scrambled in light olive oil with half sliced avocado on artisan sourdough",
      "image": AMERICAN_FOOD_IMAGES.scrambled_eggs_toast,
      "servingSize": "3 Eggs + 2 Slices Toast + 1/2 Avocado",
      "prepTime": "10 Mins",
      "baseKcal": 440,
      "baseProtein": 24,
      "baseCarbs": 32,
      "baseFat": 22,
      "costUsd": 2.75,
      "ingredients": [
        {
          "id": "us-i-1-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.79
        },
        {
          "id": "us-i-1-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.96
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d1-l",
      "type": "lunch",
      "title": "Grilled Lemon Herb Chicken Bowl with Quinoa",
      "subtitle": "Char-grilled chicken breast over fluffy tri-color quinoa and steamed broccoli",
      "image": AMERICAN_FOOD_IMAGES.grilled_chicken_bowl,
      "servingSize": "1 Large Bowl (200g Chicken)",
      "prepTime": "15 Mins",
      "baseKcal": 560,
      "baseProtein": 48,
      "baseCarbs": 52,
      "baseFat": 14,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "us-i-1-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.88
        },
        {
          "id": "us-i-1-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.06
        },
        {
          "id": "us-i-1-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.86
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d1-d",
      "type": "dinner",
      "title": "Pan-Seared Atlantic Salmon Fillet with Asparagus",
      "subtitle": "Crispy skin wild salmon fillet paired with roasted garlic asparagus and jasmine rice",
      "image": AMERICAN_FOOD_IMAGES.salmon_asparagus,
      "servingSize": "6 oz Salmon + Veggies",
      "prepTime": "18 Mins",
      "baseKcal": 580,
      "baseProtein": 44,
      "baseCarbs": 38,
      "baseFat": 26,
      "costUsd": 6.9,
      "ingredients": [
        {
          "id": "us-i-1-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.69
        },
        {
          "id": "us-i-1-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.38
        },
        {
          "id": "us-i-1-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.83
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d1-s",
      "type": "snack",
      "title": "Honeycrisp Apple Slices with Natural Peanut Butter",
      "subtitle": "Crisp, sweet apple wedges dipped in 100% natural creamy roasted peanut butter",
      "image": AMERICAN_FOOD_IMAGES.apple_almond_butter,
      "servingSize": "1 Apple + 2 tbsp PB",
      "prepTime": "3 Mins",
      "baseKcal": 260,
      "baseProtein": 8,
      "baseCarbs": 34,
      "baseFat": 14,
      "costUsd": 1.3,
      "ingredients": [
        {
          "id": "us-i-1-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.3
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 2,
    "dayTitle": "Day 2: Balanced Athletic Nutrition",
    "theme": "Warm Steel-Cut Oatmeal with Blueberries & Almonds & Cast-Iron Choice NY Strip Steak",
    "breakfast": {
      "id": "us-d2-b",
      "type": "breakfast",
      "title": "Warm Steel-Cut Oatmeal with Blueberries & Almonds",
      "subtitle": "Hearty whole rolled oats simmered in almond milk topped with fresh blueberries and sliced almonds",
      "image": AMERICAN_FOOD_IMAGES.oatmeal_berries,
      "servingSize": "1 Deep Bowl (1 Cup Cooked)",
      "prepTime": "8 Mins",
      "baseKcal": 390,
      "baseProtein": 16,
      "baseCarbs": 58,
      "baseFat": 12,
      "costUsd": 1.95,
      "ingredients": [
        {
          "id": "us-i-2-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.27
        },
        {
          "id": "us-i-2-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.68
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d2-l",
      "type": "lunch",
      "title": "Smoked Turkey Breast & Avocado Club Wrap",
      "subtitle": "Sliced roasted deli turkey breast with crisp romaine, tomato, and avocado in a spinach wrap",
      "image": AMERICAN_FOOD_IMAGES.turkey_club_sandwich,
      "servingSize": "1 Stuffed Wrap (6 oz Turkey)",
      "prepTime": "6 Mins",
      "baseKcal": 490,
      "baseProtein": 42,
      "baseCarbs": 38,
      "baseFat": 16,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "us-i-2-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.64
        },
        {
          "id": "us-i-2-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.97
        },
        {
          "id": "us-i-2-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.79
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d2-d",
      "type": "dinner",
      "title": "Cast-Iron Choice NY Strip Steak with Baked Sweet Potato",
      "subtitle": "Pan-seared USDA Choice steak with rosemary garlic butter, served with sweet potato and green beans",
      "image": AMERICAN_FOOD_IMAGES.steak_sweet_potato,
      "servingSize": "7 oz Steak + Sweet Potato",
      "prepTime": "20 Mins",
      "baseKcal": 620,
      "baseProtein": 52,
      "baseCarbs": 42,
      "baseFat": 24,
      "costUsd": 7.2,
      "ingredients": [
        {
          "id": "us-i-2-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.9
        },
        {
          "id": "us-i-2-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.44
        },
        {
          "id": "us-i-2-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.86
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d2-s",
      "type": "snack",
      "title": "Greek Yogurt Parfait with Wild Honey & Chia Seeds",
      "subtitle": "Thick strained 0% Greek yogurt layered with raw wild honey and crunchy chia seeds",
      "image": AMERICAN_FOOD_IMAGES.greek_yogurt_snack,
      "servingSize": "1 Cup (170g Yogurt)",
      "prepTime": "2 Mins",
      "baseKcal": 210,
      "baseProtein": 22,
      "baseCarbs": 24,
      "baseFat": 2.5,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "us-i-2-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.6
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 3,
    "dayTitle": "Day 3: Balanced Athletic Nutrition",
    "theme": "Spinach & Slow-Cooked Lean Ground Turkey & Black Bean Chili",
    "breakfast": {
      "id": "us-d3-b",
      "type": "breakfast",
      "title": "Spinach, Feta & Egg White Scramble with Sourdough",
      "subtitle": "Fluffy egg whites scrambled with baby spinach, crumbled feta, and toasted artisan sourdough",
      "image": AMERICAN_FOOD_IMAGES.spinach_omelet,
      "servingSize": "4 Whites + 1 Egg + Toast",
      "prepTime": "8 Mins",
      "baseKcal": 380,
      "baseProtein": 28,
      "baseCarbs": 30,
      "baseFat": 12,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "us-i-3-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.69
        },
        {
          "id": "us-i-3-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.91
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d3-l",
      "type": "lunch",
      "title": "Solid White Albacore Tuna Salad Bowl with Lemon Dressing",
      "subtitle": "Solid white albacore tuna flaked over crisp greens, cucumber, cherry tomatoes, and chickpeas",
      "image": AMERICAN_FOOD_IMAGES.tuna_salad,
      "servingSize": "1 Large Bowl (1 Can Tuna)",
      "prepTime": "6 Mins",
      "baseKcal": 450,
      "baseProtein": 42,
      "baseCarbs": 32,
      "baseFat": 14,
      "costUsd": 3.8,
      "ingredients": [
        {
          "id": "us-i-3-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.28
        },
        {
          "id": "us-i-3-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.84
        },
        {
          "id": "us-i-3-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.68
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d3-d",
      "type": "dinner",
      "title": "Slow-Cooked Lean Ground Turkey & Black Bean Chili",
      "subtitle": "Thick, aromatic chili made with 93% lean ground turkey, kidney beans, and fire-roasted tomatoes",
      "image": AMERICAN_FOOD_IMAGES.turkey_chili,
      "servingSize": "2 Deep Ladles (400g)",
      "prepTime": "25 Mins",
      "baseKcal": 520,
      "baseProtein": 46,
      "baseCarbs": 52,
      "baseFat": 12,
      "costUsd": 4.2,
      "ingredients": [
        {
          "id": "us-i-3-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 2.86
        },
        {
          "id": "us-i-3-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.84
        },
        {
          "id": "us-i-3-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d3-s",
      "type": "snack",
      "title": "Low-Fat Cottage Cheese with Juicy Pineapple Chunks",
      "subtitle": "Slow-digesting micellar casein protein with sweet, juicy fresh pineapple chunks",
      "image": AMERICAN_FOOD_IMAGES.cottage_cheese,
      "servingSize": "1 Cup Cottage Cheese + Pineapple",
      "prepTime": "2 Mins",
      "baseKcal": 210,
      "baseProtein": 26,
      "baseCarbs": 22,
      "baseFat": 2.5,
      "costUsd": 1.7,
      "ingredients": [
        {
          "id": "us-i-3-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.7
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 4,
    "dayTitle": "Day 4: Balanced Athletic Nutrition",
    "theme": "Fluffy Whole-Wheat Protein Pancakes with Pure Maple Syrup & Lean Italian Turkey Meatballs in Rustic Marinara over Penne",
    "breakfast": {
      "id": "us-d4-b",
      "type": "breakfast",
      "title": "Fluffy Whole-Wheat Protein Pancakes with Pure Maple Syrup",
      "subtitle": "Oat flour and egg white pancakes with fresh sliced strawberries and pure maple syrup",
      "image": AMERICAN_FOOD_IMAGES.pancakes,
      "servingSize": "3 Pancakes + Fruit",
      "prepTime": "12 Mins",
      "baseKcal": 430,
      "baseProtein": 25,
      "baseCarbs": 62,
      "baseFat": 8,
      "costUsd": 2.5,
      "ingredients": [
        {
          "id": "us-i-4-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.63
        },
        {
          "id": "us-i-4-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.88
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d4-l",
      "type": "lunch",
      "title": "Warm Grilled Chicken Caesar Salad with Sourdough Croutons",
      "subtitle": "Crisp romaine hearts tossed with light Caesar, shaved parmesan, and sliced grilled chicken breast",
      "image": AMERICAN_FOOD_IMAGES.caesar_salad,
      "servingSize": "Large Salad (180g Chicken)",
      "prepTime": "10 Mins",
      "baseKcal": 480,
      "baseProtein": 44,
      "baseCarbs": 22,
      "baseFat": 20,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "us-i-4-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.94
        },
        {
          "id": "us-i-4-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.08
        },
        {
          "id": "us-i-4-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.88
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d4-d",
      "type": "dinner",
      "title": "Lean Italian Turkey Meatballs in Rustic Marinara over Penne",
      "subtitle": "Baked Italian turkey meatballs simmered in rustic marinara sauce with al dente whole wheat penne",
      "image": AMERICAN_FOOD_IMAGES.turkey_meatballs_pasta,
      "servingSize": "4 Meatballs + Pasta",
      "prepTime": "22 Mins",
      "baseKcal": 550,
      "baseProtein": 45,
      "baseCarbs": 64,
      "baseFat": 12,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-4-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.13
        },
        {
          "id": "us-i-4-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.92
        },
        {
          "id": "us-i-4-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.55
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d4-s",
      "type": "snack",
      "title": "Roasted Almonds & Tart Dried Cranberries Trail Mix",
      "subtitle": "Handful of raw Californian almonds paired with antioxidant-rich tart dried cranberries",
      "image": AMERICAN_FOOD_IMAGES.trail_mix,
      "servingSize": "1.5 oz (40g)",
      "prepTime": "1 Min",
      "baseKcal": 220,
      "baseProtein": 6,
      "baseCarbs": 18,
      "baseFat": 14,
      "costUsd": 1.4,
      "ingredients": [
        {
          "id": "us-i-4-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.4
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 5,
    "dayTitle": "Day 5: Balanced Athletic Nutrition",
    "theme": "California Avocado Toast with Sunny-Side Farm Egg & Oven-Roasted Lemon Rosemary Chicken Breast",
    "breakfast": {
      "id": "us-d5-b",
      "type": "breakfast",
      "title": "California Avocado Toast with Sunny-Side Farm Egg",
      "subtitle": "Toasted whole grain sourdough spread with creamy mashed avocado, bagel seasoning, and a fried egg",
      "image": AMERICAN_FOOD_IMAGES.avocado_toast,
      "servingSize": "2 Toasts + 1 Egg + 1/2 Avocado",
      "prepTime": "8 Mins",
      "baseKcal": 410,
      "baseProtein": 18,
      "baseCarbs": 34,
      "baseFat": 20,
      "costUsd": 2.65,
      "ingredients": [
        {
          "id": "us-i-5-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.72
        },
        {
          "id": "us-i-5-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.93
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d5-l",
      "type": "lunch",
      "title": "Southwestern Chipotle Chicken Burrito Bowl with Brown Rice",
      "subtitle": "Grilled chicken fajita strips with roasted corn, black beans, pico de gallo, and fluffy brown rice",
      "image": AMERICAN_FOOD_IMAGES.southwest_burrito_bowl,
      "servingSize": "1 Heaping Bowl",
      "prepTime": "15 Mins",
      "baseKcal": 540,
      "baseProtein": 46,
      "baseCarbs": 60,
      "baseFat": 11,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-5-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.76
        },
        {
          "id": "us-i-5-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.01
        },
        {
          "id": "us-i-5-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.83
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d5-d",
      "type": "dinner",
      "title": "Oven-Roasted Lemon Rosemary Chicken Breast with Potatoes",
      "subtitle": "Juicy bone-in skinless chicken breast with garlic rosemary baby gold potatoes and green salad",
      "image": AMERICAN_FOOD_IMAGES.roasted_herb_chicken,
      "servingSize": "7 oz Chicken + Potatoes",
      "prepTime": "25 Mins",
      "baseKcal": 510,
      "baseProtein": 50,
      "baseCarbs": 36,
      "baseFat": 14,
      "costUsd": 4.5,
      "ingredients": [
        {
          "id": "us-i-5-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.06
        },
        {
          "id": "us-i-5-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.9
        },
        {
          "id": "us-i-5-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.54
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d5-s",
      "type": "snack",
      "title": "2 Hard-Boiled Farm Eggs with Everything Bagel Seasoning",
      "subtitle": "Convenient zero-carb snack packed with healthy choline, lutein, and complete amino acids",
      "image": AMERICAN_FOOD_IMAGES.hard_boiled_eggs,
      "servingSize": "2 Whole Eggs",
      "prepTime": "6 Mins",
      "baseKcal": 140,
      "baseProtein": 13,
      "baseCarbs": 1,
      "baseFat": 10,
      "costUsd": 0.7,
      "ingredients": [
        {
          "id": "us-i-5-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 6,
    "dayTitle": "Day 6: Balanced Athletic Nutrition",
    "theme": "Smoked Salmon Everything Bagel Thin with Light Cream Cheese & Baked Lemon Butter Atlantic Cod Loin",
    "breakfast": {
      "id": "us-d6-b",
      "type": "breakfast",
      "title": "Smoked Salmon Everything Bagel Thin with Light Cream Cheese",
      "subtitle": "Toasted whole grain bagel thin topped with light cream cheese, capers, and wild Nova lox",
      "image": AMERICAN_FOOD_IMAGES.bagel_salmon,
      "servingSize": "1 Bagel Thin (3 oz Lox)",
      "prepTime": "5 Mins",
      "baseKcal": 390,
      "baseProtein": 26,
      "baseCarbs": 44,
      "baseFat": 11,
      "costUsd": 3.8,
      "ingredients": [
        {
          "id": "us-i-6-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 2.47
        },
        {
          "id": "us-i-6-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 1.33
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d6-l",
      "type": "lunch",
      "title": "Grass-Fed Lean Burger Bowl with Sweet Potato Wedges",
      "subtitle": "Seasoned 90% lean beef patty over chopped greens with pickle chips and air-fried sweet potatoes",
      "image": AMERICAN_FOOD_IMAGES.grassfed_burger_bowl,
      "servingSize": "1 Burger Bowl (6 oz Beef)",
      "prepTime": "15 Mins",
      "baseKcal": 560,
      "baseProtein": 46,
      "baseCarbs": 42,
      "baseFat": 20,
      "costUsd": 5.4,
      "ingredients": [
        {
          "id": "us-i-6-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.24
        },
        {
          "id": "us-i-6-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.19
        },
        {
          "id": "us-i-6-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.97
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d6-d",
      "type": "dinner",
      "title": "Baked Lemon Butter Atlantic Cod Loin with Cauliflower Mash",
      "subtitle": "Flaky Atlantic cod baked with herbs and lemon served with roasted garlic cauliflower mash",
      "image": AMERICAN_FOOD_IMAGES.baked_cod_fish,
      "servingSize": "7 oz Cod + Cauliflower",
      "prepTime": "18 Mins",
      "baseKcal": 460,
      "baseProtein": 42,
      "baseCarbs": 24,
      "baseFat": 16,
      "costUsd": 5.6,
      "ingredients": [
        {
          "id": "us-i-6-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.81
        },
        {
          "id": "us-i-6-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.12
        },
        {
          "id": "us-i-6-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.67
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d6-s",
      "type": "snack",
      "title": "Crisp Celery & Carrot Sticks with Roasted Garlic Hummus",
      "subtitle": "Crunchy farm vegetables served with creamy Mediterranean chickpea tahini hummus",
      "image": AMERICAN_FOOD_IMAGES.hummus_carrots,
      "servingSize": "Veggie Sticks + 3 tbsp Hummus",
      "prepTime": "3 Mins",
      "baseKcal": 170,
      "baseProtein": 6,
      "baseCarbs": 22,
      "baseFat": 7,
      "costUsd": 1.25,
      "ingredients": [
        {
          "id": "us-i-6-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.25
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 7,
    "dayTitle": "Day 7: Balanced Athletic Nutrition",
    "theme": "Cinnamon Vanilla French Toast with Fresh Strawberries & Honey-Mustard Glazed Tender Beef Medallions",
    "breakfast": {
      "id": "us-d7-b",
      "type": "breakfast",
      "title": "Cinnamon Vanilla French Toast with Fresh Strawberries",
      "subtitle": "Whole grain sourdough dipped in egg and cinnamon custard, griddled golden and topped with strawberries",
      "image": AMERICAN_FOOD_IMAGES.french_toast,
      "servingSize": "2 Slices French Toast + Berries",
      "prepTime": "10 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 58,
      "baseFat": 10,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "us-i-7-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.56
        },
        {
          "id": "us-i-7-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.84
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d7-l",
      "type": "lunch",
      "title": "Grilled Chicken Pesto Flatbread Wrap with Baby Spinach",
      "subtitle": "Spinach wrap rolled with sliced chicken breast, light basil pesto, and baby spinach",
      "image": AMERICAN_FOOD_IMAGES.chicken_caesar_wrap,
      "servingSize": "1 Large Wrap",
      "prepTime": "8 Mins",
      "baseKcal": 490,
      "baseProtein": 42,
      "baseCarbs": 36,
      "baseFat": 16,
      "costUsd": 4.7,
      "ingredients": [
        {
          "id": "us-i-7-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.82
        },
        {
          "id": "us-i-7-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.03
        },
        {
          "id": "us-i-7-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.85
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d7-d",
      "type": "dinner",
      "title": "Honey-Mustard Glazed Tender Beef Medallions with Green Beans",
      "subtitle": "Extra-lean halal beef tenderloin medallions roasted with honey mustard glaze and green beans",
      "image": AMERICAN_FOOD_IMAGES.beef_tenderloin,
      "servingSize": "6.5 oz Medallions + Veggies",
      "prepTime": "20 Mins",
      "baseKcal": 510,
      "baseProtein": 48,
      "baseCarbs": 32,
      "baseFat": 15,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "us-i-7-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.33
        },
        {
          "id": "us-i-7-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.98
        },
        {
          "id": "us-i-7-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.59
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d7-s",
      "type": "snack",
      "title": "Whey Protein Isolate Shake with Cold Brew Coffee",
      "subtitle": "Vanilla whey protein shaken with chilled cold brew for a high-protein energetic boost",
      "image": AMERICAN_FOOD_IMAGES.protein_shake,
      "servingSize": "1 Shaker Cup (1 Scoop Whey)",
      "prepTime": "2 Mins",
      "baseKcal": 160,
      "baseProtein": 27,
      "baseCarbs": 4,
      "baseFat": 2,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "us-i-7-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.6
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 8,
    "dayTitle": "Day 8: Balanced Athletic Nutrition",
    "theme": "Breakfast Burrito with Scrambled Eggs & Sizzling Chicken Fajitas",
    "breakfast": {
      "id": "us-d8-b",
      "type": "breakfast",
      "title": "Breakfast Burrito with Scrambled Eggs, Black Beans & Salsa",
      "subtitle": "Warm whole wheat tortilla stuffed with fluffy eggs, black beans, sharp cheddar, and fresh salsa",
      "image": AMERICAN_FOOD_IMAGES.breakfast_burrito,
      "servingSize": "1 Stuffed Burrito",
      "prepTime": "10 Mins",
      "baseKcal": 450,
      "baseProtein": 26,
      "baseCarbs": 42,
      "baseFat": 18,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "us-i-8-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.69
        },
        {
          "id": "us-i-8-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.91
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d8-l",
      "type": "lunch",
      "title": "Wild Alaskan Salmon Salad with Avocado & Dijon Dressing",
      "subtitle": "Flaked salmon over crisp garden greens, sliced avocado, cucumber, and light Dijon dressing",
      "image": AMERICAN_FOOD_IMAGES.salmon_salad,
      "servingSize": "1 Large Salad Bowl",
      "prepTime": "10 Mins",
      "baseKcal": 480,
      "baseProtein": 38,
      "baseCarbs": 18,
      "baseFat": 28,
      "costUsd": 5.4,
      "ingredients": [
        {
          "id": "us-i-8-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.24
        },
        {
          "id": "us-i-8-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.19
        },
        {
          "id": "us-i-8-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.97
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d8-d",
      "type": "dinner",
      "title": "Sizzling Chicken Fajitas with Bell Peppers & Warm Tortillas",
      "subtitle": "Marinated chicken breast strips seared with sweet tri-color bell peppers, sweet onions, and lime",
      "image": AMERICAN_FOOD_IMAGES.chicken_fajitas,
      "servingSize": "3 Fajitas (200g Chicken)",
      "prepTime": "20 Mins",
      "baseKcal": 560,
      "baseProtein": 48,
      "baseCarbs": 52,
      "baseFat": 14,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "us-i-8-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.26
        },
        {
          "id": "us-i-8-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.96
        },
        {
          "id": "us-i-8-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.58
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d8-s",
      "type": "snack",
      "title": "Raw California Walnuts & Seedless Red Grapes",
      "subtitle": "Heart-healthy plant omega-3 ALA from raw walnuts paired with sweet hydrating grapes",
      "image": AMERICAN_FOOD_IMAGES.trail_mix,
      "servingSize": "1 oz Walnuts + 1 Cup Grapes",
      "prepTime": "1 Min",
      "baseKcal": 230,
      "baseProtein": 5,
      "baseCarbs": 28,
      "baseFat": 14,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "us-i-8-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.5
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 9,
    "dayTitle": "Day 9: Balanced Athletic Nutrition",
    "theme": "Layered Greek Yogurt Parfait with Granola & Raspberries & Lean Sirloin Beef Stir-Fry",
    "breakfast": {
      "id": "us-d9-b",
      "type": "breakfast",
      "title": "Layered Greek Yogurt Parfait with Granola & Raspberries",
      "subtitle": "Creamy plain Greek yogurt layered with toasted almond granola and fresh tart raspberries",
      "image": AMERICAN_FOOD_IMAGES.yogurt_parfait,
      "servingSize": "1 Tall Parfait (1 Cup Yogurt)",
      "prepTime": "4 Mins",
      "baseKcal": 370,
      "baseProtein": 24,
      "baseCarbs": 48,
      "baseFat": 8,
      "costUsd": 2.3,
      "ingredients": [
        {
          "id": "us-i-9-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.49
        },
        {
          "id": "us-i-9-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.8
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d9-l",
      "type": "lunch",
      "title": "Mediterranean Grilled Chicken & Farro Bowl with Olives",
      "subtitle": "Ancient grain farro topped with oregano chicken breast, kalamata olives, cucumber, and tzatziki",
      "image": AMERICAN_FOOD_IMAGES.mediterranean_bowl,
      "servingSize": "1 Large Bowl",
      "prepTime": "15 Mins",
      "baseKcal": 530,
      "baseProtein": 46,
      "baseCarbs": 54,
      "baseFat": 14,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "us-i-9-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.94
        },
        {
          "id": "us-i-9-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.08
        },
        {
          "id": "us-i-9-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.88
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d9-d",
      "type": "dinner",
      "title": "Lean Sirloin Beef Stir-Fry with Broccoli & Snap Peas",
      "subtitle": "Tender sirloin strips flash-seared with crisp broccoli florets, sugar snap peas, and low-sodium tamari",
      "image": AMERICAN_FOOD_IMAGES.beef_stir_fry,
      "servingSize": "6 oz Beef + Veggies",
      "prepTime": "16 Mins",
      "baseKcal": 540,
      "baseProtein": 48,
      "baseCarbs": 38,
      "baseFat": 18,
      "costUsd": 6.2,
      "ingredients": [
        {
          "id": "us-i-9-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.22
        },
        {
          "id": "us-i-9-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.24
        },
        {
          "id": "us-i-9-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.74
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d9-s",
      "type": "snack",
      "title": "Sliced Bosc Pear with Creamy Almond Butter",
      "subtitle": "Sweet aromatic pear wedges paired with creamy roasted unsalted almond butter",
      "image": AMERICAN_FOOD_IMAGES.apple_almond_butter,
      "servingSize": "1 Whole Pear + 2 tbsp Almond Butter",
      "prepTime": "2 Mins",
      "baseKcal": 240,
      "baseProtein": 6,
      "baseCarbs": 32,
      "baseFat": 12,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "us-i-9-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.6
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 10,
    "dayTitle": "Day 10: Balanced Athletic Nutrition",
    "theme": "Belgian Whole-Grain Protein Waffles with Blueberries & Garlic Butter Seared Wild Salmon",
    "breakfast": {
      "id": "us-d10-b",
      "type": "breakfast",
      "title": "Belgian Whole-Grain Protein Waffles with Blueberries",
      "subtitle": "Golden crisp waffles made with whole-grain flour and whey, topped with warm blueberries and honey",
      "image": AMERICAN_FOOD_IMAGES.waffles_fruit,
      "servingSize": "2 Waffles + Blueberries",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 24,
      "baseCarbs": 58,
      "baseFat": 8,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "us-i-10-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.69
        },
        {
          "id": "us-i-10-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.91
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d10-l",
      "type": "lunch",
      "title": "Citrus Herb Grilled Shrimp Bowl with Quinoa & Peppers",
      "subtitle": "Jumbo wild shrimp grilled with garlic and lime over quinoa with sweet roasted bell peppers",
      "image": AMERICAN_FOOD_IMAGES.grilled_shrimp_salad,
      "servingSize": "1 Bowl (8-10 Shrimp)",
      "prepTime": "12 Mins",
      "baseKcal": 470,
      "baseProtein": 38,
      "baseCarbs": 48,
      "baseFat": 12,
      "costUsd": 5.8,
      "ingredients": [
        {
          "id": "us-i-10-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.48
        },
        {
          "id": "us-i-10-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.28
        },
        {
          "id": "us-i-10-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 1.04
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d10-d",
      "type": "dinner",
      "title": "Garlic Butter Seared Wild Salmon with Zucchini Ribbons",
      "subtitle": "Omega-rich wild salmon seared with garlic herb butter, accompanied by zucchini ribbons and brown rice",
      "image": AMERICAN_FOOD_IMAGES.salmon_asparagus,
      "servingSize": "6 oz Salmon + Ribbons",
      "prepTime": "15 Mins",
      "baseKcal": 560,
      "baseProtein": 42,
      "baseCarbs": 34,
      "baseFat": 26,
      "costUsd": 6.8,
      "ingredients": [
        {
          "id": "us-i-10-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.62
        },
        {
          "id": "us-i-10-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.36
        },
        {
          "id": "us-i-10-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.82
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d10-s",
      "type": "snack",
      "title": "Whole-Grain Rice Cakes with Mashed Avocado & Sea Salt",
      "subtitle": "Crisp brown rice cakes topped with creamy crushed avocado and red pepper flakes",
      "image": AMERICAN_FOOD_IMAGES.avocado_toast,
      "servingSize": "2 Rice Cakes + 1/2 Avocado",
      "prepTime": "3 Mins",
      "baseKcal": 190,
      "baseProtein": 4,
      "baseCarbs": 22,
      "baseFat": 11,
      "costUsd": 1.2,
      "ingredients": [
        {
          "id": "us-i-10-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.2
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 11,
    "dayTitle": "Day 11: Balanced Athletic Nutrition",
    "theme": "Acai & Mixed Berry Smoothie Bowl with Chia Seeds & Whole Wheat Penne",
    "breakfast": {
      "id": "us-d11-b",
      "type": "breakfast",
      "title": "Acai & Mixed Berry Smoothie Bowl with Chia Seeds",
      "subtitle": "Thick blended acai puree topped with sliced bananas, strawberries, chia seeds, and coconut flakes",
      "image": AMERICAN_FOOD_IMAGES.smoothie_bowl,
      "servingSize": "1 Large Bowl (400ml)",
      "prepTime": "6 Mins",
      "baseKcal": 380,
      "baseProtein": 18,
      "baseCarbs": 64,
      "baseFat": 9,
      "costUsd": 2.9,
      "ingredients": [
        {
          "id": "us-i-11-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.89
        },
        {
          "id": "us-i-11-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 1.01
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d11-l",
      "type": "lunch",
      "title": "Roasted Red Pepper & Smoked Turkey Panini on Multigrain",
      "subtitle": "Warm pressed sandwich with lean roasted turkey breast, fire-roasted peppers, and provolone",
      "image": AMERICAN_FOOD_IMAGES.turkey_club_sandwich,
      "servingSize": "1 Whole Panini",
      "prepTime": "8 Mins",
      "baseKcal": 510,
      "baseProtein": 40,
      "baseCarbs": 44,
      "baseFat": 16,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-11-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.76
        },
        {
          "id": "us-i-11-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.01
        },
        {
          "id": "us-i-11-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.83
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d11-d",
      "type": "dinner",
      "title": "Whole Wheat Penne with Grilled Chicken Breast & Basil Marinara",
      "subtitle": "Tender grilled chicken breast sliced over whole wheat penne pasta with garlic marinara sauce",
      "image": AMERICAN_FOOD_IMAGES.pasta_chicken,
      "servingSize": "1 Large Pasta Plate",
      "prepTime": "16 Mins",
      "baseKcal": 530,
      "baseProtein": 46,
      "baseCarbs": 58,
      "baseFat": 11,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-11-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.13
        },
        {
          "id": "us-i-11-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.92
        },
        {
          "id": "us-i-11-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.55
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d11-s",
      "type": "snack",
      "title": "Mixed Berry Protein Smoothie with Spinach & Flaxseed",
      "subtitle": "Blended smoothie with blueberries, strawberries, baby spinach, vanilla whey, and ground flaxseed",
      "image": AMERICAN_FOOD_IMAGES.protein_shake,
      "servingSize": "1 Tall Glass (350ml)",
      "prepTime": "3 Mins",
      "baseKcal": 220,
      "baseProtein": 25,
      "baseCarbs": 24,
      "baseFat": 4,
      "costUsd": 1.8,
      "ingredients": [
        {
          "id": "us-i-11-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.8
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 12,
    "dayTitle": "Day 12: Balanced Athletic Nutrition",
    "theme": "Mediterranean Shakshuka with Poached Eggs & Crusty Toast & Tender Slow-Cooker Beef Pot Roast",
    "breakfast": {
      "id": "us-d12-b",
      "type": "breakfast",
      "title": "Mediterranean Shakshuka with Poached Eggs & Crusty Toast",
      "subtitle": "Farm eggs gently poached in a rich spiced tomato, bell pepper, and garlic sauce with toasted bread",
      "image": AMERICAN_FOOD_IMAGES.shakshuka,
      "servingSize": "2 Poached Eggs + Sauce + Toast",
      "prepTime": "15 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 38,
      "baseFat": 18,
      "costUsd": 2.5,
      "ingredients": [
        {
          "id": "us-i-12-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.63
        },
        {
          "id": "us-i-12-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.88
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d12-l",
      "type": "lunch",
      "title": "Hearty Garden Lentil & Vegetable Soup with Sourdough Roll",
      "subtitle": "Slow-simmered green lentils with carrots, celery, tomatoes, and garlic with a warm roll",
      "image": AMERICAN_FOOD_IMAGES.lentil_soup,
      "servingSize": "2 Bowls + Sourdough Roll",
      "prepTime": "15 Mins",
      "baseKcal": 440,
      "baseProtein": 26,
      "baseCarbs": 68,
      "baseFat": 6,
      "costUsd": 3.4,
      "ingredients": [
        {
          "id": "us-i-12-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.04
        },
        {
          "id": "us-i-12-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.75
        },
        {
          "id": "us-i-12-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.61
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d12-d",
      "type": "dinner",
      "title": "Tender Slow-Cooker Beef Pot Roast with Carrots & Red Potatoes",
      "subtitle": "Fork-tender lean beef chuck roasted with baby red potatoes, Dutch carrots, and rosemary au jus",
      "image": AMERICAN_FOOD_IMAGES.steak_sweet_potato,
      "servingSize": "6 oz Roast + Veggies",
      "prepTime": "25 Mins",
      "baseKcal": 580,
      "baseProtein": 50,
      "baseCarbs": 38,
      "baseFat": 22,
      "costUsd": 6.4,
      "ingredients": [
        {
          "id": "us-i-12-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.35
        },
        {
          "id": "us-i-12-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.28
        },
        {
          "id": "us-i-12-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.77
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d12-s",
      "type": "snack",
      "title": "Low-Fat String Cheese & Raw Unsalted Cashews",
      "subtitle": "Part-skim mozzarella string cheese paired with rich crunchy raw cashews",
      "image": AMERICAN_FOOD_IMAGES.cottage_cheese,
      "servingSize": "1 String Cheese + 1 oz Cashews",
      "prepTime": "1 Min",
      "baseKcal": 190,
      "baseProtein": 12,
      "baseCarbs": 10,
      "baseFat": 12,
      "costUsd": 1.35,
      "ingredients": [
        {
          "id": "us-i-12-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.35
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 13,
    "dayTitle": "Day 13: Balanced Athletic Nutrition",
    "theme": "2 Hard-Boiled Farm Eggs with Multigrain Toast & Tomatoes & Grilled Lemon Herb White Fish",
    "breakfast": {
      "id": "us-d13-b",
      "type": "breakfast",
      "title": "2 Hard-Boiled Farm Eggs with Multigrain Toast & Tomatoes",
      "subtitle": "Simple athletic breakfast featuring 2 hard-boiled eggs, seeded multigrain toast, and sliced ripe tomatoes",
      "image": AMERICAN_FOOD_IMAGES.boiled_eggs_toast,
      "servingSize": "2 Eggs + 2 Toast + Tomato",
      "prepTime": "8 Mins",
      "baseKcal": 360,
      "baseProtein": 20,
      "baseCarbs": 32,
      "baseFat": 14,
      "costUsd": 1.8,
      "ingredients": [
        {
          "id": "us-i-13-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.17
        },
        {
          "id": "us-i-13-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.63
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d13-l",
      "type": "lunch",
      "title": "Teriyaki Glazed Chicken Rice Bowl with Steamed Snap Peas",
      "subtitle": "Tender chicken breast tossed in low-sodium ginger teriyaki over jasmine rice and sugar snap peas",
      "image": AMERICAN_FOOD_IMAGES.chicken_quinoa_bowl,
      "servingSize": "1 Rice Bowl (200g Chicken)",
      "prepTime": "12 Mins",
      "baseKcal": 540,
      "baseProtein": 45,
      "baseCarbs": 64,
      "baseFat": 10,
      "costUsd": 4.5,
      "ingredients": [
        {
          "id": "us-i-13-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.7
        },
        {
          "id": "us-i-13-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.99
        },
        {
          "id": "us-i-13-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.81
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d13-d",
      "type": "dinner",
      "title": "Grilled Lemon Herb White Fish with Roasted Asparagus",
      "subtitle": "Flaky white fish fillet char-grilled with fresh thyme, sea salt, lemon, and steamed asparagus",
      "image": AMERICAN_FOOD_IMAGES.baked_cod_fish,
      "servingSize": "7 oz Fish Fillet + Asparagus",
      "prepTime": "15 Mins",
      "baseKcal": 440,
      "baseProtein": 40,
      "baseCarbs": 18,
      "baseFat": 14,
      "costUsd": 5.4,
      "ingredients": [
        {
          "id": "us-i-13-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.67
        },
        {
          "id": "us-i-13-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.08
        },
        {
          "id": "us-i-13-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d13-s",
      "type": "snack",
      "title": "Steamed Edamame in Pods with Coarse Sea Salt",
      "subtitle": "Whole green soybean pods steamed tender and sprinkled with crunchy coarse sea salt",
      "image": AMERICAN_FOOD_IMAGES.hummus_carrots,
      "servingSize": "1 Bowl (150g in pods)",
      "prepTime": "4 Mins",
      "baseKcal": 150,
      "baseProtein": 14,
      "baseCarbs": 12,
      "baseFat": 5,
      "costUsd": 1.2,
      "ingredients": [
        {
          "id": "us-i-13-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.2
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 14,
    "dayTitle": "Day 14: Balanced Athletic Nutrition",
    "theme": "Baked Egg & Honey Soy Glazed Chicken Thighs",
    "breakfast": {
      "id": "us-d14-b",
      "type": "breakfast",
      "title": "Baked Egg, Spinach & Turkey Bacon Frittata Muffins",
      "subtitle": "Warm portable egg muffins baked with baby spinach, diced turkey bacon, and light cheddar",
      "image": AMERICAN_FOOD_IMAGES.egg_muffins,
      "servingSize": "3 Frittata Muffins",
      "prepTime": "15 Mins",
      "baseKcal": 340,
      "baseProtein": 26,
      "baseCarbs": 8,
      "baseFat": 18,
      "costUsd": 2.3,
      "ingredients": [
        {
          "id": "us-i-14-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.49
        },
        {
          "id": "us-i-14-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.8
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d14-l",
      "type": "lunch",
      "title": "Classic Chicken Caesar Wrap with Shaved Parmesan",
      "subtitle": "Whole wheat spinach wrap filled with sliced chicken breast, shredded romaine, and Caesar dressing",
      "image": AMERICAN_FOOD_IMAGES.chicken_caesar_wrap,
      "servingSize": "1 Large Stuffed Wrap",
      "prepTime": "8 Mins",
      "baseKcal": 480,
      "baseProtein": 42,
      "baseCarbs": 32,
      "baseFat": 18,
      "costUsd": 4.5,
      "ingredients": [
        {
          "id": "us-i-14-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.7
        },
        {
          "id": "us-i-14-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.99
        },
        {
          "id": "us-i-14-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.81
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d14-d",
      "type": "dinner",
      "title": "Honey Soy Glazed Chicken Thighs with Roasted Brussels Sprouts",
      "subtitle": "Skinless chicken thighs baked in a savory sweet honey soy glaze with caramelized Brussels sprouts",
      "image": AMERICAN_FOOD_IMAGES.roasted_herb_chicken,
      "servingSize": "2 Thighs + Brussels Sprouts",
      "prepTime": "22 Mins",
      "baseKcal": 540,
      "baseProtein": 44,
      "baseCarbs": 36,
      "baseFat": 19,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "us-i-14-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.26
        },
        {
          "id": "us-i-14-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.96
        },
        {
          "id": "us-i-14-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.58
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d14-s",
      "type": "snack",
      "title": "Dark Chocolate (85% Cacao) Square with Raw Almonds",
      "subtitle": "Polyphenol-loaded antioxidant dark chocolate paired with crisp California whole almonds",
      "image": AMERICAN_FOOD_IMAGES.trail_mix,
      "servingSize": "20g Chocolate + 15g Almonds",
      "prepTime": "1 Min",
      "baseKcal": 210,
      "baseProtein": 6,
      "baseCarbs": 14,
      "baseFat": 16,
      "costUsd": 1.45,
      "ingredients": [
        {
          "id": "us-i-14-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.45
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 15,
    "dayTitle": "Day 15: Balanced Athletic Nutrition",
    "theme": "Low-Fat Cottage Cheese Bowl with Peaches & Walnuts & Lean Bison / 93% Beef Burger Patties",
    "breakfast": {
      "id": "us-d15-b",
      "type": "breakfast",
      "title": "Low-Fat Cottage Cheese Bowl with Peaches & Walnuts",
      "subtitle": "Slow-digesting curd cottage cheese topped with juicy sliced yellow peaches and crushed raw walnuts",
      "image": AMERICAN_FOOD_IMAGES.cottage_cheese_fruit,
      "servingSize": "1 Cup Cottage Cheese + Peach",
      "prepTime": "3 Mins",
      "baseKcal": 310,
      "baseProtein": 28,
      "baseCarbs": 26,
      "baseFat": 10,
      "costUsd": 2.1,
      "ingredients": [
        {
          "id": "us-i-15-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.37
        },
        {
          "id": "us-i-15-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.73
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d15-l",
      "type": "lunch",
      "title": "Blackened Salmon Poke-Style Bowl with Edamame & Brown Rice",
      "subtitle": "Spiced seared salmon cubes over brown rice, shelled edamame, cucumber, and coconut aminos",
      "image": AMERICAN_FOOD_IMAGES.salmon_salad,
      "servingSize": "1 Poke Bowl (5 oz Salmon)",
      "prepTime": "12 Mins",
      "baseKcal": 520,
      "baseProtein": 42,
      "baseCarbs": 46,
      "baseFat": 20,
      "costUsd": 6.2,
      "ingredients": [
        {
          "id": "us-i-15-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.72
        },
        {
          "id": "us-i-15-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.36
        },
        {
          "id": "us-i-15-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 1.12
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d15-d",
      "type": "dinner",
      "title": "Lean Bison / 93% Beef Burger Patties with Grilled Veggies",
      "subtitle": "Two seasoned lean burger patties char-broiled and served with grilled zucchini and sweet potato wedges",
      "image": AMERICAN_FOOD_IMAGES.steak_sweet_potato,
      "servingSize": "2 Patties (6 oz) + Veggies",
      "prepTime": "16 Mins",
      "baseKcal": 570,
      "baseProtein": 48,
      "baseCarbs": 40,
      "baseFat": 20,
      "costUsd": 6.2,
      "ingredients": [
        {
          "id": "us-i-15-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.22
        },
        {
          "id": "us-i-15-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.24
        },
        {
          "id": "us-i-15-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.74
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d15-s",
      "type": "snack",
      "title": "Air-Popped Sea Salt Popcorn with Nutritional Yeast",
      "subtitle": "Light fluffy whole-grain popcorn dusted with savory B-vitamin packed nutritional yeast and sea salt",
      "image": AMERICAN_FOOD_IMAGES.trail_mix,
      "servingSize": "4 Heaping Cups",
      "prepTime": "3 Mins",
      "baseKcal": 160,
      "baseProtein": 7,
      "baseCarbs": 28,
      "baseFat": 3,
      "costUsd": 0.9,
      "ingredients": [
        {
          "id": "us-i-15-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 16,
    "dayTitle": "Day 16: Balanced Athletic Nutrition",
    "theme": "Overnight Chia Seed & Rolled Oats Pudding with Strawberries & Baked Rosemary Garlic Lamb Chops",
    "breakfast": {
      "id": "us-d16-b",
      "type": "breakfast",
      "title": "Overnight Chia Seed & Rolled Oats Pudding with Strawberries",
      "subtitle": "Chilled rolled oats and chia seeds soaked overnight in vanilla almond milk with fresh sliced strawberries",
      "image": AMERICAN_FOOD_IMAGES.chia_pudding,
      "servingSize": "1 Mason Jar (350ml)",
      "prepTime": "2 Mins",
      "baseKcal": 360,
      "baseProtein": 15,
      "baseCarbs": 54,
      "baseFat": 10,
      "costUsd": 1.85,
      "ingredients": [
        {
          "id": "us-i-16-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.2
        },
        {
          "id": "us-i-16-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d16-l",
      "type": "lunch",
      "title": "Buffalo Chicken Salad with Crisp Romaine & Light Ranch",
      "subtitle": "Spicy tangy buffalo chicken breast sliced over crisp greens, celery sticks, and light buttermilk ranch",
      "image": AMERICAN_FOOD_IMAGES.caesar_salad,
      "servingSize": "Large Salad (180g Chicken)",
      "prepTime": "10 Mins",
      "baseKcal": 470,
      "baseProtein": 44,
      "baseCarbs": 18,
      "baseFat": 22,
      "costUsd": 4.7,
      "ingredients": [
        {
          "id": "us-i-16-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.82
        },
        {
          "id": "us-i-16-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.03
        },
        {
          "id": "us-i-16-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.85
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d16-d",
      "type": "dinner",
      "title": "Baked Rosemary Garlic Halal Lamb Chops with Steamed Green Beans",
      "subtitle": "Lean center-cut lamb loin chops baked with fresh rosemary and garlic butter, served with green beans",
      "image": AMERICAN_FOOD_IMAGES.beef_tenderloin,
      "servingSize": "2 Lean Chops + Green Beans",
      "prepTime": "20 Mins",
      "baseKcal": 520,
      "baseProtein": 48,
      "baseCarbs": 20,
      "baseFat": 22,
      "costUsd": 5.1,
      "ingredients": [
        {
          "id": "us-i-16-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.47
        },
        {
          "id": "us-i-16-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.02
        },
        {
          "id": "us-i-16-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.61
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d16-s",
      "type": "snack",
      "title": "Cottage Cheese with Sliced Strawberries & Sunflower Seeds",
      "subtitle": "Low-fat cottage cheese crowned with sweet sliced strawberries and roasted sunflower seed kernels",
      "image": AMERICAN_FOOD_IMAGES.cottage_cheese,
      "servingSize": "1 Cup Cottage Cheese + Berries",
      "prepTime": "2 Mins",
      "baseKcal": 220,
      "baseProtein": 26,
      "baseCarbs": 18,
      "baseFat": 5,
      "costUsd": 1.75,
      "ingredients": [
        {
          "id": "us-i-16-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.75
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 17,
    "dayTitle": "Day 17: Balanced Athletic Nutrition",
    "theme": "Classic Denver Omelet with Bell Peppers & Blackened Tilapia Fillet",
    "breakfast": {
      "id": "us-d17-b",
      "type": "breakfast",
      "title": "Classic Denver Omelet with Bell Peppers, Onions & Cheddar",
      "subtitle": "Three-egg folded omelet stuffed with diced sweet bell peppers, red onion, and melted sharp cheddar",
      "image": AMERICAN_FOOD_IMAGES.spinach_omelet,
      "servingSize": "3-Egg Omelet + Toast",
      "prepTime": "10 Mins",
      "baseKcal": 440,
      "baseProtein": 26,
      "baseCarbs": 22,
      "baseFat": 24,
      "costUsd": 2.45,
      "ingredients": [
        {
          "id": "us-i-17-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.59
        },
        {
          "id": "us-i-17-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.86
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d17-l",
      "type": "lunch",
      "title": "Lean Ground Turkey Taco Bowl with Black Beans & Guacamole",
      "subtitle": "Seasoned 93% lean ground turkey over cilantro lime rice with black beans, corn, and guacamole",
      "image": AMERICAN_FOOD_IMAGES.southwest_burrito_bowl,
      "servingSize": "1 Heaping Bowl",
      "prepTime": "14 Mins",
      "baseKcal": 530,
      "baseProtein": 44,
      "baseCarbs": 52,
      "baseFat": 15,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-17-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.76
        },
        {
          "id": "us-i-17-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.01
        },
        {
          "id": "us-i-17-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.83
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d17-d",
      "type": "dinner",
      "title": "Blackened Tilapia Fillet with Fresh Mango Salsa & Black Beans",
      "subtitle": "Cajun spiced tilapia seared golden and topped with sweet diced mango salsa and seasoned black beans",
      "image": AMERICAN_FOOD_IMAGES.baked_cod_fish,
      "servingSize": "7 oz Fillet + Salsa & Beans",
      "prepTime": "14 Mins",
      "baseKcal": 470,
      "baseProtein": 42,
      "baseCarbs": 46,
      "baseFat": 11,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-17-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.13
        },
        {
          "id": "us-i-17-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.92
        },
        {
          "id": "us-i-17-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.55
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d17-s",
      "type": "snack",
      "title": "Banana with 2 Tablespoons Natural Creamy Peanut Butter",
      "subtitle": "Ripe potassium-rich banana dipped in 100% roasted peanut butter with zero added oil or sugar",
      "image": AMERICAN_FOOD_IMAGES.apple_almond_butter,
      "servingSize": "1 Banana + 2 tbsp PB",
      "prepTime": "1 Min",
      "baseKcal": 270,
      "baseProtein": 8,
      "baseCarbs": 38,
      "baseFat": 14,
      "costUsd": 0.95,
      "ingredients": [
        {
          "id": "us-i-17-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 0.95
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 18,
    "dayTitle": "Day 18: Balanced Athletic Nutrition",
    "theme": "Peanut Butter Banana Toast on Rustic Whole Wheat & Tuscan Garlic Herb Chicken",
    "breakfast": {
      "id": "us-d18-b",
      "type": "breakfast",
      "title": "Peanut Butter Banana Toast on Rustic Whole Wheat",
      "subtitle": "Warm whole wheat toast smothered in all-natural creamy peanut butter and topped with banana coins and cinnamon",
      "image": AMERICAN_FOOD_IMAGES.avocado_toast,
      "servingSize": "2 Toasts + Banana + PB",
      "prepTime": "4 Mins",
      "baseKcal": 420,
      "baseProtein": 16,
      "baseCarbs": 58,
      "baseFat": 16,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "us-i-18-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 0.98
        },
        {
          "id": "us-i-18-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.52
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d18-l",
      "type": "lunch",
      "title": "Greek Village Chicken Salad with Crumbled Feta & Olive Oil",
      "subtitle": "Char-grilled chicken over vine ripe tomatoes, cucumbers, red onion, kalamata olives, and authentic feta",
      "image": AMERICAN_FOOD_IMAGES.mediterranean_bowl,
      "servingSize": "Large Salad Bowl",
      "prepTime": "10 Mins",
      "baseKcal": 490,
      "baseProtein": 44,
      "baseCarbs": 20,
      "baseFat": 24,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "us-i-18-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.94
        },
        {
          "id": "us-i-18-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.08
        },
        {
          "id": "us-i-18-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.88
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d18-d",
      "type": "dinner",
      "title": "Tuscan Garlic Herb Chicken with Sun-Dried Tomatoes & Spinach",
      "subtitle": "Pan-seared chicken breast simmered with garlic, sun-dried tomatoes, and baby spinach in a light broth",
      "image": AMERICAN_FOOD_IMAGES.roasted_herb_chicken,
      "servingSize": "7 oz Chicken + Tuscan Sauce",
      "prepTime": "18 Mins",
      "baseKcal": 510,
      "baseProtein": 48,
      "baseCarbs": 22,
      "baseFat": 16,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "us-i-18-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.33
        },
        {
          "id": "us-i-18-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.98
        },
        {
          "id": "us-i-18-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.59
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d18-s",
      "type": "snack",
      "title": "Chilled Cucumber Coins with Greek Yogurt Tzatziki Dip",
      "subtitle": "Crisp English cucumber slices served with garlicky dill Greek yogurt dipping sauce",
      "image": AMERICAN_FOOD_IMAGES.hummus_carrots,
      "servingSize": "1 Cucumber + 1/2 Cup Tzatziki",
      "prepTime": "3 Mins",
      "baseKcal": 110,
      "baseProtein": 8,
      "baseCarbs": 12,
      "baseFat": 3,
      "costUsd": 1.1,
      "ingredients": [
        {
          "id": "us-i-18-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.1
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 19,
    "dayTitle": "Day 19: Balanced Athletic Nutrition",
    "theme": "High-Protein Blueberry Oat Waffles with Warm Maple Syrup & Lean Turkey Shepherd's Pie",
    "breakfast": {
      "id": "us-d19-b",
      "type": "breakfast",
      "title": "High-Protein Blueberry Oat Waffles with Warm Maple Syrup",
      "subtitle": "Golden crisp waffles studded with wild blueberries and served with pure Vermont maple syrup",
      "image": AMERICAN_FOOD_IMAGES.waffles_fruit,
      "servingSize": "2 Large Waffles + Syrup",
      "prepTime": "10 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 60,
      "baseFat": 8,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "us-i-19-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.56
        },
        {
          "id": "us-i-19-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.84
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d19-l",
      "type": "lunch",
      "title": "Tuna Melt on Toasted Sourdough with Aged Cheddar",
      "subtitle": "Albacore tuna salad with crisp celery, topped with melted sharp cheddar on grilled sourdough",
      "image": AMERICAN_FOOD_IMAGES.turkey_club_sandwich,
      "servingSize": "2 Open-Faced Toasts",
      "prepTime": "8 Mins",
      "baseKcal": 510,
      "baseProtein": 45,
      "baseCarbs": 36,
      "baseFat": 18,
      "costUsd": 3.9,
      "ingredients": [
        {
          "id": "us-i-19-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.34
        },
        {
          "id": "us-i-19-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.86
        },
        {
          "id": "us-i-19-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d19-d",
      "type": "dinner",
      "title": "Lean Turkey Shepherd's Pie with Mashed Cauliflower Crust",
      "subtitle": "Rich seasoned ground turkey with peas and carrots topped with a golden roasted garlic cauliflower mash",
      "image": AMERICAN_FOOD_IMAGES.turkey_chili,
      "servingSize": "Deep Casserole Portion",
      "prepTime": "25 Mins",
      "baseKcal": 480,
      "baseProtein": 44,
      "baseCarbs": 38,
      "baseFat": 14,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "us-i-19-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 2.99
        },
        {
          "id": "us-i-19-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.88
        },
        {
          "id": "us-i-19-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.53
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d19-s",
      "type": "snack",
      "title": "High-Protein Chocolate Chia Seed Pudding",
      "subtitle": "Chilled chia seed pudding made with unsweetened almond milk, dark cocoa, and chocolate whey isolate",
      "image": AMERICAN_FOOD_IMAGES.chia_pudding,
      "servingSize": "1 Jar (200ml)",
      "prepTime": "2 Mins",
      "baseKcal": 210,
      "baseProtein": 18,
      "baseCarbs": 18,
      "baseFat": 8,
      "costUsd": 1.65,
      "ingredients": [
        {
          "id": "us-i-19-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.65
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 20,
    "dayTitle": "Day 20: Balanced Athletic Nutrition",
    "theme": "Loaded Breakfast Burrito Bowl with Roasted Sweet Potato & Flank Steak",
    "breakfast": {
      "id": "us-d20-b",
      "type": "breakfast",
      "title": "Loaded Breakfast Burrito Bowl with Roasted Sweet Potato",
      "subtitle": "Scrambled farm eggs, roasted sweet potato cubes, black beans, pico de gallo, and fresh cilantro",
      "image": AMERICAN_FOOD_IMAGES.breakfast_burrito,
      "servingSize": "1 Heaping Bowl",
      "prepTime": "12 Mins",
      "baseKcal": 460,
      "baseProtein": 24,
      "baseCarbs": 54,
      "baseFat": 16,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "us-i-20-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.69
        },
        {
          "id": "us-i-20-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.91
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d20-l",
      "type": "lunch",
      "title": "BBQ Pulled Chicken Salad Bowl with Roasted Corn",
      "subtitle": "Slow-simmered smoky barbecue chicken breast shredded over mixed greens, black beans, and roasted corn",
      "image": AMERICAN_FOOD_IMAGES.grilled_chicken_bowl,
      "servingSize": "1 Large Salad Bowl",
      "prepTime": "10 Mins",
      "baseKcal": 510,
      "baseProtein": 46,
      "baseCarbs": 54,
      "baseFat": 11,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "us-i-20-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.64
        },
        {
          "id": "us-i-20-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.97
        },
        {
          "id": "us-i-20-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.79
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d20-d",
      "type": "dinner",
      "title": "Flank Steak with Chimichurri Sauce & Fingerling Potatoes",
      "subtitle": "Char-grilled lean flank steak sliced thin against the grain with fresh herb chimichurri and potatoes",
      "image": AMERICAN_FOOD_IMAGES.steak_sweet_potato,
      "servingSize": "6.5 oz Steak + Potatoes",
      "prepTime": "18 Mins",
      "baseKcal": 590,
      "baseProtein": 50,
      "baseCarbs": 36,
      "baseFat": 24,
      "costUsd": 6.8,
      "ingredients": [
        {
          "id": "us-i-20-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.62
        },
        {
          "id": "us-i-20-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.36
        },
        {
          "id": "us-i-20-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.82
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d20-s",
      "type": "snack",
      "title": "Roasted Crunchy Chickpeas with Smoked Paprika",
      "subtitle": "Oven-roasted crispy chickpeas tossed in olive oil, garlic powder, sea salt, and smoked Spanish paprika",
      "image": AMERICAN_FOOD_IMAGES.roasted_chana,
      "servingSize": "1/2 Cup Roasted Chickpeas",
      "prepTime": "2 Mins",
      "baseKcal": 180,
      "baseProtein": 9,
      "baseCarbs": 26,
      "baseFat": 5,
      "costUsd": 0.95,
      "ingredients": [
        {
          "id": "us-i-20-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 0.95
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 21,
    "dayTitle": "Day 21: Balanced Athletic Nutrition",
    "theme": "French Herb Rolled Omelet with Baby Arugula Salad & Lemon Pepper Baked Cod",
    "breakfast": {
      "id": "us-d21-b",
      "type": "breakfast",
      "title": "French Herb Rolled Omelet with Baby Arugula Salad",
      "subtitle": "Tender rolled French-style omelet with chives and tarragon, accompanied by lemon-dressed baby arugula",
      "image": AMERICAN_FOOD_IMAGES.spinach_omelet,
      "servingSize": "3-Egg Omelet + Salad",
      "prepTime": "8 Mins",
      "baseKcal": 360,
      "baseProtein": 22,
      "baseCarbs": 8,
      "baseFat": 24,
      "costUsd": 2.3,
      "ingredients": [
        {
          "id": "us-i-21-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.49
        },
        {
          "id": "us-i-21-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.8
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d21-l",
      "type": "lunch",
      "title": "Sesame Garlic Shrimp Sauté over Jasmine Rice",
      "subtitle": "Succulent shrimp stir-fried with minced garlic, sesame oil, scallions, and steamed white jasmine rice",
      "image": AMERICAN_FOOD_IMAGES.grilled_shrimp_salad,
      "servingSize": "Plate (8 Shrimp + Rice)",
      "prepTime": "10 Mins",
      "baseKcal": 460,
      "baseProtein": 36,
      "baseCarbs": 54,
      "baseFat": 10,
      "costUsd": 5.6,
      "ingredients": [
        {
          "id": "us-i-21-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.36
        },
        {
          "id": "us-i-21-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.23
        },
        {
          "id": "us-i-21-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 1.01
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d21-d",
      "type": "dinner",
      "title": "Lemon Pepper Baked Cod with Broccolini & Wild Rice",
      "subtitle": "Thick Pacific cod loin seasoned with cracked black pepper and lemon zest over wild rice and broccolini",
      "image": AMERICAN_FOOD_IMAGES.baked_cod_fish,
      "servingSize": "7 oz Cod + Rice & Broccolini",
      "prepTime": "18 Mins",
      "baseKcal": 460,
      "baseProtein": 42,
      "baseCarbs": 42,
      "baseFat": 12,
      "costUsd": 5.6,
      "ingredients": [
        {
          "id": "us-i-21-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.81
        },
        {
          "id": "us-i-21-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.12
        },
        {
          "id": "us-i-21-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.67
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d21-s",
      "type": "snack",
      "title": "Whole-Grain Rice Cakes with Peanut Butter & Sliced Banana",
      "subtitle": "Two brown rice cakes spread with peanut butter and topped with fresh banana coins",
      "image": AMERICAN_FOOD_IMAGES.apple_almond_butter,
      "servingSize": "2 Rice Cakes + PB + Banana",
      "prepTime": "2 Mins",
      "baseKcal": 240,
      "baseProtein": 8,
      "baseCarbs": 36,
      "baseFat": 10,
      "costUsd": 1.15,
      "ingredients": [
        {
          "id": "us-i-21-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.15
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 22,
    "dayTitle": "Day 22: Balanced Athletic Nutrition",
    "theme": "Smoked Turkey Bacon & Cajun Grilled Chicken Breast",
    "breakfast": {
      "id": "us-d22-b",
      "type": "breakfast",
      "title": "Smoked Turkey Bacon, Scrambled Eggs & Rye Toast",
      "subtitle": "3 crisp turkey bacon strips, 2 soft scrambled eggs, and toasted dark rye bread with light butter",
      "image": AMERICAN_FOOD_IMAGES.scrambled_eggs_toast,
      "servingSize": "2 Eggs + 3 Turkey Bacon + Toast",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 28,
      "baseCarbs": 30,
      "baseFat": 18,
      "costUsd": 2.7,
      "ingredients": [
        {
          "id": "us-i-22-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.76
        },
        {
          "id": "us-i-22-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.94
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d22-l",
      "type": "lunch",
      "title": "Turkey Cranberry Harvest Salad with Candied Walnuts",
      "subtitle": "Sliced roasted turkey breast over baby spinach, dried cranberries, goat cheese, and crushed walnuts",
      "image": AMERICAN_FOOD_IMAGES.grilled_chicken_salad,
      "servingSize": "1 Large Salad",
      "prepTime": "8 Mins",
      "baseKcal": 490,
      "baseProtein": 40,
      "baseCarbs": 34,
      "baseFat": 20,
      "costUsd": 5.1,
      "ingredients": [
        {
          "id": "us-i-22-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.06
        },
        {
          "id": "us-i-22-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.12
        },
        {
          "id": "us-i-22-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.92
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d22-d",
      "type": "dinner",
      "title": "Cajun Grilled Chicken Breast with Bell Peppers & Brown Rice",
      "subtitle": "Zesty Cajun blackened chicken breast served over roasted sweet bell peppers, onions, and brown rice",
      "image": AMERICAN_FOOD_IMAGES.chicken_fajitas,
      "servingSize": "1 Breast + Rice & Peppers",
      "prepTime": "18 Mins",
      "baseKcal": 520,
      "baseProtein": 48,
      "baseCarbs": 48,
      "baseFat": 12,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-22-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.13
        },
        {
          "id": "us-i-22-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.92
        },
        {
          "id": "us-i-22-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.55
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d22-s",
      "type": "snack",
      "title": "Hard-Boiled Egg Whites with Light Guacamole",
      "subtitle": "Three hard-boiled egg whites halved and filled with rich seasoned avocado guacamole",
      "image": AMERICAN_FOOD_IMAGES.hard_boiled_eggs,
      "servingSize": "3 Egg Whites + 2 tbsp Guac",
      "prepTime": "4 Mins",
      "baseKcal": 150,
      "baseProtein": 14,
      "baseCarbs": 6,
      "baseFat": 8,
      "costUsd": 1.3,
      "ingredients": [
        {
          "id": "us-i-22-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.3
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 23,
    "dayTitle": "Day 23: Balanced Athletic Nutrition",
    "theme": "Tropical Mango Banana Smoothie Bowl with Shredded Coconut & Pan-Seared Salmon Fillet",
    "breakfast": {
      "id": "us-d23-b",
      "type": "breakfast",
      "title": "Tropical Mango Banana Smoothie Bowl with Shredded Coconut",
      "subtitle": "Vibrant chilled smoothie bowl blended with ripe mango and banana, topped with unsweetened toasted coconut",
      "image": AMERICAN_FOOD_IMAGES.smoothie_bowl,
      "servingSize": "1 Large Bowl",
      "prepTime": "5 Mins",
      "baseKcal": 390,
      "baseProtein": 18,
      "baseCarbs": 68,
      "baseFat": 7,
      "costUsd": 2.75,
      "ingredients": [
        {
          "id": "us-i-23-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.79
        },
        {
          "id": "us-i-23-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.96
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d23-l",
      "type": "lunch",
      "title": "Grilled Lemon Thyme Chicken Breast with Asparagus & Farro",
      "subtitle": "Juicy chicken breast infused with fresh thyme and lemon, served alongside grilled asparagus and farro",
      "image": AMERICAN_FOOD_IMAGES.chicken_quinoa_bowl,
      "servingSize": "1 Entrée Bowl",
      "prepTime": "15 Mins",
      "baseKcal": 520,
      "baseProtein": 46,
      "baseCarbs": 48,
      "baseFat": 13,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "us-i-23-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.88
        },
        {
          "id": "us-i-23-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.06
        },
        {
          "id": "us-i-23-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.86
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d23-d",
      "type": "dinner",
      "title": "Pan-Seared Salmon Fillet with Sautéed Kale & Sweet Potato Puree",
      "subtitle": "Crispy skin salmon fillet over garlic-sautéed baby kale with smooth roasted sweet potato puree",
      "image": AMERICAN_FOOD_IMAGES.salmon_asparagus,
      "servingSize": "6 oz Salmon + Kale & Puree",
      "prepTime": "18 Mins",
      "baseKcal": 580,
      "baseProtein": 42,
      "baseCarbs": 44,
      "baseFat": 24,
      "costUsd": 6.9,
      "ingredients": [
        {
          "id": "us-i-23-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.69
        },
        {
          "id": "us-i-23-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.38
        },
        {
          "id": "us-i-23-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.83
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d23-s",
      "type": "snack",
      "title": "Greek Yogurt with Pure Cocoa Powder & Raspberries",
      "subtitle": "0% Greek yogurt whipped with unsweetened dark cocoa powder, raw honey, and fresh red raspberries",
      "image": AMERICAN_FOOD_IMAGES.greek_yogurt_snack,
      "servingSize": "1 Bowl (170g Yogurt)",
      "prepTime": "2 Mins",
      "baseKcal": 200,
      "baseProtein": 22,
      "baseCarbs": 22,
      "baseFat": 2.5,
      "costUsd": 1.7,
      "ingredients": [
        {
          "id": "us-i-23-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.7
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 24,
    "dayTitle": "Day 24: Balanced Athletic Nutrition",
    "theme": "Whole Wheat French Toast Sticks with Cinnamon & Greek Yogurt & Slow-Simmered Beef & Kidney Bean Chili",
    "breakfast": {
      "id": "us-d24-b",
      "type": "breakfast",
      "title": "Whole Wheat French Toast Sticks with Cinnamon & Greek Yogurt",
      "subtitle": "Thick sourdough cut into sticks, dipped in cinnamon egg custard, and served with a high-protein yogurt dip",
      "image": AMERICAN_FOOD_IMAGES.french_toast,
      "servingSize": "4 Sticks + Yogurt Dip",
      "prepTime": "10 Mins",
      "baseKcal": 430,
      "baseProtein": 26,
      "baseCarbs": 56,
      "baseFat": 10,
      "costUsd": 2.45,
      "ingredients": [
        {
          "id": "us-i-24-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.59
        },
        {
          "id": "us-i-24-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.86
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d24-l",
      "type": "lunch",
      "title": "California Cobb Salad with Grilled Chicken & Turkey Bacon",
      "subtitle": "Diced chicken, crispy turkey bacon, hard-boiled egg, avocado, and blue cheese on chopped greens",
      "image": AMERICAN_FOOD_IMAGES.caesar_salad,
      "servingSize": "1 Loaded Cobb Bowl",
      "prepTime": "12 Mins",
      "baseKcal": 540,
      "baseProtein": 48,
      "baseCarbs": 16,
      "baseFat": 28,
      "costUsd": 5.4,
      "ingredients": [
        {
          "id": "us-i-24-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.24
        },
        {
          "id": "us-i-24-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.19
        },
        {
          "id": "us-i-24-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.97
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d24-d",
      "type": "dinner",
      "title": "Slow-Simmered Beef & Kidney Bean Chili with Scallions",
      "subtitle": "Lean ground beef chili simmered with dark red kidney beans, tomatoes, and topped with sliced scallions",
      "image": AMERICAN_FOOD_IMAGES.turkey_chili,
      "servingSize": "2 Large Ladles",
      "prepTime": "22 Mins",
      "baseKcal": 540,
      "baseProtein": 46,
      "baseCarbs": 48,
      "baseFat": 16,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "us-i-24-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.33
        },
        {
          "id": "us-i-24-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.98
        },
        {
          "id": "us-i-24-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.59
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d24-s",
      "type": "snack",
      "title": "Sliced Bell Peppers with Chipotle Hummus",
      "subtitle": "Crunchy sweet red and yellow bell pepper strips served with smoky chipotle pepper chickpea hummus",
      "image": AMERICAN_FOOD_IMAGES.hummus_carrots,
      "servingSize": "1 Whole Pepper + 3 tbsp Hummus",
      "prepTime": "3 Mins",
      "baseKcal": 160,
      "baseProtein": 5,
      "baseCarbs": 22,
      "baseFat": 7,
      "costUsd": 1.35,
      "ingredients": [
        {
          "id": "us-i-24-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.35
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 25,
    "dayTitle": "Day 25: Balanced Athletic Nutrition",
    "theme": "Apple Cinnamon Warm Oatmeal with Crushed Pecans & Baked Turkey Cutlets",
    "breakfast": {
      "id": "us-d25-b",
      "type": "breakfast",
      "title": "Apple Cinnamon Warm Oatmeal with Crushed Pecans",
      "subtitle": "Slow-simmered whole rolled oats with diced Honeycrisp apples, cinnamon, and toasted Georgia pecans",
      "image": AMERICAN_FOOD_IMAGES.oatmeal_berries,
      "servingSize": "1 Deep Bowl",
      "prepTime": "8 Mins",
      "baseKcal": 410,
      "baseProtein": 14,
      "baseCarbs": 62,
      "baseFat": 14,
      "costUsd": 2.1,
      "ingredients": [
        {
          "id": "us-i-25-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.37
        },
        {
          "id": "us-i-25-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.73
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d25-l",
      "type": "lunch",
      "title": "Grass-Fed Beef & Broccoli Rice Bowl with Garlic Tamari",
      "subtitle": "Shaved lean beef sirloin flash-sautéed with fresh broccoli crowns in savory garlic tamari sauce",
      "image": AMERICAN_FOOD_IMAGES.grassfed_burger_bowl,
      "servingSize": "1 Beef Bowl (180g Beef)",
      "prepTime": "12 Mins",
      "baseKcal": 550,
      "baseProtein": 46,
      "baseCarbs": 48,
      "baseFat": 16,
      "costUsd": 5.8,
      "ingredients": [
        {
          "id": "us-i-25-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 3.48
        },
        {
          "id": "us-i-25-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.28
        },
        {
          "id": "us-i-25-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 1.04
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d25-d",
      "type": "dinner",
      "title": "Baked Turkey Cutlets with Cranberry Glaze & Asparagus",
      "subtitle": "Lean turkey breast cutlets baked golden with a tart cranberry glaze and fresh roasted asparagus spears",
      "image": AMERICAN_FOOD_IMAGES.roasted_herb_chicken,
      "servingSize": "2 Cutlets (7 oz) + Asparagus",
      "prepTime": "18 Mins",
      "baseKcal": 490,
      "baseProtein": 46,
      "baseCarbs": 34,
      "baseFat": 11,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "us-i-25-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.26
        },
        {
          "id": "us-i-25-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.96
        },
        {
          "id": "us-i-25-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.58
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d25-s",
      "type": "snack",
      "title": "Handful of Raw Pistachios & Dried Apricots",
      "subtitle": "Naturally opened roasted unsalted California pistachios paired with sweet sun-dried Turkish apricots",
      "image": AMERICAN_FOOD_IMAGES.trail_mix,
      "servingSize": "1 oz Pistachios + 4 Apricots",
      "prepTime": "1 Min",
      "baseKcal": 220,
      "baseProtein": 7,
      "baseCarbs": 26,
      "baseFat": 11,
      "costUsd": 1.65,
      "ingredients": [
        {
          "id": "us-i-25-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.65
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 26,
    "dayTitle": "Day 26: Balanced Athletic Nutrition",
    "theme": "Sourdough Avocado Tartine with Everything Bagel Seasoning & Sesame Crusted Seared Tuna Steak",
    "breakfast": {
      "id": "us-d26-b",
      "type": "breakfast",
      "title": "Sourdough Avocado Tartine with Everything Bagel Seasoning",
      "subtitle": "Thick toasted slice of rustic sourdough spread with ripe avocado, sliced radishes, microgreens, and a poached egg",
      "image": AMERICAN_FOOD_IMAGES.avocado_toast,
      "servingSize": "1 Large Tartine + 1 Egg",
      "prepTime": "8 Mins",
      "baseKcal": 380,
      "baseProtein": 16,
      "baseCarbs": 32,
      "baseFat": 19,
      "costUsd": 2.5,
      "ingredients": [
        {
          "id": "us-i-26-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.63
        },
        {
          "id": "us-i-26-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.88
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d26-l",
      "type": "lunch",
      "title": "Crispy Tofu & Edamame Quinoa Power Bowl with Ginger Miso",
      "subtitle": "Golden pan-crisped organic tofu and shelled edamame over quinoa with shredded red cabbage and ginger dressing",
      "image": AMERICAN_FOOD_IMAGES.mediterranean_bowl,
      "servingSize": "1 Power Bowl",
      "prepTime": "15 Mins",
      "baseKcal": 480,
      "baseProtein": 32,
      "baseCarbs": 56,
      "baseFat": 14,
      "costUsd": 3.8,
      "ingredients": [
        {
          "id": "us-i-26-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.28
        },
        {
          "id": "us-i-26-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.84
        },
        {
          "id": "us-i-26-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.68
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d26-d",
      "type": "dinner",
      "title": "Sesame Crusted Seared Tuna Steak with Ginger Bok Choy",
      "subtitle": "Ahi tuna steak crusted with black and white sesame seeds, seared rare and served with ginger baby bok choy",
      "image": AMERICAN_FOOD_IMAGES.salmon_asparagus,
      "servingSize": "6 oz Tuna + Bok Choy",
      "prepTime": "12 Mins",
      "baseKcal": 510,
      "baseProtein": 48,
      "baseCarbs": 18,
      "baseFat": 18,
      "costUsd": 7.2,
      "ingredients": [
        {
          "id": "us-i-26-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.9
        },
        {
          "id": "us-i-26-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.44
        },
        {
          "id": "us-i-26-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.86
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d26-s",
      "type": "snack",
      "title": "Low-Fat Cottage Cheese with Blueberries & Cinnamon",
      "subtitle": "Slow-digesting cottage cheese dusted with ground Ceylon cinnamon and topped with sweet wild blueberries",
      "image": AMERICAN_FOOD_IMAGES.cottage_cheese,
      "servingSize": "1 Cup + 1/2 Cup Blueberries",
      "prepTime": "2 Mins",
      "baseKcal": 210,
      "baseProtein": 26,
      "baseCarbs": 20,
      "baseFat": 2.5,
      "costUsd": 1.65,
      "ingredients": [
        {
          "id": "us-i-26-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.65
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 27,
    "dayTitle": "Day 27: Balanced Athletic Nutrition",
    "theme": "Triple Berry Greek Yogurt Crunch Bowl with Chia Seeds & Rosemary Balsamic Grilled Chicken",
    "breakfast": {
      "id": "us-d27-b",
      "type": "breakfast",
      "title": "Triple Berry Greek Yogurt Crunch Bowl with Chia Seeds",
      "subtitle": "Thick strained plain Greek yogurt topped with fresh blueberries, raspberries, blackberries, and chia seeds",
      "image": AMERICAN_FOOD_IMAGES.yogurt_parfait,
      "servingSize": "1 Deep Bowl (220g)",
      "prepTime": "3 Mins",
      "baseKcal": 340,
      "baseProtein": 24,
      "baseCarbs": 42,
      "baseFat": 7,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "us-i-27-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.56
        },
        {
          "id": "us-i-27-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.84
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d27-l",
      "type": "lunch",
      "title": "Rosemary Lemon Chicken Skewers with Greek Cucumber Salad",
      "subtitle": "Grilled chicken skewers seasoned with rosemary and sea salt, served with diced cucumber tomato salad",
      "image": AMERICAN_FOOD_IMAGES.grilled_chicken_bowl,
      "servingSize": "2 Skewers + Salad",
      "prepTime": "12 Mins",
      "baseKcal": 490,
      "baseProtein": 45,
      "baseCarbs": 22,
      "baseFat": 18,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "us-i-27-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.76
        },
        {
          "id": "us-i-27-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 1.01
        },
        {
          "id": "us-i-27-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.83
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d27-d",
      "type": "dinner",
      "title": "Rosemary Balsamic Grilled Chicken with Roasted Root Vegetables",
      "subtitle": "Chicken breast glazed with balsamic vinegar and fresh rosemary alongside roasted carrots and parsnips",
      "image": AMERICAN_FOOD_IMAGES.roasted_herb_chicken,
      "servingSize": "7 oz Chicken + Root Veggies",
      "prepTime": "22 Mins",
      "baseKcal": 510,
      "baseProtein": 48,
      "baseCarbs": 38,
      "baseFat": 14,
      "costUsd": 4.7,
      "ingredients": [
        {
          "id": "us-i-27-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.2
        },
        {
          "id": "us-i-27-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 0.94
        },
        {
          "id": "us-i-27-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.56
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d27-s",
      "type": "snack",
      "title": "Cold Brew Coffee Protein Shake",
      "subtitle": "High-protein energizer combining smooth cold brew coffee with chocolate whey isolate and splash of almond milk",
      "image": AMERICAN_FOOD_IMAGES.protein_shake,
      "servingSize": "1 Shaker Cup (10 oz)",
      "prepTime": "2 Mins",
      "baseKcal": 160,
      "baseProtein": 27,
      "baseCarbs": 4,
      "baseFat": 2,
      "costUsd": 1.55,
      "ingredients": [
        {
          "id": "us-i-27-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.55
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 28,
    "dayTitle": "Day 28: Balanced Athletic Nutrition",
    "theme": "Egg White Vegetable Scramble with Roasted Red Potatoes & Grilled Flank Steak",
    "breakfast": {
      "id": "us-d28-b",
      "type": "breakfast",
      "title": "Egg White Vegetable Scramble with Roasted Red Potatoes",
      "subtitle": "Fluffy egg whites scrambled with bell peppers, mushrooms, and zucchini, served with roasted baby potatoes",
      "image": AMERICAN_FOOD_IMAGES.scrambled_eggs_toast,
      "servingSize": "4 Whites + Potatoes",
      "prepTime": "12 Mins",
      "baseKcal": 380,
      "baseProtein": 26,
      "baseCarbs": 48,
      "baseFat": 8,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "us-i-28-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.69
        },
        {
          "id": "us-i-28-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.91
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d28-l",
      "type": "lunch",
      "title": "Albacore Tuna Stuffed Avocado Halves with Field Greens",
      "subtitle": "Two ripe avocado halves filled with solid white tuna mixed with light lemon Dijon and scallions",
      "image": AMERICAN_FOOD_IMAGES.tuna_salad,
      "servingSize": "2 Stuffed Avocado Halves",
      "prepTime": "6 Mins",
      "baseKcal": 440,
      "baseProtein": 38,
      "baseCarbs": 16,
      "baseFat": 24,
      "costUsd": 4.2,
      "ingredients": [
        {
          "id": "us-i-28-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.52
        },
        {
          "id": "us-i-28-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.92
        },
        {
          "id": "us-i-28-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.76
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d28-d",
      "type": "dinner",
      "title": "Grilled Flank Steak with Charred Asparagus & Sweet Corn",
      "subtitle": "Marinated lean flank steak grilled to medium rare served with charred green asparagus and corn on the cob",
      "image": AMERICAN_FOOD_IMAGES.steak_sweet_potato,
      "servingSize": "7 oz Steak + Corn & Asparagus",
      "prepTime": "18 Mins",
      "baseKcal": 610,
      "baseProtein": 52,
      "baseCarbs": 38,
      "baseFat": 24,
      "costUsd": 6.9,
      "ingredients": [
        {
          "id": "us-i-28-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 4.69
        },
        {
          "id": "us-i-28-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.38
        },
        {
          "id": "us-i-28-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.83
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d28-s",
      "type": "snack",
      "title": "Crisp Green Apple with Smooth Cashew Butter",
      "subtitle": "Tart Granny Smith apple slices paired with velvety roasted cashew butter",
      "image": AMERICAN_FOOD_IMAGES.apple_almond_butter,
      "servingSize": "1 Apple + 2 tbsp Cashew Butter",
      "prepTime": "2 Mins",
      "baseKcal": 250,
      "baseProtein": 6,
      "baseCarbs": 34,
      "baseFat": 13,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "us-i-28-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.6
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 29,
    "dayTitle": "Day 29: Balanced Athletic Nutrition",
    "theme": "Baked Cinnamon Banana Protein Oatmeal Bake & Mediterranean Baked White Fish",
    "breakfast": {
      "id": "us-d29-b",
      "type": "breakfast",
      "title": "Baked Cinnamon Banana Protein Oatmeal Bake",
      "subtitle": "Warm baked oatmeal square infused with ripe mashed bananas, cinnamon, whey protein, and almond milk",
      "image": AMERICAN_FOOD_IMAGES.oatmeal_berries,
      "servingSize": "1 Warm Square",
      "prepTime": "5 Mins",
      "baseKcal": 400,
      "baseProtein": 22,
      "baseCarbs": 62,
      "baseFat": 8,
      "costUsd": 1.85,
      "ingredients": [
        {
          "id": "us-i-29-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 1.2
        },
        {
          "id": "us-i-29-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d29-l",
      "type": "lunch",
      "title": "Roasted Turkey Breast with Steamed Sweet Corn & Baby Carrots",
      "subtitle": "Herb-roasted thick sliced turkey breast accompanied by tender steamed sweet corn and baby glazed carrots",
      "image": AMERICAN_FOOD_IMAGES.turkey_club_sandwich,
      "servingSize": "6 oz Turkey + Veggies",
      "prepTime": "10 Mins",
      "baseKcal": 480,
      "baseProtein": 44,
      "baseCarbs": 46,
      "baseFat": 11,
      "costUsd": 4.5,
      "ingredients": [
        {
          "id": "us-i-29-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.7
        },
        {
          "id": "us-i-29-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.99
        },
        {
          "id": "us-i-29-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.81
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d29-d",
      "type": "dinner",
      "title": "Mediterranean Baked White Fish with Cherry Tomatoes & Capers",
      "subtitle": "Tender white fish baked in parchment with sweet cherry tomatoes, capers, garlic, and extra virgin olive oil",
      "image": AMERICAN_FOOD_IMAGES.baked_cod_fish,
      "servingSize": "7 oz Fish + Mediterranean Sauce",
      "prepTime": "16 Mins",
      "baseKcal": 450,
      "baseProtein": 42,
      "baseCarbs": 20,
      "baseFat": 16,
      "costUsd": 5.4,
      "ingredients": [
        {
          "id": "us-i-29-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 3.67
        },
        {
          "id": "us-i-29-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.08
        },
        {
          "id": "us-i-29-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d29-s",
      "type": "snack",
      "title": "Baby Carrots & Sugar Snap Peas with Red Pepper Dip",
      "subtitle": "Crisp sweet baby carrots and sugar snap peas paired with creamy roasted red pepper yogurt dip",
      "image": AMERICAN_FOOD_IMAGES.hummus_carrots,
      "servingSize": "1.5 Cups Veggies + Dip",
      "prepTime": "2 Mins",
      "baseKcal": 130,
      "baseProtein": 6,
      "baseCarbs": 20,
      "baseFat": 3,
      "costUsd": 1.25,
      "ingredients": [
        {
          "id": "us-i-29-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.25
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  },
  {
    "dayNumber": 30,
    "dayTitle": "Day 30: Balanced Athletic Nutrition",
    "theme": "Sunday Brunch Smoked Salmon Omelet with Fresh Chives & Herb-Crusted Prime Sirloin",
    "breakfast": {
      "id": "us-d30-b",
      "type": "breakfast",
      "title": "Sunday Brunch Smoked Salmon Omelet with Fresh Chives",
      "subtitle": "Delicate three-egg omelet folded over smoked wild salmon, light cream cheese, and minced fresh garden chives",
      "image": AMERICAN_FOOD_IMAGES.bagel_salmon,
      "servingSize": "3-Egg Omelet + Toast",
      "prepTime": "10 Mins",
      "baseKcal": 440,
      "baseProtein": 32,
      "baseCarbs": 24,
      "baseFat": 22,
      "costUsd": 3.9,
      "ingredients": [
        {
          "id": "us-i-30-b1",
          "name": "Primary Protein & Base Core",
          "portion": "1 Serving",
          "costUsd": 2.54
        },
        {
          "id": "us-i-30-b2",
          "name": "Fresh Farm Produce / Garnish",
          "portion": "1 Serving",
          "costUsd": 1.36
        }
      ],
      "instructions": [
        "Prepare main ingredients over medium heat or in a bowl according to recipe.",
        "Plate neatly, garnish with fresh herbs or fruit, and serve warm."
      ],
      "budgetTips": "Buy pantry staples in family packs to reduce cost per meal by up to 25%."
    },
    "lunch": {
      "id": "us-d30-l",
      "type": "lunch",
      "title": "Honey Mustard Chicken & Spinach Whole Grain Wrap",
      "subtitle": "Sliced grilled chicken with house honey Dijon, shredded carrots, and crisp baby spinach rolled in a whole wheat wrap",
      "image": AMERICAN_FOOD_IMAGES.chicken_caesar_wrap,
      "servingSize": "1 Large Wrap",
      "prepTime": "8 Mins",
      "baseKcal": 490,
      "baseProtein": 42,
      "baseCarbs": 40,
      "baseFat": 15,
      "costUsd": 4.5,
      "ingredients": [
        {
          "id": "us-i-30-l1",
          "name": "Lean Protein Core (Chicken/Turkey/Seafood)",
          "portion": "6 oz portion",
          "costUsd": 2.7
        },
        {
          "id": "us-i-30-l2",
          "name": "Complex Carbohydrate Base (Grains/Wrap)",
          "portion": "1 Cup cooked",
          "costUsd": 0.99
        },
        {
          "id": "us-i-30-l3",
          "name": "Garden Greens & Light Dressing",
          "portion": "Fresh serving",
          "costUsd": 0.81
        }
      ],
      "instructions": [
        "Assemble fresh greens and grain base.",
        "Top with freshly cooked or prepped lean protein and dress lightly."
      ],
      "budgetTips": "Batch prepping grains and roasted proteins cuts daily cooking time to under 5 minutes."
    },
    "dinner": {
      "id": "us-d30-d",
      "type": "dinner",
      "title": "Herb-Crusted Prime Sirloin with Garlic Green Beans & Potatoes",
      "subtitle": "USDA Choice sirloin steak seared with thyme and garlic butter alongside steamed green beans and red potatoes",
      "image": AMERICAN_FOOD_IMAGES.steak_sweet_potato,
      "servingSize": "7.5 oz Steak + Green Beans",
      "prepTime": "20 Mins",
      "baseKcal": 620,
      "baseProtein": 54,
      "baseCarbs": 36,
      "baseFat": 24,
      "costUsd": 7.4,
      "ingredients": [
        {
          "id": "us-i-30-d1",
          "name": "Entrée Centerpiece Protein (Salmon/Steak/Poultry)",
          "portion": "7 oz raw",
          "costUsd": 5.03
        },
        {
          "id": "us-i-30-d2",
          "name": "Roasted Seasonal Vegetables",
          "portion": "1.5 Cups",
          "costUsd": 1.48
        },
        {
          "id": "us-i-30-d3",
          "name": "Complex Carb / Healthy Fats",
          "portion": "1 Serving",
          "costUsd": 0.89
        }
      ],
      "instructions": [
        "Sear or bake seasoned entrée centerpiece until perfectly tender.",
        "Pair with roasted seasonal vegetables and serve hot."
      ],
      "budgetTips": "Using cast iron skillets creates steakhouse-quality searing without expensive equipment."
    },
    "snack": {
      "id": "us-d30-s",
      "type": "snack",
      "title": "Chilled Greek Yogurt with Pomegranate Arils & Flaxseed",
      "subtitle": "Creamy Greek yogurt topped with crunchy sweet ruby pomegranate seeds and roasted ground flaxseeds",
      "image": AMERICAN_FOOD_IMAGES.greek_yogurt_snack,
      "servingSize": "1 Cup (170g Yogurt + Seeds)",
      "prepTime": "2 Mins",
      "baseKcal": 210,
      "baseProtein": 23,
      "baseCarbs": 22,
      "baseFat": 4,
      "costUsd": 1.8,
      "ingredients": [
        {
          "id": "us-i-30-s1",
          "name": "Whole Nutrient Snack Base",
          "portion": "1 Serving",
          "costUsd": 1.8
        }
      ],
      "instructions": [
        "Portion into a small bowl or glass and enjoy between meals."
      ],
      "budgetTips": "Nutrient-rich snacks maintain stable blood sugar and eliminate evening over-eating."
    }
  }
];

export const AMERICAN_REPLACEMENTS: Record<string, AmericanMeal[]> = {
  breakfast: [
    {
      id: 'alt-us-b1',
      type: 'breakfast',
      title: 'Scrambled Eggs, Avocado & Whole-Grain Toast',
      subtitle: '3 farm-fresh eggs scrambled with half sliced avocado on artisan sourdough',
      image: AMERICAN_FOOD_IMAGES.scrambled_eggs_toast,
      servingSize: '3 Eggs + 2 Slices Toast + 1/2 Avocado',
      prepTime: '10 Mins',
      baseKcal: 440,
      baseProtein: 24,
      baseCarbs: 32,
      baseFat: 22,
      costUsd: 2.75,
      ingredients: [{ id: 'ar-b1', name: 'Eggs, Sourdough & Avocado', portion: '1 serving', costUsd: 2.75 }],
      instructions: ['Scramble eggs lightly and serve over avocado toast.'],
      budgetTips: 'Store bread in the freezer and toast slices directly from frozen.'
    },
    {
      id: 'alt-us-b2',
      type: 'breakfast',
      title: 'Steel-Cut Oatmeal with Blueberries & Almonds',
      subtitle: 'Hearty whole rolled oats in almond milk with fresh blueberries and sliced almonds',
      image: AMERICAN_FOOD_IMAGES.oatmeal_berries,
      servingSize: '1 Deep Bowl (1 Cup Cooked)',
      prepTime: '8 Mins',
      baseKcal: 390,
      baseProtein: 16,
      baseCarbs: 58,
      baseFat: 12,
      costUsd: 1.95,
      ingredients: [{ id: 'ar-b2', name: 'Oats, Blueberries & Almonds', portion: '1 serving', costUsd: 1.95 }],
      instructions: ['Simmer oats 5 mins in almond milk and top with blueberries.'],
      budgetTips: 'Buy whole oats in bulk cartons.'
    }
  ],
  lunch: [
    {
      id: 'alt-us-l1',
      type: 'lunch',
      title: 'Grilled Lemon Herb Chicken Bowl with Quinoa',
      subtitle: 'Char-grilled chicken breast over tri-color quinoa and steamed broccoli',
      image: AMERICAN_FOOD_IMAGES.grilled_chicken_bowl,
      servingSize: '1 Large Bowl',
      prepTime: '15 Mins',
      baseKcal: 560,
      baseProtein: 48,
      baseCarbs: 52,
      baseFat: 14,
      costUsd: 4.80,
      ingredients: [{ id: 'ar-l1', name: 'Chicken Breast, Quinoa & Broccoli', portion: '1 serving', costUsd: 4.80 }],
      instructions: ['Grill chicken and assemble with warm quinoa and broccoli.'],
      budgetTips: 'One of the highest-protein athletic meals per dollar.'
    },
    {
      id: 'alt-us-l2',
      type: 'lunch',
      title: 'Solid White Albacore Tuna Salad Bowl',
      subtitle: 'Albacore tuna flaked over crisp greens, cucumber, and chickpeas with lemon dressing',
      image: AMERICAN_FOOD_IMAGES.tuna_salad,
      servingSize: '1 Large Salad Bowl',
      prepTime: '6 Mins',
      baseKcal: 450,
      baseProtein: 42,
      baseCarbs: 32,
      baseFat: 14,
      costUsd: 3.80,
      ingredients: [{ id: 'ar-l2', name: 'Albacore Tuna, Mixed Greens & Chickpeas', portion: '1 serving', costUsd: 3.80 }],
      instructions: ['Drain tuna and toss with fresh salad greens.'],
      budgetTips: 'Canned tuna provides premium marine omega-3s for under $2.00.'
    }
  ],
  dinner: [
    {
      id: 'alt-us-d1',
      type: 'dinner',
      title: 'Pan-Seared Atlantic Salmon Fillet with Asparagus',
      subtitle: 'Crispy skin wild salmon fillet paired with roasted asparagus and jasmine rice',
      image: AMERICAN_FOOD_IMAGES.salmon_asparagus,
      servingSize: '6 oz Salmon + Veggies',
      prepTime: '18 Mins',
      baseKcal: 580,
      baseProtein: 44,
      baseCarbs: 38,
      baseFat: 26,
      costUsd: 6.90,
      ingredients: [{ id: 'ar-d1', name: 'Atlantic Salmon, Asparagus & Rice', portion: '1 serving', costUsd: 6.90 }],
      instructions: ['Sear salmon in a hot skillet 5 mins skin down, flip and finish.'],
      budgetTips: 'Frozen wild salmon fillets maintain full omega-3s at 30% lower cost.'
    },
    {
      id: 'alt-us-d2',
      type: 'dinner',
      title: 'Slow-Cooked Turkey Chili with Black Beans',
      subtitle: 'Rich chili made with 93% lean ground turkey, kidney beans, and tomatoes',
      image: AMERICAN_FOOD_IMAGES.turkey_chili,
      servingSize: '2 Deep Ladles',
      prepTime: '25 Mins',
      baseKcal: 520,
      baseProtein: 46,
      baseCarbs: 52,
      baseFat: 12,
      costUsd: 4.20,
      ingredients: [{ id: 'ar-d2', name: 'Ground Turkey, Beans & Crushed Tomatoes', portion: '1 serving', costUsd: 4.20 }],
      instructions: ['Brown turkey with spices. Add beans and tomatoes, simmer 20 mins.'],
      budgetTips: 'One of the best meal prep dishes for cost and macronutrient density.'
    }
  ],
  snack: [
    {
      id: 'alt-us-s1',
      type: 'snack',
      title: 'Honeycrisp Apple with Creamy Peanut Butter',
      subtitle: 'Crisp, sweet apple wedges dipped in 100% natural peanut butter',
      image: AMERICAN_FOOD_IMAGES.apple_almond_butter,
      servingSize: '1 Apple + 2 tbsp PB',
      prepTime: '2 Mins',
      baseKcal: 260,
      baseProtein: 8,
      baseCarbs: 34,
      baseFat: 14,
      costUsd: 1.30,
      ingredients: [{ id: 'ar-s1', name: 'Apple & Natural Peanut Butter', portion: '1 serving', costUsd: 1.30 }],
      instructions: ['Slice apple and dip in peanut butter.'],
      budgetTips: 'Quick, natural energy with steady blood sugar release.'
    },
    {
      id: 'alt-us-s2',
      type: 'snack',
      title: 'Low-Fat Cottage Cheese with Pineapple',
      subtitle: 'Slow-digesting casein protein with sweet, juicy pineapple chunks',
      image: AMERICAN_FOOD_IMAGES.cottage_cheese,
      servingSize: '1 Cup Cottage Cheese + Pineapple',
      prepTime: '2 Mins',
      baseKcal: 210,
      baseProtein: 26,
      baseCarbs: 22,
      baseFat: 2.5,
      costUsd: 1.70,
      ingredients: [{ id: 'ar-s2', name: 'Cottage Cheese & Pineapple', portion: '1 serving', costUsd: 1.70 }],
      instructions: ['Spoon cottage cheese into a bowl and top with pineapple.'],
      budgetTips: 'Ideal evening snack before sleep to prevent muscle breakdown.'
    }
  ]
};

export function getAmericanMealCostUsd(meal: AmericanMeal): number {
  if (meal.costUsd && meal.costUsd > 0) return meal.costUsd;
  let total = 0;
  for (const ing of meal.ingredients || []) {
    total += ing.costUsd || 1.0;
  }
  return Number(total.toFixed(2)) || 4.50;
}

export function getMatchingAmericanMealImage(title: string, type: string = 'lunch'): any {
  return getVerifiedMealImage(title, type, 'american');
}
