import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

// POST /api/plan/queue — add a recipe to the current week's plan queue
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const { recipeId } = await request.json();
    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 });
    }

    // Verify recipe exists
    const recipe = await db.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Get or create this week's plan
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    let plan = await db.plan.findFirst({
      where: { userId: user.userId, weekStart: { gte: monday }, weekEnd: { lte: sunday } },
    });

    if (!plan) {
      plan = await db.plan.create({
        data: { userId: user.userId, weekStart: monday, weekEnd: sunday },
      });
    }

    const queued = await db.planMeal.create({
      data: {
        planId: plan.id,
        slot: 'queue',
        dateISO: null,
        recipeId,
      },
      include: { recipe: true },
    });

    return NextResponse.json(queued, { status: 201 });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to add recipe to queue');
    return NextResponse.json(response, { status: statusCode });
  }
}

// GET /api/plan/queue — fetch all queued recipes for the current week's plan
export async function GET(request: NextRequest) {
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

    const plan = await db.plan.findFirst({
      where: { userId: user.userId, weekStart: { gte: monday }, weekEnd: { lte: sunday } },
    });

    if (!plan) return NextResponse.json([]);

    const queued = await db.planMeal.findMany({
      where: { planId: plan.id, slot: 'queue' },
      include: { recipe: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(queued);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch queue');
    return NextResponse.json(response, { status: statusCode });
  }
}
