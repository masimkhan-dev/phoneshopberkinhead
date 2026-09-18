import * as React from "react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";

export function TableShellContainer({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-[#E5E5E5] bg-white shadow-xs overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="w-full overflow-x-auto scrollbar-thin">{children}</div>
    </div>
  );
}

export function TableShell({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full text-left border-collapse text-sm", className)}
      {...props}
    />
  );
}

export function TableShellHeader({
  className,
  sticky = true,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }) {
  return (
    <thead
      className={cn(
        "border-b border-[#E5E5E5] bg-[#F7F7F7] text-xs font-bold uppercase tracking-wider text-[#666666]",
        sticky && "sticky top-0 z-10",
        className,
      )}
      {...props}
    />
  );
}

export function TableShellTh({
  className,
  align = "left",
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 whitespace-nowrap font-bold select-none",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}

export function TableShellRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-[#E5E5E5] transition-colors hover:bg-[#F7F7F7]/60 min-h-[44px]",
        className,
      )}
      {...props}
    />
  );
}

export function TableShellCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 align-middle text-[#171717]", className)}
      {...props}
    />
  );
}

export function TableShellNumericCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle font-mono tabular-nums text-right font-medium text-[#171717]",
        className,
      )}
      {...props}
    />
  );
}

export function TableShellActionCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle text-right whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function TableShellLoading({
  rows = 5,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="p-6">
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  );
}

export function TableShellEmpty({
  title = "No records found",
  description = "There are no matching items for this query or filter.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
      <EmptyState title={title} description={description} />
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
