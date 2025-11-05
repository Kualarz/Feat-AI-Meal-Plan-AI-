import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractRecipeFromYouTube } from '@/lib/ai';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    if (!body.title) {
      return NextResponse.json(
        { error: 'Video title is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    if (!youtubeRegex.test(body.url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Extract recipe from YouTube
    const recipeData = await extractRecipeFromYouTube(
      body.url,
      body.title,
      body.description || '',
      body.currency || 'USD'
    );

    // Validate extracted data
    if (!recipeData.title || !recipeData.cuisine) {
      return NextResponse.json(
        { error: 'Could not extract sufficient recipe information from the video' },
        { status: 400 }
      );
    }

    // Create recipe in database
    const recipe = await prisma.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description || null,
        cuisine: recipeData.cuisine,
        difficulty: recipeData.difficulty || 'medium',
        timeMins: recipeData.timeMins ? parseInt(recipeData.timeMins) : null,
        estimatedPrice: recipeData.estimatedPrice ? parseFloat(recipeData.estimatedPrice) : null,
        currency: recipeData.currency || 'USD',
        kcal: recipeData.kcal ? parseInt(recipeData.kcal) : null,
        proteinG: recipeData.proteinG ? parseInt(recipeData.proteinG) : null,
        carbsG: recipeData.carbsG ? parseInt(recipeData.carbsG) : null,
        fatG: recipeData.fatG ? parseInt(recipeData.fatG) : null,
        fiberG: recipeData.fiberG ? parseInt(recipeData.fiberG) : null,
        sugarG: recipeData.sugarG ? parseInt(recipeData.sugarG) : null,
        sodiumMg: recipeData.sodiumMg ? parseInt(recipeData.sodiumMg) : null,
        ingredientsJson: recipeData.ingredientsJson || JSON.stringify([]),
        stepsMd: recipeData.stepsMd || '',
        safetyMd: recipeData.safetyMd || null,
        imageUrl: recipeData.imageUrl || null,
        sourceUrl: recipeData.sourceUrl || body.url,
        tags: recipeData.tags || 'youtube-import',
        dietTags: recipeData.dietTags || null,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error importing recipe from YouTube:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to import recipe from YouTube';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
