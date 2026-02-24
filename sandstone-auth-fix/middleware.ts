import { NextResponse, type NextRequest } from "next/server";
import { updateSession, isProtectedRoute, redirectToLogin } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware for Authentication
 * 
 * This middleware handles:
 * - Session refresh and validation
 * - Protected route access control
 * - Redirect unauthenticated users to login
 * - Redirect authenticated users away from login page
 * 
 * The middleware runs on every request and ensures:
 * 1. Sessions are kept fresh (token refresh before expiration)
 * 2. Protected routes require authentication
 * 3. Auth cookies are properly synchronized
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/",
  "/grade",
  "/flashcards",
  "/documents",
  "/quiz",
  "/library",
  "/settings",
  "/profile",
];

// Routes that should redirect authenticated users
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

// Public routes that don't require auth (always accessible)
const PUBLIC_ROUTES = [
  "/auth/callback",
  "/auth/confirm",
  "/api/webhook",
  "/about",
  "/privacy",
  "/terms",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip middleware for static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/api/") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Update session and get auth state
  const { response, user } = await updateSession(request);

  const isProtected = isProtectedRoute(pathname, PROTECTED_ROUTES);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route));

  // Handle protected routes - require authentication
  if (isProtected && !user) {
    console.log(`Redirecting unauthenticated user from ${pathname} to login`);
    return redirectToLogin(request);
  }

  // Handle auth routes - redirect authenticated users away
  if (isAuthRoute && user) {
    console.log(`Redirecting authenticated user from ${pathname} to home`);
    const nextUrl = request.nextUrl.searchParams.get("next") || "/";
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }

  return response;
}

/**
 * Middleware configuration
 * 
 * The matcher determines which routes the middleware runs on.
 * We exclude static files and API routes for performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
