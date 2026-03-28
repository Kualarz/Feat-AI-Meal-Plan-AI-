import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const count = await (db as any).like.count({ where: { recipeId: params.id } });
    const liked = user
      ? !!(await (db as any).like.findUnique({
          where: { userId_recipeId: { userId: user.userId, recipeId: params.id } },
        }))
      : false;
    return NextResponse.json({ liked, count });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to get like status');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const existing = await (db as any).like.findUnique({
      where: { userId_recipeId: { userId: user.userId, recipeId: params.id } },
    });

    if (existing) {
      await (db as any).like.delete({ where: { id: existing.id } });
      const count = await (db as any).like.count({ where: { recipeId: params.id } });
      return NextResponse.json({ liked: false, count });
    } else {
      await (db as any).like.create({ data: { userId: user.userId, recipeId: params.id } });
      const count = await (db as any).like.count({ where: { recipeId: params.id } });
      return NextResponse.json({ liked: true, count });
    }
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to toggle like');
    return NextResponse.json(response, { status: statusCode });
  }
}
