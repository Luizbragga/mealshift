import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

/** Overlay variants (you can pick: default | transparent | blur | muted) */
const overlayVariants = cva(
  "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "bg-black/80",
        transparent: "bg-transparent",
        blur: "backdrop-blur-sm bg-black/40",
        muted: "bg-background/70 backdrop-saturate-150",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> &
    VariantProps<typeof overlayVariants>
>(({ className, variant, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(overlayVariants({ variant }), className)}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

/** Base position/animation for the panel */
const sheetVariants = cva(
  "fixed z-50 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right:
          "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
    },
    defaultVariants: { side: "right" },
  }
);

/** Size maps for each side */
const sizeForSide = (
  side: NonNullable<SheetContentProps["side"]>,
  size: NonNullable<SheetContentProps["size"]>
) => {
  const W: Record<typeof size, string> = {
    sm: "w-72",
    md: "w-96",
    lg: "w-[28rem]",
    xl: "w-[36rem]",
    full: "w-screen",
  };
  const H: Record<typeof size, string> = {
    sm: "h-48",
    md: "h-72",
    lg: "h-96",
    xl: "h-[36rem]",
    full: "h-screen",
  };
  if (side === "left" || side === "right") return `${W[size]} max-w-full`;
  return `${H[size]} max-h-screen`;
};

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants>,
    VariantProps<typeof overlayVariants> {
  /** preset sizes: sm | md | lg | xl | full */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** prevent closing when clicking the overlay */
  closeOnOverlayClick?: boolean;
  /** allow/disallow closing with Escape (default true) */
  closeOnEscape?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      size = "md",
      variant,
      className,
      children,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      ...props
    },
    ref
  ) => {
    // intercept outside click if needed
    const onInteractOutside = React.useCallback<
      NonNullable<SheetPrimitive.DialogContentProps["onInteractOutside"]>
    >(
      (e) => {
        if (!closeOnOverlayClick) e.preventDefault();
      },
      [closeOnOverlayClick]
    );

    const onEscapeKeyDown = React.useCallback<
      NonNullable<SheetPrimitive.DialogContentProps["onEscapeKeyDown"]>
    >(
      (e) => {
        if (!closeOnEscape) e.preventDefault();
      },
      [closeOnEscape]
    );

    return (
      <SheetPortal>
        <SheetOverlay variant={variant} />
        <SheetPrimitive.Content
          ref={ref}
          onInteractOutside={onInteractOutside}
          onEscapeKeyDown={onEscapeKeyDown}
          className={cn(
            sheetVariants({ side }),
            // sizing
            side === "top" || side === "bottom"
              ? cn("w-full", sizeForSide(side, size))
              : cn("h-full", sizeForSide(side, size)),
            "gap-4", // keep consistent spacing
            className
          )}
          {...props}
        >
          {children}
          <SheetPrimitive.Close
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md opacity-70 ring-offset-background transition-opacity hover:bg-accent hover:text-accent-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
