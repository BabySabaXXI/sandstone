# Sandstone App - Supabase Environment Setup Guide

Complete guide for configuring Supabase environment for the Sandstone AI Essay Grading application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Files](#environment-files)
3. [Supabase Configuration](#supabase-configuration)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Copy Environment Files

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

---

## Environment Files

### File Structure

```
sandstone/
├── .env                    # Default environment (DO NOT USE)
├── .env.example            # Template (committed to git)
├── .env.local              # Local development (NOT committed)
├── .env.production         # Production template (committed)
├── .env.production.local   # Production secrets (NOT committed)
└── supabase/
    └── config.toml         # Supabase CLI configuration
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for client | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (server-only) | ✅ For admin ops |
| `KIMI_API_KEY` | Moonshot AI API key | ✅ For AI grading |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` |
| `DATABASE_POOL_SIZE` | Connection pool size | `10` |
| `LOG_LEVEL` | Logging level | `debug` (dev), `warn` (prod) |

---

## Supabase Configuration

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter project name: `sandstone`
4. Choose region closest to your users
5. Save the database password securely

### 2. Get API Credentials

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy the following values:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - **Email**: Enable "Confirm email" for production
   - **GitHub**: Add Client ID and Secret
   - **Google**: Add Client ID and Secret

### 4. Set Up Database

Run the schema migrations:

```bash
# Using Supabase CLI
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

Or execute SQL directly in the SQL Editor:

```sql
-- Run the contents of lib/supabase/schema.sql
```

---

## Local Development

### Option 1: Connect to Remote Supabase (Recommended)

Use your existing Supabase project for local development:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
KIMI_API_KEY=your-kimi-key
```

### Option 2: Local Supabase Stack

Run Supabase locally with Docker:

```bash
# Start local Supabase
docker-compose up -d

# Wait for services to start
sleep 10

# Run migrations
supabase db reset

# Your local Supabase is now available at:
# - Studio: http://localhost:54326
# - API: http://localhost:54321
# - Auth: http://localhost:9999
```

Update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Local Development URLs

| Service | URL |
|---------|-----|
| Next.js App | http://localhost:3000 |
| Supabase Studio | http://localhost:54326 |
| Supabase API | http://localhost:54321 |
| Inbucket (Email) | http://localhost:54327 |

---

## Production Deployment

### Vercel Deployment

#### 1. Connect Repository

1. Go to [https://vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select framework preset: **Next.js**

#### 2. Configure Environment Variables

In Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
KIMI_API_KEY=your-kimi-key
NEXTAUTH_SECRET=your-nextauth-secret
```

#### 3. Deploy

```bash
# Deploy using Vercel CLI
vercel --prod
```

Or push to main branch for automatic deployment.

### Security Checklist

- [ ] Rotate API keys before production
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Configure CORS in Supabase settings
- [ ] Set up rate limiting
- [ ] Enable email confirmations
- [ ] Configure OAuth redirect URLs
- [ ] Set up monitoring (Sentry, etc.)

---

## Troubleshooting

### Common Issues

#### "Supabase URL is required"

**Cause**: Environment variables not loaded

**Solution**:
```bash
# Ensure .env.local exists and is properly formatted
cat .env.local | grep SUPABASE

# Restart dev server
npm run dev
```

#### "Invalid API key"

**Cause**: Wrong key format or expired key

**Solution**:
1. Verify key in Supabase dashboard
2. Check for extra spaces in .env.local
3. Regenerate keys if needed

#### "Connection refused" (Local)

**Cause**: Supabase services not running

**Solution**:
```bash
# Check container status
docker-compose ps

# Restart services
docker-compose down
docker-compose up -d
```

#### "Row Level Security violation"

**Cause**: RLS enabled but no policies defined

**Solution**:
```sql
-- Example: Allow users to read their own data
CREATE POLICY "Users can read own data"
ON public.users FOR SELECT
USING (auth.uid() = id);
```

### Debug Mode

Enable debug logging:

```bash
# .env.local
DEBUG=sandstone:*
LOG_LEVEL=debug
```

### Health Check

Test Supabase connection:

```typescript
import { checkDatabaseHealth } from "@/lib/supabase/server";

const health = await checkDatabaseHealth();
console.log(health);
// { healthy: true, latency: 45 }
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Sandstone GitHub](https://github.com/BabySabaXXI/sandstone)

---

## Support

For issues and questions:
- GitHub Issues: [https://github.com/BabySabaXXI/sandstone/issues](https://github.com/BabySabaXXI/sandstone/issues)
- Email: support@sandstone.app
