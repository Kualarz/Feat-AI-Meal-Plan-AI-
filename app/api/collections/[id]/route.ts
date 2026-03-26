import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existing = await (db as any).collection.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const collection = await (db as any).collection.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });

    return NextResponse.json(collection);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to rename collection');
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

    const existing = await (db as any).collection.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Recipes in this collection become uncollected (collectionId → null via SetNull)
    await (db as any).collection.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to delete collection');
    return NextResponse.json(response, { status: statusCode });
  }
}
