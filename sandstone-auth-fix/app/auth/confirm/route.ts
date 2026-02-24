import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Email Confirmation Handler
 * 
 * This route handles email confirmation links sent to users
 * after they sign up with email/password.
 * 
 * Flow:
 * 1. User signs up with email
 * 2. Supabase sends confirmation email with link
 * 3. User clicks link: /auth/confirm?token_hash=xxx&type=signup
 * 4. This route verifies the token and activates the account
 */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "recovery" | "invite" | "email_change" | null;
  const next = searchParams.get("next") ?? "/";

  if (!token_hash || !type) {
    console.error("Missing token_hash or type in confirmation link");
    return NextResponse.redirect(
      new URL("/login?error=Invalid+confirmation+link", origin)
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
    // Verify the OTP token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (verifyError) {
      console.error("Token verification error:", verifyError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(verifyError.message)}`, origin)
      );
    }

    // Successful verification - redirect based on type
    let redirectUrl = next;
    let message = "";

    switch (type) {
      case "signup":
        message = "Email+confirmed+successfully";
        break;
      case "recovery":
        redirectUrl = "/reset-password";
        message = "Email+verified";
        break;
      case "email_change":
        message = "Email+updated+successfully";
        break;
      case "invite":
        message = "Invitation+accepted";
        break;
    }

    return NextResponse.redirect(
      new URL(`${redirectUrl}?message=${message}`, origin)
    );
  } catch (err) {
    console.error("Unexpected error during token verification:", err);
    return NextResponse.redirect(
      new URL("/login?error=Verification+failed", origin)
    );
  }
}
