# Sandstone i18n Implementation Guide

Complete internationalization (i18n) implementation for the Sandstone app using `next-intl`.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [File Structure](#file-structure)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Adding New Languages](#adding-new-languages)
7. [Migration Guide](#migration-guide)

## Overview

This implementation provides:

- **6 Supported Languages**: English (en), Spanish (es), French (fr), German (de), Chinese (zh), Arabic (ar)
- **Locale Routing**: Automatic locale detection and URL-based routing
- **RTL Support**: Full right-to-left text support for Arabic
- **Type-Safe Navigation**: Pathname-based routing with localized URLs
- **Language Switcher**: Multiple UI components for language selection
- **SEO Optimized**: Hreflang tags, localized metadata, and alternates

## Installation

Install the required dependencies:

```bash
npm install next-intl
# or
yarn add next-intl
# or
pnpm add next-intl
```

## File Structure

```
/mnt/okcomputer/
├── app/
│   ├── layout-i18n.tsx          # Updated root layout with i18n
│   └── [locale]/                # Locale-specific routes (optional)
├── components/
│   └── i18n/
│       ├── index.ts             # Component exports
│       ├── language-switcher.tsx # Language selector components
│       └── locale-provider.tsx   # next-intl provider wrapper
├── lib/
│   └── i18n/
│       ├── index.ts             # Main exports
│       ├── config.ts            # Locale configuration
│       ├── navigation.ts        # Navigation utilities
│       └── request.ts           # Request configuration
├── messages/
│   ├── en.json                  # English translations
│   ├── es.json                  # Spanish translations (to add)
│   ├── fr.json                  # French translations (to add)
│   ├── de.json                  # German translations (to add)
│   ├── zh.json                  # Chinese translations (to add)
│   └── ar.json                  # Arabic translations (to add)
├── middleware-i18n.ts           # Updated middleware with i18n
├── next.config.i18n.js          # Updated next.config with i18n
└── I18N_IMPLEMENTATION_GUIDE.md # This guide
```

## Configuration

### 1. Update next.config.js

Replace your existing `next.config.js` with the i18n-enabled version:

```bash
cp next.config.i18n.js next.config.js
```

**Important**: Remove the `i18n` config from `next.config.js` when using `next-intl`. The middleware handles locale routing.

### 2. Update middleware.ts

Replace your existing `middleware.ts` with the i18n-enabled version:

```bash
cp middleware-i18n.ts middleware.ts
```

### 3. Update app/layout.tsx

Replace your existing `app/layout.tsx` with the i18n-enabled version:

```bash
cp app/layout-i18n.tsx app/layout.tsx
```

### 4. Update tsconfig.json

Add the path alias for messages if not present:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/messages/*": ["./messages/*"]
    }
  }
}
```

## Usage

### Basic Translation

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('navigation');
  
  return (
    <nav>
      <a href="/">{t('home')}</a>
      <a href="/grade">{t('grade')}</a>
      <a href="/flashcards">{t('flashcards')}</a>
    </nav>
  );
}
```

### With Parameters

```tsx
import { useTranslations } from 'next-intl';

export function WelcomeMessage({ name }: { name: string }) {
  const t = useTranslations('dashboard');
  
  return <h1>{t('welcome', { name })}</h1>;
  // Output: "Welcome back, John!"
}
```

### Pluralization

```json
{
  "items": {
    "one": "{count} item",
    "other": "{count} items"
  }
}
```

```tsx
const t = useTranslations();
<p>{t('items', { count: 5 })}</p> // "5 items"
```

### Date/Time Formatting

```tsx
import { useFormatter } from 'next-intl';

export function DateDisplay({ date }: { date: Date }) {
  const format = useFormatter();
  
  return (
    <span>
      {format.dateTime(date, { dateStyle: 'medium' })}
    </span>
  );
}
```

### Number Formatting

```tsx
import { useFormatter } from 'next-intl';

export function PriceDisplay({ amount }: { amount: number }) {
  const format = useFormatter();
  
  return (
    <span>
      {format.number(amount, { style: 'currency', currency: 'GBP' })}
    </span>
  );
}
```

### Navigation with Locale

```tsx
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  
  return (
    <nav>
      {/* Automatic locale prefix */}
      <Link href="/">Home</Link>
      <Link href="/grade">Grade Essay</Link>
      
      {/* Programmatic navigation */}
      <button onClick={() => router.push('/flashcards')}>
        Flashcards
      </button>
    </nav>
  );
}
```

### Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/i18n';

export function Header() {
  return (
    <header>
      <nav>{/* ... */}</nav>
      <LanguageSwitcher />
    </header>
  );
}
```

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('home');
  
  return (
    <main>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
    </main>
  );
}
```

## Adding New Languages

### 1. Add Locale to Config

Update `lib/i18n/config.ts`:

```typescript
export const locales = ['en', 'es', 'fr', 'de', 'zh', 'ar', 'ja'] as const;

export const localeLabels: Record<Locale, string> = {
  // ... existing locales
  ja: '日本語',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  // ... existing locales
  ja: 'ltr',
};

export const localeFlags: Record<Locale, string> = {
  // ... existing locales
  ja: '🇯🇵',
};
```

### 2. Create Translation File

Create `messages/ja.json` with Japanese translations.

### 3. Add Localized Pathnames (Optional)

Update pathnames in `lib/i18n/config.ts`:

```typescript
export const pathnames = {
  '/login': {
    // ... existing locales
    ja: '/ログイン',
  },
  // ... other paths
};
```

### 4. Update Sitemap

Ensure your sitemap includes the new locale URLs.

## Migration Guide

### Step 1: Backup Existing Files

```bash
cp middleware.ts middleware.ts.backup
cp app/layout.tsx app/layout.tsx.backup
cp next.config.js next.config.js.backup
```

### Step 2: Apply i18n Files

```bash
# Copy i18n-enabled files
cp middleware-i18n.ts middleware.ts
cp app/layout-i18n.tsx app/layout.tsx
cp next.config.i18n.js next.config.js
```

### Step 3: Update Components

Replace hardcoded strings with translation keys:

**Before:**
```tsx
<button>Submit</button>
<h1>Welcome Back</h1>
```

**After:**
```tsx
const t = useTranslations();
<button>{t('common.submit')}</button>
<h1>{t('auth.login.title')}</h1>
```

### Step 4: Update Navigation

Replace Next.js `Link` with i18n `Link`:

**Before:**
```tsx
import Link from 'next/link';
```

**After:**
```tsx
import { Link } from '@/lib/i18n/navigation';
```

### Step 5: Test

1. Start the development server: `npm run dev`
2. Test locale switching: `http://localhost:3000/es`
3. Verify translations appear correctly
4. Check RTL layout for Arabic

## Translation Keys Reference

### Navigation
- `navigation.home`
- `navigation.dashboard`
- `navigation.grade`
- `navigation.flashcards`
- `navigation.quiz`
- `navigation.documents`
- `navigation.library`
- `navigation.settings`
- `navigation.login`
- `navigation.signup`

### Auth
- `auth.login.title`
- `auth.login.subtitle`
- `auth.login.emailLabel`
- `auth.login.passwordLabel`
- `auth.login.submitButton`
- `auth.signup.title`
- `auth.signup.submitButton`
- `auth.forgotPassword.title`

### Dashboard
- `dashboard.title`
- `dashboard.welcome`
- `dashboard.stats.essaysGraded`
- `dashboard.quickActions.gradeEssay`

### Grade
- `grade.title`
- `grade.form.subjectLabel`
- `grade.form.submitButton`
- `grade.results.overallScore`
- `grade.results.strengths`

### Flashcards
- `flashcards.title`
- `flashcards.actions.create`
- `flashcards.study.showAnswer`
- `flashcards.study.rate.good`

### Quiz
- `quiz.title`
- `quiz.setup.startButton`
- `quiz.results.score`
- `quiz.review.correct`

### Settings
- `settings.title`
- `settings.sections.profile`
- `settings.language.title`

### Common
- `common.loading`
- `common.saving`
- `common.success`
- `common.error`
- `common.confirm`

### Errors
- `errors.generic`
- `errors.notFound.title`
- `errors.unauthorized.title`

## Best Practices

1. **Use Namespaced Keys**: Organize translations by feature (e.g., `auth.login.title`)
2. **Keep Keys Descriptive**: Use clear, self-documenting key names
3. **Reuse Common Keys**: Use `common` namespace for shared terms
4. **Handle Pluralization**: Always include `one` and `other` forms
5. **Test RTL Layouts**: Verify Arabic and other RTL languages display correctly
6. **Use TypeScript**: Leverage type safety for translation keys

## Troubleshooting

### Locale not detected
- Check browser language settings
- Verify middleware is running
- Check cookie `NEXT_LOCALE`

### Translations not loading
- Verify JSON file exists in `messages/` directory
- Check for JSON syntax errors
- Ensure locale is in `locales` array

### Navigation issues
- Use `Link` from `@/lib/i18n/navigation`
- Check pathname configuration
- Verify locale prefix in URLs

### Build errors
- Remove `i18n` config from `next.config.js`
- Ensure all locales have translation files
- Check for circular dependencies

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
