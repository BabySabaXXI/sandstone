import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Update Supabase session in middleware
 * 
 * This function should be called in middleware.ts to ensure
 * the session is refreshed and cookies are properly managed.
 * 
 * It handles:
 * - Token refresh before expiration
 * - Cookie synchronization between request/response
 * - Session validation
 * 
 * @example
 * ```ts
 * // middleware.ts
 * import { updateSession } from "@/lib/supabase/middleware";
 * 
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, skip auth handling
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase not configured - auth features disabled");
    return response;
  }

  // Create Supabase client with cookie handling
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Update request cookies
        request.cookies.set({
          name,
          value,
          ...options,
        });
        
        // Create new response with updated request headers
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        
        // Update response cookies
        response.cookies.set({
          name,
          value,
          ...options,
          // Security settings
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        
        response.cookies.set({
          name,
          value: "",
          ...options,
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 0,
        });
      },
    },
  });

  // Refresh session if it exists
  // This will refresh the session if it's about to expire
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.debug("Auth user error (may be unauthenticated):", userError.message);
  }

  // Store auth state in headers for server components
  if (user) {
    response.headers.set("x-user-id", user.id);
    response.headers.set("x-user-email", user.email || "");
  }

  return { response, user, supabase };
}

/**
 * Check if a route is protected
 * 
 * @param pathname - The current route pathname
 * @param protectedRoutes - Array of protected route patterns
 */
export function isProtectedRoute(
  pathname: string,
  protectedRoutes: string[]
): boolean {
  return protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

/**
 * Create a redirect response to the login page
 * 
 * Preserves the original URL as a `next` parameter for post-login redirect
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
