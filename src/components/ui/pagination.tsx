import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

/**
 * Pagination
 * Accessible, composable, and framework-agnostic (Next/Remix via `asChild`).
 */
type PaginationRootProps = React.ComponentPropsWithoutRef<"nav"> & {
  /** a11y: what this pagination controls */
  ariaLabel?: string;
};

const Pagination = ({
  className,
  ariaLabel = "Pagination",
  ...props
}: PaginationRootProps) => (
  <nav
    role="navigation"
    aria-label={ariaLabel}
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkBaseProps = {
  /** highlights the current page */
  isActive?: boolean;
  /** disables interaction and focus */
  isDisabled?: boolean;
  /** render as child (e.g., Next.js Link) */
  asChild?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentPropsWithoutRef<"a">;

const PaginationLink = ({
  className,
  isActive,
  isDisabled,
  size = "icon",
  asChild,
  ...props
}: PaginationLinkBaseProps) => {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      aria-current={isActive ? "page" : undefined}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      onClick={
        isDisabled ? (e: React.MouseEvent) => e.preventDefault() : props.onClick
      }
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        isDisabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  );
};
PaginationLink.displayName = "PaginationLink";

type EdgeLinkProps = React.ComponentProps<typeof PaginationLink> & {
  label?: string;
};

const PaginationPrevious = ({
  className,
  label = "Previous",
  ...props
}: EdgeLinkProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>{label}</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  label = "Next",
  ...props
}: EdgeLinkProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>{label}</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
