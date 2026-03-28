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

    const { rating } = await request.json();

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating. Must be between 1 and 5.' }, { status: 400 });
    }

    const recipeId = params.id;

    // Check if recipe exists
    const recipe = await db.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Since we don't have a UserRating model yet, we'll update the global average.
    // In a real app, we'd calculate this from all UserRatings.
    // For now, let's just update the recipe's rating field.
    // To make it slightly more realistic, let's average it with the existing one
    // (assuming it's a new rating if it was 0, or just moving towards the new one).
    
    // Simplification for the current schema:
    const currentRating = recipe.rating || 0;
    const newRating = currentRating === 0 ? rating : (currentRating + rating) / 2;

    await db.recipe.update({
      where: { id: recipeId },
      data: { rating: newRating },
    });

    return NextResponse.json({ rating: newRating, success: true });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to submit rating');
    return NextResponse.json(response, { status: statusCode });
  }
}
