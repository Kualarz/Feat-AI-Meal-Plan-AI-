import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

// POST /api/plans/[planId]/meals — add or replace a meal in a slot
export async function POST(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const plan = await db.plan.findUnique({ where: { id: params.planId } });
    if (!plan || plan.userId !== user.userId) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { recipeId, dateISO, slot } = await request.json();
    if (!recipeId || !dateISO || !slot) {
      return NextResponse.json({ error: 'recipeId, dateISO, slot are required' }, { status: 400 });
    }

    const validSlots = ['breakfast', 'lunch', 'dinner', 'dessert', 'any'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    let meal;
    if (slot === 'any') {
      // Free-form: always create — multiple recipes per day are allowed
      meal = await db.planMeal.create({
        data: { planId: params.planId, recipeId, dateISO, slot },
        include: { recipe: true },
      });
    } else {
      // Fixed slot: upsert — replace existing meal in that slot/date
      const existing = await db.planMeal.findFirst({
        where: { planId: params.planId, dateISO, slot },
      });
      if (existing) {
        meal = await db.planMeal.update({
          where: { id: existing.id },
          data: { recipeId },
          include: { recipe: true },
        });
      } else {
        meal = await db.planMeal.create({
          data: { planId: params.planId, recipeId, dateISO, slot },
          include: { recipe: true },
        });
      }
    }

    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to add meal');
    return NextResponse.json(response, { status: statusCode });
  }
}
