import { NextRequest, NextResponse } from 'next/server';
import { generateLeftoverRecipes } from '@/lib/ai-leftovers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, currency } = body as {
      ingredients: string[];
      currency?: string;
    };

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one leftover ingredient' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not set');
      return NextResponse.json(
        { error: 'AI service not configured. Please set ANTHROPIC_API_KEY.' },
        { status: 500 }
      );
    }

    // Generate recipe suggestions
    console.log('Generating recipe suggestions for leftovers:', ingredients);
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
    console.error('Error generating leftover recipes:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          error: 'AI service not properly configured',
          details: 'Missing or invalid Anthropic API key',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate recipe suggestions',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
