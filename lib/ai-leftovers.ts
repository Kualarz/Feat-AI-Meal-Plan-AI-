import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface LeftoverRecipeSuggestion {
  title: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_mins: number;
  ingredients_used: string[];
  additional_items_needed: string[];
  steps: string;
  why: string;
  image_url?: string;
}

export interface LeftoverRecipesResponse {
  suggestions: LeftoverRecipeSuggestion[];
  rationale: string;
}

const SYSTEM_PROMPT =
  `Zero-waste SEA home chef. Use ALL provided leftovers — minimize extra items. ` +
  `Return JSON: {"suggestions":[{"title":"","cuisine":"","difficulty":"easy|medium|hard","time_mins":0,` +
  `"ingredients_used":[],"additional_items_needed":[],"steps":"","why":""}],"rationale":""}`;

export async function generateLeftoverRecipes(
  leftoverIngredients: string[],
  currency: string = 'USD'
): Promise<LeftoverRecipesResponse> {
  const userMessage = `Leftovers: ${leftoverIngredients.join(', ')}. Suggest 3-5 SEA recipes. Currency: ${currency}`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 2048,
      } as any,
    });

    const result = await model.generateContent(userMessage);
    const jsonText = result.response.text().trim();
    const parsed = JSON.parse(jsonText) as LeftoverRecipesResponse;

    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      throw new Error('Invalid response structure: missing suggestions array');
    }

    return parsed;
  } catch (error) {
    console.error('Leftover recipe generation error:', error);

    if (error instanceof SyntaxError) {
      console.log('Retrying leftover recipe request...');
      const retryModel = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite-preview',
        systemInstruction: SYSTEM_PROMPT + '\n\nIMPORTANT: Return ONLY valid JSON, nothing else.',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2048,
        } as any,
      });

      const retryResult = await retryModel.generateContent(userMessage);
      return JSON.parse(retryResult.response.text().trim()) as LeftoverRecipesResponse;
    }

    throw error;
  }
}
