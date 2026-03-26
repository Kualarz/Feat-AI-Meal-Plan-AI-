import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleAPIError } from '@/lib/api-errors';
import { validateEmail } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Invalidate any existing unused tokens for this user
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate a secure token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // TODO: Send email via Resend when email infrastructure is added
    // For now, return the token in development for testing
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      message: 'If that email exists, a reset link has been sent.',
      ...(isDev && { token, resetUrl: `/auth/reset-password?token=${token}` }),
    });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to process password reset request');
    return NextResponse.json(response, { status: statusCode });
  }
}
