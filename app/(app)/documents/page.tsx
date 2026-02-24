import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsContent } from "@/components/documents/documents-content";

export const metadata: Metadata = {
  title: "Documents",
  description: "Manage your study documents and materials.",
};

async function getUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function DocumentsPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login?redirectTo=/documents");
  }

  return <DocumentsContent userId={user.id} />;
}

export const dynamic = "force-dynamic";
