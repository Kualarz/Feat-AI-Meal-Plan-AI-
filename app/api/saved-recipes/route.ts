import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const saved = await db.savedRecipe.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    const recipeIds = saved.map((s) => s.recipeId);

    const recipes = await db.recipe.findMany({
      where: { id: { in: recipeIds } },
    });

    // Preserve saved order and attach collectionId
    const savedMap = new Map(saved.map((s) => [s.recipeId, s]));
    const recipeMap = new Map(recipes.map((r) => [r.id, r]));
    const ordered = recipeIds
      .map((id) => {
        const recipe = recipeMap.get(id);
        const savedEntry = savedMap.get(id);
        if (!recipe || !savedEntry) return null;
        return {
          ...recipe,
          collectionId: (savedEntry as any).collectionId ?? null,
          savedRecipeId: savedEntry.id,
        };
      })
      .filter(Boolean);

    return NextResponse.json(ordered);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch saved recipes');
    return NextResponse.json(response, { status: statusCode });
  }
}
