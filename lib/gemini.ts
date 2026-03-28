import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const RECIPE_JSON_SCHEMA = `{
  "title": "string",
  "description": "string - 3-4 sentences. Write like a food writer: lead with what makes this dish special, describe key flavors and textures vividly (e.g. crispy, silky, smoky, tangy), mention its cultural context or when it is perfect to eat. No generic phrases. Make the reader hungry.",
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
  "dietTags": "string - comma-separated unique tags e.g. halal,gluten-free (no duplicates)",
  "ingredients": [{ "name": "string - SINGLE ingredient only, never combine multiple ingredients into one entry", "qty": "string", "unit": "string", "notes": "string", "est_cost": number }],
  "steps": "string - detailed step-by-step markdown. Each numbered step must be specific and actionable: include exact quantities, precise technique (dice vs mince vs julienne), temperatures, timing, and sensory cues (until golden-brown, until fragrant, until sauce coats the back of a spoon). Write like a patient professional chef teaching a home cook. Minimum 8 steps.",
  "safety": "string - food safety tips in markdown",
  "cookware": ["string"],
  "tags": "string - comma-separated",
  "imageUrl": "string|null"
}`;

const MODEL_CONFIG = {
  model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
  systemInstruction:
    'You are a professional chef and food writer. Write recipes with precise, detailed cooking steps that include exact measurements, specific techniques, temperatures, timing, and sensory cues. Each ingredient must be listed as a separate entry — never group multiple ingredients into one. Descriptions must be vivid and evocative, making the reader hungry.',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.2,
    maxOutputTokens: 4096,
    thinking_level: 'medium',
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

export async function analyzeRecipeDraft(
  recipeText: string,
  currency: string
): Promise<any> {
  const model = genAI.getGenerativeModel(MODEL_CONFIG);

  const prompt = `Analyze this recipe draft. Provide nutritional information and estimate the total price in ${currency}.
Recipe Text:
${recipeText}

Return JSON matching schema: ${RECIPE_JSON_SCHEMA}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function extractRecipeFromImage(
  imageBuffer: Buffer,
  mimeType: string,
  currency: string
): Promise<any> {
  const model = genAI.getGenerativeModel(MODEL_CONFIG);

  const prompt = `Extract the full recipe from this image (e.g., from a cookbook or handwritten note). Provide nutritional information and estimate the total price in ${currency}.
Return JSON matching schema: ${RECIPE_JSON_SCHEMA}`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    },
  ]);
  return JSON.parse(result.response.text());
}
export async function getCookingTips(step: string, ingredients: string): Promise<{ tips: string[]; highlights: { word: string; explanation: string }[] }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    } as any,
  });

  const prompt = `As a professional chef, provide 2-3 helpful tips and explain any complex terms for this cooking step.
Step: ${step}
Ingredients: ${ingredients}

Return JSON:
{
  "tips": ["chef tip 1", "chef tip 2"],
  "highlights": [{"word": "simmer", "explanation": "To cook in liquid just below the boiling point..."}]
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function getIngredientSubstitutes(ingredientName: string, recipeContext: string): Promise<{ substitutes: string[]; description: string }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      thinking_level: 'minimal',
    } as any,
  });

  const prompt = `Provide 2-3 alternatives and a brief description for this ingredient.
Ingredient: ${ingredientName}
Recipe context: ${recipeContext}

Return JSON:
{
  "substitutes": ["alt 1", "alt 2"],
  "description": "Brief info about what this is and its role in the dish."
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
