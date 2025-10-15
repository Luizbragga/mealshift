// components/ui/toggle-group.tsx
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

// Types
export type ToggleGroupProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Root
> &
  Partial<VariantProps<typeof toggleVariants>>;

export type ToggleGroupItemProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
> &
  Partial<VariantProps<typeof toggleVariants>>;

// Context to share variant/size with items
type Ctx = Partial<VariantProps<typeof toggleVariants>>;
const ToggleGroupCtx = React.createContext<Ctx | null>(null);

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(
  (
    { className, variant = "default", size = "default", children, ...props },
    ref
  ) => {
    const value = React.useMemo<Ctx>(
      () => ({ variant, size }),
      [variant, size]
    );

    return (
      <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
        {...props}
      >
        <ToggleGroupCtx.Provider value={value}>
          {children}
        </ToggleGroupCtx.Provider>
      </ToggleGroupPrimitive.Root>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, children, variant, size, ...props }, ref) => {
  const ctx = React.useContext(ToggleGroupCtx);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: (variant ?? ctx?.variant) || "default",
          size: (size ?? ctx?.size) || "default",
        }),
        // states extras visuais úteis
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem";
