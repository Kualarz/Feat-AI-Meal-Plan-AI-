import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const RECIPE_JSON_SCHEMA = `{
  "title": "string - recipe name",
  "description": "string - 2-3 sentence appetizing description",
  "cuisine": "string - e.g. Thai, Cambodian, Italian",
  "difficulty": "easy | medium | hard",
  "timeMins": "number",
  "estimatedPrice": "number",
  "currency": "string - e.g. USD, KHR",
  "kcal": "number",
  "proteinG": "number",
  "carbsG": "number",
  "fatG": "number",
  "fiberG": "number",
  "sugarG": "number",
  "sodiumMg": "number",
  "dietTags": "string - comma-separated e.g. halal,gluten-free",
  "ingredients": [{ "name": "string", "qty": "string", "unit": "string", "notes": "string" }],
  "steps": "string - step-by-step in markdown with ## headings",
  "safety": "string - food safety tips in markdown",
  "cookware": ["string"],
  "tags": "string - comma-separated",
  "imageUrl": "string | null"
}`;

export async function extractRecipeFromHtml(
  html: string,
  url: string,
  dietFlags: { vegetarian: boolean; vegan: boolean; halal: boolean },
  currency: string
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' } as any,
  });

  const prompt = `Extract recipe information from this webpage HTML and return a complete recipe as JSON.

URL: ${url}
HTML (first 8000 chars): ${html.substring(0, 8000)}

Diet requirements: vegetarian=${dietFlags.vegetarian}, vegan=${dietFlags.vegan}, halal=${dietFlags.halal}
Estimate price in ${currency} for SEA region.

Return JSON matching this exact schema:
${RECIPE_JSON_SCHEMA}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

export async function extractRecipeFromVideo(
  url: string,
  platform: 'tiktok' | 'instagram' | 'facebook',
  metadata: { title: string; description: string; imageUrl: string | null },
  currency: string
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' } as any,
  });

  const prompt = `A user shared a ${platform} food video. Generate a complete, detailed recipe based on the available metadata.

Platform: ${platform}
Video URL: ${url}
Video title: ${metadata.title || 'Not available'}
Video caption/description: ${metadata.description || 'Not available'}

Use all clues from the title and caption to identify the dish. Generate a realistic, detailed recipe.
Estimate price in ${currency}.

Return JSON matching this exact schema:
${RECIPE_JSON_SCHEMA}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}
