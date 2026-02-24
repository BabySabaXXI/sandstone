"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/stores/progress-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StudyHeatmapProps {
  days?: number;
  className?: string;
  showLegend?: boolean;
  title?: string;
}

const intensityColors = [
  "bg-muted",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-400",
  "bg-emerald-500",
  "bg-emerald-600",
];

const intensityColorsDark = [
  "bg-muted",
  "bg-emerald-900/40",
  "bg-emerald-800/50",
  "bg-emerald-700/60",
  "bg-emerald-600/70",
  "bg-emerald-500/80",
];

export const StudyHeatmap = memo(function StudyHeatmap({
  days = 84,
  className,
  showLegend = true,
  title = "Study Activity",
}: StudyHeatmapProps) {
  const heatmapData = useProgressStore((state) => state.getStudyHeatmap(days));

  const weeks = useMemo(() => {
    const result: typeof heatmapData[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      result.push(heatmapData.slice(i, i + 7));
    }
    return result;
  }, [heatmapData]);

  const monthLabels = useMemo(() => {
    const labels: { weekIndex: number; label: string }[] = [];
    let currentMonth = "";

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const date = new Date(firstDay.date);
        const month = date.toLocaleDateString("en-US", { month: "short" });
        if (month !== currentMonth) {
          labels.push({ weekIndex, label: month });
          currentMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {title}
        </h3>
      )}

      <div className="space-y-2">
        {/* Month labels */}
        <div className="flex gap-1 ml-8">
          {monthLabels.map((month, index) => (
            <span
              key={index}
              className="text-xs text-muted-foreground"
              style={{
                position: "absolute",
                left: `${month.weekIndex * 20 + 32}px`,
              }}
            >
              {month.label}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2">
            {dayLabels.map((day, index) => (
              <span
                key={day}
                className="text-xs text-muted-foreground w-6 h-3 flex items-center justify-end"
              >
                {index % 2 === 0 ? day.slice(0, 1) : ""}
              </span>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <TooltipProvider key={dayIndex} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: (weekIndex * 7 + dayIndex) * 0.002,
                            duration: 0.2,
                          }}
                          className={cn(
                            "w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary",
                            intensityColors[day.intensity],
                            "dark:" + intensityColorsDark[day.intensity]
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-muted-foreground">
                          {day.count === 0
                            ? "No cards studied"
                            : `${day.count} card${day.count !== 1 ? "s" : ""} studied`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    intensityColors[i],
                    "dark:" + intensityColorsDark[i]
                  )}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default StudyHeatmap;
