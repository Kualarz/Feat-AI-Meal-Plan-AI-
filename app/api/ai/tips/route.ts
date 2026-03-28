import { NextRequest, NextResponse } from 'next/server';
import { getCookingTips } from '@/lib/gemini';
import { requireAuth } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    // We allow anonymous users to get tips for better UX, but could require auth
    
    const { step, ingredients } = await request.json();

    if (!step) {
      return NextResponse.json({ error: 'Step text is required' }, { status: 400 });
    }

    const tipsData = await getCookingTips(step, ingredients || '');
    return NextResponse.json(tipsData);
  } catch (error) {
    console.error('AI Tips Error:', error);
    return NextResponse.json({ error: 'Failed to generate tips' }, { status: 500 });
  }
}
