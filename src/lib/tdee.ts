export type Sex = "M" | "F" | "Other";
export type Activity = "Sedentary" | "Light" | "Moderate" | "Intense";
export type Goal = "Lose" | "Maintain" | "Gain";

export interface TDEEParams {
  sex: Sex;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity: Activity;
  goal: Goal;
}

/** Mifflin–St Jeor Equation */
export function calculateTDEE(params: TDEEParams): number {
  const { sex, age, height_cm, weight_kg, activity, goal } = params;

  // BMR
  const bmr =
    sex === "M"
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;

  const activityMultipliers: Record<Activity, number> = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Intense: 1.725,
  };

  const goalAdjustments: Record<Goal, number> = {
    Lose: 0.85, // -15%
    Maintain: 1.0,
    Gain: 1.1, // +10%
  };

  const tdee = bmr * activityMultipliers[activity];
  const adjusted = tdee * goalAdjustments[goal];
  return Math.round(adjusted);
}

export interface MealDistribution {
  breakfastKcal: number;
  lunchKcal: number;
  snackKcal: number;
  dinnerKcal: number;
}

/** Keep DB fields (Portuguese) but allow any kcal target */
export function distributeMeals(
  target_kcal: number,
  percentages: {
    cafe: number;
    almoco: number;
    Snack: number;
    Dinner: number;
  } = {
    cafe: 0.2,
    almoco: 0.35,
    Snack: 0.15,
    Dinner: 0.3,
  }
): MealDistribution {
  return {
    breakfastKcal: Math.round(target_kcal * percentages.cafe),
    lunchKcal: Math.round(target_kcal * percentages.almoco),
    snackKcal: Math.round(target_kcal * percentages.Snack),
    dinnerKcal: Math.round(target_kcal * percentages.Dinner),
  };
}
