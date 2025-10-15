import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const groupVariants = cva("grid gap-2", {
  variants: {
    orientation: {
      vertical: "grid-cols-1",
      horizontal: "grid-flow-col auto-cols-max",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

const itemVariants = cva(
  "aspect-square rounded-full border text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:text-primary",
  {
    variants: {
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
      invalid: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      invalid: false,
    },
  }
);

type RadioGroupProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> &
  VariantProps<typeof groupVariants> & {
    /** Provide an accessible label when not using an external <Label htmlFor> */
    ariaLabel?: string;
  };

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation, ariaLabel, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    aria-label={ariaLabel}
    className={cn(groupVariants({ orientation }), className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> &
  VariantProps<typeof itemVariants> & {
    /** Marks the control as invalid for a11y + styles */
    invalid?: boolean;
  };

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, invalid, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(itemVariants({ size, invalid }), className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle
        className={cn(
          "fill-current text-current",
          size === "lg"
            ? "h-3.5 w-3.5"
            : size === "sm"
            ? "h-2 w-2"
            : "h-2.5 w-2.5"
        )}
      />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

/** Pair your radio with text you can click */
const RadioGroupItemLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("cursor-pointer select-none text-sm", className)}
    {...props}
  />
));
RadioGroupItemLabel.displayName = "RadioGroupItemLabel";

export { RadioGroup, RadioGroupItem, RadioGroupItemLabel };
