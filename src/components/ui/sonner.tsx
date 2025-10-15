"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Toaster as Sonner,
  toast,
  type ToasterProps as SonnerProps,
} from "sonner";

type ToasterProps = SonnerProps & {
  /** Default duration for all toasts (ms). */
  duration?: number;
};

export function Toaster({
  position = "top-right",
  richColors = true,
  closeButton = true,
  duration = 3500,
  ...props
}: ToasterProps) {
  const { theme = "system", resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // evita passar um theme “flutuante” durante SSR/ISR
  const sonnerTheme = mounted
    ? theme === "system"
      ? (resolvedTheme as SonnerProps["theme"])
      : (theme as SonnerProps["theme"])
    : undefined;

  return (
    <Sonner
      theme={sonnerTheme}
      position={position}
      richColors={richColors}
      closeButton={closeButton}
      duration={duration}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

// helpers bonitinhos em inglês
export const notify = {
  info: (msg: string, desc?: string) => toast.info(msg, { description: desc }),
  success: (msg: string, desc?: string) =>
    toast.success(msg, { description: desc }),
  warning: (msg: string, desc?: string) =>
    toast.warning(msg, { description: desc }),
  error: (msg: string, desc?: string) =>
    toast.error(msg, { description: desc }),
  action: (msg: string, label: string, onClick: () => void, desc?: string) =>
    toast(msg, { description: desc, action: { label, onClick } }),
};

export { toast };
