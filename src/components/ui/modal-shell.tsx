import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ModalShellProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
};

export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  size = "md",
  children,
  footer,
  className,
}: ModalShellProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Crisp solid backdrop without excessive blur */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full p-0",
            "bg-white dark:bg-[#252525] border border-[#E5E5E5] rounded-2xl shadow-2xl flex flex-col",
            "max-h-[90dvh] my-auto",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150",
            SIZE_CLASSES[size],
            className,
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-6">
              {Icon && (
                <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#AC313F] shrink-0">
                  <Icon className="w-4 h-4 text-[#AC313F]" />
                </div>
              )}
              <div className="min-w-0">
                <DialogPrimitive.Title className="text-base sm:text-lg font-bold text-[#171717] dark:text-white tracking-tight truncate">
                  {title}
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description className="text-xs text-[#666666] dark:text-white/60 mt-0.5 truncate">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
            </div>

            <DialogPrimitive.Close className="p-1.5 rounded-lg text-[#666666] hover:text-[#171717] hover:bg-[#F7F7F7] dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white cursor-pointer transition-colors shrink-0">
              <X className="w-4 h-4" />
              <span className="sr-only">Close modal</span>
            </DialogPrimitive.Close>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {children}
          </div>

          {/* Fixed Footer */}
          {footer && (
            <div className="px-6 py-3.5 border-t border-[#E5E5E5] bg-[#F7F7F7] dark:bg-[#171717] rounded-b-2xl flex items-center justify-end gap-2.5 shrink-0">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
