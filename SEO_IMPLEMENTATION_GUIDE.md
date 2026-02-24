# Sandstone SEO Implementation Guide

This document outlines the comprehensive SEO implementation for the Sandstone Next.js application.

## Table of Contents

1. [Overview](#overview)
2. [Implemented Features](#implemented-features)
3. [File Structure](#file-structure)
4. [Usage Guide](#usage-guide)
5. [Core Web Vitals](#core-web-vitals)
6. [Structured Data](#structured-data)
7. [Best Practices](#best-practices)
8. [Environment Variables](#environment-variables)
9. [Testing & Validation](#testing--validation)

## Overview

The Sandstone SEO implementation provides a complete solution for search engine optimization, including:

- Comprehensive metadata for all pages
- Dynamic Open Graph image generation
- Structured data (JSON-LD) for rich snippets
- Sitemap generation
- Robots.txt configuration
- Core Web Vitals monitoring
- Performance optimizations

## Implemented Features

### 1. Metadata & Open Graph

- **Title & Description**: Optimized for each page with templates
- **Open Graph**: Full OG tags for social sharing
- **Twitter Cards**: Twitter-specific meta tags
- **Canonical URLs**: Prevents duplicate content issues
- **Language & Locale**: Proper internationalization setup

### 2. Structured Data (JSON-LD)

Implemented schemas include:

- **Organization**: Company information
- **WebSite**: Site-wide search functionality
- **SoftwareApplication**: App store listing information
- **Product**: Product details for rich results
- **FAQPage**: Frequently asked questions
- **BreadcrumbList**: Navigation breadcrumbs
- **Course**: Educational course information

### 3. Sitemap

- Dynamic sitemap generation
- Image sitemap support
- Priority and change frequency settings
- Automatic updates with revalidation

### 4. Robots.txt

- Comprehensive crawler rules
- Specific rules for major search engines
- Social media crawler access
- AI crawler guidelines

### 5. Core Web Vitals

- Real-time performance monitoring
- CLS, FCP, FID, LCP, TTFB, INP tracking
- Analytics integration
- Development logging

## File Structure

```
app/
├── layout.tsx                    # Root layout with SEO metadata
├── sitemap.ts                    # Dynamic sitemap generation
├── not-found.tsx                 # 404 page with SEO
├── og/
│   └── route.tsx                 # Dynamic OG image generation
├── api/
│   └── analytics/
│       └── web-vitals/
│           └── route.ts          # Web Vitals analytics endpoint
lib/
├── seo/
│   ├── index.ts                  # SEO utilities export
│   ├── metadata.ts               # Metadata generation utilities
│   └── structured-data.tsx       # JSON-LD structured data
components/
├── seo/
│   ├── index.ts                  # SEO components export
│   └── seo-head.tsx              # SEO head component
├── performance/
│   ├── index.ts                  # Performance components export
│   ├── web-vitals.tsx            # Web Vitals monitoring
│   └── performance-provider.tsx  # Performance context provider
public/
├── manifest.json                 # PWA manifest
├── robots.txt                    # Crawler instructions
├── browserconfig.xml             # Microsoft tile configuration
└── humans.txt                    # Human-readable credits
```

## Usage Guide

### Adding Metadata to a New Page

```tsx
import { Metadata } from "next";
import { generateMetadata } from "@/lib/seo";

export const metadata: Metadata = generateMetadata({
  title: "Your Page Title",
  description: "Your page description",
  keywords: ["keyword1", "keyword2"],
  canonical: "https://sandstone.app/your-page",
});
```

### Using Predefined Metadata

```tsx
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.dashboard;
```

### Adding Structured Data

```tsx
import { JsonLdScript, organizationStructuredData } from "@/lib/seo";

export default function Page() {
  return (
    <>
      <JsonLdScript data={organizationStructuredData} />
      {/* Your page content */}
    </>
  );
}
```

### Creating Custom Structured Data

```tsx
import { createBreadcrumbStructuredData } from "@/lib/seo";

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Library", path: "/library" },
  { name: "Economics", path: "/library/economics" },
];

const breadcrumbData = createBreadcrumbStructuredData(breadcrumbs);
```

### Dynamic OG Images

```tsx
// In your metadata
openGraph: {
  images: [`/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
}
```

## Core Web Vitals

### Monitoring Setup

The Web Vitals monitor is automatically included in the layout and tracks:

- **CLS** (Cumulative Layout Shift): Visual stability
- **FCP** (First Contentful Paint): Initial load speed
- **FID** (First Input Delay): Interactivity
- **LCP** (Largest Contentful Paint): Main content load
- **TTFB** (Time to First Byte): Server response time
- **INP** (Interaction to Next Paint): New responsiveness metric

### Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| FCP | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| FID | ≤ 100ms | ≤ 300ms | > 300ms |
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| TTFB | ≤ 800ms | ≤ 1.8s | > 1.8s |
| INP | ≤ 200ms | ≤ 500ms | > 500ms |

### Analytics Integration

Configure environment variables for analytics:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
GA_API_SECRET=your_ga_secret
ANALYTICS_ENDPOINT=your_custom_endpoint
```

## Structured Data

### Available Schemas

1. **Organization**: Company details, social links
2. **WebSite**: Search functionality, site info
3. **SoftwareApplication**: App details, ratings
4. **Product**: Product information for rich results
5. **FAQPage**: Question and answer schema
6. **BreadcrumbList**: Navigation breadcrumbs
7. **Course**: Educational course information

### Usage Examples

```tsx
// Homepage - Multiple schemas
<JsonLdScript data={[
  organizationStructuredData,
  websiteStructuredData,
  softwareAppStructuredData,
]} />

// Product page
<JsonLdScript data={productStructuredData} />

// FAQ page
<JsonLdScript data={faqStructuredData} />
```

## Best Practices

### 1. Image Optimization

- Use Next.js Image component
- Provide alt text for all images
- Use appropriate image sizes
- Enable lazy loading for below-fold images

### 2. Content Optimization

- Use semantic HTML elements
- Include H1 tag on every page
- Use heading hierarchy (H1 → H2 → H3)
- Write descriptive meta descriptions

### 3. URL Structure

- Use descriptive, keyword-rich URLs
- Keep URLs short and readable
- Use hyphens to separate words
- Avoid special characters

### 4. Internal Linking

- Link to related content
- Use descriptive anchor text
- Maintain logical page hierarchy
- Update broken links regularly

### 5. Performance

- Optimize images and fonts
- Minimize JavaScript bundles
- Use code splitting
- Enable caching

## Environment Variables

Required environment variables for SEO:

```env
# Base URL
NEXT_PUBLIC_APP_URL=https://sandstone.app

# Search Console Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
NEXT_PUBLIC_YANDEX_VERIFICATION=your_yandex_code

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your_api_secret
NEXT_PUBLIC_FACEBOOK_APP_ID=your_fb_app_id

# Analytics Endpoint (optional)
ANALYTICS_ENDPOINT=https://your-analytics.com/collect
```

## Testing & Validation

### Tools for Testing

1. **Google Search Console**
   - URL Inspection Tool
   - Coverage Report
   - Core Web Vitals Report

2. **Rich Results Test**
   - https://search.google.com/test/rich-results
   - Validates structured data

3. **Schema.org Validator**
   - https://validator.schema.org/
   - Validates JSON-LD markup

4. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Performance and SEO scoring

5. **Lighthouse**
   - Built into Chrome DevTools
   - Comprehensive audit

### Validation Checklist

- [ ] All pages have unique titles
- [ ] All pages have meta descriptions
- [ ] Canonical URLs are correct
- [ ] Open Graph tags are present
- [ ] Structured data validates
- [ ] Sitemap is accessible
- [ ] Robots.txt is correct
- [ ] Images have alt text
- [ ] Internal links work
- [ ] Mobile-friendly design
- [ ] Fast loading times
- [ ] No broken links

### Local Testing

```bash
# Build the application
npm run build

# Start production server
npm start

# Run Lighthouse audit
npm run lighthouse
```

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check Search Console for errors
   - Review Core Web Vitals
   - Monitor broken links

2. **Monthly**
   - Update sitemap priorities
   - Review and update keywords
   - Check competitor rankings

3. **Quarterly**
   - Full SEO audit
   - Content refresh
   - Structured data updates

## Support

For questions or issues with the SEO implementation:

1. Check this documentation
2. Review Next.js SEO documentation
3. Consult Google Search Central
4. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
