import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMatchingAsianMealImage, THIRTY_DAY_ASIAN_PLAN } from '../data/asianDietData';
import { getMatchingAmericanMealImage, THIRTY_DAY_AMERICAN_PLAN } from '../data/americanDietData';
import { PakistaniMeal } from '../data/pakistaniDietData';
import { getVerifiedMealImage } from '../constants/mealImages';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
  canRetry?: boolean;
  mealProposal?: ProposedMeal;
}

export interface ProposedMeal {
  title: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  baseKcal: number;
  baseProtein: number;
  baseCarbs?: number;
  baseFat?: number;
  cost: number;
  currency?: string;
  portion: string;
  image?: string;
  ingredients: { name: string; portion: string; cost: number }[];
  instructions: string[];
  budgetTip?: string;
}

export interface DietContextPayload {
  country?: string;
  currency?: string;
  dailyBudget?: number;
  goal?: string;
  preference?: string;
  allergies?: string[];
  activeDayNumber?: number;
  activeDayTitle?: string;
  currentMeals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  };
  totalKcal?: number;
  totalProtein?: number;
  targetKcal?: number;
  targetProtein?: number;
}

const CHAT_STORAGE_KEY = '@sweatflix_ai_diet_chat_history';
const CUSTOM_API_KEY_STORAGE = '@sweatflix_custom_gemini_api_key';

// Rate Limiting: max 15 requests per 60 seconds
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 15;
let requestTimestamps: number[] = [];

export const SUGGESTED_QUESTIONS = [
  'Suggest a high-protein Asian or American meal',
  'What should I eat today?',
  'Create an affordable meal swap in USD',
  'Replace an ingredient in my plan',
  'Explain my daily calories & protein',
  'Help me use ingredients I already have',
];

export const aiDietService = {
  // 1. API Key Management
  async getApiKey(): Promise<string> {
    try {
      const customKey = await AsyncStorage.getItem(CUSTOM_API_KEY_STORAGE);
      if (customKey && customKey.trim().length > 0) {
        return customKey.trim();
      }
    } catch {
      // ignore
    }
    const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 0) {
      return envKey.trim();
    }
    return '';
  },

  async saveCustomApiKey(key: string): Promise<void> {
    await AsyncStorage.setItem(CUSTOM_API_KEY_STORAGE, key.trim());
  },

  async clearCustomApiKey(): Promise<void> {
    await AsyncStorage.removeItem(CUSTOM_API_KEY_STORAGE);
  },

  // 2. Chat History Persistence
  async loadChatHistory(userId?: string): Promise<ChatMessage[]> {
    try {
      const key = userId ? `${CHAT_STORAGE_KEY}_${userId}` : CHAT_STORAGE_KEY;
      const json = await AsyncStorage.getItem(key);
      if (json) {
        return JSON.parse(json);
      }
    } catch (e) {
      console.warn('Failed to load AI chat history:', e);
    }
    return [];
  },

  async saveChatHistory(messages: ChatMessage[], userId?: string): Promise<void> {
    try {
      const key = userId ? `${CHAT_STORAGE_KEY}_${userId}` : CHAT_STORAGE_KEY;
      // Keep up to 60 messages to preserve memory & storage
      const trimmed = messages.slice(-60);
      await AsyncStorage.setItem(key, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save AI chat history:', e);
    }
  },

  async clearChatHistory(userId?: string): Promise<void> {
    try {
      const key = userId ? `${CHAT_STORAGE_KEY}_${userId}` : CHAT_STORAGE_KEY;
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to clear chat history:', e);
    }
  },

  // 3. Rate Limiter check
  checkRateLimit(): boolean {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return false;
    }
    requestTimestamps.push(now);
    return true;
  },

  // 4. Parse Structured Meal Proposal from Model Response
  parseMealProposal(rawText: string, defaultCurrency: string = '$'): { cleanText: string; proposal?: ProposedMeal } {
    const proposalRegex = /\[MEAL_PROPOSAL:\s*({[\s\S]*?})\]/i;
    const match = rawText.match(proposalRegex);

    if (!match) {
      return { cleanText: rawText.trim() };
    }

    let proposal: ProposedMeal | undefined;
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.title) {
        const mealType = parsed.type || 'lunch';
        const image =
          parsed.image ||
          getMatchingAsianMealImage(parsed.title, mealType) ||
          getMatchingAmericanMealImage(parsed.title, mealType);
        proposal = {
          title: parsed.title,
          type: mealType,
          baseKcal: Number(parsed.baseKcal) || 450,
          baseProtein: Number(parsed.baseProtein) || 28,
          baseCarbs: Number(parsed.baseCarbs) || 48,
          baseFat: Number(parsed.baseFat) || 14,
          cost: Number(parsed.cost) || 4.50,
          currency: parsed.currency || defaultCurrency,
          portion: parsed.portion || '1 Standard Serving',
          image,
          ingredients: Array.isArray(parsed.ingredients)
            ? parsed.ingredients.map((ing: any) => ({
                name: String(ing.name || ing),
                portion: String(ing.portion || '1 serving'),
                cost: Number(ing.cost) || 1.25,
              }))
            : [],
          instructions: Array.isArray(parsed.instructions)
            ? parsed.instructions.map(String)
            : ['Cook ingredients thoroughly and serve warm.'],
          budgetTip: parsed.budgetTip || 'Cook in batch to maximize ingredient savings.',
        };
      }
    } catch (e) {
      console.warn('Could not parse MEAL_PROPOSAL JSON:', e);
    }

    const cleanText = rawText.replace(proposalRegex, '').trim();
    return { cleanText, proposal };
  },

  // 5. Build Comprehensive System Prompt
  buildSystemInstruction(context: DietContextPayload): string {
    const cur = 'USD ($)';
    const budget = context.dailyBudget ? `$${context.dailyBudget}` : 'Flexible';
    const goal = context.goal || 'General Health & Fitness';
    const preference = context.preference || 'Balanced Asian & American athletic meals';
    const allergies = context.allergies && context.allergies.length > 0 ? context.allergies.join(', ') : 'None';
    const day = context.activeDayNumber || 1;
    const dayTitle = context.activeDayTitle || `Day ${day}`;

    return `You are "AI Diet Coach", an empathetic, highly knowledgeable, and practical nutrition and fitness dietary assistant built into the SweatFlix fitness application.

USER PROFILE & DIET CONTEXT:
- Region & Context: ${context.country || 'Global (Pan-Asian & American athletic plans)'}
- Local Currency: ${cur} (ALL costs and budgets MUST be in USD $)
- Daily Budget Target: ${budget} USD
- Fitness Goal: ${goal}
- Food Preferences: ${preference}
- Dietary Allergies & Restrictions: ${allergies}
- Active Plan Day: Day ${day} (${dayTitle})
- Today's Meals in Active Plan:
  * Breakfast: ${context.currentMeals?.breakfast || 'Breakfast'}
  * Lunch: ${context.currentMeals?.lunch || 'Lunch'}
  * Dinner: ${context.currentMeals?.dinner || 'Dinner'}
  * Snack: ${context.currentMeals?.snack || 'Snack'}
- Day Nutrition Summary: ~${context.totalKcal || 1800} kcal, ~${context.totalProtein || 75}g protein (Target: ${context.targetKcal || 2000} kcal, ${context.targetProtein || 90}g protein)

CORE GUIDELINES:
1. FOCUS: Answer questions about nutrition, meal timing, budget-friendly ingredient swaps, high-protein recipes, macro distribution, and grocery planning.
2. TWO SEPARATE PLAN SUPPORT:
   - Asian Meals: Chinese, Japanese, Korean, Thai, Indian, Vietnamese, and other Asian cuisines (vegetable stir-fry, chicken teriyaki, fried rice, sushi bowls, dal with rice, Thai curry, pho, ramen, bibimbap). Do NOT label the Asian plan as Pakistani or restrict it to one country.
   - American Meals: Oatmeal, eggs, whole-grain toast, chicken bowls, turkey sandwiches, baked potatoes, salads, salmon, chili.
3. PRICING: Always display prices in US Dollars ($ USD).
4. BUDGET-FIRST APPROACH: Prioritize affordable high-protein swaps (e.g. eggs, edamame, tofu, lentils/dal, chicken breast, canned tuna, Greek yogurt).
5. ACTIONABLE & CLEAN FORMATTING:
   - Use short, readable paragraphs with bold headings and bullet points.
   - Mention realistic portions.
   - Clearly state nutrition estimates (Kcal, Protein) and cost estimates in USD ($).
6. STRUCTURED MEAL PROPOSALS:
   Whenever you propose or suggest a specific meal (for replacement, new breakfast, lunch, dinner, or snack), ALWAYS append a structured tag at the very end of your response in this exact JSON format so the app can render interactive action buttons (View Recipe, Save Meal, Add to Meal Plan, Replace Current Meal):
   [MEAL_PROPOSAL: {
     "title": "Short Descriptive Dish Title",
     "type": "breakfast" | "lunch" | "dinner" | "snack",
     "baseKcal": 450,
     "baseProtein": 32,
     "baseCarbs": 48,
     "baseFat": 12,
     "cost": 4.50,
     "currency": "$",
     "portion": "1 Standard Bowl / Plate",
     "ingredients": [
       {"name": "Ingredient 1", "portion": "80g", "cost": 1.50},
       {"name": "Ingredient 2", "portion": "2 pieces", "cost": 1.20}
     ],
     "instructions": [
       "Step 1 instruction",
       "Step 2 instruction"
     ],
     "budgetTip": "Smart money-saving tip for this dish"
   }]
7. SAFETY & MEDICAL BOUNDARIES: Never diagnose medical diseases, prescribe clinical pharmaceuticals, or advise starvation diets. Provide honest, scientifically-backed, healthy fitness advice.
8. MISSING INFORMATION: If crucial dietary information is missing to provide a safe answer, ask a polite, concise follow-up question.`;
  },

  // 6. Send Message to Gemini API with Resilient Retry and Fallback
  async sendMessage(
    userText: string,
    history: ChatMessage[],
    context: DietContextPayload
  ): Promise<{ text: string; proposal?: ProposedMeal }> {
    const trimmedInput = userText.trim();
    if (!trimmedInput) {
      throw new Error('Please type a question or choose a suggested topic.');
    }

    if (trimmedInput.length > 1500) {
      throw new Error('Message is too long. Please shorten your question to under 1500 characters.');
    }

    // Rate Limit check
    if (!this.checkRateLimit()) {
      throw new Error('You are sending messages too quickly. Please wait a minute before asking again.');
    }

    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error(
        'NO_API_KEY: Gemini API Key is missing. Please add your key in Diet Coach Settings or set EXPO_PUBLIC_GEMINI_API_KEY in your environment.'
      );
    }

    // Format system instruction for Gemini API
    const systemInstruction = this.buildSystemInstruction(context);

    // Format conversation history ensuring strict alternation: user -> model -> user -> ...
    const cleanHistory = history.filter((m) => !m.isError && m.text && m.text.trim().length > 0);

    // Remove any trailing duplicate user prompts from history
    while (
      cleanHistory.length > 0 &&
      cleanHistory[cleanHistory.length - 1].sender === 'user' &&
      cleanHistory[cleanHistory.length - 1].text.trim() === trimmedInput
    ) {
      cleanHistory.pop();
    }

    const alternatingTurns: { role: 'user' | 'model'; parts: [{ text: string }] }[] = [];
    let expectedRole: 'user' | 'model' = 'user';

    for (const msg of cleanHistory) {
      const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';
      if (role === expectedRole) {
        alternatingTurns.push({ role, parts: [{ text: msg.text.trim() }] });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      } else if (alternatingTurns.length > 0 && role === 'user' && expectedRole === 'user') {
        // Merge consecutive user messages to avoid Gemini role violation
        alternatingTurns[alternatingTurns.length - 1].parts[0].text += `\n${msg.text.trim()}`;
      }
    }

    // Ensure history strictly ends on a model turn before appending the new user message
    while (alternatingTurns.length > 0 && alternatingTurns[alternatingTurns.length - 1].role === 'user') {
      alternatingTurns.pop();
    }

    // Keep the last 6 turns (3 conversation pairs) for token & speed efficiency
    const recentTurns = alternatingTurns.slice(-6);

    // Append the current user prompt
    const contents = [
      ...recentTurns,
      {
        role: 'user',
        parts: [{ text: trimmedInput }],
      },
    ];

    // Priority order of verified, active, fast Gemini models
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
    ];

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.65,
        topP: 0.9,
        maxOutputTokens: 950,
      },
    };

    let saw503 = false;

    for (const model of candidateModels) {
      // Allow up to 2 attempts per candidate with backoff on 503
      for (let attempt = 1; attempt <= 2; attempt++) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 16000);

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const status = response.status;
            const msg = errorData?.error?.message || response.statusText;

            // Handle temporary high-demand spikes (503)
            if (status === 503) {
              saw503 = true;
              if (attempt < 2) {
                // Wait 1.2s before re-attempting this model
                await new Promise((resolve) => setTimeout(resolve, 1200));
                continue;
              }
              // Move to next candidate model
              break;
            }

            // Model not available on this endpoint, try next candidate
            if (status === 404) {
              break;
            }

            if (status === 429) {
              throw new Error('QUOTA_EXCEEDED: Gemini API quota exceeded. Please wait a minute before asking again.');
            } else if (status === 400 || status === 403) {
              throw new Error(`INVALID_KEY: Google Gemini API error (${status}): ${msg}. Please check your API key.`);
            } else {
              break; // Try next model on server error
            }
          }

          const data = await response.json();
          const candidate = data.candidates?.[0];
          const modelResponseText = candidate?.content?.parts?.[0]?.text;

          if (!modelResponseText) {
            break;
          }

          const { cleanText, proposal } = this.parseMealProposal(modelResponseText, context.currency || '$');

          return {
            text: cleanText,
            proposal,
          };
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError') {
            break; // Timeout, try next candidate
          }
          if (err.message && (err.message.includes('QUOTA_EXCEEDED') || err.message.includes('INVALID_KEY'))) {
            throw err;
          }
        }
      }
    }

    // If Google servers are experiencing sustained demand spikes, fall back to smart local nutrition database
    if (saw503) {
      return this.getLocalPlanFallback(trimmedInput, context);
    }

    throw new Error('Could not connect to Gemini AI models. Please verify your internet connection or check your API key in settings.');
  },

  // Fallback engine: Instant authentic response from 30-Day Plan database during live server traffic spikes
  getLocalPlanFallback(userPrompt: string, context: DietContextPayload): { text: string; proposal?: ProposedMeal } {
    const day = Math.min(30, Math.max(1, context.activeDayNumber || 1));
    const isAmerican =
      (context.preference || '').toLowerCase().includes('american') ||
      (context.country || '').toLowerCase().includes('united states');
    const planDay: any = isAmerican
      ? (THIRTY_DAY_AMERICAN_PLAN[day - 1] || THIRTY_DAY_AMERICAN_PLAN[0])
      : (THIRTY_DAY_ASIAN_PLAN[day - 1] || THIRTY_DAY_ASIAN_PLAN[0]);
    const cur = context.currency || '$';
    const lower = userPrompt.toLowerCase();

    let selectedMeal: any = planDay.lunch;
    let rationale = 'a balanced, high-protein lunch';

    if (lower.includes('breakfast') || lower.includes('morning')) {
      selectedMeal = planDay.breakfast;
      rationale = 'a nutrient-packed breakfast to start your morning';
    } else if (lower.includes('dinner') || lower.includes('night')) {
      selectedMeal = planDay.dinner;
      rationale = 'a comforting, easy-to-digest dinner';
    } else if (lower.includes('snack') || lower.includes('craving')) {
      selectedMeal = planDay.snack;
      rationale = 'a quick, affordable snack that will not break your daily calorie target';
    } else if (lower.includes('protein') || lower.includes('muscle')) {
      const meals = [planDay.breakfast, planDay.lunch, planDay.dinner];
      selectedMeal = meals.reduce((max: any, m: any) => (m.baseProtein > max.baseProtein ? m : max), meals[0]);
      rationale = 'a high-protein meal choice to hit your target';
    } else if (lower.includes('cheap') || lower.includes('budget') || lower.includes('save') || lower.includes('affordable')) {
      const meals = [planDay.breakfast, planDay.lunch, planDay.dinner, planDay.snack];
      selectedMeal = meals.reduce((min: any, m: any) => (m.baseProtein < min.baseProtein ? m : min), meals[0]);
      rationale = 'a budget-first staple meal with maximum nutritional value';
    }

    // Realistic USD meal cost
    const cost = Number(
      (selectedMeal.costUsd ||
        selectedMeal.ingredients.reduce((sum: number, i: any) => sum + (i.costUsd || 1.0), 0) ||
        3.50).toFixed(2)
    );

    const proposal: ProposedMeal = {
      title: selectedMeal.title,
      type: selectedMeal.type,
      baseKcal: selectedMeal.baseKcal,
      baseProtein: selectedMeal.baseProtein,
      baseCarbs: selectedMeal.baseCarbs,
      baseFat: selectedMeal.baseFat,
      cost,
      currency: cur,
      portion: selectedMeal.servingSize || '1 Standard Serving',
      image: selectedMeal.image,
      ingredients: selectedMeal.ingredients.map((i: any) => ({
        name: i.name,
        portion: i.portion,
        cost: Number((i.costUsd || (i.costPkr ? i.costPkr * 0.0125 : 0) || 0.45).toFixed(2)),
      })),
      instructions: selectedMeal.instructions,
      budgetTip: selectedMeal.budgetTips,
    };

    const text =
      `**Diet Coach Recommendation (Day ${day} Plan Database)**\n\n` +
      `Here is ${rationale} tailored to your current fitness goal:\n\n` +
      `• **${selectedMeal.title}** (${selectedMeal.servingSize})\n` +
      `• **Nutrition:** ~${selectedMeal.baseKcal} kcal | **${selectedMeal.baseProtein}g Protein** | ~${selectedMeal.baseCarbs}g Carbs\n` +
      `• **Estimated Cost:** ~$${cost.toFixed(2)} USD\n\n` +
      `💡 *Budget & Cooking Tip:* ${selectedMeal.budgetTips}\n\n` +
      `You can view the full cooking recipe or replace it in your plan using the card below.\n\n` +
      `*(⚡ Google AI servers are experiencing peak traffic spikes worldwide. This instant plan recommendation was generated from your nutrition database so you don't have to wait. Tap **Retry** anytime to reconnect to live Gemini AI!)*`;

    return { text, proposal };
  },

  // 7. Convert ProposedMeal into a PakistaniMeal format so it can be added or replaced in the plan
  convertToPakistaniMeal(proposal: ProposedMeal, idPrefix: string = 'ai'): PakistaniMeal {
    const mealId = `${idPrefix}-${Date.now()}`;
    const costUsd = Number((proposal.cost || 2.50).toFixed(2));
    return {
      id: mealId,
      type: proposal.type,
      title: proposal.title,
      subtitle: `${proposal.portion} • Est. $${costUsd.toFixed(2)} USD`,
      image: proposal.image || getVerifiedMealImage(proposal.title, proposal.type),
      servingSize: proposal.portion,
      prepTime: '15 Mins',
      baseKcal: proposal.baseKcal,
      baseProtein: proposal.baseProtein,
      baseCarbs: proposal.baseCarbs || 45,
      baseFat: proposal.baseFat || 12,
      costUsd,
      ingredients: proposal.ingredients.map((ing, idx) => ({
        id: `ing-${mealId}-${idx}`,
        name: ing.name,
        portion: ing.portion,
        quantityValue: 1,
        unit: 'piece',
        costPkr: Math.round(ing.cost * 280),
        costUsd: ing.cost,
      })),
      instructions: proposal.instructions,
      budgetTips: proposal.budgetTip || 'Batch cook and refrigerate portions to reduce meal costs.',
    };
  },
};
