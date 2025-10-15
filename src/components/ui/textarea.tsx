import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Auto grow/shrink to fit content */
  autoSize?: boolean;
  /** Show char counter (uses maxLength) */
  showCount?: boolean;
  /** Control CSS resize behavior */
  resize?: "none" | "vertical" | "horizontal" | "both";
  /** Compact or spacious paddings */
  size?: "sm" | "md" | "lg";
  /** Callback with the current string value */
  onValueChange?: (value: string) => void;
}

const sizeClasses: Record<NonNullable<TextareaProps["size"]>, string> = {
  sm: "min-h-[70px] px-2.5 py-1.5 text-sm",
  md: "min-h-[80px] px-3 py-2 text-sm",
  lg: "min-h-[96px] px-3.5 py-2.5 text-base",
};

const resizeClasses: Record<NonNullable<TextareaProps["resize"]>, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      autoSize,
      showCount,
      resize = "vertical",
      size = "md",
      onChange,
      onValueChange,
      maxLength,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    // merge refs
    React.useImperativeHandle(
      ref,
      () => innerRef.current as HTMLTextAreaElement
    );

    const adjust = React.useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoSize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoSize]);

    React.useEffect(() => {
      adjust();
    }, [adjust, props.value, props.defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
      if (autoSize) adjust();
    };

    const count =
      typeof props.value === "string"
        ? props.value.length
        : typeof props.defaultValue === "string"
        ? props.defaultValue.length
        : undefined;

    return (
      <div className="relative">
        <textarea
          ref={innerRef}
          onChange={handleChange}
          className={cn(
            "flex w-full rounded-md border border-input bg-background ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            sizeClasses[size],
            resizeClasses[resize],
            // invalid state via aria-invalid
            "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30",
            className
          )}
          {...props}
        />
        {showCount && typeof maxLength === "number" && (
          <span className="pointer-events-none absolute bottom-1.5 right-2 select-none text-[10px] text-muted-foreground">
            {count ?? 0}/{maxLength}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
