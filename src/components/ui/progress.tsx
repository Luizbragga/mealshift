import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const trackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-2",
        md: "h-3.5",
        lg: "h-5",
      },
      rounded: {
        md: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      size: "md",
      rounded: "full",
    },
  }
);

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> &
  VariantProps<typeof trackVariants> & {
    /** Mostra o número formatado à direita (ex.: 64%) */
    showValue?: boolean;
    /** Função de formatação do valor (default: (n)=>`${n}%`) */
    formatValue?: (pct: number) => string;
  };

/**
 * A11y:
 * - Usa Radix para aria-*; passa value/max para o Root
 * - Exibe estado indeterminado quando `value` é null/undefined
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      max = 100,
      size,
      rounded,
      showValue = false,
      formatValue = (n) => `${n}%`,
      ...props
    },
    ref
  ) => {
    const isIndeterminate = value === undefined || value === null;
    const clamped = isIndeterminate
      ? 0
      : Math.min(100, Math.max(0, (Number(value) / Number(max)) * 100));

    return (
      <div className="flex items-center gap-3">
        <ProgressPrimitive.Root
          ref={ref}
          value={isIndeterminate ? undefined : Number(value)}
          max={Number(max)}
          data-state={
            isIndeterminate
              ? "indeterminate"
              : clamped >= 100
              ? "complete"
              : "loading"
          }
          className={cn(trackVariants({ size, rounded }), className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 bg-primary transition-transform",
              // leve destaque quando completo
              "data-[state=complete]:bg-primary",
              // fallback para indeterminado (pulse simples sem keyframes custom)
              isIndeterminate && "animate-pulse"
            )}
            style={{
              transform: isIndeterminate
                ? undefined
                : `translateX(-${100 - clamped}%)`,
            }}
          />
        </ProgressPrimitive.Root>

        {showValue && (
          <span
            className={cn(
              "select-none tabular-nums text-xs text-muted-foreground",
              size === "lg" && "text-sm"
            )}
            aria-live="polite"
          >
            {formatValue(Math.round(clamped))}
          </span>
        )}
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
