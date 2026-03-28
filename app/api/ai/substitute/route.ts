import { NextRequest, NextResponse } from 'next/server';
import { getIngredientSubstitutes } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { ingredientName, recipeContext } = await request.json();

    if (!ingredientName) {
      return NextResponse.json({ error: 'Ingredient name is required' }, { status: 400 });
    }

    const substitutesData = await getIngredientSubstitutes(ingredientName, recipeContext || '');
    return NextResponse.json(substitutesData);
  } catch (error) {
    console.error('AI Substitutes Error:', error);
    return NextResponse.json({ error: 'Failed to generate substitutes' }, { status: 500 });
  }
}
