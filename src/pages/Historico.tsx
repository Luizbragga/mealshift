import { useState, useEffect } from "react";
import { db, Plan, Entry } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DayData {
  dayIso: string;
  plan: Plan | null;
  entries: Entry[];
  aderencia: number; // adherence %
}

export default function Historico() {
  const [days, setDays] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  useEffect(() => {
    void loadHistory();
  }, []);

  const loadHistory = async () => {
    const allPlans = await db.plans.toArray();
    const allEntries = await db.entries.toArray();

    const uniqueDays = Array.from(new Set(allPlans.map((p) => p.dayIso)));

    const history: DayData[] = uniqueDays
      .map((dia) => {
        const plan = allPlans.find((p) => p.dayIso === dia) || null;
        const entries = allEntries.filter((e) => e.dayIso === dia);

        if (!plan) return null;

        const dailyGoal =
          plan.breakfastKcal +
          plan.lunchKcal +
          plan.snackKcal +
          plan.dinnerKcal;
        const consumed = entries.reduce((sum, e) => sum + e.kcal, 0);
        const diff = Math.abs(dailyGoal - consumed);
        const adherence = Math.max(0, 100 - (diff / dailyGoal) * 100);

        return {
          dayIso: dia,
          plan,
          entries,
          aderencia: Math.round(adherence),
        };
      })
      .filter(Boolean) as DayData[];

    history.sort((a, b) => b.dayIso.localeCompare(a.dayIso));
    setDays(history);
  };

  const streak = calculateStreak(days);

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">History</h1>

        {streak > 0 && (
          <div className="bg-primary/10 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="font-semibold">{streak}-day streak</div>
              <div className="text-sm text-muted-foreground">Keep it up!</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {days.map((day) => {
            const date = new Date(day.dayIso + "T12:00:00");
            const dailyGoal =
              day.plan!.breakfastKcal +
              day.plan!.lunchKcal +
              day.plan!.snackKcal +
              day.plan!.dinnerKcal;
            const consumed = day.entries.reduce((sum, e) => sum + e.kcal, 0);

            return (
              <button
                key={day.dayIso}
                onClick={() => setSelectedDay(day)}
                className="w-full bg-card rounded-lg p-4 text-left border border-border hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">
                      {format(date, "MMMM d", { locale: enUS })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {consumed} / {dailyGoal} kcal
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {consumed > dailyGoal + 100 ? (
                      <TrendingUp size={20} className="text-destructive" />
                    ) : consumed < dailyGoal - 100 ? (
                      <TrendingDown size={20} className="text-primary" />
                    ) : (
                      <Minus size={20} className="text-muted-foreground" />
                    )}
                    <span className="font-semibold">{day.aderencia}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(day.aderencia, 100)}%` }}
                  />
                </div>
              </button>
            );
          })}

          {days.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No history yet. Start your day!
            </div>
          )}
        </div>
      </div>

      {selectedDay && (
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {format(new Date(selectedDay.dayIso + "T12:00:00"), "MMMM d", {
                  locale: enUS,
                })}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Goal</div>
                  <div className="text-xl font-bold">
                    {selectedDay.plan!.breakfastKcal +
                      selectedDay.plan!.lunchKcal +
                      selectedDay.plan!.snackKcal +
                      selectedDay.plan!.dinnerKcal}{" "}
                    kcal
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Consumed</div>
                  <div className="text-xl font-bold">
                    {selectedDay.entries.reduce((sum, e) => sum + e.kcal, 0)}{" "}
                    kcal
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-sm">Per meal:</p>
                {(["Breakfast", "Lunch", "Snack", "Dinner"] as const).map(
                  (meal) => {
                    const metaKey = `${meal.toLowerCase()}_kcal` as keyof Plan;
                    const meta = selectedDay.plan![metaKey] as number;
                    const consumed = selectedDay.entries
                      .filter((e) => e.meal === meal)
                      .reduce((s, e) => s + e.kcal, 0);

                    const labelMap: Record<typeof meal, string> = {
                      Breakfast: "Breakfast",
                      Lunch: "Lunch",
                      Snack: "Snack",
                      Dinner: "Dinner",
                    } as any;

                    return (
                      <div key={meal} className="flex justify-between text-sm">
                        <span>{labelMap[meal]}</span>
                        <span className="text-muted-foreground">
                          {consumed} / {meta} kcal
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {selectedDay.entries.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Foods:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {selectedDay.entries.map((entry, i) => (
                      <div key={i} className="text-sm flex justify-between">
                        <span className="text-muted-foreground">
                          {entry.name}
                        </span>
                        <span className="font-medium">{entry.kcal} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <BottomNav />
    </div>
  );
}

function calculateStreak(days: DayData[]): number {
  if (days.length === 0) return 0;

  const sortedDays = [...days].sort((a, b) => b.dayIso.localeCompare(a.dayIso));
  const today = new Date().toISOString().split("T")[0];

  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < 7; i++) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayData = sortedDays.find((d) => d.dayIso === dateStr);
    if (!dayData || dayData.aderencia < 70) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  return streak;
}
