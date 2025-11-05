import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createErrorResponse } from '@/lib/api-errors';

/**
 * Middleware to require authentication on API routes
 * Usage in route handlers:
 *
 * export async function GET(request: NextRequest) {
 *   const user = await requireAuth(request);
 *   if (user instanceof NextResponse) return user; // error response
 *
 *   // user is now an AuthToken with userId and email
 *   const userId = user.userId;
 * }
 */
export function requireAuth(
  request: NextRequest
): ReturnType<typeof getCurrentUser> {
  const user = getCurrentUser(request);

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Creates a 401 Unauthorized response
 */
export function createUnauthorizedResponse() {
  return NextResponse.json(
    createErrorResponse(401, 'Missing or invalid authentication token'),
    { status: 401 }
  );
}

/**
 * Creates a 403 Forbidden response
 */
export function createForbiddenResponse(message: string = 'Access denied') {
  return NextResponse.json(
    createErrorResponse(403, message),
    { status: 403 }
  );
}
