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

    const { collectionId } = await request.json();
    const recipeId = params.id;

    // Check if the recipe is saved by the user
    const savedEntry = await db.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.userId,
          recipeId,
        },
      },
    });

    if (!savedEntry) {
      return NextResponse.json({ error: 'Recipe not in library' }, { status: 404 });
    }

    // Update the collectionId (null means move to uncategorized)
    const updated = await db.savedRecipe.update({
      where: { id: savedEntry.id },
      data: { collectionId: collectionId || null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to move recipe');
    return NextResponse.json(response, { status: statusCode });
  }
}
