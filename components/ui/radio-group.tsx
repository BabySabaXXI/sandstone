"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Circle } from "lucide-react";
import * as RadioGroupPrimitives from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

/**
 * Radio Group Component
 * 
 * A radio group component built on Radix UI Radio Group primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <RadioGroup defaultValue="option1">
 *   <RadioGroupItem value="option1" id="option1" />
 *   <label htmlFor="option1">Option 1</label>
 * </RadioGroup>
 */

// ============================================
// Radio Group Root
// ============================================

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitives.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitives.Root.displayName;

// ============================================
// Radio Group Item Variants
// ============================================

const radioGroupItemVariants = cva(
  "aspect-square h-4 w-4 rounded-full border border-sand-300 text-primary ring-offset-background " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
      variant: {
        default: "",
        primary: "text-primary",
        success: "text-sage-300 border-sage-300",
        warning: "text-amber-300 border-amber-300",
        error: "text-rose-300 border-rose-300",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// ============================================
// Radio Group Item
// ============================================

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Item>,
  RadioGroupItemProps
>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <RadioGroupPrimitives.Item
        ref={ref}
        className={cn(radioGroupItemVariants({ size, variant }), className)}
        {...props}
      >
        <RadioGroupPrimitives.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitives.Indicator>
      </RadioGroupPrimitives.Item>
    );
  }
);
RadioGroupItem.displayName = RadioGroupPrimitives.Item.displayName;

// ============================================
// Labeled Radio - With Label
// ============================================

interface LabeledRadioProps extends RadioGroupItemProps {
  label: string;
  description?: string;
  className?: string;
}

const LabeledRadio: React.FC<LabeledRadioProps> = ({
  label,
  description,
  className,
  id,
  ...radioProps
}) => {
  const radioId = id || React.useId();

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <RadioGroupItem id={radioId} {...radioProps} />
      <div className="flex-1 -mt-0.5">
        <label
          htmlFor={radioId}
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-sand-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
};

// ============================================
// Radio Group with Options
// ============================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupOptionsProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  layout?: "vertical" | "horizontal";
  name?: string;
}

const RadioGroupOptions: React.FC<RadioGroupOptionsProps> = ({
  options,
  value,
  onChange,
  className,
  layout = "vertical",
  name,
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      name={name}
      className={cn(
        layout === "horizontal" ? "flex flex-wrap gap-4" : "space-y-3",
        className
      )}
    >
      {options.map((option) => (
        <LabeledRadio
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
        />
      ))}
    </RadioGroup>
  );
};

// ============================================
// Radio Card - Card-style Radio
// ============================================

interface RadioCardProps extends RadioGroupItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const RadioCard: React.FC<RadioCardProps> = ({
  title,
  description,
  icon,
  className,
  ...radioProps
}) => {
  return (
    <label
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
        "hover:border-sand-300",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-peach-100/30",
        className
      )}
    >
      <RadioGroupItem {...radioProps} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-sand-500">{icon}</span>}
          <span className="font-medium text-foreground">{title}</span>
        </div>
        {description && (
          <p className="text-sm text-sand-500 mt-1">{description}</p>
        )}
      </div>
    </label>
  );
};

// ============================================
// Radio Group Cards
// ============================================

interface RadioCardOption {
  value: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface RadioGroupCardsProps {
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

const RadioGroupCards: React.FC<RadioGroupCardsProps> = ({
  options,
  value,
  onChange,
  className,
  columns = 1,
}) => {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className={cn("grid gap-4", columnClasses[columns], className)}
    >
      {options.map((option) => (
        <RadioCard
          key={option.value}
          value={option.value}
          title={option.title}
          description={option.description}
          icon={option.icon}
          disabled={option.disabled}
        />
      ))}
    </RadioGroup>
  );
};

// ============================================
// Segmented Control - Horizontal Radio Group
// ============================================

interface SegmentedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-12 text-base",
  };

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className={cn(
        "inline-flex p-1 bg-sand-100 rounded-xl",
        sizeClasses[size],
        className
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative flex items-center justify-center gap-2 px-4 rounded-lg cursor-pointer transition-all duration-200",
            "hover:text-sand-800",
            "has-[[data-state=checked]]:bg-card has-[[data-state=checked]]:shadow-soft-sm has-[[data-state=checked]]:text-foreground",
            "text-sand-600"
          )}
        >
          <RadioGroupItem value={option.value} className="sr-only" />
          {option.icon && <span>{option.icon}</span>}
          <span className="font-medium">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  );
};

export {
  RadioGroup,
  RadioGroupItem,
  LabeledRadio,
  RadioGroupOptions,
  RadioCard,
  RadioGroupCards,
  SegmentedControl,
  radioGroupItemVariants,
};

export type {
  RadioGroupItemProps,
  LabeledRadioProps,
  RadioOption,
  RadioGroupOptionsProps,
  RadioCardProps,
  RadioCardOption,
  RadioGroupCardsProps,
  SegmentedOption,
  SegmentedControlProps,
};
