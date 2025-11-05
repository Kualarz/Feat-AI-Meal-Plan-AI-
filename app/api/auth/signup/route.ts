import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, validateEmail, validatePasswordStrength, generateToken } from '@/lib/auth';
import { ErrorMessages, createErrorResponse, handleAPIError } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body: { name?: string; email?: string; password?: string; confirmPassword?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.INVALID_JSON),
        { status: 400 }
      );
    }

    const { name, email, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.AUTH_MISSING_CREDENTIALS),
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid email format'),
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        createErrorResponse(400, 'Passwords do not match'),
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        createErrorResponse(400, passwordValidation.message || ErrorMessages.AUTH_WEAK_PASSWORD),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.AUTH_USER_EXISTS),
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user with password field (will exist after schema migration)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword as any,
      } as any,
    });

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
      { status: 201 }
    );
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to create account');
    return NextResponse.json(response, { status: statusCode });
  }
}
