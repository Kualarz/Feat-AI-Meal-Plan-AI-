import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = requireAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Get user's plans only
    const plans = await prisma.plan.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        weekStart: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      plans: plans.map((plan) => ({
        id: plan.id,
        weekStart: plan.weekStart.toISOString(),
        weekEnd: plan.weekEnd.toISOString(),
      })),
    });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch plans');
    return NextResponse.json(response, { status: statusCode });
  }
}
