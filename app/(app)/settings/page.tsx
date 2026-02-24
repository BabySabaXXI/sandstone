import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsContent } from "@/components/settings/settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

async function getUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function SettingsPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login?redirectTo=/settings");
  }

  return <SettingsContent user={user} />;
}

export const dynamic = "force-dynamic";
