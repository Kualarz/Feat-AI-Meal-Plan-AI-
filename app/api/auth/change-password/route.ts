import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
    }

    const dbUser = await db.user.findUnique({ where: { id: user.userId } });
    if (!dbUser?.password) {
      return NextResponse.json({ error: 'No password set for this account.' }, { status: 400 });
    }

    const valid = await verifyPassword(currentPassword, dbUser.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await db.user.update({ where: { id: user.userId }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to change password');
    return NextResponse.json(response, { status: statusCode });
  }
}
