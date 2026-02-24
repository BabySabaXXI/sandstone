import { ReactNode } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";

export const metadata: Metadata = {
  title: {
    template: "%s | Sandstone",
    default: "Sandstone",
  },
};

async function checkAuth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await checkAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <AppSidebar user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumbs Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Breadcrumbs />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 container py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
