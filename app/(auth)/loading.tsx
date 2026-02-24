"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Auth route group loading component.
 * Simple loading spinner for auth pages.
 */
export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-accent" />
        </motion.div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </motion.div>
    </div>
  );
}
