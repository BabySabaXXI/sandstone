"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  EnhancedBreadcrumbs,
  BackButtonBreadcrumb,
} from "@/components/navigation/enhanced-breadcrumbs";
import {
  QuickNav,
  Stepper,
  Pagination,
  TabsNavigation,
  BrowserNavigation,
} from "@/components/navigation/navigation-patterns";
import {
  LocationIndicator,
  ProgressIndicator,
  DirectionIndicator,
  StatusIndicator,
  MilestoneIndicator,
  ScrollIndicator,
} from "@/components/navigation/wayfinding-indicators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  GraduationCap,
  Layers,
  FileText,
  Library,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// =============================================================================
// DEMO CONTENT
// =============================================================================

const quickNavItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/grade", label: "AI Grading", icon: GraduationCap },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/documents", label: "Documents", icon: FileText },
];

const stepperSteps = [
  { label: "Upload", description: "Upload your response" },
  { label: "Process", description: "AI is analyzing" },
  { label: "Grade", description: "Get feedback" },
  { label: "Review", description: "Review results" },
];

const tabsData = [
  {
    id: "all",
    label: "All Items",
    icon: Home,
    content: (
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">All Items</h3>
        <p className="text-muted-foreground">View all your learning materials here.</p>
      </div>
    ),
  },
  {
    id: "active",
    label: "Active",
    icon: Loader2,
    badge: "3",
    content: (
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Active Items</h3>
        <p className="text-muted-foreground">Items you are currently working on.</p>
      </div>
    ),
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle2,
    content: (
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Completed Items</h3>
        <p className="text-muted-foreground">Items you have finished.</p>
      </div>
    ),
  },
];

const milestones = [
  { label: "Sign Up", completed: true, description: "Create your account" },
  { label: "Upload", completed: true, description: "Upload first document" },
  { label: "Grade", completed: false, current: true, description: "Get AI feedback" },
  { label: "Review", completed: false, description: "Review your progress" },
];

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function NavigationDemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(3);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(65);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Navigation System Demo</h1>
        <p className="text-muted-foreground">
          Explore the enhanced navigation components available in Sandstone.
        </p>
      </div>

      {/* Breadcrumbs Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Breadcrumbs</h2>
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Breadcrumbs</CardTitle>
            <CardDescription>Animated breadcrumbs with truncation support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <EnhancedBreadcrumbs />
            </div>
            <div className="p-4 border rounded-lg">
              <BackButtonBreadcrumb />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Navigation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Navigation</h2>
        <Card>
          <CardHeader>
            <CardTitle>QuickNav</CardTitle>
            <CardDescription>Horizontal quick access links</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickNav items={quickNavItems} />
          </CardContent>
        </Card>
      </section>

      {/* Stepper */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stepper</h2>
        <Card>
          <CardHeader>
            <CardTitle>Multi-Step Process</CardTitle>
            <CardDescription>Visual progress through multiple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Stepper
              steps={stepperSteps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(stepperSteps.length - 1, currentStep + 1))}
                disabled={currentStep === stepperSteps.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pagination */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pagination</h2>
        <Card>
          <CardHeader>
            <CardTitle>Page Navigation</CardTitle>
            <CardDescription>Navigate through multiple pages</CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={setCurrentPage}
              showFirstLast
              maxVisible={5}
            />
          </CardContent>
        </Card>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tabs</h2>
        <Card>
          <CardHeader>
            <CardTitle>Tabs Navigation</CardTitle>
            <CardDescription>Animated tab switching</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsNavigation tabs={tabsData} defaultTab="all" />
          </CardContent>
        </Card>
      </section>

      {/* Wayfinding Indicators */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Wayfinding Indicators</h2>
        
        {/* Location Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Location Indicator</CardTitle>
            <CardDescription>Show current position in a flow</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationIndicator
              currentSection="grade"
              sections={[
                { id: "upload", label: "Upload" },
                { id: "process", label: "Process" },
                { id: "grade", label: "Grade" },
                { id: "review", label: "Review" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicator</CardTitle>
            <CardDescription>Visual progress with percentage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressIndicator
              current={progress}
              total={100}
              label="Study Progress"
              showPercentage
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>
                -10%
              </Button>
              <Button variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>
                +10%
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Direction Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Direction Indicator</CardTitle>
            <CardDescription>Directional hints with animation</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-8">
            <DirectionIndicator direction="down" label="Scroll down" pulse />
            <DirectionIndicator direction="up" label="Scroll up" />
            <DirectionIndicator direction="right" label="Continue" pulse />
          </CardContent>
        </Card>

        {/* Status Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Status Indicator</CardTitle>
            <CardDescription>Show current status with icons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStatus("idle")}>Idle</Button>
              <Button variant="outline" onClick={() => setStatus("loading")}>Loading</Button>
              <Button variant="outline" onClick={() => setStatus("success")}>Success</Button>
              <Button variant="outline" onClick={() => setStatus("error")}>Error</Button>
            </div>
            <StatusIndicator
              status={status}
              message={
                status === "idle"
                  ? "Ready to start"
                  : status === "loading"
                  ? "Processing your request..."
                  : status === "success"
                  ? "Operation completed successfully!"
                  : "An error occurred"
              }
            />
          </CardContent>
        </Card>

        {/* Milestone Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Milestone Indicator</CardTitle>
            <CardDescription>Track progress through milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <MilestoneIndicator milestones={milestones} orientation="horizontal" />
          </CardContent>
        </Card>
      </section>

      {/* Scroll Indicator */}
      <ScrollIndicator showOnScroll threshold={100} />
    </div>
  );
}
