# Environment Setup Guide for Sandstone

## Vercel Environment Variables

You need to set these in your Vercel dashboard (Project Settings → Environment Variables):

### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
KIMI_API_KEY=your-moonshot-api-key
```

## How to Get These Values

### 1. Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Go to Project Settings → API
4. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Kimi/Moonshot API Key

1. Go to https://platform.moonshot.cn
2. Create an account
3. Generate an API key
4. Copy to `KIMI_API_KEY`

### 3. Set in Vercel

1. Go to https://vercel.com/dashboard
2. Select your sandstone project
3. Go to Settings → Environment Variables
4. Add each variable
5. Redeploy the project

## Testing Locally

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://csmroucrangjukwyeivqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
KIMI_API_KEY=sk-your-key
```

Then run:
```bash
npm run dev
```

## Troubleshooting

### "Failed to fetch" errors
- Check that environment variables are set in Vercel
- Redeploy after adding variables

### Authentication not working
- Check Supabase Auth is enabled
- Verify redirect URLs in Supabase Auth settings

### AI grading not working
- Verify KIMI_API_KEY is valid
- Check API key has available credits
