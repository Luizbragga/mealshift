import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const rootSize: Record<Size, string> = {
  sm: "h-5 w-9",
  md: "h-6 w-11",
  lg: "h-7 w-14",
};

const thumbSize: Record<Size, { base: string; checked: string }> = {
  sm: {
    base: "h-4 w-4 data-[state=unchecked]:translate-x-0",
    checked: "data-[state=checked]:translate-x-4",
  },
  md: {
    base: "h-5 w-5 data-[state=unchecked]:translate-x-0",
    checked: "data-[state=checked]:translate-x-5",
  },
  lg: {
    base: "h-6 w-6 data-[state=unchecked]:translate-x-0",
    checked: "data-[state=checked]:translate-x-7",
  },
};

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: Size;
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        rootSize[size],
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none rounded-full bg-background shadow-lg ring-0 transition-transform",
          thumbSize[size].base,
          thumbSize[size].checked
        )}
      />
    </SwitchPrimitive.Root>
  );
});
Switch.displayName = "Switch";
