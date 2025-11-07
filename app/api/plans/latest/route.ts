import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    // Optional authentication - guests get null
    const user = requireAuth(request);

    if (!user) {
      // Return null for guests (no plan available)
      return NextResponse.json({ plan: null });
    }

    const plan = await db.plan.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        meals: {
          include: {
            recipe: true,
          },
          orderBy: { dateISO: 'asc' },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch latest plan');
    return NextResponse.json(response, { status: statusCode });
  }
}
