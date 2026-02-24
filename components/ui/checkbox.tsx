"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";
import * as CheckboxPrimitives from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

/**
 * Checkbox Component
 * 
 * A checkbox component built on Radix UI Checkbox primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Checkbox />
 * <Checkbox checked={true} onCheckedChange={handleChange} />
 * <Checkbox indeterminate />
 */

// ============================================
// Checkbox Variants
// ============================================

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded border border-sand-300 ring-offset-background " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary " +
  "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary",
  {
    variants: {
      size: {
        sm: "h-3.5 w-3.5 rounded-sm",
        md: "h-4 w-4 rounded",
        lg: "h-5 w-5 rounded-md",
      },
      variant: {
        default: "",
        primary: "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        success: "data-[state=checked]:bg-sage-300 data-[state=checked]:border-sage-300",
        warning: "data-[state=checked]:bg-amber-300 data-[state=checked]:border-amber-300",
        error: "data-[state=checked]:bg-rose-300 data-[state=checked]:border-rose-300",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// ============================================
// Checkbox Component
// ============================================

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitives.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitives.Root>,
  CheckboxProps
>(
  ({ className, size, variant, ...props }, ref) => (
    <CheckboxPrimitives.Root
      ref={ref}
      className={cn(checkboxVariants({ size, variant }), className)}
      {...props}
    >
      <CheckboxPrimitives.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-3.5 w-3.5" />
      </CheckboxPrimitives.Indicator>
    </CheckboxPrimitives.Root>
  )
);
Checkbox.displayName = CheckboxPrimitives.Root.displayName;

// ============================================
// Indeterminate Checkbox
// ============================================

const IndeterminateCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitives.Root>,
  CheckboxProps & { indeterminate?: boolean }
>(
  ({ className, size, variant, indeterminate, checked, ...props }, ref) => (
    <CheckboxPrimitives.Root
      ref={ref}
      className={cn(checkboxVariants({ size, variant }), className)}
      checked={indeterminate ? "indeterminate" : checked}
      {...props}
    >
      <CheckboxPrimitives.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        {indeterminate ? (
          <Minus className="h-3.5 w-3.5" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </CheckboxPrimitives.Indicator>
    </CheckboxPrimitives.Root>
  )
);
IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

// ============================================
// Labeled Checkbox - With Label
// ============================================

interface LabeledCheckboxProps extends CheckboxProps {
  label: string;
  description?: string;
  className?: string;
}

const LabeledCheckbox: React.FC<LabeledCheckboxProps> = ({
  label,
  description,
  className,
  id,
  ...checkboxProps
}) => {
  const checkboxId = id || React.useId();

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox id={checkboxId} {...checkboxProps} />
      <div className="flex-1 -mt-0.5">
        <label
          htmlFor={checkboxId}
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
// Checkbox Group - Multiple Checkboxes
// ============================================

interface CheckboxOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  layout?: "vertical" | "horizontal";
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selected,
  onChange,
  className,
  layout = "vertical",
}) => {
  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div
      className={cn(
        layout === "horizontal" ? "flex flex-wrap gap-4" : "space-y-3",
        className
      )}
    >
      {options.map((option) => (
        <LabeledCheckbox
          key={option.id}
          id={option.id}
          label={option.label}
          description={option.description}
          checked={selected.includes(option.id)}
          disabled={option.disabled}
          onCheckedChange={() => handleToggle(option.id)}
        />
      ))}
    </div>
  );
};

// ============================================
// Checkbox Card - Card-style Checkbox
// ============================================

interface CheckboxCardProps extends CheckboxProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const CheckboxCard: React.FC<CheckboxCardProps> = ({
  title,
  description,
  icon,
  className,
  checked,
  ...checkboxProps
}) => {
  return (
    <label
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
        checked
          ? "border-primary bg-peach-100/30"
          : "border-border bg-card hover:border-sand-300",
        className
      )}
    >
      <Checkbox checked={checked} {...checkboxProps} />
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

export {
  Checkbox,
  IndeterminateCheckbox,
  LabeledCheckbox,
  CheckboxGroup,
  CheckboxCard,
  checkboxVariants,
};

export type {
  CheckboxProps,
  LabeledCheckboxProps,
  CheckboxOption,
  CheckboxGroupProps,
  CheckboxCardProps,
};
