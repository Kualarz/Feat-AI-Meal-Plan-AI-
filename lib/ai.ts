import Anthropic from '@anthropic-ai/sdk';

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

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `You are a certified nutrition coach and SEA home-cooking expert specializing in Southeast Asian cuisine (Cambodian, Thai, Vietnamese, Malaysian, Indonesian).

STRICT RULES:
1. You MUST respect halal, vegan, and vegetarian flags strictly - no exceptions
2. You MUST output VALID JSON ONLY - no markdown, no explanation, no text before or after
3. You MUST use locally-available SEA ingredients and realistic prices
4. You MUST avoid all allergens specified by the user
5. You MUST respect the user's dislikes completely
6. You MUST stay within the time budget specified
7. You MUST provide authentic SEA recipes with proper techniques

OUTPUT FORMAT (JSON ONLY):
{
  "days": [
    {
      "date": "2025-11-03",
      "breakfast": {
        "title": "Khmer-style Banana Pancakes",
        "ingredients": [{"name": "rice flour", "qty": "100", "unit": "g", "notes": ""}],
        "steps": "1. Mix rice flour with water and banana\\n2. Pan-fry until golden",
        "macros": {"kcal": 350, "protein": 8, "carbs": 65, "fat": 5},
        "time_mins": 15,
        "estimated_price": 5000,
        "currency": "KHR",
        "image_url": "https://images.unsplash.com/photo-banana-pancakes",
        "why": "Quick breakfast using local ingredients, meets calorie target"
      },
      "lunch": {...},
      "dinner": {...},
      "dessert": {...},
      "daily_total": {"kcal": 2000, "protein": 120, "carbs": 250, "fat": 67}
    }
  ],
  "shopping_list": [
    {
      "section": "Produce",
      "items": [{"name": "banana", "qty": "5", "unit": "pieces"}]
    },
    {
      "section": "Meat/Seafood",
      "items": [{"name": "chicken thigh", "qty": "500", "unit": "g"}]
    },
    {
      "section": "Dry Pantry",
      "items": [{"name": "jasmine rice", "qty": "2", "unit": "kg"}]
    },
    {
      "section": "Sauces/Pastes",
      "items": [{"name": "fish sauce", "qty": "1", "unit": "bottle"}]
    },
    {
      "section": "Dairy/Alt",
      "items": [{"name": "coconut milk", "qty": "400", "unit": "ml"}]
    },
    {
      "section": "Frozen",
      "items": []
    }
  ],
  "rationale": "This 7-day meal plan focuses on authentic Cambodian cuisine with Thai and Vietnamese influences. All meals respect halal requirements and avoid shellfish allergens. The plan stays within 40-minute cooking times and uses medium-budget ingredients available in Phnom Penh markets."
}`;

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
    const message = await client.messages.create({
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 16000,
      temperature: 1,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(jsonText) as MealPlanJson;

    // Validate basic structure
    if (!result.days || !Array.isArray(result.days)) {
      throw new Error('Invalid meal plan structure: missing days array');
    }

    return result;
  } catch (error) {
    console.error('AI generation error:', error);

    // Retry once if JSON parsing failed
    if (error instanceof SyntaxError) {
      console.log('Retrying AI request due to JSON parse error...');
      const retryMessage = await client.messages.create({
        model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 16000,
        temperature: 0.7,
        system: SYSTEM_PROMPT + '\n\nIMPORTANT: Return ONLY valid JSON, no markdown, no explanations.',
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const retryContent = retryMessage.content[0];
      if (retryContent.type !== 'text') {
        throw new Error('Unexpected response type from AI on retry');
      }

      let retryJsonText = retryContent.text.trim();
      if (retryJsonText.startsWith('```')) {
        retryJsonText = retryJsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
      }

      return JSON.parse(retryJsonText) as MealPlanJson;
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
  const prompt = `Extract recipe information from this HTML and normalize it to JSON format.

URL: ${url}
HTML content: ${html.substring(0, 8000)}

Required JSON format:
{
  "title": "Recipe name",
  "description": "Brief description",
  "cuisine": "Cambodian/Thai/Vietnamese/etc",
  "dietTags": "vegetarian,vegan,halal" (based on ingredients),
  "difficulty": "easy/medium/hard",
  "timeMins": 30,
  "estimatedPrice": 15000,
  "currency": "${currency}",
  "kcal": 450,
  "proteinG": 25,
  "carbsG": 50,
  "fatG": 15,
  "ingredients": [{"name": "chicken", "qty": "500", "unit": "g", "notes": "diced"}],
  "steps": "Step-by-step cooking instructions in markdown",
  "safety": "Food safety tips in markdown"
}

Diet requirements: vegetarian=${dietFlags.vegetarian}, vegan=${dietFlags.vegan}, halal=${dietFlags.halal}
Estimate price in ${currency} for SEA region.
Return ONLY valid JSON, no markdown, no explanations.`;

  const message = await client.messages.create({
    model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.3,
    system: 'You are a recipe data extraction expert. Return ONLY valid JSON.',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
  }

  return JSON.parse(jsonText);
}

export async function extractRecipeFromYouTube(
  youtubeUrl: string,
  videoTitle: string,
  videoDescription: string,
  currency: string
): Promise<any> {
  // Extract video ID from YouTube URL
  const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube URL');
  }

  const prompt = `Extract recipe information from this YouTube video and normalize it to JSON format.

Video URL: ${youtubeUrl}
Video Title: ${videoTitle}
Video Description: ${videoDescription.substring(0, 4000)}

From the video title and description, extract recipe details and create a complete recipe in JSON format:
{
  "title": "Recipe name (from video title or description)",
  "description": "Brief description of what this recipe is",
  "cuisine": "Identify cuisine type if possible (Cambodian/Thai/Vietnamese/American/etc)",
  "dietTags": "Identify dietary tags based on ingredients mentioned",
  "difficulty": "Estimate difficulty (easy/medium/hard) based on instructions",
  "timeMins": 30,
  "estimatedPrice": 5.50,
  "currency": "${currency}",
  "kcal": 450,
  "proteinG": 25,
  "carbsG": 50,
  "fatG": 15,
  "fiberG": 3,
  "sugarG": 5,
  "sodiumMg": 600,
  "ingredients": [{"name": "ingredient name", "qty": "amount", "unit": "g/ml/tbsp/etc", "notes": "optional notes"}],
  "steps": "Step-by-step cooking instructions in numbered markdown format (1. step one\\n2. step two\\n3. etc)",
  "safety": "Food safety tips relevant to this recipe in markdown format"
}

IMPORTANT:
- Extract as much detail as possible from the video description
- List ALL ingredients mentioned with quantities if available
- If quantities are not mentioned, make reasonable estimates for a standard serving
- Write detailed numbered steps based on what the video likely shows
- Estimate nutritional values based on typical ingredients
- Estimate cooking time based on the video length or description
- Return ONLY valid JSON, no markdown code blocks, no explanations, no text before or after.`;

  const message = await client.messages.create({
    model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.3,
    system: 'You are an expert recipe extraction specialist. Extract recipe information from YouTube video descriptions and titles. Return ONLY valid JSON, with no markdown, no explanations, no code blocks.',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  let jsonText = content.text.trim();
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
  }

  const recipeData = JSON.parse(jsonText);

  // Ensure ingredients is properly formatted
  if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
    recipeData.ingredientsJson = JSON.stringify(recipeData.ingredients);
    delete recipeData.ingredients;
  }

  // Rename steps and safety fields to match API
  if (recipeData.steps) {
    recipeData.stepsMd = recipeData.steps;
    delete recipeData.steps;
  }

  if (recipeData.safety) {
    recipeData.safetyMd = recipeData.safety;
    delete recipeData.safety;
  }

  // Add source URL
  recipeData.sourceUrl = youtubeUrl;

  return recipeData;
}
