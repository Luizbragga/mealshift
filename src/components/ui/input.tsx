import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----- Variants: size ----- */
const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  {
    variants: {
      size: {
        sm: "h-9 px-3 py-1.5 text-sm",
        md: "h-10 px-3 py-2 text-base md:text-sm",
        lg: "h-11 px-4 py-3 text-base",
      },
      invalid: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "",
      },
      withIconLeft: { true: "pl-10", false: "" },
      withIconRight: { true: "pr-10", false: "" },
    },
    defaultVariants: {
      size: "md",
      invalid: false,
      withIconLeft: false,
      withIconRight: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** marca visual/aria de inválido */
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size,
      type = "text",
      invalid,
      withIconLeft,
      withIconRight,
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={!!invalid || undefined}
        className={cn(
          inputVariants({ size, invalid, withIconLeft, withIconRight }),
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

/* ----- Password with show/hide ----- */
export interface InputPasswordProps
  extends Omit<
    InputProps,
    "type" | "withIconRight" | "inputMode" | "pattern"
  > {}

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ className, size, invalid, ...props }, ref) => {
    const [show, setShow] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          size={size}
          invalid={invalid}
          withIconRight
          className={className}
          {...props}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
InputPassword.displayName = "InputPassword";

/* ----- Addon icons (left/right) ----- */
type InputIconProps = React.HTMLAttributes<HTMLDivElement> & {
  position?: "left" | "right";
};
const InputIcon = ({
  position = "left",
  className,
  children,
  ...props
}: InputIconProps) => (
  <div
    className={cn(
      "pointer-events-none absolute inset-y-0 grid w-10 place-items-center text-muted-foreground",
      position === "left" ? "left-0" : "right-0",
      className
    )}
    aria-hidden="true"
    {...props}
  >
    {children}
  </div>
);

/**
 * Wrapper opcional para combinar ícones e <Input /> com paddings corretos.
 * Uso:
 * <InputGroup>
 *   <InputIcon><Search /></InputIcon>
 *   <Input withIconLeft placeholder="Search..." />
 * </InputGroup>
 */
const InputGroup = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative", className)} {...props}>
    {children}
  </div>
);

export { Input, InputPassword, InputGroup, InputIcon, inputVariants };
