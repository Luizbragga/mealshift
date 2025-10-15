import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const labelVariants = cva(
  "inline-flex items-center gap-1 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      tone: {
        default: "",
        muted: "text-muted-foreground",
      },
      srOnly: {
        true: "sr-only",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "default",
      srOnly: false,
    },
  }
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /** Show a required asterisk and set aria-required */
  required?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, size, tone, srOnly, required, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      aria-required={required || undefined}
      data-required={required ? "" : undefined}
      className={cn(labelVariants({ size, tone, srOnly }), className)}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
