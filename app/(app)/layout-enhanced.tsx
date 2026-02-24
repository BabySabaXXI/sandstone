import { ReactNode } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EnhancedSidebar } from "@/components/navigation/enhanced-sidebar";
import { EnhancedBreadcrumbs, StructuredDataBreadcrumbs } from "@/components/navigation/enhanced-breadcrumbs";
import { NavigationProvider } from "@/components/navigation/navigation-patterns";
import { MobileHeader, BottomNavigation } from "@/components/navigation/mobile-navigation";
import { headers } from "next/headers";

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

function getNotificationCount(): number {
  // This would typically come from your database or API
  return 3;
}

export default async function EnhancedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await checkAuth();
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "/";

  if (!user) {
    redirect("/login");
  }

  const notificationCount = getNotificationCount();

  return (
    <NavigationProvider>
      {/* Structured Data for SEO */}
      <StructuredDataBreadcrumbs pathname={pathname} />

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen bg-background">
        {/* Sidebar Navigation */}
        <EnhancedSidebar 
          user={user} 
          defaultCollapsed={false}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs Header */}
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <EnhancedBreadcrumbs 
                maxItems={4}
                separator="chevron"
                showHome={true}
              />
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 container py-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileHeader
          user={{
            email: user.email,
            name: user.user_metadata?.full_name,
            avatar: user.user_metadata?.avatar_url,
          }}
          notificationCount={notificationCount}
        />
        
        <main className="pb-20 px-4 py-4">
          {children}
        </main>
        
        <BottomNavigation />
      </div>
    </NavigationProvider>
  );
}
