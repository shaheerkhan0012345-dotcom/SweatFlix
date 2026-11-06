// =============================================================================
// PAKISTANI BUDGET-FRIENDLY DIET PLAN DATA & INGREDIENT COST ENGINE
// Real Pakistani Market Rates (PKR) • 30 Unique Days • Configurable
// =============================================================================

export interface IngredientItem {
  id: string;
  name: string;
  portion: string;
  quantityValue: number; // in base units (e.g. grams, pieces, ml)
  unit: 'g' | 'piece' | 'ml' | 'pinch' | 'tbsp' | 'cup';
  costPkr: number;
  costUsd?: number;
}

export const FOOD_IMAGES = {
  eggs_roti: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
  desi_omelette: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&auto=format&fit=crop&q=80',
  boiled_eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
  egg_bhurji: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  daal_tadka: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  rice_daal: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  daal_chawal: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  chana_chaat: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
  chana_pulao: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  biryani: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
  chicken_karahi: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
  chicken_curry: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
  egg_curry: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
  lobia_curry: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
  sabzi_curry: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  palak_paneer_sabzi: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  khichri: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
  seekh_kebab: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  daliya_oats: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop&q=80',
  fruit_snack: 'https://images.unsplash.com/photo-1536511135899-792750e32644?w=600&auto=format&fit=crop&q=80',
  roasted_chana: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80',
  yogurt_snack: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
  banana_kela: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
  fish_curry: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  shakshuka_anda: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80',
  fallback: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
};

export function getMatchingMealImage(title: string, type: string = 'lunch'): string {
  const t = (title || '').toLowerCase();
  if (t.includes('bhurji') || t.includes('scramble') || t.includes('khagina')) return FOOD_IMAGES.egg_bhurji;
  if (t.includes('boiled egg') || t.includes('ublay anday')) return FOOD_IMAGES.boiled_eggs;
  if (t.includes('omelette') || t.includes('omlet')) return FOOD_IMAGES.desi_omelette;
  if (t.includes('biryani')) return FOOD_IMAGES.biryani;
  if (t.includes('pulao')) return FOOD_IMAGES.chana_pulao;
  if (t.includes('karahi') || t.includes('tikka') || t.includes('qeema')) return FOOD_IMAGES.chicken_karahi;
  if (t.includes('seekh') || t.includes('kebab') || t.includes('shami')) return FOOD_IMAGES.seekh_kebab;
  if (t.includes('machli') || t.includes('fish')) return FOOD_IMAGES.fish_curry;
  if (t.includes('khichri') || t.includes('khichdi')) return FOOD_IMAGES.khichri;
  if (t.includes('rice') || t.includes('chawal')) return FOOD_IMAGES.daal_chawal;
  if (t.includes('daal') || t.includes('dal') || t.includes('lentil')) return FOOD_IMAGES.daal_tadka;
  if (t.includes('chana') || t.includes('chickpea')) {
    if (type === 'snack') return FOOD_IMAGES.roasted_chana;
    return FOOD_IMAGES.chana_chaat;
  }
  if (t.includes('lobia') || t.includes('bean') || t.includes('kidney') || t.includes('rajma')) return FOOD_IMAGES.lobia_curry;
  if (t.includes('chicken') || t.includes('murgh') || t.includes('shorba') || t.includes('yakhni') || t.includes('nihari') || t.includes('korma')) return FOOD_IMAGES.chicken_curry;
  if (t.includes('daliya') || t.includes('oat') || t.includes('porridge') || t.includes('halwa')) return FOOD_IMAGES.daliya_oats;
  if (t.includes('kela') || t.includes('banana')) return FOOD_IMAGES.banana_kela;
  if (t.includes('guava') || t.includes('amrood') || t.includes('fruit') || t.includes('apple') || t.includes('anar') || t.includes('watermelon') || t.includes('orange')) return FOOD_IMAGES.fruit_snack;
  if (t.includes('sabzi') || t.includes('palak') || t.includes('bhindi') || t.includes('tori') || t.includes('vegetable') || t.includes('aloo') || t.includes('gobi') || t.includes('karela') || t.includes('baingan') || t.includes('matar') || t.includes('tinda') || t.includes('kaddu') || t.includes('methi')) return FOOD_IMAGES.sabzi_curry;
  if (t.includes('curry') && (t.includes('egg') || t.includes('anda'))) return FOOD_IMAGES.egg_curry;
  if (t.includes('yogurt') || t.includes('dahi') || t.includes('lassi') || t.includes('raita') || t.includes('chaas')) return FOOD_IMAGES.yogurt_snack;
  if (t.includes('egg') || t.includes('chilla') || t.includes('anda')) return FOOD_IMAGES.eggs_roti;
  if (type === 'snack') return FOOD_IMAGES.roasted_chana;
  if (type === 'breakfast') return FOOD_IMAGES.eggs_roti;
  if (type === 'lunch') return FOOD_IMAGES.daal_tadka;
  if (type === 'dinner') return FOOD_IMAGES.chicken_curry;
  return FOOD_IMAGES.fallback;
}

export function getMatchingServingSize(title: string, type: string = 'lunch'): string {
  const t = (title || '').toLowerCase();
  if (t.includes('roti') && (t.includes('2') || t.includes('two'))) return '2 Whole Wheat Rotis + 1 Bowl Main';
  if (t.includes('roti') && (t.includes('1') || t.includes('one'))) return '1 Whole Wheat Roti + 1 Bowl Main';
  if (t.includes('rice')) return '1 Plate Steamed Rice (Approx. 200g) + 1 Bowl';
  if (t.includes('khichri')) return '1 Medium Bowl Khichri (Approx. 250g) + Dahi';
  if (t.includes('daliya') || t.includes('oats')) return '1 Bowl Porridge (Approx. 250ml) + Fruit';
  if (type === 'snack') return '1 Medium Serving (Approx. 120g)';
  return '1 Standard Serving (Approx. 300g)';
}

export interface PakistaniMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  subtitle: string;
  image?: string;
  servingSize?: string;
  prepTime: string;
  baseKcal: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  costUsd?: number;
  ingredients: IngredientItem[];
  instructions: string[];
  budgetTips: string;
  affordableSubstitutes?: {
    name: string;
    description: string;
    savingsPkr: number;
    costUsd?: number;
    kcalDiff: number;
    proteinDiff: number;
  }[];
}

// Calculates realistic USD cost for a Pakistani meal based on authentic grocery prices
export function getPakistaniMealCostUsd(meal: PakistaniMeal): number {
  if (meal.costUsd && meal.costUsd > 0) return meal.costUsd;

  let total = 0;
  for (const ing of meal.ingredients) {
    if (ing.costUsd && ing.costUsd > 0) {
      total += ing.costUsd;
    } else {
      const n = (ing.name || '').toLowerCase();
      if (n.includes('egg')) total += 0.35 * (ing.quantityValue || 1);
      else if (n.includes('atta') || n.includes('roti') || n.includes('flour')) total += 0.25 * (ing.quantityValue ? ing.quantityValue / 40 : 1);
      else if (n.includes('chicken')) total += 1.80 * (ing.quantityValue ? ing.quantityValue / 150 : 1);
      else if (n.includes('daal') || n.includes('dal') || n.includes('lentil')) total += 0.70;
      else if (n.includes('chana') || n.includes('lobia') || n.includes('bean')) total += 0.75;
      else if (n.includes('rice') || n.includes('chawal')) total += 0.45;
      else if (n.includes('dahi') || n.includes('yogurt') || n.includes('milk')) total += 0.45;
      else if (n.includes('banana') || n.includes('fruit') || n.includes('apple')) total += 0.65;
      else if (n.includes('sabzi') || n.includes('vegetable') || n.includes('aloo') || n.includes('gobi') || n.includes('palak')) total += 0.60;
      else total += 0.30;
    }
  }

  if (total <= 0.5) {
    if (meal.type === 'breakfast') total = 1.65;
    else if (meal.type === 'lunch') total = 2.40;
    else if (meal.type === 'dinner') total = 2.85;
    else total = 0.95;
  }

  return Number(total.toFixed(2));
}

// Deterministically maps a calendar Date to Day 1-30 so meals change by date without randomness
export function getDayNumberFromDate(date: Date): number {
  const dom = date.getDate();
  if (dom > 30) return 30;
  return Math.max(1, dom);
}

// Formats a Date object for the clean daily Diet header
export function formatDietDate(date: Date): { displayTitle: string; fullDateString: string; isToday: boolean } {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options);

  let displayTitle = formatted;
  if (isToday) displayTitle = `Today • ${formatted}`;
  else if (isYesterday) displayTitle = `Yesterday • ${formatted}`;
  else if (isTomorrow) displayTitle = `Tomorrow • ${formatted}`;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const fullDateString = `${y}-${m}-${d}`;

  return { displayTitle, fullDateString, isToday };
}

export interface DayDietPlan {
  dayNumber: number;
  dayTitle: string;
  theme: string;
  breakfast: PakistaniMeal;
  lunch: PakistaniMeal;
  dinner: PakistaniMeal;
  snack: PakistaniMeal;
}

export interface UserDietPreferences {
  budgetPkr: number; // daily in user currency
  budgetPeriod: 'daily' | 'monthly';
  currency?: string; // 'PKR' | 'USD' | 'EUR' | 'GBP' | 'INR'
  country?: string; // user country / region
  goal: 'muscle_gain' | 'fat_loss' | 'general_health' | 'lean_athletic';
  preference: 'all' | 'eggetarian' | 'vegetarian' | 'high_protein' | 'ultra_budget';
  allergies: string[];
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
}

// =============================================================================
// 1. BASELINE INGREDIENT PRICE DATABASE (PKR) - Configurable Pakistani Bazaar Rates
// =============================================================================
export const DEFAULT_PKR_PRICES: Record<string, { name: string; unitPrice: number; unitLabel: string }> = {
  egg: { name: 'Farm Egg', unitPrice: 28, unitLabel: 'per egg' },
  atta: { name: 'Chakki Whole Wheat Atta', unitPrice: 140, unitLabel: 'per kg' }, // ~Rs. 6-7 per roti
  moong_daal: { name: 'Moong Daal (Yellow/Green)', unitPrice: 320, unitLabel: 'per kg' },
  masoor_daal: { name: 'Masoor Daal (Red Lentil)', unitPrice: 300, unitLabel: 'per kg' },
  chana_daal: { name: 'Chana Daal (Split Bengal Gram)', unitPrice: 280, unitLabel: 'per kg' },
  safaid_chana: { name: 'Safaid Chana (White Chickpeas)', unitPrice: 360, unitLabel: 'per kg' },
  kala_chana: { name: 'Kala Chana (Black Chickpeas)', unitPrice: 320, unitLabel: 'per kg' },
  lobia: { name: 'Lobia / Black-Eyed Peas / Red Kidney Beans', unitPrice: 340, unitLabel: 'per kg' },
  rice: { name: 'Basmati / Sela Rice', unitPrice: 300, unitLabel: 'per kg' },
  daliya: { name: 'Wheat Daliya / Porridge', unitPrice: 220, unitLabel: 'per kg' },
  oats: { name: 'Rolled / Steel Cut Oats', unitPrice: 420, unitLabel: 'per kg' },
  chicken: { name: 'Chicken (Bone-in or Breast)', unitPrice: 700, unitLabel: 'per kg' },
  milk: { name: 'Fresh Buffalo/Cow Milk', unitPrice: 220, unitLabel: 'per liter' },
  yogurt: { name: 'Plain Dahi / Yogurt', unitPrice: 240, unitLabel: 'per kg' },
  seasonal_sabzi: { name: 'Seasonal Sabzi (Bhindi/Tori/Palak/Kaddu)', unitPrice: 160, unitLabel: 'per kg' },
  aloo: { name: 'Aloo (Potatoes)', unitPrice: 80, unitLabel: 'per kg' },
  onion_tomato_masala: { name: 'Onions, Tomatoes, Ginger, Garlic, Spices', unitPrice: 25, unitLabel: 'per serving' },
  cooking_oil: { name: 'Cooking Oil / Ghee', unitPrice: 450, unitLabel: 'per liter' },
  kela: { name: 'Kela (Banana)', unitPrice: 18, unitLabel: 'per banana' },
  amrood: { name: 'Amrood (Guava) / Seasonal Fruit', unitPrice: 140, unitLabel: 'per kg' },
  roasted_chana: { name: 'Bhuna Chana (Roasted Gram)', unitPrice: 480, unitLabel: 'per kg' },
};

// =============================================================================
// HELPER: Calculate ingredient cost
// =============================================================================
export function calculateItemCost(
  ingredientKey: string,
  amount: number,
  priceDb: Record<string, { name: string; unitPrice: number; unitLabel: string }> = DEFAULT_PKR_PRICES
): number {
  const item = priceDb[ingredientKey];
  if (!item) return 15;

  if (ingredientKey === 'egg' || ingredientKey === 'kela') {
    return Math.round(item.unitPrice * amount);
  }
  if (ingredientKey === 'onion_tomato_masala') {
    return Math.round(item.unitPrice * amount);
  }
  if (item.unitLabel.includes('kg') || item.unitLabel.includes('liter')) {
    // amount in grams or ml
    return Math.round((item.unitPrice / 1000) * amount);
  }
  return 20;
}

// =============================================================================
// 2. 30-DAY MEAL LIBRARY (Authentic Pakistani Staples, Nutrition & Costing)
// =============================================================================

export const THIRTY_DAY_PAKISTANI_PLAN: DayDietPlan[] = [
  // ---------------------------------------------------------------------------
  // WEEK 1 (Days 1 - 7: User-Specified Foundation)
  // ---------------------------------------------------------------------------
  {
    dayNumber: 1,
    dayTitle: 'Day 1: Classic High-Protein Foundation',
    theme: 'Eggs, Red Masoor & Seasonal Greens',
    breakfast: {
      id: 'd1-b',
      type: 'breakfast',
      title: '2 Farm Eggs & 2 Whole Wheat Roti',
      subtitle: 'Soft double egg scramble cooked in 1 tsp oil with warm desi atta roti',
      prepTime: '10 Mins',
      baseKcal: 420,
      baseProtein: 22,
      baseCarbs: 48,
      baseFat: 14,
      ingredients: [
        { id: 'i-1', name: 'Farm Eggs', portion: '2 whole eggs', quantityValue: 2, unit: 'piece', costPkr: 56 },
        { id: 'i-2', name: 'Chakki Whole Wheat Flour (Atta)', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-3', name: 'Cooking Oil / Ghee', portion: '1 tsp (5ml)', quantityValue: 5, unit: 'ml', costPkr: 3 },
        { id: 'i-4', name: 'Green Chili, Onion & Coriander', portion: 'Handful', quantityValue: 1, unit: 'pinch', costPkr: 5 },
      ],
      instructions: [
        'Whisk 2 eggs with a pinch of salt, diced onion, and green chilies.',
        'Heat 1 tsp oil on a tawa and lightly scramble or fry as an omelette.',
        'Cook 2 whole wheat rotis on hot tawa and serve with the hot eggs.',
      ],
      budgetTips: 'Buy eggs in a tray of 30 from local wholesale mart to save Rs. 3 per egg.',
      affordableSubstitutes: [
        { name: '1 Egg + 30g Besan (Gram Flour)', description: 'Make a fluffy besan-egg chilla if eggs become expensive.', savingsPkr: 15, kcalDiff: -10, proteinDiff: -2 },
      ],
    },
    lunch: {
      id: 'd1-l',
      type: 'lunch',
      title: 'Masoor Daal Tadka with 2 Whole Wheat Roti',
      subtitle: 'Nutrient-rich red split lentils with garlic cumin tadka & fresh cucumber salad',
      prepTime: '20 Mins',
      baseKcal: 480,
      baseProtein: 24,
      baseCarbs: 76,
      baseFat: 9,
      ingredients: [
        { id: 'i-5', name: 'Red Masoor Daal (Dry)', portion: '70g raw (1 big bowl cooked)', quantityValue: 70, unit: 'g', costPkr: 22 },
        { id: 'i-6', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-7', name: 'Garlic, Cumin & Oil Tadka', portion: '1.5 tsp oil + garlic', quantityValue: 8, unit: 'ml', costPkr: 8 },
        { id: 'i-8', name: 'Cucumber & Onion Salad', portion: '1 small bowl', quantityValue: 100, unit: 'g', costPkr: 12 },
      ],
      instructions: [
        'Boil soaked masoor daal with turmeric, salt, and water until thick and tender (15 mins).',
        'In a small pan, heat oil with sliced garlic cloves and zeera until fragrant, then pour sizzling tadka into daal.',
        'Serve with 2 hot rotis and freshly sliced kheera (cucumber).',
      ],
      budgetTips: 'Masoor daal cooks fast with zero pre-soaking, saving kitchen gas/electricity.',
    },
    dinner: {
      id: 'd1-d',
      type: 'dinner',
      title: 'Seasonal Sabzi (Palak/Bhindi) & 2 Roti',
      subtitle: 'Lightly spiced seasonal green vegetables cooked in mild onion-tomato gravy',
      prepTime: '20 Mins',
      baseKcal: 410,
      baseProtein: 14,
      baseCarbs: 64,
      baseFat: 11,
      ingredients: [
        { id: 'i-9', name: 'Seasonal Sabzi (Tori / Bhindi / Palak)', portion: '200g', quantityValue: 200, unit: 'g', costPkr: 32 },
        { id: 'i-10', name: 'Onion, Tomato & Masala', portion: '1 serving base', quantityValue: 1, unit: 'piece', costPkr: 18 },
        { id: 'i-11', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-12', name: 'Cooking Oil', portion: '1.5 tsp (8ml)', quantityValue: 8, unit: 'ml', costPkr: 5 },
      ],
      instructions: [
        'Sauté sliced onions and tomatoes with haldi, lal mirch, and zeera until soft.',
        'Add sliced seasonal sabzi, cover and cook on low dum for 12-15 minutes until tender.',
        'Pair with 2 fresh whole wheat rotis.',
      ],
      budgetTips: 'Always buy sabzi in the evening at local street mandis when vendors offer discounts.',
    },
    snack: {
      id: 'd1-s',
      type: 'snack',
      title: 'Seasonal Guava (Amrood) with Chaat Masala',
      subtitle: 'Fiber-loaded fresh Pakistani guava rich in Vitamin C and natural digestive enzymes',
      prepTime: '2 Mins',
      baseKcal: 95,
      baseProtein: 3,
      baseCarbs: 20,
      baseFat: 1,
      ingredients: [
        { id: 'i-13', name: 'Fresh Guava (Amrood)', portion: '1 medium (150g)', quantityValue: 150, unit: 'g', costPkr: 20 },
        { id: 'i-14', name: 'Chaat Masala & Kala Namak', portion: 'Pinch', quantityValue: 1, unit: 'pinch', costPkr: 2 },
      ],
      instructions: ['Wash and slice fresh guava into rounds. Sprinkle chaat masala and enjoy as midday fuel.'],
      budgetTips: 'Guava has 4x more Vitamin C than oranges and costs less than half the price.',
    },
  },

  {
    dayNumber: 2,
    dayTitle: 'Day 2: Sustained Plant Energy & Egg Bhurji',
    theme: 'Safaid Chana, Moong Daal & Spiced Egg Mash',
    breakfast: {
      id: 'd2-b',
      type: 'breakfast',
      title: 'Boiled Chana Chaat & 1 Whole Wheat Roti',
      subtitle: 'High-protein boiled chickpeas seasoned with lemon, onion, tomato & light cumin',
      prepTime: '8 Mins',
      baseKcal: 430,
      baseProtein: 19,
      baseCarbs: 68,
      baseFat: 8,
      ingredients: [
        { id: 'i-15', name: 'Boiled White / Black Chickpeas', portion: '100g cooked', quantityValue: 60, unit: 'g', costPkr: 22 },
        { id: 'i-16', name: 'Whole Wheat Atta', portion: '45g (1 roti)', quantityValue: 45, unit: 'g', costPkr: 8 },
        { id: 'i-17', name: 'Diced Onion, Tomato, Green Chili & Lemon', portion: '1 bowl', quantityValue: 1, unit: 'piece', costPkr: 14 },
      ],
      instructions: [
        'Toss pre-boiled chickpeas with chopped onion, tomato, lemon juice, and roasted cumin powder.',
        'Enjoy alongside 1 freshly puffed hot roti.',
      ],
      budgetTips: 'Boil 500g of chickpeas once on Sunday and store in freezer bags for the whole week.',
    },
    lunch: {
      id: 'd2-l',
      type: 'lunch',
      title: 'Steamed Rice with Moong Daal & Mint Chutney',
      subtitle: 'Easy-to-digest yellow moong dal over fragrant steamed rice with homemade pudina dahi chutney',
      prepTime: '20 Mins',
      baseKcal: 510,
      baseProtein: 21,
      baseCarbs: 88,
      baseFat: 7,
      ingredients: [
        { id: 'i-18', name: 'Moong Daal (Dhuli)', portion: '70g raw (1 large bowl)', quantityValue: 70, unit: 'g', costPkr: 24 },
        { id: 'i-19', name: 'Basmati Rice', portion: '75g raw (1 plate cooked)', quantityValue: 75, unit: 'g', costPkr: 24 },
        { id: 'i-20', name: 'Dahi (Yogurt) for Mint Raita', portion: '50g', quantityValue: 50, unit: 'g', costPkr: 12 },
        { id: 'i-21', name: 'Garlic & Cumin Tadka', portion: '1 tsp oil', quantityValue: 5, unit: 'ml', costPkr: 5 },
      ],
      instructions: [
        'Cook moong daal until soft and golden with haldi and salt. Add light zeera garlic tadka.',
        'Boil rice until fluffy. Mix fresh mint, green chili, and yogurt for refreshing side raita.',
      ],
      budgetTips: 'Moong daal + rice forms a complete amino acid protein profile at very low cost.',
    },
    dinner: {
      id: 'd2-d',
      type: 'dinner',
      title: 'Spiced Desi Egg Bhurji & 2 Roti',
      subtitle: 'Street-style scrambled eggs with onions, green chilies, tomatoes, and garam masala',
      prepTime: '10 Mins',
      baseKcal: 430,
      baseProtein: 22,
      baseCarbs: 50,
      baseFat: 15,
      ingredients: [
        { id: 'i-22', name: 'Farm Eggs', portion: '2 whole eggs', quantityValue: 2, unit: 'piece', costPkr: 56 },
        { id: 'i-23', name: 'Onion, Tomato & Masala', portion: '1 serving base', quantityValue: 1, unit: 'piece', costPkr: 15 },
        { id: 'i-24', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-25', name: 'Cooking Oil', portion: '1 tsp (5ml)', quantityValue: 5, unit: 'ml', costPkr: 3 },
      ],
      instructions: [
        'Sauté finely diced onions, green chilies, and tomatoes in 1 tsp oil until translucent.',
        'Crack in 2 eggs, stir continuously on medium heat until curds form and spices blend.',
        'Serve with 2 warm chakki rotis.',
      ],
      budgetTips: 'Egg bhurji stretches 2 eggs into a visually generous, satisfying family dish.',
    },
    snack: {
      id: 'd2-s',
      type: 'snack',
      title: 'Handful Roasted Chana (Bhuna Chana)',
      subtitle: 'Crunchy dry-roasted chickpeas with zero added oil, high in plant protein and satiety',
      prepTime: '1 Min',
      baseKcal: 140,
      baseProtein: 8,
      baseCarbs: 22,
      baseFat: 3,
      ingredients: [
        { id: 'i-26', name: 'Roasted Bengal Gram (Bhuna Chana)', portion: '35g (1 handful)', quantityValue: 35, unit: 'g', costPkr: 18 },
      ],
      instructions: ['Snack directly from the packet with a glass of tap or warm water.'],
      budgetTips: 'Keeps you full for 3 hours and beats packaged junk chips in cost and health.',
    },
  },

  {
    dayNumber: 3,
    dayTitle: 'Day 3: Fiber Boost & Hearty Lobia',
    theme: 'Warm Daliya, Red Kidney/Lobia & Mixed Veggie Daal',
    breakfast: {
      id: 'd3-b',
      type: 'breakfast',
      title: 'Warm Milk Daliya with Banana & Seeds',
      subtitle: 'Slow-cooked cracked whole wheat porridge cooked in half-milk half-water with sliced kela',
      prepTime: '15 Mins',
      baseKcal: 410,
      baseProtein: 14,
      baseCarbs: 72,
      baseFat: 7,
      ingredients: [
        { id: 'i-27', name: 'Cracked Wheat Daliya', portion: '60g raw', quantityValue: 60, unit: 'g', costPkr: 14 },
        { id: 'i-28', name: 'Fresh Milk', portion: '150ml', quantityValue: 150, unit: 'ml', costPkr: 33 },
        { id: 'i-29', name: 'Ripe Banana (Kela)', portion: '1 medium', quantityValue: 1, unit: 'piece', costPkr: 18 },
        { id: 'i-30', name: 'Brown Sugar / Gur (Optional)', portion: '1 tsp', quantityValue: 1, unit: 'pinch', costPkr: 3 },
      ],
      instructions: [
        'Dry roast daliya for 2 minutes until nutty. Add 200ml water and simmer until soft.',
        'Add 150ml warm milk and simmer for 3 minutes. Top with sliced banana coins.',
      ],
      budgetTips: 'Daliya is 50% cheaper than imported packaged rolled oats with identical nutritional benefits.',
    },
    lunch: {
      id: 'd3-l',
      type: 'lunch',
      title: 'Punjabi Lobia Curry with 2 Whole Wheat Roti',
      subtitle: 'Slow-cooked black-eyed peas / red beans in thick aromatic ginger-garlic gravy',
      prepTime: '25 Mins',
      baseKcal: 490,
      baseProtein: 22,
      baseCarbs: 80,
      baseFat: 9,
      ingredients: [
        { id: 'i-31', name: 'Lobia (Black-eyed / Red beans)', portion: '70g raw (1 big bowl)', quantityValue: 70, unit: 'g', costPkr: 24 },
        { id: 'i-32', name: 'Onion, Tomato, Ginger, Garlic', portion: 'Gravy base', quantityValue: 1, unit: 'piece', costPkr: 18 },
        { id: 'i-33', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-34', name: 'Cooking Oil', portion: '1.5 tsp (8ml)', quantityValue: 8, unit: 'ml', costPkr: 5 },
      ],
      instructions: [
        'Boil soaked lobia until tender. Make a base of fried onions, tomatoes, and ginger-garlic.',
        'Add boiled lobia with its broth and simmer until a thick, fragrant gravy forms.',
        'Serve with 2 hot rotis.',
      ],
      budgetTips: 'Lobia packs 24g of protein per 100g dry weight, matching chicken at 1/3rd of the cost.',
    },
    dinner: {
      id: 'd3-d',
      type: 'dinner',
      title: 'Mixed Seasonal Vegetable Curry with 1 Roti & Daal',
      subtitle: 'Comforting combination of seasonal sabzi and yellow daal with whole wheat roti',
      prepTime: '20 Mins',
      baseKcal: 420,
      baseProtein: 16,
      baseCarbs: 68,
      baseFat: 9,
      ingredients: [
        { id: 'i-35', name: 'Mixed Seasonal Vegetables (Gobi/Matar/Aloo)', portion: '180g', quantityValue: 180, unit: 'g', costPkr: 30 },
        { id: 'i-36', name: 'Cooked Moong/Masoor Daal', portion: '1 small bowl (40g dry)', quantityValue: 40, unit: 'g', costPkr: 14 },
        { id: 'i-37', name: 'Whole Wheat Atta', portion: '45g (1 roti)', quantityValue: 45, unit: 'g', costPkr: 8 },
        { id: 'i-38', name: 'Cooking Oil', portion: '1 tsp (5ml)', quantityValue: 5, unit: 'ml', costPkr: 3 },
      ],
      instructions: [
        'Cook mixed seasonal vegetables with cumin and mild spices.',
        'Serve accompanied by a bowl of warm daal and 1 whole wheat roti.',
      ],
      budgetTips: 'Using both daal and sabzi gives high micronutrients while keeping the meal lightweight at night.',
    },
    snack: {
      id: 'd3-s',
      type: 'snack',
      title: '1 Glass Fresh Mint Dahi Lassi (Namkeen)',
      subtitle: 'Probiotic-rich churned yogurt drink with roasted cumin and crushed fresh mint',
      prepTime: '3 Mins',
      baseKcal: 85,
      baseProtein: 5,
      baseCarbs: 7,
      baseFat: 4,
      ingredients: [
        { id: 'i-39', name: 'Fresh Dahi (Yogurt)', portion: '70g', quantityValue: 70, unit: 'g', costPkr: 16 },
        { id: 'i-40', name: 'Chilled Water & Roasted Zeera', portion: '150ml water', quantityValue: 1, unit: 'piece', costPkr: 2 },
      ],
      instructions: ['Blend yogurt with water, a pinch of black salt, and roasted cumin powder until frothy.'],
      budgetTips: 'A glass of homemade namkeen lassi aids digestion and costs under Rs. 20.',
    },
  },

  {
    dayNumber: 4,
    dayTitle: 'Day 4: Lean Poultry / High Protein Day',
    theme: 'Boiled Eggs, Chana Daal Rice & Lean Chicken / Double Daal',
    breakfast: {
      id: 'd4-b',
      type: 'breakfast',
      title: '2 Boiled Eggs & 2 Whole Wheat Roti with Black Pepper',
      subtitle: 'Clean hard-boiled farm eggs sliced with pink salt, cracked pepper & soft phulkas',
      prepTime: '8 Mins',
      baseKcal: 390,
      baseProtein: 22,
      baseCarbs: 48,
      baseFat: 12,
      ingredients: [
        { id: 'i-41', name: 'Farm Eggs', portion: '2 whole eggs', quantityValue: 2, unit: 'piece', costPkr: 56 },
        { id: 'i-42', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-43', name: 'Black Pepper & Salt', portion: 'Pinch', quantityValue: 1, unit: 'pinch', costPkr: 2 },
      ],
      instructions: [
        'Boil 2 eggs in boiling water for 8 minutes (hard-boiled). Peel and slice.',
        'Puff 2 whole wheat rotis on a direct flame. Sprinkle black pepper over eggs and enjoy.',
      ],
      budgetTips: 'Zero oil used in breakfast, saving fat calories and daily cooking oil expense.',
    },
    lunch: {
      id: 'd4-l',
      type: 'lunch',
      title: 'Chana Daal with Steamed Basmati Rice',
      subtitle: 'Hearty split yellow bengal gram simmered in cumin-curry leaf broth over fragrant rice',
      prepTime: '25 Mins',
      baseKcal: 520,
      baseProtein: 22,
      baseCarbs: 90,
      baseFat: 8,
      ingredients: [
        { id: 'i-44', name: 'Chana Daal (Dry)', portion: '70g raw', quantityValue: 70, unit: 'g', costPkr: 20 },
        { id: 'i-45', name: 'Basmati Rice', portion: '75g raw', quantityValue: 75, unit: 'g', costPkr: 24 },
        { id: 'i-46', name: 'Tadka (Oil, Zeera, Green Chili)', portion: '1 tsp oil', quantityValue: 5, unit: 'ml', costPkr: 5 },
        { id: 'i-47', name: 'Tomato Onion Salad', portion: '1 bowl', quantityValue: 1, unit: 'piece', costPkr: 12 },
      ],
      instructions: [
        'Boil chana daal with haldi and salt until soft but holding its distinct shape.',
        'Temper with zeera and green chili. Serve poured generously over warm steamed rice.',
      ],
      budgetTips: 'Chana daal has the lowest glycemic index among all pulses, preventing afternoon energy crashes.',
    },
    dinner: {
      id: 'd4-d',
      type: 'dinner',
      title: 'Desi Chicken Shorba (or Double Daal) with 2 Roti',
      subtitle: 'Light chicken curry with bone-in broth, aromatic spices & 2 whole wheat rotis',
      prepTime: '25 Mins',
      baseKcal: 460,
      baseProtein: 32,
      baseCarbs: 50,
      baseFat: 13,
      ingredients: [
        { id: 'i-48', name: 'Chicken (Bone-in or Breast)', portion: '130g', quantityValue: 130, unit: 'g', costPkr: 90 },
        { id: 'i-49', name: 'Onion, Tomato, Ginger, Garlic', portion: '1 serving base', quantityValue: 1, unit: 'piece', costPkr: 18 },
        { id: 'i-50', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-51', name: 'Cooking Oil', portion: '1.5 tsp (8ml)', quantityValue: 8, unit: 'ml', costPkr: 5 },
      ],
      instructions: [
        'Sauté onions, ginger, garlic, and spices. Add chicken and sear for 5 mins.',
        'Add 1.5 cups water, cover and simmer for 15 mins to form a rich bone shorba.',
        'Serve with 2 hot rotis.',
      ],
      budgetTips: 'Affordable bone-in chicken gives nutrient-rich collagen broth at half the price of boneless breast.',
      affordableSubstitutes: [
        {
          name: 'Double Masoor Daal + 1 Boiled Egg',
          description: 'If chicken is above daily budget, substitute with thick daal plus 1 egg to keep 28g protein!',
          savingsPkr: 55,
          kcalDiff: -20,
          proteinDiff: -4,
        },
      ],
    },
    snack: {
      id: 'd4-s',
      type: 'snack',
      title: '1 Cup Green Tea (Kawa) + 20g Roasted Chana',
      subtitle: 'Metabolism-stimulating green tea with cardamom paired with crunchy roasted chana',
      prepTime: '4 Mins',
      baseKcal: 85,
      baseProtein: 5,
      baseCarbs: 14,
      baseFat: 2,
      ingredients: [
        { id: 'i-52', name: 'Green Tea / Sabz Chai Bag', portion: '1 cup', quantityValue: 1, unit: 'piece', costPkr: 8 },
        { id: 'i-53', name: 'Roasted Chana', portion: '20g', quantityValue: 20, unit: 'g', costPkr: 10 },
      ],
      instructions: ['Brew green tea with crushed cardamom pod. Sip hot while snacking on roasted chana.'],
      budgetTips: 'Green tea leaves bought loose in bulk cost less than Rs. 5 per cup.',
    },
  },

  {
    dayNumber: 5,
    dayTitle: 'Day 5: Comfort Khichri & Egg Curry',
    theme: 'Kala Chana, Vegetable Khichri & Aloo-Egg Curry',
    breakfast: {
      id: 'd5-b',
      type: 'breakfast',
      title: 'Spiced Kala Chana & 1 Whole Wheat Roti',
      subtitle: 'Nutty black chickpeas tempered with mustard seeds, green chilies, and onion',
      prepTime: '10 Mins',
      baseKcal: 420,
      baseProtein: 18,
      baseCarbs: 66,
      baseFat: 8,
      ingredients: [
        { id: 'i-54', name: 'Boiled Kala Chana (Black Chickpeas)', portion: '90g raw equivalent', quantityValue: 60, unit: 'g', costPkr: 20 },
        { id: 'i-55', name: 'Whole Wheat Atta', portion: '45g (1 roti)', quantityValue: 45, unit: 'g', costPkr: 8 },
        { id: 'i-56', name: 'Onion, Green Chili & Cumin', portion: 'Handful', quantityValue: 1, unit: 'piece', costPkr: 10 },
      ],
      instructions: [
        'Warm pre-boiled kala chana in 1 tsp oil with cumin, chopped onions, and salt.',
        'Pair with 1 freshly rolled whole wheat roti.',
      ],
      budgetTips: 'Black chickpeas (kala chana) are significantly richer in iron and dietary fiber than white chickpeas.',
    },
    lunch: {
      id: 'd5-l',
      type: 'lunch',
      title: 'Vegetable Moong Khichri with Fresh Dahi',
      subtitle: 'Wholesome one-pot rice and yellow lentil khichri cooked with diced seasonal vegetables',
      prepTime: '20 Mins',
      baseKcal: 490,
      baseProtein: 18,
      baseCarbs: 84,
      baseFat: 8,
      ingredients: [
        { id: 'i-57', name: 'Basmati Rice', portion: '50g raw', quantityValue: 50, unit: 'g', costPkr: 16 },
        { id: 'i-58', name: 'Yellow Moong Daal', portion: '50g raw', quantityValue: 50, unit: 'g', costPkr: 16 },
        { id: 'i-59', name: 'Seasonal Vegetables (Carrot, Peas/Spinach)', portion: '80g', quantityValue: 80, unit: 'g', costPkr: 15 },
        { id: 'i-60', name: 'Fresh Dahi (Yogurt)', portion: '70g (1 bowl)', quantityValue: 70, unit: 'g', costPkr: 16 },
      ],
      instructions: [
        'In a pressure cooker or pot, sauté cumin, diced vegetables, rice, and moong daal.',
        'Add 3x water and cook until porridge-like and soft. Serve with a bowl of fresh dahi.',
      ],
      budgetTips: 'Khichri is the most cost-effective, gut-healing meal in South Asian cuisine.',
    },
    dinner: {
      id: 'd5-d',
      type: 'dinner',
      title: 'Aloo and Egg Curry (Desi Anda Aloo) & 2 Roti',
      subtitle: 'Hard-boiled farm eggs and tender potato cubes simmered in spiced onion-tomato gravy',
      prepTime: '20 Mins',
      baseKcal: 480,
      baseProtein: 22,
      baseCarbs: 58,
      baseFat: 16,
      ingredients: [
        { id: 'i-61', name: 'Farm Eggs', portion: '2 whole boiled eggs', quantityValue: 2, unit: 'piece', costPkr: 56 },
        { id: 'i-62', name: 'Aloo (Potato)', portion: '1 medium (100g)', quantityValue: 100, unit: 'g', costPkr: 8 },
        { id: 'i-63', name: 'Onion, Tomato & Masala', portion: '1 serving base', quantityValue: 1, unit: 'piece', costPkr: 18 },
        { id: 'i-64', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
      ],
      instructions: [
        'Boil 2 eggs and peel. In a pan, sauté onion and tomato gravy base with turmeric, red chili, and coriander powder.',
        'Add cubed potato and simmer until soft. Drop in the boiled eggs and simmer for 3 minutes.',
        'Serve hot with 2 whole wheat rotis.',
      ],
      budgetTips: 'Aloo-Anda curry delivers restaurant-level flavor at a fraction of the cost of meat.',
    },
    snack: {
      id: 'd5-s',
      type: 'snack',
      title: '1 Fresh Seasonal Banana (Kela)',
      subtitle: 'Natural pre-workout or afternoon potassium recharge with sustained carbohydrates',
      prepTime: '1 Min',
      baseKcal: 105,
      baseProtein: 1,
      baseCarbs: 27,
      baseFat: 0,
      ingredients: [
        { id: 'i-65', name: 'Banana (Kela)', portion: '1 medium', quantityValue: 1, unit: 'piece', costPkr: 18 },
      ],
      instructions: ['Peel and enjoy fresh.'],
      budgetTips: 'Bananas in Pakistan are available 365 days a year at an unbeatable price per calorie.',
    },
  },

  {
    dayNumber: 6,
    dayTitle: 'Day 6: Weekend Power & Plant Protein',
    theme: 'Desi Omelette, Lobia Curry & Green Vegetable Daal',
    breakfast: {
      id: 'd6-b',
      type: 'breakfast',
      title: 'Desi Street Omelette (2 Eggs) & 2 Roti',
      subtitle: 'Fluffy omelette packed with onions, tomatoes, coriander, green chilies, and zeera',
      prepTime: '10 Mins',
      baseKcal: 420,
      baseProtein: 22,
      baseCarbs: 48,
      baseFat: 14,
      ingredients: [
        { id: 'i-66', name: 'Farm Eggs', portion: '2 whole eggs', quantityValue: 2, unit: 'piece', costPkr: 56 },
        { id: 'i-67', name: 'Finely Chopped Onion, Tomato & Chilies', portion: 'Handful', quantityValue: 1, unit: 'piece', costPkr: 10 },
        { id: 'i-68', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-69', name: 'Cooking Oil', portion: '1 tsp (5ml)', quantityValue: 5, unit: 'ml', costPkr: 3 },
      ],
      instructions: [
        'Beat 2 eggs thoroughly with vegetables, salt, and red chili flakes.',
        'Pour into a hot greased tawa and cook both sides until golden brown.',
        'Serve with 2 freshly made whole wheat rotis.',
      ],
      budgetTips: 'Vegetable omelette adds fiber and volume so 2 eggs feel like a giant hearty breakfast.',
    },
    lunch: {
      id: 'd6-l',
      type: 'lunch',
      title: 'Rich Lobia Curry with 2 Whole Wheat Roti & Salad',
      subtitle: 'Kidney beans/black-eyed peas slow simmered in rich cumin gravy with fresh salad',
      prepTime: '25 Mins',
      baseKcal: 500,
      baseProtein: 23,
      baseCarbs: 82,
      baseFat: 9,
      ingredients: [
        { id: 'i-70', name: 'Lobia Beans (Raw)', portion: '75g', quantityValue: 75, unit: 'g', costPkr: 25 },
        { id: 'i-71', name: 'Onion, Tomato & Garlic Gravy', portion: '1 serving base', quantityValue: 1, unit: 'piece', costPkr: 18 },
        { id: 'i-72', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-73', name: 'Sliced Cucumber', portion: '1/2 cucumber', quantityValue: 70, unit: 'g', costPkr: 8 },
      ],
      instructions: [
        'Simmer pre-soaked lobia until buttery tender.',
        'Cook in an onion-tomato masala base until thick. Serve with 2 warm rotis and cucumber slices.',
      ],
      budgetTips: 'Soak beans overnight with a pinch of baking soda to cut boiling time in half.',
    },
    dinner: {
      id: 'd6-d',
      type: 'dinner',
      title: 'Masoor Daal with Palak (Spinach Lentils) & 2 Roti',
      subtitle: 'Iron-rich fresh spinach leaves wilted into comforting yellow and red lentil stew',
      prepTime: '20 Mins',
      baseKcal: 440,
      baseProtein: 21,
      baseCarbs: 72,
      baseFat: 8,
      ingredients: [
        { id: 'i-74', name: 'Red Masoor / Moong Daal', portion: '60g raw', quantityValue: 60, unit: 'g', costPkr: 19 },
        { id: 'i-75', name: 'Fresh Palak (Spinach)', portion: '100g chopped', quantityValue: 100, unit: 'g', costPkr: 16 },
        { id: 'i-76', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-77', name: 'Garlic Zeera Tadka', portion: '1 tsp oil', quantityValue: 5, unit: 'ml', costPkr: 4 },
      ],
      instructions: [
        'Boil lentils with turmeric and salt. Add shredded fresh spinach during the last 5 minutes of cooking.',
        'Temper with sizzling garlic and cumin seeds. Serve with 2 whole wheat rotis.',
      ],
      budgetTips: 'Spinach (palak) in Pakistani markets is one of the cheapest superfoods available.',
    },
    snack: {
      id: 'd6-s',
      type: 'snack',
      title: 'Fresh Seasonal Fruit (Guava or Orange)',
      subtitle: 'Juicy local vitamin booster with natural dietary hydration',
      prepTime: '2 Mins',
      baseKcal: 80,
      baseProtein: 2,
      baseCarbs: 18,
      baseFat: 0,
      ingredients: [
        { id: 'i-78', name: 'Guava / Seasonal Citrus', portion: '1 piece (140g)', quantityValue: 140, unit: 'g', costPkr: 20 },
      ],
      instructions: ['Slice and sprinkle with black salt.'],
      budgetTips: 'Buy fruit by the kilogram from pushcarts rather than air-conditioned grocery stores.',
    },
  },

  {
    dayNumber: 7,
    dayTitle: 'Day 7: Sunday Feast & Rebuild',
    theme: 'Warm Daliya, Chana Pulao & Chicken/Lobia Curry',
    breakfast: {
      id: 'd7-b',
      type: 'breakfast',
      title: 'Sweet Cardamom Daliya with Milk',
      subtitle: 'Aromatic whole cracked wheat cooked with crushed green elaichi and warm milk',
      prepTime: '15 Mins',
      baseKcal: 420,
      baseProtein: 15,
      baseCarbs: 74,
      baseFat: 7,
      ingredients: [
        { id: 'i-79', name: 'Wheat Daliya', portion: '60g raw', quantityValue: 60, unit: 'g', costPkr: 14 },
        { id: 'i-80', name: 'Fresh Milk', portion: '160ml', quantityValue: 160, unit: 'ml', costPkr: 35 },
        { id: 'i-81', name: 'Elaichi (Cardamom) & Gur/Sugar', portion: '1 tsp', quantityValue: 1, unit: 'piece', costPkr: 5 },
      ],
      instructions: [
        'Boil roasted daliya with water and crushed cardamom.',
        'Pour warm milk and stir until creamy and comforting.',
      ],
      budgetTips: 'Cardamom adds a royal Sunday breakfast aroma without adding significant expense.',
    },
    lunch: {
      id: 'd7-l',
      type: 'lunch',
      title: 'Traditional Chana Pulao with Onion-Mint Raita',
      subtitle: 'Fragrant basmati rice gently cooked with boiled white chickpeas and whole garam masalas',
      prepTime: '25 Mins',
      baseKcal: 540,
      baseProtein: 20,
      baseCarbs: 94,
      baseFat: 8,
      ingredients: [
        { id: 'i-82', name: 'Basmati Rice', portion: '80g raw', quantityValue: 80, unit: 'g', costPkr: 25 },
        { id: 'i-83', name: 'Safaid Chana (Boiled)', portion: '70g raw equivalent', quantityValue: 70, unit: 'g', costPkr: 25 },
        { id: 'i-84', name: 'Fresh Dahi for Raita', portion: '60g', quantityValue: 60, unit: 'g', costPkr: 14 },
        { id: 'i-85', name: 'Cooking Oil & Whole Spices', portion: '1.5 tsp (8ml)', quantityValue: 8, unit: 'ml', costPkr: 6 },
      ],
      instructions: [
        'Brown sliced onions with bay leaf, cloves, and cinnamon. Add boiled chickpeas and rice.',
        'Add 1.75 cups water and cook on dum until fluffy. Serve with cool dahi raita.',
      ],
      budgetTips: 'Chana pulao is the quintessential Pakistani Sunday lunch that feels festive while being budget-friendly.',
    },
    dinner: {
      id: 'd7-d',
      type: 'dinner',
      title: 'Chicken / Bean Curry with 2 Whole Wheat Roti',
      subtitle: 'Sunday dinner chicken curry or black bean curry with thick spiced salan & 2 rotis',
      prepTime: '25 Mins',
      baseKcal: 470,
      baseProtein: 32,
      baseCarbs: 52,
      baseFat: 14,
      ingredients: [
        { id: 'i-86', name: 'Chicken (or Black Beans/Lobia)', portion: '130g chicken', quantityValue: 130, unit: 'g', costPkr: 90 },
        { id: 'i-87', name: 'Curry Base (Onion, Tomato, Spices)', portion: '1 serving base', quantityValue: 1, unit: 'piece', costPkr: 18 },
        { id: 'i-88', name: 'Whole Wheat Atta', portion: '80g (2 rotis)', quantityValue: 80, unit: 'g', costPkr: 14 },
        { id: 'i-89', name: 'Cooking Oil', portion: '1.5 tsp (8ml)', quantityValue: 8, unit: 'ml', costPkr: 5 },
      ],
      instructions: [
        'Cook chicken pieces in an onion-tomato gravy with ginger-garlic and home spices until tender.',
        'Pair with 2 fresh whole wheat rotis.',
      ],
      budgetTips: 'Buying a whole dressed chicken and portioning it into 4-5 meals saves up to Rs. 150/kg.',
      affordableSubstitutes: [
        {
          name: 'Spiced Lobia Curry + 1 Boiled Egg',
          description: 'Swap chicken with lobia and an egg if budgeting strictly under Rs. 350 for the day.',
          savingsPkr: 55,
          kcalDiff: +10,
          proteinDiff: -3,
        },
      ],
    },
    snack: {
      id: 'd7-s',
      type: 'snack',
      title: '1 Boiled Egg with Black Salt',
      subtitle: 'Pure single-ingredient protein topper to round off the week',
      prepTime: '6 Mins',
      baseKcal: 78,
      baseProtein: 6,
      baseCarbs: 1,
      baseFat: 5,
      ingredients: [
        { id: 'i-90', name: 'Farm Egg', portion: '1 boiled egg', quantityValue: 1, unit: 'piece', costPkr: 28 },
      ],
      instructions: ['Boil, peel, sprinkle with black salt and eat warm.'],
      budgetTips: 'Fastest 6 grams of complete protein available in any kitchen.',
    },
  },
];

// =============================================================================
// 3. GENERATOR FOR FULL 30 DAYS (30 Complete, Distinct, Authentic Pakistani Days)
// =============================================================================

interface PkMealDef {
  t: string;
  s: string;
  img: string;
  serv: string;
  time: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  pkr: number;
  ing: { name: string; portion: string; qty: number; unit: 'g' | 'piece' | 'ml' | 'pinch' | 'tbsp' | 'cup'; pkr: number }[];
  inst: string[];
  tips: string;
}

const pkExtraDays: { b: PkMealDef; l: PkMealDef; d: PkMealDef; s: PkMealDef }[] = [
  // Day 8
  {
    b: {
      t: 'Soft Boiled Farm Eggs & 2 Whole Wheat Roti',
      s: '2 farm eggs soft-boiled with warm desi chakki atta roti and a pinch of black salt',
      img: FOOD_IMAGES.boiled_eggs,
      serv: '2 Eggs + 2 Rotis',
      time: '8 Mins',
      kcal: 400, p: 22, c: 46, f: 12, pkr: 85,
      ing: [
        { name: 'Farm Eggs', portion: '2 whole eggs', qty: 2, unit: 'piece', pkr: 56 },
        { name: 'Chakki Whole Wheat Atta', portion: '80g (2 rotis)', qty: 80, unit: 'g', pkr: 14 },
        { name: 'Black Salt & Cumin', portion: '1 pinch', qty: 1, unit: 'pinch', pkr: 5 },
        { name: 'Light Desi Ghee on Roti', portion: '1/2 tsp', qty: 2, unit: 'ml', pkr: 10 }
      ],
      inst: ['Boil eggs for 6 minutes, plunge in water, peel and serve with hot whole wheat rotis.'],
      tips: 'Soft boiling preserves the complete nutrient profile of lutein and choline.'
    },
    l: {
      t: 'Dhuli Maash Daal (White Lentils) with Garlic Tadka & Roti',
      s: 'Split white urad lentils simmered tender and tempered with sizzling garlic, cumin, and whole red chilies',
      img: FOOD_IMAGES.daal_tadka,
      serv: '1 Bowl Daal + 2 Rotis',
      time: '20 Mins',
      kcal: 480, p: 25, c: 74, f: 9, pkr: 95,
      ing: [
        { name: 'Maash Daal (White Lentils)', portion: '70g raw', qty: 70, unit: 'g', pkr: 32 },
        { name: 'Whole Wheat Atta', portion: '80g (2 rotis)', qty: 80, unit: 'g', pkr: 14 },
        { name: 'Garlic & Zeera Tadka', portion: '1.5 tsp oil + garlic', qty: 8, unit: 'ml', pkr: 12 },
        { name: 'Fresh Salad', portion: '1 small bowl', qty: 100, unit: 'g', pkr: 12 }
      ],
      inst: ['Boil soaked maash daal until tender with haldi and salt. Pour sizzling garlic-zeera tadka.'],
      tips: 'Maash daal contains the highest protein percentage among common Pakistani pulses.'
    },
    d: {
      t: 'Baingan Ka Bharta (Smoky Roasted Eggplant) & 2 Roti',
      s: 'Open-flame roasted eggplant mashed and cooked with onions, tomatoes, and ground spices',
      img: FOOD_IMAGES.sabzi_curry,
      serv: '1 Bowl Bharta + 2 Rotis',
      time: '22 Mins',
      kcal: 390, p: 13, c: 62, f: 10, pkr: 80,
      ing: [
        { name: 'Fresh Large Eggplant (Baingan)', portion: '250g', qty: 250, unit: 'g', pkr: 25 },
        { name: 'Onion, Tomato & Masala', portion: '1 serving base', qty: 1, unit: 'piece', pkr: 18 },
        { name: 'Whole Wheat Atta', portion: '80g (2 rotis)', qty: 80, unit: 'g', pkr: 14 },
        { name: 'Cooking Oil', portion: '1.5 tsp (8ml)', qty: 8, unit: 'ml', pkr: 5 }
      ],
      inst: ['Roast eggplant directly on gas stove until charred, peel skin, mash, and sauté in tomato-onion masala.'],
      tips: 'Roasting eggplant on an open flame infuses deep restaurant-style smoky flavor at zero cost.'
    },
    s: {
      t: 'Fresh Sliced Apple with Pinch of Cinnamon',
      s: 'Crisp seasonal Pakistani apple sliced and dusted with aromatic cinnamon powder',
      img: FOOD_IMAGES.fruit_snack,
      serv: '1 Whole Apple',
      time: '2 Mins',
      kcal: 85, p: 1, c: 21, f: 0, pkr: 25,
      ing: [{ name: 'Fresh Apple', portion: '1 medium', qty: 1, unit: 'piece', pkr: 25 }],
      inst: ['Wash, core, slice into wedges and dust with cinnamon.'],
      tips: 'Cinnamon helps regulate post-meal blood sugar levels naturally.'
    }
  },

  // Day 9
  {
    b: {
      t: 'High-Protein Besan-Egg Chilla with Green Mint Chutney',
      s: 'Savory gram flour and egg pancake infused with chopped onions, green chilies, and fresh coriander',
      img: FOOD_IMAGES.eggs_roti,
      serv: '2 Large Chillas + Chutney',
      time: '10 Mins',
      kcal: 410, p: 24, c: 42, f: 14, pkr: 80,
      ing: [
        { name: 'Farm Egg', portion: '1 egg', qty: 1, unit: 'piece', pkr: 28 },
        { name: 'Besan (Gram Flour)', portion: '50g', qty: 50, unit: 'g', pkr: 18 },
        { name: 'Diced Onion, Chilies & Coriander', portion: 'Handful', qty: 1, unit: 'pinch', pkr: 10 },
        { name: 'Pudina Dahi Chutney', portion: '2 tbsp', qty: 30, unit: 'g', pkr: 10 }
      ],
      inst: ['Whisk besan with water, crack in 1 egg, add spices and pour on hot greased tawa until golden.'],
      tips: 'Gram flour is naturally gluten-free and packed with dense plant protein and prebiotic fiber.'
    },
    l: {
      t: 'Mix Panchmel Daal with Steamed Basmati Rice',
      s: 'Five-lentil wholesome blend (Moong, Masoor, Chana, Arhar, Urad) served over fragrant steamed rice',
      img: FOOD_IMAGES.daal_chawal,
      serv: '1 Plate Rice + 1 Large Bowl Daal',
      time: '25 Mins',
      kcal: 520, p: 22, c: 92, f: 8, pkr: 90,
      ing: [
        { name: 'Mixed Daal Blend', portion: '70g raw', qty: 70, unit: 'g', pkr: 25 },
        { name: 'Basmati Rice', portion: '75g raw', qty: 75, unit: 'g', pkr: 24 },
        { name: 'Tadka (Zeera, Garlic, Oil)', portion: '1.5 tsp oil', qty: 8, unit: 'ml', pkr: 8 },
        { name: 'Kachumber Salad', portion: '1 small bowl', qty: 80, unit: 'g', pkr: 10 }
      ],
      inst: ['Boil mixed lentils until thick and creamy, temper with zeera tadka, and pour over steamed rice.'],
      tips: 'Combining multiple pulses ensures a complete essential amino acid profile.'
    },
    d: {
      t: 'Chicken Seekh Kebab with Mint Raita & 2 Rotis',
      s: 'Lean minced chicken kebabs spiced with roasted cumin and coriander, paired with fresh whole wheat rotis',
      img: FOOD_IMAGES.seekh_kebab,
      serv: '2 Kebabs + 2 Rotis + Raita',
      time: '20 Mins',
      kcal: 490, p: 38, c: 50, f: 14, pkr: 160,
      ing: [
        { name: 'Chicken Mince (Qeema)', portion: '150g', qty: 150, unit: 'g', pkr: 110 },
        { name: 'Whole Wheat Atta', portion: '80g (2 rotis)', qty: 80, unit: 'g', pkr: 14 },
        { name: 'Mint Dahi Raita', portion: '50g', qty: 50, unit: 'g', pkr: 12 },
        { name: 'Onion, Ginger, Garlic Spices', portion: 'Seasoning base', qty: 1, unit: 'piece', pkr: 15 }
      ],
      inst: ['Mix seasoned chicken mince, shape onto skewers or patties, pan-sear on tawa with light oil spray.'],
      tips: 'Homemade chicken seekh kebabs provide 35g+ of pure lean protein at half the cost of dining out.'
    },
    s: {
      t: 'Spicy Boiled Chana Chaat Cup with Lemon',
      s: 'Pre-boiled white chickpeas tossed with diced onions, tomatoes, chaat masala, and a squeeze of fresh lemon',
      img: FOOD_IMAGES.chana_chaat,
      serv: '1 Cup (100g Cooked)',
      time: '3 Mins',
      kcal: 140, p: 8, c: 24, f: 2, pkr: 25,
      ing: [{ name: 'Boiled Chickpeas & Spices', portion: '1 cup', qty: 1, unit: 'piece', pkr: 25 }],
      inst: ['Toss boiled chickpeas with diced vegetables and lemon juice.'],
      tips: 'Zero added fat, high in satiety and dietary fiber.'
    }
  },

  // Day 10
  {
    b: {
      t: 'Yellow Moong Daal Cheela with Fresh Dahi',
      s: 'Light, crispy savory yellow lentil crepes served with a bowl of refreshing fresh dahi',
      img: FOOD_IMAGES.daal_tadka,
      serv: '2 Cheelas + 1 Bowl Dahi',
      time: '12 Mins',
      kcal: 390, p: 20, c: 54, f: 9, pkr: 75,
      ing: [
        { name: 'Yellow Moong Daal (Soaked & Ground)', portion: '60g raw', qty: 60, unit: 'g', pkr: 22 },
        { name: 'Fresh Dahi (Yogurt)', portion: '70g', qty: 70, unit: 'g', pkr: 16 },
        { name: 'Green Chilies & Ginger', portion: 'Handful', qty: 1, unit: 'pinch', pkr: 8 },
        { name: 'Cooking Oil', portion: '1 tsp', qty: 5, unit: 'ml', pkr: 4 }
      ],
      inst: ['Blend soaked moong daal with ginger and chilies into batter, cook on non-stick tawa like thin pancakes.'],
      tips: 'Cheelas digest easily and provide clean plant protein without any refined flour.'
    },
    l: {
      t: 'Authentic Desi Chicken Karahi with 2 Whole Wheat Rotis',
      s: 'Tender bone-in chicken cooked in a wok with fresh tomatoes, ginger juliennes, green chilies, and black pepper',
      img: FOOD_IMAGES.chicken_karahi,
      serv: '1 Bowl Karahi (150g Chicken) + 2 Rotis',
      time: '25 Mins',
      kcal: 540, p: 42, c: 52, f: 16, pkr: 175,
      ing: [
        { name: 'Fresh Chicken', portion: '180g raw', qty: 180, unit: 'g', pkr: 125 },
        { name: 'Tomatoes & Ginger Juliennes', portion: '2 medium tomatoes', qty: 150, unit: 'g', pkr: 20 },
        { name: 'Whole Wheat Atta', portion: '80g (2 rotis)', qty: 80, unit: 'g', pkr: 14 },
        { name: 'Cooking Oil', portion: '1.5 tsp (8ml)', qty: 8, unit: 'ml', pkr: 5 }
      ],
      inst: ['Sauté chicken on high heat, add ripe halved tomatoes and cover until soft, finish with ginger and chilies.'],
      tips: 'Pakistani chicken karahi gets its rich sauce purely from reduced fresh tomatoes, not heavy cream.'
    },
    d: {
      t: 'Shimla Mirch Qeema / Chicken Mince & 2 Rotis',
      s: 'Tender chicken mince sautéed with sweet green bell peppers and aromatic cumin gravy',
      img: FOOD_IMAGES.chicken_karahi,
      serv: '1 Bowl Qeema + 2 Rotis',
      time: '20 Mins',
      kcal: 480, p: 36, c: 50, f: 14, pkr: 155,
      ing: [
        { name: 'Chicken Mince (Qeema)', portion: '150g', qty: 150, unit: 'g', pkr: 110 },
        { name: 'Shimla Mirch (Bell Pepper)', portion: '1 large (100g)', qty: 100, unit: 'g', pkr: 18 },
        { name: 'Whole Wheat Atta', portion: '80g (2 rotis)', qty: 80, unit: 'g', pkr: 14 },
        { name: 'Onion, Tomato, Spices & Oil', portion: 'Base', qty: 1, unit: 'piece', pkr: 13 }
      ],
      inst: ['Brown mince with ginger-garlic and spices, fold in chopped bell peppers, cook on dum for 6 minutes.'],
      tips: 'Bell peppers provide abundant Vitamin C which triples iron absorption from the meat.'
    },
    s: {
      t: 'Spiced Namkeen Buttermilk (Chaas)',
      s: 'Chilled whipped yogurt drink with roasted cumin, mint leaves, and black rock salt',
      img: FOOD_IMAGES.yogurt_snack,
      serv: '1 Tall Glass (300ml)',
      time: '2 Mins',
      kcal: 80, p: 5, c: 8, f: 3, pkr: 20,
      ing: [{ name: 'Fresh Dahi & Spices', portion: '1 glass', qty: 1, unit: 'piece', pkr: 20 }],
      inst: ['Blend yogurt with chilled water, roasted zeera, and black salt.'],
      tips: 'A natural isotonic beverage that replenishes electrolytes during hot afternoons.'
    }
  }
];

// Complete systematic loop for days 11 to 30 with distinct authentic Desi dishes
const extraDayConfigs = [
  // Day 11
  {
    b: { t: 'Spiced Aloo-Anda Bhurji with 2 Warm Rotis', img: FOOD_IMAGES.egg_bhurji, kcal: 430, p: 20, c: 56, f: 14, pkr: 85 },
    l: { t: 'Kala Chana Shorba with Fragrant Zeera Rice', img: FOOD_IMAGES.daal_chawal, kcal: 510, p: 22, c: 88, f: 8, pkr: 85 },
    d: { t: 'Lauki (Bottle Gourd) Chana Daal & 2 Whole Wheat Rotis', img: FOOD_IMAGES.daal_tadka, kcal: 420, p: 18, c: 68, f: 9, pkr: 80 },
    s: { t: 'Fresh Pakistani Kinnow / Seasonal Orange', img: FOOD_IMAGES.fruit_snack, kcal: 70, p: 1, c: 17, f: 0, pkr: 20 }
  },
  // Day 12
  {
    b: { t: 'Desi Shakshuka (Eggs Poached in Onion-Tomato Gravy) & Roti', img: FOOD_IMAGES.shakshuka_anda, kcal: 420, p: 22, c: 46, f: 16, pkr: 85 },
    l: { t: 'Desi Palak Paneer / Palak Aloo with 2 Rotis', img: FOOD_IMAGES.palak_paneer_sabzi, kcal: 460, p: 18, c: 64, f: 14, pkr: 95 },
    d: { t: 'Masaledar Anda Curry with 2 Whole Wheat Rotis', img: FOOD_IMAGES.egg_curry, kcal: 460, p: 22, c: 52, f: 16, pkr: 90 },
    s: { t: 'Chilled Cucumber Coins with Lemon & Kala Namak', img: FOOD_IMAGES.fruit_snack, kcal: 45, p: 2, c: 9, f: 0, pkr: 15 }
  },
  // Day 13
  {
    b: { t: 'Whole Wheat Daliya with Almonds & Warm Milk', img: FOOD_IMAGES.daliya_oats, kcal: 410, p: 16, c: 68, f: 8, pkr: 80 },
    l: { t: 'Moong Daal Tadka with Dahi Cucumber Raita & 2 Rotis', img: FOOD_IMAGES.daal_tadka, kcal: 490, p: 23, c: 74, f: 9, pkr: 85 },
    d: { t: 'Aloo Palak (Potato Spinach) Curry & 2 Warm Rotis', img: FOOD_IMAGES.palak_paneer_sabzi, kcal: 420, p: 14, c: 68, f: 11, pkr: 75 },
    s: { t: 'Handful of Roasted Peanuts (Moongphali)', img: FOOD_IMAGES.roasted_chana, kcal: 160, p: 7, c: 6, f: 13, pkr: 20 }
  },
  // Day 14
  {
    b: { t: 'Paneer / Dahi Egg Scramble with 2 Rotis', img: FOOD_IMAGES.egg_bhurji, kcal: 440, p: 26, c: 48, f: 16, pkr: 95 },
    l: { t: 'Chicken Shami Kebab with Brown Basmati Rice & Kachumber', img: FOOD_IMAGES.seekh_kebab, kcal: 530, p: 38, c: 72, f: 10, pkr: 160 },
    d: { t: 'Desi Chicken Tikka Boti with Salad & 2 Rotis', img: FOOD_IMAGES.chicken_karahi, kcal: 490, p: 44, c: 48, f: 12, pkr: 165 },
    s: { t: 'Fresh Papaya / Melon Chunks with Chaat Masala', img: FOOD_IMAGES.fruit_snack, kcal: 80, p: 1, c: 20, f: 0, pkr: 25 }
  },
  // Day 15
  {
    b: { t: 'Desi Masala Egg Toast with Black Pepper & Elaichi Chai', img: FOOD_IMAGES.desi_omelette, kcal: 390, p: 20, c: 46, f: 14, pkr: 85 },
    l: { t: 'Slow-Cooked Daal Makhani with Whole Wheat Roti', img: FOOD_IMAGES.daal_tadka, kcal: 510, p: 24, c: 74, f: 12, pkr: 95 },
    d: { t: 'Bhindi Pyaz Fry with 2 Whole Wheat Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 410, p: 13, c: 64, f: 12, pkr: 80 },
    s: { t: '1 Boiled Farm Egg with Coarse Black Pepper', img: FOOD_IMAGES.boiled_eggs, kcal: 78, p: 6, c: 1, f: 5, pkr: 28 }
  },
  // Day 16
  {
    b: { t: 'Boiled Kala Chana Chaat with Lemon & Green Chili', img: FOOD_IMAGES.chana_chaat, kcal: 410, p: 19, c: 68, f: 7, pkr: 75 },
    l: { t: 'Matar Pulao (Sweet Pea Basmati Pulao) with Fresh Dahi', img: FOOD_IMAGES.chana_pulao, kcal: 510, p: 18, c: 88, f: 8, pkr: 90 },
    d: { t: 'Matar Paneer / Matar Aloo Curry & 2 Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 440, p: 16, c: 66, f: 12, pkr: 85 },
    s: { t: 'Crunchy Roasted Makhana (Lotus Seeds)', img: FOOD_IMAGES.roasted_chana, kcal: 120, p: 4, c: 22, f: 2, pkr: 30 }
  },
  // Day 17
  {
    b: { t: 'Palak Anda (Spinach Egg Scramble) with Roti', img: FOOD_IMAGES.egg_bhurji, kcal: 420, p: 23, c: 46, f: 15, pkr: 85 },
    l: { t: 'Traditional Punjabi Kadhi Pakora with Steamed Rice', img: FOOD_IMAGES.daal_chawal, kcal: 520, p: 19, c: 84, f: 12, pkr: 85 },
    d: { t: 'Yellow Daal Tadka with 2 Fresh Rotis & Lemon', img: FOOD_IMAGES.daal_tadka, kcal: 460, p: 22, c: 72, f: 8, pkr: 75 },
    s: { t: 'Fresh Mint Lemonade (Namkeen Shikinjvi)', img: FOOD_IMAGES.yogurt_snack, kcal: 50, p: 1, c: 12, f: 0, pkr: 15 }
  },
  // Day 18
  {
    b: { t: 'Rolled Oats with Desi Honey & Banana', img: FOOD_IMAGES.daliya_oats, kcal: 380, p: 14, c: 68, f: 6, pkr: 75 },
    l: { t: 'Tori Masala (Zucchini Salan) with 2 Rotis & Salad', img: FOOD_IMAGES.sabzi_curry, kcal: 420, p: 14, c: 66, f: 10, pkr: 75 },
    d: { t: 'Chicken Karahi (Desi Wok Chicken) with Salad & 2 Rotis', img: FOOD_IMAGES.chicken_karahi, kcal: 530, p: 42, c: 50, f: 15, pkr: 170 },
    s: { t: 'Fresh Pomegranate (Anar) Seeds', img: FOOD_IMAGES.fruit_snack, kcal: 90, p: 2, c: 21, f: 1, pkr: 35 }
  },
  // Day 19
  {
    b: { t: '2 Sunny Desi Fried Eggs with Zeera & 2 Rotis', img: FOOD_IMAGES.eggs_roti, kcal: 430, p: 22, c: 48, f: 16, pkr: 85 },
    l: { t: 'Crispy Bhindi Masala (Okra Fry) with 2 Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 430, p: 14, c: 66, f: 12, pkr: 80 },
    d: { t: 'Desi Anda Potato Salan with 2 Rotis', img: FOOD_IMAGES.egg_curry, kcal: 470, p: 22, c: 56, f: 15, pkr: 90 },
    s: { t: 'Roasted Bhuna Chana with Desi Gur', img: FOOD_IMAGES.roasted_chana, kcal: 150, p: 7, c: 26, f: 2, pkr: 20 }
  },
  // Day 20
  {
    b: { t: 'Spiced Safaid Chana Masala with 1 Desi Roti', img: FOOD_IMAGES.chana_chaat, kcal: 420, p: 18, c: 66, f: 8, pkr: 75 },
    l: { t: 'Desi Chicken Shorba with Steamed Basmati Rice', img: FOOD_IMAGES.chicken_curry, kcal: 520, p: 38, c: 72, f: 10, pkr: 165 },
    d: { t: 'Aloo Gobi Masala with 2 Fresh Whole Wheat Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 430, p: 14, c: 68, f: 11, pkr: 75 },
    s: { t: 'Chilled Sweet Watermelon Slices', img: FOOD_IMAGES.fruit_snack, kcal: 70, p: 1, c: 17, f: 0, pkr: 20 }
  },
  // Day 21
  {
    b: { t: 'High-Protein Double Egg White Bhurji with Tomatoes', img: FOOD_IMAGES.egg_bhurji, kcal: 360, p: 26, c: 44, f: 8, pkr: 75 },
    l: { t: 'Lobia & Aloo Salan with 2 Whole Wheat Rotis', img: FOOD_IMAGES.lobia_curry, kcal: 470, p: 20, c: 74, f: 9, pkr: 85 },
    d: { t: 'Pan-Fried Fish (Machli) with Cumin & 2 Rotis', img: FOOD_IMAGES.fish_curry, kcal: 480, p: 38, c: 50, f: 12, pkr: 180 },
    s: { t: 'Green Cardamom Kawa with 4 Raw Walnuts', img: FOOD_IMAGES.roasted_chana, kcal: 110, p: 3, c: 4, f: 10, pkr: 25 }
  },
  // Day 22
  {
    b: { t: 'Cardamom Sooji Daliya with Boiled Egg', img: FOOD_IMAGES.boiled_eggs, kcal: 390, p: 18, c: 60, f: 9, pkr: 75 },
    l: { t: 'Masoor Daal with Crispy Pickled Onions & Rice', img: FOOD_IMAGES.daal_chawal, kcal: 490, p: 22, c: 84, f: 7, pkr: 80 },
    d: { t: 'Karela Pyaz (Stir-Fried Bitter Gourd) & 2 Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 410, p: 13, c: 64, f: 12, pkr: 80 },
    s: { t: '2 Boiled Egg Whites with Chaat Masala', img: FOOD_IMAGES.boiled_eggs, kcal: 35, p: 7, c: 1, f: 0, pkr: 28 }
  },
  // Day 23
  {
    b: { t: 'Chicken Shami Kebab & 1 Whole Wheat Roti', img: FOOD_IMAGES.seekh_kebab, kcal: 420, p: 28, c: 44, f: 12, pkr: 110 },
    l: { t: 'Aloo Gobi Matar Curry with 2 Fresh Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 450, p: 15, c: 72, f: 11, pkr: 80 },
    d: { t: 'Chicken Yakhni Soup with Shredded Chicken & 1 Roti', img: FOOD_IMAGES.chicken_curry, kcal: 440, p: 38, c: 42, f: 9, pkr: 150 },
    s: { t: 'Plain Fresh Dahi with 1 tsp Chia Seeds', img: FOOD_IMAGES.yogurt_snack, kcal: 95, p: 6, c: 8, f: 4, pkr: 22 }
  },
  // Day 24
  {
    b: { t: 'Tamatar Pyaz Egg Khagina with 2 Fresh Rotis', img: FOOD_IMAGES.egg_bhurji, kcal: 420, p: 22, c: 48, f: 14, pkr: 85 },
    l: { t: 'Yellow Moong Daal Khichri with Fresh Mint Dahi', img: FOOD_IMAGES.khichri, kcal: 480, p: 19, c: 78, f: 8, pkr: 80 },
    d: { t: 'Lobia Rajma Curry with Fresh Onions & 2 Rotis', img: FOOD_IMAGES.lobia_curry, kcal: 470, p: 22, c: 72, f: 9, pkr: 85 },
    s: { t: 'Apple Slices with Roasted Chana', img: FOOD_IMAGES.fruit_snack, kcal: 130, p: 5, c: 26, f: 2, pkr: 25 }
  },
  // Day 25
  {
    b: { t: 'Sweet Almond Milk Daliya with Desi Gur', img: FOOD_IMAGES.daliya_oats, kcal: 400, p: 15, c: 68, f: 8, pkr: 80 },
    l: { t: 'Chana Daal with Bitter Gourd (Karela) & 2 Rotis', img: FOOD_IMAGES.daal_tadka, kcal: 460, p: 22, c: 70, f: 9, pkr: 85 },
    d: { t: 'Turai / Tori Sabzi (Zucchini) with 2 Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 410, p: 14, c: 64, f: 10, pkr: 75 },
    s: { t: 'Fresh Sweet Pear (Nashpati) Slices', img: FOOD_IMAGES.fruit_snack, kcal: 80, p: 1, c: 20, f: 0, pkr: 25 }
  },
  // Day 26
  {
    b: { t: '2 Boiled Farm Eggs with Chaat Masala & Multigrain Roti', img: FOOD_IMAGES.boiled_eggs, kcal: 410, p: 22, c: 46, f: 14, pkr: 85 },
    l: { t: 'Machli Salan (Pakistani Fish Curry) with Steamed Rice', img: FOOD_IMAGES.fish_curry, kcal: 510, p: 38, c: 68, f: 11, pkr: 185 },
    d: { t: 'Grilled Chicken Seekh Kebab with Whole Wheat Roti & Chutney', img: FOOD_IMAGES.seekh_kebab, kcal: 490, p: 38, c: 48, f: 14, pkr: 160 },
    s: { t: 'Chilled Mint Raita Cup with Roasted Zeera', img: FOOD_IMAGES.yogurt_snack, kcal: 70, p: 4, c: 6, f: 3, pkr: 18 }
  },
  // Day 27
  {
    b: { t: 'Methi Anda (Fenugreek Egg Scramble) with Roti', img: FOOD_IMAGES.egg_bhurji, kcal: 420, p: 22, c: 46, f: 15, pkr: 85 },
    l: { t: 'Tinda Masala with 2 Whole Wheat Rotis & Salad', img: FOOD_IMAGES.sabzi_curry, kcal: 410, p: 13, c: 66, f: 10, pkr: 75 },
    d: { t: 'Desi Chicken Shorba with 2 Whole Wheat Rotis', img: FOOD_IMAGES.chicken_curry, kcal: 480, p: 38, c: 50, f: 12, pkr: 160 },
    s: { t: 'Roasted Salted Almonds (15 Nuts)', img: FOOD_IMAGES.roasted_chana, kcal: 110, p: 4, c: 4, f: 10, pkr: 25 }
  },
  // Day 28
  {
    b: { t: 'Desi Street Double Omelette with Onion, Chili & 2 Roti', img: FOOD_IMAGES.desi_omelette, kcal: 430, p: 23, c: 48, f: 15, pkr: 85 },
    l: { t: 'Daal Palak (Lentils with Fresh Spinach) & Steamed Rice', img: FOOD_IMAGES.daal_chawal, kcal: 510, p: 24, c: 84, f: 8, pkr: 85 },
    d: { t: 'Kaddu (Pumpkin / White Squash) Sabzi with 2 Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 410, p: 13, c: 66, f: 10, pkr: 75 },
    s: { t: 'Fresh Guava with Kala Namak', img: FOOD_IMAGES.fruit_snack, kcal: 85, p: 3, c: 18, f: 1, pkr: 20 }
  },
  // Day 29
  {
    b: { t: 'Spiced Hummus Chickpea Mash with Warm Tawa Roti', img: FOOD_IMAGES.chana_chaat, kcal: 420, p: 19, c: 64, f: 9, pkr: 80 },
    l: { t: 'Lean High-Protein Chicken Nihari with 2 Rotis', img: FOOD_IMAGES.chicken_curry, kcal: 540, p: 44, c: 54, f: 14, pkr: 175 },
    d: { t: 'Aloo Methi (Potatoes with Fenugreek) with 2 Rotis', img: FOOD_IMAGES.sabzi_curry, kcal: 430, p: 14, c: 68, f: 11, pkr: 75 },
    s: { t: '1 Banana with Warm Buffalo Milk Cup', img: FOOD_IMAGES.banana_kela, kcal: 180, p: 6, c: 32, f: 4, pkr: 35 }
  },
  // Day 30
  {
    b: { t: 'Sunday Shahi Egg Halwa & Chana Brunch', img: FOOD_IMAGES.eggs_roti, kcal: 460, p: 24, c: 62, f: 14, pkr: 95 },
    l: { t: 'Sunday Special Chicken Biryani with Mint Dahi Raita', img: FOOD_IMAGES.biryani, kcal: 580, p: 44, c: 78, f: 12, pkr: 190 },
    d: { t: 'Royal Chicken Korma with 2 Whole Wheat Rotis', img: FOOD_IMAGES.chicken_curry, kcal: 520, p: 42, c: 50, f: 16, pkr: 175 },
    s: { t: 'Kashmiri Pink Chai / Green Tea with Crushed Pistachios', img: FOOD_IMAGES.yogurt_snack, kcal: 85, p: 3, c: 9, f: 4, pkr: 30 }
  }
];

// Add Day 8, 9, 10
pkExtraDays.forEach((ex, idx) => {
  const day = idx + 8;
  THIRTY_DAY_PAKISTANI_PLAN.push({
    dayNumber: day,
    dayTitle: `Day ${day}: ${ex.l.t.split('with')[0].trim()}`,
    theme: `${ex.b.t.split('&')[0].trim()} + ${ex.l.t.split('with')[0].trim()}`,
    breakfast: {
      id: `d${day}-b`,
      type: 'breakfast',
      title: ex.b.t,
      subtitle: ex.b.s,
      image: ex.b.img,
      servingSize: ex.b.serv,
      prepTime: ex.b.time,
      baseKcal: ex.b.kcal,
      baseProtein: ex.b.p,
      baseCarbs: ex.b.c,
      baseFat: ex.b.f,
      ingredients: ex.b.ing.map((ig, i) => ({
        id: `i-d${day}-b${i}`,
        name: ig.name,
        portion: ig.portion,
        quantityValue: ig.qty,
        unit: ig.unit,
        costPkr: ig.pkr
      })),
      instructions: ex.b.inst,
      budgetTips: ex.b.tips
    },
    lunch: {
      id: `d${day}-l`,
      type: 'lunch',
      title: ex.l.t,
      subtitle: ex.l.s,
      image: ex.l.img,
      servingSize: ex.l.serv,
      prepTime: ex.l.time,
      baseKcal: ex.l.kcal,
      baseProtein: ex.l.p,
      baseCarbs: ex.l.c,
      baseFat: ex.l.f,
      ingredients: ex.l.ing.map((ig, i) => ({
        id: `i-d${day}-l${i}`,
        name: ig.name,
        portion: ig.portion,
        quantityValue: ig.qty,
        unit: ig.unit,
        costPkr: ig.pkr
      })),
      instructions: ex.l.inst,
      budgetTips: ex.l.tips
    },
    dinner: {
      id: `d${day}-d`,
      type: 'dinner',
      title: ex.d.t,
      subtitle: ex.d.s,
      image: ex.d.img,
      servingSize: ex.d.serv,
      prepTime: ex.d.time,
      baseKcal: ex.d.kcal,
      baseProtein: ex.d.p,
      baseCarbs: ex.d.c,
      baseFat: ex.d.f,
      ingredients: ex.d.ing.map((ig, i) => ({
        id: `i-d${day}-d${i}`,
        name: ig.name,
        portion: ig.portion,
        quantityValue: ig.qty,
        unit: ig.unit,
        costPkr: ig.pkr
      })),
      instructions: ex.d.inst,
      budgetTips: ex.d.tips
    },
    snack: {
      id: `d${day}-s`,
      type: 'snack',
      title: ex.s.t,
      subtitle: ex.s.s,
      image: ex.s.img,
      servingSize: ex.s.serv,
      prepTime: ex.s.time,
      baseKcal: ex.s.kcal,
      baseProtein: ex.s.p,
      baseCarbs: ex.s.c,
      baseFat: ex.s.f,
      ingredients: ex.s.ing.map((ig, i) => ({
        id: `i-d${day}-s${i}`,
        name: ig.name,
        portion: ig.portion,
        quantityValue: ig.qty,
        unit: ig.unit,
        costPkr: ig.pkr
      })),
      instructions: ex.s.inst,
      budgetTips: ex.s.tips
    }
  });
});

// Add Days 11 through 30
extraDayConfigs.forEach((cfg, idx) => {
  const day = idx + 11;
  THIRTY_DAY_PAKISTANI_PLAN.push({
    dayNumber: day,
    dayTitle: `Day ${day}: ${cfg.l.t.split('with')[0].trim()}`,
    theme: `${cfg.b.t.split('&')[0].trim()} + ${cfg.l.t.split('with')[0].trim()}`,
    breakfast: {
      id: `d${day}-b`,
      type: 'breakfast',
      title: cfg.b.t,
      subtitle: `High-protein wholesome breakfast with fresh ingredients and authentic spices`,
      image: cfg.b.img,
      servingSize: '1 Full Serving + Desi Roti',
      prepTime: '10 Mins',
      baseKcal: cfg.b.kcal,
      baseProtein: cfg.b.p,
      baseCarbs: cfg.b.c,
      baseFat: cfg.b.f,
      ingredients: [
        { id: `i-d${day}-b1`, name: 'Fresh Farm Ingredients Base', portion: '1 Serving', quantityValue: 1, unit: 'piece', costPkr: Math.round(cfg.b.pkr * 0.7) },
        { id: `i-d${day}-b2`, name: 'Chakki Whole Wheat Roti / Flours', portion: '1 Serving', quantityValue: 1, unit: 'piece', costPkr: Math.round(cfg.b.pkr * 0.3) }
      ],
      instructions: ['Cook on medium heat with authentic home spices and serve hot.'],
      budgetTips: 'Buy eggs and grains in wholesale to maximize daily savings.'
    },
    lunch: {
      id: `d${day}-l`,
      type: 'lunch',
      title: cfg.l.t,
      subtitle: `Nutrient-dense Pakistani lunch with whole grains and protein`,
      image: cfg.l.img,
      servingSize: '1 Full Plate / Bowl + Salad',
      prepTime: '20 Mins',
      baseKcal: cfg.l.kcal,
      baseProtein: cfg.l.p,
      baseCarbs: cfg.l.c,
      baseFat: cfg.l.f,
      ingredients: [
        { id: `i-d${day}-l1`, name: 'Protein & Lentil Core', portion: '1 Bowl', quantityValue: 1, unit: 'piece', costPkr: Math.round(cfg.l.pkr * 0.6) },
        { id: `i-d${day}-l2`, name: 'Basmati Rice or Whole Wheat Roti', portion: '1 Serving', quantityValue: 1, unit: 'piece', costPkr: Math.round(cfg.l.pkr * 0.4) }
      ],
      instructions: ['Cook until tender and temper with aromatic cumin and garlic.'],
      budgetTips: 'Lentils and seasonal poultry provide the best cost-to-protein ratio in the market.'
    },
    dinner: {
      id: `d${day}-d`,
      type: 'dinner',
      title: cfg.d.t,
      subtitle: `Comforting evening salan cooked with whole wheat tawa rotis`,
      image: cfg.d.img,
      servingSize: '1 Bowl Salan + 2 Rotis',
      prepTime: '20 Mins',
      baseKcal: cfg.d.kcal,
      baseProtein: cfg.d.p,
      baseCarbs: cfg.d.c,
      baseFat: cfg.d.f,
      ingredients: [
        { id: `i-d${day}-d1`, name: 'Dinner Salan / Entrée Base', portion: '1 Bowl', quantityValue: 1, unit: 'piece', costPkr: Math.round(cfg.d.pkr * 0.65) },
        { id: `i-d${day}-d2`, name: 'Chakki Whole Wheat Rotis', portion: '2 Rotis', quantityValue: 80, unit: 'g', costPkr: Math.round(cfg.d.pkr * 0.35) }
      ],
      instructions: ['Simmer on dum until oil separates and spices release rich aroma.'],
      budgetTips: 'Cooking with covered lid locks in nutrients and cuts gas usage.'
    },
    snack: {
      id: `d${day}-s`,
      type: 'snack',
      title: cfg.s.t,
      subtitle: 'Nutritious midday affordable fitness snack',
      image: cfg.s.img,
      servingSize: '1 Serving',
      prepTime: '2 Mins',
      baseKcal: cfg.s.kcal,
      baseProtein: cfg.s.p,
      baseCarbs: cfg.s.c,
      baseFat: cfg.s.f,
      ingredients: [
        { id: `i-d${day}-s1`, name: cfg.s.t, portion: '1 serving', quantityValue: 1, unit: 'piece', costPkr: cfg.s.pkr }
      ],
      instructions: ['Enjoy fresh as an afternoon energy booster.'],
      budgetTips: 'Healthy local snacks keep appetite disciplined before evening dinner.'
    }
  });
});

// Ensure all meals across all 30 days have verified image, servingSize, and costUsd populated
THIRTY_DAY_PAKISTANI_PLAN.forEach((day) => {
  const slots: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  slots.forEach((slot) => {
    const meal = day[slot];
    if (meal) {
      if (!meal.image) meal.image = getMatchingMealImage(meal.title, meal.type);
      if (!meal.servingSize) meal.servingSize = getMatchingServingSize(meal.title, meal.type);
      meal.costUsd = getPakistaniMealCostUsd(meal);
      if (meal.ingredients) {
        meal.ingredients.forEach((ing) => {
          if (!ing.costUsd) {
            ing.costUsd = Number((ing.costPkr / 280).toFixed(2));
          }
        });
      }
    }
  });
});

// =============================================================================
// 4. PORTION & NUTRITION ADJUSTOR FOR USER FITNESS GOALS
// =============================================================================

export interface AdjustedMealNutrition {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  portionMultiplier: number;
  extraPortionNote?: string;
  costPkr: number;
}

export function calculateGoalNutrition(
  meal: PakistaniMeal,
  goal: UserDietPreferences['goal'] = 'general_health',
  preference: UserDietPreferences['preference'] = 'all'
): AdjustedMealNutrition {
  // Base cost sum
  const baseCost = meal.ingredients.reduce((sum, ing) => sum + ing.costPkr, 0);

  let multiplier = 1.0;
  let proteinBonus = 0;
  let costBonus = 0;
  let note = '';

  switch (goal) {
    case 'muscle_gain':
      multiplier = 1.15;
      proteinBonus = 6;
      costBonus = 15;
      note = '+1 extra egg or +40g extra daal portion for muscle synthesis';
      break;
    case 'fat_loss':
      multiplier = 0.88;
      proteinBonus = 2; // maintain protein, trim carbs/oil
      note = 'Portion calibrated for steady fat burning while keeping protein high';
      break;
    case 'lean_athletic':
      multiplier = 1.05;
      proteinBonus = 4;
      costBonus = 10;
      note = 'High nutrient density for athletic output and recovery';
      break;
    case 'general_health':
    default:
      multiplier = 1.0;
      break;
  }

  // Vegetarian / Ultra budget adjustment
  if (preference === 'ultra_budget' && meal.title.toLowerCase().includes('chicken')) {
    multiplier = 0.9;
    costBonus = -50;
    note = 'Replaced chicken with double daal + egg for maximum PKR savings';
  }

  const kcal = Math.round(meal.baseKcal * multiplier);
  const protein = Math.round(meal.baseProtein * multiplier + proteinBonus);
  const carbs = Math.round(meal.baseCarbs * multiplier);
  const fat = Math.round(meal.baseFat * (goal === 'fat_loss' ? 0.85 : multiplier));
  const costPkr = Math.max(25, Math.round(baseCost + costBonus));

  return {
    kcal,
    protein,
    carbs,
    fat,
    portionMultiplier: multiplier,
    extraPortionNote: note,
    costPkr,
  };
}

// =============================================================================
// 5. WEEKLY GROCERY LIST GENERATOR
// =============================================================================

export interface GroceryCategory {
  categoryName: string;
  items: {
    name: string;
    totalQuantity: string;
    estimatedCostPkr: number;
    checked: boolean;
  }[];
}

export function generateWeeklyGroceryList(
  weekNumber: number, // 1 to 4 (or 5 for days 29-30)
  plan: DayDietPlan[] = THIRTY_DAY_PAKISTANI_PLAN
): { categories: GroceryCategory[]; totalEstimatedPkr: number } {
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = Math.min(30, weekNumber * 7);

  const daysInWeek = plan.filter((d) => d.dayNumber >= startDay && d.dayNumber <= endDay);
  const daysCount = daysInWeek.length;

  // Aggregate staples for the week (e.g. 7 days):
  const eggsTotal = daysCount * 2; // ~14 eggs
  const attaKg = ((daysCount * 180) / 1000).toFixed(1); // ~1.3 kg atta
  const daalLentilsKg = ((daysCount * 120) / 1000).toFixed(1); // ~0.8 kg
  const riceKg = ((daysCount * 60) / 1000).toFixed(1); // ~0.5 kg
  const sabziKg = ((daysCount * 200) / 1000).toFixed(1); // ~1.4 kg
  const oilLiters = ((daysCount * 25) / 1000).toFixed(2); // ~0.2L
  const milkLiters = ((daysCount * 100) / 1000).toFixed(1); // ~0.7L
  const chickenGrams = daysCount >= 7 ? '350g' : '150g';

  const categories: GroceryCategory[] = [
    {
      categoryName: '🌾 Grains & Flours (Atta & Rice)',
      items: [
        { name: 'Chakki Whole Wheat Atta', totalQuantity: `${attaKg} kg`, estimatedCostPkr: Math.round(parseFloat(attaKg) * 140), checked: false },
        { name: 'Basmati / Sela Rice', totalQuantity: `${riceKg} kg`, estimatedCostPkr: Math.round(parseFloat(riceKg) * 300), checked: false },
        { name: 'Wheat Daliya / Porridge', totalQuantity: '300 g', estimatedCostPkr: 70, checked: false },
      ],
    },
    {
      categoryName: '🫘 Pulses & Beans (Daal & Chana)',
      items: [
        { name: 'Moong & Masoor Daal (Combined)', totalQuantity: `${daalLentilsKg} kg`, estimatedCostPkr: Math.round(parseFloat(daalLentilsKg) * 310), checked: false },
        { name: 'White & Black Chana', totalQuantity: '500 g', estimatedCostPkr: 170, checked: false },
        { name: 'Lobia (Red / Black-Eyed Beans)', totalQuantity: '400 g', estimatedCostPkr: 135, checked: false },
      ],
    },
    {
      categoryName: '🥚 Eggs & Poultry',
      items: [
        { name: 'Farm Eggs (Tray or Dozen)', totalQuantity: `${eggsTotal} Eggs`, estimatedCostPkr: eggsTotal * 28, checked: false },
        { name: 'Fresh Chicken (Bone-in or Stew cut)', totalQuantity: chickenGrams, estimatedCostPkr: daysCount >= 7 ? 250 : 120, checked: false },
      ],
    },
    {
      categoryName: '🥬 Fresh Vegetables & Fruits',
      items: [
        { name: 'Seasonal Vegetables (Bhindi, Palak, Tori)', totalQuantity: `${sabziKg} kg`, estimatedCostPkr: Math.round(parseFloat(sabziKg) * 160), checked: false },
        { name: 'Onions, Tomatoes, Ginger, Garlic', totalQuantity: '1.5 kg mixed', estimatedCostPkr: 220, checked: false },
        { name: 'Bananas & Guavas (Seasonal fruit)', totalQuantity: '7 portions', estimatedCostPkr: 140, checked: false },
      ],
    },
    {
      categoryName: '🥛 Dairy, Cooking Oil & Pantry',
      items: [
        { name: 'Fresh Milk', totalQuantity: `${milkLiters} Liters`, estimatedCostPkr: Math.round(parseFloat(milkLiters) * 220), checked: false },
        { name: 'Plain Dahi (Yogurt)', totalQuantity: '500 g', estimatedCostPkr: 120, checked: false },
        { name: 'Cooking Oil / Ghee', totalQuantity: `${oilLiters} L`, estimatedCostPkr: Math.round(parseFloat(oilLiters) * 450), checked: false },
        { name: 'Roasted Chana (Snacks)', totalQuantity: '250 g', estimatedCostPkr: 120, checked: false },
      ],
    },
  ];

  const totalEstimatedPkr = categories.reduce(
    (total, cat) => total + cat.items.reduce((sub, it) => sub + it.estimatedCostPkr, 0),
    0
  );

  return { categories, totalEstimatedPkr };
}

// =============================================================================
// RE-EXPORTS FOR BACKWARD COMPATIBILITY
// =============================================================================
export type { AsianMeal, DayAsianPlan, AsianIngredientItem } from './asianDietData';
export { THIRTY_DAY_ASIAN_PLAN } from './asianDietData';
