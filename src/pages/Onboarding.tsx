import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db, type Sex, type Goal, type Activity } from "@/data/db";
import { calculateTDEE } from "@/lib/tdee";
import { useAppStore } from "@/store/useAppStore";
import { hapticSuccess } from "@/lib/haptics";
import { ArrowRight } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const { setHasCompletedOnboarding, setCurrentUserId } = useAppStore();

  // English-only values
  const [sex, setSex] = useState<Sex>("M");
  const [ageStr, setAgeStr] = useState("");
  const [heightStr, setHeightStr] = useState("");
  const [weightStr, setWeightStr] = useState("");
  const [goal, setGoal] = useState<Goal>("Maintain");
  const [activity, setActivity] = useState<Activity>("Light");
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async () => {
    if (!ageStr || !heightStr || !weightStr) {
      alert("Please fill in all fields");
      return;
    }
    setIsLoading(true);

    // Parse inputs
    const age = parseInt(ageStr, 10);
    const heightCm = parseInt(heightStr, 10);
    const weightKg = parseFloat(weightStr);

    // If your calculateTDEE expects EN keys with underscores, keep them.
    // Otherwise, adapt to its signature.
    const kcalTarget = calculateTDEE({
      sex,
      age,
      height_cm: heightCm,
      weight_kg: weightKg,
      activity,
      goal,
    });

    // Save using the EN model (User)
    const userId = await db.users.add({
      sex,
      age,
      heightCm,
      weightKg,
      goal,
      activity,
      kcalTarget,
    });

    await hapticSuccess();
    setCurrentUserId(userId);
    setHasCompletedOnboarding(true);
    navigate("/meta");
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col safe-top">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M6 12h12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">MealShift</h1>

          <p className="text-muted-foreground">
            Adjust the rest of your day in one tap.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Sex</Label>
            <Select value={sex} onValueChange={(v: Sex) => setSex(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Age</Label>
            <Input
              type="number"
              placeholder="e.g., 30"
              value={ageStr}
              onChange={(e) => setAgeStr(e.target.value)}
            />
          </div>

          <div>
            <Label>Height (cm)</Label>
            <Input
              type="number"
              placeholder="e.g., 170"
              value={heightStr}
              onChange={(e) => setHeightStr(e.target.value)}
            />
          </div>

          <div>
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g., 70.5"
              value={weightStr}
              onChange={(e) => setWeightStr(e.target.value)}
            />
          </div>

          <div>
            <Label>Goal</Label>
            <Select value={goal} onValueChange={(v: Goal) => setGoal(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lose">Lose weight</SelectItem>
                <SelectItem value="Maintain">Maintain weight</SelectItem>
                <SelectItem value="Gain">Gain weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Activity</Label>
            <Select
              value={activity}
              onValueChange={(v: Activity) => setActivity(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sedentary">Sedentary</SelectItem>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Intense">Intense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={isLoading}
            className="w-full min-touch gradient-primary"
            size="lg"
          >
            Calculate goal
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
