import { NextRequest, NextResponse } from 'next/server';
import { extractRecipeFromImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const currency = formData.get('currency') as string || 'USD';

    if (!image) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const analysis = await extractRecipeFromImage(buffer, image.type, currency);

    return NextResponse.json({ ...analysis, success: true });
  } catch (error) {
    console.error('Error analyzing recipe image:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze recipe image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
