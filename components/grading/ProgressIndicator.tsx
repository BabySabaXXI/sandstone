"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  className,
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="relative h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 h-full rounded-full gradient-primary"
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300",
                  isActive
                    ? "bg-[#E8D5C4] text-[#2D2D2D]"
                    : "bg-[#F0F0EC] text-[#8A8A8A]"
                )}
                animate={
                  isCurrent
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(232, 213, 196, 0.4)",
                          "0 0 0 8px rgba(232, 213, 196, 0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: isCurrent ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                {stepNumber}
              </motion.div>
              {stepLabels && stepLabels[index] && (
                <span
                  className={cn(
                    "text-xs mt-1.5 transition-colors duration-300",
                    isActive ? "text-[#2D2D2D]" : "text-[#8A8A8A]"
                  )}
                >
                  {stepLabels[index]}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface StepProgressProps {
  steps: {
    id: string;
    label: string;
    status: "pending" | "in-progress" | "complete";
  }[];
  className?: string;
}

export function StepProgress({ steps, className }: StepProgressProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
            step.status === "complete" && "bg-[#A8C5A8]/10",
            step.status === "in-progress" && "bg-[#E8D5C4]/20",
            step.status === "pending" && "bg-[#F5F5F0]"
          )}
        >
          {/* Status Icon */}
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
              step.status === "complete" && "bg-[#A8C5A8]",
              step.status === "in-progress" && "bg-[#E8D5C4] animate-pulse",
              step.status === "pending" && "bg-[#E5E5E0]"
            )}
          >
            {step.status === "complete" && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {step.status === "in-progress" && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
            {step.status === "pending" && (
              <div className="w-2 h-2 bg-[#8A8A8A] rounded-full" />
            )}
          </div>

          {/* Label */}
          <span
            className={cn(
              "text-sm transition-colors duration-300",
              step.status === "complete" && "text-[#2D2D2D] font-medium",
              step.status === "in-progress" && "text-[#2D2D2D]",
              step.status === "pending" && "text-[#8A8A8A]"
            )}
          >
            {step.label}
          </span>

          {/* Progress Indicator */}
          {step.status === "in-progress" && (
            <motion.div
              className="ml-auto flex gap-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-[#E8D5C4] rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
