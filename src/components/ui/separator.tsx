import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

type Thickness = "hairline" | "sm" | "md" | "lg";
type Variant = "default" | "muted" | "subtle" | "strong" | "dashed";

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Visual thickness (height for horizontal, width for vertical). */
  thickness?: Thickness;
  /** Color/appearance variant. */
  variant?: Variant;
}

const H_THICKNESS: Record<Thickness, string> = {
  hairline: "h-px",
  sm: "h-[2px]",
  md: "h-[3px]",
  lg: "h-1",
};

const V_THICKNESS: Record<Thickness, string> = {
  hairline: "w-px",
  sm: "w-[2px]",
  md: "w-[3px]",
  lg: "w-1",
};

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      thickness = "hairline",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";

    // base size (bg-based variants)
    const sizeClass = isHorizontal
      ? cn(H_THICKNESS[thickness], "w-full")
      : cn(V_THICKNESS[thickness], "h-full");

    // color variants
    const colorClass =
      variant === "default"
        ? "bg-border"
        : variant === "muted"
        ? "bg-muted"
        : variant === "subtle"
        ? "bg-muted-foreground/30"
        : variant === "strong"
        ? "bg-foreground/50"
        : ""; // dashed handled below

    // dashed uses borders instead of background for a crisp pattern
    const dashedClass =
      variant === "dashed"
        ? isHorizontal
          ? "h-0 w-full border-t border-dashed border-border"
          : "w-0 h-full border-l border-dashed border-border"
        : "";

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0",
          variant === "dashed" ? dashedClass : cn(sizeClass, colorClass),
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = SeparatorPrimitive.Root.displayName;
