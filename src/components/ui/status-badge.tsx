import * as React from "react";
import { cn } from "@/lib/utils";

export type OperationalStatus =
  | "received"
  | "booked"
  | "in_progress"
  | "in progress"
  | "awaiting_parts"
  | "awaiting parts"
  | "ready"
  | "completed"
  | "paid"
  | "unpaid"
  | "partial"
  | "cancelled"
  | "void"
  | "sold"
  | "in_stock"
  | "in stock"
  | "low_stock"
  | "low stock"
  | "out_of_stock"
  | "out of stock"
  | string;

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OperationalStatus;
  label?: string;
  dot?: boolean;
  size?: "sm" | "default";
}

interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

function normalizeStatus(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function getStatusConfig(status: string, customLabel?: string): StatusConfig {
  const norm = normalizeStatus(status);

  // Success green: completed, paid, ready, in_stock, sold
  if (["completed", "paid", "ready", "in_stock", "sold"].includes(norm)) {
    const defaultLabels: Record<string, string> = {
      completed: "Completed",
      paid: "Paid",
      ready: "Ready for Pickup",
      in_stock: "In Stock",
      sold: "Sold",
    };
    return {
      label: customLabel || defaultLabels[norm] || status,
      badgeClass: "bg-[#10B981]/10 text-[#059669] border-[#10B981]/30",
      dotClass: "bg-[#10B981]",
    };
  }

  // Warning amber: in_progress, awaiting_parts, booked, partial, low_stock
  if (["in_progress", "awaiting_parts", "booked", "partial", "low_stock"].includes(norm)) {
    const defaultLabels: Record<string, string> = {
      in_progress: "In Progress",
      awaiting_parts: "Awaiting Parts",
      booked: "Booked",
      partial: "Partially Paid",
      low_stock: "Low Stock",
    };
    return {
      label: customLabel || defaultLabels[norm] || status,
      badgeClass: "bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/30",
      dotClass: "bg-[#F59E0B]",
    };
  }

  // Danger red: cancelled, void, out_of_stock, unpaid
  if (["cancelled", "void", "voided", "out_of_stock", "unpaid"].includes(norm)) {
    const defaultLabels: Record<string, string> = {
      cancelled: "Cancelled",
      void: "Voided",
      voided: "Voided",
      out_of_stock: "Out of Stock",
      unpaid: "Unpaid",
    };
    return {
      label: customLabel || defaultLabels[norm] || status,
      badgeClass: "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30",
      dotClass: "bg-[#DC2626]",
    };
  }

  // Brand primary: special, warranty, urgent
  if (["urgent", "warranty", "express", "trade_in"].includes(norm)) {
    const defaultLabels: Record<string, string> = {
      urgent: "Urgent Repair",
      warranty: "Under Warranty",
      express: "Express Turnaround",
      trade_in: "Trade-In",
    };
    return {
      label: customLabel || defaultLabels[norm] || status,
      badgeClass: "bg-[#AC313F]/10 text-[#AC313F] border-[#AC313F]/30",
      dotClass: "bg-[#AC313F]",
    };
  }

  // Neutral / default: received, pending, active, other
  const defaultLabels: Record<string, string> = {
    received: "Received / Check-in",
    pending: "Pending",
  };
  return {
    label: customLabel || defaultLabels[norm] || status,
    badgeClass: "bg-[#171717]/5 text-[#171717] border-[#E5E5E5]",
    dotClass: "bg-[#171717]",
  };
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, label, dot = true, size = "default", className, ...props }, ref) => {
    const config = getStatusConfig(status, label);

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border transition-colors",
          size === "sm"
            ? "text-[10px] px-2 py-0.5 leading-none"
            : "text-[11px] px-2.5 py-1 leading-tight",
          config.badgeClass,
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "rounded-full shrink-0",
              size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
              config.dotClass,
            )}
            aria-hidden="true"
          />
        )}
        <span>{config.label}</span>
      </span>
    );
  },
);

StatusBadge.displayName = "StatusBadge";
