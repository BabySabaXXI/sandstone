/**
 * i18n Middleware
 * 
 * Combines next-intl locale routing with existing authentication middleware.
 * This handles locale detection, routing, and auth protection.
 */

import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale, localeDirections } from '@/lib/i18n/config';

// Define route configurations
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
const PROTECTED_ROUTES = [
  '/',
  '/grade',
  '/flashcards',
  '/documents',
  '/quiz',
  '/library',
  '/settings',
  '/dashboard',
];
const STATIC_ASSETS = [
  '/_next',
  '/static',
  '/favicon',
  '/manifest',
  '/robots.txt',
  '/sitemap.xml',
  '/api',
];

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true,
});

/**
 * Main middleware function combining i18n and auth
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    STATIC_ASSETS.some((path) => pathname.startsWith(path)) ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|json)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Handle i18n routing first
  const intlResponse = intlMiddleware(request);

  // Extract locale from the response URL
  const locale = intlResponse.headers.get('x-next-intl-locale') || defaultLocale;
  const direction = localeDirections[locale as keyof typeof localeDirections] || 'ltr';

  // Add locale and direction headers
  intlResponse.headers.set('x-locale', locale);
  intlResponse.headers.set('x-direction', direction);

  // Get the pathname without locale prefix for auth checks
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '') || '/';

  // Check if this is a public or protected route
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  // Skip auth check for public routes that aren't also protected
  if (!isProtectedRoute && !isPublicRoute) {
    return intlResponse;
  }

  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, allow all requests (development mode)
  if (!supabaseUrl || !supabaseKey) {
    return intlResponse;
  }

  // Create response that we'll modify
  let response = intlResponse;

  // Create Supabase client with cookie handling
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Auth error in middleware:', authError);
  }

  const isAuthenticated = !!user;

  // Build locale-prefixed paths
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`;

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if accessing protected route without auth
    const loginUrl = new URL(`${localePrefix}/login`, request.url);
    loginUrl.searchParams.set('redirectTo', pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && isAuthenticated && pathnameWithoutLocale !== '/logout') {
    // Redirect to home if accessing public route while authenticated
    return NextResponse.redirect(new URL(`${localePrefix}/`, request.url));
  }

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
