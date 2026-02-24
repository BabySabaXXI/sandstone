import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GradePageContent } from "@/components/grade/grade-page-content";
import { GradePageSkeleton } from "@/components/grade/grade-page-skeleton";

// Page-specific metadata
export const metadata: Metadata = {
  title: "AI Response Grading",
  description: "Get instant, detailed feedback on your A-Level responses from AI examiners based on official Edexcel mark schemes.",
  keywords: ["essay grading", "A-Level", "Edexcel", "AI examiner", "feedback"],
  openGraph: {
    title: "AI Response Grading | Sandstone",
    description: "Get instant feedback from AI examiners",
  },
};

// Server-side auth check
async function checkAuth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Main grade page (Server Component)
export default async function GradePage() {
  const user = await checkAuth();

  if (!user) {
    redirect("/login?redirectTo=/grade");
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<GradePageSkeleton />}>
        <GradePageContent userId={user.id} />
      </Suspense>
    </div>
  );
}

// Dynamic rendering for user-specific content
export const dynamic = "force-dynamic";

// Disable caching for this page
export const revalidate = 0;
