import { MetadataRoute } from "next";

/**
 * Dynamic sitemap generation for Sandstone.
 * This file automatically generates a sitemap.xml for search engines.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sandstone.app";

// Page routes with their SEO configurations
const pageRoutes = [
  // Homepage
  {
    path: "/",
    priority: 1.0,
    changeFrequency: "daily" as const,
  },
  // Marketing pages
  {
    path: "/features",
    priority: 0.9,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/about",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/pricing",
    priority: 0.9,
    changeFrequency: "weekly" as const,
  },
  // Core app features
  {
    path: "/grade",
    priority: 0.95,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/flashcards",
    priority: 0.85,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/documents",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/library",
    priority: 0.85,
    changeFrequency: "daily" as const,
  },
  {
    path: "/quiz",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/dashboard",
    priority: 0.9,
    changeFrequency: "daily" as const,
  },
  // Settings (lower priority)
  {
    path: "/settings",
    priority: 0.5,
    changeFrequency: "monthly" as const,
  },
  // Legal pages
  {
    path: "/privacy",
    priority: 0.4,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/terms",
    priority: 0.4,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/cookies",
    priority: 0.3,
    changeFrequency: "monthly" as const,
  },
];

// Image sitemap entries for rich results
const imageEntries = [
  {
    loc: `${BASE_URL}/og-image.png`,
    title: "Sandstone - AI-Powered Learning Platform",
    caption: "AI-powered A-Level learning with instant essay grading",
  },
  {
    loc: `${BASE_URL}/screenshots/desktop.png`,
    title: "Sandstone Dashboard",
    caption: "Personalized learning dashboard with progress tracking",
  },
  {
    loc: `${BASE_URL}/screenshots/mobile.png`,
    title: "Sandstone Mobile View",
    caption: "Mobile-friendly learning on the go",
  },
];

// Video sitemap entries (if applicable)
const videoEntries: Array<{
  loc: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
}> = [
  // Add video entries here when videos are available
  // {
  //   loc: `${BASE_URL}/videos/tutorial.mp4`,
  //   title: "How to Use Sandstone",
  //   description: "Learn how to get the most out of Sandstone's AI features",
  //   thumbnail: `${BASE_URL}/videos/tutorial-thumb.jpg`,
  //   duration: 180,
  // },
];

/**
 * Generate the sitemap for search engines
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Generate main page routes
  const routes: MetadataRoute.Sitemap = pageRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    // Add alternates for language versions
    alternates: {
      languages: {
        "en-GB": `${BASE_URL}${route.path}`,
        en: `${BASE_URL}${route.path}`,
      },
    },
  }));

  return routes;
}

/**
 * Generate image sitemap for rich search results
 * This can be used separately if needed
 */
export function generateImageSitemap() {
  return imageEntries.map((image) => ({
    loc: image.loc,
    title: image.title,
    caption: image.caption,
  }));
}

/**
 * Generate video sitemap for video content
 */
export function generateVideoSitemap() {
  return videoEntries.map((video) => ({
    loc: video.loc,
    title: video.title,
    description: video.description,
    thumbnail_loc: video.thumbnail,
    duration: video.duration,
  }));
}

// Revalidate sitemap every hour
export const revalidate = 3600;

// Generate sitemap index if multiple sitemaps are needed
export function generateSitemapIndex(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${BASE_URL}/sitemap.xml`,
      lastModified,
    },
    {
      url: `${BASE_URL}/sitemap-images.xml`,
      lastModified,
    },
  ];
}
