"use client";

import { ProgressDashboard } from "@/components/progress";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress | Sandstone",
  description: "Track your learning progress, achievements, and milestones",
};

export default function ProgressPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ProgressDashboard defaultTab="overview" />
    </div>
  );
}
