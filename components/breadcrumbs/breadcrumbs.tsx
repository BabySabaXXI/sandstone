"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Route label mapping
const routeLabels: Record<string, string> = {
  "": "Home",
  "grade": "AI Grading",
  "flashcards": "Flashcards",
  "documents": "Documents",
  "quiz": "Quiz",
  "library": "Library",
  "settings": "Settings",
  "help": "Help & Support",
  "profile": "Profile",
  "billing": "Billing",
  "notifications": "Notifications",
  "security": "Security",
  "new": "New",
  "edit": "Edit",
  "create": "Create",
};

interface BreadcrumbItem {
  href: string;
  label: string;
  isLast: boolean;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Remove query parameters and hash
  const cleanPath = pathname.split("?")[0].split("#")[0];
  
  // Split path into segments
  const segments = cleanPath.split("/").filter(Boolean);
  
  // Generate breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Check if it's a dynamic segment (starts with [ or contains UUID pattern)
    const isDynamic = segment.startsWith("[") || 
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    
    // Get label from mapping or format the segment
    let label = routeLabels[segment];
    if (!label) {
      if (isDynamic) {
        label = "Details";
      } else {
        // Capitalize and format segment
        label = segment
          .replace(/-/g, " ")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
    }

    breadcrumbs.push({
      href: currentPath,
      label,
      isLast: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on root
  if (pathname === "/") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center flex-wrap gap-1.5">
        {/* Home Link */}
        <li className="flex items-center">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors",
              pathname === "/" && "text-foreground font-medium"
            )}
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb Items */}
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
            {item.isLast ? (
              <span
                className="text-sm font-medium text-foreground"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Alternative: Structured Data Breadcrumbs for SEO
export function StructuredDataBreadcrumbs({ pathname }: { pathname: string }) {
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://sandstone.app"}/`,
      },
      ...breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://sandstone.app"}${item.href}`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
