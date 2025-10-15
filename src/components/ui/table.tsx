import * as React from "react";
import { cn } from "@/lib/utils";

type Density = "comfortable" | "compact";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Render table directly (no scroll wrapper div) */
  noWrapper?: boolean;
  /** Add sticky header styles (requires wrapper overflow) */
  stickyHeader?: boolean;
  /** Row density preset */
  density?: Density;
  /** Add zebra rows */
  striped?: boolean;
  /** Highlight row on hover */
  hover?: boolean;
}

const densityRow: Record<Density, string> = {
  comfortable: "h-[3rem]",
  compact: "h-10",
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      children,
      noWrapper = false,
      stickyHeader = false,
      density = "comfortable",
      striped = false,
      hover = true,
      ...props
    },
    ref
  ) => {
    const tableEl = (
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm",
          // row density via CSS var that children consume
          densityRow[density],
          // striped rows using :nth-child
          striped && "[&_tbody_tr:nth-child(even)]:bg-muted/30",
          // hover rows
          hover && "[&_tbody_tr:hover]:bg-muted/50",
          // selected state support
          "[&_tbody_tr[data-state=selected]]:bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </table>
    );

    if (noWrapper) return tableEl;

    return (
      <div
        className={cn(
          "relative w-full overflow-auto rounded-md",
          // subtle edge mask while scrolling
          "mask-[linear-gradient(to_right,transparent,black_8px,black_calc(100%-8px),transparent)]"
        )}
      >
        {tableEl}
      </div>
    );
  }
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b",
      sticky && "sticky top-0 z-10 bg-background",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-b transition-colors", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, scope = "col", ...props }, ref) => (
  <th
    ref={ref}
    scope={scope}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { isNumeric?: boolean }
>(({ className, isNumeric, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      isNumeric && "text-right tabular-nums",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

/** Handy empty-state row you can drop into <TableBody> when there's no data */
export const TableEmpty = ({
  colSpan = 1,
  children = "No data to display",
  className,
}: {
  colSpan?: number;
  children?: React.ReactNode;
  className?: string;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className={cn("p-8 text-center text-muted-foreground", className)}
    >
      {children}
    </td>
  </tr>
);
