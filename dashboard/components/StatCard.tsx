'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color,
  delay = 0 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: 'spring',
        stiffness: 100 
      }}
    >
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
        {/* Background gradient */}
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-500 group-hover:scale-150",
          color
        )} />
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
              {trend && trend !== 'neutral' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.2 }}
                  className={cn(
                    "flex items-center gap-1 mt-2 text-sm font-medium",
                    trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{trendValue}</span>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.1 }}
              className={cn(
                "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                color.replace('bg-', 'bg-opacity-15 bg-')
              )}
            >
              <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default StatCard;
