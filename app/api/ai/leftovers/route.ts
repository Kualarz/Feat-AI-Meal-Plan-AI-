import { NextRequest, NextResponse } from 'next/server';
import { generateLeftoverRecipes } from '@/lib/ai-leftovers';
import { ErrorMessages, createErrorResponse, handleAPIError } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body: { ingredients?: unknown; currency?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.INVALID_JSON),
        { status: 400 }
      );
    }

    const { ingredients, currency } = body;

    // Validate ingredients array
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.AI_LEFTOVERS_EMPTY),
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[AI Leftovers] ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        createErrorResponse(500, ErrorMessages.AI_NO_API_KEY),
        { status: 500 }
      );
    }

    // Generate recipe suggestions
    console.log('[AI Leftovers] Generating suggestions for:', ingredients);
    const recipes = await generateLeftoverRecipes(
      ingredients,
      currency || 'USD'
    );

    return NextResponse.json(
      {
        success: true,
        recipes,
      },
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, response } = handleAPIError(
      error,
      'Failed to generate recipe suggestions'
    );

    return NextResponse.json(response, { status: statusCode });
  }
}
