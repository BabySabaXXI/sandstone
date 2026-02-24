# Sandstone Authentication System - Fixed

This directory contains the complete fixed authentication system for the Sandstone app.

## Issues Fixed

### 1. **CRITICAL: Missing OAuth Callback Route** ✅
- **Problem**: OAuth sign-in with Google/GitHub was failing because the callback route `/auth/callback` didn't exist
- **Solution**: Created `app/auth/callback/route.ts` that handles the OAuth code exchange

### 2. **Missing Email Confirmation Handler** ✅
- **Problem**: Email confirmation links weren't being handled
- **Solution**: Created `app/auth/confirm/route.ts` for email verification, password recovery, etc.

### 3. **Outdated Supabase Client Pattern** ✅
- **Problem**: Using deprecated `@supabase/auth-helpers-nextjs` alongside `@supabase/ssr`
- **Solution**: Updated all Supabase clients to use the modern `@supabase/ssr` pattern consistently

### 4. **Middleware Session Handling** ✅
- **Problem**: Cookie handling in middleware could cause session persistence issues
- **Solution**: Created dedicated `lib/supabase/middleware.ts` with proper cookie synchronization

### 5. **Missing Token Refresh** ✅
- **Problem**: Sessions would expire without refreshing
- **Solution**: Added automatic token refresh in auth provider and middleware

### 6. **No Password Reset Flow** ✅
- **Problem**: Users couldn't reset their passwords
- **Solution**: Created `forgot-password` and `reset-password` pages with full flow

### 7. **Poor Error Handling** ✅
- **Problem**: Auth errors weren't user-friendly
- **Solution**: Added comprehensive error mapping and user feedback

## Files Changed/Created

### New Files
```
app/
├── auth/
│   ├── callback/route.ts      # OAuth callback handler
│   └── confirm/route.ts       # Email confirmation handler
├── forgot-password/
│   └── page.tsx               # Password reset request page
└── reset-password/
    └── page.tsx               # New password entry page

lib/
└── supabase/
    └── middleware.ts          # Dedicated middleware client
```

### Modified Files
```
lib/
├── supabase/
│   ├── client.ts              # Updated browser client
│   └── server.ts              # Updated server client
└── middleware.ts              # Improved session handling

components/
└── auth-provider.tsx          # Enhanced with refresh & error handling
```

## Setup Instructions

### 1. Copy Files

Copy all files from this directory to your project:

```bash
# From the sandstone-auth-fix directory
cp -r app/auth ../sandstone/app/
cp -r app/forgot-password ../sandstone/app/
cp -r app/reset-password ../sandstone/app/
cp -r lib/supabase/* ../sandstone/lib/supabase/
cp middleware.ts ../sandstone/
cp components/auth-provider.tsx ../sandstone/components/
```

### 2. Environment Variables

Ensure your `.env.local` file has these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: For admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase Configuration

#### Enable OAuth Providers

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google** and **GitHub** providers
3. Add your OAuth credentials (Client ID and Secret)

#### Configure Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add these redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

#### Site URL

Set your Site URL to:
- `http://localhost:3000` (development)
- `https://yourdomain.com` (production)

### 4. Update package.json (if needed)

Ensure you have the correct dependencies:

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.97.0"
  }
}
```

Remove the deprecated package:
```bash
npm uninstall @supabase/auth-helpers-nextjs
```

### 5. Test the Flow

1. **Email/Password Sign Up**
   - Go to `/login`
   - Click "Create Account"
   - Enter email and password
   - Check email for confirmation link
   - Click link to confirm

2. **OAuth Sign In**
   - Go to `/login`
   - Click "Google" or "GitHub"
   - Complete OAuth flow
   - Should redirect to home page

3. **Password Reset**
   - Go to `/login`
   - Click "Forgot password?"
   - Enter email
   - Check email for reset link
   - Set new password

## Auth Flow Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   /login    │────▶│   OAuth      │────▶│  Provider   │
│   Page      │     │   Button     │     │  (Google)   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Home      │◀────│   /auth/     │◀────│  Redirect   │
│   Page      │     │   callback   │     │  with code  │
└─────────────┘     └──────────────┘     └─────────────┘

Email Flow:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Sign Up   │────▶│   Supabase   │────▶│   Email     │
│   Submit    │     │   Create     │     │   Sent      │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Home      │◀────│   /auth/     │◀────│  User       │
│   Page      │     │   confirm    │     │  Clicks     │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Security Features

1. **PKCE Flow**: OAuth uses PKCE for enhanced security
2. **HttpOnly Cookies**: Session cookies are httpOnly
3. **Secure Cookies**: Cookies use `secure` flag in production
4. **SameSite Protection**: Cookies use `sameSite: 'lax'`
5. **Token Refresh**: Automatic token refresh before expiration
6. **Session Validation**: Server-side session validation on every request

## Troubleshooting

### OAuth Not Working

1. Check redirect URLs in Supabase Dashboard
2. Verify OAuth provider credentials
3. Check browser console for errors
4. Ensure `auth/callback` route exists

### Session Not Persisting

1. Check cookie settings in browser
2. Verify environment variables are set
3. Check for cookie blocking extensions
4. Ensure middleware is running

### Email Confirmation Not Working

1. Check spam/junk folders
2. Verify Site URL in Supabase
3. Check email provider settings
4. Ensure `auth/confirm` route exists

## API Reference

### useAuth Hook

```typescript
const {
  user,              // Current user or null
  loading,           // Auth state loading
  error,             // Auth error message
  isConfigured,      // Supabase configured status
  signIn,            // (email, password) => Promise<void>
  signUp,            // (email, password, fullName?) => Promise<void>
  signOut,           // () => Promise<void>
  signInWithProvider,// (provider) => Promise<void>
  signInWithPhone,   // (phone) => Promise<void>
  verifyPhoneOtp,    // (phone, token) => Promise<void>
  resetPassword,     // (email) => Promise<void>
  updatePassword,    // (newPassword) => Promise<void>
  refreshSession,    // () => Promise<void>
  clearError,        // () => void
} = useAuth();
```

### Server-Side Auth

```typescript
import { getUser, getSession, requireAuth } from "@/lib/supabase/server";

// In a Server Component
const user = await getUser();
const session = await getSession();

// In a Server Action
const user = await requireAuth(); // Throws if not authenticated
```

## Credits

This authentication system uses:
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side)
