"use client";

import React from "react";

// Base URL for the application
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sandstone.app";

// Organization structured data
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sandstone",
  alternateName: "Sandstone Learning",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/icons/icon-512x512.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    "https://twitter.com/sandstone",
    "https://linkedin.com/company/sandstone",
  ],
  description:
    "AI-powered A-Level learning platform with personalized tutoring and instant essay feedback.",
  foundingDate: "2024",
  areaServed: "United Kingdom",
  knowsAbout: [
    "A-Level Education",
    "Economics",
    "Geography",
    "AI Tutoring",
    "Exam Preparation",
  ],
};

// WebSite structured data
export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sandstone - AI-Powered Learning",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/library?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  description:
    "AI-powered A-Level response grading with detailed examiner feedback for Economics and Geography.",
  inLanguage: "en-GB",
};

// Educational Application structured data
export const educationalAppStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sandstone",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "5000",
  },
  featureList: [
    "AI Essay Grading",
    "Smart Flashcards",
    "Interactive Quizzes",
    "Study Library",
    "Progress Tracking",
  ],
};

// Software Application structured data
export const softwareAppStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Sandstone",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  softwareVersion: "1.0.0",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "Free tier available with premium plans",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "5000",
    bestRating: "5",
    worstRating: "1",
  },
  review: [
    {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: "A-Level Student",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
      },
      reviewBody:
        "The AI feedback on my Economics essays has been incredibly helpful for improving my exam technique.",
    },
  ],
  featureList: [
    "AI-powered essay grading based on Edexcel mark schemes",
    "Smart flashcards with spaced repetition",
    "Interactive quizzes tailored to your progress",
    "Comprehensive study library",
    "Detailed progress analytics",
  ],
};

// Product structured data for the platform
export const productStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Sandstone AI Learning Platform",
  image: [`${BASE_URL}/og-image.png`],
  description:
    "AI-powered A-Level learning platform with personalized tutoring, instant essay feedback, and comprehensive study tools.",
  brand: {
    "@type": "Brand",
    name: "Sandstone",
  },
  offers: {
    "@type": "Offer",
    url: `${BASE_URL}/pricing`,
    price: "0",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    validFrom: "2024-01-01",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "5000",
  },
};

// FAQ Page structured data
export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What subjects does Sandstone support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sandstone currently supports A-Level Economics and Geography, aligned with the Edexcel curriculum. We provide AI-powered tutoring, essay grading, and study materials specifically designed for these subjects.",
      },
    },
    {
      "@type": "Question",
      name: "How does the AI essay grading work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our AI analyzes your essays based on official Edexcel mark schemes, providing detailed feedback on structure, content, analysis, and evaluation. You'll receive specific suggestions for improvement and an estimated grade.",
      },
    },
    {
      "@type": "Question",
      name: "Is Sandstone free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sandstone offers a free tier with basic features. Premium plans are available for unlimited essay grading, advanced analytics, and additional study materials.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use Sandstone on my mobile device?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Sandstone is fully responsive and works on all devices including smartphones, tablets, and desktop computers. You can also install it as a Progressive Web App (PWA) for offline access.",
      },
    },
  ],
};

// Course structured data for subjects
export const createCourseStructuredData = (
  name: string,
  description: string,
  subject: string
) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name,
  description,
  provider: {
    "@type": "Organization",
    name: "Sandstone",
    sameAs: BASE_URL,
  },
  subject,
  educationalLevel: "A-Level",
  inLanguage: "en-GB",
  availableLanguage: ["en-GB"],
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: "PT10H",
    duration: "P1Y",
  },
});

// BreadcrumbList structured data
export const createBreadcrumbStructuredData = (
  items: Array<{ name: string; path: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${BASE_URL}${item.path}`,
  })),
});

// Article structured data for blog/content pages
export const createArticleStructuredData = (
  title: string,
  description: string,
  publishedAt: string,
  modifiedAt: string,
  authorName: string,
  imageUrl: string
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  image: imageUrl,
  author: {
    "@type": "Person",
    name: authorName,
  },
  publisher: {
    "@type": "Organization",
    name: "Sandstone",
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/icons/icon-512x512.png`,
    },
  },
  datePublished: publishedAt,
  dateModified: modifiedAt,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": BASE_URL,
  },
});

// HowTo structured data for guides/tutorials
export const createHowToStructuredData = (
  title: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>,
  totalTime?: string
) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: title,
  description,
  totalTime,
  step: steps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.name,
    text: step.text,
    ...(step.image && { image: step.image }),
  })),
});

// LocalBusiness structured data (if applicable)
export const localBusinessStructuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Sandstone Learning",
  url: BASE_URL,
  logo: `${BASE_URL}/icons/icon-512x512.png`,
  description:
    "AI-powered online learning platform for A-Level students in the UK.",
  areaServed: {
    "@type": "Country",
    name: "United Kingdom",
  },
  knowsAbout: ["A-Level Economics", "A-Level Geography", "Online Education"],
};

// Interface for JSON-LD Script component props
interface JsonLdScriptProps {
  data: Record<string, unknown>;
}

// JSON-LD Script component for injecting structured data
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Combined structured data for homepage
export const homepageStructuredData = [
  organizationStructuredData,
  websiteStructuredData,
  educationalAppStructuredData,
  softwareAppStructuredData,
  productStructuredData,
];

// Export all structured data for easy access
export const allStructuredData = {
  organization: organizationStructuredData,
  website: websiteStructuredData,
  educationalApp: educationalAppStructuredData,
  softwareApp: softwareAppStructuredData,
  product: productStructuredData,
  faq: faqStructuredData,
  localBusiness: localBusinessStructuredData,
};

export default allStructuredData;
