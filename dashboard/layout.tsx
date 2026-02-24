import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Sandstone',
  description: 'Track your learning progress, study statistics, and achievements',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
