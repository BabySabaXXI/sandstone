/**
 * Optimized Library Page with SSR
 * 
 * Features:
 * - Server-side data fetching with caching
 * - Streaming with Suspense boundaries
 * - Parallel data loading
 * - Optimized hydration
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getLibraryResources } from "@/lib/ssr/data-fetching";
import { routeConfig } from "@/lib/ssr/cache";
import { LibrarySkeleton } from "@/components/ssr/streaming-boundary";
import { LibraryHeader } from "@/components/library/library-header";
import { ResourcesGrid } from "@/components/library/resources-grid";

// Export route configuration for caching
export const revalidate = routeConfig.library.revalidate;
export const dynamic = routeConfig.library.dynamic;

// Page metadata
export const metadata: Metadata = {
  title: "Library",
  description: "Browse curated study resources and materials.",
};

// ============================================================================
// Main Page Component (Server Component)
// ============================================================================

export default async function LibraryPage({
  searchParams,
}: {
  searchParams?: { subject?: string };
}) {
  // Check authentication
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login?redirectTo=/library");
  }
  
  const subject = searchParams?.subject;
  
  return (
    <div className="space-y-6">
      {/* Header - Static content */}
      <LibraryHeader />
      
      {/* Resources Grid - With streaming */}
      <Suspense fallback={<LibrarySkeleton />}>
        <ResourcesContent subject={subject} />
      </Suspense>
    </div>
  );
}

// ============================================================================
// Resources Content (Server Component)
// ============================================================================

async function ResourcesContent({ subject }: { subject?: string }) {
  const resources = await getLibraryResources(subject, 24);
  
  return <ResourcesGrid resources={resources} />;
}
