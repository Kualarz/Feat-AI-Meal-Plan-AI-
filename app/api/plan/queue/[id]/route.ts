import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

// PATCH /api/plan/queue/[id] — promote a queued meal to a real slot + dateISO
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const { slot, dateISO } = await request.json();
    if (!slot || !dateISO) {
      return NextResponse.json({ error: 'slot and dateISO are required' }, { status: 400 });
    }

    const validSlots = ['breakfast', 'lunch', 'dinner', 'dessert'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'slot must be one of: breakfast, lunch, dinner, dessert' }, { status: 400 });
    }

    // Verify the planMeal belongs to this user
    const planMeal = await db.planMeal.findUnique({
      where: { id: params.id },
      include: { plan: true },
    });

    if (!planMeal || planMeal.plan.userId !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (planMeal.slot !== 'queue') {
      return NextResponse.json({ error: 'Meal is not in queue' }, { status: 400 });
    }

    const updated = await db.planMeal.update({
      where: { id: params.id },
      data: { slot, dateISO },
      include: { recipe: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to promote queued meal');
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE /api/plan/queue/[id] — remove a recipe from the queue
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const planMeal = await db.planMeal.findUnique({
      where: { id: params.id },
      include: { plan: true },
    });

    if (!planMeal || planMeal.plan.userId !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.planMeal.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to remove from queue');
    return NextResponse.json(response, { status: statusCode });
  }
}
