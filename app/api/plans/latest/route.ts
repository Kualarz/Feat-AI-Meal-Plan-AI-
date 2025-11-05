import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = requireAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
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
