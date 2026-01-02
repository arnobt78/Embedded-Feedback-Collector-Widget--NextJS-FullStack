/**
 * Next.js Middleware
 *
 * Protects routes by checking authentication status.
 * Redirects unauthenticated users to sign-in page.
 *
 * Protected Routes:
 * - /dashboard/* - All dashboard routes require authentication
 *
 * Public Routes:
 * - /api/auth/* - NextAuth routes (must be public)
 * - /api/feedback - Feedback API (public, uses API key auth)
 * - /auth/* - Authentication pages (sign-in, sign-up)
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/api/auth", "/api/feedback", "/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes to pass through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const session = await auth();

    // If not authenticated, redirect to sign-in
    if (!session) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Authenticated user, allow access
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

/**
 * Matcher Configuration
 *
 * Specifies which routes the middleware should run on.
 * More efficient than running on every request.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (files in public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

