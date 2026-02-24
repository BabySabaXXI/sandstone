import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FlashcardsContent } from "@/components/flashcards/flashcards-content";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Study with AI-generated flashcards using spaced repetition.",
};

async function getUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function FlashcardsPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login?redirectTo=/flashcards");
  }

  return <FlashcardsContent userId={user.id} />;
}

export const dynamic = "force-dynamic";
