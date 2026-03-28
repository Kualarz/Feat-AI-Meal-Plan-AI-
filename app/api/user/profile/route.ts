import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const dbUser = await db.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true, avatarUrl: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch profile');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const body = await request.json();
    const { name, avatarUrl } = body;

    const updatedUser = await db.user.update({
      where: { id: user.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: { id: true, name: true, email: true, avatarUrl: true }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to update profile');
    return NextResponse.json(response, { status: statusCode });
  }
}
