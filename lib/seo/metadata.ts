import { Metadata } from "next";

// Base URL for the application
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sandstone.app";

// Default Open Graph image configuration
const defaultOpenGraphImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Sandstone - AI-Powered Learning",
};

// Default Twitter image
const defaultTwitterImage = "/og-image.png";

// Common keywords for all pages
const commonKeywords = [
  "A-Level",
  "Edexcel",
  "AI tutoring",
  "exam preparation",
  "study app",
  "online learning",
  "UK education",
];

// Interface for page metadata configuration
interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
  canonical?: string;
  alternates?: Record<string, string>;
}

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata(config: PageMetadataConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    ogImage,
    ogTitle,
    ogDescription,
    noIndex = false,
    canonical,
    alternates,
  } = config;

  const fullTitle = title.includes("Sandstone")
    ? title
    : `${title} | Sandstone`;

  return {
    title: fullTitle,
    description,
    keywords: [...commonKeywords, ...keywords],
    authors: [{ name: "Sandstone Team" }],
    creator: "Sandstone",
    publisher: "Sandstone",
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: canonical || BASE_URL,
      siteName: "Sandstone",
      title: ogTitle || fullTitle,
      description: ogDescription || description,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: ogTitle || fullTitle,
            },
          ]
        : [defaultOpenGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle || fullTitle,
      description: ogDescription || description,
      images: ogImage ? [ogImage] : [defaultTwitterImage],
      creator: "@sandstone",
      site: "@sandstone",
    },
    alternates: {
      canonical: canonical || BASE_URL,
      ...alternates,
    },
    category: "education",
    classification: "Education Technology",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
    metadataBase: new URL(BASE_URL),
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    other: {
      "apple-itunes-app": "app-id= sandstonelearning",
      "fb:app_id": process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
    },
  };
}

// Predefined metadata for common pages
export const pageMetadata = {
  // Marketing pages
  home: generateMetadata({
    title: "Sandstone - AI-Powered A-Level Learning",
    description:
      "Master Economics and Geography with AI-powered tutoring, instant essay grading, and personalized study tools. Get detailed examiner feedback based on Edexcel mark schemes.",
    keywords: [
      "Economics",
      "Geography",
      "essay grading",
      "AI examiner",
      "personalized learning",
    ],
    canonical: BASE_URL,
  }),

  features: generateMetadata({
    title: "Features - AI Learning Tools",
    description:
      "Discover Sandstone's powerful AI features: instant essay grading, smart flashcards, interactive quizzes, and personalized study plans for A-Level success.",
    keywords: [
      "features",
      "AI tools",
      "flashcards",
      "quizzes",
      "study planner",
    ],
    canonical: `${BASE_URL}/features`,
  }),

  about: generateMetadata({
    title: "About - Our Mission",
    description:
      "Learn about Sandstone's mission to transform A-Level education with AI-powered learning tools and personalized tutoring.",
    keywords: ["about", "mission", "team", "education technology"],
    canonical: `${BASE_URL}/about`,
  }),

  pricing: generateMetadata({
    title: "Pricing - Plans & Subscriptions",
    description:
      "Choose the perfect plan for your A-Level journey. Free tier available. Premium plans with unlimited essay grading and advanced features.",
    keywords: ["pricing", "plans", "subscription", "free trial", "premium"],
    canonical: `${BASE_URL}/pricing`,
  }),

  // App pages
  dashboard: generateMetadata({
    title: "Dashboard - Your Learning Hub",
    description:
      "Access your personalized learning dashboard. Track progress, view recent essays, and continue your A-Level studies.",
    keywords: ["dashboard", "progress tracking", "analytics"],
    canonical: `${BASE_URL}/dashboard`,
  }),

  grade: generateMetadata({
    title: "AI Response Grading - Instant Feedback",
    description:
      "Submit your A-Level responses for instant AI grading. Get detailed feedback based on official Edexcel mark schemes with specific improvement suggestions.",
    keywords: [
      "essay grading",
      "AI examiner",
      "feedback",
      "mark schemes",
      "response analysis",
    ],
    canonical: `${BASE_URL}/grade`,
  }),

  flashcards: generateMetadata({
    title: "Flashcards - Smart Study Cards",
    description:
      "Study efficiently with AI-generated flashcards. Spaced repetition algorithm helps you memorize key concepts for Economics and Geography.",
    keywords: ["flashcards", "spaced repetition", "memorization", "study cards"],
    canonical: `${BASE_URL}/flashcards`,
  }),

  library: generateMetadata({
    title: "Library - Study Resources",
    description:
      "Browse our comprehensive library of A-Level study materials, past papers, revision guides, and curated resources for Economics and Geography.",
    keywords: [
      "library",
      "study materials",
      "past papers",
      "revision guides",
      "resources",
    ],
    canonical: `${BASE_URL}/library`,
  }),

  documents: generateMetadata({
    title: "Documents - Your Study Materials",
    description:
      "Manage your study documents, notes, and uploaded materials. Organize your A-Level revision resources in one place.",
    keywords: ["documents", "notes", "study materials", "file management"],
    canonical: `${BASE_URL}/documents`,
  }),

  quiz: generateMetadata({
    title: "Quiz - Test Your Knowledge",
    description:
      "Take AI-generated quizzes tailored to your learning progress. Test your understanding of Economics and Geography topics.",
    keywords: ["quiz", "test", "knowledge check", "practice questions"],
    canonical: `${BASE_URL}/quiz`,
  }),

  settings: generateMetadata({
    title: "Settings - Account Preferences",
    description:
      "Manage your Sandstone account settings, preferences, and notification options.",
    keywords: ["settings", "preferences", "account", "profile"],
    canonical: `${BASE_URL}/settings`,
  }),

  // Auth pages (noindex)
  login: generateMetadata({
    title: "Sign In - Access Your Account",
    description:
      "Sign in to your Sandstone account to access AI-powered learning tools and continue your A-Level studies.",
    keywords: ["login", "sign in", "account access"],
    noIndex: true,
  }),

  signup: generateMetadata({
    title: "Sign Up - Start Learning",
    description:
      "Create your free Sandstone account and start your AI-powered A-Level learning journey today.",
    keywords: ["signup", "register", "create account", "free trial"],
    noIndex: true,
  }),

  forgotPassword: generateMetadata({
    title: "Forgot Password - Reset Access",
    description: "Reset your Sandstone account password to regain access.",
    noIndex: true,
  }),

  // Legal pages
  privacy: generateMetadata({
    title: "Privacy Policy - Data Protection",
    description:
      "Learn how Sandstone protects your personal data and privacy. Our commitment to data security and transparency.",
    keywords: ["privacy policy", "data protection", "GDPR"],
    canonical: `${BASE_URL}/privacy`,
  }),

  terms: generateMetadata({
    title: "Terms of Service - User Agreement",
    description:
      "Read Sandstone's terms of service. Understand your rights and responsibilities when using our platform.",
    keywords: ["terms of service", "user agreement", "legal"],
    canonical: `${BASE_URL}/terms`,
  }),

  cookies: generateMetadata({
    title: "Cookie Policy - Cookie Usage",
    description:
      "Learn about how Sandstone uses cookies to improve your experience on our platform.",
    keywords: ["cookie policy", "cookies", "tracking"],
    canonical: `${BASE_URL}/cookies`,
  }),

  // Error pages
  notFound: generateMetadata({
    title: "Page Not Found - 404 Error",
    description:
      "The page you're looking for doesn't exist. Return to Sandstone's homepage to continue your learning journey.",
    noIndex: true,
  }),
};

// Helper function to generate metadata for dynamic pages
export function generateDynamicMetadata(
  title: string,
  description: string,
  options?: Partial<PageMetadataConfig>
): Metadata {
  return generateMetadata({
    title,
    description,
    ...options,
  });
}

// Export default metadata utilities
export default {
  generateMetadata,
  pageMetadata,
  generateDynamicMetadata,
  BASE_URL,
  commonKeywords,
};
