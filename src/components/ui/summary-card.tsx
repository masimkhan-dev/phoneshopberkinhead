import * as React from "react";
import { cn } from "@/lib/utils";

export interface SummaryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: "brand" | "success" | "warning" | "danger" | "neutral";
  action?: React.ReactNode;
}

const ACCENT_BORDER_CLASSES: Record<NonNullable<SummaryCardProps["accentColor"]>, string> = {
  brand: "border-l-4 border-l-[#AC313F]",
  success: "border-l-4 border-l-[#10B981]",
  warning: "border-l-4 border-l-[#F59E0B]",
  danger: "border-l-4 border-l-[#DC2626]",
  neutral: "border-l-4 border-l-[#171717]",
};

export const SummaryCard = React.forwardRef<HTMLDivElement, SummaryCardProps>(
  (
    {
      label,
      value,
      subtitle,
      trend,
      icon: Icon,
      accentColor = "brand",
      action,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between hover:shadow-sm",
          ACCENT_BORDER_CLASSES[accentColor],
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-bold text-[#666666] uppercase tracking-wider leading-snug truncate">
            {label}
          </div>
          {Icon ? (
            <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#171717] shrink-0">
              <Icon className="w-4 h-4 text-[#AC313F]" />
            </div>
          ) : action ? (
            <div className="shrink-0">{action}</div>
          ) : null}
        </div>

        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#171717] font-mono tabular-nums tracking-tight truncate">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-[#666666] truncate">
            {trend && (
              <span
                className={cn(
                  "font-bold font-mono",
                  trend.positive ? "text-[#059669]" : "text-[#DC2626]",
                )}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    );
  },
);

SummaryCard.displayName = "SummaryCard";
