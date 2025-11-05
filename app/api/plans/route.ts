import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // For now, get all plans (in a real app, filter by userId)
    const plans = await prisma.plan.findMany({
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
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
