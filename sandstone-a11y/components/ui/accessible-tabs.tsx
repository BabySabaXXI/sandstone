"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccessibleTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabListClassName?: string;
  tabPanelClassName?: string;
}

export function AccessibleTabs({
  tabs,
  defaultTab,
  onChange,
  className,
  tabListClassName,
  tabPanelClassName,
}: AccessibleTabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const enabledIndex = enabledTabs.findIndex((t) => t.id === tabs[index].id);
    const enabledCount = enabledTabs.length;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        const nextEnabledIndex = (enabledIndex + 1) % enabledCount;
        const nextTab = enabledTabs[nextEnabledIndex];
        handleTabChange(nextTab.id);
        // Focus the new tab
        const nextTabIndex = tabs.findIndex((t) => t.id === nextTab.id);
        tabRefs.current[nextTabIndex]?.focus();
        break;

      case "ArrowLeft":
        e.preventDefault();
        const prevEnabledIndex = (enabledIndex - 1 + enabledCount) % enabledCount;
        const prevTab = enabledTabs[prevEnabledIndex];
        handleTabChange(prevTab.id);
        // Focus the new tab
        const prevTabIndex = tabs.findIndex((t) => t.id === prevTab.id);
        tabRefs.current[prevTabIndex]?.focus();
        break;

      case "Home":
        e.preventDefault();
        const firstEnabled = enabledTabs[0];
        handleTabChange(firstEnabled.id);
        const firstTabIndex = tabs.findIndex((t) => t.id === firstEnabled.id);
        tabRefs.current[firstTabIndex]?.focus();
        break;

      case "End":
        e.preventDefault();
        const lastEnabled = enabledTabs[enabledCount - 1];
        handleTabChange(lastEnabled.id);
        const lastTabIndex = tabs.findIndex((t) => t.id === lastEnabled.id);
        tabRefs.current[lastTabIndex]?.focus();
        break;
    }
  }, [tabs, handleTabChange]);

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-label="Tabs"
        className={cn(
          "flex border-b border-[#E5E5E0] dark:border-[#3D3D3D]",
          tabListClassName
        )}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            aria-disabled={tab.disabled}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={activeTabId === tab.id ? 0 : -1}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E8D5C4]",
              activeTabId === tab.id
                ? "text-[#2D2D2D] dark:text-white"
                : "text-[#8A8A8A] hover:text-[#5A5A5A] dark:hover:text-[#A0A0A0]",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.label}
            {activeTabId === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8D5C4]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTabId}`}
        aria-labelledby={`tab-${activeTabId}`}
        className={cn("py-4", tabPanelClassName)}
      >
        {activeTab?.content}
      </div>
    </div>
  );
}

// Vertical Tabs variant
interface AccessibleVerticalTabsProps extends AccessibleTabsProps {
  sidebarClassName?: string;
}

export function AccessibleVerticalTabs({
  tabs,
  defaultTab,
  onChange,
  className,
  sidebarClassName,
  tabPanelClassName,
}: AccessibleVerticalTabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const enabledIndex = enabledTabs.findIndex((t) => t.id === tabs[index].id);
    const enabledCount = enabledTabs.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        const nextEnabledIndex = (enabledIndex + 1) % enabledCount;
        const nextTab = enabledTabs[nextEnabledIndex];
        handleTabChange(nextTab.id);
        const nextTabIndex = tabs.findIndex((t) => t.id === nextTab.id);
        tabRefs.current[nextTabIndex]?.focus();
        break;

      case "ArrowUp":
        e.preventDefault();
        const prevEnabledIndex = (enabledIndex - 1 + enabledCount) % enabledCount;
        const prevTab = enabledTabs[prevEnabledIndex];
        handleTabChange(prevTab.id);
        const prevTabIndex = tabs.findIndex((t) => t.id === prevTab.id);
        tabRefs.current[prevTabIndex]?.focus();
        break;

      case "Home":
        e.preventDefault();
        const firstEnabled = enabledTabs[0];
        handleTabChange(firstEnabled.id);
        const firstTabIndex = tabs.findIndex((t) => t.id === firstEnabled.id);
        tabRefs.current[firstTabIndex]?.focus();
        break;

      case "End":
        e.preventDefault();
        const lastEnabled = enabledTabs[enabledCount - 1];
        handleTabChange(lastEnabled.id);
        const lastTabIndex = tabs.findIndex((t) => t.id === lastEnabled.id);
        tabRefs.current[lastTabIndex]?.focus();
        break;
    }
  }, [tabs, handleTabChange]);

  return (
    <div className={cn("flex gap-6", className)}>
      {/* Sidebar */}
      <div
        role="tablist"
        aria-label="Tabs"
        aria-orientation="vertical"
        className={cn(
          "w-48 flex flex-col border-r border-[#E5E5E0] dark:border-[#3D3D3D]",
          sidebarClassName
        )}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            aria-disabled={tab.disabled}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={activeTabId === tab.id ? 0 : -1}
            className={cn(
              "relative px-4 py-3 text-sm font-medium text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E8D5C4] rounded-lg",
              activeTabId === tab.id
                ? "bg-[#E8D5C4]/20 text-[#2D2D2D] dark:text-white"
                : "text-[#8A8A8A] hover:text-[#5A5A5A] dark:hover:text-[#A0A0A0] hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D]",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTabId}`}
        aria-labelledby={`tab-${activeTabId}`}
        className={cn("flex-1", tabPanelClassName)}
      >
        {activeTab?.content}
      </div>
    </div>
  );
}
