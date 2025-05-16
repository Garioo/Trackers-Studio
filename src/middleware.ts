import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is authenticated via cookie
  const isAuthenticated = request.cookies.get('gta-tracker-auth')?.value === 'true';

  // If not authenticated and not on auth pages, redirect to home
  if (!isAuthenticated && request.nextUrl.pathname !== '/home') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 