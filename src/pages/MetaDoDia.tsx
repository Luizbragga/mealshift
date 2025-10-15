import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { db } from "@/data/db";
import { distributeMeals } from "@/lib/tdee";
import { hapticSuccess } from "@/lib/haptics";
import { ArrowRight } from "lucide-react";

export default function MetaDoDia() {
  const navigate = useNavigate();
  const [metaKcal, setMetaKcal] = useState(0);
  const [cafePercent, setCafePercent] = useState(20);
  const [almocoPercent, setAlmocoPercent] = useState(35);
  const [SnackPercent, setSnackPercent] = useState(15);
  const [DinnerPercent, setDinnerPercent] = useState(30);

  useEffect(() => {
    void loadUser();
  }, []);

  const loadUser = async () => {
    const user = await db.users.toCollection().first();
    if (user) setMetaKcal(user.kcalTarget);
  };

  const total = cafePercent + almocoPercent + SnackPercent + DinnerPercent;
  const isValid = total === 100;

  const distribution = distributeMeals(metaKcal, {
    cafe: cafePercent / 100,
    almoco: almocoPercent / 100,
    Snack: SnackPercent / 100,
    Dinner: DinnerPercent / 100,
  });

  const handleStart = async () => {
    const today = new Date().toISOString().split("T")[0];

    await db.plans.add({
      dayIso: today,
      breakfastKcal: distribution.breakfastKcal,
      lunchKcal: distribution.lunchKcal,
      snackKcal: distribution.snackKcal,
      dinnerKcal: distribution.dinnerKcal,
    });

    await hapticSuccess();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col safe-top pb-24">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your daily goal
          </h1>
          <div className="text-4xl font-bold text-primary">{metaKcal} kcal</div>
        </div>

        <div className="bg-card rounded-lg p-6 mb-6 space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Breakfast</span>
              <span className="text-muted-foreground">
                {cafePercent}% • {distribution.breakfastKcal} kcal
              </span>
            </div>
            <Slider
              value={[cafePercent]}
              onValueChange={([v]) => setCafePercent(v)}
              max={60}
              step={5}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Lunch</span>
              <span className="text-muted-foreground">
                {almocoPercent}% • {distribution.lunchKcal} kcal
              </span>
            </div>
            <Slider
              value={[almocoPercent]}
              onValueChange={([v]) => setAlmocoPercent(v)}
              max={60}
              step={5}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Snack</span>
              <span className="text-muted-foreground">
                {SnackPercent}% • {distribution.snackKcal} kcal
              </span>
            </div>
            <Slider
              value={[SnackPercent]}
              onValueChange={([v]) => setSnackPercent(v)}
              max={60}
              step={5}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Dinner</span>
              <span className="text-muted-foreground">
                {DinnerPercent}% • {distribution.dinnerKcal} kcal
              </span>
            </div>
            <Slider
              value={[DinnerPercent]}
              onValueChange={([v]) => setDinnerPercent(v)}
              max={60}
              step={5}
            />
          </div>

          {!isValid && (
            <div className="text-sm text-destructive">
              Total must be 100% (current: {total}%)
            </div>
          )}
        </div>

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

        <Button
          onClick={handleStart}
          disabled={!isValid}
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
