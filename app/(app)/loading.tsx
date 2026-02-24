"use client";

import { LoadingLogo } from "@/components/animations";

/**
 * App layout loading component
 * Shows during page transitions within the app
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingLogo size="md" text="Loading..." />
    </div>
  );
}
