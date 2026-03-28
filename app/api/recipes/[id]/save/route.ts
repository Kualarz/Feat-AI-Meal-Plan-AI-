import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const recipeId = params.id;

    // Check if recipe exists
    const recipe = await db.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Toggle saved status
    const existing = await db.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.userId,
          recipeId: recipeId,
        },
      },
    });

    if (existing) {
      await db.savedRecipe.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false, message: 'Removed from library' });
    } else {
      await db.savedRecipe.create({
        data: {
          userId: user.userId,
          recipeId: recipeId,
        },
      });
      return NextResponse.json({ saved: true, message: 'Saved to library' });
    }
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to toggle save status');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ saved: false });
    }

    const saved = await db.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.userId,
          recipeId: params.id,
        },
      },
    });

    return NextResponse.json({ saved: !!saved });
  } catch (error) {
    return NextResponse.json({ saved: false });
  }
}
