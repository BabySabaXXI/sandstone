import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * OAuth Callback Handler
 * 
 * This route handles the callback from OAuth providers (Google, GitHub)
 * after the user has authenticated. It exchanges the authorization code
 * for a session and redirects the user to the appropriate page.
 * 
 * Flow:
 * 1. User clicks "Sign in with Google/GitHub"
 * 2. Provider redirects to /auth/callback?code=xxx
 * 3. This route exchanges code for session
 * 4. User is redirected to the app
 */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  
  // Error handling from OAuth provider
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, origin)
    );
  }

  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(
      new URL("/login?error=No+authorization+code+received", origin)
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables not configured");
    return NextResponse.redirect(
      new URL("/login?error=Server+configuration+error", origin)
    );
  }

  // Create response to handle cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Set cookie on both request and response
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
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
        });
      },
    },
  });

  try {
    // Exchange the authorization code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, origin)
      );
    }

    // Successful authentication - redirect to the requested page
    return NextResponse.redirect(new URL(next, origin));
  } catch (err) {
    console.error("Unexpected error during code exchange:", err);
    return NextResponse.redirect(
      new URL("/login?error=Authentication+failed", origin)
    );
  }
}
