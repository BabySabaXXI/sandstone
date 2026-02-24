import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizContent } from "@/components/quiz/quiz-content";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Test your knowledge with AI-generated quizzes.",
};

async function getUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function QuizPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login?redirectTo=/quiz");
  }

  return <QuizContent userId={user.id} />;
}

export const dynamic = "force-dynamic";
