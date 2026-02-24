/**
 * Library Header Component
 * 
 * Server Component for the library page header.
 */

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Library Header Component
 */
export function LibraryHeader() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground mt-1">
          Browse curated study resources and materials
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          className="pl-10"
        />
      </div>
      
      {/* Subject Filters */}
      <div className="flex gap-2 flex-wrap">
        <SubjectFilter href="/library" label="All" />
        <SubjectFilter href="/library?subject=economics" label="Economics" />
        <SubjectFilter href="/library?subject=geography" label="Geography" />
      </div>
    </div>
  );
}

/**
 * Subject Filter Link
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

function SubjectFilter({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
