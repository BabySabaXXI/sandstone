"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, Plus, Minus } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/lib/utils";

/**
 * Accordion Component
 * 
 * A flexible accordion component built on Radix UI Accordion primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Question 1</AccordionTrigger>
 *     <AccordionContent>Answer 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */

// ============================================
// Accordion Root
// ============================================

const Accordion = AccordionPrimitive.Root;

// ============================================
// Accordion Item Variants
// ============================================

const accordionItemVariants = cva("border-b border-border", {
  variants: {
    variant: {
      default: "",
      bordered: "border border-border rounded-xl mb-2 overflow-hidden",
      card: "bg-card border border-border rounded-xl mb-3 overflow-hidden shadow-soft-sm",
      ghost: "border-b-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// ============================================
// Accordion Item
// ============================================

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    VariantProps<typeof accordionItemVariants> {}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(
  ({ className, variant, ...props }, ref) => (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  )
);
AccordionItem.displayName = "AccordionItem";

// ============================================
// Accordion Trigger Variants
// ============================================

const accordionTriggerVariants = cva(
  "flex flex-1 items-center justify-between py-4 font-medium transition-all " +
  "hover:underline hover:underline-offset-4 " +
  "[&[data-state=open]>svg]:rotate-180",
  {
    variants: {
      variant: {
        default: "text-foreground",
        card: "px-5 py-4 hover:no-underline hover:bg-sand-50/50",
        bordered: "px-4 py-3 hover:no-underline hover:bg-sand-50/50",
        minimal: "py-3 text-sm text-sand-600 hover:text-foreground",
      },
      iconStyle: {
        chevron: "",
        plus: "[&[data-state=open]>svg]:rotate-0 [&[data-state=open]>svg]:hidden",
      },
    },
    defaultVariants: {
      variant: "default",
      iconStyle: "chevron",
    },
  }
);

// ============================================
// Accordion Trigger
// ============================================

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
    VariantProps<typeof accordionTriggerVariants> {
  iconStyle?: "chevron" | "plus";
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  ({ className, children, variant, iconStyle = "chevron", ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(accordionTriggerVariants({ variant, iconStyle }), className)}
        {...props}
      >
        {children}
        {iconStyle === "chevron" ? (
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-sand-500" />
        ) : (
          <>
            <Plus className="h-4 w-4 shrink-0 transition-transform duration-200 text-sand-500" />
            <Minus className="h-4 w-4 shrink-0 transition-transform duration-200 text-sand-500 hidden [&[data-state=open]_&]:block [&[data-state=open]_&]:absolute [&[data-state=open]_&]:right-0" />
          </>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

// ============================================
// Accordion Content
// ============================================

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// ============================================
// FAQ Accordion - Specialized Component
// ============================================

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  defaultOpen,
  allowMultiple = false,
  className,
}) => {
  return (
    <Accordion
      type={allowMultiple ? "multiple" : "single"}
      collapsible
      defaultValue={defaultOpen}
      className={className}
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} variant="bordered">
          <AccordionTrigger variant="bordered">{item.question}</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-sand-600 leading-relaxed">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// ============================================
// Settings Accordion - Specialized Component
// ============================================

interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface SettingsAccordionProps {
  sections: SettingsSection[];
  defaultOpen?: string;
  className?: string;
}

const SettingsAccordion: React.FC<SettingsAccordionProps> = ({
  sections,
  defaultOpen,
  className,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen}
      className={className}
    >
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id} variant="card">
          <AccordionTrigger variant="card">
            <div className="flex items-center gap-3">
              {section.icon && (
                <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center text-sand-600">
                  {section.icon}
                </div>
              )}
              <div className="text-left">
                <span className="block text-sm font-medium text-foreground">
                  {section.title}
                </span>
                {section.description && (
                  <span className="block text-xs text-sand-500 mt-0.5">
                    {section.description}
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 pt-2 border-t border-border">
            {section.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// ============================================
// Tree Accordion - Specialized Component for Hierarchical Data
// ============================================

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface TreeAccordionProps {
  nodes: TreeNode[];
  defaultOpen?: string[];
  className?: string;
  onNodeClick?: (node: TreeNode) => void;
}

const TreeAccordionNode: React.FC<{
  node: TreeNode;
  depth?: number;
  onNodeClick?: (node: TreeNode) => void;
}> = ({ node, depth = 0, onNodeClick }) => {
  const hasChildren = node.children && node.children.length > 0;

  if (!hasChildren) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer",
          "text-sm text-sand-600 hover:bg-sand-100 hover:text-foreground",
          "transition-colors duration-150"
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => {
          node.onClick?.();
          onNodeClick?.(node);
        }}
      >
        {node.icon && <span className="text-sand-500">{node.icon}</span>}
        <span>{node.label}</span>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value={node.id} className="border-0">
        <AccordionTrigger
          variant="minimal"
          className={cn(
            "py-2 hover:no-underline",
            "text-sm text-sand-600 hover:text-foreground"
          )}
          style={{ paddingLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center gap-2">
            {node.icon && <span className="text-sand-500">{node.icon}</span>}
            <span>{node.label}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          {node.children?.map((child) => (
            <TreeAccordionNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const TreeAccordion: React.FC<TreeAccordionProps> = ({
  nodes,
  defaultOpen,
  className,
  onNodeClick,
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {nodes.map((node) => (
        <TreeAccordionNode key={node.id} node={node} onNodeClick={onNodeClick} />
      ))}
    </div>
  );
};

// ============================================
// Step Accordion - Specialized Component for Step-by-Step Content
// ============================================

interface Step {
  id: string;
  number: number;
  title: string;
  description?: string;
  content: React.ReactNode;
  completed?: boolean;
}

interface StepAccordionProps {
  steps: Step[];
  currentStep?: string;
  onStepChange?: (stepId: string) => void;
  className?: string;
}

const StepAccordion: React.FC<StepAccordionProps> = ({
  steps,
  currentStep,
  onStepChange,
  className,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      value={currentStep}
      onValueChange={onStepChange}
      className={className}
    >
      {steps.map((step, index) => (
        <AccordionItem key={step.id} value={step.id} className="border-0 mb-3">
          <AccordionTrigger
            variant="card"
            className={cn(
              "px-4 py-3 rounded-xl border",
              step.completed
                ? "border-sage-200 bg-sage-100/30"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  step.completed
                    ? "bg-sage-200 text-white"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-sand-200 text-sand-600"
                )}
              >
                {step.completed ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="text-left">
                <span className="block text-sm font-medium text-foreground">
                  {step.title}
                </span>
                {step.description && (
                  <span className="block text-xs text-sand-500 mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-3">
            {step.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// ============================================
// Animated Accordion - With Custom Animations
// ============================================

interface AnimatedAccordionProps {
  items: { id: string; title: string; content: React.ReactNode }[];
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
  animation?: "slide" | "fade" | "scale";
}

const AnimatedAccordion: React.FC<AnimatedAccordionProps> = ({
  items,
  defaultOpen,
  allowMultiple = false,
  className,
  animation = "slide",
}) => {
  const animationClasses = {
    slide: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    fade: "data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in",
    scale: "data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in",
  };

  return (
    <Accordion
      type={allowMultiple ? "multiple" : "single"}
      collapsible
      defaultValue={defaultOpen}
      className={className}
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} variant="bordered">
          <AccordionTrigger variant="bordered">{item.title}</AccordionTrigger>
          <AccordionPrimitive.Content
            className={cn(
              "overflow-hidden text-sm transition-all",
              animationClasses[animation]
            )}
          >
            <div className="px-4 pb-4 pt-0">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  FAQAccordion,
  SettingsAccordion,
  TreeAccordion,
  StepAccordion,
  AnimatedAccordion,
  accordionItemVariants,
  accordionTriggerVariants,
};

export type {
  AccordionItemProps,
  AccordionTriggerProps,
  FAQItem,
  FAQAccordionProps,
  SettingsSection,
  SettingsAccordionProps,
  TreeNode,
  TreeAccordionProps,
  Step,
  StepAccordionProps,
  AnimatedAccordionProps,
};
