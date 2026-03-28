import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const collections = await (db as any).collection.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { savedRecipes: true } },
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch collections');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const collection = await (db as any).collection.create({
      data: { userId: user.userId, name: name.trim() },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to create collection');
    return NextResponse.json(response, { status: statusCode });
  }
}
