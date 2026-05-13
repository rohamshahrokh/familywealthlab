"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "text-sm font-medium tracking-tight",
    "transition-all duration-300 ease-cinematic",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-accent text-white",
          "shadow-[0_8px_24px_-8px_rgba(255,107,0,0.55),0_0_0_1px_rgba(255,200,150,0.18)_inset]",
          "hover:brightness-110 hover:-translate-y-[1px]",
          "active:translate-y-0 active:brightness-95",
        ].join(" "),
        secondary: [
          "bg-white/[0.04] text-ink-100",
          "ring-1 ring-inset ring-white/10",
          "hover:bg-white/[0.07] hover:ring-white/20",
          "backdrop-blur-sm",
        ].join(" "),
        ghost: "text-ink-200 hover:text-ink-50 hover:bg-white/[0.04]",
        link: "text-ink-100 underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-[15px]",
        xl: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
