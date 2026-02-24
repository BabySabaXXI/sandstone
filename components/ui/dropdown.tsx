"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";

/**
 * Dropdown Component
 * 
 * A comprehensive dropdown menu component built on Radix UI Dropdown Menu primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Dropdown>
 *   <DropdownTrigger>
 *     <Button>Open Menu</Button>
 *   </DropdownTrigger>
 *   <DropdownContent>
 *     <DropdownItem>Item 1</DropdownItem>
 *     <DropdownItem>Item 2</DropdownItem>
 *     <DropdownSeparator />
 *     <DropdownItem>Item 3</DropdownItem>
 *   </DropdownContent>
 * </Dropdown>
 */

// ============================================
// Dropdown Root Components
// ============================================

const Dropdown = DropdownMenuPrimitive.Root;
const DropdownTrigger = DropdownMenuPrimitive.Trigger;
const DropdownGroup = DropdownMenuPrimitive.Group;
const DropdownPortal = DropdownMenuPrimitive.Portal;
const DropdownSub = DropdownMenuPrimitive.Sub;
const DropdownRadioGroup = DropdownMenuPrimitive.RadioGroup;

// ============================================
// Dropdown Content Variants
// ============================================

const dropdownContentVariants = cva(
  "z-dropdown min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-1 " +
  "text-popover-foreground shadow-soft-md " +
  "data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out",
  {
    variants: {
      size: {
        sm: "min-w-[140px]",
        md: "min-w-[200px]",
        lg: "min-w-[280px]",
      },
      align: {
        start: "origin-top-left",
        center: "origin-top",
        end: "origin-top-right",
      },
    },
    defaultVariants: {
      size: "md",
      align: "center",
    },
  }
);

// ============================================
// Dropdown Content
// ============================================

interface DropdownContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof dropdownContentVariants> {}

const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownContentProps
>(
  ({ className, sideOffset = 4, size, align, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(dropdownContentVariants({ size, align }), className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
);
DropdownContent.displayName = DropdownMenuPrimitive.Content.displayName;

// ============================================
// Dropdown Item Variants
// ============================================

const dropdownItemVariants = cva(
  "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none " +
  "transition-colors duration-150 " +
  "focus:bg-sand-100 focus:text-sand-900 " +
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "text-sand-700",
        destructive: "text-rose-200 focus:bg-rose-100/50 focus:text-rose-200",
        accent: "text-primary focus:bg-peach-100/50",
      },
      inset: {
        true: "pl-8",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      inset: false,
    },
  }
);

// ============================================
// Dropdown Item
// ============================================

interface DropdownItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownItemVariants> {
  icon?: React.ReactNode;
  shortcut?: string;
}

const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownItemProps
>(
  ({ className, variant, inset, icon, shortcut, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(dropdownItemVariants({ variant, inset }), className)}
      {...props}
    >
      {icon && <span className="mr-2.5 flex-shrink-0 text-sand-500">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-2 text-xs tracking-wider text-sand-400">
          {shortcut}
        </span>
      )}
    </DropdownMenuPrimitive.Item>
  )
);
DropdownItem.displayName = DropdownMenuPrimitive.Item.displayName;

// ============================================
// Dropdown Checkbox Item
// ============================================

const DropdownCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-3 text-sm outline-none " +
      "transition-colors duration-150 " +
      "focus:bg-sand-100 focus:text-sand-900 " +
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

// ============================================
// Dropdown Radio Item
// ============================================

const DropdownRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-3 text-sm outline-none " +
      "transition-colors duration-150 " +
      "focus:bg-sand-100 focus:text-sand-900 " +
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-primary text-primary" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// ============================================
// Dropdown Label
// ============================================

const DropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-xs font-semibold text-sand-500 uppercase tracking-wider",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// ============================================
// Dropdown Separator
// ============================================

const DropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
DropdownSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// ============================================
// Dropdown Shortcut
// ============================================

const DropdownShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-wider text-sand-400",
        className
      )}
      {...props}
    />
  );
};
DropdownShortcut.displayName = "DropdownShortcut";

// ============================================
// Dropdown Sub Components
// ============================================

const DropdownSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none " +
      "transition-colors duration-150 " +
      "focus:bg-sand-100 focus:text-sand-900 " +
      "data-[state=open]:bg-sand-100",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4 text-sand-500" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-1 " +
      "text-popover-foreground shadow-soft-lg " +
      "data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out",
      className
    )}
    {...props}
  />
));
DropdownSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

// ============================================
// Action Dropdown - Specialized Component
// ============================================

interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onClick: () => void;
}

interface ActionDropdownProps {
  trigger: React.ReactNode;
  actions: ActionItem[];
  groups?: { label: string; actionIds: string[] }[];
  align?: "start" | "center" | "end";
  size?: "sm" | "md" | "lg";
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  trigger,
  actions,
  groups,
  align = "end",
  size = "md",
}) => {
  const renderAction = (action: ActionItem) => (
    <DropdownItem
      key={action.id}
      icon={action.icon}
      shortcut={action.shortcut}
      variant={action.variant}
      disabled={action.disabled}
      onClick={action.onClick}
    >
      {action.label}
    </DropdownItem>
  );

  const renderGroupedActions = () => {
    if (!groups) {
      return actions.map(renderAction);
    }

    return groups.map((group, groupIndex) => (
      <React.Fragment key={group.label}>
        {groupIndex > 0 && <DropdownSeparator />}
        <DropdownLabel>{group.label}</DropdownLabel>
        {group.actionIds
          .map((id) => actions.find((a) => a.id === id))
          .filter(Boolean)
          .map((action) => renderAction(action!))}
      </React.Fragment>
    ));
  };

  return (
    <Dropdown>
      <DropdownTrigger asChild>{trigger}</DropdownTrigger>
      <DropdownContent align={align} size={size}>
        {renderGroupedActions()}
      </DropdownContent>
    </Dropdown>
  );
};

// ============================================
// User Dropdown - Specialized Component
// ============================================

interface UserDropdownProps {
  trigger: React.ReactNode;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  trigger,
  userName,
  userEmail,
  userAvatar,
  onProfile,
  onSettings,
  onLogout,
}) => {
  return (
    <Dropdown>
      <DropdownTrigger asChild>{trigger}</DropdownTrigger>
      <DropdownContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-3 py-3">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-peach-100 flex items-center justify-center text-primary font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-sand-500 truncate">{userEmail}</p>
          </div>
        </div>
        <DropdownSeparator />
        {onProfile && (
          <DropdownItem onClick={onProfile}>Profile</DropdownItem>
        )}
        {onSettings && (
          <DropdownItem onClick={onSettings}>Settings</DropdownItem>
        )}
        <DropdownSeparator />
        {onLogout && (
          <DropdownItem variant="destructive" onClick={onLogout}>
            Log out
          </DropdownItem>
        )}
      </DropdownContent>
    </Dropdown>
  );
};

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownCheckboxItem,
  DropdownRadioItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownShortcut,
  DropdownGroup,
  DropdownPortal,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownRadioGroup,
  ActionDropdown,
  UserDropdown,
  dropdownContentVariants,
  dropdownItemVariants,
};

export type {
  DropdownContentProps,
  DropdownItemProps,
  ActionItem,
  ActionDropdownProps,
  UserDropdownProps,
};
