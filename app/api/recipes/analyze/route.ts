import { NextRequest, NextResponse } from 'next/server';
import { analyzeRecipeDraft } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeText, currency } = body;

    if (!recipeText) {
      return NextResponse.json({ error: 'Missing recipe text' }, { status: 400 });
    }

    const analysis = await analyzeRecipeDraft(recipeText, currency || 'USD');

    return NextResponse.json({ ...analysis, success: true });
  } catch (error) {
    console.error('Error analyzing recipe:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze recipe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
