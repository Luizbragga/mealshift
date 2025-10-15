// components/ui/toggle.tsx
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Variants
export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "hover:bg-muted hover:text-muted-foreground " +
    "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "bg-transparent hover:bg-accent/50", // opcional, útil no dia a dia
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Types
export type ToggleProps = React.ComponentPropsWithoutRef<
  typeof TogglePrimitive.Root
> &
  VariantProps<typeof toggleVariants>;

// Component
export const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ variant, size }), className)}
      // helpful for screen readers when no aria-pressed provided explicitly
      aria-label={props["aria-label"] ?? "Toggle"}
      {...props}
    />
  );
});
Toggle.displayName = "Toggle";
