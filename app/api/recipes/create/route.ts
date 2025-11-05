import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.cuisine) {
      return NextResponse.json(
        { error: 'Title and cuisine are required' },
        { status: 400 }
      );
    }

    // Validate ingredients
    let ingredientsJson = body.ingredientsJson;
    if (typeof ingredientsJson === 'string') {
      try {
        JSON.parse(ingredientsJson);
      } catch {
        return NextResponse.json(
          { error: 'Invalid ingredients format' },
          { status: 400 }
        );
      }
    } else {
      ingredientsJson = JSON.stringify(ingredientsJson || []);
    }

    // Validate cooking steps
    if (!body.stepsMd || !body.stepsMd.trim()) {
      return NextResponse.json(
        { error: 'Cooking steps are required' },
        { status: 400 }
      );
    }

    // Create recipe in database
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        description: body.description || null,
        cuisine: body.cuisine,
        difficulty: body.difficulty || 'medium',
        timeMins: body.timeMins ? parseInt(body.timeMins) : null,
        estimatedPrice: body.estimatedPrice ? parseFloat(body.estimatedPrice) : null,
        currency: body.currency || 'USD',
        kcal: body.kcal ? parseInt(body.kcal) : null,
        proteinG: body.proteinG ? parseInt(body.proteinG) : null,
        carbsG: body.carbsG ? parseInt(body.carbsG) : null,
        fatG: body.fatG ? parseInt(body.fatG) : null,
        fiberG: body.fiberG ? parseInt(body.fiberG) : null,
        sugarG: body.sugarG ? parseInt(body.sugarG) : null,
        sodiumMg: body.sodiumMg ? parseInt(body.sodiumMg) : null,
        ingredientsJson,
        stepsMd: body.stepsMd,
        safetyMd: body.safetyMd || null,
        imageUrl: body.imageUrl || null,
        sourceUrl: null,
        tags: body.tags || null,
        dietTags: body.dietTags || null,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
