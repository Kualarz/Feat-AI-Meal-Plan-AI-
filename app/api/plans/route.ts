import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

const prisma = new PrismaClient();

// POST /api/plans — get-or-create this week's plan for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    let plan = await prisma.plan.findFirst({
      where: { userId: user.userId, weekStart: { gte: monday }, weekEnd: { lte: sunday } },
      include: { meals: { include: { recipe: true }, orderBy: { dateISO: 'asc' } } },
    });

    if (!plan) {
      plan = await prisma.plan.create({
        data: { userId: user.userId, weekStart: monday, weekEnd: sunday },
        include: { meals: { include: { recipe: true }, orderBy: { dateISO: 'asc' } } },
      });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to initialise plan');
    return NextResponse.json(response, { status: statusCode });
  }
}

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
