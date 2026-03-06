import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "indigo" | "emerald" | "amber" | "rose";
}

export function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  className,
  color = "indigo"
}: SummaryCardProps) {
  
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className={cn("bg-white rounded-xl p-6 shadow-sm border border-gray-100", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={cn("p-2 rounded-lg", colorStyles[color])}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn("text-xs font-medium mt-1 flex items-center gap-1", 
              trendUp ? "text-emerald-600" : "text-rose-600"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
