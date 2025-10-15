import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Quick presets for common shapes.
   * - "text": altura mais baixa, linha de Text
   * - "round": borda totalmente arredondada (ex.: avatar)
   * - "inline": remove display:block pra usar dentro de linhas
   */
  variant?: "default" | "text" | "round" | "inline";
};

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          // animação só quando o usuário permite motion
          "motion-safe:animate-pulse bg-muted rounded-md",
          // presets
          variant === "text" && "h-4",
          variant === "round" && "rounded-full",
          variant === "inline" ? "inline-block" : "block",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
