import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  [
    "inline-flex items-center justify-center gap-2 select-none",
    "font-medium tracking-tight whitespace-nowrap",
    "transition-[background,border-color,color,box-shadow,transform] duration-200 ease-calm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.985]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary — solid ink-navy, hover blooms into ember.
        primary: [
          "bg-ink-primary text-white",
          "shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_1px_2px_rgba(11,15,26,0.10),0_8px_20px_-10px_rgba(11,15,26,0.40)]",
          "hover:bg-graphite-800",
          "hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_2px_4px_rgba(11,15,26,0.14),0_10px_24px_-10px_rgba(226,111,45,0.40),0_0_0_1px_rgba(226,111,45,0.18)]",
        ].join(" "),
        // Ember — full warm CTA. Reserved for one place per page.
        ember: [
          "bg-ember-500 text-white",
          "shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_1px_2px_rgba(11,15,26,0.10),0_8px_20px_-10px_rgba(226,111,45,0.55)]",
          "hover:bg-ember-600",
          "hover:shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_2px_4px_rgba(11,15,26,0.12),0_12px_28px_-10px_rgba(226,111,45,0.65)]",
        ].join(" "),
        // Accent — steel-navy
        accent: [
          "bg-accent-500 text-white",
          "shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(11,15,26,0.10),0_8px_20px_-10px_rgba(52,70,106,0.45)]",
          "hover:bg-accent-600",
        ].join(" "),
        // Secondary — white surface, hairline border.
        secondary: [
          "bg-white text-ink-primary border border-line",
          "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(11,15,26,0.04)]",
          "hover:bg-bg-inset hover:border-line-strong",
        ].join(" "),
        // Dark variant — for sections on dark bg
        ondark: [
          "bg-white text-ink-primary",
          "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(11,15,26,0.10),0_8px_20px_-10px_rgba(11,15,26,0.40)]",
          "hover:bg-bg-inset",
        ].join(" "),
        // Ghost — text only
        ghost: "text-ink-secondary hover:text-ink-primary hover:bg-bg-inset",
        ghostDark: "text-ink-ondarkSecondary hover:text-ink-ondark hover:bg-white/5",
        // Link — pure text + chevron
        link: "text-ink-primary hover:text-ember-500 underline-offset-4 hover:underline px-0 py-0",
      },
      size: {
        sm: "h-9 px-3.5 text-[0.875rem] leading-[1.55] rounded-full",
        md: "h-10 px-4 text-[0.875rem] leading-[1.55] rounded-full",
        lg: "h-11 px-5 text-[0.95rem] leading-[1.55] rounded-full",
        xl: "h-12 px-6 text-[1rem] leading-[1.55] rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(button({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
