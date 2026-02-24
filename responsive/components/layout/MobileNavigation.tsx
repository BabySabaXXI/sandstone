"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  GraduationCap,
  Layers,
  Brain,
  FileText,
  BookOpen,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: GraduationCap, label: "Grade", href: "/grade" },
  { icon: Layers, label: "Cards", href: "/flashcards" },
  { icon: Brain, label: "Quiz", href: "/quiz" },
  { icon: BookOpen, label: "Library", href: "/library" },
];

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-fixed",
        "bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-lg",
        "border-t border-[#E8E8E3] dark:border-[#2A2A2A]",
        "lg:hidden",
        className
      )}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center",
                "w-full h-full relative",
                "touch-target-sm",
                "active:scale-95 transition-transform duration-150"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-[#E8D5C4] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive
                    ? "text-[#E8D5C4]"
                    : "text-[#8A8A8A] dark:text-[#707070]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-colors duration-200",
                  isActive
                    ? "text-[#2D2D2D] dark:text-white"
                    : "text-[#8A8A8A] dark:text-[#707070]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
