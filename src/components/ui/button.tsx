import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AC313F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-[#782939] border border-transparent",
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-[#782939] border border-transparent",
        destructive:
          "bg-[#DC2626] text-white shadow-xs hover:bg-[#B91C1C] border border-transparent",
        outline:
          "border border-[#E5E5E5] bg-white text-[#171717] shadow-xs hover:bg-[#F7F7F7] hover:border-[#AC313F] hover:text-[#AC313F]",
        secondary:
          "bg-[#171717] text-white shadow-xs hover:bg-[#252525] border border-transparent",
        ghost: "text-[#171717] hover:bg-[#F7F7F7] hover:text-[#AC313F]",
        link: "text-[#AC313F] underline-offset-4 hover:underline hover:text-[#782939]",
      },
      size: {
        default: "min-h-[44px] h-11 px-4 py-2",
        sm: "min-h-[36px] h-9 rounded-md px-3 text-xs",
        lg: "min-h-[48px] h-12 rounded-lg px-8 text-base",
        icon: "min-h-[44px] min-w-[44px] h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
