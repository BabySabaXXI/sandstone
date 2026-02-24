"use client";

import React from "react";
import Script from "next/script";

interface SEOHeadProps {
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

/**
 * SEO Head Component
 * Injects structured data (JSON-LD) into the page head
 * 
 * Usage:
 * <SEOHead structuredData={organizationStructuredData} />
 * <SEOHead structuredData={[orgData, webSiteData]} />
 */
export function SEOHead({ structuredData, breadcrumbs }: SEOHeadProps) {
  const scripts: React.ReactNode[] = [];

  // Add structured data scripts
  if (structuredData) {
    const dataArray = Array.isArray(structuredData)
      ? structuredData
      : [structuredData];

    dataArray.forEach((data, index) => {
      scripts.push(
        <Script
          key={`structured-data-${index}`}
          id={`structured-data-${index}`}
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(data)}
        </Script>
      );
    });
  }

  // Add breadcrumb structured data if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://sandstone.app"}${
          item.path
        }`,
      })),
    };

    scripts.push(
      <Script
        key="breadcrumb-data"
        id="breadcrumb-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(breadcrumbData)}
      </Script>
    );
  }

  return <>{scripts}</>;
}

export default SEOHead;
