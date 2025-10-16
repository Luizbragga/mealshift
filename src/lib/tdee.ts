// src/lib/tdee.ts
import type { Meal, MealSlot, Sex, Activity, Goal } from "@/data/db";

/** TDEE usando Mifflin-St Jeor + fatores de atividade e objetivo. */
export function calculateTDEE(params: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
}): number {
  const { sex, age, heightCm, weightKg, activity, goal } = params;

  // BMR (Mifflin-St Jeor)
  const base =
    10 * weightKg +
    6.25 * heightCm -
    5 * age +
    (sex === "M" ? 5 : sex === "F" ? -161 : -78);

  // Fator de atividade
  const activityFactor: Record<Activity, number> = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Intense: 1.725,
  };

  // Ajuste de objetivo
  const goalFactor: Record<Goal, number> = {
    Lose: 0.85,
    Maintain: 1.0,
    Gain: 1.1,
  };

  const tdee = base * activityFactor[activity] * goalFactor[goal];

  // Arredonda para inteiro
  return Math.max(0, Math.round(tdee));
}

/** Safeguard: make sure percents add to ~100% (within a tiny tolerance). */
function normalizePercents(slots: MealSlot[]): MealSlot[] {
  const total = slots.reduce((acc, s) => acc + s.percent, 0);
  if (total === 0) return slots;
  const needNormalize = Math.abs(total - 1) > 1e-6;
  if (!needNormalize) return slots;
  return slots.map((s) => ({ ...s, percent: s.percent / total }));
}

/** Round and then fix rounding drift so the final sum equals target. */
function roundWithRemainderFix(
  target: number,
  raw: Array<{ key: Meal; value: number }>
): Record<Meal, number> {
  const rounded: Record<Meal, number> = {
    Breakfast: 0,
    Lunch: 0,
    Snack: 0,
    Dinner: 0,
  };
  const withRemainders = raw.map(({ key, value }) => {
    const floor = Math.floor(value);
    const remainder = value - floor;
    (rounded as any)[key] = floor;
    return { key, remainder };
  });

  const current = Object.values(rounded).reduce((a, b) => a + b, 0);
  let missing = target - current;

  withRemainders
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ key }) => {
      if (missing > 0) {
        (rounded as any)[key] += 1;
        missing -= 1;
      }
    });

  return rounded;
}

export function distributeBySlots(
  targetKcal: number,
  inputSlots: MealSlot[]
): {
  total: number;
  byMeal: Record<Meal, number>;
  breakfastKcal: number;
  lunchKcal: number;
  snackKcal: number;
  dinnerKcal: number;
} {
  const slots = normalizePercents(inputSlots);

  // Raw proportions in kcals (float)
  const raw = slots.map((s) => ({
    key: s.key,
    value: targetKcal * s.percent,
  }));

  const byMeal = roundWithRemainderFix(targetKcal, raw);

  return {
    total: targetKcal,
    byMeal,
    breakfastKcal: byMeal.Breakfast,
    lunchKcal: byMeal.Lunch,
    snackKcal: byMeal.Snack,
    dinnerKcal: byMeal.Dinner,
  };
}
