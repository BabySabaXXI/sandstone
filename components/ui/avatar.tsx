"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as AvatarPrimitives from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

/**
 * Avatar Component
 * 
 * An avatar component built on Radix UI Avatar primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Avatar>
 *   <AvatarImage src="https://example.com/avatar.jpg" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 */

// ============================================
// Avatar Variants
// ============================================

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
        "3xl": "h-24 w-24",
      },
      variant: {
        default: "",
        bordered: "ring-2 ring-border ring-offset-2",
        squared: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// ============================================
// Avatar Component
// ============================================

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitives.Root>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitives.Root>,
  AvatarProps
>(
  ({ className, size, variant, ...props }, ref) => (
    <AvatarPrimitives.Root
      ref={ref}
      className={cn(avatarVariants({ size, variant }), className)}
      {...props}
    />
  )
);
Avatar.displayName = AvatarPrimitives.Root.displayName;

// ============================================
// Avatar Image
// ============================================

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitives.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitives.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitives.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitives.Image.displayName;

// ============================================
// Avatar Fallback
// ============================================

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full bg-sand-200 font-medium text-sand-700",
  {
    variants: {
      size: {
        xs: "text-[10px]",
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
        "3xl": "text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitives.Fallback>,
    VariantProps<typeof avatarFallbackVariants> {}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitives.Fallback>,
  AvatarFallbackProps
>(
  ({ className, size, ...props }, ref) => (
    <AvatarPrimitives.Fallback
      ref={ref}
      className={cn(avatarFallbackVariants({ size }), className)}
      {...props}
    />
  )
);
AvatarFallback.displayName = AvatarPrimitives.Fallback.displayName;

// ============================================
// User Avatar - Complete User Avatar with Status
// ============================================

interface UserAvatarProps extends AvatarProps {
  src?: string;
  name: string;
  email?: string;
  status?: "online" | "offline" | "away" | "busy";
  showStatus?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  email,
  status = "offline",
  showStatus = false,
  size = "md",
  className,
  ...props
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statusColors = {
    online: "bg-sage-300",
    offline: "bg-sand-400",
    away: "bg-amber-300",
    busy: "bg-rose-300",
  };

  const statusSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-3.5 h-3.5",
    "2xl": "w-4 h-4",
    "3xl": "w-5 h-5",
  };

  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <Avatar size={size}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback size={size}>{initials}</AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
};

// ============================================
// Avatar Group - Multiple Avatars
// ============================================

interface AvatarGroupItem {
  id: string;
  src?: string;
  name: string;
}

interface AvatarGroupProps {
  avatars: AvatarGroupItem[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  overlap?: boolean;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = "md",
  className,
  overlap = true,
}) => {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapSizes = {
    xs: "-space-x-1",
    sm: "-space-x-2",
    md: "-space-x-3",
    lg: "-space-x-3",
    xl: "-space-x-4",
  };

  return (
    <div
      className={cn(
        "flex items-center",
        overlap && overlapSizes[size],
        className
      )}
    >
      {displayAvatars.map((avatar, index) => (
        <div
          key={avatar.id}
          className={cn(
            "relative inline-block",
            overlap && index > 0 && "ring-2 ring-white"
          )}
          style={{ zIndex: displayAvatars.length - index }}
        >
          <UserAvatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "relative inline-flex items-center justify-center rounded-full bg-sand-200 text-sand-700 font-medium ring-2 ring-white",
            avatarVariants({ size })
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// ============================================
// Avatar with Details - Name and Role
// ============================================

interface AvatarWithDetailsProps extends UserAvatarProps {
  role?: string;
  subtitle?: string;
  layout?: "horizontal" | "vertical";
}

const AvatarWithDetails: React.FC<AvatarWithDetailsProps> = ({
  name,
  role,
  subtitle,
  layout = "horizontal",
  size = "md",
  ...avatarProps
}) => {
  if (layout === "vertical") {
    return (
      <div className="flex flex-col items-center text-center">
        <UserAvatar name={name} size={size} {...avatarProps} />
        <div className="mt-2">
          <p className="font-medium text-foreground">{name}</p>
          {(role || subtitle) && (
            <p className="text-sm text-sand-500">{role || subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <UserAvatar name={name} size={size} {...avatarProps} />
      <div>
        <p className="font-medium text-foreground">{name}</p>
        {(role || subtitle) && (
          <p className="text-sm text-sand-500">{role || subtitle}</p>
        )}
      </div>
    </div>
  );
};

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserAvatar,
  AvatarGroup,
  AvatarWithDetails,
  avatarVariants,
  avatarFallbackVariants,
};

export type {
  AvatarProps,
  AvatarFallbackProps,
  UserAvatarProps,
  AvatarGroupItem,
  AvatarGroupProps,
  AvatarWithDetailsProps,
};
