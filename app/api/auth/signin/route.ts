import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { ErrorMessages, createErrorResponse, handleAPIError } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.INVALID_JSON),
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.AUTH_MISSING_CREDENTIALS),
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse(401, ErrorMessages.AUTH_INVALID_PASSWORD),
        { status: 401 }
      );
    }

    // Verify password (password field exists after schema migration)
    const userWithPassword = user as any;
    const isPasswordValid = await verifyPassword(password, userWithPassword.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        createErrorResponse(401, ErrorMessages.AUTH_INVALID_PASSWORD),
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user.id, user.email || '');

    // Return user and token (without password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to sign in');
    return NextResponse.json(response, { status: statusCode });
  }
}
