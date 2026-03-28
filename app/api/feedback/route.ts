import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const body = await request.json();
    const { feedback, type = 'general' } = body;

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback content is required' }, { status: 400 });
    }

    // In a real app, you'd save this to a Feedback table or email it.
    // For now, we'll log it and return success.
    console.log(`[FEEDBACK] User ${user.userId} (${type}): ${feedback}`);

    return NextResponse.json({
      success: true,
      message: 'Feedback received! Thank you for helping us improve Feast AI.'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
