import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** ROOT */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

/** SCROLLBAR */
const trackVariants = cva(
  [
    "flex touch-none select-none transition-[background-color,opacity] duration-150",
    // default invisible-ish; appear on hover of root/track
    "opacity-70 hover:opacity-100",
  ].join(" "),
  {
    variants: {
      orientation: {
        vertical: "h-full w-2.5 border-l border-l-transparent p-[1px]",
        horizontal:
          "h-2.5 w-full flex-col border-t border-t-transparent p-[1px]",
      },
      thickness: {
        sm: "",
        md: "data-[orientation=vertical]:w-3 data-[orientation=horizontal]:h-3",
        lg: "data-[orientation=vertical]:w-3.5 data-[orientation=horizontal]:h-3.5",
      },
    },
    defaultVariants: {
      orientation: "vertical",
      thickness: "sm",
    },
  }
);

const thumbVariants = cva(
  "relative flex-1 rounded-full bg-border transition-[background-color] duration-150 hover:bg-foreground/30",
  {
    variants: {
      radius: {
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-full",
      },
    },
    defaultVariants: {
      radius: "lg",
    },
  }
);

type ScrollBarProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> &
  VariantProps<typeof trackVariants> &
  VariantProps<typeof thumbVariants> & {
    /** Accessible name for screen readers */
    ariaLabel?: string;
  };

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(
  (
    {
      className,
      orientation = "vertical",
      thickness,
      radius,
      ariaLabel = "Scroll content",
      ...props
    },
    ref
  ) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      aria-label={ariaLabel}
      className={cn(trackVariants({ orientation, thickness }), className)}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className={cn(
          thumbVariants({ radius }),
          "after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
