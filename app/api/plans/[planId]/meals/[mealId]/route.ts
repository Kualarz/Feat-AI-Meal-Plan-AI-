import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

// DELETE /api/plans/[planId]/meals/[mealId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string; mealId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const plan = await db.plan.findUnique({ where: { id: params.planId } });
    if (!plan || plan.userId !== user.userId) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    await db.planMeal.delete({ where: { id: params.mealId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to remove meal');
    return NextResponse.json(response, { status: statusCode });
  }
}
