"use client";

import { ReactNode, memo } from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { NotificationProvider } from "./notification-context";
import { LoadingProvider } from "./loading-context";
import { ErrorProvider } from "./error-context";
import { QueryProvider } from "./query-provider";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root Application Providers
 * 
 * Composes all context providers in the correct order:
 * 1. QueryProvider - React Query for server state
 * 2. ThemeProvider - Theme management
 * 3. NotificationProvider - Toast notifications
 * 4. ErrorProvider - Error boundary and handling
 * 5. LoadingProvider - Global loading states
 * 6. AuthProvider - Authentication state
 * 
 * Order matters: providers higher in the tree can be accessed by those lower.
 */
function AppProvidersComponent({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="sandstone-theme">
        <NotificationProvider>
          <ErrorProvider>
            <LoadingProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </LoadingProvider>
          </ErrorProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

// Memoize to prevent unnecessary re-renders
export const AppProviders = memo(AppProvidersComponent);
AppProviders.displayName = "AppProviders";

export default AppProviders;
