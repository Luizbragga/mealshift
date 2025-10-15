import * as React from "react";
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** GROUP */
const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

/** PANEL (passthrough) */
const ResizablePanel = ResizablePrimitive.Panel;

/** HANDLE */
const handleVariants = cva(
  [
    "relative flex items-center justify-center bg-border focus-visible:outline-none",
    "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
    // cursors by orientation
    "data-[panel-group-direction=horizontal]:cursor-col-resize",
    "data-[panel-group-direction=vertical]:cursor-row-resize",
    // size defaults (thin hairline)
    "data-[panel-group-direction=horizontal]:w-px data-[panel-group-direction=horizontal]:h-full",
    "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
  ].join(" "),
  {
    variants: {
      thickness: {
        /** clickable area; keeps visual 1px track via ::after */
        sm: "",
        md: "data-[panel-group-direction=horizontal]:w-1.5 data-[panel-group-direction=vertical]:h-1.5",
        lg: "data-[panel-group-direction=horizontal]:w-2.5 data-[panel-group-direction=vertical]:h-2.5",
      },
      withTrack: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      thickness: "sm",
      withTrack: true,
    },
  }
);

type ResizableHandleProps = React.ComponentPropsWithoutRef<
  typeof ResizablePrimitive.PanelResizeHandle
> &
  VariantProps<typeof handleVariants> & {
    /** Render a visible grip icon centered in the handle */
    withHandle?: boolean;
    /** Accessible name when no visible label refers to this splitter */
    ariaLabel?: string;
  };

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelResizeHandle>,
  ResizableHandleProps
>(
  (
    {
      withHandle,
      thickness,
      withTrack,
      ariaLabel = "Resize panel",
      className,
      ...props
    },
    ref
  ) => (
    <ResizablePrimitive.PanelResizeHandle
      ref={ref as any}
      aria-label={ariaLabel}
      className={cn(
        handleVariants({ thickness, withTrack }),
        // 1px visual track using ::after so thicker hit-area still looks sleek
        withTrack &&
          "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-border data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:h-px data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2",
        // rotate inner grip for vertical groups
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...(props as any)}
    >
      {withHandle && (
        <div
          aria-hidden
          className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border text-foreground/70"
        >
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
