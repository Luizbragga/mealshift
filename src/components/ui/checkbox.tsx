// src/components/ui/checkbox.tsx
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-3.5 w-3.5 [&_svg]:h-3 [&_svg]:w-3",
  md: "h-4 w-4 [&_svg]:h-4 [&_svg]:w-4",
  lg: "h-5 w-5 [&_svg]:h-4 [&_svg]:w-4",
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "md", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer shrink-0 rounded-sm border border-input bg-background ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
      sizeClasses[size],
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      {/* shows a dash for indeterminate, check for checked */}
      <CheckboxPrimitive.Indicator asChild>
        <span className="contents">
          <Check className="hidden data-[state=checked]:block" />
          <Minus className="hidden data-[state=indeterminate]:block" />
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
