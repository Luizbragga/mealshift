import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

type InputOTPSlotProps = React.ComponentPropsWithoutRef<"div"> & {
  index: number;
  /** exibe • em vez do dígito */
  masked?: boolean;
};

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput> & {
    containerClassName?: string;
  }
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    autoComplete="one-time-code"
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, masked, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (
      <div
        ref={ref}
        role="textbox"
        aria-label={`Digit ${index + 1}`}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
          isActive &&
            "z-10 ring-2 ring-ring ring-offset-2 ring-offset-background",
          className
        )}
        {...props}
      >
        {char ? (
          masked ? (
            "•"
          ) : (
            char
          )
        ) : (
          <span className="text-muted-foreground">•</span>
        )}

        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px bg-foreground animate-caret-blink" />
          </div>
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-hidden="true"
    className="px-1"
    {...props}
  >
    <Dot />
    <span className="sr-only">Separator</span>
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
