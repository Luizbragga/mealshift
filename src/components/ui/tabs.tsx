import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

// ---- TabsList ---------------------------------------------------------------

type TabsListProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> & {
  variant?: "filled" | "underline";
  size?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "justify";
  /** Make triggers stretch to fill available width */
  fullWidth?: boolean;
};

const sizeMap: Record<NonNullable<TabsListProps["size"]>, string> = {
  sm: "h-9 p-1 gap-1",
  md: "h-10 p-1 gap-1.5",
  lg: "h-11 p-1.5 gap-2",
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(
  (
    {
      className,
      variant = "filled",
      size = "md",
      align = "start",
      fullWidth,
      ...props
    },
    ref
  ) => (
    <TabsPrimitive.List
      ref={ref}
      data-variant={variant}
      data-size={size}
      data-align={align}
      data-full-width={fullWidth ? "" : undefined}
      className={cn(
        "group/tabs inline-flex items-center rounded-md text-muted-foreground",
        // container visuals
        variant === "filled" && "bg-muted",
        variant === "underline" && "bg-transparent border-b",
        // sizing
        sizeMap[size],
        // alignment
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        align === "justify" && "justify-between w-full",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

// ---- TabsTrigger ------------------------------------------------------------

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // base
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      // sizing inherited from list group
      "group-data-[size=sm]/tabs:px-2 group-data-[size=sm]/tabs:py-1",
      "group-data-[size=md]/tabs:px-3 group-data-[size=md]/tabs:py-1.5",
      "group-data-[size=lg]/tabs:px-4 group-data-[size=lg]/tabs:py-2",
      // layout: stretch when fullWidth or justify list
      "group-data-[full-width]/tabs:flex-1 group-data-[align=justify]/tabs:flex-1",
      // variant: filled
      "group-data-[variant=filled]/tabs:data-[state=active]:bg-background",
      "group-data-[variant=filled]/tabs:data-[state=active]:text-foreground",
      "group-data-[variant=filled]/tabs:data-[state=active]:shadow-sm",
      // variant: underline
      "group-data-[variant=underline]/tabs:rounded-none group-data-[variant=underline]/tabs:bg-transparent",
      "group-data-[variant=underline]/tabs:border-b-2 group-data-[variant=underline]/tabs:border-transparent",
      "group-data-[variant=underline]/tabs:data-[state=active]:border-foreground",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ---- TabsContent ------------------------------------------------------------

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
