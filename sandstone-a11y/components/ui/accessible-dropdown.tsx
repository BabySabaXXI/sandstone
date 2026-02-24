"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
}

interface DropdownSection {
  title?: string;
  items: DropdownItem[];
}

interface AccessibleDropdownProps {
  trigger: React.ReactNode;
  sections: DropdownSection[];
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export function AccessibleDropdown({
  trigger,
  sections,
  align = "left",
  className,
  menuClassName,
  onOpen,
  onClose,
}: AccessibleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

  // Flatten items for keyboard navigation
  const allItems = sections.flatMap((section) => section.items);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
    // Focus first item after opening
    setTimeout(() => {
      setActiveIndex(0);
      itemRefs.current[0]?.focus();
    }, 50);
  }, [onOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    onClose?.();
    // Return focus to trigger
    triggerRef.current?.focus();
  }, [onClose]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleOpen, handleClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        handleClose();
        break;

      case "ArrowDown":
        e.preventDefault();
        const nextIndex = activeIndex < allItems.length - 1 ? activeIndex + 1 : 0;
        setActiveIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
        break;

      case "ArrowUp":
        e.preventDefault();
        const prevIndex = activeIndex > 0 ? activeIndex - 1 : allItems.length - 1;
        setActiveIndex(prevIndex);
        itemRefs.current[prevIndex]?.focus();
        break;

      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        itemRefs.current[0]?.focus();
        break;

      case "End":
        e.preventDefault();
        const lastIndex = allItems.length - 1;
        setActiveIndex(lastIndex);
        itemRefs.current[lastIndex]?.focus();
        break;

      case "Tab":
        // Close on tab out
        handleClose();
        break;
    }
  }, [isOpen, activeIndex, allItems.length, handleOpen, handleClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClose]);

  let itemCounter = 0;

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "dropdown-menu" : undefined}
        className="focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:ring-offset-2 rounded-lg"
      >
        {trigger}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id="dropdown-menu"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            role="menu"
            aria-orientation="vertical"
            className={cn(
              "absolute z-50 min-w-[200px] bg-white dark:bg-[#2D2D2D] rounded-xl shadow-lg border border-[#E5E5E0] dark:border-[#3D3D3D] py-1",
              align === "right" ? "right-0" : "left-0",
              menuClassName
            )}
          >
            {sections.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                {section.title && (
                  <div 
                    className="px-3 py-2 text-xs font-medium text-[#8A8A8A] uppercase tracking-wider"
                    role="presentation"
                  >
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const currentIndex = itemCounter++;
                  const ItemComponent = item.href ? "a" : "button";

                  return (
                    <ItemComponent
                      key={item.id}
                      ref={(el: HTMLButtonElement | HTMLAnchorElement | null) => {
                        itemRefs.current[currentIndex] = el;
                      }}
                      role="menuitem"
                      href={item.href}
                      onClick={() => {
                        if (!item.disabled) {
                          item.onClick?.();
                          handleClose();
                        }
                      }}
                      disabled={item.disabled}
                      tabIndex={currentIndex === activeIndex ? 0 : -1}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left flex items-center gap-2 transition-colors",
                        "hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] focus:outline-none focus:bg-[#F5F5F0] dark:focus:bg-[#3D3D3D]",
                        item.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {item.icon && (
                        <span className="w-4 h-4 text-[#8A8A8A]" aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <kbd className="text-xs text-[#8A8A8A] bg-[#F5F5F0] dark:bg-[#3D3D3D] px-1.5 py-0.5 rounded">
                          {item.shortcut}
                        </kbd>
                      )}
                    </ItemComponent>
                  );
                })}
                {sectionIndex < sections.length - 1 && (
                  <div 
                    className="my-1 border-t border-[#E5E5E0] dark:border-[#3D3D3D]"
                    role="separator"
                  />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Menu Button component
interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
}

export function MenuButton({
  icon,
  label,
  shortcut,
  className,
  ...props
}: MenuButtonProps) {
  return (
    <button
      role="menuitem"
      className={cn(
        "w-full px-3 py-2 text-sm text-left flex items-center gap-2 transition-colors",
        "hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] focus:outline-none focus:bg-[#F5F5F0] dark:focus:bg-[#3D3D3D]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="w-4 h-4 text-[#8A8A8A]" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="text-xs text-[#8A8A8A] bg-[#F5F5F0] dark:bg-[#3D3D3D] px-1.5 py-0.5 rounded">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
