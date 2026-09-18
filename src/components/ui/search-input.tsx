import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  onClear?: () => void;
  shortcutHint?: string;
  size?: "sm" | "default";
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      shortcutHint,
      size = "default",
      placeholder = "Search…",
      "aria-label": ariaLabel = "Search",
      disabled,
      ...props
    },
    ref,
  ) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <div className="relative flex items-center w-full">
        <Search
          className={cn(
            "absolute left-3.5 text-[#666666] pointer-events-none shrink-0",
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          )}
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border border-[#E5E5E5] bg-white text-[#171717] placeholder:text-[#666666] font-medium transition-all shadow-xs",
            "focus-visible:outline-none focus-visible:border-[#AC313F] focus-visible:ring-2 focus-visible:ring-[#AC313F]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            size === "sm" ? "min-h-[36px] h-9 pl-9 pr-9 text-xs" : "min-h-[44px] h-11 pl-10 pr-10 text-sm",
            hasValue && "pr-10",
            className,
          )}
          {...props}
        />
        {hasValue && onClear && !disabled ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 p-1 rounded-md text-[#666666] hover:text-[#171717] hover:bg-[#F7F7F7] cursor-pointer transition-colors"
            aria-label="Clear search"
          >
            <X className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>
        ) : shortcutHint && !disabled ? (
          <div className="absolute right-3 pointer-events-none hidden sm:flex items-center">
            <kbd className="rounded border border-[#E5E5E5] bg-[#F7F7F7] px-1.5 py-0.5 text-[10px] font-bold text-[#666666] uppercase">
              {shortcutHint}
            </kbd>
          </div>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
