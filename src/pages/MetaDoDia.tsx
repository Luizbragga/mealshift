import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { db } from "@/data/db";
import { distributeBySlots } from "@/lib/tdee";
import { getMealSlots, type MealSlot } from "@/data/db";
import { hapticSuccess } from "@/lib/haptics";
import { ArrowRight } from "lucide-react";

export default function MetaDoDia() {
  const navigate = useNavigate();

  // I keep the daily kcal goal and a dynamic list of meal slots (from Settings).
  const [metaKcal, setMetaKcal] = useState(0);
  const [slots, setSlots] = useState<MealSlot[]>([]);

  useEffect(() => {
    // I initialize both the user target and the editable slots.
    void loadUser();
    void loadSlots();
  }, []);

  async function loadUser() {
    // I read the first (and only) user profile saved locally.
    const user = await db.users.toCollection().first();
    setMetaKcal(user?.kcalTarget ?? 0);
  }

  async function loadSlots() {
    // Slots come from Settings; if none exist, I fall back to sensible defaults.
    const s = await getMealSlots();
    setSlots(s);
  }

  // I compute total percentage to enforce a clean 100% split across slots.
  const totalPercent = Math.round(
    slots.reduce((acc, s) => acc + (s.percent || 0) * 100, 0)
  );
  const isValid = totalPercent === 100;

  // This is the generic, slot-based distribution (percent → kcal).
  const distribution = distributeBySlots(metaKcal, slots);

  // I map slot keys to legacy Plan fields (temporary bridge while we migrate schema).
  const legacyFieldByKey: Record<
    string,
    keyof import("@/data/db").Plan | undefined
  > = {
    breakfast: "breakfastKcal",
    lunch: "lunchKcal",
    snack: "snackKcal",
    dinner: "dinnerKcal",
  };

  async function handleStart() {
    const today = new Date().toISOString().split("T")[0];

    // I build the legacy Plan payload using only the canonical keys we have today.
    const byKey = distribution.byKey;
    const planPayload = {
      dayIso: today,
      breakfastKcal: byKey["breakfast"] ?? 0,
      lunchKcal: byKey["lunch"] ?? 0,
      snackKcal: byKey["snack"] ?? 0,
      dinnerKcal: byKey["dinner"] ?? 0,
    };

    await db.plans.add(planPayload);
    await hapticSuccess();
    navigate("/home");
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col safe-top pb-24">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your daily goal
          </h1>
          <div className="text-4xl font-bold text-primary">{metaKcal} kcal</div>
        </div>

        {/* Dynamic slot sliders */}
        <div className="bg-card rounded-lg p-6 mb-6 space-y-6">
          {slots.map((slot, idx) => {
            const currentPct = Math.round((slot.percent || 0) * 100);
            const kcalForSlot = distribution.byKey[slot.key] ?? 0;

            return (
              <div key={slot.key}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{slot.label}</span>
                  <span className="text-muted-foreground">
                    {currentPct}% • {kcalForSlot} kcal
                  </span>
                </div>

                {/* I let the user tune each slot; I only change the touched slot here.
                   Auto-balancing will come together with the schema migration step. */}
                <Slider
                  value={[currentPct]}
                  onValueChange={([v]) =>
                    setSlots((prev) =>
                      prev.map((s, j) =>
                        j === idx ? { ...s, percent: v / 100 } : s
                      )
                    )
                  }
                  max={60}
                  step={5}
                />
              </div>
            );
          })}

          {!isValid && (
            <div className="text-sm text-destructive">
              Total must be 100% (current: {totalPercent}%)
            </div>
          )}
        </div>

        {/* Simple macro hint (static for now) */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Suggested macros:
          </p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-medium">Protein:</span> 30%
            </div>
            <div>
              <span className="font-medium">Carbs:</span> 35%
            </div>
            <div>
              <span className="font-medium">Fat:</span> 35%
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleStart}
          disabled={!isValid || metaKcal <= 0}
          className="w-full min-touch gradient-primary"
          size="lg"
        >
          Start my day
          <ArrowRight className="ml-2" size={20} />
        </Button>
      </div>
    </div>
  );
}
