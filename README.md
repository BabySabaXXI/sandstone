# Sandstone - AI-Powered Learning Platform

A production-ready AI learning platform for A-Level Economics with Edexcel IAL training data integration.

## Features

- **AI Response Grading** - 4 specialized examiners (AO1-AO4) based on official Edexcel mark schemes
- **Complete Auth System** - Email, Phone OTP, Google OAuth, GitHub OAuth
- **Subject Isolation** - Separate data per subject (Economics, Geography)
- **Dark Mode** - Full dark mode support
- **Flashcards & Quizzes** - Study tools with spaced repetition
- **Document Management** - Organize study notes
- **AI Chat** - Subject-specific AI tutor

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run dev server
npm run dev
```

Open http://localhost:3000

## Production Setup

### 1. Supabase Setup

1. Create project at https://supabase.com
2. Go to SQL Editor
3. Run the schema from `lib/supabase/schema.sql`
4. Go to Project Settings → API
5. Copy URL and anon key

### 2. Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `KIMI_API_KEY` (get from https://platform.moonshot.cn)
4. Deploy

### 3. Configure Auth Providers (Optional)

In Supabase Dashboard → Authentication → Providers:
- Enable Google
- Enable GitHub
- Add redirect URL: `https://yourdomain.com/auth/callback`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
KIMI_API_KEY=your-moonshot-api-key
```

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Moonshot AI (Kimi)
- **Styling**: Tailwind CSS + CSS Variables
- **State**: Zustand

## Economics AI System

The grading system uses 4 AI examiners based on Edexcel Assessment Objectives:

1. **AO1 - Knowledge & Understanding** (25%)
   - Accurate definitions
   - Correct terminology
   - Theory understanding

2. **AO2 - Application** (25%)
   - Real-world examples
   - Context usage
   - Case studies

3. **AO3 - Analysis** (25%)
   - Chains of reasoning
   - Diagrams
   - Logical development

4. **AO4 - Evaluation** (25%)
   - Balanced arguments
   - Critical assessment
   - Judgment

### Supported Question Types

- 4-mark (Knowledge + Application)
- 6-mark (Knowledge + Application)
- 8-mark (Analysis)
- 10-mark (Analysis + Evaluation)
- 12-mark (Extended Analysis)
- 14-mark (Essay with Evaluation)
- 16-mark (Extended Essay)
- 20-mark (Full Essay with Context)

### Units

- **WEC11**: Markets in Action (Microeconomics)
- **WEC12**: Macroeconomic Performance
- **WEC13**: Business Behaviour
- **WEC14**: Developments in the Global Economy

## License

MIT
