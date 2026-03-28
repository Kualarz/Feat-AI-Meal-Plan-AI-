import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractRecipeFromHtml, extractRecipeFromYouTube as geminiExtractFromYouTube } from '@/lib/gemini';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ProfileInput {
  name: string;
  cal: number;
  protein: number;
  diet: string;
  halal: boolean;
  vegetarian: boolean;
  vegan: boolean;
  allergens: string;
  dislikes: string;
  cuisines: string;
  time: number;
  equipment: string;
  region: string;
  currency: string;
  budget: string;
  // Weight goal and body metrics
  currentWeight?: number; // kg
  targetWeight?: number; // kg
  height?: number; // cm
  age?: number;
  weightGoal?: 'maintain' | 'lose' | 'gain' | 'bulk';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
}

export interface DateRange {
  startISO: string;
  endISO: string;
}

export interface Ingredient {
  name: string;
  qty: string;
  unit: string;
  notes?: string;
}

export interface Meal {
  title: string;
  ingredients: Ingredient[];
  steps: string;
  macros: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  time_mins: number;
  estimated_price: number;
  currency: string;
  image_url?: string;
  why: string;
}

export interface DayPlan {
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  dessert?: Meal;
  daily_total: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ShoppingListSection {
  section: string;
  items: Array<{
    name: string;
    qty: string;
    unit: string;
  }>;
}

export interface MealPlanJson {
  days: DayPlan[];
  shopping_list: ShoppingListSection[];
  rationale: string;
}

const SYSTEM_PROMPT = `You are a certified nutrition coach and SEA home-cooking expert specializing in Southeast Asian cuisine (Cambodian, Thai, Vietnamese, Malaysian, Indonesian).

RULES: Respect halal/vegan/vegetarian strictly. Use SEA ingredients and realistic prices. Avoid allergens and dislikes. Stay within time budget.

JSON SCHEMA:
{"days":[{"date":"YYYY-MM-DD","breakfast":{"title":"","ingredients":[{"name":"","qty":"","unit":"","notes":""}],"steps":"","macros":{"kcal":0,"protein":0,"carbs":0,"fat":0},"time_mins":0,"estimated_price":0,"currency":"","image_url":null,"why":""},"lunch":{...},"dinner":{...},"dessert":{...},"daily_total":{"kcal":0,"protein":0,"carbs":0,"fat":0}}],"shopping_list":[{"section":"Produce|Meat/Seafood|Dry Pantry|Sauces/Pastes|Dairy/Alt|Frozen","items":[{"name":"","qty":"","unit":""}]}],"rationale":""}`;

export async function generateMealPlan(
  profile: ProfileInput,
  range: DateRange
): Promise<MealPlanJson> {
  // Build weight goal section if provided
  let weightGoalSection = '';
  if (profile.weightGoal) {
    const goalDescriptions: Record<string, string> = {
      maintain: 'Maintain current weight - focus on balanced, sustainable nutrition',
      lose: 'Lose weight gradually - include nutrient-dense foods to feel full longer',
      gain: 'Gain weight healthily - focus on calorie-dense foods with good nutrition',
      bulk: 'Build muscle mass - prioritize protein-rich foods to support muscle growth',
    };

    weightGoalSection = `
WEIGHT GOAL & BODY METRICS:
- Current weight: ${profile.currentWeight}kg
- Target weight: ${profile.targetWeight}kg
- Height: ${profile.height}cm
- Age: ${profile.age}
- Activity level: ${profile.activityLevel || 'moderate'}
- Goal: ${profile.weightGoal} (${goalDescriptions[profile.weightGoal]})
- These calorie and protein targets are optimized for this goal.`;
  }

  const userMessage = `Generate a ${getDayCount(range.startISO, range.endISO)}-day meal plan with these requirements:

PROFILE:
- Name: ${profile.name}
- Daily calories: ${profile.cal} kcal
- Daily protein: ${profile.protein}g
- Diet: ${profile.diet}
- Halal: ${profile.halal ? 'YES - STRICTLY NO PORK, NO ALCOHOL' : 'No'}
- Vegetarian: ${profile.vegetarian ? 'YES - NO MEAT, NO FISH' : 'No'}
- Vegan: ${profile.vegan ? 'YES - NO ANIMAL PRODUCTS' : 'No'}
- Allergens to AVOID: ${profile.allergens || 'None'}
- Foods user DISLIKES: ${profile.dislikes || 'None'}
- Preferred cuisines: ${profile.cuisines}
- Max cooking time: ${profile.time} minutes per meal
- Budget level: ${profile.budget}
- Available equipment: ${profile.equipment}
- Region: ${profile.region}
- Currency: ${profile.currency}${weightGoalSection}

DATE RANGE: ${range.startISO} to ${range.endISO}

Generate a complete meal plan with breakfast, lunch, dinner, and optional dessert for each day. Include shopping list grouped by SEA market sections.`;

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 1,
        maxOutputTokens: 8192,
        thinking_level: 'high',
      } as any,
    });

    const result = await model.generateContent(userMessage);
    const jsonText = result.response.text().trim();
    const parsed = JSON.parse(jsonText) as MealPlanJson;

    if (!parsed.days || !Array.isArray(parsed.days)) {
      throw new Error('Invalid meal plan structure: missing days array');
    }

    return parsed;
  } catch (error) {
    console.error('AI generation error:', error);

    // Retry once if JSON parsing failed
    if (error instanceof SyntaxError) {
      console.log('Retrying AI request due to JSON parse error...');
      const retryModel = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
        systemInstruction: SYSTEM_PROMPT + '\n\nIMPORTANT: Return ONLY valid JSON, no markdown, no explanations.',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 8192,
        } as any,
      });

      const retryResult = await retryModel.generateContent(userMessage);
      return JSON.parse(retryResult.response.text().trim()) as MealPlanJson;
    }

    throw error;
  }
}

function getDayCount(startISO: string, endISO: string): number {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export async function normalizeRecipeFromUrl(
  html: string,
  url: string,
  dietFlags: { vegetarian: boolean; vegan: boolean; halal: boolean },
  currency: string
): Promise<any> {
  return extractRecipeFromHtml(html, url, dietFlags, currency);
}

export async function extractRecipeFromYouTube(
  youtubeUrl: string,
  videoTitle: string,
  videoDescription: string,
  currency: string
): Promise<any> {
  return geminiExtractFromYouTube(youtubeUrl, videoTitle, videoDescription, currency);
}
