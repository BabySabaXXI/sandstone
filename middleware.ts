import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Define route configurations
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const PROTECTED_ROUTES = [
  "/",
  "/grade",
  "/flashcards",
  "/documents",
  "/quiz",
  "/library",
  "/settings",
  "/api",
];
const STATIC_ASSETS = [
  "/_next",
  "/static",
  "/favicon",
  "/manifest",
  "/robots.txt",
  "/sitemap.xml",
];

/**
 * Middleware function for authentication and route protection.
 * Runs on every request to handle auth state and redirects.
 */
export async function middleware(request: NextRequest) {
  // Create initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;

  // Skip middleware for static assets
  if (STATIC_ASSETS.some((path) => pathname.startsWith(path))) {
    return response;
  }

  // Skip middleware for public files
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$/.test(pathname)) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, allow all requests (development mode)
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase not configured, skipping auth check");
    return response;
  }

  // Create Supabase client with cookie handling
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Set cookie on both request and response
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        // Remove cookie from both request and response
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Handle auth errors
  if (authError) {
    console.error("Auth error in middleware:", authError);
  }

  const isAuthenticated = !!user;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if accessing protected route without auth
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && isAuthenticated) {
    // Redirect to home if accessing public route while authenticated
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Add security headers to all responses
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
