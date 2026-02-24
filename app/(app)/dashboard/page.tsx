import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized learning dashboard with AI-powered grading and study tools.",
  openGraph: {
    title: "Dashboard | Sandstone",
    description: "Your personalized learning dashboard",
  },
};

async function getUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function DashboardPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  return <DashboardContent user={user} />;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
