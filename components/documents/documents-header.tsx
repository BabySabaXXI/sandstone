/**
 * Documents Header Component
 * 
 * Server Component for the documents page header.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Folder } from "lucide-react";

/**
 * Documents Header Component
 */
export function DocumentsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-1">
          Manage your study materials and resources
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2">
          <Folder className="w-4 h-4" />
          New Folder
        </Button>
        <Button className="gap-2" asChild>
          <Link href="/documents/upload">
            <Plus className="w-4 h-4" />
            Upload
          </Link>
        </Button>
      </div>
    </div>
  );
}
