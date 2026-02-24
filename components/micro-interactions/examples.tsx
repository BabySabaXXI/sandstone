"use client";

/**
 * Micro-Interactions Examples
 * 
 * Demonstrates usage of all micro-interaction components and hooks.
 */

import * as React from "react";
import { Check, X, AlertCircle, Info, Loader2, Sparkles, ArrowRight } from "lucide-react";

import {
  // Buttons
  InteractiveButton,
  IconButton,
  FloatingActionButton,
  ButtonGroup,
  
  // Cards
  InteractiveCard,
  CardHeader,
  CardContent,
  CardFooter,
  FeatureCard,
  StatCard,
  
  // Feedback
  SuccessAnimation,
  ErrorAnimation,
  LoadingAnimation,
  WarningAnimation,
  InfoAnimation,
  ConfettiAnimation,
  Toast,
  Skeleton,
  
  // Transitions
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerContainer,
  ScrollReveal,
  HoverScale,
  Magnetic,
  
  // Hooks
  useRipple,
  useHoverAnimation,
  usePressAnimation,
  useCountUp,
  useConfetti,
  useShake,
} from "./index";

// ============================================
// Button Examples
// ============================================

export const ButtonExamples: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const { trigger: triggerConfetti } = useConfetti({ count: 30 });

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      triggerConfetti();
      setTimeout(() => setSuccess(false), 2000);
    }, 2000);
  };

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Interactive Buttons</h2>
      
      {/* Basic Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Variants</h3>
        <div className="flex flex-wrap gap-4">
          <InteractiveButton variant="primary">Primary</InteractiveButton>
          <InteractiveButton variant="secondary">Secondary</InteractiveButton>
          <InteractiveButton variant="outline">Outline</InteractiveButton>
          <InteractiveButton variant="ghost">Ghost</InteractiveButton>
          <InteractiveButton variant="destructive">Destructive</InteractiveButton>
          <InteractiveButton variant="gradient">Gradient</InteractiveButton>
          <InteractiveButton variant="glass">Glass</InteractiveButton>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <InteractiveButton size="xs">Extra Small</InteractiveButton>
          <InteractiveButton size="sm">Small</InteractiveButton>
          <InteractiveButton size="md">Medium</InteractiveButton>
          <InteractiveButton size="lg">Large</InteractiveButton>
          <InteractiveButton size="xl">Extra Large</InteractiveButton>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <InteractiveButton leftIcon={<Sparkles className="w-4 h-4" />}>
            With Left Icon
          </InteractiveButton>
          <InteractiveButton rightIcon={<ArrowRight className="w-4 h-4" />}>
            With Right Icon
          </InteractiveButton>
          <InteractiveButton
            leftIcon={<Sparkles className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Both Icons
          </InteractiveButton>
        </div>
      </div>

      {/* Loading State */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Loading States</h3>
        <div className="flex flex-wrap gap-4">
          <InteractiveButton loading>Loading</InteractiveButton>
          <InteractiveButton loading loadingText="Processing...">
            Submit
          </InteractiveButton>
          <InteractiveButton
            loading={loading}
            success={success}
            successIcon={<Check className="w-4 h-4" />}
            onClick={handleLoadingClick}
          >
            Click to Load
          </InteractiveButton>
        </div>
      </div>

      {/* Magnetic Effect */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Magnetic Effect</h3>
        <div className="flex flex-wrap gap-4">
          <InteractiveButton magnetic magneticStrength={0.3}>
            Magnetic Button
          </InteractiveButton>
          <InteractiveButton magnetic magneticStrength={0.5} variant="gradient">
            Strong Magnetic
          </InteractiveButton>
        </div>
      </div>

      {/* Icon Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Icon Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <IconButton icon={<Sparkles className="w-5 h-5" />} label="Sparkles" />
          <IconButton icon={<Check className="w-5 h-5" />} label="Check" variant="secondary" />
          <IconButton icon={<ArrowRight className="w-5 h-5" />} label="Arrow" variant="outline" />
        </div>
      </div>

      {/* Button Group */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Button Group</h3>
        <ButtonGroup>
          <InteractiveButton variant="secondary" size="sm">Cancel</InteractiveButton>
          <InteractiveButton size="sm">Save</InteractiveButton>
        </ButtonGroup>
      </div>

      <ConfettiAnimation trigger={success} />
    </div>
  );
};

// ============================================
// Card Examples
// ============================================

export const CardExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Interactive Cards</h2>

      {/* Basic Cards with Hover Effects */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Hover Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InteractiveCard hover="lift">
            <h4 className="font-semibold mb-2">Lift Effect</h4>
            <p className="text-sm text-muted-foreground">
              This card lifts up on hover with a smooth shadow transition.
            </p>
          </InteractiveCard>

          <InteractiveCard hover="scale">
            <h4 className="font-semibold mb-2">Scale Effect</h4>
            <p className="text-sm text-muted-foreground">
              This card scales up slightly on hover.
            </p>
          </InteractiveCard>

          <InteractiveCard hover="glow">
            <h4 className="font-semibold mb-2">Glow Effect</h4>
            <p className="text-sm text-muted-foreground">
              This card glows with a primary color shadow on hover.
            </p>
          </InteractiveCard>
        </div>
      </div>

      {/* Tilt Card */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tilt Effect</h3>
        <div className="max-w-md">
          <InteractiveCard hover="tilt" hoverIntensity={1.5}>
            <h4 className="font-semibold mb-2">3D Tilt</h4>
            <p className="text-sm text-muted-foreground">
              Move your mouse over this card to see the 3D tilt effect!
            </p>
          </InteractiveCard>
        </div>
      </div>

      {/* Feature Card */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Feature Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Beautiful Design"
            description="Carefully crafted components with attention to detail."
          />
          <FeatureCard
            icon={<Check className="w-6 h-6" />}
            title="Easy to Use"
            description="Simple API that makes development a breeze."
          />
          <FeatureCard
            icon={<ArrowRight className="w-6 h-6" />}
            title="Fast Performance"
            description="Optimized for speed and smooth interactions."
          />
        </div>
      </div>

      {/* Stat Card */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Stat Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            value="12.5K"
            label="Total Users"
            trend={{ value: 23, positive: true }}
            icon={<Sparkles className="w-5 h-5" />}
          />
          <StatCard
            value="$48.2K"
            label="Revenue"
            trend={{ value: 15, positive: true }}
            icon={<Check className="w-5 h-5" />}
          />
          <StatCard
            value="98.5%"
            label="Uptime"
            icon={<ArrowRight className="w-5 h-5" />}
          />
          <StatCard
            value="2.4K"
            label="Orders"
            trend={{ value: 8, positive: false }}
            icon={<Loader2 className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Loading Card */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Loading State</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InteractiveCard loading skeletonLines={3}>
            Content hidden while loading
          </InteractiveCard>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Feedback Examples
// ============================================

export const FeedbackExamples: React.FC = () => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Feedback Animations</h2>

      {/* Success Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Success Animation</h3>
        <InteractiveButton onClick={() => setShowSuccess(true)}>
          Show Success
        </InteractiveButton>
        <SuccessAnimation
          show={showSuccess}
          message="Operation completed successfully!"
          onComplete={() => setShowSuccess(false)}
        />
      </div>

      {/* Error Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Error Animation</h3>
        <InteractiveButton variant="destructive" onClick={() => setShowError(true)}>
          Show Error
        </InteractiveButton>
        <ErrorAnimation
          show={showError}
          message="Something went wrong!"
          onComplete={() => setShowError(false)}
        />
      </div>

      {/* Warning Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Warning Animation</h3>
        <InteractiveButton variant="outline" onClick={() => setShowWarning(true)}>
          Show Warning
        </InteractiveButton>
        <WarningAnimation
          show={showWarning}
          message="Please review your input!"
          onComplete={() => setShowWarning(false)}
        />
      </div>

      {/* Info Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Info Animation</h3>
        <InteractiveButton variant="secondary" onClick={() => setShowInfo(true)}>
          Show Info
        </InteractiveButton>
        <InfoAnimation
          show={showInfo}
          message="Here's some useful information!"
          onComplete={() => setShowInfo(false)}
        />
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Loading States</h3>
        <div className="flex flex-wrap gap-8 items-center">
          <LoadingAnimation variant="spinner" message="Loading..." />
          <LoadingAnimation variant="dots" />
          <LoadingAnimation variant="pulse" size="lg" />
          <LoadingAnimation variant="bars" />
        </div>
      </div>

      {/* Toast Notification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Toast Notification</h3>
        <div className="flex flex-wrap gap-4">
          <InteractiveButton onClick={() => setShowToast(true)}>
            Show Toast
          </InteractiveButton>
        </div>
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            show={showToast}
            type="success"
            title="Success!"
            message="Your changes have been saved."
            onClose={() => setShowToast(false)}
          />
        </div>
      </div>

      {/* Skeleton Loading */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Skeleton Loading</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="text" lines={3} />
          <Skeleton variant="circle" className="w-16 h-16" />
          <Skeleton variant="rect" className="h-32" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// Transition Examples
// ============================================

export const TransitionExamples: React.FC = () => {
  const [showContent, setShowContent] = React.useState(true);

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Transition Animations</h2>

      {/* Fade In */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Fade In</h3>
        <InteractiveButton onClick={() => setShowContent(!showContent)}>
          Toggle Content
        </InteractiveButton>
        {showContent && (
          <FadeIn>
            <InteractiveCard>
              <p>This content fades in smoothly!</p>
            </InteractiveCard>
          </FadeIn>
        )}
      </div>

      {/* Slide In */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Slide In Directions</h3>
        <div className="grid grid-cols-2 gap-4">
          <SlideIn direction="up">
            <InteractiveCard>Slide Up</InteractiveCard>
          </SlideIn>
          <SlideIn direction="down">
            <InteractiveCard>Slide Down</InteractiveCard>
          </SlideIn>
          <SlideIn direction="left">
            <InteractiveCard>Slide Left</InteractiveCard>
          </SlideIn>
          <SlideIn direction="right">
            <InteractiveCard>Slide Right</InteractiveCard>
          </SlideIn>
        </div>
      </div>

      {/* Scale In */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Scale In</h3>
        <ScaleIn>
          <InteractiveCard className="max-w-md">
            <p>This content scales in with a bounce effect!</p>
          </InteractiveCard>
        </ScaleIn>
      </div>

      {/* Stagger Container */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Stagger Animation</h3>
        <StaggerContainer staggerDelay={0.1} className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <InteractiveCard key={i} padding="sm">
              Item {i}
            </InteractiveCard>
          ))}
        </StaggerContainer>
      </div>

      {/* Scroll Reveal */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Scroll Reveal</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <InteractiveCard>
                <p>Scroll to reveal item {i}</p>
              </InteractiveCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Hover Scale */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Hover Scale</h3>
        <div className="flex gap-4">
          <HoverScale scale={1.05}>
            <InteractiveCard className="cursor-pointer">Scale 1.05</InteractiveCard>
          </HoverScale>
          <HoverScale scale={1.1}>
            <InteractiveCard className="cursor-pointer">Scale 1.1</InteractiveCard>
          </HoverScale>
          <HoverScale scale={1.15}>
            <InteractiveCard className="cursor-pointer">Scale 1.15</InteractiveCard>
          </HoverScale>
        </div>
      </div>

      {/* Magnetic Effect */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Magnetic Effect</h3>
        <Magnetic strength={0.3}>
          <InteractiveCard className="cursor-pointer inline-block">
            Move your mouse near me!
          </InteractiveCard>
        </Magnetic>
      </div>
    </div>
  );
};

// ============================================
// Hook Examples
// ============================================

export const HookExamples: React.FC = () => {
  const { ref: rippleRef, createRipple } = useRipple({ color: "rgba(232, 213, 196, 0.4)" });
  const { ref: hoverRef, style: hoverStyle, isHovered } = useHoverAnimation({ scale: 1.02, lift: -4 });
  const { ref: pressRef, style: pressStyle, isPressed } = usePressAnimation({ scale: 0.98 });
  const { count, start } = useCountUp(1000, { duration: 2000, startOnMount: false });
  const { ref: shakeRef, style: shakeStyle, shake } = useShake();

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Hook Examples</h2>

      {/* Ripple Hook */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">useRipple Hook</h3>
        <div
          ref={rippleRef as React.RefObject<HTMLDivElement>}
          onClick={createRipple}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-[10px] cursor-pointer select-none relative overflow-hidden"
        >
          Click for Ripple Effect
        </div>
      </div>

      {/* Hover Animation Hook */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">useHoverAnimation Hook</h3>
        <div
          ref={hoverRef as React.RefObject<HTMLDivElement>}
          style={hoverStyle}
          className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground border border-border rounded-[10px] cursor-pointer"
        >
          {isHovered ? "Hovered!" : "Hover me"}
        </div>
      </div>

      {/* Press Animation Hook */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">usePressAnimation Hook</h3>
        <div
          ref={pressRef as React.RefObject<HTMLDivElement>}
          style={pressStyle}
          className="inline-flex items-center justify-center px-6 py-3 bg-peach-100 text-sand-900 rounded-[10px] cursor-pointer select-none"
        >
          {isPressed ? "Pressed!" : "Press me"}
        </div>
      </div>

      {/* Count Up Hook */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">useCountUp Hook</h3>
        <div className="flex items-center gap-4">
          <InteractiveCard className="text-3xl font-bold">
            {Math.round(count)}
          </InteractiveCard>
          <InteractiveButton onClick={start}>Start Counting</InteractiveButton>
        </div>
      </div>

      {/* Shake Hook */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">useShake Hook</h3>
        <div className="flex items-center gap-4">
          <div
            ref={shakeRef as React.RefObject<HTMLDivElement>}
            style={shakeStyle}
            className="inline-flex items-center justify-center px-6 py-3 bg-rose-100 text-rose-200 rounded-[10px]"
          >
            Shake me!
          </div>
          <InteractiveButton variant="destructive" onClick={shake}>
            Trigger Shake
          </InteractiveButton>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Main Examples Page
// ============================================

export const MicroInteractionsExamples: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-12">
          Micro-Interactions Library
        </h1>
        
        <StaggerContainer staggerDelay={0.1} className="space-y-16">
          <ButtonExamples />
          <CardExamples />
          <FeedbackExamples />
          <TransitionExamples />
          <HookExamples />
        </StaggerContainer>
      </div>
    </div>
  );
};

export default MicroInteractionsExamples;
