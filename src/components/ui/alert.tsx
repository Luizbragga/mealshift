// src/components/ui/alert.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  // base
  "relative w-full rounded-lg border p-4",
  // support an icon as the first child
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground [&>svg~*]:pl-7 [&>svg+div]:-translate-y-[3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg~*]:pl-7 [&>svg+div]:-translate-y-[3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-destructive",
        success:
          "border-green-500/40 bg-green-50 text-green-900 dark:border-green-500/60 dark:bg-green-950/20 dark:text-green-300 [&>svg~*]:pl-7 [&>svg+div]:-translate-y-[3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        warning:
          "border-yellow-500/40 bg-yellow-50 text-yellow-900 dark:border-yellow-500/60 dark:bg-yellow-950/20 dark:text-yellow-300 [&>svg~*]:pl-7 [&>svg+div]:-translate-y-[3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        info: "border-blue-500/40 bg-blue-50 text-blue-900 dark:border-blue-500/60 dark:bg-blue-950/20 dark:text-blue-300 [&>svg~*]:pl-7 [&>svg+div]:-translate-y-[3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
