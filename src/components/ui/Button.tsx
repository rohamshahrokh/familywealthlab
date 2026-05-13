import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  [
    "inline-flex items-center justify-center gap-2 select-none",
    "font-medium tracking-tight whitespace-nowrap",
    "transition-[background,border-color,color,box-shadow,transform] duration-200 ease-calm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.985]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary — solid ink/charcoal button (Apple/Stripe), tiny lift on hover.
        primary: [
          "bg-ink-primary text-white",
          "shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_2px_rgba(16,24,40,0.10),0_8px_20px_-10px_rgba(16,24,40,0.35)]",
          "hover:bg-ink-secondary hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_2px_4px_rgba(16,24,40,0.12),0_12px_28px_-12px_rgba(16,24,40,0.45)]",
        ].join(" "),
        // Accent — steel-blue, used for the single hero/CTA action only.
        accent: [
          "bg-accent-500 text-white",
          "shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(16,24,40,0.10),0_8px_20px_-10px_rgba(62,106,149,0.45)]",
          "hover:bg-accent-600",
        ].join(" "),
        // Secondary — white surface, hairline border, looks like a Mac control.
        secondary: [
          "bg-white text-ink-primary border border-line",
          "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(16,24,40,0.04)]",
          "hover:bg-bg-inset hover:border-line-strong",
        ].join(" "),
        // Ghost — text only, soft hover.
        ghost: "text-ink-secondary hover:text-ink-primary hover:bg-bg-inset",
        // Link — pure text + chevron.
        link: "text-ink-primary hover:text-accent-500 underline-offset-4 hover:underline px-0 py-0",
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
