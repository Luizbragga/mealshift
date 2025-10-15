import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/BottomNav";
import { db, Settings } from "@/data/db";
import {
  requestNotificationPermission,
  scheduleReminders,
  cancelAllReminders,
} from "@/lib/reminders";
import { hapticSuccess } from "@/lib/haptics";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lembretes() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [cafeHora, setCafeHora] = useState("08:00");
  const [almocoHora, setAlmocoHora] = useState("12:30");
  const [SnackHora, setSnackHora] = useState("16:00");
  const [DinnerHora, setDinnerHora] = useState("19:30");

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await db.settings.toCollection().first();
    if (s) {
      setSettings(s);
      setEnabled(s.consentNotifications);
      setCafeHora(s.breakfastTime || "08:00");
      setAlmocoHora(s.lunchTime || "12:30");
      setSnackHora(s.snackTime || "16:00");
      setDinnerHora(s.dinnerTime || "19:30");
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast({
          title: "Permission denied",
          description: "Enable notifications in your device settings.",
          variant: "destructive",
        });
        return;
      }
    }

    setEnabled(checked);

    if (settings && settings.id) {
      await db.settings.update(settings.id, { consentNotifications: checked });
    }

    if (checked) {
      await scheduleReminders({
        breakfastTime: cafeHora,
        lunchTime: almocoHora,
        snackTime: SnackHora,
        dinnerTime: DinnerHora,
      });
      toast({ title: "Reminders enabled!" });
    } else {
      await cancelAllReminders();
      toast({ title: "Reminders disabled" });
    }

    await hapticSuccess();
  };

  const handleSave = async () => {
    if (!settings || !settings.id) return;

    await db.settings.update(settings.id, {
      breakfastTime: cafeHora,
      lunchTime: almocoHora,
      snackTime: SnackHora,
      dinnerTime: DinnerHora,
    });

    if (enabled) {
      await scheduleReminders({
        breakfastTime: cafeHora,
        lunchTime: almocoHora,
        snackTime: SnackHora,
        dinnerTime: DinnerHora,
      });
    }

    await hapticSuccess();
    toast({ title: "Times saved!" });
  };

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reminders</h1>
            <p className="text-sm text-muted-foreground">Local notifications</p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="font-semibold">Enable notifications</div>
            <div className="text-sm text-muted-foreground">
              {enabled ? "You will receive reminders" : "Disabled"}
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label>Breakfast</Label>
            <Input
              type="time"
              value={cafeHora}
              onChange={(e) => setCafeHora(e.target.value)}
              disabled={!enabled}
            />
          </div>

          <div>
            <Label>Lunch</Label>
            <Input
              type="time"
              value={almocoHora}
              onChange={(e) => setAlmocoHora(e.target.value)}
              disabled={!enabled}
            />
          </div>

          <div>
            <Label>Snack</Label>
            <Input
              type="time"
              value={SnackHora}
              onChange={(e) => setSnackHora(e.target.value)}
              disabled={!enabled}
            />
          </div>

          <div>
            <Label>Dinner</Label>
            <Input
              type="time"
              value={DinnerHora}
              onChange={(e) => setDinnerHora(e.target.value)}
              disabled={!enabled}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!enabled}
          className="w-full gradient-primary min-touch"
        >
          Save times
        </Button>

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">About notifications:</p>
          <p>
            On Android (native build), we use local notifications that work even
            if the app is closed.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
