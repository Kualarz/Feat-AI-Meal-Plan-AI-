import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to add security headers, CORS, and request logging
 * Runs on Edge Runtime for all requests
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CORS Headers (allow requests from same origin and configured domains)
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://feastai.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL,
  ];

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

// Configure which routes use the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
