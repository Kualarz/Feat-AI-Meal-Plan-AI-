import { NextRequest, NextResponse } from 'next/server';
import { normalizeRecipeFromUrl } from '@/lib/ai';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, diet, currency } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    // Fetch the URL
    console.log('Fetching recipe from URL:', url);
    const response = await fetch(url);
    const html = await response.text();

    // Try to extract schema.org/Recipe first
    let recipeData: any = null;

    // Simple schema.org extraction (could be enhanced with a proper parser)
    const schemaMatch = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/s
    );
    if (schemaMatch) {
      try {
        const schema = JSON.parse(schemaMatch[1]);
        if (schema['@type'] === 'Recipe' || schema['@graph']?.some((item: any) => item['@type'] === 'Recipe')) {
          const recipeSchema = schema['@type'] === 'Recipe' ? schema : schema['@graph'].find((item: any) => item['@type'] === 'Recipe');

          // Convert schema.org to our format
          recipeData = {
            title: recipeSchema.name,
            description: recipeSchema.description,
            timeMins: recipeSchema.totalTime ? parseDuration(recipeSchema.totalTime) : null,
            kcal: recipeSchema.nutrition?.calories ? parseInt(recipeSchema.nutrition.calories) : null,
            proteinG: recipeSchema.nutrition?.proteinContent ? parseInt(recipeSchema.nutrition.proteinContent) : null,
            ingredients: recipeSchema.recipeIngredient?.map((ing: string) => ({
              name: ing,
              qty: '',
              unit: '',
              notes: '',
            })) || [],
            steps: Array.isArray(recipeSchema.recipeInstructions)
              ? recipeSchema.recipeInstructions.map((step: any) =>
                  typeof step === 'string' ? step : step.text
                ).join('\n\n')
              : recipeSchema.recipeInstructions,
          };
        }
      } catch (e) {
        console.log('Failed to parse schema.org, will use AI normalization');
      }
    }

    // If no schema.org found, use AI to normalize
    if (!recipeData) {
      console.log('No schema.org found, using AI to normalize...');
      recipeData = await normalizeRecipeFromUrl(
        html,
        url,
        diet || { vegetarian: false, vegan: false, halal: false },
        currency || 'KHR'
      );
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
