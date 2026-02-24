"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "peer h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-200 transition-colors checked:bg-blue-500",
        className
      )}
      {...props}
    />
  );
}
