import * as React from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastIcon,
} from "@/components/ui/toast";

const VARIANT_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  destructive: <XCircle className="h-4 w-4" />,
};

export function Toaster() {
  // força tipagem flexível
  const { toasts } = useToast() as unknown as { toasts: any[] };

  return (
    <ToastProvider>
      {(toasts as any[]).map((t: any) => {
        const { id, title, description, action, variant, icon, ...props } = t;
        return (
          <Toast key={id} variant={variant as any} {...props}>
            {(icon ?? (variant && VARIANT_ICON[variant])) && (
              <ToastIcon>{icon ?? VARIANT_ICON[variant as string]}</ToastIcon>
            )}
            <div className="col-start-2 grid gap-1">
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? (
                <ToastDescription>{description}</ToastDescription>
              ) : null}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
