// components/ui/tooltip.tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  withArrow?: boolean;
  arrowSize?: number;
}

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      side = "top",
      align = "center",
      sideOffset = 6,
      alignOffset,
      avoidCollisions = true,
      collisionPadding = 8,
      withArrow = true,
      arrowSize = 6,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      avoidCollisions={avoidCollisions}
      collisionPadding={collisionPadding}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      {withArrow ? (
        <TooltipPrimitive.Arrow
          width={arrowSize * 2}
          height={arrowSize}
          className="fill-popover"
        />
      ) : null}
    </TooltipPrimitive.Content>
  )
);
TooltipContent.displayName = "TooltipContent";
