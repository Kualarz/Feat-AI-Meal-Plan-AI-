import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    // Fetch all saved recipes for the user
    // including their recipe data and collection info
    const savedRecipes = await db.savedRecipe.findMany({
      where: { userId: user.userId },
      include: {
        recipe: true,
        collection: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all collections for the user to ensure empty folders are shown
    const collections = await db.collection.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'asc' },
    });

    // Group recipes by collection
    const library: any = {
      uncategorized: [],
      collections: collections.map((c: any) => ({
        ...c,
        recipes: [],
      })),
    };

    savedRecipes.forEach((sr: any) => {
      if (sr.collectionId) {
        const collection = library.collections.find((c: any) => c.id === sr.collectionId);
        if (collection) {
          collection.recipes.push(sr.recipe);
        } else {
          // Collection might have been deleted, treat as uncategorized
          library.uncategorized.push(sr.recipe);
        }
      } else {
        library.uncategorized.push(sr.recipe);
      }
    });

    return NextResponse.json(library);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch library');
    return NextResponse.json(response, { status: statusCode });
  }
}
