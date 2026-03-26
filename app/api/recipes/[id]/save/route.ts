import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const recipe = await db.recipe.findUnique({ where: { id: params.id } });
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const saved = await db.savedRecipe.upsert({
      where: { userId_recipeId: { userId: user.userId, recipeId: params.id } },
      create: { userId: user.userId, recipeId: params.id },
      update: {},
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to save recipe');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    await db.savedRecipe.deleteMany({
      where: { userId: user.userId, recipeId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to unsave recipe');
    return NextResponse.json(response, { status: statusCode });
  }
}
