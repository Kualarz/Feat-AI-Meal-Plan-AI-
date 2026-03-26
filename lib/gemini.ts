import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const RECIPE_JSON_SCHEMA = `{
  "title": "string",
  "description": "string - 2-3 sentence appetizing description",
  "cuisine": "string - e.g. Thai, Cambodian, Italian",
  "difficulty": "easy|medium|hard",
  "timeMins": number,
  "estimatedPrice": number,
  "currency": "string - e.g. USD, KHR",
  "kcal": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "fiberG": number,
  "sugarG": number,
  "sodiumMg": number,
  "dietTags": "string - comma-separated e.g. halal,gluten-free",
  "ingredients": [{ "name": "string", "qty": "string", "unit": "string", "notes": "string", "est_cost": number }],
  "steps": "string - step-by-step in markdown with numbered steps",
  "safety": "string - food safety tips in markdown",
  "cookware": ["string"],
  "tags": "string - comma-separated",
  "imageUrl": "string|null"
}`;

const MODEL_CONFIG = {
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0,
    maxOutputTokens: 2048,
  } as any,
};

export async function extractRecipeFromHtml(
  html: string,
  url: string,
  dietFlags: { vegetarian: boolean; vegan: boolean; halal: boolean },
  currency: string
): Promise<any> {
  const model = genAI.getGenerativeModel(MODEL_CONFIG);

  const flags = `halal=${dietFlags.halal ? 1 : 0} veg=${dietFlags.vegetarian ? 1 : 0} vegan=${dietFlags.vegan ? 1 : 0}`;

  const prompt = `Extract recipe from HTML. ${flags} currency=${currency} region=SEA.
URL: ${url}
HTML: ${html.substring(0, 6000)}
Return JSON matching schema: ${RECIPE_JSON_SCHEMA}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function extractRecipeFromVideo(
  url: string,
  platform: 'tiktok' | 'instagram' | 'facebook',
  metadata: { title: string; description: string; imageUrl: string | null },
  currency: string
): Promise<any> {
  const model = genAI.getGenerativeModel(MODEL_CONFIG);

  const prompt = `Generate detailed recipe from ${platform} food video. currency=${currency} region=SEA.
title: ${(metadata.title || '').substring(0, 200)}
caption: ${(metadata.description || '').substring(0, 1000)}
url: ${url}
Return JSON matching schema: ${RECIPE_JSON_SCHEMA}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export { extractRecipeFromVideo as generateRecipeFromVideo };

export async function extractRecipeFromYouTube(
  youtubeUrl: string,
  videoTitle: string,
  videoDescription: string,
  currency: string
): Promise<any> {
  const model = genAI.getGenerativeModel(MODEL_CONFIG);

  const prompt = `Generate detailed recipe from YouTube video. currency=${currency} region=SEA.
title: ${(videoTitle || '').substring(0, 200)}
description: ${(videoDescription || '').substring(0, 1000)}
url: ${youtubeUrl}
Return JSON matching schema: ${RECIPE_JSON_SCHEMA}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
