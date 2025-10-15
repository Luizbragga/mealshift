import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { hapticSuccess } from "@/lib/haptics";
import { toast } from "@/lib/toast"; // se preferir Sonner, troque pelo seu adaptador

interface PaywallProps {
  open: boolean;
  onClose: () => void;
}

const PRICE_EUR = 3.99;

export function Paywall({ open, onClose }: PaywallProps) {
  const { setIsPro } = useAppStore();
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);

  const features: string[] = [
    "Unlimited day readjustments",
    "100% ad-free experience",
    "One-time payment — yours forever",
  ];

  const handleUnlock = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    try {
      // TODO: Integrate Stripe / IAP here.
      // ex: const { url } = await createCheckoutSession(); window.location.href = url;
      toast("Payment flow not connected yet", {
        description: 'Use "I already purchased" to unlock for now.',
      });
    } catch (err) {
      console.error(err);
      toast("Something went wrong", {
        description: "We couldn't start the payment flow. Please try again.",
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      // TODO: Implement real restore (check receipt / entitlement).
      await hapticSuccess();
      setIsPro(true);
      toast("Pro unlocked", {
        description: "Welcome back! Enjoy the full experience.",
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast("Restore failed", {
        description: "Could not verify your purchase at the moment.",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // só dispara onClose quando o usuário fecha
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Unlimited readjustments + No ads
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            {features.map((text) => (
              <div key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <Check size={16} className="text-white" />
                </div>
                <p className="text-foreground">{text}</p>
              </div>
            ))}
          </div>

          <div
            className="rounded-lg p-4 text-center bg-gradient-to-r from-primary/10 to-primary/5"
            aria-label="Price"
          >
            <div className="text-3xl font-bold text-primary">
              €{PRICE_EUR.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              one-time payment
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleUnlock}
              className="w-full min-touch"
              size="lg"
              disabled={isUnlocking}
            >
              {isUnlocking ? "Processing…" : "Unlock Pro"}
            </Button>

            <Button
              onClick={handleRestore}
              variant="ghost"
              className="w-full"
              disabled={isRestoring}
            >
              {isRestoring ? "Restoring…" : "I already purchased"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
