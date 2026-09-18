import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onWheel, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3.5 py-2 text-sm text-[#171717] shadow-xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#666666] focus-visible:outline-none focus-visible:border-[#AC313F] focus-visible:ring-2 focus-visible:ring-[#AC313F]/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onWheel={(e) => {
          if (type === "number") {
            (e.target as HTMLElement).blur();
          }
          onWheel?.(e);
        }}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
