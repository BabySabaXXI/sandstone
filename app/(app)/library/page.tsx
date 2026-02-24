import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LibraryContent } from "@/components/library/library-content";

export const metadata: Metadata = {
  title: "Library",
  description: "Browse curated study resources and materials.",
};

async function getUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function LibraryPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login?redirectTo=/library");
  }

  return <LibraryContent userId={user.id} />;
}

export const dynamic = "force-dynamic";
