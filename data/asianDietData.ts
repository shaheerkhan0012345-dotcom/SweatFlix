// =============================================================================
// PAN-ASIAN BALANCED & DIVERSE DIET PLAN DATA
// Chinese, Japanese, Korean, Thai, Indian, Vietnamese Cuisines • 30 Days • USD ($)
// =============================================================================

import { LOCAL_MEAL_IMAGES, getVerifiedMealImage } from '../constants/mealImages';

export interface AsianIngredientItem {
  id: string;
  name: string;
  portion: string;
  costUsd: number;
}

export interface AsianMeal {
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
  ingredients: AsianIngredientItem[];
  instructions: string[];
  budgetTips: string;
}

export interface DayAsianPlan {
  dayNumber: number;
  dayTitle: string;
  theme: string;
  breakfast: AsianMeal;
  lunch: AsianMeal;
  dinner: AsianMeal;
  snack: AsianMeal;
}

export const ASIAN_FOOD_IMAGES = LOCAL_MEAL_IMAGES;

export function getMatchingAsianMealImage(title: string, type: string = 'lunch'): any {
  return getVerifiedMealImage(title, type, 'asian');
}

export const THIRTY_DAY_ASIAN_PLAN: DayAsianPlan[] = [
  {
    "dayNumber": 1,
    "dayTitle": "Day 1",
    "theme": "Japanese Traditional & Teriyaki",
    "breakfast": {
      "id": "as-d1-b",
      "type": "breakfast",
      "title": "Japanese Rolled Tamagoyaki with Miso & Rice",
      "subtitle": "Fluffy sweet-savory rolled dashi eggs served with warm jasmine rice and scallions",
      "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
      "servingSize": "3 Egg Rolls + 1 Cup Steamed Rice",
      "prepTime": "12 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 48,
      "baseFat": 14,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-b1-1",
          "name": "Cage-Free Eggs",
          "portion": "3 eggs",
          "costUsd": 0.8
        },
        {
          "id": "as-b1-2",
          "name": "Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.4
        },
        {
          "id": "as-b1-3",
          "name": "Dashi & Mirin Seasoning",
          "portion": "1 tbsp",
          "costUsd": 0.5
        },
        {
          "id": "as-b1-4",
          "name": "Green Scallions & Nori",
          "portion": "Handful",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Whisk eggs with dashi, mirin, and a pinch of sea salt.",
        "Pour thin layers into a non-stick pan, rolling gradually into a fluffy cylinder.",
        "Serve warm alongside steamed jasmine rice and garnish with chopped scallions."
      ],
      "budgetTips": "Eggs provide bioavailable protein while jasmine rice bought in bulk is very economical."
    },
    "lunch": {
      "id": "as-d1-l",
      "type": "lunch",
      "title": "Japanese Glazed Chicken Teriyaki Bowl",
      "subtitle": "Tender pan-seared chicken thighs in house-made ginger mirin glaze over steamed rice and broccoli",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Rice Bowl (400g)",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 62,
      "baseFat": 14,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-l1-1",
          "name": "Boneless Skinless Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-l1-2",
          "name": "Jasmine White / Brown Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l1-3",
          "name": "Fresh Steamed Broccoli",
          "portion": "1 cup florets",
          "costUsd": 0.9
        },
        {
          "id": "as-l1-4",
          "name": "Teriyaki Sauce & Sesame",
          "portion": "2 tbsp",
          "costUsd": 1.25
        }
      ],
      "instructions": [
        "Sear chicken in a hot skillet until golden brown on both sides.",
        "Add soy sauce, mirin, and grated ginger; simmer until sauce turns into a glossy lacquer.",
        "Slice chicken and arrange over warm rice with steamed broccoli and sesame seeds."
      ],
      "budgetTips": "Making your own teriyaki glaze with soy sauce, mirin, and honey costs 70% less than store jars."
    },
    "dinner": {
      "id": "as-d1-d",
      "type": "dinner",
      "title": "Japanese Shoyu Ramen with Chashu & Soft Egg",
      "subtitle": "Rich umami dashi-chicken broth with wavy ramen noodles, braised chicken, bamboo shoots, and marinated egg",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Ramen Bowl (500ml)",
      "prepTime": "22 Mins",
      "baseKcal": 590,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 16,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-d1-1",
          "name": "Braised Chicken Breast / Thigh",
          "portion": "140g",
          "costUsd": 1.95
        },
        {
          "id": "as-d1-2",
          "name": "Japanese Fresh Ramen Noodles",
          "portion": "100g",
          "costUsd": 0.85
        },
        {
          "id": "as-d1-3",
          "name": "Ajitsuke Marinated Soft Egg",
          "portion": "1 egg",
          "costUsd": 0.5
        },
        {
          "id": "as-d1-4",
          "name": "Shoyu Broth, Nori & Scallions",
          "portion": "Broth + garnish",
          "costUsd": 1.5
        }
      ],
      "instructions": [
        "Prepare aromatic shoyu broth with chicken stock, soy sauce, and kombu.",
        "Cook ramen noodles in boiling water for exactly 2 minutes and transfer into bowl.",
        "Pour broth, arrange sliced chicken, halved soft-boiled egg, nori sheet, and scallions."
      ],
      "budgetTips": "Authentic ramen made at home delivers restaurant taste at 75% savings."
    },
    "snack": {
      "id": "as-d1-s",
      "type": "snack",
      "title": "Steamed Sea Salt & Garlic Edamame Pods",
      "subtitle": "Warm tender green soybean pods dusted with flaky sea salt and cracked black pepper",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Medium Bowl (150g)",
      "prepTime": "5 Mins",
      "baseKcal": 180,
      "baseProtein": 17,
      "baseCarbs": 14,
      "baseFat": 6,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "as-s1-1",
          "name": "Whole Edamame Pods",
          "portion": "150g",
          "costUsd": 1.3
        },
        {
          "id": "as-s1-2",
          "name": "Sea Salt & Toasted Garlic",
          "portion": "Pinch",
          "costUsd": 0.3
        }
      ],
      "instructions": [
        "Steam edamame pods in salted water for 4 minutes. Drain and toss with sea salt."
      ],
      "budgetTips": "Complete plant protein snack with 8g of prebiotic dietary fiber per bowl."
    }
  },
  {
    "dayNumber": 2,
    "dayTitle": "Day 2",
    "theme": "Thai Coconut & Chili Aromatics",
    "breakfast": {
      "id": "as-d2-b",
      "type": "breakfast",
      "title": "Thai Mango & Coconut Chia Seed Pudding",
      "subtitle": "Overnight chia seeds steeped in light coconut milk topped with sweet fresh mango cubes",
      "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Glass Jar (250g)",
      "prepTime": "5 Mins (Overnight)",
      "baseKcal": 350,
      "baseProtein": 12,
      "baseCarbs": 44,
      "baseFat": 14,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "as-b6-1",
          "name": "Organic Chia Seeds",
          "portion": "3 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-b6-2",
          "name": "Light Coconut Milk",
          "portion": "1 cup",
          "costUsd": 0.8
        },
        {
          "id": "as-b6-3",
          "name": "Fresh Sweet Mango",
          "portion": "1/2 cup diced",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Whisk chia seeds into light coconut milk with a hint of vanilla.",
        "Refrigerate overnight until thick and spoon fresh mango cubes over top."
      ],
      "budgetTips": "Chia provides 100% daily plant-based omega-3 alpha-linolenic acid."
    },
    "lunch": {
      "id": "as-d2-l",
      "type": "lunch",
      "title": "Authentic Thai Pad Thai with Tofu & Shrimp",
      "subtitle": "Stir-fried flat rice noodles tossed with tamarind sauce, bean sprouts, crushed peanuts, and lime",
      "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate (380g)",
      "prepTime": "15 Mins",
      "baseKcal": 540,
      "baseProtein": 34,
      "baseCarbs": 72,
      "baseFat": 13,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-l3-1",
          "name": "Firm Tofu & Tail-on Shrimp",
          "portion": "140g mixed",
          "costUsd": 2.3
        },
        {
          "id": "as-l3-2",
          "name": "Flat Rice Pad Thai Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-3",
          "name": "Bean Sprouts & Scallions",
          "portion": "1 cup",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-4",
          "name": "Tamarind Sauce, Peanuts & Lime",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Soak rice noodles in warm water until pliable.",
        "Sear tofu cubes and shrimp in a hot wok; push aside and scramble an egg.",
        "Toss in drained noodles with tamarind sauce, bean sprouts, and roasted crushed peanuts."
      ],
      "budgetTips": "Combining tofu with shrimp gives complete seafood flavor while cutting total protein cost in half."
    },
    "dinner": {
      "id": "as-d2-d",
      "type": "dinner",
      "title": "Thai Green Coconut Chicken Curry with Jasmine Rice",
      "subtitle": "Fragrant coconut milk curry with chicken, Thai eggplants, bamboo shoots, and kaffir lime leaves",
      "image": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Curry Bowl + 1 Cup Rice",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 40,
      "baseCarbs": 58,
      "baseFat": 20,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-d2-1",
          "name": "Chicken Breast Slices",
          "portion": "150g",
          "costUsd": 2.1
        },
        {
          "id": "as-d2-2",
          "name": "Coconut Milk (Light)",
          "portion": "1 cup",
          "costUsd": 1
        },
        {
          "id": "as-d2-3",
          "name": "Green Curry Paste & Thai Basil",
          "portion": "2 tbsp",
          "costUsd": 0.8
        },
        {
          "id": "as-d2-4",
          "name": "Bamboo Shoots & Steamed Rice",
          "portion": "1 cup rice",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Fry green curry paste in coconut cream until fragrant and oils separate.",
        "Add chicken and bamboo shoots; simmer gently in coconut milk for 10 minutes.",
        "Finish with kaffir lime leaves and Thai basil; serve with jasmine rice."
      ],
      "budgetTips": "Medium-chain triglycerides (MCTs) in coconut milk provide quick metabolic energy."
    },
    "snack": {
      "id": "as-d2-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  },
  {
    "dayNumber": 3,
    "dayTitle": "Day 3",
    "theme": "Korean High-Protein & Fermented",
    "breakfast": {
      "id": "as-d3-b",
      "type": "breakfast",
      "title": "Korean Scallion & Egg Kimchi Pancake (Pajeon)",
      "subtitle": "Crispy savory pancake with fresh scallions, aged kimchi, and beaten egg topping",
      "image": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Medium Wedges",
      "prepTime": "12 Mins",
      "baseKcal": 390,
      "baseProtein": 18,
      "baseCarbs": 54,
      "baseFat": 11,
      "costUsd": 2.3,
      "ingredients": [
        {
          "id": "as-b4-1",
          "name": "Green Scallions (Pa)",
          "portion": "4 stalks",
          "costUsd": 0.6
        },
        {
          "id": "as-b4-2",
          "name": "Aged Kimchi",
          "portion": "1/2 cup",
          "costUsd": 0.75
        },
        {
          "id": "as-b4-3",
          "name": "Farm Egg",
          "portion": "1 egg",
          "costUsd": 0.3
        },
        {
          "id": "as-b4-4",
          "name": "Whole Grain Flour & Sesame",
          "portion": "60g",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Mix whole grain flour with icy water, sliced scallions, and chopped kimchi.",
        "Pan-fry until crisp; crack an egg on top and flip to seal until golden."
      ],
      "budgetTips": "Fermented kimchi supports gut microbiota and adds intense natural flavor without extra salt."
    },
    "lunch": {
      "id": "as-d3-l",
      "type": "lunch",
      "title": "Korean Rainbow Bibimbap Bowl with Lean Beef",
      "subtitle": "Warm rice layered with seasoned spinach, carrots, bean sprouts, lean beef, and sunny egg",
      "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Hot Bowl",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 15,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-l2-1",
          "name": "Lean Ground Beef (90/10)",
          "portion": "120g",
          "costUsd": 1.95
        },
        {
          "id": "as-l2-2",
          "name": "Steamed Short Grain Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l2-3",
          "name": "Spinach, Carrots & Bean Sprouts",
          "portion": "1.5 cups sautéed",
          "costUsd": 1.2
        },
        {
          "id": "as-l2-4",
          "name": "Sunny Side Up Egg & Gochujang",
          "portion": "1 egg + 1 tbsp",
          "costUsd": 1.3
        }
      ],
      "instructions": [
        "Briefly sauté seasoned beef with garlic and light soy sauce.",
        "Blanch spinach and bean sprouts; toss each with sesame oil and salt.",
        "Assemble warm rice in a bowl, arrange vibrant vegetables in radial sections, and crown with egg."
      ],
      "budgetTips": "Bibimbap is the gold standard for getting 5 different vegetable colors into a single meal."
    },
    "dinner": {
      "id": "as-d3-d",
      "type": "dinner",
      "title": "Japanese Miso Glazed Salmon with Steamed Rice",
      "subtitle": "Oven-roasted wild salmon fillet brushed with sweet white miso glaze, served with baby bok choy",
      "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Salmon Fillet + Rice & Greens",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 42,
      "baseCarbs": 46,
      "baseFat": 20,
      "costUsd": 6.4,
      "ingredients": [
        {
          "id": "as-d7-1",
          "name": "Atlantic Salmon Fillet",
          "portion": "160g",
          "costUsd": 4.2
        },
        {
          "id": "as-d7-2",
          "name": "Sweet White Miso Glaze",
          "portion": "1.5 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-d7-3",
          "name": "Steamed Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.6
        },
        {
          "id": "as-d7-4",
          "name": "Steamed Baby Bok Choy",
          "portion": "1 bunch",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Mix white miso, mirin, and a dash of honey into a paste; spread over salmon.",
        "Broil on high for 7-8 minutes until caramelized and flaky.",
        "Serve hot with steamed rice and tender bok choy."
      ],
      "budgetTips": "Miso fermentation creates rich natural glutamates for intense umami without heavy fats."
    },
    "snack": {
      "id": "as-d3-s",
      "type": "snack",
      "title": "Toasted Asian Spiced Cashews & Almonds",
      "subtitle": "Oven-roasted whole cashews and almonds coated in tamari soy, sesame, and chili flakes",
      "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
      "servingSize": "Handful (40g)",
      "prepTime": "3 Mins",
      "baseKcal": 240,
      "baseProtein": 8,
      "baseCarbs": 10,
      "baseFat": 19,
      "costUsd": 1.4,
      "ingredients": [
        {
          "id": "as-s3-1",
          "name": "Roasted Cashews & Almonds",
          "portion": "40g",
          "costUsd": 1.2
        },
        {
          "id": "as-s3-2",
          "name": "Tamari Soy & Sesame Seeds",
          "portion": "1 tsp",
          "costUsd": 0.2
        }
      ],
      "instructions": [
        "Toss nuts in tamari and sesame seeds, roast lightly until fragrant."
      ],
      "budgetTips": "Convenient healthy fat source providing sustained physical energy."
    }
  },
  {
    "dayNumber": 4,
    "dayTitle": "Day 4",
    "theme": "Cantonese Dim Sum & Wok Classics",
    "breakfast": {
      "id": "as-d4-b",
      "type": "breakfast",
      "title": "Cantonese Chicken & Ginger Rice Congee",
      "subtitle": "Slow-simmered silky rice porridge with shredded chicken, ginger slivers, and sesame",
      "image": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Bowl (350ml)",
      "prepTime": "15 Mins",
      "baseKcal": 380,
      "baseProtein": 26,
      "baseCarbs": 52,
      "baseFat": 6,
      "costUsd": 2.1,
      "ingredients": [
        {
          "id": "as-b2-1",
          "name": "Shredded Chicken Breast",
          "portion": "100g",
          "costUsd": 1.1
        },
        {
          "id": "as-b2-2",
          "name": "Fragrant White Rice",
          "portion": "60g raw",
          "costUsd": 0.35
        },
        {
          "id": "as-b2-3",
          "name": "Fresh Ginger & Garlic",
          "portion": "1 thumb",
          "costUsd": 0.3
        },
        {
          "id": "as-b2-4",
          "name": "Toasted Sesame Oil & Soy",
          "portion": "1 tsp",
          "costUsd": 0.35
        }
      ],
      "instructions": [
        "Simmer rice with chicken broth and ginger slices until broken down into a velvety porridge.",
        "Stir through tender shredded chicken breast and simmer for 3 minutes.",
        "Top with scallions and a drizzle of fragrant sesame oil."
      ],
      "budgetTips": "Congee stretches small portions of chicken and rice into a filling, gut-friendly breakfast."
    },
    "lunch": {
      "id": "as-d4-l",
      "type": "lunch",
      "title": "Steamed Chicken & Vegetable Dim Sum Dumplings",
      "subtitle": "Handcrafted steamed dumplings packed with lean chicken and cabbage served with spicy dipping soy",
      "image": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "8 Dumplings + Dipping Greens",
      "prepTime": "15 Mins",
      "baseKcal": 480,
      "baseProtein": 32,
      "baseCarbs": 58,
      "baseFat": 12,
      "costUsd": 3.9,
      "ingredients": [
        {
          "id": "as-l5-1",
          "name": "Chicken & Napa Cabbage Dumplings",
          "portion": "8 pieces",
          "costUsd": 2.4
        },
        {
          "id": "as-l5-2",
          "name": "Steamed Baby Bok Choy",
          "portion": "1 bunch",
          "costUsd": 0.8
        },
        {
          "id": "as-l5-3",
          "name": "Black Vinegar & Chili Soy Dip",
          "portion": "2 tbsp",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Steam dumplings in a bamboo or metal steamer for 8 minutes until translucent.",
        "Steam baby bok choy for 2 minutes alongside.",
        "Serve with Zhenjiang black vinegar, light soy sauce, and fresh ginger strips."
      ],
      "budgetTips": "Steaming locks in micronutrients without adding extra cooking oil or fats."
    },
    "dinner": {
      "id": "as-d4-d",
      "type": "dinner",
      "title": "Classic Kung Pao Chicken with Roasted Peanuts",
      "subtitle": "Seared chicken breast wok-tossed with roasted peanuts, zucchini, red peppers, and chili pods",
      "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate + Brown Rice",
      "prepTime": "16 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 54,
      "baseFat": 18,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-d3-1",
          "name": "Diced Chicken Breast",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-d3-2",
          "name": "Roasted Peanuts",
          "portion": "30g",
          "costUsd": 0.5
        },
        {
          "id": "as-d3-3",
          "name": "Zucchini, Bell Peppers & Chilies",
          "portion": "1.5 cups",
          "costUsd": 0.95
        },
        {
          "id": "as-d3-4",
          "name": "Brown Rice & Kung Pao Sauce",
          "portion": "1 cup rice",
          "costUsd": 0.75
        }
      ],
      "instructions": [
        "Marinate diced chicken with soy sauce and cornstarch.",
        "Sear chicken in hot wok, toss in bell peppers, zucchini, and dried red chilies.",
        "Pour Kung Pao sauce over, fold in crunchy peanuts, and serve over warm brown rice."
      ],
      "budgetTips": "Peanuts add healthy monounsaturated fats and satisfying crunch for pennies."
    },
    "snack": {
      "id": "as-d4-s",
      "type": "snack",
      "title": "Fresh Tropical Papaya & Lychee Bowl",
      "subtitle": "Chilled fresh papaya wedges and sweet lychees with a squeeze of fresh lime juice",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (180g)",
      "prepTime": "3 Mins",
      "baseKcal": 140,
      "baseProtein": 2,
      "baseCarbs": 34,
      "baseFat": 0.5,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "as-s5-1",
          "name": "Fresh Papaya & Lychee",
          "portion": "180g",
          "costUsd": 1.35
        },
        {
          "id": "as-s5-2",
          "name": "Lime Wedge & Mint",
          "portion": "Garnish",
          "costUsd": 0.15
        }
      ],
      "instructions": [
        "Slice ripe chilled papaya and serve with lime juice and mint."
      ],
      "budgetTips": "Papaya contains papain enzymes that actively aid post-workout protein digestion."
    }
  },
  {
    "dayNumber": 5,
    "dayTitle": "Day 5",
    "theme": "Indian Vibrant Spices & Dal",
    "breakfast": {
      "id": "as-d5-b",
      "type": "breakfast",
      "title": "Indian Spiced Masala Omelet with Whole Wheat Roti",
      "subtitle": "Free-range eggs whisked with diced red onions, cilantro, green chilies, and warm turmeric",
      "image": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Eggs + 1 Whole Wheat Roti",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 22,
      "baseCarbs": 36,
      "baseFat": 18,
      "costUsd": 1.85,
      "ingredients": [
        {
          "id": "as-b3-1",
          "name": "Farm Eggs",
          "portion": "2 eggs",
          "costUsd": 0.55
        },
        {
          "id": "as-b3-2",
          "name": "Whole Wheat Atta Roti",
          "portion": "1 flatbread",
          "costUsd": 0.35
        },
        {
          "id": "as-b3-3",
          "name": "Red Onion, Green Chili & Cilantro",
          "portion": "Handful",
          "costUsd": 0.45
        },
        {
          "id": "as-b3-4",
          "name": "Mustard Oil / Ghee",
          "portion": "1 tsp",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Finely chop red onion, green chili, and cilantro; beat into eggs with turmeric and salt.",
        "Pour into hot skillet with a touch of ghee and cook until golden brown on both sides.",
        "Serve hot folded with a fresh whole wheat roti."
      ],
      "budgetTips": "One of the most cost-effective and nutrient-packed breakfasts in South Asia."
    },
    "lunch": {
      "id": "as-d5-l",
      "type": "lunch",
      "title": "Indian Dal Tadka with Fragrant Basmati Rice",
      "subtitle": "Golden yellow lentils tempered with cumin, garlic, and ghee, served over aged basmati rice",
      "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Bowl Dal + 1 Cup Basmati",
      "prepTime": "20 Mins",
      "baseKcal": 520,
      "baseProtein": 24,
      "baseCarbs": 84,
      "baseFat": 10,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "as-l6-1",
          "name": "Yellow Moong & Toor Lentils",
          "portion": "80g raw",
          "costUsd": 0.75
        },
        {
          "id": "as-l6-2",
          "name": "Long-Grain Aged Basmati Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.6
        },
        {
          "id": "as-l6-3",
          "name": "Cumin, Garlic, Tomato & Ghee Tadka",
          "portion": "1 tbsp",
          "costUsd": 0.65
        },
        {
          "id": "as-l6-4",
          "name": "Fresh Lemon & Coriander",
          "portion": "Garnish",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil lentils with water, turmeric, and sea salt until soft and creamy.",
        "In a small ladle, heat ghee with cumin seeds, sliced garlic, and dry chili until aromatic.",
        "Pour sizzled tadka over lentils; serve steaming over fluffy basmati rice."
      ],
      "budgetTips": "Lentils and rice form a complete protein containing all 9 essential amino acids at unmatched low cost."
    },
    "dinner": {
      "id": "as-d5-d",
      "type": "dinner",
      "title": "Tandoori Chicken Tikka with Grilled Bell Peppers",
      "subtitle": "Char-grilled yogurt-marinated chicken breast skewers with grilled onions and mint chutney",
      "image": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Large Skewers + 1 Roti",
      "prepTime": "18 Mins",
      "baseKcal": 510,
      "baseProtein": 48,
      "baseCarbs": 36,
      "baseFat": 14,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-d5-1",
          "name": "Boneless Chicken Breast Chunks",
          "portion": "180g",
          "costUsd": 2.4
        },
        {
          "id": "as-d5-2",
          "name": "Bell Peppers & Red Onion",
          "portion": "1 cup sliced",
          "costUsd": 0.8
        },
        {
          "id": "as-d5-3",
          "name": "Whole Wheat Roti",
          "portion": "1 piece",
          "costUsd": 0.4
        },
        {
          "id": "as-d5-4",
          "name": "Mint Cilantro Chutney",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Coat chicken in Greek yogurt, Kashmiri chili, ginger, and garam masala.",
        "Thread onto skewers with onion and pepper chunks; broil or grill until lightly charred.",
        "Serve piping hot with whole wheat roti and fresh mint chutney."
      ],
      "budgetTips": "One of the highest protein-to-calorie ratios among all global cuisines."
    },
    "snack": {
      "id": "as-d5-s",
      "type": "snack",
      "title": "Cardamom Masala Chai with Roasted Chana",
      "subtitle": "Slow-brewed spiced black tea with milk and crushed cardamom, paired with crunchy roasted chickpeas",
      "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Cup Chai + 1 Small Bowl Chana",
      "prepTime": "6 Mins",
      "baseKcal": 220,
      "baseProtein": 12,
      "baseCarbs": 32,
      "baseFat": 4.5,
      "costUsd": 1.1,
      "ingredients": [
        {
          "id": "as-s4-1",
          "name": "Roasted Bengal Gram Chana",
          "portion": "50g",
          "costUsd": 0.5
        },
        {
          "id": "as-s4-2",
          "name": "Spiced Milk Chai",
          "portion": "200ml",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil black tea with crushed cardamom and ginger; add milk and serve with roasted chana."
      ],
      "budgetTips": "Roasted chana costs under $0.60 per portion and provides 10g clean protein."
    }
  },
  {
    "dayNumber": 6,
    "dayTitle": "Day 6",
    "theme": "Vietnamese Fresh Herb & Noodle",
    "breakfast": {
      "id": "as-d6-b",
      "type": "breakfast",
      "title": "Vietnamese Scrambled Eggs with Spring Onion & Baguette",
      "subtitle": "Silky soft scrambled eggs tossed with nuoc cham, scallions, and crisp whole grain baguette",
      "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Eggs + 1 Mini Baguette",
      "prepTime": "8 Mins",
      "baseKcal": 400,
      "baseProtein": 21,
      "baseCarbs": 45,
      "baseFat": 14,
      "costUsd": 2.15,
      "ingredients": [
        {
          "id": "as-b9-1",
          "name": "Fresh Eggs",
          "portion": "2 eggs",
          "costUsd": 0.55
        },
        {
          "id": "as-b9-2",
          "name": "Crusty Baguette",
          "portion": "1 roll",
          "costUsd": 0.7
        },
        {
          "id": "as-b9-3",
          "name": "Shallots, Herbs & Light Soy",
          "portion": "Handful",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Scramble eggs gently over medium heat with shallots and light seasoning.",
        "Serve warm tucked into freshly toasted crusty bread."
      ],
      "budgetTips": "Combines French-Vietnamese street food heritage with high protein."
    },
    "lunch": {
      "id": "as-d6-l",
      "type": "lunch",
      "title": "Vietnamese Chicken Pho Noodle Soup (Pho Ga)",
      "subtitle": "Clear aromatic chicken bone broth with star anise, rice noodles, tender chicken, and fresh herbs",
      "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Soup Bowl (500ml)",
      "prepTime": "20 Mins",
      "baseKcal": 510,
      "baseProtein": 40,
      "baseCarbs": 64,
      "baseFat": 9,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-l4-1",
          "name": "Poached Chicken Breast",
          "portion": "150g",
          "costUsd": 2.1
        },
        {
          "id": "as-l4-2",
          "name": "Flat Rice Pho Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l4-3",
          "name": "Aromatic Spiced Pho Broth",
          "portion": "2 cups",
          "costUsd": 0.75
        },
        {
          "id": "as-l4-4",
          "name": "Thai Basil, Jalapeño & Lime",
          "portion": "Generous herbs",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Simmer chicken broth with toasted star anise, cinnamon stick, ginger, and onion for deep aroma.",
        "Place warm rice noodles and sliced chicken into a deep bowl.",
        "Pour boiling broth over top; serve alongside fresh Thai basil, lime wedges, and bean sprouts."
      ],
      "budgetTips": "Pho broth is naturally hydrating, low in fat, and rich in collagen peptides."
    },
    "dinner": {
      "id": "as-d6-d",
      "type": "dinner",
      "title": "Vietnamese Lemongrass Chicken Salad (Goi Ga)",
      "subtitle": "Shredded chicken tossed with crisp green cabbage, mint, cilantro, roasted peanuts, and lime dressing",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Huge Salad Bowl",
      "prepTime": "12 Mins",
      "baseKcal": 440,
      "baseProtein": 44,
      "baseCarbs": 24,
      "baseFat": 18,
      "costUsd": 4.1,
      "ingredients": [
        {
          "id": "as-l10-1",
          "name": "Poached Shredded Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-l10-2",
          "name": "Green & Red Shredded Cabbage",
          "portion": "2 cups",
          "costUsd": 0.7
        },
        {
          "id": "as-l10-3",
          "name": "Fresh Mint, Cilantro & Peanuts",
          "portion": "Handful",
          "costUsd": 0.65
        },
        {
          "id": "as-l10-4",
          "name": "Lime, Garlic & Chili Dressing",
          "portion": "2 tbsp",
          "costUsd": 0.55
        }
      ],
      "instructions": [
        "Shred chicken breast and place in a mixing bowl with thinly shaved cabbage.",
        "Toss with mint, cilantro, and fresh lime dressing.",
        "Garnish with crushed roasted peanuts for texture."
      ],
      "budgetTips": "Extremely low-carb, nutrient-dense lunch that keeps insulin levels perfectly stable."
    },
    "snack": {
      "id": "as-d6-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  },
  {
    "dayNumber": 7,
    "dayTitle": "Day 7",
    "theme": "Pan-Asian Poke & Wok Fusion",
    "breakfast": {
      "id": "as-d7-b",
      "type": "breakfast",
      "title": "Japanese Ceremonial Matcha Protein Smoothie Bowl",
      "subtitle": "Chilled Japanese green tea matcha blended with frozen banana, soy milk, and chia seeds",
      "image": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Bowl (300ml)",
      "prepTime": "5 Mins",
      "baseKcal": 360,
      "baseProtein": 24,
      "baseCarbs": 46,
      "baseFat": 8,
      "costUsd": 2.75,
      "ingredients": [
        {
          "id": "as-b5-1",
          "name": "Japanese Matcha Powder",
          "portion": "1 tsp",
          "costUsd": 0.85
        },
        {
          "id": "as-b5-2",
          "name": "Soy / Almond Milk",
          "portion": "1 cup",
          "costUsd": 0.6
        },
        {
          "id": "as-b5-3",
          "name": "Ripe Cavendish Banana",
          "portion": "1 frozen",
          "costUsd": 0.35
        },
        {
          "id": "as-b5-4",
          "name": "Plant Protein & Chia Seeds",
          "portion": "20g",
          "costUsd": 0.95
        }
      ],
      "instructions": [
        "Blend frozen banana, matcha powder, plant protein, and soy milk until thick and creamy.",
        "Pour into a chilled bowl and top with chia seeds."
      ],
      "budgetTips": "Matcha delivers steady L-theanine energy without coffee crashes."
    },
    "lunch": {
      "id": "as-d7-l",
      "type": "lunch",
      "title": "Hawaiian-Japanese Salmon & Edamame Poke Bowl",
      "subtitle": "Fresh Atlantic salmon sashimi cubes over brown rice, edamame, cucumber, and spicy sesame ponzu",
      "image": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Poke Bowl (380g)",
      "prepTime": "10 Mins",
      "baseKcal": 570,
      "baseProtein": 42,
      "baseCarbs": 58,
      "baseFat": 18,
      "costUsd": 6.2,
      "ingredients": [
        {
          "id": "as-l8-1",
          "name": "Fresh Atlantic Salmon",
          "portion": "140g sashimi cut",
          "costUsd": 3.8
        },
        {
          "id": "as-l8-2",
          "name": "Brown Rice & Quinoa Blend",
          "portion": "1 cup cooked",
          "costUsd": 0.65
        },
        {
          "id": "as-l8-3",
          "name": "Shelled Edamame & Cucumber",
          "portion": "1 cup",
          "costUsd": 0.95
        },
        {
          "id": "as-l8-4",
          "name": "Sesame Ponzu Dressing",
          "portion": "2 tbsp",
          "costUsd": 0.8
        }
      ],
      "instructions": [
        "Cube fresh salmon and toss gently in ponzu sauce with sesame seeds.",
        "Layer warm brown rice into a bowl, arrange edamame, shredded cucumber, and salmon neatly.",
        "Top with nori strips and scallions."
      ],
      "budgetTips": "Buying whole salmon fillets and slicing at home costs one-third of commercial poke bowl shops."
    },
    "dinner": {
      "id": "as-d7-d",
      "type": "dinner",
      "title": "Yangzhou Wok-Fried Rice with Chicken & Edamame",
      "subtitle": "Jasmine rice stir-fried in a hot wok with scrambled eggs, chicken breast, edamame, and scallions",
      "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Wok Bowl (400g)",
      "prepTime": "14 Mins",
      "baseKcal": 540,
      "baseProtein": 38,
      "baseCarbs": 68,
      "baseFat": 12,
      "costUsd": 3.8,
      "ingredients": [
        {
          "id": "as-d8-1",
          "name": "Diced Chicken Breast",
          "portion": "120g",
          "costUsd": 1.65
        },
        {
          "id": "as-d8-2",
          "name": "Day-Old Jasmine Rice",
          "portion": "1.5 cups cooked",
          "costUsd": 0.5
        },
        {
          "id": "as-d8-3",
          "name": "Farm Eggs",
          "portion": "2 eggs",
          "costUsd": 0.6
        },
        {
          "id": "as-d8-4",
          "name": "Edamame, Carrots & Green Onions",
          "portion": "1 cup",
          "costUsd": 1.05
        }
      ],
      "instructions": [
        "Scramble eggs in hot oil and remove.",
        "Stir-fry chicken and vegetables, then add cold day-old rice, breaking clumps over high heat.",
        "Fold in eggs, scallions, and light soy sauce; toss until fragrant."
      ],
      "budgetTips": "Day-old cold rice has increased resistant starch, lowering glycemic spike."
    },
    "snack": {
      "id": "as-d7-s",
      "type": "snack",
      "title": "Steamed Sea Salt & Garlic Edamame Pods",
      "subtitle": "Warm tender green soybean pods dusted with flaky sea salt and cracked black pepper",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Medium Bowl (150g)",
      "prepTime": "5 Mins",
      "baseKcal": 180,
      "baseProtein": 17,
      "baseCarbs": 14,
      "baseFat": 6,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "as-s1-1",
          "name": "Whole Edamame Pods",
          "portion": "150g",
          "costUsd": 1.3
        },
        {
          "id": "as-s1-2",
          "name": "Sea Salt & Toasted Garlic",
          "portion": "Pinch",
          "costUsd": 0.3
        }
      ],
      "instructions": [
        "Steam edamame pods in salted water for 4 minutes. Drain and toss with sea salt."
      ],
      "budgetTips": "Complete plant protein snack with 8g of prebiotic dietary fiber per bowl."
    }
  },
  {
    "dayNumber": 8,
    "dayTitle": "Day 8",
    "theme": "Japanese Miso & Seafood",
    "breakfast": {
      "id": "as-d8-b",
      "type": "breakfast",
      "title": "Japanese Rolled Tamagoyaki with Miso & Rice",
      "subtitle": "Fluffy sweet-savory rolled dashi eggs served with warm jasmine rice and scallions",
      "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
      "servingSize": "3 Egg Rolls + 1 Cup Steamed Rice",
      "prepTime": "12 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 48,
      "baseFat": 14,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-b1-1",
          "name": "Cage-Free Eggs",
          "portion": "3 eggs",
          "costUsd": 0.8
        },
        {
          "id": "as-b1-2",
          "name": "Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.4
        },
        {
          "id": "as-b1-3",
          "name": "Dashi & Mirin Seasoning",
          "portion": "1 tbsp",
          "costUsd": 0.5
        },
        {
          "id": "as-b1-4",
          "name": "Green Scallions & Nori",
          "portion": "Handful",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Whisk eggs with dashi, mirin, and a pinch of sea salt.",
        "Pour thin layers into a non-stick pan, rolling gradually into a fluffy cylinder.",
        "Serve warm alongside steamed jasmine rice and garnish with chopped scallions."
      ],
      "budgetTips": "Eggs provide bioavailable protein while jasmine rice bought in bulk is very economical."
    },
    "lunch": {
      "id": "as-d8-l",
      "type": "lunch",
      "title": "Japanese Glazed Chicken Teriyaki Bowl",
      "subtitle": "Tender pan-seared chicken thighs in house-made ginger mirin glaze over steamed rice and broccoli",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Rice Bowl (400g)",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 62,
      "baseFat": 14,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-l1-1",
          "name": "Boneless Skinless Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-l1-2",
          "name": "Jasmine White / Brown Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l1-3",
          "name": "Fresh Steamed Broccoli",
          "portion": "1 cup florets",
          "costUsd": 0.9
        },
        {
          "id": "as-l1-4",
          "name": "Teriyaki Sauce & Sesame",
          "portion": "2 tbsp",
          "costUsd": 1.25
        }
      ],
      "instructions": [
        "Sear chicken in a hot skillet until golden brown on both sides.",
        "Add soy sauce, mirin, and grated ginger; simmer until sauce turns into a glossy lacquer.",
        "Slice chicken and arrange over warm rice with steamed broccoli and sesame seeds."
      ],
      "budgetTips": "Making your own teriyaki glaze with soy sauce, mirin, and honey costs 70% less than store jars."
    },
    "dinner": {
      "id": "as-d8-d",
      "type": "dinner",
      "title": "Cantonese Steamed Fish with Ginger & Scallions",
      "subtitle": "Delicate white fish fillet steamed with fresh ginger matchsticks, scallions, and light soy broth",
      "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Fish Fillet (180g) + Jasmine Rice",
      "prepTime": "15 Mins",
      "baseKcal": 490,
      "baseProtein": 42,
      "baseCarbs": 48,
      "baseFat": 12,
      "costUsd": 5.2,
      "ingredients": [
        {
          "id": "as-d6-1",
          "name": "White Fish Fillet (Cod / Tilapia)",
          "portion": "180g",
          "costUsd": 3.1
        },
        {
          "id": "as-d6-2",
          "name": "Fresh Ginger & Green Scallions",
          "portion": "Generous",
          "costUsd": 0.6
        },
        {
          "id": "as-d6-3",
          "name": "Light Soy & Toasted Sesame Oil",
          "portion": "2 tbsp",
          "costUsd": 0.6
        },
        {
          "id": "as-d6-4",
          "name": "Steamed Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Lay fresh fish fillet on a heatproof plate topped with julienned ginger.",
        "Steam over boiling water for 8 minutes until tender and flaky.",
        "Top with fresh scallions and pour smoking hot light soy and sesame oil over top."
      ],
      "budgetTips": "Delicate lean protein with heart-healthy omega-3s and virtually zero cleanup."
    },
    "snack": {
      "id": "as-d8-s",
      "type": "snack",
      "title": "Steamed Sea Salt & Garlic Edamame Pods",
      "subtitle": "Warm tender green soybean pods dusted with flaky sea salt and cracked black pepper",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Medium Bowl (150g)",
      "prepTime": "5 Mins",
      "baseKcal": 180,
      "baseProtein": 17,
      "baseCarbs": 14,
      "baseFat": 6,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "as-s1-1",
          "name": "Whole Edamame Pods",
          "portion": "150g",
          "costUsd": 1.3
        },
        {
          "id": "as-s1-2",
          "name": "Sea Salt & Toasted Garlic",
          "portion": "Pinch",
          "costUsd": 0.3
        }
      ],
      "instructions": [
        "Steam edamame pods in salted water for 4 minutes. Drain and toss with sea salt."
      ],
      "budgetTips": "Complete plant protein snack with 8g of prebiotic dietary fiber per bowl."
    }
  },
  {
    "dayNumber": 9,
    "dayTitle": "Day 9",
    "theme": "Thai Street Wok & Basil",
    "breakfast": {
      "id": "as-d9-b",
      "type": "breakfast",
      "title": "Thai Mango & Coconut Chia Seed Pudding",
      "subtitle": "Overnight chia seeds steeped in light coconut milk topped with sweet fresh mango cubes",
      "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Glass Jar (250g)",
      "prepTime": "5 Mins (Overnight)",
      "baseKcal": 350,
      "baseProtein": 12,
      "baseCarbs": 44,
      "baseFat": 14,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "as-b6-1",
          "name": "Organic Chia Seeds",
          "portion": "3 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-b6-2",
          "name": "Light Coconut Milk",
          "portion": "1 cup",
          "costUsd": 0.8
        },
        {
          "id": "as-b6-3",
          "name": "Fresh Sweet Mango",
          "portion": "1/2 cup diced",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Whisk chia seeds into light coconut milk with a hint of vanilla.",
        "Refrigerate overnight until thick and spoon fresh mango cubes over top."
      ],
      "budgetTips": "Chia provides 100% daily plant-based omega-3 alpha-linolenic acid."
    },
    "lunch": {
      "id": "as-d9-l",
      "type": "lunch",
      "title": "Thai Holy Basil Chicken (Pad Krapow Gai)",
      "subtitle": "Minced lean chicken wok-fried with garlic, birds eye chilies, holy basil, and sunny fried egg",
      "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Plate Chicken + 1 Cup Jasmine Rice",
      "prepTime": "12 Mins",
      "baseKcal": 560,
      "baseProtein": 42,
      "baseCarbs": 56,
      "baseFat": 18,
      "costUsd": 4.3,
      "ingredients": [
        {
          "id": "as-l11-1",
          "name": "Lean Minced Chicken",
          "portion": "160g",
          "costUsd": 2.1
        },
        {
          "id": "as-l11-2",
          "name": "Steamed Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l11-3",
          "name": "Thai Holy Basil Leaves & Garlic",
          "portion": "Handful",
          "costUsd": 0.85
        },
        {
          "id": "as-l11-4",
          "name": "Crispy Fried Egg",
          "portion": "1 egg",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Pound garlic and chilies in a mortar and fry in hot oil until fragrant.",
        "Add minced chicken and stir-fry rapidly with oyster sauce and fish sauce.",
        "Toss in fresh basil leaves off the heat until wilted; serve over rice with a crispy fried egg."
      ],
      "budgetTips": "Thailand's most famous everyday athletic lunch, packed with flavor and high protein."
    },
    "dinner": {
      "id": "as-d9-d",
      "type": "dinner",
      "title": "Authentic Thai Pad Thai with Tofu & Shrimp",
      "subtitle": "Stir-fried flat rice noodles tossed with tamarind sauce, bean sprouts, crushed peanuts, and lime",
      "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate (380g)",
      "prepTime": "15 Mins",
      "baseKcal": 540,
      "baseProtein": 34,
      "baseCarbs": 72,
      "baseFat": 13,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-l3-1",
          "name": "Firm Tofu & Tail-on Shrimp",
          "portion": "140g mixed",
          "costUsd": 2.3
        },
        {
          "id": "as-l3-2",
          "name": "Flat Rice Pad Thai Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-3",
          "name": "Bean Sprouts & Scallions",
          "portion": "1 cup",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-4",
          "name": "Tamarind Sauce, Peanuts & Lime",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Soak rice noodles in warm water until pliable.",
        "Sear tofu cubes and shrimp in a hot wok; push aside and scramble an egg.",
        "Toss in drained noodles with tamarind sauce, bean sprouts, and roasted crushed peanuts."
      ],
      "budgetTips": "Combining tofu with shrimp gives complete seafood flavor while cutting total protein cost in half."
    },
    "snack": {
      "id": "as-d9-s",
      "type": "snack",
      "title": "Fresh Tropical Papaya & Lychee Bowl",
      "subtitle": "Chilled fresh papaya wedges and sweet lychees with a squeeze of fresh lime juice",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (180g)",
      "prepTime": "3 Mins",
      "baseKcal": 140,
      "baseProtein": 2,
      "baseCarbs": 34,
      "baseFat": 0.5,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "as-s5-1",
          "name": "Fresh Papaya & Lychee",
          "portion": "180g",
          "costUsd": 1.35
        },
        {
          "id": "as-s5-2",
          "name": "Lime Wedge & Mint",
          "portion": "Garnish",
          "costUsd": 0.15
        }
      ],
      "instructions": [
        "Slice ripe chilled papaya and serve with lime juice and mint."
      ],
      "budgetTips": "Papaya contains papain enzymes that actively aid post-workout protein digestion."
    }
  },
  {
    "dayNumber": 10,
    "dayTitle": "Day 10",
    "theme": "Korean Golden Sesame Bowls",
    "breakfast": {
      "id": "as-d10-b",
      "type": "breakfast",
      "title": "Korean Scallion & Egg Kimchi Pancake (Pajeon)",
      "subtitle": "Crispy savory pancake with fresh scallions, aged kimchi, and beaten egg topping",
      "image": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Medium Wedges",
      "prepTime": "12 Mins",
      "baseKcal": 390,
      "baseProtein": 18,
      "baseCarbs": 54,
      "baseFat": 11,
      "costUsd": 2.3,
      "ingredients": [
        {
          "id": "as-b4-1",
          "name": "Green Scallions (Pa)",
          "portion": "4 stalks",
          "costUsd": 0.6
        },
        {
          "id": "as-b4-2",
          "name": "Aged Kimchi",
          "portion": "1/2 cup",
          "costUsd": 0.75
        },
        {
          "id": "as-b4-3",
          "name": "Farm Egg",
          "portion": "1 egg",
          "costUsd": 0.3
        },
        {
          "id": "as-b4-4",
          "name": "Whole Grain Flour & Sesame",
          "portion": "60g",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Mix whole grain flour with icy water, sliced scallions, and chopped kimchi.",
        "Pan-fry until crisp; crack an egg on top and flip to seal until golden."
      ],
      "budgetTips": "Fermented kimchi supports gut microbiota and adds intense natural flavor without extra salt."
    },
    "lunch": {
      "id": "as-d10-l",
      "type": "lunch",
      "title": "Korean Rainbow Bibimbap Bowl with Lean Beef",
      "subtitle": "Warm rice layered with seasoned spinach, carrots, bean sprouts, lean beef, and sunny egg",
      "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Hot Bowl",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 15,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-l2-1",
          "name": "Lean Ground Beef (90/10)",
          "portion": "120g",
          "costUsd": 1.95
        },
        {
          "id": "as-l2-2",
          "name": "Steamed Short Grain Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l2-3",
          "name": "Spinach, Carrots & Bean Sprouts",
          "portion": "1.5 cups sautéed",
          "costUsd": 1.2
        },
        {
          "id": "as-l2-4",
          "name": "Sunny Side Up Egg & Gochujang",
          "portion": "1 egg + 1 tbsp",
          "costUsd": 1.3
        }
      ],
      "instructions": [
        "Briefly sauté seasoned beef with garlic and light soy sauce.",
        "Blanch spinach and bean sprouts; toss each with sesame oil and salt.",
        "Assemble warm rice in a bowl, arrange vibrant vegetables in radial sections, and crown with egg."
      ],
      "budgetTips": "Bibimbap is the gold standard for getting 5 different vegetable colors into a single meal."
    },
    "dinner": {
      "id": "as-d10-d",
      "type": "dinner",
      "title": "Japanese Miso Glazed Salmon with Steamed Rice",
      "subtitle": "Oven-roasted wild salmon fillet brushed with sweet white miso glaze, served with baby bok choy",
      "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Salmon Fillet + Rice & Greens",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 42,
      "baseCarbs": 46,
      "baseFat": 20,
      "costUsd": 6.4,
      "ingredients": [
        {
          "id": "as-d7-1",
          "name": "Atlantic Salmon Fillet",
          "portion": "160g",
          "costUsd": 4.2
        },
        {
          "id": "as-d7-2",
          "name": "Sweet White Miso Glaze",
          "portion": "1.5 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-d7-3",
          "name": "Steamed Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.6
        },
        {
          "id": "as-d7-4",
          "name": "Steamed Baby Bok Choy",
          "portion": "1 bunch",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Mix white miso, mirin, and a dash of honey into a paste; spread over salmon.",
        "Broil on high for 7-8 minutes until caramelized and flaky.",
        "Serve hot with steamed rice and tender bok choy."
      ],
      "budgetTips": "Miso fermentation creates rich natural glutamates for intense umami without heavy fats."
    },
    "snack": {
      "id": "as-d10-s",
      "type": "snack",
      "title": "Toasted Asian Spiced Cashews & Almonds",
      "subtitle": "Oven-roasted whole cashews and almonds coated in tamari soy, sesame, and chili flakes",
      "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
      "servingSize": "Handful (40g)",
      "prepTime": "3 Mins",
      "baseKcal": 240,
      "baseProtein": 8,
      "baseCarbs": 10,
      "baseFat": 19,
      "costUsd": 1.4,
      "ingredients": [
        {
          "id": "as-s3-1",
          "name": "Roasted Cashews & Almonds",
          "portion": "40g",
          "costUsd": 1.2
        },
        {
          "id": "as-s3-2",
          "name": "Tamari Soy & Sesame Seeds",
          "portion": "1 tsp",
          "costUsd": 0.2
        }
      ],
      "instructions": [
        "Toss nuts in tamari and sesame seeds, roast lightly until fragrant."
      ],
      "budgetTips": "Convenient healthy fat source providing sustained physical energy."
    }
  },
  {
    "dayNumber": 11,
    "dayTitle": "Day 11",
    "theme": "Szechuan Pepper & Dumplings",
    "breakfast": {
      "id": "as-d11-b",
      "type": "breakfast",
      "title": "Steamed Fluffy Bao with Egg & Scallion Filling",
      "subtitle": "Warm pillowy yeast bao buns stuffed with scrambled eggs, fresh green onions, and chili crisp",
      "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Steamed Buns",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 18,
      "baseCarbs": 56,
      "baseFat": 12,
      "costUsd": 2.25,
      "ingredients": [
        {
          "id": "as-b8-1",
          "name": "Fluffy Bao Buns",
          "portion": "2 buns",
          "costUsd": 0.95
        },
        {
          "id": "as-b8-2",
          "name": "Scrambled Eggs",
          "portion": "2 eggs",
          "costUsd": 0.6
        },
        {
          "id": "as-b8-3",
          "name": "Chili Crisp Oil & Scallions",
          "portion": "1 tbsp",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Steam buns in a bamboo steamer for 6 minutes until soft and warm.",
        "Stuff with softly scrambled eggs, fresh scallions, and a dash of chili oil."
      ],
      "budgetTips": "Bao buns freeze perfectly in large bags for quick 5-minute morning breakfasts."
    },
    "lunch": {
      "id": "as-d11-l",
      "type": "lunch",
      "title": "Steamed Chicken & Vegetable Dim Sum Dumplings",
      "subtitle": "Handcrafted steamed dumplings packed with lean chicken and cabbage served with spicy dipping soy",
      "image": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "8 Dumplings + Dipping Greens",
      "prepTime": "15 Mins",
      "baseKcal": 480,
      "baseProtein": 32,
      "baseCarbs": 58,
      "baseFat": 12,
      "costUsd": 3.9,
      "ingredients": [
        {
          "id": "as-l5-1",
          "name": "Chicken & Napa Cabbage Dumplings",
          "portion": "8 pieces",
          "costUsd": 2.4
        },
        {
          "id": "as-l5-2",
          "name": "Steamed Baby Bok Choy",
          "portion": "1 bunch",
          "costUsd": 0.8
        },
        {
          "id": "as-l5-3",
          "name": "Black Vinegar & Chili Soy Dip",
          "portion": "2 tbsp",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Steam dumplings in a bamboo or metal steamer for 8 minutes until translucent.",
        "Steam baby bok choy for 2 minutes alongside.",
        "Serve with Zhenjiang black vinegar, light soy sauce, and fresh ginger strips."
      ],
      "budgetTips": "Steaming locks in micronutrients without adding extra cooking oil or fats."
    },
    "dinner": {
      "id": "as-d11-d",
      "type": "dinner",
      "title": "Classic Kung Pao Chicken with Roasted Peanuts",
      "subtitle": "Seared chicken breast wok-tossed with roasted peanuts, zucchini, red peppers, and chili pods",
      "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate + Brown Rice",
      "prepTime": "16 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 54,
      "baseFat": 18,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-d3-1",
          "name": "Diced Chicken Breast",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-d3-2",
          "name": "Roasted Peanuts",
          "portion": "30g",
          "costUsd": 0.5
        },
        {
          "id": "as-d3-3",
          "name": "Zucchini, Bell Peppers & Chilies",
          "portion": "1.5 cups",
          "costUsd": 0.95
        },
        {
          "id": "as-d3-4",
          "name": "Brown Rice & Kung Pao Sauce",
          "portion": "1 cup rice",
          "costUsd": 0.75
        }
      ],
      "instructions": [
        "Marinate diced chicken with soy sauce and cornstarch.",
        "Sear chicken in hot wok, toss in bell peppers, zucchini, and dried red chilies.",
        "Pour Kung Pao sauce over, fold in crunchy peanuts, and serve over warm brown rice."
      ],
      "budgetTips": "Peanuts add healthy monounsaturated fats and satisfying crunch for pennies."
    },
    "snack": {
      "id": "as-d11-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  },
  {
    "dayNumber": 12,
    "dayTitle": "Day 12",
    "theme": "North Indian Fragrant Biryani",
    "breakfast": {
      "id": "as-d12-b",
      "type": "breakfast",
      "title": "Indian Spiced Masala Omelet with Whole Wheat Roti",
      "subtitle": "Free-range eggs whisked with diced red onions, cilantro, green chilies, and warm turmeric",
      "image": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Eggs + 1 Whole Wheat Roti",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 22,
      "baseCarbs": 36,
      "baseFat": 18,
      "costUsd": 1.85,
      "ingredients": [
        {
          "id": "as-b3-1",
          "name": "Farm Eggs",
          "portion": "2 eggs",
          "costUsd": 0.55
        },
        {
          "id": "as-b3-2",
          "name": "Whole Wheat Atta Roti",
          "portion": "1 flatbread",
          "costUsd": 0.35
        },
        {
          "id": "as-b3-3",
          "name": "Red Onion, Green Chili & Cilantro",
          "portion": "Handful",
          "costUsd": 0.45
        },
        {
          "id": "as-b3-4",
          "name": "Mustard Oil / Ghee",
          "portion": "1 tsp",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Finely chop red onion, green chili, and cilantro; beat into eggs with turmeric and salt.",
        "Pour into hot skillet with a touch of ghee and cook until golden brown on both sides.",
        "Serve hot folded with a fresh whole wheat roti."
      ],
      "budgetTips": "One of the most cost-effective and nutrient-packed breakfasts in South Asia."
    },
    "lunch": {
      "id": "as-d12-l",
      "type": "lunch",
      "title": "Punjabi Chana Masala with Warm Whole Wheat Roti",
      "subtitle": "Tender chickpeas simmered in an aromatic tomato, onion, and garam masala gravy",
      "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Bowl Chana + 2 Rotis",
      "prepTime": "18 Mins",
      "baseKcal": 540,
      "baseProtein": 25,
      "baseCarbs": 82,
      "baseFat": 11,
      "costUsd": 2.5,
      "ingredients": [
        {
          "id": "as-l7-1",
          "name": "Chickpeas (Kabuli Chana)",
          "portion": "1 cup cooked",
          "costUsd": 0.7
        },
        {
          "id": "as-l7-2",
          "name": "Whole Wheat Atta Rotis",
          "portion": "2 pieces",
          "costUsd": 0.5
        },
        {
          "id": "as-l7-3",
          "name": "Tomato, Onion & Ginger Gravy",
          "portion": "1 cup",
          "costUsd": 0.7
        },
        {
          "id": "as-l7-4",
          "name": "Pickled Onion & Lemon",
          "portion": "Handful",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Sauté onions, ginger, and garlic paste; stir in pureed tomatoes and chana masala spice.",
        "Add cooked chickpeas and simmer on medium heat for 12 minutes until gravy thickens.",
        "Garnish with julienned ginger and serve with hot rotis."
      ],
      "budgetTips": "Chickpeas deliver over 12g of dietary fiber per serving for outstanding satiety."
    },
    "dinner": {
      "id": "as-d12-d",
      "type": "dinner",
      "title": "Fragrant Chicken Biryani with Cucumber Raita",
      "subtitle": "Layered basmati rice infused with whole spices, tender chicken thighs, and cool mint yogurt raita",
      "image": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Plate (420g)",
      "prepTime": "25 Mins",
      "baseKcal": 610,
      "baseProtein": 46,
      "baseCarbs": 74,
      "baseFat": 14,
      "costUsd": 4.7,
      "ingredients": [
        {
          "id": "as-d4-1",
          "name": "Marinated Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-d4-2",
          "name": "Aged Basmati Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.65
        },
        {
          "id": "as-d4-3",
          "name": "Biryani Spices, Saffron & Mint",
          "portion": "Handful",
          "costUsd": 0.85
        },
        {
          "id": "as-d4-4",
          "name": "Plain Yogurt Cucumber Raita",
          "portion": "1/2 cup",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Marinate chicken with yogurt, garlic, ginger, and biryani spices.",
        "Layer partially boiled basmati rice over chicken with fresh mint and saffron water.",
        "Seal pot and steam (dum) on low heat for 20 minutes; serve with fresh cucumber raita."
      ],
      "budgetTips": "High satiety dinner with cooling probiotics from homemade cucumber yogurt."
    },
    "snack": {
      "id": "as-d12-s",
      "type": "snack",
      "title": "Cardamom Masala Chai with Roasted Chana",
      "subtitle": "Slow-brewed spiced black tea with milk and crushed cardamom, paired with crunchy roasted chickpeas",
      "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Cup Chai + 1 Small Bowl Chana",
      "prepTime": "6 Mins",
      "baseKcal": 220,
      "baseProtein": 12,
      "baseCarbs": 32,
      "baseFat": 4.5,
      "costUsd": 1.1,
      "ingredients": [
        {
          "id": "as-s4-1",
          "name": "Roasted Bengal Gram Chana",
          "portion": "50g",
          "costUsd": 0.5
        },
        {
          "id": "as-s4-2",
          "name": "Spiced Milk Chai",
          "portion": "200ml",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil black tea with crushed cardamom and ginger; add milk and serve with roasted chana."
      ],
      "budgetTips": "Roasted chana costs under $0.60 per portion and provides 10g clean protein."
    }
  },
  {
    "dayNumber": 13,
    "dayTitle": "Day 13",
    "theme": "Vietnamese Street Noodles",
    "breakfast": {
      "id": "as-d13-b",
      "type": "breakfast",
      "title": "Cantonese Chicken & Ginger Rice Congee",
      "subtitle": "Slow-simmered silky rice porridge with shredded chicken, ginger slivers, and sesame",
      "image": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Bowl (350ml)",
      "prepTime": "15 Mins",
      "baseKcal": 380,
      "baseProtein": 26,
      "baseCarbs": 52,
      "baseFat": 6,
      "costUsd": 2.1,
      "ingredients": [
        {
          "id": "as-b2-1",
          "name": "Shredded Chicken Breast",
          "portion": "100g",
          "costUsd": 1.1
        },
        {
          "id": "as-b2-2",
          "name": "Fragrant White Rice",
          "portion": "60g raw",
          "costUsd": 0.35
        },
        {
          "id": "as-b2-3",
          "name": "Fresh Ginger & Garlic",
          "portion": "1 thumb",
          "costUsd": 0.3
        },
        {
          "id": "as-b2-4",
          "name": "Toasted Sesame Oil & Soy",
          "portion": "1 tsp",
          "costUsd": 0.35
        }
      ],
      "instructions": [
        "Simmer rice with chicken broth and ginger slices until broken down into a velvety porridge.",
        "Stir through tender shredded chicken breast and simmer for 3 minutes.",
        "Top with scallions and a drizzle of fragrant sesame oil."
      ],
      "budgetTips": "Congee stretches small portions of chicken and rice into a filling, gut-friendly breakfast."
    },
    "lunch": {
      "id": "as-d13-l",
      "type": "lunch",
      "title": "Vietnamese Chicken Pho Noodle Soup (Pho Ga)",
      "subtitle": "Clear aromatic chicken bone broth with star anise, rice noodles, tender chicken, and fresh herbs",
      "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Soup Bowl (500ml)",
      "prepTime": "20 Mins",
      "baseKcal": 510,
      "baseProtein": 40,
      "baseCarbs": 64,
      "baseFat": 9,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-l4-1",
          "name": "Poached Chicken Breast",
          "portion": "150g",
          "costUsd": 2.1
        },
        {
          "id": "as-l4-2",
          "name": "Flat Rice Pho Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l4-3",
          "name": "Aromatic Spiced Pho Broth",
          "portion": "2 cups",
          "costUsd": 0.75
        },
        {
          "id": "as-l4-4",
          "name": "Thai Basil, Jalapeño & Lime",
          "portion": "Generous herbs",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Simmer chicken broth with toasted star anise, cinnamon stick, ginger, and onion for deep aroma.",
        "Place warm rice noodles and sliced chicken into a deep bowl.",
        "Pour boiling broth over top; serve alongside fresh Thai basil, lime wedges, and bean sprouts."
      ],
      "budgetTips": "Pho broth is naturally hydrating, low in fat, and rich in collagen peptides."
    },
    "dinner": {
      "id": "as-d13-d",
      "type": "dinner",
      "title": "Szechuan Spiced Tofu & Edamame Vegetable Stir-Fry",
      "subtitle": "Crispy seared tofu cubes tossed with edamame, bell peppers, snow peas, and fragrant garlic sauce",
      "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Wok Bowl + Brown Rice",
      "prepTime": "15 Mins",
      "baseKcal": 480,
      "baseProtein": 32,
      "baseCarbs": 54,
      "baseFat": 14,
      "costUsd": 3.4,
      "ingredients": [
        {
          "id": "as-l12-1",
          "name": "Extra Firm Organic Tofu",
          "portion": "180g",
          "costUsd": 1.5
        },
        {
          "id": "as-l12-2",
          "name": "Shelled Edamame & Snow Peas",
          "portion": "1 cup",
          "costUsd": 1
        },
        {
          "id": "as-l12-3",
          "name": "Brown Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l12-4",
          "name": "Garlic Ginger Stir-Fry Sauce",
          "portion": "2 tbsp",
          "costUsd": 0.45
        }
      ],
      "instructions": [
        "Press tofu and cut into bite-sized cubes; sear in skillet until golden on all sides.",
        "Add vegetables and stir-fry for 3 minutes until crisp-tender.",
        "Pour sauce over top and toss until glossy."
      ],
      "budgetTips": "Plant-based protein meal costing under $3.50 with zero saturated cholesterol."
    },
    "snack": {
      "id": "as-d13-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  },
  {
    "dayNumber": 14,
    "dayTitle": "Day 14",
    "theme": "Tokyo Modern Athletic Bowls",
    "breakfast": {
      "id": "as-d14-b",
      "type": "breakfast",
      "title": "Japanese Ceremonial Matcha Protein Smoothie Bowl",
      "subtitle": "Chilled Japanese green tea matcha blended with frozen banana, soy milk, and chia seeds",
      "image": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Bowl (300ml)",
      "prepTime": "5 Mins",
      "baseKcal": 360,
      "baseProtein": 24,
      "baseCarbs": 46,
      "baseFat": 8,
      "costUsd": 2.75,
      "ingredients": [
        {
          "id": "as-b5-1",
          "name": "Japanese Matcha Powder",
          "portion": "1 tsp",
          "costUsd": 0.85
        },
        {
          "id": "as-b5-2",
          "name": "Soy / Almond Milk",
          "portion": "1 cup",
          "costUsd": 0.6
        },
        {
          "id": "as-b5-3",
          "name": "Ripe Cavendish Banana",
          "portion": "1 frozen",
          "costUsd": 0.35
        },
        {
          "id": "as-b5-4",
          "name": "Plant Protein & Chia Seeds",
          "portion": "20g",
          "costUsd": 0.95
        }
      ],
      "instructions": [
        "Blend frozen banana, matcha powder, plant protein, and soy milk until thick and creamy.",
        "Pour into a chilled bowl and top with chia seeds."
      ],
      "budgetTips": "Matcha delivers steady L-theanine energy without coffee crashes."
    },
    "lunch": {
      "id": "as-d14-l",
      "type": "lunch",
      "title": "Hawaiian-Japanese Salmon & Edamame Poke Bowl",
      "subtitle": "Fresh Atlantic salmon sashimi cubes over brown rice, edamame, cucumber, and spicy sesame ponzu",
      "image": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Poke Bowl (380g)",
      "prepTime": "10 Mins",
      "baseKcal": 570,
      "baseProtein": 42,
      "baseCarbs": 58,
      "baseFat": 18,
      "costUsd": 6.2,
      "ingredients": [
        {
          "id": "as-l8-1",
          "name": "Fresh Atlantic Salmon",
          "portion": "140g sashimi cut",
          "costUsd": 3.8
        },
        {
          "id": "as-l8-2",
          "name": "Brown Rice & Quinoa Blend",
          "portion": "1 cup cooked",
          "costUsd": 0.65
        },
        {
          "id": "as-l8-3",
          "name": "Shelled Edamame & Cucumber",
          "portion": "1 cup",
          "costUsd": 0.95
        },
        {
          "id": "as-l8-4",
          "name": "Sesame Ponzu Dressing",
          "portion": "2 tbsp",
          "costUsd": 0.8
        }
      ],
      "instructions": [
        "Cube fresh salmon and toss gently in ponzu sauce with sesame seeds.",
        "Layer warm brown rice into a bowl, arrange edamame, shredded cucumber, and salmon neatly.",
        "Top with nori strips and scallions."
      ],
      "budgetTips": "Buying whole salmon fillets and slicing at home costs one-third of commercial poke bowl shops."
    },
    "dinner": {
      "id": "as-d14-d",
      "type": "dinner",
      "title": "Japanese Shoyu Ramen with Chashu & Soft Egg",
      "subtitle": "Rich umami dashi-chicken broth with wavy ramen noodles, braised chicken, bamboo shoots, and marinated egg",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Ramen Bowl (500ml)",
      "prepTime": "22 Mins",
      "baseKcal": 590,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 16,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-d1-1",
          "name": "Braised Chicken Breast / Thigh",
          "portion": "140g",
          "costUsd": 1.95
        },
        {
          "id": "as-d1-2",
          "name": "Japanese Fresh Ramen Noodles",
          "portion": "100g",
          "costUsd": 0.85
        },
        {
          "id": "as-d1-3",
          "name": "Ajitsuke Marinated Soft Egg",
          "portion": "1 egg",
          "costUsd": 0.5
        },
        {
          "id": "as-d1-4",
          "name": "Shoyu Broth, Nori & Scallions",
          "portion": "Broth + garnish",
          "costUsd": 1.5
        }
      ],
      "instructions": [
        "Prepare aromatic shoyu broth with chicken stock, soy sauce, and kombu.",
        "Cook ramen noodles in boiling water for exactly 2 minutes and transfer into bowl.",
        "Pour broth, arrange sliced chicken, halved soft-boiled egg, nori sheet, and scallions."
      ],
      "budgetTips": "Authentic ramen made at home delivers restaurant taste at 75% savings."
    },
    "snack": {
      "id": "as-d14-s",
      "type": "snack",
      "title": "Steamed Sea Salt & Garlic Edamame Pods",
      "subtitle": "Warm tender green soybean pods dusted with flaky sea salt and cracked black pepper",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Medium Bowl (150g)",
      "prepTime": "5 Mins",
      "baseKcal": 180,
      "baseProtein": 17,
      "baseCarbs": 14,
      "baseFat": 6,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "as-s1-1",
          "name": "Whole Edamame Pods",
          "portion": "150g",
          "costUsd": 1.3
        },
        {
          "id": "as-s1-2",
          "name": "Sea Salt & Toasted Garlic",
          "portion": "Pinch",
          "costUsd": 0.3
        }
      ],
      "instructions": [
        "Steam edamame pods in salted water for 4 minutes. Drain and toss with sea salt."
      ],
      "budgetTips": "Complete plant protein snack with 8g of prebiotic dietary fiber per bowl."
    }
  },
  {
    "dayNumber": 15,
    "dayTitle": "Day 15",
    "theme": "Classic Chinese Lo Mein Feast",
    "breakfast": {
      "id": "as-d15-b",
      "type": "breakfast",
      "title": "Steamed Fluffy Bao with Egg & Scallion Filling",
      "subtitle": "Warm pillowy yeast bao buns stuffed with scrambled eggs, fresh green onions, and chili crisp",
      "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Steamed Buns",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 18,
      "baseCarbs": 56,
      "baseFat": 12,
      "costUsd": 2.25,
      "ingredients": [
        {
          "id": "as-b8-1",
          "name": "Fluffy Bao Buns",
          "portion": "2 buns",
          "costUsd": 0.95
        },
        {
          "id": "as-b8-2",
          "name": "Scrambled Eggs",
          "portion": "2 eggs",
          "costUsd": 0.6
        },
        {
          "id": "as-b8-3",
          "name": "Chili Crisp Oil & Scallions",
          "portion": "1 tbsp",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Steam buns in a bamboo steamer for 6 minutes until soft and warm.",
        "Stuff with softly scrambled eggs, fresh scallions, and a dash of chili oil."
      ],
      "budgetTips": "Bao buns freeze perfectly in large bags for quick 5-minute morning breakfasts."
    },
    "lunch": {
      "id": "as-d15-l",
      "type": "lunch",
      "title": "Chinese Chicken & Vegetable Lo Mein Noodles",
      "subtitle": "Wok-tossed egg noodles with shredded chicken, crunchy carrots, cabbage, and savory dark soy",
      "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Noodle Bowl",
      "prepTime": "14 Mins",
      "baseKcal": 550,
      "baseProtein": 38,
      "baseCarbs": 68,
      "baseFat": 14,
      "costUsd": 4.2,
      "ingredients": [
        {
          "id": "as-l9-1",
          "name": "Skinless Chicken Breast",
          "portion": "140g",
          "costUsd": 1.9
        },
        {
          "id": "as-l9-2",
          "name": "Egg Lo Mein Noodles",
          "portion": "80g dry",
          "costUsd": 0.7
        },
        {
          "id": "as-l9-3",
          "name": "Napa Cabbage, Carrots & Onion",
          "portion": "1.5 cups shredded",
          "costUsd": 0.85
        },
        {
          "id": "as-l9-4",
          "name": "Dark Soy, Oyster Sauce & Sesame",
          "portion": "2 tbsp",
          "costUsd": 0.75
        }
      ],
      "instructions": [
        "Boil noodles al dente for 3 minutes, drain and rinse in cold water.",
        "Stir-fry chicken strips in a smoking hot wok until cooked, toss in crisp vegetables.",
        "Add noodles and dark soy sauce mixture, tossing vigorously over high heat."
      ],
      "budgetTips": "Fast high-heat wok cooking preserves crisp vegetable vitamins and cuts cook time."
    },
    "dinner": {
      "id": "as-d15-d",
      "type": "dinner",
      "title": "Classic Kung Pao Chicken with Roasted Peanuts",
      "subtitle": "Seared chicken breast wok-tossed with roasted peanuts, zucchini, red peppers, and chili pods",
      "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate + Brown Rice",
      "prepTime": "16 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 54,
      "baseFat": 18,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-d3-1",
          "name": "Diced Chicken Breast",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-d3-2",
          "name": "Roasted Peanuts",
          "portion": "30g",
          "costUsd": 0.5
        },
        {
          "id": "as-d3-3",
          "name": "Zucchini, Bell Peppers & Chilies",
          "portion": "1.5 cups",
          "costUsd": 0.95
        },
        {
          "id": "as-d3-4",
          "name": "Brown Rice & Kung Pao Sauce",
          "portion": "1 cup rice",
          "costUsd": 0.75
        }
      ],
      "instructions": [
        "Marinate diced chicken with soy sauce and cornstarch.",
        "Sear chicken in hot wok, toss in bell peppers, zucchini, and dried red chilies.",
        "Pour Kung Pao sauce over, fold in crunchy peanuts, and serve over warm brown rice."
      ],
      "budgetTips": "Peanuts add healthy monounsaturated fats and satisfying crunch for pennies."
    },
    "snack": {
      "id": "as-d15-s",
      "type": "snack",
      "title": "Fresh Tropical Papaya & Lychee Bowl",
      "subtitle": "Chilled fresh papaya wedges and sweet lychees with a squeeze of fresh lime juice",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (180g)",
      "prepTime": "3 Mins",
      "baseKcal": 140,
      "baseProtein": 2,
      "baseCarbs": 34,
      "baseFat": 0.5,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "as-s5-1",
          "name": "Fresh Papaya & Lychee",
          "portion": "180g",
          "costUsd": 1.35
        },
        {
          "id": "as-s5-2",
          "name": "Lime Wedge & Mint",
          "portion": "Garnish",
          "costUsd": 0.15
        }
      ],
      "instructions": [
        "Slice ripe chilled papaya and serve with lime juice and mint."
      ],
      "budgetTips": "Papaya contains papain enzymes that actively aid post-workout protein digestion."
    }
  },
  {
    "dayNumber": 16,
    "dayTitle": "Day 16",
    "theme": "Thai Lemongrass & Green Curry",
    "breakfast": {
      "id": "as-d16-b",
      "type": "breakfast",
      "title": "Thai Mango & Coconut Chia Seed Pudding",
      "subtitle": "Overnight chia seeds steeped in light coconut milk topped with sweet fresh mango cubes",
      "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Glass Jar (250g)",
      "prepTime": "5 Mins (Overnight)",
      "baseKcal": 350,
      "baseProtein": 12,
      "baseCarbs": 44,
      "baseFat": 14,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "as-b6-1",
          "name": "Organic Chia Seeds",
          "portion": "3 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-b6-2",
          "name": "Light Coconut Milk",
          "portion": "1 cup",
          "costUsd": 0.8
        },
        {
          "id": "as-b6-3",
          "name": "Fresh Sweet Mango",
          "portion": "1/2 cup diced",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Whisk chia seeds into light coconut milk with a hint of vanilla.",
        "Refrigerate overnight until thick and spoon fresh mango cubes over top."
      ],
      "budgetTips": "Chia provides 100% daily plant-based omega-3 alpha-linolenic acid."
    },
    "lunch": {
      "id": "as-d16-l",
      "type": "lunch",
      "title": "Authentic Thai Pad Thai with Tofu & Shrimp",
      "subtitle": "Stir-fried flat rice noodles tossed with tamarind sauce, bean sprouts, crushed peanuts, and lime",
      "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate (380g)",
      "prepTime": "15 Mins",
      "baseKcal": 540,
      "baseProtein": 34,
      "baseCarbs": 72,
      "baseFat": 13,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-l3-1",
          "name": "Firm Tofu & Tail-on Shrimp",
          "portion": "140g mixed",
          "costUsd": 2.3
        },
        {
          "id": "as-l3-2",
          "name": "Flat Rice Pad Thai Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-3",
          "name": "Bean Sprouts & Scallions",
          "portion": "1 cup",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-4",
          "name": "Tamarind Sauce, Peanuts & Lime",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Soak rice noodles in warm water until pliable.",
        "Sear tofu cubes and shrimp in a hot wok; push aside and scramble an egg.",
        "Toss in drained noodles with tamarind sauce, bean sprouts, and roasted crushed peanuts."
      ],
      "budgetTips": "Combining tofu with shrimp gives complete seafood flavor while cutting total protein cost in half."
    },
    "dinner": {
      "id": "as-d16-d",
      "type": "dinner",
      "title": "Thai Green Coconut Chicken Curry with Jasmine Rice",
      "subtitle": "Fragrant coconut milk curry with chicken, Thai eggplants, bamboo shoots, and kaffir lime leaves",
      "image": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Curry Bowl + 1 Cup Rice",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 40,
      "baseCarbs": 58,
      "baseFat": 20,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-d2-1",
          "name": "Chicken Breast Slices",
          "portion": "150g",
          "costUsd": 2.1
        },
        {
          "id": "as-d2-2",
          "name": "Coconut Milk (Light)",
          "portion": "1 cup",
          "costUsd": 1
        },
        {
          "id": "as-d2-3",
          "name": "Green Curry Paste & Thai Basil",
          "portion": "2 tbsp",
          "costUsd": 0.8
        },
        {
          "id": "as-d2-4",
          "name": "Bamboo Shoots & Steamed Rice",
          "portion": "1 cup rice",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Fry green curry paste in coconut cream until fragrant and oils separate.",
        "Add chicken and bamboo shoots; simmer gently in coconut milk for 10 minutes.",
        "Finish with kaffir lime leaves and Thai basil; serve with jasmine rice."
      ],
      "budgetTips": "Medium-chain triglycerides (MCTs) in coconut milk provide quick metabolic energy."
    },
    "snack": {
      "id": "as-d16-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  },
  {
    "dayNumber": 17,
    "dayTitle": "Day 17",
    "theme": "Korean BBQ & Steamed Greens",
    "breakfast": {
      "id": "as-d17-b",
      "type": "breakfast",
      "title": "Korean Scallion & Egg Kimchi Pancake (Pajeon)",
      "subtitle": "Crispy savory pancake with fresh scallions, aged kimchi, and beaten egg topping",
      "image": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Medium Wedges",
      "prepTime": "12 Mins",
      "baseKcal": 390,
      "baseProtein": 18,
      "baseCarbs": 54,
      "baseFat": 11,
      "costUsd": 2.3,
      "ingredients": [
        {
          "id": "as-b4-1",
          "name": "Green Scallions (Pa)",
          "portion": "4 stalks",
          "costUsd": 0.6
        },
        {
          "id": "as-b4-2",
          "name": "Aged Kimchi",
          "portion": "1/2 cup",
          "costUsd": 0.75
        },
        {
          "id": "as-b4-3",
          "name": "Farm Egg",
          "portion": "1 egg",
          "costUsd": 0.3
        },
        {
          "id": "as-b4-4",
          "name": "Whole Grain Flour & Sesame",
          "portion": "60g",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Mix whole grain flour with icy water, sliced scallions, and chopped kimchi.",
        "Pan-fry until crisp; crack an egg on top and flip to seal until golden."
      ],
      "budgetTips": "Fermented kimchi supports gut microbiota and adds intense natural flavor without extra salt."
    },
    "lunch": {
      "id": "as-d17-l",
      "type": "lunch",
      "title": "Korean Rainbow Bibimbap Bowl with Lean Beef",
      "subtitle": "Warm rice layered with seasoned spinach, carrots, bean sprouts, lean beef, and sunny egg",
      "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Hot Bowl",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 15,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-l2-1",
          "name": "Lean Ground Beef (90/10)",
          "portion": "120g",
          "costUsd": 1.95
        },
        {
          "id": "as-l2-2",
          "name": "Steamed Short Grain Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l2-3",
          "name": "Spinach, Carrots & Bean Sprouts",
          "portion": "1.5 cups sautéed",
          "costUsd": 1.2
        },
        {
          "id": "as-l2-4",
          "name": "Sunny Side Up Egg & Gochujang",
          "portion": "1 egg + 1 tbsp",
          "costUsd": 1.3
        }
      ],
      "instructions": [
        "Briefly sauté seasoned beef with garlic and light soy sauce.",
        "Blanch spinach and bean sprouts; toss each with sesame oil and salt.",
        "Assemble warm rice in a bowl, arrange vibrant vegetables in radial sections, and crown with egg."
      ],
      "budgetTips": "Bibimbap is the gold standard for getting 5 different vegetable colors into a single meal."
    },
    "dinner": {
      "id": "as-d17-d",
      "type": "dinner",
      "title": "Japanese Miso Glazed Salmon with Steamed Rice",
      "subtitle": "Oven-roasted wild salmon fillet brushed with sweet white miso glaze, served with baby bok choy",
      "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Salmon Fillet + Rice & Greens",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 42,
      "baseCarbs": 46,
      "baseFat": 20,
      "costUsd": 6.4,
      "ingredients": [
        {
          "id": "as-d7-1",
          "name": "Atlantic Salmon Fillet",
          "portion": "160g",
          "costUsd": 4.2
        },
        {
          "id": "as-d7-2",
          "name": "Sweet White Miso Glaze",
          "portion": "1.5 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-d7-3",
          "name": "Steamed Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.6
        },
        {
          "id": "as-d7-4",
          "name": "Steamed Baby Bok Choy",
          "portion": "1 bunch",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Mix white miso, mirin, and a dash of honey into a paste; spread over salmon.",
        "Broil on high for 7-8 minutes until caramelized and flaky.",
        "Serve hot with steamed rice and tender bok choy."
      ],
      "budgetTips": "Miso fermentation creates rich natural glutamates for intense umami without heavy fats."
    },
    "snack": {
      "id": "as-d17-s",
      "type": "snack",
      "title": "Toasted Asian Spiced Cashews & Almonds",
      "subtitle": "Oven-roasted whole cashews and almonds coated in tamari soy, sesame, and chili flakes",
      "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
      "servingSize": "Handful (40g)",
      "prepTime": "3 Mins",
      "baseKcal": 240,
      "baseProtein": 8,
      "baseCarbs": 10,
      "baseFat": 19,
      "costUsd": 1.4,
      "ingredients": [
        {
          "id": "as-s3-1",
          "name": "Roasted Cashews & Almonds",
          "portion": "40g",
          "costUsd": 1.2
        },
        {
          "id": "as-s3-2",
          "name": "Tamari Soy & Sesame Seeds",
          "portion": "1 tsp",
          "costUsd": 0.2
        }
      ],
      "instructions": [
        "Toss nuts in tamari and sesame seeds, roast lightly until fragrant."
      ],
      "budgetTips": "Convenient healthy fat source providing sustained physical energy."
    }
  },
  {
    "dayNumber": 18,
    "dayTitle": "Day 18",
    "theme": "Indian Lentil Power Bowl",
    "breakfast": {
      "id": "as-d18-b",
      "type": "breakfast",
      "title": "South Indian Steamed Idlis with Vegetable Sambar",
      "subtitle": "Light fermented steamed rice-lentil cakes paired with protein-rich spiced lentil stew",
      "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
      "servingSize": "3 Idlis + 1 Bowl Sambar",
      "prepTime": "12 Mins",
      "baseKcal": 380,
      "baseProtein": 16,
      "baseCarbs": 66,
      "baseFat": 4,
      "costUsd": 1.9,
      "ingredients": [
        {
          "id": "as-b7-1",
          "name": "Steamed Idlis",
          "portion": "3 pieces",
          "costUsd": 0.75
        },
        {
          "id": "as-b7-2",
          "name": "Toor Dal Sambar Stew",
          "portion": "1 bowl",
          "costUsd": 0.75
        },
        {
          "id": "as-b7-3",
          "name": "Mixed Vegetables & Curry Leaves",
          "portion": "1 cup",
          "costUsd": 0.4
        }
      ],
      "instructions": [
        "Steam idli batter until light and fluffy.",
        "Simmer toor dal with pumpkin, drumstick, sambar spices, and curry leaves.",
        "Dip hot idlis into the steaming lentil sambar."
      ],
      "budgetTips": "Idlis are naturally gluten-free, low-fat, and exceptionally easy to digest."
    },
    "lunch": {
      "id": "as-d18-l",
      "type": "lunch",
      "title": "Indian Dal Tadka with Fragrant Basmati Rice",
      "subtitle": "Golden yellow lentils tempered with cumin, garlic, and ghee, served over aged basmati rice",
      "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Bowl Dal + 1 Cup Basmati",
      "prepTime": "20 Mins",
      "baseKcal": 520,
      "baseProtein": 24,
      "baseCarbs": 84,
      "baseFat": 10,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "as-l6-1",
          "name": "Yellow Moong & Toor Lentils",
          "portion": "80g raw",
          "costUsd": 0.75
        },
        {
          "id": "as-l6-2",
          "name": "Long-Grain Aged Basmati Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.6
        },
        {
          "id": "as-l6-3",
          "name": "Cumin, Garlic, Tomato & Ghee Tadka",
          "portion": "1 tbsp",
          "costUsd": 0.65
        },
        {
          "id": "as-l6-4",
          "name": "Fresh Lemon & Coriander",
          "portion": "Garnish",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil lentils with water, turmeric, and sea salt until soft and creamy.",
        "In a small ladle, heat ghee with cumin seeds, sliced garlic, and dry chili until aromatic.",
        "Pour sizzled tadka over lentils; serve steaming over fluffy basmati rice."
      ],
      "budgetTips": "Lentils and rice form a complete protein containing all 9 essential amino acids at unmatched low cost."
    },
    "dinner": {
      "id": "as-d18-d",
      "type": "dinner",
      "title": "Tandoori Chicken Tikka with Grilled Bell Peppers",
      "subtitle": "Char-grilled yogurt-marinated chicken breast skewers with grilled onions and mint chutney",
      "image": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Large Skewers + 1 Roti",
      "prepTime": "18 Mins",
      "baseKcal": 510,
      "baseProtein": 48,
      "baseCarbs": 36,
      "baseFat": 14,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-d5-1",
          "name": "Boneless Chicken Breast Chunks",
          "portion": "180g",
          "costUsd": 2.4
        },
        {
          "id": "as-d5-2",
          "name": "Bell Peppers & Red Onion",
          "portion": "1 cup sliced",
          "costUsd": 0.8
        },
        {
          "id": "as-d5-3",
          "name": "Whole Wheat Roti",
          "portion": "1 piece",
          "costUsd": 0.4
        },
        {
          "id": "as-d5-4",
          "name": "Mint Cilantro Chutney",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Coat chicken in Greek yogurt, Kashmiri chili, ginger, and garam masala.",
        "Thread onto skewers with onion and pepper chunks; broil or grill until lightly charred.",
        "Serve piping hot with whole wheat roti and fresh mint chutney."
      ],
      "budgetTips": "One of the highest protein-to-calorie ratios among all global cuisines."
    },
    "snack": {
      "id": "as-d18-s",
      "type": "snack",
      "title": "Cardamom Masala Chai with Roasted Chana",
      "subtitle": "Slow-brewed spiced black tea with milk and crushed cardamom, paired with crunchy roasted chickpeas",
      "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Cup Chai + 1 Small Bowl Chana",
      "prepTime": "6 Mins",
      "baseKcal": 220,
      "baseProtein": 12,
      "baseCarbs": 32,
      "baseFat": 4.5,
      "costUsd": 1.1,
      "ingredients": [
        {
          "id": "as-s4-1",
          "name": "Roasted Bengal Gram Chana",
          "portion": "50g",
          "costUsd": 0.5
        },
        {
          "id": "as-s4-2",
          "name": "Spiced Milk Chai",
          "portion": "200ml",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil black tea with crushed cardamom and ginger; add milk and serve with roasted chana."
      ],
      "budgetTips": "Roasted chana costs under $0.60 per portion and provides 10g clean protein."
    }
  },
  {
    "dayNumber": 19,
    "dayTitle": "Day 19",
    "theme": "Hanoi Fragrant Noodle Soup",
    "breakfast": {
      "id": "as-d19-b",
      "type": "breakfast",
      "title": "Vietnamese Scrambled Eggs with Spring Onion & Baguette",
      "subtitle": "Silky soft scrambled eggs tossed with nuoc cham, scallions, and crisp whole grain baguette",
      "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Eggs + 1 Mini Baguette",
      "prepTime": "8 Mins",
      "baseKcal": 400,
      "baseProtein": 21,
      "baseCarbs": 45,
      "baseFat": 14,
      "costUsd": 2.15,
      "ingredients": [
        {
          "id": "as-b9-1",
          "name": "Fresh Eggs",
          "portion": "2 eggs",
          "costUsd": 0.55
        },
        {
          "id": "as-b9-2",
          "name": "Crusty Baguette",
          "portion": "1 roll",
          "costUsd": 0.7
        },
        {
          "id": "as-b9-3",
          "name": "Shallots, Herbs & Light Soy",
          "portion": "Handful",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Scramble eggs gently over medium heat with shallots and light seasoning.",
        "Serve warm tucked into freshly toasted crusty bread."
      ],
      "budgetTips": "Combines French-Vietnamese street food heritage with high protein."
    },
    "lunch": {
      "id": "as-d19-l",
      "type": "lunch",
      "title": "Vietnamese Chicken Pho Noodle Soup (Pho Ga)",
      "subtitle": "Clear aromatic chicken bone broth with star anise, rice noodles, tender chicken, and fresh herbs",
      "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Soup Bowl (500ml)",
      "prepTime": "20 Mins",
      "baseKcal": 510,
      "baseProtein": 40,
      "baseCarbs": 64,
      "baseFat": 9,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-l4-1",
          "name": "Poached Chicken Breast",
          "portion": "150g",
          "costUsd": 2.1
        },
        {
          "id": "as-l4-2",
          "name": "Flat Rice Pho Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l4-3",
          "name": "Aromatic Spiced Pho Broth",
          "portion": "2 cups",
          "costUsd": 0.75
        },
        {
          "id": "as-l4-4",
          "name": "Thai Basil, Jalapeño & Lime",
          "portion": "Generous herbs",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Simmer chicken broth with toasted star anise, cinnamon stick, ginger, and onion for deep aroma.",
        "Place warm rice noodles and sliced chicken into a deep bowl.",
        "Pour boiling broth over top; serve alongside fresh Thai basil, lime wedges, and bean sprouts."
      ],
      "budgetTips": "Pho broth is naturally hydrating, low in fat, and rich in collagen peptides."
    },
    "dinner": {
      "id": "as-d19-d",
      "type": "dinner",
      "title": "Vietnamese Lemongrass Chicken Salad (Goi Ga)",
      "subtitle": "Shredded chicken tossed with crisp green cabbage, mint, cilantro, roasted peanuts, and lime dressing",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Huge Salad Bowl",
      "prepTime": "12 Mins",
      "baseKcal": 440,
      "baseProtein": 44,
      "baseCarbs": 24,
      "baseFat": 18,
      "costUsd": 4.1,
      "ingredients": [
        {
          "id": "as-l10-1",
          "name": "Poached Shredded Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-l10-2",
          "name": "Green & Red Shredded Cabbage",
          "portion": "2 cups",
          "costUsd": 0.7
        },
        {
          "id": "as-l10-3",
          "name": "Fresh Mint, Cilantro & Peanuts",
          "portion": "Handful",
          "costUsd": 0.65
        },
        {
          "id": "as-l10-4",
          "name": "Lime, Garlic & Chili Dressing",
          "portion": "2 tbsp",
          "costUsd": 0.55
        }
      ],
      "instructions": [
        "Shred chicken breast and place in a mixing bowl with thinly shaved cabbage.",
        "Toss with mint, cilantro, and fresh lime dressing.",
        "Garnish with crushed roasted peanuts for texture."
      ],
      "budgetTips": "Extremely low-carb, nutrient-dense lunch that keeps insulin levels perfectly stable."
    },
    "snack": {
      "id": "as-d19-s",
      "type": "snack",
      "title": "Fresh Tropical Papaya & Lychee Bowl",
      "subtitle": "Chilled fresh papaya wedges and sweet lychees with a squeeze of fresh lime juice",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (180g)",
      "prepTime": "3 Mins",
      "baseKcal": 140,
      "baseProtein": 2,
      "baseCarbs": 34,
      "baseFat": 0.5,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "as-s5-1",
          "name": "Fresh Papaya & Lychee",
          "portion": "180g",
          "costUsd": 1.35
        },
        {
          "id": "as-s5-2",
          "name": "Lime Wedge & Mint",
          "portion": "Garnish",
          "costUsd": 0.15
        }
      ],
      "instructions": [
        "Slice ripe chilled papaya and serve with lime juice and mint."
      ],
      "budgetTips": "Papaya contains papain enzymes that actively aid post-workout protein digestion."
    }
  },
  {
    "dayNumber": 20,
    "dayTitle": "Day 20",
    "theme": "Japanese Teriyaki & Gyoza",
    "breakfast": {
      "id": "as-d20-b",
      "type": "breakfast",
      "title": "Japanese Rolled Tamagoyaki with Miso & Rice",
      "subtitle": "Fluffy sweet-savory rolled dashi eggs served with warm jasmine rice and scallions",
      "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
      "servingSize": "3 Egg Rolls + 1 Cup Steamed Rice",
      "prepTime": "12 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 48,
      "baseFat": 14,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-b1-1",
          "name": "Cage-Free Eggs",
          "portion": "3 eggs",
          "costUsd": 0.8
        },
        {
          "id": "as-b1-2",
          "name": "Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.4
        },
        {
          "id": "as-b1-3",
          "name": "Dashi & Mirin Seasoning",
          "portion": "1 tbsp",
          "costUsd": 0.5
        },
        {
          "id": "as-b1-4",
          "name": "Green Scallions & Nori",
          "portion": "Handful",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Whisk eggs with dashi, mirin, and a pinch of sea salt.",
        "Pour thin layers into a non-stick pan, rolling gradually into a fluffy cylinder.",
        "Serve warm alongside steamed jasmine rice and garnish with chopped scallions."
      ],
      "budgetTips": "Eggs provide bioavailable protein while jasmine rice bought in bulk is very economical."
    },
    "lunch": {
      "id": "as-d20-l",
      "type": "lunch",
      "title": "Japanese Glazed Chicken Teriyaki Bowl",
      "subtitle": "Tender pan-seared chicken thighs in house-made ginger mirin glaze over steamed rice and broccoli",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Rice Bowl (400g)",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 62,
      "baseFat": 14,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-l1-1",
          "name": "Boneless Skinless Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-l1-2",
          "name": "Jasmine White / Brown Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l1-3",
          "name": "Fresh Steamed Broccoli",
          "portion": "1 cup florets",
          "costUsd": 0.9
        },
        {
          "id": "as-l1-4",
          "name": "Teriyaki Sauce & Sesame",
          "portion": "2 tbsp",
          "costUsd": 1.25
        }
      ],
      "instructions": [
        "Sear chicken in a hot skillet until golden brown on both sides.",
        "Add soy sauce, mirin, and grated ginger; simmer until sauce turns into a glossy lacquer.",
        "Slice chicken and arrange over warm rice with steamed broccoli and sesame seeds."
      ],
      "budgetTips": "Making your own teriyaki glaze with soy sauce, mirin, and honey costs 70% less than store jars."
    },
    "dinner": {
      "id": "as-d20-d",
      "type": "dinner",
      "title": "Japanese Shoyu Ramen with Chashu & Soft Egg",
      "subtitle": "Rich umami dashi-chicken broth with wavy ramen noodles, braised chicken, bamboo shoots, and marinated egg",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Ramen Bowl (500ml)",
      "prepTime": "22 Mins",
      "baseKcal": 590,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 16,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-d1-1",
          "name": "Braised Chicken Breast / Thigh",
          "portion": "140g",
          "costUsd": 1.95
        },
        {
          "id": "as-d1-2",
          "name": "Japanese Fresh Ramen Noodles",
          "portion": "100g",
          "costUsd": 0.85
        },
        {
          "id": "as-d1-3",
          "name": "Ajitsuke Marinated Soft Egg",
          "portion": "1 egg",
          "costUsd": 0.5
        },
        {
          "id": "as-d1-4",
          "name": "Shoyu Broth, Nori & Scallions",
          "portion": "Broth + garnish",
          "costUsd": 1.5
        }
      ],
      "instructions": [
        "Prepare aromatic shoyu broth with chicken stock, soy sauce, and kombu.",
        "Cook ramen noodles in boiling water for exactly 2 minutes and transfer into bowl.",
        "Pour broth, arrange sliced chicken, halved soft-boiled egg, nori sheet, and scallions."
      ],
      "budgetTips": "Authentic ramen made at home delivers restaurant taste at 75% savings."
    },
    "snack": {
      "id": "as-d20-s",
      "type": "snack",
      "title": "Steamed Sea Salt & Garlic Edamame Pods",
      "subtitle": "Warm tender green soybean pods dusted with flaky sea salt and cracked black pepper",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Medium Bowl (150g)",
      "prepTime": "5 Mins",
      "baseKcal": 180,
      "baseProtein": 17,
      "baseCarbs": 14,
      "baseFat": 6,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "as-s1-1",
          "name": "Whole Edamame Pods",
          "portion": "150g",
          "costUsd": 1.3
        },
        {
          "id": "as-s1-2",
          "name": "Sea Salt & Toasted Garlic",
          "portion": "Pinch",
          "costUsd": 0.3
        }
      ],
      "instructions": [
        "Steam edamame pods in salted water for 4 minutes. Drain and toss with sea salt."
      ],
      "budgetTips": "Complete plant protein snack with 8g of prebiotic dietary fiber per bowl."
    }
  },
  {
    "dayNumber": 21,
    "dayTitle": "Day 21",
    "theme": "Cantonese Wok Fried Rice",
    "breakfast": {
      "id": "as-d21-b",
      "type": "breakfast",
      "title": "Cantonese Chicken & Ginger Rice Congee",
      "subtitle": "Slow-simmered silky rice porridge with shredded chicken, ginger slivers, and sesame",
      "image": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Bowl (350ml)",
      "prepTime": "15 Mins",
      "baseKcal": 380,
      "baseProtein": 26,
      "baseCarbs": 52,
      "baseFat": 6,
      "costUsd": 2.1,
      "ingredients": [
        {
          "id": "as-b2-1",
          "name": "Shredded Chicken Breast",
          "portion": "100g",
          "costUsd": 1.1
        },
        {
          "id": "as-b2-2",
          "name": "Fragrant White Rice",
          "portion": "60g raw",
          "costUsd": 0.35
        },
        {
          "id": "as-b2-3",
          "name": "Fresh Ginger & Garlic",
          "portion": "1 thumb",
          "costUsd": 0.3
        },
        {
          "id": "as-b2-4",
          "name": "Toasted Sesame Oil & Soy",
          "portion": "1 tsp",
          "costUsd": 0.35
        }
      ],
      "instructions": [
        "Simmer rice with chicken broth and ginger slices until broken down into a velvety porridge.",
        "Stir through tender shredded chicken breast and simmer for 3 minutes.",
        "Top with scallions and a drizzle of fragrant sesame oil."
      ],
      "budgetTips": "Congee stretches small portions of chicken and rice into a filling, gut-friendly breakfast."
    },
    "lunch": {
      "id": "as-d21-l",
      "type": "lunch",
      "title": "Steamed Chicken & Vegetable Dim Sum Dumplings",
      "subtitle": "Handcrafted steamed dumplings packed with lean chicken and cabbage served with spicy dipping soy",
      "image": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "8 Dumplings + Dipping Greens",
      "prepTime": "15 Mins",
      "baseKcal": 480,
      "baseProtein": 32,
      "baseCarbs": 58,
      "baseFat": 12,
      "costUsd": 3.9,
      "ingredients": [
        {
          "id": "as-l5-1",
          "name": "Chicken & Napa Cabbage Dumplings",
          "portion": "8 pieces",
          "costUsd": 2.4
        },
        {
          "id": "as-l5-2",
          "name": "Steamed Baby Bok Choy",
          "portion": "1 bunch",
          "costUsd": 0.8
        },
        {
          "id": "as-l5-3",
          "name": "Black Vinegar & Chili Soy Dip",
          "portion": "2 tbsp",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Steam dumplings in a bamboo or metal steamer for 8 minutes until translucent.",
        "Steam baby bok choy for 2 minutes alongside.",
        "Serve with Zhenjiang black vinegar, light soy sauce, and fresh ginger strips."
      ],
      "budgetTips": "Steaming locks in micronutrients without adding extra cooking oil or fats."
    },
    "dinner": {
      "id": "as-d21-d",
      "type": "dinner",
      "title": "Yangzhou Wok-Fried Rice with Chicken & Edamame",
      "subtitle": "Jasmine rice stir-fried in a hot wok with scrambled eggs, chicken breast, edamame, and scallions",
      "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Wok Bowl (400g)",
      "prepTime": "14 Mins",
      "baseKcal": 540,
      "baseProtein": 38,
      "baseCarbs": 68,
      "baseFat": 12,
      "costUsd": 3.8,
      "ingredients": [
        {
          "id": "as-d8-1",
          "name": "Diced Chicken Breast",
          "portion": "120g",
          "costUsd": 1.65
        },
        {
          "id": "as-d8-2",
          "name": "Day-Old Jasmine Rice",
          "portion": "1.5 cups cooked",
          "costUsd": 0.5
        },
        {
          "id": "as-d8-3",
          "name": "Farm Eggs",
          "portion": "2 eggs",
          "costUsd": 0.6
        },
        {
          "id": "as-d8-4",
          "name": "Edamame, Carrots & Green Onions",
          "portion": "1 cup",
          "costUsd": 1.05
        }
      ],
      "instructions": [
        "Scramble eggs in hot oil and remove.",
        "Stir-fry chicken and vegetables, then add cold day-old rice, breaking clumps over high heat.",
        "Fold in eggs, scallions, and light soy sauce; toss until fragrant."
      ],
      "budgetTips": "Day-old cold rice has increased resistant starch, lowering glycemic spike."
    },
    "snack": {
      "id": "as-d21-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  },
  {
    "dayNumber": 22,
    "dayTitle": "Day 22",
    "theme": "Bangkok Spicy Basil & Jasmine",
    "breakfast": {
      "id": "as-d22-b",
      "type": "breakfast",
      "title": "Thai Mango & Coconut Chia Seed Pudding",
      "subtitle": "Overnight chia seeds steeped in light coconut milk topped with sweet fresh mango cubes",
      "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Glass Jar (250g)",
      "prepTime": "5 Mins (Overnight)",
      "baseKcal": 350,
      "baseProtein": 12,
      "baseCarbs": 44,
      "baseFat": 14,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "as-b6-1",
          "name": "Organic Chia Seeds",
          "portion": "3 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-b6-2",
          "name": "Light Coconut Milk",
          "portion": "1 cup",
          "costUsd": 0.8
        },
        {
          "id": "as-b6-3",
          "name": "Fresh Sweet Mango",
          "portion": "1/2 cup diced",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Whisk chia seeds into light coconut milk with a hint of vanilla.",
        "Refrigerate overnight until thick and spoon fresh mango cubes over top."
      ],
      "budgetTips": "Chia provides 100% daily plant-based omega-3 alpha-linolenic acid."
    },
    "lunch": {
      "id": "as-d22-l",
      "type": "lunch",
      "title": "Thai Holy Basil Chicken (Pad Krapow Gai)",
      "subtitle": "Minced lean chicken wok-fried with garlic, birds eye chilies, holy basil, and sunny fried egg",
      "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Plate Chicken + 1 Cup Jasmine Rice",
      "prepTime": "12 Mins",
      "baseKcal": 560,
      "baseProtein": 42,
      "baseCarbs": 56,
      "baseFat": 18,
      "costUsd": 4.3,
      "ingredients": [
        {
          "id": "as-l11-1",
          "name": "Lean Minced Chicken",
          "portion": "160g",
          "costUsd": 2.1
        },
        {
          "id": "as-l11-2",
          "name": "Steamed Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l11-3",
          "name": "Thai Holy Basil Leaves & Garlic",
          "portion": "Handful",
          "costUsd": 0.85
        },
        {
          "id": "as-l11-4",
          "name": "Crispy Fried Egg",
          "portion": "1 egg",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Pound garlic and chilies in a mortar and fry in hot oil until fragrant.",
        "Add minced chicken and stir-fry rapidly with oyster sauce and fish sauce.",
        "Toss in fresh basil leaves off the heat until wilted; serve over rice with a crispy fried egg."
      ],
      "budgetTips": "Thailand's most famous everyday athletic lunch, packed with flavor and high protein."
    },
    "dinner": {
      "id": "as-d22-d",
      "type": "dinner",
      "title": "Authentic Thai Pad Thai with Tofu & Shrimp",
      "subtitle": "Stir-fried flat rice noodles tossed with tamarind sauce, bean sprouts, crushed peanuts, and lime",
      "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate (380g)",
      "prepTime": "15 Mins",
      "baseKcal": 540,
      "baseProtein": 34,
      "baseCarbs": 72,
      "baseFat": 13,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-l3-1",
          "name": "Firm Tofu & Tail-on Shrimp",
          "portion": "140g mixed",
          "costUsd": 2.3
        },
        {
          "id": "as-l3-2",
          "name": "Flat Rice Pad Thai Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-3",
          "name": "Bean Sprouts & Scallions",
          "portion": "1 cup",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-4",
          "name": "Tamarind Sauce, Peanuts & Lime",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Soak rice noodles in warm water until pliable.",
        "Sear tofu cubes and shrimp in a hot wok; push aside and scramble an egg.",
        "Toss in drained noodles with tamarind sauce, bean sprouts, and roasted crushed peanuts."
      ],
      "budgetTips": "Combining tofu with shrimp gives complete seafood flavor while cutting total protein cost in half."
    },
    "snack": {
      "id": "as-d22-s",
      "type": "snack",
      "title": "Fresh Tropical Papaya & Lychee Bowl",
      "subtitle": "Chilled fresh papaya wedges and sweet lychees with a squeeze of fresh lime juice",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (180g)",
      "prepTime": "3 Mins",
      "baseKcal": 140,
      "baseProtein": 2,
      "baseCarbs": 34,
      "baseFat": 0.5,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "as-s5-1",
          "name": "Fresh Papaya & Lychee",
          "portion": "180g",
          "costUsd": 1.35
        },
        {
          "id": "as-s5-2",
          "name": "Lime Wedge & Mint",
          "portion": "Garnish",
          "costUsd": 0.15
        }
      ],
      "instructions": [
        "Slice ripe chilled papaya and serve with lime juice and mint."
      ],
      "budgetTips": "Papaya contains papain enzymes that actively aid post-workout protein digestion."
    }
  },
  {
    "dayNumber": 23,
    "dayTitle": "Day 23",
    "theme": "Seoul Kimchi Stew & Crisp Tofu",
    "breakfast": {
      "id": "as-d23-b",
      "type": "breakfast",
      "title": "Korean Scallion & Egg Kimchi Pancake (Pajeon)",
      "subtitle": "Crispy savory pancake with fresh scallions, aged kimchi, and beaten egg topping",
      "image": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Medium Wedges",
      "prepTime": "12 Mins",
      "baseKcal": 390,
      "baseProtein": 18,
      "baseCarbs": 54,
      "baseFat": 11,
      "costUsd": 2.3,
      "ingredients": [
        {
          "id": "as-b4-1",
          "name": "Green Scallions (Pa)",
          "portion": "4 stalks",
          "costUsd": 0.6
        },
        {
          "id": "as-b4-2",
          "name": "Aged Kimchi",
          "portion": "1/2 cup",
          "costUsd": 0.75
        },
        {
          "id": "as-b4-3",
          "name": "Farm Egg",
          "portion": "1 egg",
          "costUsd": 0.3
        },
        {
          "id": "as-b4-4",
          "name": "Whole Grain Flour & Sesame",
          "portion": "60g",
          "costUsd": 0.65
        }
      ],
      "instructions": [
        "Mix whole grain flour with icy water, sliced scallions, and chopped kimchi.",
        "Pan-fry until crisp; crack an egg on top and flip to seal until golden."
      ],
      "budgetTips": "Fermented kimchi supports gut microbiota and adds intense natural flavor without extra salt."
    },
    "lunch": {
      "id": "as-d23-l",
      "type": "lunch",
      "title": "Szechuan Spiced Tofu & Edamame Vegetable Stir-Fry",
      "subtitle": "Crispy seared tofu cubes tossed with edamame, bell peppers, snow peas, and fragrant garlic sauce",
      "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Wok Bowl + Brown Rice",
      "prepTime": "15 Mins",
      "baseKcal": 480,
      "baseProtein": 32,
      "baseCarbs": 54,
      "baseFat": 14,
      "costUsd": 3.4,
      "ingredients": [
        {
          "id": "as-l12-1",
          "name": "Extra Firm Organic Tofu",
          "portion": "180g",
          "costUsd": 1.5
        },
        {
          "id": "as-l12-2",
          "name": "Shelled Edamame & Snow Peas",
          "portion": "1 cup",
          "costUsd": 1
        },
        {
          "id": "as-l12-3",
          "name": "Brown Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l12-4",
          "name": "Garlic Ginger Stir-Fry Sauce",
          "portion": "2 tbsp",
          "costUsd": 0.45
        }
      ],
      "instructions": [
        "Press tofu and cut into bite-sized cubes; sear in skillet until golden on all sides.",
        "Add vegetables and stir-fry for 3 minutes until crisp-tender.",
        "Pour sauce over top and toss until glossy."
      ],
      "budgetTips": "Plant-based protein meal costing under $3.50 with zero saturated cholesterol."
    },
    "dinner": {
      "id": "as-d23-d",
      "type": "dinner",
      "title": "Korean Rainbow Bibimbap Bowl with Lean Beef",
      "subtitle": "Warm rice layered with seasoned spinach, carrots, bean sprouts, lean beef, and sunny egg",
      "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Hot Bowl",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 15,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-l2-1",
          "name": "Lean Ground Beef (90/10)",
          "portion": "120g",
          "costUsd": 1.95
        },
        {
          "id": "as-l2-2",
          "name": "Steamed Short Grain Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l2-3",
          "name": "Spinach, Carrots & Bean Sprouts",
          "portion": "1.5 cups sautéed",
          "costUsd": 1.2
        },
        {
          "id": "as-l2-4",
          "name": "Sunny Side Up Egg & Gochujang",
          "portion": "1 egg + 1 tbsp",
          "costUsd": 1.3
        }
      ],
      "instructions": [
        "Briefly sauté seasoned beef with garlic and light soy sauce.",
        "Blanch spinach and bean sprouts; toss each with sesame oil and salt.",
        "Assemble warm rice in a bowl, arrange vibrant vegetables in radial sections, and crown with egg."
      ],
      "budgetTips": "Bibimbap is the gold standard for getting 5 different vegetable colors into a single meal."
    },
    "snack": {
      "id": "as-d23-s",
      "type": "snack",
      "title": "Toasted Asian Spiced Cashews & Almonds",
      "subtitle": "Oven-roasted whole cashews and almonds coated in tamari soy, sesame, and chili flakes",
      "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
      "servingSize": "Handful (40g)",
      "prepTime": "3 Mins",
      "baseKcal": 240,
      "baseProtein": 8,
      "baseCarbs": 10,
      "baseFat": 19,
      "costUsd": 1.4,
      "ingredients": [
        {
          "id": "as-s3-1",
          "name": "Roasted Cashews & Almonds",
          "portion": "40g",
          "costUsd": 1.2
        },
        {
          "id": "as-s3-2",
          "name": "Tamari Soy & Sesame Seeds",
          "portion": "1 tsp",
          "costUsd": 0.2
        }
      ],
      "instructions": [
        "Toss nuts in tamari and sesame seeds, roast lightly until fragrant."
      ],
      "budgetTips": "Convenient healthy fat source providing sustained physical energy."
    }
  },
  {
    "dayNumber": 24,
    "dayTitle": "Day 24",
    "theme": "Indian Tandoori & Chickpeas",
    "breakfast": {
      "id": "as-d24-b",
      "type": "breakfast",
      "title": "Indian Spiced Masala Omelet with Whole Wheat Roti",
      "subtitle": "Free-range eggs whisked with diced red onions, cilantro, green chilies, and warm turmeric",
      "image": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Eggs + 1 Whole Wheat Roti",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 22,
      "baseCarbs": 36,
      "baseFat": 18,
      "costUsd": 1.85,
      "ingredients": [
        {
          "id": "as-b3-1",
          "name": "Farm Eggs",
          "portion": "2 eggs",
          "costUsd": 0.55
        },
        {
          "id": "as-b3-2",
          "name": "Whole Wheat Atta Roti",
          "portion": "1 flatbread",
          "costUsd": 0.35
        },
        {
          "id": "as-b3-3",
          "name": "Red Onion, Green Chili & Cilantro",
          "portion": "Handful",
          "costUsd": 0.45
        },
        {
          "id": "as-b3-4",
          "name": "Mustard Oil / Ghee",
          "portion": "1 tsp",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Finely chop red onion, green chili, and cilantro; beat into eggs with turmeric and salt.",
        "Pour into hot skillet with a touch of ghee and cook until golden brown on both sides.",
        "Serve hot folded with a fresh whole wheat roti."
      ],
      "budgetTips": "One of the most cost-effective and nutrient-packed breakfasts in South Asia."
    },
    "lunch": {
      "id": "as-d24-l",
      "type": "lunch",
      "title": "Punjabi Chana Masala with Warm Whole Wheat Roti",
      "subtitle": "Tender chickpeas simmered in an aromatic tomato, onion, and garam masala gravy",
      "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Bowl Chana + 2 Rotis",
      "prepTime": "18 Mins",
      "baseKcal": 540,
      "baseProtein": 25,
      "baseCarbs": 82,
      "baseFat": 11,
      "costUsd": 2.5,
      "ingredients": [
        {
          "id": "as-l7-1",
          "name": "Chickpeas (Kabuli Chana)",
          "portion": "1 cup cooked",
          "costUsd": 0.7
        },
        {
          "id": "as-l7-2",
          "name": "Whole Wheat Atta Rotis",
          "portion": "2 pieces",
          "costUsd": 0.5
        },
        {
          "id": "as-l7-3",
          "name": "Tomato, Onion & Ginger Gravy",
          "portion": "1 cup",
          "costUsd": 0.7
        },
        {
          "id": "as-l7-4",
          "name": "Pickled Onion & Lemon",
          "portion": "Handful",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Sauté onions, ginger, and garlic paste; stir in pureed tomatoes and chana masala spice.",
        "Add cooked chickpeas and simmer on medium heat for 12 minutes until gravy thickens.",
        "Garnish with julienned ginger and serve with hot rotis."
      ],
      "budgetTips": "Chickpeas deliver over 12g of dietary fiber per serving for outstanding satiety."
    },
    "dinner": {
      "id": "as-d24-d",
      "type": "dinner",
      "title": "Tandoori Chicken Tikka with Grilled Bell Peppers",
      "subtitle": "Char-grilled yogurt-marinated chicken breast skewers with grilled onions and mint chutney",
      "image": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Large Skewers + 1 Roti",
      "prepTime": "18 Mins",
      "baseKcal": 510,
      "baseProtein": 48,
      "baseCarbs": 36,
      "baseFat": 14,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-d5-1",
          "name": "Boneless Chicken Breast Chunks",
          "portion": "180g",
          "costUsd": 2.4
        },
        {
          "id": "as-d5-2",
          "name": "Bell Peppers & Red Onion",
          "portion": "1 cup sliced",
          "costUsd": 0.8
        },
        {
          "id": "as-d5-3",
          "name": "Whole Wheat Roti",
          "portion": "1 piece",
          "costUsd": 0.4
        },
        {
          "id": "as-d5-4",
          "name": "Mint Cilantro Chutney",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Coat chicken in Greek yogurt, Kashmiri chili, ginger, and garam masala.",
        "Thread onto skewers with onion and pepper chunks; broil or grill until lightly charred.",
        "Serve piping hot with whole wheat roti and fresh mint chutney."
      ],
      "budgetTips": "One of the highest protein-to-calorie ratios among all global cuisines."
    },
    "snack": {
      "id": "as-d24-s",
      "type": "snack",
      "title": "Cardamom Masala Chai with Roasted Chana",
      "subtitle": "Slow-brewed spiced black tea with milk and crushed cardamom, paired with crunchy roasted chickpeas",
      "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Cup Chai + 1 Small Bowl Chana",
      "prepTime": "6 Mins",
      "baseKcal": 220,
      "baseProtein": 12,
      "baseCarbs": 32,
      "baseFat": 4.5,
      "costUsd": 1.1,
      "ingredients": [
        {
          "id": "as-s4-1",
          "name": "Roasted Bengal Gram Chana",
          "portion": "50g",
          "costUsd": 0.5
        },
        {
          "id": "as-s4-2",
          "name": "Spiced Milk Chai",
          "portion": "200ml",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil black tea with crushed cardamom and ginger; add milk and serve with roasted chana."
      ],
      "budgetTips": "Roasted chana costs under $0.60 per portion and provides 10g clean protein."
    }
  },
  {
    "dayNumber": 25,
    "dayTitle": "Day 25",
    "theme": "Vietnamese Summer Bowls",
    "breakfast": {
      "id": "as-d25-b",
      "type": "breakfast",
      "title": "Vietnamese Scrambled Eggs with Spring Onion & Baguette",
      "subtitle": "Silky soft scrambled eggs tossed with nuoc cham, scallions, and crisp whole grain baguette",
      "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Eggs + 1 Mini Baguette",
      "prepTime": "8 Mins",
      "baseKcal": 400,
      "baseProtein": 21,
      "baseCarbs": 45,
      "baseFat": 14,
      "costUsd": 2.15,
      "ingredients": [
        {
          "id": "as-b9-1",
          "name": "Fresh Eggs",
          "portion": "2 eggs",
          "costUsd": 0.55
        },
        {
          "id": "as-b9-2",
          "name": "Crusty Baguette",
          "portion": "1 roll",
          "costUsd": 0.7
        },
        {
          "id": "as-b9-3",
          "name": "Shallots, Herbs & Light Soy",
          "portion": "Handful",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Scramble eggs gently over medium heat with shallots and light seasoning.",
        "Serve warm tucked into freshly toasted crusty bread."
      ],
      "budgetTips": "Combines French-Vietnamese street food heritage with high protein."
    },
    "lunch": {
      "id": "as-d25-l",
      "type": "lunch",
      "title": "Vietnamese Chicken Pho Noodle Soup (Pho Ga)",
      "subtitle": "Clear aromatic chicken bone broth with star anise, rice noodles, tender chicken, and fresh herbs",
      "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Soup Bowl (500ml)",
      "prepTime": "20 Mins",
      "baseKcal": 510,
      "baseProtein": 40,
      "baseCarbs": 64,
      "baseFat": 9,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-l4-1",
          "name": "Poached Chicken Breast",
          "portion": "150g",
          "costUsd": 2.1
        },
        {
          "id": "as-l4-2",
          "name": "Flat Rice Pho Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l4-3",
          "name": "Aromatic Spiced Pho Broth",
          "portion": "2 cups",
          "costUsd": 0.75
        },
        {
          "id": "as-l4-4",
          "name": "Thai Basil, Jalapeño & Lime",
          "portion": "Generous herbs",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Simmer chicken broth with toasted star anise, cinnamon stick, ginger, and onion for deep aroma.",
        "Place warm rice noodles and sliced chicken into a deep bowl.",
        "Pour boiling broth over top; serve alongside fresh Thai basil, lime wedges, and bean sprouts."
      ],
      "budgetTips": "Pho broth is naturally hydrating, low in fat, and rich in collagen peptides."
    },
    "dinner": {
      "id": "as-d25-d",
      "type": "dinner",
      "title": "Cantonese Steamed Fish with Ginger & Scallions",
      "subtitle": "Delicate white fish fillet steamed with fresh ginger matchsticks, scallions, and light soy broth",
      "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Fish Fillet (180g) + Jasmine Rice",
      "prepTime": "15 Mins",
      "baseKcal": 490,
      "baseProtein": 42,
      "baseCarbs": 48,
      "baseFat": 12,
      "costUsd": 5.2,
      "ingredients": [
        {
          "id": "as-d6-1",
          "name": "White Fish Fillet (Cod / Tilapia)",
          "portion": "180g",
          "costUsd": 3.1
        },
        {
          "id": "as-d6-2",
          "name": "Fresh Ginger & Green Scallions",
          "portion": "Generous",
          "costUsd": 0.6
        },
        {
          "id": "as-d6-3",
          "name": "Light Soy & Toasted Sesame Oil",
          "portion": "2 tbsp",
          "costUsd": 0.6
        },
        {
          "id": "as-d6-4",
          "name": "Steamed Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Lay fresh fish fillet on a heatproof plate topped with julienned ginger.",
        "Steam over boiling water for 8 minutes until tender and flaky.",
        "Top with fresh scallions and pour smoking hot light soy and sesame oil over top."
      ],
      "budgetTips": "Delicate lean protein with heart-healthy omega-3s and virtually zero cleanup."
    },
    "snack": {
      "id": "as-d25-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  },
  {
    "dayNumber": 26,
    "dayTitle": "Day 26",
    "theme": "Hong Kong Noodle Bar",
    "breakfast": {
      "id": "as-d26-b",
      "type": "breakfast",
      "title": "Steamed Fluffy Bao with Egg & Scallion Filling",
      "subtitle": "Warm pillowy yeast bao buns stuffed with scrambled eggs, fresh green onions, and chili crisp",
      "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Steamed Buns",
      "prepTime": "10 Mins",
      "baseKcal": 410,
      "baseProtein": 18,
      "baseCarbs": 56,
      "baseFat": 12,
      "costUsd": 2.25,
      "ingredients": [
        {
          "id": "as-b8-1",
          "name": "Fluffy Bao Buns",
          "portion": "2 buns",
          "costUsd": 0.95
        },
        {
          "id": "as-b8-2",
          "name": "Scrambled Eggs",
          "portion": "2 eggs",
          "costUsd": 0.6
        },
        {
          "id": "as-b8-3",
          "name": "Chili Crisp Oil & Scallions",
          "portion": "1 tbsp",
          "costUsd": 0.7
        }
      ],
      "instructions": [
        "Steam buns in a bamboo steamer for 6 minutes until soft and warm.",
        "Stuff with softly scrambled eggs, fresh scallions, and a dash of chili oil."
      ],
      "budgetTips": "Bao buns freeze perfectly in large bags for quick 5-minute morning breakfasts."
    },
    "lunch": {
      "id": "as-d26-l",
      "type": "lunch",
      "title": "Chinese Chicken & Vegetable Lo Mein Noodles",
      "subtitle": "Wok-tossed egg noodles with shredded chicken, crunchy carrots, cabbage, and savory dark soy",
      "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Noodle Bowl",
      "prepTime": "14 Mins",
      "baseKcal": 550,
      "baseProtein": 38,
      "baseCarbs": 68,
      "baseFat": 14,
      "costUsd": 4.2,
      "ingredients": [
        {
          "id": "as-l9-1",
          "name": "Skinless Chicken Breast",
          "portion": "140g",
          "costUsd": 1.9
        },
        {
          "id": "as-l9-2",
          "name": "Egg Lo Mein Noodles",
          "portion": "80g dry",
          "costUsd": 0.7
        },
        {
          "id": "as-l9-3",
          "name": "Napa Cabbage, Carrots & Onion",
          "portion": "1.5 cups shredded",
          "costUsd": 0.85
        },
        {
          "id": "as-l9-4",
          "name": "Dark Soy, Oyster Sauce & Sesame",
          "portion": "2 tbsp",
          "costUsd": 0.75
        }
      ],
      "instructions": [
        "Boil noodles al dente for 3 minutes, drain and rinse in cold water.",
        "Stir-fry chicken strips in a smoking hot wok until cooked, toss in crisp vegetables.",
        "Add noodles and dark soy sauce mixture, tossing vigorously over high heat."
      ],
      "budgetTips": "Fast high-heat wok cooking preserves crisp vegetable vitamins and cuts cook time."
    },
    "dinner": {
      "id": "as-d26-d",
      "type": "dinner",
      "title": "Classic Kung Pao Chicken with Roasted Peanuts",
      "subtitle": "Seared chicken breast wok-tossed with roasted peanuts, zucchini, red peppers, and chili pods",
      "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate + Brown Rice",
      "prepTime": "16 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 54,
      "baseFat": 18,
      "costUsd": 4.4,
      "ingredients": [
        {
          "id": "as-d3-1",
          "name": "Diced Chicken Breast",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-d3-2",
          "name": "Roasted Peanuts",
          "portion": "30g",
          "costUsd": 0.5
        },
        {
          "id": "as-d3-3",
          "name": "Zucchini, Bell Peppers & Chilies",
          "portion": "1.5 cups",
          "costUsd": 0.95
        },
        {
          "id": "as-d3-4",
          "name": "Brown Rice & Kung Pao Sauce",
          "portion": "1 cup rice",
          "costUsd": 0.75
        }
      ],
      "instructions": [
        "Marinate diced chicken with soy sauce and cornstarch.",
        "Sear chicken in hot wok, toss in bell peppers, zucchini, and dried red chilies.",
        "Pour Kung Pao sauce over, fold in crunchy peanuts, and serve over warm brown rice."
      ],
      "budgetTips": "Peanuts add healthy monounsaturated fats and satisfying crunch for pennies."
    },
    "snack": {
      "id": "as-d26-s",
      "type": "snack",
      "title": "Fresh Tropical Papaya & Lychee Bowl",
      "subtitle": "Chilled fresh papaya wedges and sweet lychees with a squeeze of fresh lime juice",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (180g)",
      "prepTime": "3 Mins",
      "baseKcal": 140,
      "baseProtein": 2,
      "baseCarbs": 34,
      "baseFat": 0.5,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "as-s5-1",
          "name": "Fresh Papaya & Lychee",
          "portion": "180g",
          "costUsd": 1.35
        },
        {
          "id": "as-s5-2",
          "name": "Lime Wedge & Mint",
          "portion": "Garnish",
          "costUsd": 0.15
        }
      ],
      "instructions": [
        "Slice ripe chilled papaya and serve with lime juice and mint."
      ],
      "budgetTips": "Papaya contains papain enzymes that actively aid post-workout protein digestion."
    }
  },
  {
    "dayNumber": 27,
    "dayTitle": "Day 27",
    "theme": "Osaka Salmon & Soba Balance",
    "breakfast": {
      "id": "as-d27-b",
      "type": "breakfast",
      "title": "Japanese Rolled Tamagoyaki with Miso & Rice",
      "subtitle": "Fluffy sweet-savory rolled dashi eggs served with warm jasmine rice and scallions",
      "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
      "servingSize": "3 Egg Rolls + 1 Cup Steamed Rice",
      "prepTime": "12 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 48,
      "baseFat": 14,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-b1-1",
          "name": "Cage-Free Eggs",
          "portion": "3 eggs",
          "costUsd": 0.8
        },
        {
          "id": "as-b1-2",
          "name": "Jasmine Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.4
        },
        {
          "id": "as-b1-3",
          "name": "Dashi & Mirin Seasoning",
          "portion": "1 tbsp",
          "costUsd": 0.5
        },
        {
          "id": "as-b1-4",
          "name": "Green Scallions & Nori",
          "portion": "Handful",
          "costUsd": 0.5
        }
      ],
      "instructions": [
        "Whisk eggs with dashi, mirin, and a pinch of sea salt.",
        "Pour thin layers into a non-stick pan, rolling gradually into a fluffy cylinder.",
        "Serve warm alongside steamed jasmine rice and garnish with chopped scallions."
      ],
      "budgetTips": "Eggs provide bioavailable protein while jasmine rice bought in bulk is very economical."
    },
    "lunch": {
      "id": "as-d27-l",
      "type": "lunch",
      "title": "Hawaiian-Japanese Salmon & Edamame Poke Bowl",
      "subtitle": "Fresh Atlantic salmon sashimi cubes over brown rice, edamame, cucumber, and spicy sesame ponzu",
      "image": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Poke Bowl (380g)",
      "prepTime": "10 Mins",
      "baseKcal": 570,
      "baseProtein": 42,
      "baseCarbs": 58,
      "baseFat": 18,
      "costUsd": 6.2,
      "ingredients": [
        {
          "id": "as-l8-1",
          "name": "Fresh Atlantic Salmon",
          "portion": "140g sashimi cut",
          "costUsd": 3.8
        },
        {
          "id": "as-l8-2",
          "name": "Brown Rice & Quinoa Blend",
          "portion": "1 cup cooked",
          "costUsd": 0.65
        },
        {
          "id": "as-l8-3",
          "name": "Shelled Edamame & Cucumber",
          "portion": "1 cup",
          "costUsd": 0.95
        },
        {
          "id": "as-l8-4",
          "name": "Sesame Ponzu Dressing",
          "portion": "2 tbsp",
          "costUsd": 0.8
        }
      ],
      "instructions": [
        "Cube fresh salmon and toss gently in ponzu sauce with sesame seeds.",
        "Layer warm brown rice into a bowl, arrange edamame, shredded cucumber, and salmon neatly.",
        "Top with nori strips and scallions."
      ],
      "budgetTips": "Buying whole salmon fillets and slicing at home costs one-third of commercial poke bowl shops."
    },
    "dinner": {
      "id": "as-d27-d",
      "type": "dinner",
      "title": "Japanese Shoyu Ramen with Chashu & Soft Egg",
      "subtitle": "Rich umami dashi-chicken broth with wavy ramen noodles, braised chicken, bamboo shoots, and marinated egg",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Ramen Bowl (500ml)",
      "prepTime": "22 Mins",
      "baseKcal": 590,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 16,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-d1-1",
          "name": "Braised Chicken Breast / Thigh",
          "portion": "140g",
          "costUsd": 1.95
        },
        {
          "id": "as-d1-2",
          "name": "Japanese Fresh Ramen Noodles",
          "portion": "100g",
          "costUsd": 0.85
        },
        {
          "id": "as-d1-3",
          "name": "Ajitsuke Marinated Soft Egg",
          "portion": "1 egg",
          "costUsd": 0.5
        },
        {
          "id": "as-d1-4",
          "name": "Shoyu Broth, Nori & Scallions",
          "portion": "Broth + garnish",
          "costUsd": 1.5
        }
      ],
      "instructions": [
        "Prepare aromatic shoyu broth with chicken stock, soy sauce, and kombu.",
        "Cook ramen noodles in boiling water for exactly 2 minutes and transfer into bowl.",
        "Pour broth, arrange sliced chicken, halved soft-boiled egg, nori sheet, and scallions."
      ],
      "budgetTips": "Authentic ramen made at home delivers restaurant taste at 75% savings."
    },
    "snack": {
      "id": "as-d27-s",
      "type": "snack",
      "title": "Steamed Sea Salt & Garlic Edamame Pods",
      "subtitle": "Warm tender green soybean pods dusted with flaky sea salt and cracked black pepper",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Medium Bowl (150g)",
      "prepTime": "5 Mins",
      "baseKcal": 180,
      "baseProtein": 17,
      "baseCarbs": 14,
      "baseFat": 6,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "as-s1-1",
          "name": "Whole Edamame Pods",
          "portion": "150g",
          "costUsd": 1.3
        },
        {
          "id": "as-s1-2",
          "name": "Sea Salt & Toasted Garlic",
          "portion": "Pinch",
          "costUsd": 0.3
        }
      ],
      "instructions": [
        "Steam edamame pods in salted water for 4 minutes. Drain and toss with sea salt."
      ],
      "budgetTips": "Complete plant protein snack with 8g of prebiotic dietary fiber per bowl."
    }
  },
  {
    "dayNumber": 28,
    "dayTitle": "Day 28",
    "theme": "Thai Royal Coconut Curry",
    "breakfast": {
      "id": "as-d28-b",
      "type": "breakfast",
      "title": "Thai Mango & Coconut Chia Seed Pudding",
      "subtitle": "Overnight chia seeds steeped in light coconut milk topped with sweet fresh mango cubes",
      "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Glass Jar (250g)",
      "prepTime": "5 Mins (Overnight)",
      "baseKcal": 350,
      "baseProtein": 12,
      "baseCarbs": 44,
      "baseFat": 14,
      "costUsd": 2.4,
      "ingredients": [
        {
          "id": "as-b6-1",
          "name": "Organic Chia Seeds",
          "portion": "3 tbsp",
          "costUsd": 0.7
        },
        {
          "id": "as-b6-2",
          "name": "Light Coconut Milk",
          "portion": "1 cup",
          "costUsd": 0.8
        },
        {
          "id": "as-b6-3",
          "name": "Fresh Sweet Mango",
          "portion": "1/2 cup diced",
          "costUsd": 0.9
        }
      ],
      "instructions": [
        "Whisk chia seeds into light coconut milk with a hint of vanilla.",
        "Refrigerate overnight until thick and spoon fresh mango cubes over top."
      ],
      "budgetTips": "Chia provides 100% daily plant-based omega-3 alpha-linolenic acid."
    },
    "lunch": {
      "id": "as-d28-l",
      "type": "lunch",
      "title": "Authentic Thai Pad Thai with Tofu & Shrimp",
      "subtitle": "Stir-fried flat rice noodles tossed with tamarind sauce, bean sprouts, crushed peanuts, and lime",
      "image": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Wok Plate (380g)",
      "prepTime": "15 Mins",
      "baseKcal": 540,
      "baseProtein": 34,
      "baseCarbs": 72,
      "baseFat": 13,
      "costUsd": 4.6,
      "ingredients": [
        {
          "id": "as-l3-1",
          "name": "Firm Tofu & Tail-on Shrimp",
          "portion": "140g mixed",
          "costUsd": 2.3
        },
        {
          "id": "as-l3-2",
          "name": "Flat Rice Pad Thai Noodles",
          "portion": "80g dry",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-3",
          "name": "Bean Sprouts & Scallions",
          "portion": "1 cup",
          "costUsd": 0.65
        },
        {
          "id": "as-l3-4",
          "name": "Tamarind Sauce, Peanuts & Lime",
          "portion": "2 tbsp",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Soak rice noodles in warm water until pliable.",
        "Sear tofu cubes and shrimp in a hot wok; push aside and scramble an egg.",
        "Toss in drained noodles with tamarind sauce, bean sprouts, and roasted crushed peanuts."
      ],
      "budgetTips": "Combining tofu with shrimp gives complete seafood flavor while cutting total protein cost in half."
    },
    "dinner": {
      "id": "as-d28-d",
      "type": "dinner",
      "title": "Thai Green Coconut Chicken Curry with Jasmine Rice",
      "subtitle": "Fragrant coconut milk curry with chicken, Thai eggplants, bamboo shoots, and kaffir lime leaves",
      "image": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Curry Bowl + 1 Cup Rice",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 40,
      "baseCarbs": 58,
      "baseFat": 20,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-d2-1",
          "name": "Chicken Breast Slices",
          "portion": "150g",
          "costUsd": 2.1
        },
        {
          "id": "as-d2-2",
          "name": "Coconut Milk (Light)",
          "portion": "1 cup",
          "costUsd": 1
        },
        {
          "id": "as-d2-3",
          "name": "Green Curry Paste & Thai Basil",
          "portion": "2 tbsp",
          "costUsd": 0.8
        },
        {
          "id": "as-d2-4",
          "name": "Bamboo Shoots & Steamed Rice",
          "portion": "1 cup rice",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Fry green curry paste in coconut cream until fragrant and oils separate.",
        "Add chicken and bamboo shoots; simmer gently in coconut milk for 10 minutes.",
        "Finish with kaffir lime leaves and Thai basil; serve with jasmine rice."
      ],
      "budgetTips": "Medium-chain triglycerides (MCTs) in coconut milk provide quick metabolic energy."
    },
    "snack": {
      "id": "as-d28-s",
      "type": "snack",
      "title": "Fresh Tropical Papaya & Lychee Bowl",
      "subtitle": "Chilled fresh papaya wedges and sweet lychees with a squeeze of fresh lime juice",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (180g)",
      "prepTime": "3 Mins",
      "baseKcal": 140,
      "baseProtein": 2,
      "baseCarbs": 34,
      "baseFat": 0.5,
      "costUsd": 1.5,
      "ingredients": [
        {
          "id": "as-s5-1",
          "name": "Fresh Papaya & Lychee",
          "portion": "180g",
          "costUsd": 1.35
        },
        {
          "id": "as-s5-2",
          "name": "Lime Wedge & Mint",
          "portion": "Garnish",
          "costUsd": 0.15
        }
      ],
      "instructions": [
        "Slice ripe chilled papaya and serve with lime juice and mint."
      ],
      "budgetTips": "Papaya contains papain enzymes that actively aid post-workout protein digestion."
    }
  },
  {
    "dayNumber": 29,
    "dayTitle": "Day 29",
    "theme": "Deccan Spiced Biryani & Raita",
    "breakfast": {
      "id": "as-d29-b",
      "type": "breakfast",
      "title": "South Indian Steamed Idlis with Vegetable Sambar",
      "subtitle": "Light fermented steamed rice-lentil cakes paired with protein-rich spiced lentil stew",
      "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
      "servingSize": "3 Idlis + 1 Bowl Sambar",
      "prepTime": "12 Mins",
      "baseKcal": 380,
      "baseProtein": 16,
      "baseCarbs": 66,
      "baseFat": 4,
      "costUsd": 1.9,
      "ingredients": [
        {
          "id": "as-b7-1",
          "name": "Steamed Idlis",
          "portion": "3 pieces",
          "costUsd": 0.75
        },
        {
          "id": "as-b7-2",
          "name": "Toor Dal Sambar Stew",
          "portion": "1 bowl",
          "costUsd": 0.75
        },
        {
          "id": "as-b7-3",
          "name": "Mixed Vegetables & Curry Leaves",
          "portion": "1 cup",
          "costUsd": 0.4
        }
      ],
      "instructions": [
        "Steam idli batter until light and fluffy.",
        "Simmer toor dal with pumpkin, drumstick, sambar spices, and curry leaves.",
        "Dip hot idlis into the steaming lentil sambar."
      ],
      "budgetTips": "Idlis are naturally gluten-free, low-fat, and exceptionally easy to digest."
    },
    "lunch": {
      "id": "as-d29-l",
      "type": "lunch",
      "title": "Indian Dal Tadka with Fragrant Basmati Rice",
      "subtitle": "Golden yellow lentils tempered with cumin, garlic, and ghee, served over aged basmati rice",
      "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Bowl Dal + 1 Cup Basmati",
      "prepTime": "20 Mins",
      "baseKcal": 520,
      "baseProtein": 24,
      "baseCarbs": 84,
      "baseFat": 10,
      "costUsd": 2.6,
      "ingredients": [
        {
          "id": "as-l6-1",
          "name": "Yellow Moong & Toor Lentils",
          "portion": "80g raw",
          "costUsd": 0.75
        },
        {
          "id": "as-l6-2",
          "name": "Long-Grain Aged Basmati Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.6
        },
        {
          "id": "as-l6-3",
          "name": "Cumin, Garlic, Tomato & Ghee Tadka",
          "portion": "1 tbsp",
          "costUsd": 0.65
        },
        {
          "id": "as-l6-4",
          "name": "Fresh Lemon & Coriander",
          "portion": "Garnish",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil lentils with water, turmeric, and sea salt until soft and creamy.",
        "In a small ladle, heat ghee with cumin seeds, sliced garlic, and dry chili until aromatic.",
        "Pour sizzled tadka over lentils; serve steaming over fluffy basmati rice."
      ],
      "budgetTips": "Lentils and rice form a complete protein containing all 9 essential amino acids at unmatched low cost."
    },
    "dinner": {
      "id": "as-d29-d",
      "type": "dinner",
      "title": "Fragrant Chicken Biryani with Cucumber Raita",
      "subtitle": "Layered basmati rice infused with whole spices, tender chicken thighs, and cool mint yogurt raita",
      "image": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Plate (420g)",
      "prepTime": "25 Mins",
      "baseKcal": 610,
      "baseProtein": 46,
      "baseCarbs": 74,
      "baseFat": 14,
      "costUsd": 4.7,
      "ingredients": [
        {
          "id": "as-d4-1",
          "name": "Marinated Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-d4-2",
          "name": "Aged Basmati Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.65
        },
        {
          "id": "as-d4-3",
          "name": "Biryani Spices, Saffron & Mint",
          "portion": "Handful",
          "costUsd": 0.85
        },
        {
          "id": "as-d4-4",
          "name": "Plain Yogurt Cucumber Raita",
          "portion": "1/2 cup",
          "costUsd": 1
        }
      ],
      "instructions": [
        "Marinate chicken with yogurt, garlic, ginger, and biryani spices.",
        "Layer partially boiled basmati rice over chicken with fresh mint and saffron water.",
        "Seal pot and steam (dum) on low heat for 20 minutes; serve with fresh cucumber raita."
      ],
      "budgetTips": "High satiety dinner with cooling probiotics from homemade cucumber yogurt."
    },
    "snack": {
      "id": "as-d29-s",
      "type": "snack",
      "title": "Cardamom Masala Chai with Roasted Chana",
      "subtitle": "Slow-brewed spiced black tea with milk and crushed cardamom, paired with crunchy roasted chickpeas",
      "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Cup Chai + 1 Small Bowl Chana",
      "prepTime": "6 Mins",
      "baseKcal": 220,
      "baseProtein": 12,
      "baseCarbs": 32,
      "baseFat": 4.5,
      "costUsd": 1.1,
      "ingredients": [
        {
          "id": "as-s4-1",
          "name": "Roasted Bengal Gram Chana",
          "portion": "50g",
          "costUsd": 0.5
        },
        {
          "id": "as-s4-2",
          "name": "Spiced Milk Chai",
          "portion": "200ml",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Boil black tea with crushed cardamom and ginger; add milk and serve with roasted chana."
      ],
      "budgetTips": "Roasted chana costs under $0.60 per portion and provides 10g clean protein."
    }
  },
  {
    "dayNumber": 30,
    "dayTitle": "Day 30",
    "theme": "Pan-Asian Grand Wok Finale",
    "breakfast": {
      "id": "as-d30-b",
      "type": "breakfast",
      "title": "Japanese Ceremonial Matcha Protein Smoothie Bowl",
      "subtitle": "Chilled Japanese green tea matcha blended with frozen banana, soy milk, and chia seeds",
      "image": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Bowl (300ml)",
      "prepTime": "5 Mins",
      "baseKcal": 360,
      "baseProtein": 24,
      "baseCarbs": 46,
      "baseFat": 8,
      "costUsd": 2.75,
      "ingredients": [
        {
          "id": "as-b5-1",
          "name": "Japanese Matcha Powder",
          "portion": "1 tsp",
          "costUsd": 0.85
        },
        {
          "id": "as-b5-2",
          "name": "Soy / Almond Milk",
          "portion": "1 cup",
          "costUsd": 0.6
        },
        {
          "id": "as-b5-3",
          "name": "Ripe Cavendish Banana",
          "portion": "1 frozen",
          "costUsd": 0.35
        },
        {
          "id": "as-b5-4",
          "name": "Plant Protein & Chia Seeds",
          "portion": "20g",
          "costUsd": 0.95
        }
      ],
      "instructions": [
        "Blend frozen banana, matcha powder, plant protein, and soy milk until thick and creamy.",
        "Pour into a chilled bowl and top with chia seeds."
      ],
      "budgetTips": "Matcha delivers steady L-theanine energy without coffee crashes."
    },
    "lunch": {
      "id": "as-d30-l",
      "type": "lunch",
      "title": "Japanese Glazed Chicken Teriyaki Bowl",
      "subtitle": "Tender pan-seared chicken thighs in house-made ginger mirin glaze over steamed rice and broccoli",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Rice Bowl (400g)",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 62,
      "baseFat": 14,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "as-l1-1",
          "name": "Boneless Skinless Chicken",
          "portion": "160g",
          "costUsd": 2.2
        },
        {
          "id": "as-l1-2",
          "name": "Jasmine White / Brown Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l1-3",
          "name": "Fresh Steamed Broccoli",
          "portion": "1 cup florets",
          "costUsd": 0.9
        },
        {
          "id": "as-l1-4",
          "name": "Teriyaki Sauce & Sesame",
          "portion": "2 tbsp",
          "costUsd": 1.25
        }
      ],
      "instructions": [
        "Sear chicken in a hot skillet until golden brown on both sides.",
        "Add soy sauce, mirin, and grated ginger; simmer until sauce turns into a glossy lacquer.",
        "Slice chicken and arrange over warm rice with steamed broccoli and sesame seeds."
      ],
      "budgetTips": "Making your own teriyaki glaze with soy sauce, mirin, and honey costs 70% less than store jars."
    },
    "dinner": {
      "id": "as-d30-d",
      "type": "dinner",
      "title": "Korean Rainbow Bibimbap Bowl with Lean Beef",
      "subtitle": "Warm rice layered with seasoned spinach, carrots, bean sprouts, lean beef, and sunny egg",
      "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Hot Bowl",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 15,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "as-l2-1",
          "name": "Lean Ground Beef (90/10)",
          "portion": "120g",
          "costUsd": 1.95
        },
        {
          "id": "as-l2-2",
          "name": "Steamed Short Grain Rice",
          "portion": "1 cup cooked",
          "costUsd": 0.45
        },
        {
          "id": "as-l2-3",
          "name": "Spinach, Carrots & Bean Sprouts",
          "portion": "1.5 cups sautéed",
          "costUsd": 1.2
        },
        {
          "id": "as-l2-4",
          "name": "Sunny Side Up Egg & Gochujang",
          "portion": "1 egg + 1 tbsp",
          "costUsd": 1.3
        }
      ],
      "instructions": [
        "Briefly sauté seasoned beef with garlic and light soy sauce.",
        "Blanch spinach and bean sprouts; toss each with sesame oil and salt.",
        "Assemble warm rice in a bowl, arrange vibrant vegetables in radial sections, and crown with egg."
      ],
      "budgetTips": "Bibimbap is the gold standard for getting 5 different vegetable colors into a single meal."
    },
    "snack": {
      "id": "as-d30-s",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls packed with shrimp, mint, crisp lettuce, and peanut dipping sauce",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Fresh Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "as-s2-1",
          "name": "Rice Paper Wrappers",
          "portion": "2 wrappers",
          "costUsd": 0.4
        },
        {
          "id": "as-s2-2",
          "name": "Poached Shrimp & Greens",
          "portion": "50g shrimp + mint",
          "costUsd": 1.2
        },
        {
          "id": "as-s2-3",
          "name": "Peanut Hoisin Dipping Dip",
          "portion": "2 tbsp",
          "costUsd": 0.6
        }
      ],
      "instructions": [
        "Dip rice wrapper in warm water; roll tightly with shrimp, herbs, and greens."
      ],
      "budgetTips": "100% gluten-free, un-fried snack with fresh herbal vitamins."
    }
  }
];

export const ASIAN_REPLACEMENTS: Record<string, AsianMeal[]> = {
  "breakfast": [
    {
      "id": "alt-as-b1",
      "type": "breakfast",
      "title": "Japanese Tamagoyaki Rolled Eggs & Rice",
      "subtitle": "Savory sweet dashi rolled eggs with jasmine rice and scallions",
      "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
      "servingSize": "3 Egg Rolls + 1 Cup Rice",
      "prepTime": "12 Mins",
      "baseKcal": 420,
      "baseProtein": 22,
      "baseCarbs": 48,
      "baseFat": 14,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "ar-b1",
          "name": "Eggs, Jasmine Rice & Dashi",
          "portion": "1 serving",
          "costUsd": 2.2
        }
      ],
      "instructions": [
        "Whisk eggs with dashi and roll into layers; serve with rice."
      ],
      "budgetTips": "Extremely cost-effective complete protein."
    },
    {
      "id": "alt-as-b2",
      "type": "breakfast",
      "title": "Cantonese Chicken & Ginger Congee",
      "subtitle": "Slow-simmered velvety rice porridge with shredded chicken breast and ginger",
      "image": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Bowl",
      "prepTime": "15 Mins",
      "baseKcal": 380,
      "baseProtein": 26,
      "baseCarbs": 52,
      "baseFat": 6,
      "costUsd": 2.1,
      "ingredients": [
        {
          "id": "ar-b2",
          "name": "Rice, Chicken Breast & Fresh Ginger",
          "portion": "1 serving",
          "costUsd": 2.1
        }
      ],
      "instructions": [
        "Simmer rice in chicken stock until thick, fold in shredded chicken."
      ],
      "budgetTips": "Stretches a small chicken portion into a warm, filling breakfast."
    }
  ],
  "lunch": [
    {
      "id": "alt-as-l1",
      "type": "lunch",
      "title": "Japanese Glazed Chicken Teriyaki Bowl",
      "subtitle": "Seared chicken in savory sweet glaze over jasmine rice and broccoli",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Large Bowl",
      "prepTime": "18 Mins",
      "baseKcal": 560,
      "baseProtein": 44,
      "baseCarbs": 62,
      "baseFat": 14,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "ar-l1",
          "name": "Chicken Breast, Jasmine Rice & Broccoli",
          "portion": "1 serving",
          "costUsd": 4.8
        }
      ],
      "instructions": [
        "Sear chicken, glaze with teriyaki sauce, serve over rice."
      ],
      "budgetTips": "High protein-per-dollar ratio with zero waste."
    },
    {
      "id": "alt-as-l2",
      "type": "lunch",
      "title": "Korean Rainbow Bibimbap Bowl with Lean Beef",
      "subtitle": "Rice bowl topped with seasoned greens, carrots, beef, and sunny egg",
      "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Hot Bowl",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 15,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "ar-l2",
          "name": "Lean Beef, Rice, Spinach & Egg",
          "portion": "1 serving",
          "costUsd": 4.9
        }
      ],
      "instructions": [
        "Arrange sautéed vegetables and beef over rice with an egg."
      ],
      "budgetTips": "Combines 5 colorful veggies with lean iron-rich protein."
    }
  ],
  "dinner": [
    {
      "id": "alt-as-d1",
      "type": "dinner",
      "title": "Authentic Japanese Shoyu Ramen with Chashu",
      "subtitle": "Savory broth with noodles, braised chicken, soft-boiled egg, and nori",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Deep Soup Bowl",
      "prepTime": "20 Mins",
      "baseKcal": 590,
      "baseProtein": 42,
      "baseCarbs": 68,
      "baseFat": 16,
      "costUsd": 4.8,
      "ingredients": [
        {
          "id": "ar-d1",
          "name": "Ramen Noodles, Chicken, Egg & Broth",
          "portion": "1 serving",
          "costUsd": 4.8
        }
      ],
      "instructions": [
        "Boil noodles 2 mins; pour hot broth and arrange toppings."
      ],
      "budgetTips": "Deep umami comfort food made at 75% savings over restaurants."
    },
    {
      "id": "alt-as-d2",
      "type": "dinner",
      "title": "Thai Green Coconut Curry with Chicken",
      "subtitle": "Fragrant coconut curry with chicken, bamboo shoots, and basil over rice",
      "image": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl Curry + Jasmine Rice",
      "prepTime": "20 Mins",
      "baseKcal": 580,
      "baseProtein": 40,
      "baseCarbs": 58,
      "baseFat": 20,
      "costUsd": 4.9,
      "ingredients": [
        {
          "id": "ar-d2",
          "name": "Chicken, Coconut Milk, Bamboo & Curry Paste",
          "portion": "1 serving",
          "costUsd": 4.9
        }
      ],
      "instructions": [
        "Simmer curry paste with coconut milk, add chicken and bamboo shoots."
      ],
      "budgetTips": "MCT coconut fats deliver stable, long-lasting energy."
    }
  ],
  "snack": [
    {
      "id": "alt-as-s1",
      "type": "snack",
      "title": "Warm Sea Salt & Garlic Edamame Pods",
      "subtitle": "Steamed green soybeans in pod dusted with flaky sea salt",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      "servingSize": "1 Bowl (150g)",
      "prepTime": "4 Mins",
      "baseKcal": 180,
      "baseProtein": 17,
      "baseCarbs": 14,
      "baseFat": 6,
      "costUsd": 1.6,
      "ingredients": [
        {
          "id": "ar-s1",
          "name": "Edamame Pods & Sea Salt",
          "portion": "150g",
          "costUsd": 1.6
        }
      ],
      "instructions": [
        "Steam 4 minutes and sprinkle with sea salt."
      ],
      "budgetTips": "Rich plant-based protein with high natural fiber."
    },
    {
      "id": "alt-as-s2",
      "type": "snack",
      "title": "Fresh Vietnamese Summer Rice Paper Rolls",
      "subtitle": "Chilled rice paper rolls with shrimp, mint, and peanut dip",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "servingSize": "2 Rolls",
      "prepTime": "8 Mins",
      "baseKcal": 210,
      "baseProtein": 14,
      "baseCarbs": 26,
      "baseFat": 6,
      "costUsd": 2.2,
      "ingredients": [
        {
          "id": "ar-s2",
          "name": "Rice Paper, Shrimp, Herbs & Peanut Sauce",
          "portion": "2 rolls",
          "costUsd": 2.2
        }
      ],
      "instructions": [
        "Wrap shrimp, herbs, and greens in moistened rice paper."
      ],
      "budgetTips": "Fresh, hydrating, and low-calorie pre-workout snack."
    }
  ]
};

export function getAsianMealCostUsd(meal: AsianMeal): number {
  if (meal.costUsd && meal.costUsd > 0) return meal.costUsd;
  let total = 0;
  for (const ing of meal.ingredients || []) {
    total += ing.costUsd || 0.5;
  }
  return Number(total.toFixed(2)) || 3.50;
}

export function getDayNumberFromDate(date: Date): number {
  const dom = date.getDate();
  if (dom > 30) return 30;
  return Math.max(1, dom);
}

export function formatDietDate(date: Date): { displayTitle: string; fullDateString: string; isToday: boolean } {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options);

  let displayTitle = formatted;
  if (isToday) {
    displayTitle = `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const fullDateString = `${y}-${m}-${d}`;

  return { displayTitle, fullDateString, isToday };
}
