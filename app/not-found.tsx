"use client";

import { motion } from "framer-motion";
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { errorLogger } from "@/lib/error-handling/error-logger";

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Log 404 errors for monitoring
  useState(() => {
    errorLogger.log(new Error("Page not found"), {
      additionalData: {
        url: window.location.href,
        source: "404 Not Found",
      },
    });
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* 404 Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto">
              <FileQuestion className="w-16 h-16 text-muted-foreground" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center shadow-soft"
            >
              <span className="text-lg font-bold text-muted-foreground">404</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for what you need..."
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </motion.form>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-6 py-3 rounded-xl hover:bg-muted transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/grade"
              className="px-4 py-2 bg-muted rounded-lg text-sm text-foreground hover:bg-muted/80 transition-colors"
            >
              Grade Response
            </Link>
            <Link
              href="/flashcards"
              className="px-4 py-2 bg-muted rounded-lg text-sm text-foreground hover:bg-muted/80 transition-colors"
            >
              Flashcards
            </Link>
            <Link
              href="/documents"
              className="px-4 py-2 bg-muted rounded-lg text-sm text-foreground hover:bg-muted/80 transition-colors"
            >
              Documents
            </Link>
            <Link
              href="/library"
              className="px-4 py-2 bg-muted rounded-lg text-sm text-foreground hover:bg-muted/80 transition-colors"
            >
              Library
            </Link>
          </div>
        </motion.div>

        {/* Error Reference */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-xs text-muted-foreground"
        >
          Error Reference: 404-{Date.now().toString(36).toUpperCase()}
        </motion.p>
      </motion.div>
    </div>
  );
}
