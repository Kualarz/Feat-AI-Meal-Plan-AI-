import { NextRequest, NextResponse } from 'next/server';
import { extractRecipeFromHtml, extractRecipeFromVideo } from '@/lib/gemini';
import { db } from '@/lib/db';

function getSocialPlatform(url: string): 'instagram' | 'tiktok' | 'facebook' | null {
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/fb\.watch|facebook\.com\/.*\/videos/.test(url)) return 'facebook';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, diet, currency } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    let recipeData: any = null;
    const socialPlatform = getSocialPlatform(url);

    if (socialPlatform) {
      // Social media video — skip HTML fetch, use AI with metadata
      console.log(`Social media URL detected (${socialPlatform}), using video extraction...`);
      // Try to fetch OG metadata for title/description/image
      let title = '', description = '', imageUrl: string | null = null;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] || '';
        description = html.match(/<meta property="og:description" content="([^"]*)"/)?.[1] || '';
        imageUrl = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1] || null;
      } catch {
        // metadata fetch failed — proceed with empty metadata
      }
      recipeData = await extractRecipeFromVideo(url, socialPlatform, { title, description, imageUrl }, currency || 'KHR');
      if (!recipeData?.title || !recipeData?.ingredients?.length) {
        return NextResponse.json({ error: 'Could not extract recipe from this link. The video may not contain a recipe.' }, { status: 422 });
      }
    } else {
      // Regular web URL — fetch HTML and try schema.org first
      console.log('Fetching recipe from URL:', url);
      const response = await fetch(url);
      const html = await response.text();

      // Try schema.org/Recipe extraction first
      const schemaMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
      if (schemaMatch) {
        try {
          const schema = JSON.parse(schemaMatch[1]);
          if (schema['@type'] === 'Recipe' || schema['@graph']?.some((item: any) => item['@type'] === 'Recipe')) {
            const recipeSchema = schema['@type'] === 'Recipe' ? schema : schema['@graph'].find((item: any) => item['@type'] === 'Recipe');
            recipeData = {
              title: recipeSchema.name,
              description: recipeSchema.description,
              timeMins: recipeSchema.totalTime ? parseDuration(recipeSchema.totalTime) : null,
              kcal: recipeSchema.nutrition?.calories ? parseInt(recipeSchema.nutrition.calories) : null,
              proteinG: recipeSchema.nutrition?.proteinContent ? parseInt(recipeSchema.nutrition.proteinContent) : null,
              ingredients: recipeSchema.recipeIngredient?.map((ing: string) => ({
                name: ing, qty: '', unit: '', notes: '',
              })) || [],
              steps: Array.isArray(recipeSchema.recipeInstructions)
                ? recipeSchema.recipeInstructions.map((step: any) => typeof step === 'string' ? step : step.text).join('\n\n')
                : recipeSchema.recipeInstructions,
            };
          }
        } catch {
          console.log('Failed to parse schema.org, will use AI normalization');
        }
      }

      // Fallback to AI HTML extraction
      if (!recipeData) {
        console.log('No schema.org found, using AI to normalize...');
        recipeData = await extractRecipeFromHtml(
          html, url,
          body.diet || { vegetarian: false, vegan: false, halal: false },
          currency || 'KHR'
        );
      }
    }

    // Save to database
    const recipe = await db.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description || '',
        cuisine: recipeData.cuisine || 'International',
        dietTags: recipeData.dietTags || '',
        difficulty: recipeData.difficulty || 'medium',
        timeMins: recipeData.timeMins || null,
        estimatedPrice: recipeData.estimatedPrice || null,
        currency: currency || 'KHR',
        kcal: recipeData.kcal || null,
        proteinG: recipeData.proteinG || null,
        carbsG: recipeData.carbsG || null,
        fatG: recipeData.fatG || null,
        fiberG: recipeData.fiberG || null,
        sugarG: recipeData.sugarG || null,
        sodiumMg: recipeData.sodiumMg || null,
        ingredientsJson: JSON.stringify(recipeData.ingredients || []),
        stepsMd: recipeData.steps || '',
        safetyMd: recipeData.safety || 'Follow standard food safety practices.',
        imageUrl: recipeData.imageUrl || null,
        sourceUrl: url,
        tags: recipeData.tags || 'imported',
      },
    });

    return NextResponse.json({ recipe, success: true });
  } catch (error) {
    console.error('Error importing recipe:', error);
    return NextResponse.json(
      {
        error: 'Failed to import recipe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function parseDuration(iso8601: string): number {
  // Parse ISO 8601 duration (e.g., "PT30M" = 30 minutes)
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  return hours * 60 + minutes;
}
