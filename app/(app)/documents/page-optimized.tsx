/**
 * Optimized Documents Page with SSR
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
import { getCurrentUser, getUserDocuments } from "@/lib/ssr/data-fetching";
import { routeConfig } from "@/lib/ssr/cache";
import { DocumentsSkeleton } from "@/components/ssr/streaming-boundary";
import { DocumentsHeader } from "@/components/documents/documents-header";
import { DocumentsList } from "@/components/documents/documents-list";

// Export route configuration for caching
export const revalidate = routeConfig.documents.revalidate;
export const dynamic = routeConfig.documents.dynamic;

// Page metadata
export const metadata: Metadata = {
  title: "Documents",
  description: "Manage your study documents and materials.",
};

// ============================================================================
// Main Page Component (Server Component)
// ============================================================================

export default async function DocumentsPage() {
  // Check authentication
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login?redirectTo=/documents");
  }
  
  return (
    <div className="space-y-6">
      {/* Header - Static content */}
      <DocumentsHeader />
      
      {/* Documents List - With streaming */}
      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentsContent userId={user.id} />
      </Suspense>
    </div>
  );
}

// ============================================================================
// Documents Content (Server Component)
// ============================================================================

async function DocumentsContent({ userId }: { userId: string }) {
  const documents = await getUserDocuments(userId);
  
  return <DocumentsList documents={documents} userId={userId} />;
}
