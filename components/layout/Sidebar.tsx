"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Library,
  Settings,
  GraduationCap,
  Layers,
  Brain,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: GraduationCap, label: "Grade", href: "/grade" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Layers, label: "Flashcards", href: "/flashcards" },
  { icon: Brain, label: "Quiz", href: "/quiz" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      router.push("/login");
    }
  };

  return (
    <motion.aside
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-16 h-screen bg-card border-r border-border flex flex-col items-center py-4 fixed left-0 top-0 z-50"
    >
      {/* Logo */}
      <Link href="/">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-8 cursor-pointer hover:shadow-soft transition-shadow">
          <span className="text-accent-foreground font-bold text-lg">S</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <span className="absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Auth Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto"
      >
        <button
          onClick={handleAuthClick}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {user ? (
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs font-bold text-accent-foreground">
                  {user.email?.[0].toUpperCase() || "U"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          
          {/* Tooltip */}
          <span className="absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {user ? "Sign Out" : "Sign In"}
          </span>
        </button>
      </motion.div>
    </motion.aside>
  );
}
